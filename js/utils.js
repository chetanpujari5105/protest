/* Awaaz — shared helpers */
window.U = (function () {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function relTime(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const abs = Math.abs(diff), future = diff < 0;
    const m = Math.round(abs / 60000), h = Math.round(abs / 3600000), d = Math.round(abs / 86400000);
    let s;
    if (m < 1) s = 'just now';
    else if (m < 60) s = m + ' min';
    else if (h < 24) s = h + ' hr';
    else s = d + (d === 1 ? ' day' : ' days');
    if (s === 'just now') return s;
    return future ? 'in ' + s : s + ' ago';
  }
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';
  const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';

  function isStale(iso, hours = 24) { return !iso || (Date.now() - new Date(iso).getTime()) > hours * 3600000; }

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied to clipboard'); } catch (_) { toast('Copy failed — select and copy manually'); }
      ta.remove();
    }
  }

  const store = {
    get(k, d) { try { const v = localStorage.getItem('awaaz:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('awaaz:' + k, JSON.stringify(v)); } catch (e) {} }
  };

  return { esc, relTime, fmtDate, fmtDateTime, fmtTime, isStale, toast, copy, store };
})();
