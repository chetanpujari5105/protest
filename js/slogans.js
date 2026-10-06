/* Awaaz — Slogan studio (template-based, NOT AI). Peaceful phrasing only. */
window.Studio = (function () {
  const { esc, copy, toast } = U;
  const $ = (id) => document.getElementById(id);

  // Cause vocabulary: en, hi, mr (Devanagari), hg (Hinglish roman), tag
  const CAUSES = {
    air:      { label: 'Clean air', en: 'clean air', hi: 'साफ़ हवा', mr: 'स्वच्छ हवा', hg: 'saaf hawa', tag: 'CleanAir', match: ['Environment'] },
    roads:    { label: 'Safe roads', en: 'safe roads', hi: 'सुरक्षित सड़कें', mr: 'सुरक्षित रस्ते', hg: 'safe sadkein', tag: 'SafeRoads', match: ['Infrastructure', 'Public safety'] },
    transit:  { label: 'Better public transport', en: 'better buses and trains', hi: 'बेहतर बस और ट्रेन', mr: 'चांगल्या बस आणि ट्रेन', hg: 'better bus aur train', tag: 'PublicTransport', match: ['Public transport'] },
    fees:     { label: 'Fair education fees', en: 'fair fees', hi: 'उचित फ़ीस', mr: 'योग्य फी', hg: 'fair fees', tag: 'FairFees', match: ['Education'] },
    water:    { label: 'Clean water', en: 'clean water', hi: 'साफ़ पानी', mr: 'स्वच्छ पाणी', hg: 'saaf paani', tag: 'CleanWater', match: [] },
    wages:    { label: 'Fair wages', en: 'fair wages', hi: 'उचित मज़दूरी', mr: 'योग्य मजुरी', hg: 'fair wages', tag: 'FairWages', match: ['Labour rights', 'Livelihoods', 'Agriculture'] },
    health:   { label: 'Better healthcare', en: 'better healthcare', hi: 'बेहतर इलाज', mr: 'चांगले आरोग्य', hg: 'better ilaaj', tag: 'HealthForAll', match: ['Health'] },
    transparency: { label: 'Transparency', en: 'transparency', hi: 'पारदर्शिता', mr: 'पारदर्शकता', hg: 'transparency', tag: 'Transparency', match: [] },
    custom:   { label: 'Something else (type your own)…' }
  };

  const LANGS = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', hg: 'Hinglish', mre: 'Marathi-English' };
  const TONES = { witty: 'Witty', hopeful: 'Hopeful', poetic: 'Poetic', direct: 'Direct' };
  const FORMATS = { placard: 'Placard', chant: 'Chant', caption: 'Short caption' };

  // {c} = cause in the chosen language; {C} = capitalised (Latin scripts only)
  const BANK = {
    en: {
      witty: ['Less excuses. More {c}.', 'We ordered {c}. Still awaiting delivery.', '{C}: not a luxury, just the basics.', 'Plot twist: we actually want {c}.', 'Promises in HD, {c} still buffering.', 'Our patience is renewable. {C} should be too.'],
      hopeful: ['Together for {c}.', '{C} today, a kinder city tomorrow.', 'Small voices, big hope: {c} for all.', 'We believe in {c} — and in each other.', 'Build it right. Build {c}.'],
      poetic: ['Every footstep a verse; every verse asks for {c}.', 'Not a storm, a steady rain — asking for {c}.', 'Light a lamp, not a fire: {c} for all.', 'Where many voices meet, {c} can grow.'],
      direct: ['We ask for {c}. Now.', '{C} is our right.', 'Listen. Act. Deliver {c}.', '{C} — no more delays.', 'Publish the plan for {c}.']
    },
    hi: {
      witty: ['बहाने कम, {c} ज़्यादा!', 'वादों की लिस्ट लंबी, {c} की बारी कब?', '{c} कोई सपना नहीं, बुनियादी ज़रूरत है।', 'वादे फुल HD, {c} अभी भी लोडिंग…'],
      hopeful: ['मिलकर माँगें {c}, मिलकर बनाएँ कल।', '{c} के लिए एक आवाज़, एक उम्मीद।', 'उम्मीद हमारी, {c} सबकी।', 'हाथ से हाथ मिलाएँ, {c} सब तक पहुँचाएँ।'],
      poetic: ['दीया जलाएँ, आग नहीं — {c} माँगें, नफ़रत नहीं।', 'क़दम-क़दम पर एक ही गीत — {c} हो सबकी जीत।', 'हर सवाल में एक दुआ — {c} का हक़ मिले सदा।'],
      direct: ['{c} — हमारा अधिकार!', '{c} दो, अभी दो!', 'सवाल पूछना हमारा अधिकार, जवाब देना आपकी ज़िम्मेदारी।', '{c} की योजना सार्वजनिक करो।']
    },
    mr: {
      witty: ['कारणं कमी, {c} जास्त!', 'आश्वासनांची यादी लांब, {c} कधी?', '{c} म्हणजे चैन नाही, गरज आहे.'],
      hopeful: ['एकत्र येऊ, {c} मिळवू.', '{c} — एक आवाज, एक आशा.', 'आजचा आवाज, उद्याची आशा — {c} सर्वांसाठी.'],
      poetic: ['दिवा लावू, आग नाही — {c} मागू, द्वेष नाही.', 'प्रत्येक पावलात एकच गाणं — {c} सर्वांचं देणं.', '{c} हाच आमचा ध्यास, शांततेचा प्रवास.'],
      direct: ['{c} — आमचा हक्क!', '{c} द्या, आत्ताच द्या!', 'प्रश्न विचारणे आमचा हक्क, उत्तर देणे तुमची जबाबदारी.', '{c} ची योजना जाहीर करा.']
    },
    hg: {
      witty: ['Excuses kam, {c} zyada!', 'Promises full HD, {c} abhi bhi buffering!', '{C} koi luxury nahi, basic need hai!', 'Selfie baad mein, pehle {c}!'],
      hopeful: ['Saath mein bolenge, {c} paayenge.', 'Ek awaaz, ek umeed — {c} sabke liye.', 'Aaj ki awaaz, kal ka better India — {c}!'],
      poetic: ['Kadam kadam pe ek hi geet — {c} ho sabki jeet.', 'Diya jalao, aag nahi — {c} maango, nafrat nahi.'],
      direct: ['{C} hamara haq hai!', '{C} do, abhi do!', 'Sawaal poochna hamara haq, jawaab dena aapki zimmedari.', '{C} ka plan — public karo!']
    },
    mre: {
      witty: ['Excuses कमी, {c} जास्त!', 'Promises full HD, {c} अजून loading…', '{c} — luxury नाही, basic need आहे!'],
      hopeful: ['Together येऊ, {c} मिळवू!', 'One आवाज, one आशा — {c} for all.', 'आजचा आवाज, better उद्या — {c}!'],
      poetic: ['दिवा लावू, not आग — {c} मागू peacefully.', 'प्रत्येक पाऊल, one song — {c} for everyone.'],
      direct: ['{c} is आमचा हक्क!', '{c} द्या — now!', '{c} चा plan — जाहीर करा!']
    }
  };

  // Hand-written specials (illustrative, not tied to any real current protest)
  const SPECIALS = {
    roads: { hg: { witty: ['Road pe pothole, promises full HD!'] }, en: { witty: ['Fix the potholes, not the press release.'] } },
    fees: { hg: { witty: ['Fees ka load, future ka road — students ko do fair mode!'] } },
    air: { mre: { hopeful: ['स्वच्छ हवा, healthy उद्या!'] }, en: { direct: ['Less pollution. More solutions.'], witty: ['Breathe in. Breathe out. Breathe… wait, can we?'] } },
    transparency: { hi: { direct: ['सवाल पूछना हमारा अधिकार, जवाब देना आपकी ज़िम्मेदारी।'] } },
    water: { hg: { witty: ['Paani ka bill full, tanker ka signal null!'] } }
  };

  const CAPTION_TAIL = { en: 'Peacefully, together.', hi: 'शांति से, साथ मिलकर।', mr: 'शांततेने, एकत्र.', hg: 'Shaanti se, saath mein.', mre: 'शांततेने, together.' };
  const CHANT_LBL = { en: ['Leader', 'All'], hi: ['एक', 'सब'], mr: ['एक', 'सर्व'], hg: ['Ek', 'Sab'], mre: ['Leader', 'सर्व'] };

  // Very simple guardrail for custom text
  const BLOCK = /\b(kill|murder|die|death|burn|attack|bomb|shoot|hang|lynch|beat|traitor|terrorist|maar|maaro|jala|khatam|gaddar)\b|मार|मारो|जला|ख़त्म|खत्म|गद्दार|फांसी|फाँसी|जाळ|ठार|देशद्रोही/i;
  const PII = /(\+?\d[\d\s-]{7,}\d)|(@\w{2,})|(\b\S+@\S+\.\S+\b)|https?:\/\//i;

  const state = { cause: 'air', lang: 'hg', tone: 'witty', format: 'placard', custom: '', options: [], picked: 0, theme: 0 };

  const THEMES = [
    { name: 'Ivory', bg: '#F7F4ED', fg: '#202421', accent: '#E78945', band: '#165B48' },
    { name: 'Green', bg: '#165B48', fg: '#F7F4ED', accent: '#E78945', band: '#0F4637' },
    { name: 'Charcoal', bg: '#202421', fg: '#F7F4ED', accent: '#E78945', band: '#165B48' },
    { name: 'Orange', bg: '#E78945', fg: '#202421', accent: '#F7F4ED', band: '#202421' }
  ];

  function causeWord(lang) {
    if (state.cause === 'custom') return state.custom.trim();
    const c = CAUSES[state.cause];
    return lang === 'mre' ? c.mr : c[lang];
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function applyFormat(line, lang) {
    if (state.format === 'caption') {
      const tag = state.cause === 'custom' ? '' : ' #' + CAUSES[state.cause].tag;
      return `${line} ${CAPTION_TAIL[lang]} #Awaaz${tag}`;
    }
    if (state.format === 'chant') {
      const [a, b] = CHANT_LBL[lang];
      const parts = line.split(/\s[—–]\s|,\s|;\s/);
      if (parts.length >= 2) return `${a}: ${parts[0].trim()}\n${b}: ${parts.slice(1).join(', ').trim()}`;
      return `${a}: ${line}\n${b}: ${line}`;
    }
    return line;
  }

  function generate() {
    const warn = $('studio-warning');
    warn.hidden = true;
    if (state.cause === 'custom') {
      const t = state.custom.trim();
      if (!t) { warn.hidden = false; warn.textContent = 'Type a short cause first (e.g. “safer footpaths”).'; return; }
      if (BLOCK.test(t)) { warn.hidden = false; warn.textContent = 'That wording may suggest harm or hostility. Awaaz only generates peaceful slogans — try describing the issue you want fixed.'; return; }
      if (PII.test(t)) { warn.hidden = false; warn.textContent = 'Please remove phone numbers, handles, emails or links. Keep slogans about issues, not individuals.'; return; }
    }
    const L = state.lang, c = causeWord(L);
    let pool = (BANK[L][state.tone] || []).slice();
    const sp = state.cause !== 'custom' && SPECIALS[state.cause] && SPECIALS[state.cause][L] && SPECIALS[state.cause][L][state.tone];
    const specials = sp ? sp.slice() : [];
    // top up from other tones in same language if needed
    if (pool.length + specials.length < 6) {
      Object.keys(BANK[L]).filter((t) => t !== state.tone).forEach((t) => { pool = pool.concat(BANK[L][t]); });
    }
    const chosen = specials.concat(shuffle(pool.filter((p) => !specials.includes(p)))).slice(0, 6);
    state.options = chosen.map((tpl) => applyFormat(tpl.replace(/\{C\}/g, /^[a-z]/i.test(c) ? cap(c) : c).replace(/\{c\}/g, c), L));
    state.picked = 0;
    renderOptions();
    drawPoster();
  }

  function renderOptions() {
    const ol = $('slogan-list');
    if (!state.options.length) {
      ol.innerHTML = '<li class="state-box" style="grid-column:1/-1"><p><strong>No slogans yet.</strong> Choose your options and press “Generate six options”.</p></li>';
      return;
    }
    ol.innerHTML = state.options.map((s, i) => `
      <li class="slogan-item${i === state.picked ? ' is-picked' : ''}" data-i="${i}">
        <p class="slogan-text" contenteditable="true" spellcheck="false" role="textbox" aria-multiline="true" aria-label="Slogan option ${i + 1}, editable" lang="${state.lang === 'en' || state.lang === 'hg' ? 'en' : state.lang === 'hi' ? 'hi' : 'mr'}">${esc(s)}</p>
        <div class="slogan-actions">
          <button data-act="copy"><i class="fa-regular fa-copy" aria-hidden="true"></i> Copy</button>
          <button data-act="poster"><i class="fa-regular fa-image" aria-hidden="true"></i> Poster</button>
          <span class="lbl">Template sample</span>
        </div>
      </li>`).join('');
  }

  /* ---------- poster ---------- */
  function wrap(ctx, text, maxW) {
    const out = [];
    text.split('\n').forEach((para) => {
      const words = para.split(/\s+/); let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
      });
      if (line) out.push(line);
    });
    return out;
  }

  function drawPoster() {
    const cv = $('poster-canvas'), ctx = cv.getContext('2d');
    const th = THEMES[state.theme];
    const W = cv.width, H = cv.height;
    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
    // top band + accent
    ctx.fillStyle = th.band; ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = th.accent; ctx.fillRect(90, 140, 120, 12);
    // cause eyebrow
    const causeLabel = state.cause === 'custom' ? (state.custom.trim() || 'Your cause') : CAUSES[state.cause].label;
    ctx.fillStyle = th.fg; ctx.globalAlpha = .75;
    ctx.font = '600 34px Inter, "Noto Sans Devanagari", sans-serif';
    ctx.fillText(causeLabel.toUpperCase(), 90, 210);
    ctx.globalAlpha = 1;

    const text = (state.options[state.picked] || 'Generate a slogan to preview it here.').replace(/^(Leader|All|एक|सब|सर्व|Ek|Sab):\s*/gm, '');
    let size = 104, lines;
    do {
      ctx.font = `700 ${size}px Fraunces, "Noto Serif Devanagari", Georgia, serif`;
      lines = wrap(ctx, text, W - 180);
      size -= 6;
    } while ((lines.length * size * 1.25 > 760 || lines.some((l) => ctx.measureText(l).width > W - 180)) && size > 40);
    size += 6;
    const lh = size * 1.28;
    let y = 300 + (760 - lines.length * lh) / 2 + size;
    ctx.fillStyle = th.fg;
    lines.forEach((l) => { ctx.fillText(l, 90, y); y += lh; });

    // footer
    ctx.fillStyle = th.fg; ctx.globalAlpha = .25; ctx.fillRect(90, H - 170, W - 180, 2); ctx.globalAlpha = 1;
    ctx.font = '700 38px Fraunces, Georgia, serif'; ctx.fillStyle = th.fg;
    ctx.fillText('Awaaz', 90, H - 100);
    ctx.font = '500 26px Inter, sans-serif'; ctx.globalAlpha = .7;
    ctx.fillText('User-generated slogan · not the platform’s position', 90, H - 60);
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.fillStyle = th.accent; ctx.arc(W - 120, H - 112, 26, 0, Math.PI * 2); ctx.fill();
  }

  function chipGroup(id, obj, key) {
    const el = $(id);
    el.innerHTML = Object.entries(obj).map(([k, v]) => `<label class="chip"><input type="radio" name="${key}" value="${k}"${state[key] === k ? ' checked' : ''}> ${esc(v)}</label>`).join('');
    el.addEventListener('change', (e) => { state[key] = e.target.value; generate(); });
  }

  function prefill(eventCause) {
    const hit = Object.entries(CAUSES).find(([, v]) => v.match && v.match.includes(eventCause));
    state.cause = hit ? hit[0] : 'custom';
    if (!hit) state.custom = eventCause.toLowerCase();
    $('studio-cause').value = state.cause;
    $('studio-custom').value = state.custom;
    $('custom-cause-field').hidden = state.cause !== 'custom';
    generate();
  }

  function init() {
    $('studio-cause').innerHTML = Object.entries(CAUSES).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
    $('studio-cause').value = state.cause;
    chipGroup('studio-lang', LANGS, 'lang');
    chipGroup('studio-tone', TONES, 'tone');
    chipGroup('studio-format', FORMATS, 'format');
    $('studio-cause').addEventListener('change', (e) => { state.cause = e.target.value; $('custom-cause-field').hidden = state.cause !== 'custom'; if (state.cause !== 'custom') generate(); else $('studio-custom').focus(); });
    let tmr; $('studio-custom').addEventListener('input', (e) => { state.custom = e.target.value; clearTimeout(tmr); tmr = setTimeout(generate, 400); });
    $('studio-generate').addEventListener('click', generate);

    $('poster-themes').innerHTML = THEMES.map((t, i) => `<button class="theme-swatch" role="radio" aria-checked="${i === 0}" aria-label="${t.name} theme" data-theme="${i}" style="background:${t.bg}"></button>`).join('');
    $('poster-themes').addEventListener('click', (e) => {
      const b = e.target.closest('[data-theme]'); if (!b) return;
      state.theme = +b.dataset.theme;
      document.querySelectorAll('.theme-swatch').forEach((s) => s.setAttribute('aria-checked', s === b));
      drawPoster();
    });

    const list = $('slogan-list');
    list.addEventListener('click', (e) => {
      const item = e.target.closest('.slogan-item'); if (!item) return;
      const i = +item.dataset.i;
      const btn = e.target.closest('[data-act]');
      const txt = item.querySelector('.slogan-text').innerText.trim();
      state.options[i] = txt;
      if (btn && btn.dataset.act === 'copy') { copy(txt); return; }
      if (btn && btn.dataset.act === 'poster') {
        state.picked = i;
        document.querySelectorAll('.slogan-item').forEach((s) => s.classList.toggle('is-picked', s === item));
        drawPoster();
        if (window.innerWidth < 1000) document.querySelector('.poster-wrap').scrollIntoView({ behavior: 'smooth' });
      }
    });
    list.addEventListener('input', (e) => {
      const item = e.target.closest('.slogan-item'); if (!item) return;
      const i = +item.dataset.i;
      const txt = e.target.innerText;
      if (BLOCK.test(txt) || PII.test(txt)) { item.style.borderColor = 'var(--red-ink)'; item.title = 'This edit may break the studio rules (harm or personal info).'; }
      else { item.style.borderColor = ''; item.title = ''; }
      state.options[i] = txt.trim();
      if (i === state.picked) drawPoster();
    });

    $('poster-download').addEventListener('click', () => {
      const a = document.createElement('a');
      a.download = 'awaaz-slogan.png';
      a.href = $('poster-canvas').toDataURL('image/png');
      a.click();
      toast('Poster downloaded');
    });

    generate();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPoster);
  }

  return { init, prefill, redraw: () => drawPoster() };
})();
