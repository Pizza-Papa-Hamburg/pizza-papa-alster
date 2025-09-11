/* PPX Bot Loader — lädt zuerst bot.json, legt sie global ab und lädt dann widget.js.
   Konfigurierbar über data-Attribute am <script>:
   - data-config="bot-data/bot.json"
   - data-widget="bot/widget.js"
   - (optional) data-emailjs="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
   - (optional) data-nocache  → nutzt cache: 'no-store'
*/
(function () {
  try {
    var w = window;
    var script =
      document.currentScript ||
      document.querySelector('script[data-ppx-loader]') ||
      document.getElementById('ppx-bot-loader');

    var CONFIG_URL = (script && script.getAttribute('data-config')) || 'bot-data/bot.json';
    var WIDGET_URL = (script && script.getAttribute('data-widget')) || 'bot/widget.js';
    var EMAILJS_URL = script && script.getAttribute('data-emailjs'); // optional
    var cacheMode = script && script.hasAttribute('data-nocache') ? 'no-store' : 'no-cache';

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = function () { reject(new Error('Failed to load: ' + src)); };
        (document.head || document.documentElement).appendChild(s);
      });
    }

    function fetchJSON(url) {
      return fetch(url, { cache: cacheMode }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
        return res.json();
      });
    }

    // 1) Konfig laden und global bereitstellen
    fetchJSON(CONFIG_URL)
      .then(function (data) {
        w.__PPX_DATA__ = data; // { cfg: {...}, dishes: {...} }
        // 2) Optional EmailJS nachladen, falls nicht bereits vorhanden
        if (EMAILJS_URL && !w.emailjs) {
          return loadScript(EMAILJS_URL);
        }
      })
      // 3) Widget laden (nutzt dann window.__PPX_DATA__)
      .then(function () { return loadScript(WIDGET_URL); })
      .catch(function (err) {
        console.error('[PPX Loader] Fehler:', err);
      });
  } catch (err) {
    console.error('[PPX Loader] Unerwarteter Fehler:', err);
  }
})();
