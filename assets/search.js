(function () {
  var wrap = document.getElementById('search');
  if (!wrap) return;
  var input = wrap.querySelector('.search-input');
  var results = wrap.querySelector('.search-results');

  var pf = null;
  var debounceId = null;

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

  function hide() { clear(results); results.hidden = true; }

  function runSearch(q) {
    if (!q || q.length < 2) { hide(); return; }
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

  input.addEventListener('input', function () {
    clearTimeout(debounceId);
    debounceId = setTimeout(function () { runSearch(input.value.trim()); }, 180);
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#search')) hide();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.blur(); hide(); }
  });
})();
