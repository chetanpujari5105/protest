/* Awaaz — Submissions go to a review queue (tables/submissions). Never auto-published. */
window.Submit = (function () {
  const { esc } = U;
  const $ = (id) => document.getElementById(id);
  const PII = /(\+?\d[\d\s-]{9,}\d)|(\b\S+@\S+\.\S+\b)/;

  function kind() { return document.querySelector('input[name=kind]:checked').value; }
  function syncKind() {
    const k = kind();
    $('sub-event-field').hidden = k !== 'correction';
    $('sub-field-field').hidden = k !== 'correction';
    $('announce-fields').hidden = k !== 'announcement';
  }
  function prefill(eventId) {
    document.querySelector('input[name=kind][value=correction]').checked = true;
    syncKind();
    $('sub-event').value = eventId;
    $('submit-result').hidden = true;
  }
  function show(kindCls, html) {
    const r = $('submit-result');
    r.hidden = false; r.className = 'state-box ' + kindCls; r.innerHTML = html;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const details = $('sub-details'), source = $('sub-source');
    [details, source].forEach((x) => x.classList.remove('field-error'));
    const errs = [];
    if (details.value.trim().length < 10) { errs.push('Add a few words of detail.'); details.classList.add('field-error'); }
    let url; try { url = new URL(source.value.trim()); if (!/^https?:$/.test(url.protocol)) throw 0; } catch (_) { errs.push('Add a valid public source link (https://…).'); source.classList.add('field-error'); }
    if (PII.test(details.value)) errs.push('Please remove phone numbers or email addresses from the details.');
    if (kind() === 'announcement' && !$('sub-title').value.trim()) errs.push('Add an event title.');
    if (errs.length) { show('state-error', `<p><strong>Please fix:</strong></p><ul style="margin:4px 0 0;padding-left:18px">${errs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`); return; }

    const k = kind();
    const rec = {
      kind: k,
      event_id: k === 'correction' ? $('sub-event').value : '',
      field: k === 'correction' ? $('sub-field').value : '',
      title: k === 'announcement' ? $('sub-title').value.trim() : '',
      state: k === 'announcement' ? $('sub-state').value : '',
      city: k === 'announcement' ? $('sub-city').value.trim() : '',
      public_venue: k === 'announcement' ? $('sub-venue').value.trim() : '',
      event_date: k === 'announcement' ? $('sub-date').value : '',
      details: details.value.trim(),
      source_url: url.href,
      review_status: 'pending_review'
    };
    const btn = $('submit-btn');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
    try {
      const res = await fetch('tables/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const saved = await res.json();
      show('state-ok', `<p><strong>Received for review.</strong> Reference: <code>${esc(String(saved.id || '').slice(0, 8))}</code></p><p>Status: <span class="tag tag-warn">Unreviewed submission</span>. It will not appear on the map unless a reviewer checks it against a public source. No review workflow is staffed in this prototype.</p>`);
      $('submit-form').reset(); syncKind();
    } catch (err) {
      show('', `<p><strong>Demo — not submitted.</strong></p><p>The review queue could not be reached (${esc(err.message)}), so nothing was saved. Your text is still in the form.</p>`);
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Send for review';
    }
  }

  function init() {
    $('sub-event').innerHTML = window.AWAAZ_EVENTS.map((ev) => `<option value="${ev.id}">[Demo] ${esc(ev.title)} — ${esc(ev.city)}</option>`).join('');
    $('sub-state').innerHTML = '<option value="">Select…</option>' + window.AWAAZ_STATES.map((s) => `<option>${esc(s)}</option>`).join('');
    document.querySelectorAll('input[name=kind]').forEach((r) => r.addEventListener('change', syncKind));
    $('submit-form').addEventListener('submit', onSubmit);
    syncKind();
  }
  return { init, prefill };
})();
