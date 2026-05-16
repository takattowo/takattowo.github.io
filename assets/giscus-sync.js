(function () {
  var LIGHT = location.origin + '/assets/giscus-light.css';
  var DARK = location.origin + '/assets/giscus-dark.css';

  var section = document.getElementById('comments');
  if (!section) return;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? DARK : LIGHT;
  }

  var giscusScript = document.createElement('script');
  giscusScript.src = 'https://giscus.app/client.js';
  giscusScript.async = true;
  giscusScript.crossOrigin = 'anonymous';
  giscusScript.setAttribute('data-repo', section.dataset.giscusRepo);
  giscusScript.setAttribute('data-repo-id', section.dataset.giscusRepoId);
  giscusScript.setAttribute('data-category', section.dataset.giscusCategory);
  giscusScript.setAttribute('data-category-id', section.dataset.giscusCategoryId);
  giscusScript.setAttribute('data-mapping', 'pathname');
  giscusScript.setAttribute('data-strict', '0');
  giscusScript.setAttribute('data-reactions-enabled', '1');
  giscusScript.setAttribute('data-emit-metadata', '0');
  giscusScript.setAttribute('data-input-position', 'bottom');
  giscusScript.setAttribute('data-theme', currentTheme());
  giscusScript.setAttribute('data-lang', 'en');
  giscusScript.setAttribute('data-loading', 'eager');
  section.appendChild(giscusScript);

  function send(theme) {
    var iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return false;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme } } },
      'https://giscus.app'
    );
    return true;
  }

  function applyTheme() {
    var t = currentTheme();
    giscusScript.setAttribute('data-theme', t);
    if (send(t)) return;
    var deadline = Date.now() + 15000;
    var timer = setInterval(function () {
      if (send(t) || Date.now() > deadline) clearInterval(timer);
    }, 250);
  }

  var btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', function () { setTimeout(applyTheme, 50); });
})();
