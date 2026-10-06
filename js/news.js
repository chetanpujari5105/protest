/* Awaaz — Latest reporting via GDELT DOC 2.0 (browser-side, manual fetch only)
   Articles are discovery leads. They are NEVER converted into map events here. */
window.News = (function () {
  const { esc, relTime, fmtDateTime } = U;
  const $ = (id) => document.getElementById(id);
  const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';
  // Terms used to judge whether a headline even mentions protest activity (discovery, not proof)
  const TERM_RE = /\b(protest\w*|demonstrat\w*|dharna|agitation|march(?:ed|es)?|rally|rallies|strike\w*|bandh|sit-in|gherao|hunger strike|picket\w*)\b|आंदोलन|धरना|धरणे|मोर्चा|प्रदर्शन|हड़ताल|हडताल|विरोध|निदर्शन|संप|उपोषण|अनशन/i;
  // Terms that commonly create false positives
  const NOISE_RE = /\b(cricket|ipl|box office|stock market|sensex|nifty|movie review|trailer|airstrike|march \d{1,2}|in march|since march)\b/i;
  let lastFetch = 0, results = [], busy = false;

  function buildQuery() {
    const lang = $('gdelt-lang').value;
    const terms = '(protest OR dharna OR demonstration OR agitation OR strike OR rally)';
    return `${terms} sourcecountry:IN sourcelang:${lang}`;
  }

  function parseSeen(s) {
    // GDELT seendate format: 20261004T153000Z
    const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s || '');
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString() : null;
  }

  function classify(a) {
    const title = a.title || '';
    const hasTerm = TERM_RE.test(title);
    const noisy = NOISE_RE.test(title);
    return { hasTerm, noisy, weak: !hasTerm || noisy };
  }

  function setState(kind, html) {
    const box = $('gdelt-state');
    if (!kind) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    box.className = 'state-box' + (kind === 'error' ? ' state-error' : kind === 'ok' ? ' state-ok' : '');
    box.innerHTML = html;
  }

  function render() {
    const hideWeak = $('gdelt-hide-weak').checked;
    const list = results.filter((a) => !hideWeak || !a._cls.weak);
    const ol = $('gdelt-list');
    if (!results.length) { ol.innerHTML = ''; return; }
    const hidden = results.length - list.length;
    if (!list.length) {
      ol.innerHTML = '';
      setState('info', `<p><strong>No headlines passed the protest-term check.</strong></p><p>${results.length} articles were retrieved but none mention a protest term in the headline. Untick the filter to inspect them.</p>`);
      return;
    }
    setState(null);
    ol.innerHTML = list.map((a) => `
      <li class="article-card">
        <h3><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.title || '(untitled)')}</a></h3>
        <p class="article-meta">
          <span><i class="fa-solid fa-globe" aria-hidden="true"></i> ${esc(a.domain || '')}</span>
          <span title="${esc(fmtDateTime(a._seen))}"><i class="fa-regular fa-clock" aria-hidden="true"></i> First seen by GDELT ${esc(relTime(a._seen))}</span>
          ${a.language ? `<span>${esc(a.language)}</span>` : ''}
        </p>
        <div class="article-tags">
          <span class="tag tag-off">Unverified lead</span>
          <span class="tag tag-off">Not mapped</span>
          ${a._cls.hasTerm ? '<span class="tag">Protest term in headline</span>' : '<span class="tag tag-warn">No protest term in headline</span>'}
          ${a._cls.noisy ? '<span class="tag tag-red">Likely unrelated</span>' : ''}
        </div>
      </li>`).join('');
    if (hidden) ol.insertAdjacentHTML('beforeend', `<li class="fine" style="grid-column:1/-1">${hidden} weaker match${hidden === 1 ? '' : 'es'} hidden by the headline check.</li>`);
  }

  // Fallback for browsers where GDELT's CORS headers are missing: GDELT DOC supports JSONP.
  function jsonp(url, timeoutMs) {
    return new Promise((resolve, reject) => {
      const cb = 'awaazGdelt' + Date.now();
      const s = document.createElement('script');
      const timer = setTimeout(() => { cleanup(); reject(new Error('JSONP timeout')); }, timeoutMs);
      function cleanup() { clearTimeout(timer); delete window[cb]; s.remove(); }
      window[cb] = (data) => { cleanup(); resolve(data); };
      s.onerror = () => { cleanup(); reject(new Error('JSONP request blocked or failed')); };
      s.src = url.replace('format=json', 'format=jsonp') + '&callback=' + cb;
      document.head.appendChild(s);
    });
  }

  async function getData(url, signal) {
    try {
      const res = await fetch(url, { signal });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      try { return JSON.parse(text); }
      catch (e) { throw new Error(text.trim().slice(0, 160) || 'Non-JSON response'); }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.info('[Awaaz] fetch failed (' + err.message + '), trying JSONP fallback');
      return await jsonp(url, 20000);
    }
  }

  async function fetchNews() {
    if (busy) return;
    const since = Date.now() - lastFetch;
    if (since < 6000) { U.toast(`GDELT asks for ≤1 request per 5 s — wait ${Math.ceil((6000 - since) / 1000)} s`); return; }
    busy = true; lastFetch = Date.now();
    const q = buildQuery();
    $('gdelt-query').textContent = q;
    const btn = $('gdelt-refresh');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Fetching…';
    setState(null);
    $('gdelt-list').innerHTML = Array.from({ length: 6 }, () => '<li class="skeleton" aria-hidden="true"></li>').join('');
    $('gdelt-meta').textContent = 'Requesting GDELT DOC API…';

    const params = new URLSearchParams({ query: q, mode: 'artlist', format: 'json', maxrecords: '75', sort: 'datedesc', timespan: $('gdelt-span').value });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const data = await getData(`${ENDPOINT}?${params}`, ctrl.signal);
      const arts = (data.articles || []).map((a) => Object.assign(a, { _seen: parseSeen(a.seendate), _cls: classify(a) }));
      // de-duplicate by title
      const seen = new Set();
      results = arts.filter((a) => { const k = (a.title || '').toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; });
      const strong = results.filter((a) => !a._cls.weak).length;
      console.info('[Awaaz] GDELT fetch ok:', results.length, 'articles,', strong, 'with protest term');
      $('gdelt-meta').innerHTML = `Fetched ${esc(fmtDateTime(new Date().toISOString()))} · ${results.length} articles retrieved · ${strong} with a protest term in the headline · <span style="font-weight:400">none verified, none mapped</span>`;
      if (!results.length) {
        $('gdelt-list').innerHTML = '';
        setState('info', '<p><strong>No articles returned for this query and window.</strong></p><p>Try a longer window or another language. An empty result is shown honestly — nothing is filled in.</p>');
      } else render();
    } catch (err) {
      $('gdelt-list').innerHTML = '';
      results = [];
      const aborted = err.name === 'AbortError';
      console.warn('[Awaaz] GDELT fetch failed:', err.message);
      $('gdelt-meta').textContent = 'Fetch failed — no reporting shown.';
      setState('error', `<p><strong>${aborted ? 'GDELT did not respond within 20 seconds.' : 'Could not load reporting from GDELT.'}</strong></p>
        <p>${esc(aborted ? 'The service may be busy.' : err.message)}</p>
        <p class="fine">GDELT is a free public service that often limits or blocks requests coming straight from browsers. This is exactly why the production design moves news fetching to a server-side job every 15 minutes. The demo map is unaffected.</p>
        <p style="margin-top:10px"><button type="button" class="btn btn-secondary" onclick="News.fetchNews()"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Try again</button></p>`);
    } finally {
      clearTimeout(timer);
      busy = false; btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-rotate" aria-hidden="true"></i> Fetch now';
    }
  }

  let autoFetched = false;
  function onShow() { if (!autoFetched) { autoFetched = true; fetchNews(); } }

  function init() {
    $('gdelt-query').textContent = buildQuery();
    $('gdelt-refresh').addEventListener('click', fetchNews);
    $('gdelt-hide-weak').addEventListener('change', render);
    $('gdelt-lang').addEventListener('change', () => { $('gdelt-query').textContent = buildQuery(); });
  }
  return { init, onShow, fetchNews };
})();
