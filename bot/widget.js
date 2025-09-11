/* ============================================================================
   PPX Widget (v6 ULTRA-ROBUST) — Sticky/Append + robuste Init + Delegation
   Wünsche umgesetzt:
   - „Speisen“: Info „Super Wahl 👍 …“ + Delay (500 ms), dann PDF-Link + Kategorien
   - Ab „Speisen“: NICHT mehr zentriert (nur Start/Home zentriert)
   - Buttons kompakter; Farben wie Screenshot 2
   - Nav („Zurück | Reservieren | Fertig“) in EINER Reihe (links)
   Robustheit:
   - Entfernt alte Styles; injiziert eigene mit höherer Spezifität (.ppx-v5)
   - Wartet auf DOM + nutzt MutationObserver
   - Zusätzlich: Delegierter Click-Listener (falls Direktbindung nicht greift)
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
  var STICKY = true;

  // ---------------------------------------------------------------------------
  // STYLE: Farben/Layout wie gewünscht, nur HOME zentriert, ab Speisen links
  // Entfernt alte Bot-Styles & injiziert neu mit höherer Spezifität (.ppx-v5)
  // ---------------------------------------------------------------------------
  (function injectStyles(){
    [
      'ppx-style-100w','ppx-style-100w-v2','ppx-style-100w-v3','ppx-style-100w-v4',
      'ppx-style-v5','ppx-style-v5-override','ppx-style-v6'
    ].forEach(function(id){
      var old = document.getElementById(id);
      if (old && old.parentNode) old.parentNode.removeChild(old);
    });

    var css = `
:root{
  --ppx-green-900:#0e312a; --ppx-green-800:#114136; --ppx-green-700:#154a3e;
  --ppx-green-600:#195446; --ppx-green-500:#1e5e4e;
  --ppx-ink:#f1f7f4; --ppx-gold:#e6c48a; --ppx-gold-ink:#2a2a1f;
  --ppx-border:rgba(255,255,255,.08); --ppx-shadow:0 8px 22px rgba(0,0,0,.28);
}

/* Viewport */
#ppx-panel.ppx-v5 #ppx-v{
  overflow-y:auto; max-height:calc(100vh - 120px); -webkit-overflow-scrolling:touch;
  padding:8px 8px 16px;
}

/* Cards (Blocks) */
#ppx-panel.ppx-v5 #ppx-v .ppx-bot{
  background:linear-gradient(180deg, rgba(9,39,33,.55), rgba(9,39,33,.35));
  border:1px solid var(--ppx-border); border-radius:16px;
  padding:18px; margin:16px auto; max-width:680px; box-shadow:var(--ppx-shadow);
  text-align:left !important; /* Standard: LINKS */
}
#ppx-panel.ppx-v5 #ppx-v .ppx-bot[data-block="home"]{
  text-align:center !important; /* Nur Home zentriert */
}

/* Headline im Block */
#ppx-panel.ppx-v5 #ppx-v .ppx-h{
  background:var(--ppx-green-800); color:var(--ppx-ink);
  border:1px solid var(--ppx-border); border-radius:12px;
  padding:14px 16px; margin:-6px -6px 14px;
  font-family:"Cinzel", serif; font-weight:600; letter-spacing:.02em; text-transform:uppercase;
}

/* Fließtext */
#ppx-panel.ppx-v5 #ppx-v .ppx-m{
  color:var(--ppx-ink); line-height:1.55; margin:8px 0 12px;
  font-family:"Cormorant Garamond", serif; font-weight:400; font-size:20px;
}

/* Reihen/Grids */
#ppx-panel.ppx-v5 #ppx-v .ppx-row{
  display:flex; flex-wrap:wrap; gap:12px; justify-content:flex-start !important;
  margin-top:10px; width:100%;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-bot[data-block="home"] .ppx-row{
  justify-content:center !important; /* Home-Reihen zentriert */
}
#ppx-panel.ppx-v5 #ppx-v .ppx-grid{
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:10px; width:100%;
}
@media (max-width:560px){
  #ppx-panel.ppx-v5 #ppx-v .ppx-grid{ grid-template-columns:1fr; }
}

