/* Awaaz — Atlas: map, filters, synchronized cards, detail panel, evidence modal */
window.Atlas = (function () {
  const { esc, relTime, fmtDate, fmtDateTime, fmtTime, isStale, toast, store } = U;
  const STATUS = window.AWAAZ_STATUS, EVID = window.AWAAZ_EVIDENCE;
  const EVENTS = window.AWAAZ_EVENTS;
  const IS_DEMO = true; // all map records are fictional in this prototype

  let map, cluster, markers = {}, selectedId = null;
  const filters = { q: '', state: '', cause: '', status: new Set(), evidence: new Set(), from: '', to: '', followed: false, sort: 'eventStart' };
  let followed = new Set(store.get('followedCauses', []));

  const $ = (id) => document.getElementById(id);

  /* ---------- helpers ---------- */
  function statusBadge(s) {
    const st = STATUS[s];
    return `<span class="status-badge"><span class="mk ${st.cls}" aria-hidden="true"><b>${st.letter}</b></span>${esc(st.label)}</span>`;
  }
  function evidenceTag(e) {
    const ev = EVID[e];
    return `<span class="tag ${ev.cls}"><i class="${ev.icon}" aria-hidden="true"></i>${esc(ev.label)}</span>`;
  }
  function eventDateLabel(ev) {
    const start = fmtDate(ev.eventStart);
    const time = fmtTime(ev.eventStart);
    return ev.locationPrecision === 'venue' ? `${start}, ${time}` : start;
  }

  /** Directions are allowed only when every condition is met. Returns {ok, reason}. */
  function directionsPolicy(ev) {
    if (ev.locationPrecision !== 'venue' || !ev.publicVenue) return { ok: false, reason: 'Only the city is known. No public venue has been published, so precise directions are disabled.' };
    if (ev.evidence === 'submission' || !ev.reviewedAt) return { ok: false, reason: 'This venue comes from an unreviewed submission. Directions stay disabled until a reviewer checks it against a public source.' };
    if (ev.status === 'ended') return { ok: false, reason: 'Sources report this event has ended.' };
    if (ev.status === 'unknown') return { ok: false, reason: 'Current status is unknown, so we do not offer directions.' };
    if (ev.conflicts && ev.conflicts.length) return { ok: false, reason: 'Sources conflict on key details. Directions are disabled until the conflict is resolved.' };
    if (isStale(ev.sourcePublishedAt, 72)) return { ok: false, reason: 'The latest source is more than 3 days old — not current enough to route you there.' };
    return { ok: true };
  }

  /* ---------- filtering ---------- */
  function filtered() {
    const q = filters.q.trim().toLowerCase();
    let list = EVENTS.filter((ev) => {
      if (filters.state && ev.state !== filters.state) return false;
      if (filters.cause && ev.cause !== filters.cause) return false;
      if (filters.status.size && !filters.status.has(ev.status)) return false;
      if (filters.evidence.size && !filters.evidence.has(ev.evidence)) return false;
      if (filters.followed && !followed.has(ev.cause)) return false;
      const d = ev.eventStart.slice(0, 10);
      if (filters.from && d < filters.from) return false;
      if (filters.to && d > filters.to) return false;
      if (q) {
        const hay = [ev.title, ev.cause, ev.city, ev.state, ev.summary, (ev.demands || []).join(' '), ev.publicVenue || ''].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const s = filters.sort;
    list.sort((a, b) => {
      if (s === 'state') return a.state.localeCompare(b.state) || a.city.localeCompare(b.city);
      if (s === 'lastFetchedAt') return new Date(b.lastFetchedAt) - new Date(a.lastFetchedAt);
      return new Date(b.eventStart) - new Date(a.eventStart);
    });
    return list;
  }

  function activeFilterCount() {
    return (filters.q ? 1 : 0) + (filters.state ? 1 : 0) + (filters.cause ? 1 : 0) + filters.status.size + filters.evidence.size + (filters.from ? 1 : 0) + (filters.to ? 1 : 0) + (filters.followed ? 1 : 0);
  }

  /* ---------- map ---------- */
  function initMap() {
    map = L.map('map', { zoomControl: true, minZoom: 4, maxBounds: [[2, 60], [40, 102]], maxBoundsViscosity: 0.8 }).setView([22.5, 80], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18
    }).addTo(map);
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false, maxClusterRadius: 45,
      iconCreateFunction: (c) => L.divIcon({ html: `<div aria-label="${c.getChildCount()} events">${c.getChildCount()}</div>`, className: 'marker-cluster-custom', iconSize: [40, 40] })
    });
    map.addLayer(cluster);
    // Prevent ResizeObserver-less layouts from leaving grey tiles
    setTimeout(() => map.invalidateSize(), 200);
  }

  function makeIcon(ev, hl) {
    const st = STATUS[ev.status];
    const city = ev.locationPrecision === 'city' ? ' city' : '';
    return L.divIcon({
      className: 'awaaz-marker',
      html: `<div class="pin${city}${hl ? ' is-hl' : ''}"><span class="mk ${st.cls}"><b>${st.letter}</b></span></div>`,
      iconSize: [34, 34], iconAnchor: [17, 17]
    });
  }

  function renderMarkers(list) {
    cluster.clearLayers(); markers = {};
    list.forEach((ev) => {
      const m = L.marker(ev.coordinates, { icon: makeIcon(ev, ev.id === selectedId), keyboard: true, title: `${ev.title} — ${STATUS[ev.status].label}` });
      m.bindTooltip(`<strong>${esc(ev.city)}</strong> · ${esc(STATUS[ev.status].label)}${ev.locationPrecision === 'city' ? ' · city-level' : ''}<br>${esc(ev.title)}`, { className: 'awaaz-tip', direction: 'top', offset: [0, -14] });
      m.on('click', () => select(ev.id, { fromMap: true }));
      m.on('mouseover', () => hoverCard(ev.id, true));
      m.on('mouseout', () => hoverCard(ev.id, false));
      markers[ev.id] = m;
      cluster.addLayer(m);
    });
    $('map-empty').hidden = list.length > 0;
  }

  function highlightMarker(id, on) {
    const m = markers[id]; if (!m) return;
    const ev = EVENTS.find((e) => e.id === id);
    m.setIcon(makeIcon(ev, on || id === selectedId));
    m.setZIndexOffset(on ? 1000 : 0);
  }

  /* ---------- cards ---------- */
  function renderCards(list) {
    const ol = $('event-list');
    $('results-count').textContent = list.length === 0 ? 'No sourced events found' : `${list.length} demo event${list.length === 1 ? '' : 's'}`;
    if (!list.length) {
      ol.innerHTML = `<li class="state-box"><p><strong>No sourced events found for these filters.</strong></p><p class="fine">We never manufacture events to fill the map. Try widening the filters.</p></li>`;
      return;
    }
    ol.innerHTML = list.map((ev) => {
      const stale = isStale(ev.lastFetchedAt, 24);
      return `
      <li class="event-card${ev.id === selectedId ? ' is-selected' : ''}" data-id="${ev.id}" tabindex="0" role="button" aria-label="${esc(ev.title)}, ${esc(ev.city)}. ${esc(STATUS[ev.status].label)}. Open details">
        <div class="card-top">
          <span class="card-cause">${esc(ev.cause)}</span>
          <span><span class="tag tag-demo">Demo</span>
          <button class="follow-btn${followed.has(ev.cause) ? ' is-on' : ''}" data-follow="${esc(ev.cause)}" aria-pressed="${followed.has(ev.cause)}" aria-label="${followed.has(ev.cause) ? 'Unfollow' : 'Follow'} cause ${esc(ev.cause)}" title="Follow this cause (saved on this device)"><i class="fa-${followed.has(ev.cause) ? 'solid' : 'regular'} fa-star" aria-hidden="true"></i></button></span>
        </div>
        <h3>${esc(ev.title)}</h3>
        <p class="card-meta">
          <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(ev.city)}, ${esc(ev.state)}${ev.locationPrecision === 'city' ? ' <em>(city-level)</em>' : ''}</span>
          <span><i class="fa-regular fa-calendar" aria-hidden="true"></i>Event: ${esc(eventDateLabel(ev))}</span>
        </p>
        <div class="card-top" style="margin-bottom:8px">${statusBadge(ev.status)} ${evidenceTag(ev.evidence)}</div>
        <div class="card-foot">
          <span title="${esc(fmtDateTime(ev.sourcePublishedAt))}">Latest source: ${esc(relTime(ev.sourcePublishedAt))}</span>
          <span title="When the system last re-checked sources. Not a confirmation the event is active.">${stale ? '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ' : ''}Checked ${esc(relTime(ev.lastFetchedAt))}</span>
        </div>
        ${ev.conflicts.length ? '<p class="fine" style="color:var(--red-ink);margin:6px 0 0"><i class="fa-solid fa-code-compare" aria-hidden="true"></i> Sources conflict</p>' : ''}
      </li>`;
    }).join('');
  }

  function hoverCard(id, on) {
    const el = document.querySelector(`.event-card[data-id="${id}"]`);
    if (el) el.classList.toggle('is-hover', on);
  }

  /* ---------- detail ---------- */
  function renderDetail(ev) {
    const dir = directionsPolicy(ev);
    const st = STATUS[ev.status];
    const stale = isStale(ev.lastFetchedAt, 24);
    const venueQuery = encodeURIComponent(`${ev.publicVenue}, ${ev.city}, ${ev.state}, India`);
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${venueQuery}`;

    $('detail-body').innerHTML = `
      <p class="eyebrow">${esc(ev.cause)} · ${esc(ev.state)}</p>
      <h2 id="detail-title">${esc(ev.title)}</h2>
      <p><span class="tag tag-demo">Fictional demo record</span></p>

      <div class="know-grid" aria-label="What do we actually know?">
        <div><p class="k">Event status</p><p class="v">${statusBadge(ev.status)}</p><p class="s">${esc(st.desc)}</p></div>
        <div><p class="k">Evidence</p><p class="v">${esc(EVID[ev.evidence].label)}</p><p class="s">${ev.sources.length} source${ev.sources.length === 1 ? '' : 's'}${ev.reviewedAt ? ' · reviewed ' + esc(relTime(ev.reviewedAt)) : ' · <strong>not reviewed</strong>'}</p></div>
        <div><p class="k">Freshness</p><p class="v">Source ${esc(relTime(ev.sourcePublishedAt))}</p><p class="s">System checked ${esc(relTime(ev.lastFetchedAt))}${stale ? ' — <strong>stale</strong>' : ''}. Checking ≠ confirming the event is active.</p></div>
      </div>

      ${ev.conflicts.length ? `<div class="conflict-box" role="alert"><strong><i class="fa-solid fa-code-compare" aria-hidden="true"></i> Conflicting sources — not resolved</strong>${ev.conflicts.map((c) => `<p><b>${esc(c.field)}:</b> ${c.claims.map(esc).join(' <em>vs</em> ')}</p>`).join('')}</div>` : ''}

      <div class="btn-row"><button class="btn btn-why" id="why-btn"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Why is this on the map?</button></div>

      <section class="detail-section"><h3>Neutral summary</h3><p style="margin:0">${esc(ev.summary)}</p></section>

      <section class="detail-section"><h3>Reported demands</h3>
        <ul class="demands">${ev.demands.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
        <p class="fine">As described by sources. Listing does not imply endorsement.</p>
      </section>

      <section class="detail-section"><h3>Public gathering details</h3>
        <div class="gathering-box">
          <p><i class="fa-regular fa-calendar" aria-hidden="true"></i> <strong>Event date:</strong> ${esc(fmtDateTime(ev.eventStart))}${ev.eventEnd ? ' – ' + esc(fmtTime(ev.eventEnd)) : ' (end not stated)'}</p>
          <p><i class="fa-solid fa-location-dot" aria-hidden="true"></i> <strong>${ev.locationPrecision === 'venue' ? 'Published public venue' : 'Location'}:</strong> ${ev.publicVenue ? esc(ev.publicVenue) + ', ' : ''}${esc(ev.city)} ${ev.locationPrecision === 'city' ? '<span class="tag tag-off">City-level only</span>' : ''}</p>
          ${dir.ok
            ? `<a class="btn btn-primary" href="${dirUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> Directions to public venue</a>
               <p class="fine">Demo record: the venue is a real public place but this event is fictional.</p>`
            : `<button class="btn btn-secondary" disabled aria-disabled="true"><i class="fa-solid fa-ban" aria-hidden="true"></i> Directions unavailable</button>
               <p class="fine" style="margin-top:6px">${esc(dir.reason)}</p>`}
          <p class="gathering-warning"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Always verify the latest organizer announcement before travelling. Plans change; Awaaz does not track crowds or confirm attendance.</p>
        </div>
      </section>

      <section class="detail-section"><h3>Timeline</h3>
        <ol class="timeline">${ev.timeline.map((x) => `<li><time datetime="${esc(x.at)}">${esc(fmtDate(x.at))}</time>${esc(x.text)}</li>`).join('')}</ol>
      </section>

      <section class="detail-section"><h3>Original reporting & announcements</h3>
        <ul class="source-list">${ev.sources.map((s) => `
          <li class="source-item">
            <a class="src-title" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px" aria-hidden="true"></i></a>
            <span class="src-meta"><span>${esc(s.outlet)}</span>${evidenceTag(s.type)}<span>Published ${esc(fmtDateTime(s.publishedAt))}</span></span>
          </li>`).join('')}</ul>
        <p class="fine">Demo links go to example.org. In production, Awaaz links out and shows summaries — never full copied articles.</p>
      </section>

      <section class="detail-section"><h3>Spot a problem?</h3>
        <div class="btn-row" style="margin-top:0">
          <button class="btn btn-secondary" data-correct="${ev.id}"><i class="fa-regular fa-pen-to-square" aria-hidden="true"></i> Suggest a correction</button>
          <button class="btn btn-secondary" data-slogan="${esc(ev.cause)}"><i class="fa-solid fa-bullhorn" aria-hidden="true"></i> Make a peaceful slogan</button>
        </div>
      </section>
    `;
    $('why-btn').addEventListener('click', () => openEvidence(ev));
  }

  function openEvidence(ev) {
    const ex = ev.supportingExcerpts;
    const srcLine = (i) => { const s = ev.sources[i]; return s ? `<p class="excerpt-src">— <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.outlet)}</a>, ${esc(fmtDateTime(s.publishedAt))} (${esc(EVID[s.type].label)})</p>` : ''; };
    $('evidence-body').innerHTML = `
      <p class="eyebrow">Why is this on the map?</p>
      <h2 id="evidence-title">${esc(ev.title)}</h2>
      <p class="fine"><span class="tag tag-demo">Fictional</span> Excerpts below are invented to demonstrate the evidence view.</p>
      <p class="excerpt-label">Location excerpt → marker placed at ${ev.locationPrecision === 'venue' ? 'published venue' : 'city centre (coarse)'}</p>
      <blockquote class="excerpt">${esc(ex.location.text)}</blockquote>${srcLine(ex.location.sourceIndex)}
      <p class="excerpt-label">Date excerpt → event date ${esc(fmtDate(ev.eventStart))}</p>
      <blockquote class="excerpt">${esc(ex.date.text)}</blockquote>${srcLine(ex.date.sourceIndex)}
      ${ev.conflicts.length ? `<div class="conflict-box"><strong>Conflicts flagged</strong>${ev.conflicts.map((c) => `<p><b>${esc(c.field)}:</b> ${c.claims.map(esc).join(' <em>vs</em> ')}</p>`).join('')}</div>` : '<p class="excerpt-label">Conflicts</p><p style="margin:0">None found among listed sources.</p>'}
      <p class="excerpt-label">What this does <em>not</em> tell you</p>
      <p style="margin:0;font-size:14px">The event date (${esc(fmtDate(ev.eventStart))}) is separate from when articles were published. Coordinates were never inferred from publisher location or article geotags. No crowd sizes are shown because none are verified.</p>
    `;
    const modal = $('evidence-modal');
    modal.hidden = false;
    modal.querySelector('.modal-close').focus();
  }

  function select(id, opts = {}) {
    const prev = selectedId;
    selectedId = id;
    if (prev && markers[prev]) highlightMarker(prev, false);
    document.querySelectorAll('.event-card.is-selected').forEach((c) => c.classList.remove('is-selected'));
    const ev = EVENTS.find((e) => e.id === id);
    if (!ev) return;
    const card = document.querySelector(`.event-card[data-id="${id}"]`);
    if (card) { card.classList.add('is-selected'); if (opts.fromMap) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    renderDetail(ev);
    const panel = $('detail-panel');
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    panel.scrollTop = 0;
    // zoom map to marker (on mobile list view, switch to map so the sheet sits over the map)
    const m = markers[id];
    if (m) {
      cluster.zoomToShowLayer(m, () => { highlightMarker(id, true); });
      if (!opts.fromMap) map.flyTo(ev.coordinates, Math.max(map.getZoom(), ev.locationPrecision === 'venue' ? 12 : 10), { duration: 0.8 });
    }
    if (!opts.silent) panel.focus({ preventScroll: true });
    history.replaceState(null, '', '#event=' + id);
  }

  function closeDetail() {
    const panel = $('detail-panel');
    panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true');
    if (selectedId) { const id = selectedId; selectedId = null; highlightMarker(id, false); }
    document.querySelectorAll('.event-card.is-selected').forEach((c) => c.classList.remove('is-selected'));
    history.replaceState(null, '', location.pathname);
  }

  /* ---------- render all ---------- */
  function render() {
    const list = filtered();
    renderCards(list);
    renderMarkers(list);
    const n = activeFilterCount();
    const badge = $('filter-count-badge');
    badge.hidden = n === 0; badge.textContent = n;
    if (selectedId && !list.find((e) => e.id === selectedId)) closeDetail();
    if (list.length && list.length < EVENTS.length) {
      const b = L.latLngBounds(list.map((e) => e.coordinates));
      map.flyToBounds(b.pad(0.3), { maxZoom: 9, duration: 0.6 });
    }
  }

  function toggleFollow(cause) {
    if (followed.has(cause)) { followed.delete(cause); toast(`Unfollowed “${cause}”`); }
    else { followed.add(cause); toast(`Following “${cause}” — saved on this device only`); }
    store.set('followedCauses', [...followed]);
    render();
  }

  /* ---------- setup ---------- */
  function buildFilters() {
    const states = [...new Set(EVENTS.map((e) => e.state))].sort();
    const causes = [...new Set(EVENTS.map((e) => e.cause))].sort();
    $('filter-state').insertAdjacentHTML('beforeend', states.map((s) => `<option>${esc(s)}</option>`).join(''));
    $('filter-cause').insertAdjacentHTML('beforeend', causes.map((s) => `<option>${esc(s)}</option>`).join(''));
    $('filter-status').innerHTML = Object.entries(STATUS).map(([k, v]) => `<label class="chip"><input type="checkbox" value="${k}"> <span class="mk ${v.cls}" style="transform:scale(.7);margin:-4px" aria-hidden="true"><b>${v.letter}</b></span> ${esc(v.label)}</label>`).join('');
    $('filter-evidence').innerHTML = Object.entries(EVID).map(([k, v]) => `<label class="chip"><input type="checkbox" value="${k}"> ${esc(v.label)}</label>`).join('');

    let tmr;
    $('filter-search').addEventListener('input', (e) => { clearTimeout(tmr); tmr = setTimeout(() => { filters.q = e.target.value; render(); }, 180); });
    $('filter-state').addEventListener('change', (e) => { filters.state = e.target.value; render(); });
    $('filter-cause').addEventListener('change', (e) => { filters.cause = e.target.value; render(); });
    $('filter-from').addEventListener('change', (e) => { filters.from = e.target.value; render(); });
    $('filter-to').addEventListener('change', (e) => { filters.to = e.target.value; render(); });
    $('filter-followed').addEventListener('change', (e) => { filters.followed = e.target.checked; render(); });
    $('sort-select').addEventListener('change', (e) => { filters.sort = e.target.value; render(); });
    $('filter-status').addEventListener('change', (e) => { e.target.checked ? filters.status.add(e.target.value) : filters.status.delete(e.target.value); render(); });
    $('filter-evidence').addEventListener('change', (e) => { e.target.checked ? filters.evidence.add(e.target.value) : filters.evidence.delete(e.target.value); render(); });
    $('filter-reset').addEventListener('click', () => {
      $('filter-panel').reset();
      Object.assign(filters, { q: '', state: '', cause: '', from: '', to: '', followed: false });
      filters.status.clear(); filters.evidence.clear();
      render(); map.flyTo([22.5, 80], 5, { duration: 0.6 });
    });
  }

  function bindEvents() {
    const list = $('event-list');
    list.addEventListener('click', (e) => {
      const f = e.target.closest('[data-follow]');
      if (f) { e.stopPropagation(); toggleFollow(f.dataset.follow); return; }
      const card = e.target.closest('.event-card');
      if (card) { select(card.dataset.id); if (window.innerWidth <= 760) setMobile('map'); }
    });
    list.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('event-card')) { e.preventDefault(); select(e.target.dataset.id); }
    });
    list.addEventListener('mouseover', (e) => { const c = e.target.closest('.event-card'); if (c) highlightMarker(c.dataset.id, true); });
    list.addEventListener('mouseout', (e) => { const c = e.target.closest('.event-card'); if (c && !c.contains(e.relatedTarget)) highlightMarker(c.dataset.id, false); });

    $('detail-close').addEventListener('click', closeDetail);
    $('detail-body').addEventListener('click', (e) => {
      const c = e.target.closest('[data-correct]');
      if (c) { window.Submit && Submit.prefill(c.dataset.correct); window.App.go('submit'); }
      const s = e.target.closest('[data-slogan]');
      if (s) { window.Studio && Studio.prefill(s.dataset.slogan); window.App.go('studio'); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('evidence-modal').hidden) { $('evidence-modal').hidden = true; $('why-btn') && $('why-btn').focus(); }
      else if ($('detail-panel').classList.contains('is-open')) closeDetail();
    });
    $('evidence-modal').addEventListener('click', (e) => {
      if (e.target.id === 'evidence-modal' || e.target.closest('[data-close-modal]')) $('evidence-modal').hidden = true;
    });

    // mobile toggles
    $('toggle-map').addEventListener('click', () => setMobile('map'));
    $('toggle-list').addEventListener('click', () => setMobile('list'));
    $('toggle-filters').addEventListener('click', () => {
      const layout = $('atlas-layout');
      const open = !layout.classList.contains('filters-open');
      layout.classList.toggle('filters-open', open);
      $('toggle-filters').setAttribute('aria-expanded', open);
      if (!open) setTimeout(() => map.invalidateSize(), 50);
    });
  }

  function setMobile(mode) {
    const layout = $('atlas-layout');
    layout.dataset.mobile = mode;
    layout.classList.remove('filters-open');
    $('toggle-filters').setAttribute('aria-expanded', 'false');
    $('toggle-map').classList.toggle('is-active', mode === 'map'); $('toggle-map').setAttribute('aria-pressed', mode === 'map');
    $('toggle-list').classList.toggle('is-active', mode === 'list'); $('toggle-list').setAttribute('aria-pressed', mode === 'list');
    if (mode === 'map') setTimeout(() => map.invalidateSize(), 50);
  }

  function init() {
    initMap();
    buildFilters();
    bindEvents();
    render();
    const m = location.hash.match(/event=([\w-]+)/);
    if (m) setTimeout(() => select(m[1], { silent: true }), 400);
    // keep relative timestamps honest without pretending to fetch anything
    setInterval(() => { const l = filtered(); renderCards(l); }, 60000);
  }

  return { init, invalidate: () => map && map.invalidateSize(), events: EVENTS, directionsPolicy };
})();
