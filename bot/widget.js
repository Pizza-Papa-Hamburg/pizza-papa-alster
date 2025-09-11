/* PPX Widget — Teil 1/3 (NEU): Bootstrapping, Utilities, Panel & Startansicht
   Erwartet, dass /bot/loader.js window.__PPX_DATA__ geladen hat.
*/
(function () {
  'use strict';

  // ------- Daten & Fallbacks -------
  var DATA   = window.__PPX_DATA__ || {};
  var CFG    = DATA.cfg    || {};
  var DISHES = DATA.dishes || {};

 /* --------- INIT EMAILJS (robust) --------- */
const PUBLIC_KEY = 'J1KTj7-7VJBsV-LHc';
if (window.emailjs && typeof window.emailjs.init === 'function') {
  try { window.emailjs.init({ publicKey: PUBLIC_KEY }); }
  catch (e) { console.warn('[EmailJS] init failed:', e); }
} else {
  console.warn('[EmailJS] not loaded – bot läuft trotzdem, Versand wird später versucht.');
  // Fallback, damit der Rest nicht crasht:
  window.emailjs = window.emailjs || { send: () => Promise.reject(new Error('emailjs not loaded')) };
}


  // ------- DOM Refs (IDs/Klassen bleiben exakt wie bei dir) -------
  var launch = document.getElementById('ppx-launch');
  var panel  = document.getElementById('ppx-panel');
  var close  = document.getElementById('ppx-close');
  var view   = document.getElementById('ppx-v');

  // ------- Helpers -------
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'class') node.className = attrs[k];
        else if (k === 'dataset') {
          var d = attrs[k]; Object.keys(d).forEach(function (dk) { node.dataset[dk] = d[dk]; });
        } else if (k === 'style') {
          var s = attrs[k]; Object.keys(s).forEach(function (sk) { node.style[sk] = s[sk]; });
        } else node.setAttribute(k, attrs[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child == null) continue;
      if (Array.isArray(child)) child.forEach(function (c) { if (c) node.appendChild(c); });
      else if (child.nodeType) node.appendChild(child);
      else node.appendChild(document.createTextNode(String(child)));
    }
    return node;
  }

  function clearView() { view.innerHTML = ''; }
  function append(node) { view.appendChild(node); }
  function msgBot(text) {
    append(el('div', { class: 'ppx-bot ppx-appear' },
      el('div', { class: 'ppx-m', text: text })
    ));
  }
  function grid() { return el('div', { class: 'ppx-grid ppx-appear' }); }
  function pill(label, action, extraDataset) {
    var ds = extraDataset || {};
    ds.action = action;
    return el('div', { class: 'ppx-pill', dataset: ds }, label);
  }
  function opt(label, action, extraDataset) {
    var ds = extraDataset || {};
    ds.action = action;
    return el('div', { class: 'ppx-opt', dataset: ds },
      el('div', { class: 'ppx-ico' }, '★'),
      el('div', { class: 'ppx-m'  }, label)
    );
  }
  function heading(text, compact) {
    var cls = 'ppx-heading' + (compact ? ' compact' : '');
    return el('h3', { class: cls, text: text });
  }
  function backRow(label, target) {
    return el('div', { class: 'ppx-minirow' },
      el('div', { class: 'ppx-mini', dataset: { action: target || 'home' } }, '← ' + (label || 'Zurück'))
    );
  }

  // Kategorie-Labels (überschreibbar via cfg.catLabels)
  var CAT_LABELS = Object.assign({
    antipasti: 'Antipasti',
    pizza:     'Pizza',
    pasta:     'Pasta',
    salads:    'Salate',
    drinks:    'Getränke',
    desserts:  'Desserts'
  }, (CFG.catLabels || {}));

  // Reihenfolge (falls gesetzt), sonst abgeleitet
  function getCategoryOrder() {
    var keys = Object.keys(DISHES || {});
    if (Array.isArray(CFG.menuOrder) && CFG.menuOrder.length) {
      var seen = new Set();
      var ordered = [];
      CFG.menuOrder.forEach(function (k) { if (DISHES[k] && !seen.has(k)) { ordered.push(k); seen.add(k); } });
      keys.forEach(function (k) { if (!seen.has(k)) ordered.push(k); });
      return ordered;
    }
    var prio = ['antipasti','pizza','pasta','salads','drinks','desserts'];
    return keys.sort(function(a,b){
      var ia = prio.indexOf(a), ib = prio.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  // ------- Panel öffnen/schließen -------
  function openPanel()  { panel.classList.add('ppx-open'); }
  function closePanel() { panel.classList.remove('ppx-open'); }

  if (launch) launch.addEventListener('click', function(){ openPanel(); stepHome(); });
  if (close)  close.addEventListener('click', function(){ closePanel(); });

  // ------- Navigation im View (Bubble-Phase) -------
  view.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== view && !t.dataset.action) t = t.parentElement;
    if (!t || !t.dataset || !t.dataset.action) return;
    var action = t.dataset.action;
    if (action === 'home')   return stepHome(true);
    if (action === 'menu')   return stepMenuCategories();
    if (action === 'reserve')return stepReserveIntro();
    if (action === 'info')   return stepInfo();
    if (action === 'cat')    return stepCategory(t.dataset.cat);
    // 'hours' / 'contact' / 'faq' werden in Teil 3 im Capture-Listener behandelt.
  });

  // ------- Start/Home (NEU – wie früher: vertikale Liste, zentriert) -------