/* Buttons & Chips – standardmäßig LINKS ausgerichtet, kompakter */
#ppx-panel.ppx-v5 #ppx-v .ppx-b,
#ppx-panel.ppx-v5 #ppx-v .ppx-chip{
  -webkit-appearance:none; appearance:none; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:flex-start !important; gap:10px;
  width:100% !important; /* volle Zeile */
  color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:16px;
  padding:12px 16px !important; /* kompakter */
  background:var(--ppx-green-600); box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 3px 12px rgba(0,0,0,.25);
  transition:transform .06s ease, filter .2s ease;
  font-family:"Cormorant Garamond", serif; font-weight:400 !important; font-size:18px !important; /* kleiner */
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-cta{ background:var(--ppx-green-500); }
#ppx-panel.ppx-v5 #ppx-v .ppx-chip{ background:var(--ppx-green-700); }

/* Home-Block: Buttons zentriert & etwas größer */
#ppx-panel.ppx-v5 #ppx-v .ppx-bot[data-block="home"] .ppx-b,
#ppx-panel.ppx-v5 #ppx-v .ppx-bot[data-block="home"] .ppx-chip{
  justify-content:center !important; font-size:20px !important; padding:14px 18px !important;
}

/* Icon-Badges via data-ic */
#ppx-panel.ppx-v5 #ppx-v .ppx-b[data-ic]::before,
#ppx-panel.ppx-v5 #ppx-v .ppx-chip[data-ic]::before{
  content:attr(data-ic); display:inline-flex; align-items:center; justify-content:center;
  width:28px; height:28px; min-width:28px; border-radius:999px;
  background:var(--ppx-gold); color:var(--ppx-gold-ink); font-size:16px; line-height:1;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.08), 0 1.5px 0 rgba(255,255,255,.25) inset;
}

/* Nav-Reihe: drei Buttons nebeneinander, links ausgerichtet */
#ppx-panel.ppx-v5 #ppx-v .ppx-nav{
  display:flex; gap:12px; width:100%; justify-content:flex-start !important; margin-top:12px;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-nav .ppx-b{ width:auto !important; }

/* Links */
#ppx-panel.ppx-v5 #ppx-v .ppx-link{
  color:var(--ppx-ink); text-decoration:underline; text-underline-offset:2px;
}

