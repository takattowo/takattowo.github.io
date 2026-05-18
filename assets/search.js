(function () {
  var wrap = document.getElementById('search');
  if (!wrap) return;
  var btn = wrap.querySelector('.search-btn');
  var panel = wrap.querySelector('.search-panel');
  var input = wrap.querySelector('.search-input');
  var results = wrap.querySelector('.search-results');

  var pf = null;
  var debounceId = null;
  var hoverTimer = null;

  function loadPagefind() {
    if (pf) return Promise.resolve(pf);
    return import('/pagefind/pagefind.js').then(function (mod) {
      pf = mod;
      if (mod.options) mod.options({ excerptLength: 25 });
      return mod;
    });
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function setExcerpt(target, excerpt) {
    var re = /(<mark>)([\s\S]*?)(<\/mark>)/g;
    var idx = 0;
    var m;
    while ((m = re.exec(excerpt)) !== null) {
      if (m.index > idx) target.appendChild(document.createTextNode(excerpt.slice(idx, m.index)));
      var mk = document.createElement('mark');
      mk.textContent = m[2];
      target.appendChild(mk);
      idx = m.index + m[0].length;
    }
    if (idx < excerpt.length) target.appendChild(document.createTextNode(excerpt.slice(idx)));
  }

  function renderResults(items) {
    clear(results);
    if (!items.length) {
      var empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'No results';
      results.appendChild(empty);
      results.hidden = false;
      return;
    }
    items.forEach(function (d) {
      var url = d.url.replace(/\.html$/, '').replace(/\/index$/, '/');
      var a = document.createElement('a');
      a.className = 'search-result';
      a.href = url;
      var title = document.createElement('div');
      title.className = 'search-result-title';
      title.textContent = (d.meta && d.meta.title) || url;
      var ex = document.createElement('div');
      ex.className = 'search-result-excerpt';
      setExcerpt(ex, d.excerpt || '');
      a.appendChild(title);
      a.appendChild(ex);
      results.appendChild(a);
    });
    results.hidden = false;
  }

  function runSearch(q) {
    if (!q || q.length < 2) {
      clear(results);
      results.hidden = true;
      return;
    }
    loadPagefind().then(function (lib) {
      return lib.search(q);
    }).then(function (res) {
      return Promise.all(res.results.slice(0, 8).map(function (r) { return r.data(); }));
    }).then(renderResults).catch(function () {
      clear(results);
      var err = document.createElement('div');
      err.className = 'search-empty';
      err.textContent = 'Search unavailable';
      results.appendChild(err);
      results.hidden = false;
    });
  }

  function open() {
    if (wrap.classList.contains('open')) return;
    wrap.classList.add('open');
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('search-modal-open');
    setTimeout(function () { input.focus(); }, 30);
  }

  function close() {
    wrap.classList.remove('open');
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('search-modal-open');
    input.value = '';
    clear(results);
    results.hidden = true;
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (wrap.classList.contains('open')) close(); else open();
  });

  wrap.addEventListener('mouseenter', function () {
    clearTimeout(hoverTimer);
    if (window.matchMedia('(hover: hover) and (min-width: 561px)').matches) open();
  });
  wrap.addEventListener('mouseleave', function () {
    if (!window.matchMedia('(hover: hover) and (min-width: 561px)').matches) return;
    hoverTimer = setTimeout(function () {
      if (document.activeElement !== input && !input.value) close();
    }, 250);
  });

  input.addEventListener('input', function () {
    clearTimeout(debounceId);
    debounceId = setTimeout(function () { runSearch(input.value.trim()); }, 180);
  });

  document.addEventListener('click', function (e) {
    if (!wrap.classList.contains('open')) return;
    if (e.target.closest('#search')) return;
    close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && wrap.classList.contains('open')) close();
  });
})();