function stepHome(isBack) {
// ------- Start/Home (zentriert wie im 2. Bild) -------
function stepHome(isBack) {
  clearView();
  var brand = (CFG.brand || 'Pizza Papa Hamburg');
  var MAXW = '560px'; // gewünschte Breite der Inhalte

  // Begrüßung – zentriert und begrenzt
  append(el('div', {
      class: 'ppx-bot ppx-appear',
      style: { maxWidth: MAXW, margin: '0 auto' }
    },
    el('div', { class: 'ppx-m' },
      '👋 WILLKOMMEN BEI ' + brand.toUpperCase() + '!\n' +
      'Schön, dass du da bist. Wie können wir dir heute helfen?'
    )
  ));

  // Vertikale Liste – zentriert, konstante Breite
  var col = el('div', {
    class: 'ppx-appear',
    style: { display:'flex', flexDirection:'column', gap:'18px', alignItems:'center', width:'100%' }
  });

  function btn(action, icon, label) {
  return el('div', {
      class: 'ppx-opt',
      dataset: { action: action },
      // NEU: margin:'0 auto' sorgt fürs Zentrieren
      style: { width:'100%', maxWidth: MAXW, margin:'0 auto' }
    },
    el('div', { class:'ppx-ico' }, icon),
    el('div', { class:'ppx-m'  }, label)
  );
}

  col.appendChild(btn('menu',    '🍽', 'Speisen'));
  col.appendChild(btn('reserve', '🗓', 'Reservieren'));
  col.appendChild(btn('hours',   '🕒', 'Öffnungszeiten'));
  col.appendChild(btn('contact', '📞', 'Kontaktdaten'));
  col.appendChild(btn('faq',     '❓', 'Q&As'));

  append(col);
}



  // ------- Platzhalter (werden in Teil 2/3 & 3/3 umgesetzt) -------
  function stepMenuCategories() {
    clearView();
    msgBot('Speisen\n…oder wähle eine Kategorie:');
  }

  function stepCategory(catKey) {
    clearView();
    msgBot('Zeige Kategorie: ' + (CAT_LABELS[catKey] || catKey));
    append(backRow('Zurück zu Kategorien', 'menu'));
  }

  function stepReserveIntro() {
    clearView();
    msgBot('Lass uns eine Reservierung anlegen. Ich brauche gleich Personen, Datum, Uhrzeit, Name & Telefonnummer.');
    append(backRow());
  }

  function stepInfo() {
    clearView();
    msgBot('Hier findest du gleich Kontakt & Öffnungszeiten.');
    append(backRow());
  }

  // Auto-Start beim Laden, falls Panel offen
  if (panel && panel.classList.contains('ppx-open')) {
    stepHome();
  }

})();
/* PPX Widget — Teil 2/3 (NEU): Menü-Kategorien & Gerichte (dynamisch aus bot.json) */
(function () {
  'use strict';

  var DATA   = window.__PPX_DATA__ || {};
  var CFG    = DATA.cfg    || {};
  var DISHES = DATA.dishes || {};

  var view  = document.getElementById('ppx-v');
  var panel = document.getElementById('ppx-panel');

  // ---- Helpers (lokal, unabhängig von Teil 1) ----
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'class') node.className = attrs[k];
        else if (k === 'dataset') {
          var d = attrs[k]; Object.keys(d).forEach(function (dk) { node.dataset[dk] = d[dk]; });
        } else node.setAttribute(k, attrs[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child == null) continue;
      if (Array.isArray(child)) child.forEach(function (c) { if (c) node.appendChild(c); });
      else if (child.nodeType) node.appendChild(child);
      else node.appendChild(document.createTextNode(String(child)));
    }
    return node;
  }
  function clearView(){ if (view) view.innerHTML=''; }
  function append(n){ if (view && n) view.appendChild(n); }
  function msgBot(text) {
    append(el('div', { class: 'ppx-bot ppx-appear' },
      el('div', { class: 'ppx-m', text: text })
    ));
  }
  function grid(){ return el('div', { class: 'ppx-grid ppx-appear' }); }
  function backRow(label, target){
    return el('div', { class: 'ppx-minirow' },
      el('div', { class: 'ppx-mini', dataset: { action: target || 'home' } }, '← ' + (label || 'Zurück'))
    );
  }
  function heading(text, compact){
    return el('h3', { class: 'ppx-heading' + (compact ? ' compact' : ''), text: text });
  }

  // Labels & Reihenfolge
  var CAT_LABELS = Object.assign({
    antipasti: 'Antipasti',
    pizza:     'Pizza',
    pasta:     'Pasta',
    salads:    'Salate',
    drinks:    'Getränke',
    desserts:  'Desserts'
  }, (CFG.catLabels || {}));

  function getCategoryOrder() {
    var keys = Object.keys(DISHES || {});
    if (Array.isArray(CFG.menuOrder) && CFG.menuOrder.length) {
      var seen = new Set(), ordered = [];
      CFG.menuOrder.forEach(function (k) { if (DISHES[k] && !seen.has(k)) { ordered.push(k); seen.add(k); } });
      keys.forEach(function (k) { if (!seen.has(k)) ordered.push(k); });
      return ordered;
    }
    var prio = ['antipasti','pizza','pasta','salads','drinks','desserts'];
    return keys.sort(function(a,b){
      var ia = prio.indexOf(a), ib = prio.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1; if (ib === -1) return -1;
      return ia - ib;
    });
  }

  // --- Capture: merke, was geklickt wurde (für preselect) ---
  var LAST_CLICK_DATA = null;
  if (view) {
    view.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== view && !t.dataset.action) t = t.parentElement;
      LAST_CLICK_DATA = (t && t.dataset) ? Object.assign({}, t.dataset) : null;
    }, true);
  }

  // --- Intercept: übernimm "menu" & "cat" (vor Teil 1 Handler) ---
  if (view) {
    view.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== view && !t.dataset.action) t = t.parentElement;
      if (!t || !t.dataset || !t.dataset.action) return;

      var ds = t.dataset;
      if (ds.action === 'menu') {
        e.stopPropagation(); e.preventDefault();
        return stepMenuCategories2({ preselect: ds.cat || ds.hint || null });
      }
      if (ds.action === 'cat') {
        e.stopPropagation(); e.preventDefault();
        return stepCategory2(ds.cat);
      }
      // "home", "info", "reserve" lässt der Teil-1-Handler bearbeiten
    }, true);
  }

  // --- Menü-Kategorien (mit ~550 ms Verzögerung) ---
  function stepMenuCategories2(opts) {
    clearView();
    msgBot('Speisen\n…oder wähle eine Kategorie:');

    var preselect = opts && opts.preselect ? String(opts.preselect) : null;

    setTimeout(function () {
      var order = getCategoryOrder();
      if (!order.length) {
        append(el('div', { class: 'ppx-bot ppx-appear' },
          el('div', { class: 'ppx-m', text: 'Aktuell sind keine Kategorien hinterlegt.' })
        ));
        append(backRow());
        return;
      }

      var g = grid();
      order.forEach(function (key) {
        var label = CAT_LABELS[key] || key;
        var count = Array.isArray(DISHES[key]) ? DISHES[key].length : 0;
        g.appendChild(
          el('div', { class: 'ppx-opt', dataset: { action: 'cat', cat: key } },
            el('div', { class: 'ppx-ico' }, '🍽'),
            el('div', { class: 'ppx-m'  }, label + (count ? ' (' + count + ')' : ''))
          )
        );
      });
      append(g);
      append(backRow('Zurück', 'home'));

      // Falls preselect gesetzt ist → direkt öffnen
      if (preselect && DISHES[preselect]) {
        stepCategory2(preselect);
      }
    }, 550);
  }

  // --- Kategorie-Detail (Gerichte-Karten) ---
  function stepCategory2(catKey) {
    clearView();
    var items = Array.isArray(DISHES[catKey]) ? DISHES[catKey] : [];
    var title = CAT_LABELS[catKey] || catKey;

    append(el('div', { class: 'ppx-bot ppx-appear' },
      el('div', { class: 'ppx-m' }, 'Kategorie: ' + title)
    ));

    if (!items.length) {
      append(el('div', { class: 'ppx-bot ppx-appear' },
        el('div', { class: 'ppx-m', text: 'Hier sind noch keine Gerichte eingetragen.' })
      ));
      append(backRow('Zurück zu Kategorien', 'menu'));
      return;
    }

    items.forEach(function (d) {
      var name  = d.name || d.id || 'Gericht';
      var info  = d.info || '';
      var price = d.price || '';

      var head = el('div', { class: 'ppx-headrow' },
        heading(name, true),
        el('div', { class: 'ppx-price compact', text: price })
      );
      var body = el('div', { class: 'ppx-desc', text: info });

      append(el('div', { class: 'ppx-card ppx-appear' }, head, body));
    });

    append(backRow('Zurück zu Kategorien', 'menu'));
  }

})();
/* PPX Widget — Teil 3/3 (NEU): Reservierung, Info (stunden/kontakt) & FAQ */
(function () {
  'use strict';

  var DATA   = window.__PPX_DATA__ || {};
  var CFG    = DATA.cfg    || {};
  var OPEN   = CFG.OPEN    || {};   // { 0..6: [open, close] }
  var BUCKET = CFG.BUCKETS || {};   // { key: [start, end] }

  var view  = document.getElementById('ppx-v');

  // ---------- Helpers ----------
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'class') node.className = attrs[k];
        else if (k === 'dataset') {
          var d = attrs[k]; Object.keys(d).forEach(function (dk) { node.dataset[dk] = d[dk]; });
        } else if (k === 'style') {
          var s = attrs[k]; Object.keys(s).forEach(function (sk) { node.style[sk] = s[sk]; });
        } else node.setAttribute(k, attrs[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child == null) continue;
      if (Array.isArray(child)) child.forEach(function (c) { if (c) node.appendChild(c); });
      else if (child.nodeType) node.appendChild(child);
      else node.appendChild(document.createTextNode(String(child)));
    }
    return node;
  }
  function clearView(){ if (view) view.innerHTML=''; }
  function append(n){ if (view && n) view.appendChild(n); }
  function msgBot(text) {
    append(el('div', { class: 'ppx-bot ppx-appear' },
      el('div', { class: 'ppx-m', text: text })
    ));
  }
  function backRow(label, target){
    return el('div', { class: 'ppx-minirow' },
      el('div', { class: 'ppx-mini', dataset: { action: target || 'home' } }, '← ' + (label || 'Zurück'))
    );
  }
  function miniRow(){ return el('div', { class: 'ppx-minirow' }); }

  // Time helpers
  function toMin(hhmm){ var p = (hhmm||'').split(':'); return (+p[0])*60 + (+p[1]||0); }
  function pad(n){ return (n<10?'0':'') + n; }
  function fromMin(m){ var h=Math.floor(m/60), mi=m%60; return pad(h)+':'+pad(mi); }
  function todayStr(){
    var d = new Date();
    var y = d.getFullYear(), m = d.getMonth()+1, da = d.getDate();
    return y + '-' + pad(m) + '-' + pad(da);
  }
  function weekdayIdx(dateStr){
    var d = new Date(dateStr + 'T00:00:00');
    return d.getDay(); // 0=So..6=Sa
  }
  function intersectRange(aStart, aEnd, bStart, bEnd){
    var s = Math.max(aStart, bStart), e = Math.min(aEnd, bEnd);
    return s < e ? [s, e] : null;
  }

  // ---------- Reservierungs-State ----------
  var RES = {
    persons: '', date: '', bucket: '', time: '',
    name: '', phone: '', email: '', note: ''
  };

  function renderReserve() {
    clearView();
    msgBot('Lass uns eine Reservierung anlegen. Bitte wähle Personen & Datum – dann Zeit.');

    var card = el('div', { class: 'ppx-card ppx-appear' });

    // Personen
    var sel = el('select', { id: 'ppx-persons' });
    for (var i=1;i<=12;i++){
      sel.appendChild(el('option',{ value:String(i), text:String(i)+' Person'+(i>1?'en':'') }));
    }
    if (RES.persons) sel.value = RES.persons;

    // Datum
    var date = el('input', { id: 'ppx-date', type: 'date', value: RES.date || todayStr(), min: todayStr() });

    // Buckets
    var bucketRow = miniRow();
    Object.keys(BUCKET).forEach(function (k) {
      var pill = el('div', { class: 'ppx-pill' + (RES.bucket===k?' ppx-selected':''), dataset: { action:'pick_bucket', bucket:k } }, k.charAt(0).toUpperCase()+k.slice(1));
      bucketRow.appendChild(pill);
    });

    card.appendChild(el('div', { class:'ppx-input' }, sel));
    card.appendChild(el('div', { class:'ppx-input' }, date));
    if (Object.keys(BUCKET).length) {
      card.appendChild(el('div', { class:'ppx-note', text:'Wähle ein Zeitfenster:' }));
      card.appendChild(bucketRow);
    }

    // Timeslots Container
    var times = el('div', { id: 'ppx-times' });
    card.appendChild(times);

    // Kontaktdaten
    var nameI  = el('input', { id:'ppx-name',  type:'text',  placeholder:'Name', value: RES.name });
    var phoneI = el('input', { id:'ppx-phone', type:'tel',   placeholder:'Telefon', value: RES.phone });
    var emailI = el('input', { id:'ppx-email', type:'email', placeholder:'E-Mail (optional)', value: RES.email });
    var noteI  = el('textarea',{ id:'ppx-note', placeholder:'Hinweise (optional)' }, RES.note);

    card.appendChild(el('div', { class:'ppx-input' }, nameI));
    card.appendChild(el('div', { class:'ppx-input' }, phoneI));
    card.appendChild(el('div', { class:'ppx-input' }, emailI));
    card.appendChild(el('div', { class:'ppx-input' }, noteI));

    // Senden Button
    var submit = el('div', { class: 'ppx-minirow' },
      el('div', { class: 'ppx-mini', dataset: { action:'submit_res' } }, '✅ Anfrage senden')
    );
    card.appendChild(submit);

    append(card);
    append(backRow());

    if (RES.bucket) renderTimeslots();
  }

  // Timeslots (30-Minuten Raster, mit OPEN & BUCKET geschnitten)
  function renderTimeslots() {
    var host = document.getElementById('ppx-times');
    if (!host) return;
    host.innerHTML = '';

    var d = RES.date || todayStr();
    var wd = weekdayIdx(d);
    var open = OPEN[wd];
    if (!open || open.length !== 2) {
      host.appendChild(el('div', { class:'ppx-note', text:'An diesem Tag sind wir geschlossen.' }));
      return;
    }

    var bucket = BUCKET[RES.bucket];
    var cut = bucket ? intersectRange(toMin(bucket[0]), toMin(bucket[1]), toMin(open[0]), toMin(open[1]))
                     : [toMin(open[0]), toMin(open[1])];

    if (!cut) {
      host.appendChild(el('div', { class:'ppx-note', text:'In diesem Zeitfenster keine Reservierungen möglich.' }));
      return;
    }

    var start = cut[0], end = cut[1];
    // Vergangene Zeiten am heutigen Tag ausblenden (+15 Min Puffer)
    var now = new Date();
    if (d === todayStr()) start = Math.max(start, now.getHours()*60 + now.getMinutes() + 15);

    var row = miniRow();
    var any = false;
    for (var t = start; t <= end - 30; t += 30) {
      any = true;
      var label = fromMin(t);
      var pill = el('div', { class: 'ppx-mini' + (RES.time===label?' ppx-selected':''), dataset:{ action:'pick_time', time:label } }, label);
      row.appendChild(pill);
    }
    if (!any) {
      host.appendChild(el('div', { class:'ppx-note', text:'Heute leider keine freien Zeiten mehr in diesem Slot.' }));
    } else {
      host.appendChild(el('div', { class:'ppx-note', text:'Wähle eine Uhrzeit:' }));
      host.appendChild(row);
      try { host.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e){}
    }
  }

  // ---------- Click & Input Handling ----------
  if (view) {
    // Capture: greift vor den Teil-1-Listenern
    view.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== view && !t.dataset.action) t = t.parentElement;
      if (!t || !t.dataset) return;
      var a = t.dataset.action;

      if (a === 'reserve') {
        e.preventDefault(); e.stopPropagation();
        if (!RES.date) RES.date = todayStr();
        if (!RES.persons) RES.persons = '2';
        renderReserve();
        return;
      }
      if (a === 'info') {
        e.preventDefault(); e.stopPropagation();
        renderInfo(); // beides
        return;
      }
      if (a === 'hours') {
        e.preventDefault(); e.stopPropagation();
        renderInfo('hours'); // nur Öffnungszeiten
        return;
      }
      if (a === 'contact') {
        e.preventDefault(); e.stopPropagation();
        renderInfo('contact'); // nur Kontakt
        return;
      }
      if (a === 'faq') {
        e.preventDefault(); e.stopPropagation();
        renderFaq();
        return;
      }
      if (a === 'pick_bucket') {
        e.preventDefault();
        RES.bucket = t.dataset.bucket || '';
        RES.time = '';
        var sib = t.parentElement && t.parentElement.children ? t.parentElement.children : [];
        for (var i=0;i<sib.length;i++){ sib[i].classList.remove('ppx-selected'); }
        t.classList.add('ppx-selected');
        renderTimeslots();
        return;
      }
      if (a === 'pick_time') {
        e.preventDefault();
        RES.time = t.dataset.time || '';
        var sib2 = t.parentElement && t.parentElement.children ? t.parentElement.children : [];
        for (var j=0;j<sib2.length;j++){ sib2[j].classList.remove('ppx-selected'); }
        t.classList.add('ppx-selected');
        return;
      }
      if (a === 'submit_res') {
        e.preventDefault();
        submitReservation();
        return;
      }
    }, true);

    // Inputs
    view.addEventListener('input', function (e) {
      var id = e.target && e.target.id;
      if (!id) return;
      var v = (e.target.value || '').trim();
      if (id === 'ppx-persons') RES.persons = v;
      if (id === 'ppx-date')    { RES.date = v; RES.time = ''; renderTimeslots(); }
      if (id === 'ppx-name')    RES.name = v;
      if (id === 'ppx-phone')   RES.phone = v;
      if (id === 'ppx-email')   RES.email = v;
      if (id === 'ppx-note')    RES.note = v;
    });
  }

  // ---------- EmailJS Submit ----------
  function submitReservation() {
    var missing = [];
    if (!RES.persons) missing.push('Personenzahl');
    if (!RES.date)    missing.push('Datum');
    if (!RES.time)    missing.push('Uhrzeit');
    if (!RES.name)    missing.push('Name');
    if (!RES.phone)   missing.push('Telefon');
    if (missing.length) { msgBot('Bitte ausfüllen: ' + missing.join(', ') + '.'); return; }

    var params = {
      brand: CFG.brand || 'Pizza Papa Hamburg',
      persons: RES.persons,
      date: RES.date,
      time: RES.time,
      bucket: RES.bucket || '',
      name: RES.name,
      phone: RES.phone,
      email: RES.email || '',
      note: RES.note || '',
      source_url: (window.location && window.location.href) || ''
    };

    var svc  = CFG.EMAIL && CFG.EMAIL.service;
    var tpl  = CFG.EMAIL && CFG.EMAIL.toTemplate;
    var auto = CFG.EMAIL && CFG.EMAIL.autoReplyTemplate;

    if (!window.emailjs || !svc || !tpl) {
      msgBot('Konnte nicht senden (E-Mail-Dienst nicht konfiguriert). Bitte rufe uns kurz an.');
      return;
    }

    window.emailjs.send(svc, tpl, params).then(function () {
      if (auto && params.email) { window.emailjs.send(svc, auto, params).catch(function(){}); }
      clearView();
      msgBot('Vielen Dank, ' + RES.name + '! Deine Anfrage ist bei uns eingegangen: '
        + RES.date + ' um ' + RES.time + ' für ' + RES.persons + ' Person' + (RES.persons>1?'en':'') + '.');
      msgBot('Wir melden uns kurzfristig zur Bestätigung. Falls es eilig ist: ' + (CFG.phone || '+49 …'));
      append(backRow('Zur Startseite', 'home'));
    }).catch(function (err) {
      console.error('[EmailJS] Fehler:', err);
      msgBot('Upps – das hat nicht geklappt. Bitte versuche es später nochmal oder ruf uns an.');
    });
  }

  // ---------- Info / Kontakt ----------
  function renderInfo(mode) {
    clearView();
    msgBot('Hier sind unsere Kontaktangaben & Öffnungszeiten.');

    var card = el('div', { class: 'ppx-card ppx-appear' });

    // Kontakt (wenn nicht nur hours)
    if (mode !== 'hours') {
      if (CFG.phone) card.appendChild(el('div', { class:'ppx-m' }, 'Telefon: ', el('a', { href:'tel:'+CFG.phone, class:'ppx-link' }, CFG.phone)));
      if (CFG.email) card.appendChild(el('div', { class:'ppx-m' }, 'E-Mail: ', el('a', { href:'mailto:'+CFG.email, class:'ppx-link' }, CFG.email)));
      if (CFG.address) card.appendChild(el('div', { class:'ppx-m', text:'Adresse: ' + CFG.address }));
    }

    // Öffnungszeiten (wenn nicht nur contact)
    if (mode !== 'contact') {
      card.appendChild(el('div', { class:'ppx-note', text:'Öffnungszeiten:' }));
      var hours = el('div', { class:'ppx-hours' });

      if (Array.isArray(CFG.hoursLines) && CFG.hoursLines.length) {
        CFG.hoursLines.forEach(function (line) {
          hours.appendChild(el('div', { class:'ppx-m' , text: line[0] || '' }));
          hours.appendChild(el('div', { class:'ppx-m' , text: line[1] || '' }));
        });
      } else if (OPEN) {
        var days = ['So.','Mo.','Di.','Mi.','Do.','Fr.','Sa.'];
        for (var i=0;i<7;i++){
          var rng = OPEN[i];
          var val = (rng && rng.length===2) ? (rng[0] + ' – ' + rng[1]) : 'geschlossen';
          hours.appendChild(el('div', { class:'ppx-m', text: days[i] }));
          hours.appendChild(el('div', { class:'ppx-m', text: val }));
        }
      }
      card.appendChild(hours);
    }

    var row = miniRow();
    row.appendChild(el('div', { class:'ppx-mini', dataset:{ action:'reserve' } }, '🗓 Tisch reservieren'));
    card.appendChild(row);

    append(card);
    append(backRow());
  }

  // ---------- FAQ (einfacher Stub) ----------
  function renderFaq() {
    clearView();
    msgBot('Häufige Fragen (kurz & knapp):');

    var card = el('div', { class: 'ppx-card ppx-appear' });
    card.appendChild(el('div', { class:'ppx-heading compact', text:'Kann ich telefonisch reservieren?' }));
    card.appendChild(el('div', { class:'ppx-desc', text:'Ja – ruf uns gern an: ' + (CFG.phone || 'Telefonnummer im Kontaktbereich').toString() }));

    card.appendChild(el('div', { class:'ppx-heading compact', text:'Gibt es vegetarische Optionen?' }));
    card.appendChild(el('div', { class:'ppx-desc', text:'Klar! Schau in den Kategorien Pizza, Pasta und Salate.' }));

    card.appendChild(el('div', { class:'ppx-heading compact', text:'Wie kurzfristig kann ich reservieren?' }));
    card.appendChild(el('div', { class:'ppx-desc', text:'Sofern ein Slot frei ist, auch am selben Tag. Alternativ kurz anrufen.' }));

    var row = miniRow();
    row.appendChild(el('div', { class:'ppx-mini', dataset:{ action:'reserve' } }, '🗓 Jetzt reservieren'));
    row.appendChild(el('div', { class:'ppx-mini', dataset:{ action:'home' } }, '← Zur Startseite'));
    card.appendChild(row);

    append(card);
  }

})();