/* Speisen: explizit einspaltig für Kategorien & Items */
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-grid,
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"]  .ppx-grid{
  grid-template-columns:1fr !important;
}
`;
    var tag = document.createElement('style');
    tag.id = 'ppx-style-v6';
    tag.textContent = css;
    document.head.appendChild(tag);
  })();

  // ---------------------------------------------------------------------------
  // 1) Robuste Init (wartet auf DOM + IDs) + Delegation
  // ---------------------------------------------------------------------------
  var $launch, $panel, $close, $view;
  var BOUND = false;

  function queryDom(){
    $launch = document.getElementById('ppx-launch');
    $panel  = document.getElementById('ppx-panel');
    $close  = document.getElementById('ppx-close');
    $view   = document.getElementById('ppx-v');
    return !!($launch && $panel && $close && $view);
  }

  function openPanel(){
    // frische Refs (falls DOM gewechselt hat)
    if (!$panel || !$view) queryDom();
    if (!$panel || !$view) return;
    $panel.classList.add('ppx-open');
    $panel.classList.add('ppx-v5'); // für Styles
    if (!$panel.dataset.init) {
      $panel.dataset.init = '1';
      stepHome(); // Home einmalig rendern; bleibt stehen
    }
  }

  function closePanel(){
    if (!$panel) queryDom();
    if ($panel) $panel.classList.remove('ppx-open');
  }

  function bindOnce(){
    if (BOUND) return true;
    if (!queryDom()) return false;

    // Panel-Klasse für CSS-Overrides
    $panel.classList.add('ppx-v5');

    // Öffnen/Schließen (direkte Listener)
    $launch.addEventListener('click', openPanel);
    $close.addEventListener('click', closePanel);

    // ESC schließt
    window.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closePanel();
    });

    // Overlay-Klick schließt nur, wenn direkt auf Panel (nicht auf Inhalt)
    $panel.addEventListener('click', function(ev){
      if (ev.target === $panel) closePanel();
    });

    // Falls durch CSS bereits offen, trotzdem einmal Home rendern (ohne Clear)
    if ($panel.classList.contains('ppx-open') && !$panel.dataset.init) {
      $panel.dataset.init = '1';
      stepHome();
    }

    // Delegierter Fallback-Listener: reagiert auch, wenn Direktbindung verpasst wurde
    document.addEventListener('click', function(ev){
      var t = ev.target && ev.target.closest ? ev.target.closest('#ppx-launch') : null;
      if (t) openPanel();
    });

    BOUND = true;
    return true;
  }

  // DOMContentLoaded → erster Versuch
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindOnce, { once:true });
  } else {
    bindOnce(); // DOM ist schon da
  }

  // MutationObserver → falls Elemente nachträglich ins DOM kommen
  if (!BOUND) {
    var mo = new MutationObserver(function(){
      if (bindOnce()) mo.disconnect();
    });
    mo.observe(document.documentElement || document.body, { childList:true, subtree:true });
    // Fallback: nach 5s observer stoppen
    setTimeout(function(){ try{ mo.disconnect(); }catch(e){} }, 5000);
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
    catch(e){ if ($view) $view.scrollTop = $view.scrollHeight; }
  }

  // NIE auto-clearen (außer gezwungen)
  function clearView(opts){
    if (!STICKY) $view.innerHTML = '';
    else if (opts && opts.force) $view.innerHTML = '';
  }

  function line(txt){ return el('div', { class:'ppx-m' }, txt); }
  function row(){ return el('div', { class:'ppx-row' }); }
  function grid(){ return el('div', { class:'ppx-grid' }); }

  // Buttons/Chips mit data-ic
  function btn(label, onClick, extraCls, ic){
    var attrs = { class: 'ppx-b ' + (extraCls||''), onclick: onClick, type:'button' };
    if (ic) attrs['data-ic'] = ic;
    return el('button', attrs, label);
  }
  function chip(label, onClick, extraCls, ic){
    var attrs = { class: 'ppx-chip ' + (extraCls||''), onclick: onClick, type:'button' };
    if (ic) attrs['data-ic'] = ic;
    return el('button', attrs, label);
  }

  // Neuer Block (Card) anhängen
  function block(title, opts){
    opts = opts || {};
    var wrap = el('div', {
      class: 'ppx-bot ppx-appear',
      style: { maxWidth: (opts.maxWidth || '680px'), margin: '16px auto' }
    });
    if (title) wrap.appendChild(el('div', { class:'ppx-h' }, title));
    if ($view) $view.appendChild(wrap);
    scrollToEl(wrap);
    return wrap;
  }

  // horizontale Button-Gruppe (Nav-Row, links)
  function nav(btns){
    var r = el('div', { class:'ppx-nav' });
    btns.forEach(function(b){ if (b) r.appendChild(b); });
    return r;
  }

  // Nav-Shortcuts
  function backBtn(to){
    return btn('Zurück', function(){
      if (to && to.scrollIntoView) scrollToEl(to);
      else scrollToEl($view && $view.firstElementChild || $view);
    }, '', '←');
  }
  function doneBtn(){
    return btn('Fertig ✓', function(){ scrollToEl($view && $view.lastElementChild || $view); }, '', '✓');
  }
  function resBtn(prev){
    return btn('Reservieren', function(){ stepReservieren(prev); }, '', '📅');
  }

  // ---------------------------------------------------------------------------
  // 3) HOME (einmalig rendern; bleibt zentriert)
  // ---------------------------------------------------------------------------
  function stepHome(){
    if (!$view) return;
    if ($view.querySelector('[data-block="home"]')) return;

    var brand = (CFG.brand || 'Pizza Papa Hamburg');
    var B = block(brand.toUpperCase());
    B.setAttribute('data-block','home');

    B.appendChild(line('👋 WILLKOMMEN BEI '+brand.toUpperCase()+'!'));
    B.appendChild(line('Schön, dass du da bist. Wie können wir dir heute helfen?'));

    var r1 = row(); r1.appendChild(btn('Speisen',       function(){ stepSpeisen(B); }, 'ppx-cta', '🍽️')); B.appendChild(r1);
    var r2 = row(); r2.appendChild(btn('Reservieren',   function(){ stepReservieren(B); }, '', '📅'));     B.appendChild(r2);
    var r3 = row(); r3.appendChild(btn('Öffnungszeiten',function(){ stepHours(B); }, '', '⏰'));          B.appendChild(r3);
    var r4 = row(); r4.appendChild(btn('Kontaktdaten',  function(){ stepKontakt(B); }, '', '☎️'));        B.appendChild(r4);
    var r5 = row(); r5.appendChild(btn('Q&As',          function(){ stepQAs(B); }, '', '❓'));             B.appendChild(r5);
  }
