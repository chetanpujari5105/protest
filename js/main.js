/* Awaaz — app shell / view routing */
window.App = (function () {
  const views = ['atlas', 'reporting', 'studio', 'submit', 'method'];
  function go(view) {
    if (!views.includes(view)) view = 'atlas';
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('is-active', v.id === 'view-' + view));
    document.querySelectorAll('.nav-tab').forEach((t) => {
      const on = t.dataset.view === view;
      t.classList.toggle('is-active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    if (view === 'atlas') setTimeout(() => Atlas.invalidate(), 30);
    else window.scrollTo(0, 0);
    if (view === 'reporting') News.onShow();
    if (view === 'studio') Studio.redraw();
    if (view !== 'atlas') history.replaceState(null, '', '#' + view);
    else if (!location.hash.startsWith('#event=')) history.replaceState(null, '', location.pathname);
  }
  function init() {
    Atlas.init(); News.init(); Studio.init(); Submit.init();
    document.querySelectorAll('.nav-tab').forEach((t) => t.addEventListener('click', () => go(t.dataset.view)));
    document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => go(b.dataset.goto)));
    const h = location.hash.slice(1);
    if (views.includes(h)) go(h);
  }
  document.addEventListener('DOMContentLoaded', init);
  return { go };
})();
