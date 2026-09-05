/* Shared iteration switcher. Injects a floating pill on every landing page. */
(function () {
  var ITERATIONS = [
    { n: 1, name: 'Quiet Minimal' },
    { n: 2, name: 'Neural Dark' },
    { n: 3, name: 'Paper Editorial' },
    { n: 4, name: 'Daylight' },
    { n: 5, name: 'Product Shell' },
    { n: 6, name: 'Ophelia Glass' }
  ];

  // Sites canonicalizes /1.html to /1. Accept both, including a trailing slash.
  var current = (location.pathname.match(/(?:^|\/)([1-6])(?:\.html?)?\/?$/) || [])[1];
  current = current ? parseInt(current, 10) : 6;

  // Resolve from this script so project sites keep their repository prefix.
  var siteBase = new URL('../', document.currentScript.src).pathname;

  var wrap = document.createElement('div');
  wrap.className = 'iter-switcher';
  wrap.setAttribute('role', 'navigation');
  wrap.setAttribute('aria-label', 'Design iterations');

  var label = document.createElement('span');
  label.className = 'iter-switcher__label';
  var meta = ITERATIONS.filter(function (i) { return i.n === current; })[0] || ITERATIONS[0];
  label.textContent = meta.n + ' · ' + meta.name;
  wrap.appendChild(label);

  var list = document.createElement('div');
  list.className = 'iter-switcher__dots';

  ITERATIONS.forEach(function (it) {
    var a = document.createElement('a');
    a.className = 'iter-switcher__dot' + (it.n === current ? ' is-active' : '');
    a.href = siteBase + it.n + '.html';
    a.textContent = it.n;
    a.title = 'Iteration ' + it.n + ' — ' + it.name;
    if (it.n === current) a.setAttribute('aria-current', 'page');
    list.appendChild(a);
  });

  wrap.appendChild(list);
  function mount() {
    if (document.querySelector('.iter-switcher')) return;
    document.body.appendChild(wrap);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  /* Press 1–6 to jump between iterations. */
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector('dialog[open]')) return;
    if (!/^[1-6]$/.test(e.key)) return;
    var n = Number(e.key);
    if (n !== current) location.href = siteBase + n + '.html';
  });
})();
