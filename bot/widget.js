/* ============================================================================
   PPX Widget (FULL, Sticky + data-ic Icons) — Teil 1
   - Behält frühere Blöcke sichtbar (Append-Mode)
   - Buttons/Chips setzen Icons via data-ic (passt zu deinem alten CSS)
   - Flows: Home, Speisen→Kategorie→Item, Reservieren, Öffnungszeiten, Kontakt, Q&A
   - DOM-IDs: #ppx-launch, #ppx-panel, #ppx-close, #ppx-v
   ============================================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 0) Daten & Setup
  // ---------------------------------------------------------------------------
  var W    = window;
  var DATA = W.__PPX_DATA__ || {};
  var CFG  = DATA.cfg    || {};
  var DISH = DATA.dishes || {};
  var FAQ  = DATA.faqs   || [];
  var STICKY = true; // nichts auto-clearen

  // EmailJS optional
  (function initEmailJS(){
    try {
      if (W.emailjs && CFG.EMAIL && CFG.EMAIL.publicKey) {
        W.emailjs.init({ publicKey: CFG.EMAIL.publicKey });
      }
    } catch (e) {}
  })();

  // ---------------------------------------------------------------------------
  // 1) DOM
  // ---------------------------------------------------------------------------
  var $launch = document.getElementById('ppx-launch');
  var $panel  = document.getElementById('ppx-panel');
  var $close  = document.getElementById('ppx-close');
  var $view   = document.getElementById('ppx-v');
  if (!$launch || !$panel || !$close || !$view) {
    console.warn('[PPX] DOM-IDs fehlen.');
    return;
  }

  // ---------------------------------------------------------------------------
  // 2) Utils
  // ---------------------------------------------------------------------------
  function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }

  function el(tag, attrs){
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'style' && isObj(attrs[k])) {
        Object.assign(n.style, attrs[k]);
      } else if (k === 'text') {
        n.textContent = attrs[k];
      } else if (k === 'html') {
        n.innerHTML = attrs[k];
      } else if (k.slice(0,2) === 'on' && typeof attrs[k] === 'function') {
        n.addEventListener(k.slice(2), attrs[k]);
      } else {
        n.setAttribute(k, attrs[k]);
      }
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return n;
  }

  function pretty(s){
    return String(s||'')
      .replace(/[_-]+/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }

  function scrollToEl(node){
    if (!node) return;
    try { node.scrollIntoView({ behavior:'smooth', block:'start' }); }
    catch(e){ $view.scrollTop = $view.scrollHeight; }
  }

  // NIE auto-clearen (außer gezwungen)
  function clearView(opts){
    if (!STICKY) $view.innerHTML = '';
    else if (opts && opts.force) $view.innerHTML = '';
  }

  function line(txt){ return el('div', { class:'ppx-m' }, txt); }
  function row(){ return el('div', { class:'ppx-row' }); }
  function grid(){ return el('div', { class:'ppx-grid' }); }

  // Buttons/Chips mit data-ic (für dein altes CSS)
  function btn(label, onClick, extraCls, ic){
    var attrs = { class: 'ppx-b ' + (extraCls||''), onclick: onClick };
    if (ic) attrs['data-ic'] = ic;
    return el('button', attrs, label);
  }
  function chip(label, onClick, extraCls, ic){
    var attrs = { class: 'ppx-chip ' + (extraCls||''), onclick: onClick };
    if (ic) attrs['data-ic'] = ic;
    return el('button', attrs, label);
  }

  // Neuer Block (Card) anhängen
  function block(title, opts){
    opts = opts || {};
    var wrap = el('div', {
      class: 'ppx-bot ppx-appear',
      style: { maxWidth: (opts.maxWidth || '680px'), margin: '14px auto' }
    });
    if (title) wrap.appendChild(el('div', { class:'ppx-h' }, title));
    $view.appendChild(wrap);
    scrollToEl(wrap);
    return wrap;
  }

  // horizontale Button-Gruppe
  function nav(btns){
    var r = row();
    btns.forEach(function(b){ if (b) r.appendChild(b); });
    return r;
  }

  // Nav-Shortcuts (mit Icons)
  function backBtn(to){
    return btn('Zurück', function(){ if (to) scrollToEl(to); else scrollToEl($view.firstElementChild||$view); }, '', '←');
  }
  function doneBtn(){
    return btn('Fertig ✓', function(){ scrollToEl($view.lastElementChild||$view); }, '', '✓');
  }
  function resBtn(prev){
    return btn('Reservieren', function(){ stepReservieren(prev); }, '', '📅');
  }

  // ---------------------------------------------------------------------------
  // 3) HOME (einmalig rendern)
  // ---------------------------------------------------------------------------
  function stepHome(){
    if ($view.querySelector('[data-block="home"]')) return;

    var brand = (CFG.brand || 'Pizza Papa Hamburg');
    var B = block(brand.toUpperCase());
    B.setAttribute('data-block','home');

    B.appendChild(line('👋 WILLKOMMEN BEI '+brand.toUpperCase()+'!'));
    B.appendChild(line('Schön, dass du da bist. Wie können wir dir heute helfen?'));

    var r1 = row();
    r1.appendChild(btn('Speisen',      function(){ stepSpeisen(B); }, 'ppx-cta', '🍽️'));
    B.appendChild(r1);

    var r2 = row();
    r2.appendChild(btn('Reservieren',  function(){ stepReservieren(B); }, '', '📅'));
    B.appendChild(r2);

    var r3 = row();
    r3.appendChild(btn('Öffnungszeiten', function(){ stepHours(B); }, '', '⏰'));
    B.appendChild(r3);

    var r4 = row();
    r4.appendChild(btn('Kontaktdaten', function(){ stepKontakt(B); }, '', '☎️'));
    B.appendChild(r4);

    var r5 = row();
    r5.appendChild(btn('Q&As', function(){ stepQAs(B); }, '', '❓'));
    B.appendChild(r5);
  }

  // ---------------------------------------------------------------------------
  // 4) SPEISEN (Append)
  // ---------------------------------------------------------------------------
  function stepSpeisen(prevBlock){
    var B = block('SPEISEN');
    B.setAttribute('data-block','speisen-root');

    if (CFG.menuPdf) {
      var a = el('a', { href: CFG.menuPdf, target: '_blank', class:'ppx-link' }, '📄 Speisekarte als PDF');
      B.appendChild(el('div', { class:'ppx-m' }, a));
    }
    B.appendChild(line('…oder wähle eine Kategorie:'));

    var cats = Object.keys(DISH);
    if (!cats.length) cats = ['Antipasti','Pizza','Pasta','Getränke','Salate','Desserts'];

    var G = grid();
    cats.forEach(function(cat){
      var list = Array.isArray(DISH[cat]) ? DISH[cat] : [];
      var count = list.length ? ' ('+list.length+')' : '';
      G.appendChild(chip(pretty(cat)+count, function(){ renderCategory(cat, B); }, '', '🍽️'));
    });
    B.appendChild(G);

    B.appendChild(nav([ backBtn(prevBlock), resBtn(B), doneBtn() ]));
  }

  function renderCategory(catKey, parentBlock){
    var title = 'Gern! Hier ist die Auswahl für '+pretty(catKey)+':';
    var B = block(title);
    B.setAttribute('data-block','speisen-cat');

    var list = Array.isArray(DISH[catKey]) ? DISH[catKey] : [];
    if (!list.length) {
      list = [
        { name: pretty(catKey)+' Classic', price:'9,50' },
        { name: pretty(catKey)+' Special', price:'12,90' }
      ];
    }

    list.forEach(function(it){
      var label = (it.name || 'Artikel') + (it.price ? (' – '+it.price+' €') : '');
      B.appendChild(chip(label, function(){ renderItem(catKey, it, B); }, '', '▶️'));
    });

    B.appendChild(nav([ backBtn(parentBlock), resBtn(B), doneBtn() ]));
  }

  function renderItem(catKey, item, prevBlock){
    var title = item && item.name ? item.name : pretty(catKey);
    var B = block(title);
    B.setAttribute('data-block','speisen-item');

    if (item && item.desc)    B.appendChild(line(item.desc));
    if (item && item.price)   B.appendChild(line('Preis: '+item.price+' €'));
    if (item && item.hinweis) B.appendChild(line('ℹ️ '+item.hinweis));

    B.appendChild(nav([ backBtn(prevBlock), resBtn(B), doneBtn() ]));
  }
  // ---------------------------------------------------------------------------
  // 5) RESERVIEREN (Append)
  // ---------------------------------------------------------------------------
  function stepReservieren(prevBlock){
    var B = block('RESERVIEREN');
    B.setAttribute('data-block','reservieren');

    B.appendChild(line('Schnell-Anfrage senden oder E-Mail öffnen:'));

    var r = row();
    r.appendChild(btn('Schnell senden', function(){ quickEmail(); }, 'ppx-cta', '⚡'));

    var addr = CFG.email ||
               (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) ||
               'info@example.com';

    r.appendChild(btn('E-Mail öffnen', function(){
      var body = [
        'Hallo '+(CFG.brand||'Restaurant')+',',
        '',
        'ich möchte gern reservieren.',
        'Datum & Uhrzeit: ________',
        'Personenanzahl: ________',
        'Telefon: ________',
        '',
        'Liebe Grüße'
      ].join('%0A');
      W.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
    }, '', '✉️'));
    B.appendChild(r);

    B.appendChild(nav([ backBtn(prevBlock), doneBtn() ]));
  }

  function quickEmail(){
    var name = prompt('Dein Name:');                         if (!name) return;
    var when = prompt('Datum & Uhrzeit (z. B. 24.09. 19:00):'); if (!when) return;
    var ppl  = prompt('Personenanzahl:');                    if (!ppl) return;
    var tel  = prompt('Telefon (optional):') || '';

    var payload = {
      name: name, when: when, persons: ppl, phone: tel,
      brand: (CFG.brand || 'Restaurant')
    };

    // EmailJS vorhanden?
    if (W.emailjs && CFG.EMAIL && CFG.EMAIL.serviceId && CFG.EMAIL.templateId) {
      emailjs.send(CFG.EMAIL.serviceId, CFG.EMAIL.templateId, payload).then(
        function(){ alert('Danke! Wir melden uns asap.'); },
        function(){ alert('Senden fehlgeschlagen. Bitte „E-Mail öffnen“ nutzen.'); }
      );
      return;
    }

    // Fallback: mailto
    var addr = CFG.email ||
               (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) ||
               'info@example.com';
    var body = encodeURIComponent(
      'Name: '+name+'\nZeit: '+when+'\nPersonen: '+ppl+'\nTelefon: '+tel+'\n——\nGesendet via Bot'
    );
    W.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
  }

  // ---------------------------------------------------------------------------
  // 6) ÖFFNUNGSZEITEN (Append)
  // ---------------------------------------------------------------------------
  function stepHours(prevBlock){
    var B = block('ÖFFNUNGSZEITEN');
    B.setAttribute('data-block','hours');

    var lines = CFG.hoursLines || [];
    if (!lines.length) {
      B.appendChild(line('Keine Zeiten hinterlegt.'));
    } else {
      lines.forEach(function(rowArr){
        var txt = Array.isArray(rowArr) ? (rowArr[0]+': '+rowArr[1]) : String(rowArr);
        B.appendChild(line('• '+txt));
      });
    }
    B.appendChild(nav([ backBtn(prevBlock), doneBtn() ]));
  }

  // ---------------------------------------------------------------------------
  // 7) KONTAKT (Append)
  // ---------------------------------------------------------------------------
  function stepKontakt(prevBlock){
    var B = block('KONTAKTDATEN');
    B.setAttribute('data-block','kontakt');

    if (CFG.phone) {
      B.appendChild(line('📞 '+CFG.phone));
      B.appendChild(nav([
        btn('Anrufen', function(){ W.location.href='tel:'+String(CFG.phone).replace(/\s+/g,''); }, '', '📞')
      ]));
    }
    if (CFG.email) {
      B.appendChild(line('✉️  '+CFG.email));
      B.appendChild(nav([
        btn('E-Mail schreiben', function(){ W.location.href='mailto:'+CFG.email; }, '', '✉️')
      ]));
    }
    if (CFG.address) {
      B.appendChild(line('📍 '+CFG.address));
      var maps = 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(CFG.address);
      B.appendChild(nav([
        btn('Anfahrt öffnen', function(){ W.open(maps, '_blank'); }, '', '🗺️')
      ]));
    }

    B.appendChild(nav([ backBtn(prevBlock), doneBtn() ]));
  }

  // ---------------------------------------------------------------------------
  // 8) Q&As (Append)
  // ---------------------------------------------------------------------------
  function stepQAs(prevBlock){
    var B = block('Q&As');
    B.setAttribute('data-block','faq');

    if (!Array.isArray(FAQ) || !FAQ.length) {
      B.appendChild(line('Häufige Fragen folgen in Kürze.'));
    } else {
      FAQ.forEach(function(f){
        var q = (f && (f.q || f.question)) || '';
        var a = (f && (f.a || f.answer)) || '';
        if (q) B.appendChild(line('• '+q));
        if (a) B.appendChild(line('↳ '+a));
      });
    }
    B.appendChild(nav([ backBtn(prevBlock), doneBtn() ]));
  }

  // ---------------------------------------------------------------------------
  // 9) Öffnen/Schließen & Init (ohne Clear!)
  // ---------------------------------------------------------------------------
  $launch.addEventListener('click', function(){
    $panel.classList.add('ppx-open');
    if (!$panel.dataset.init) {
      $panel.dataset.init = '1';
      stepHome(); // rendert Home einmalig; bleibt stehen
    }
  });

  $close.addEventListener('click', function(){
    $panel.classList.remove('ppx-open');
  });

  // ESC schließt Panel
  W.addEventListener('keydown', function(e){
    if (e.key === 'Escape') $panel.classList.remove('ppx-open');
  });

  // Overlay-Klick schließt nur, wenn direkt auf Panel (nicht auf Inhalt)
  $panel.addEventListener('click', function(ev){
    if (ev.target === $panel) $panel.classList.remove('ppx-open');
  });

  // Falls durch CSS bereits offen, trotzdem einmal Home rendern (ohne Clear)
  if ($panel.classList.contains('ppx-open') && !$panel.dataset.init) {
    $panel.dataset.init = '1';
    stepHome();
  }

})(); // Ende IIFE
