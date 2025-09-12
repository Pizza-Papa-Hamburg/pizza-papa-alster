/* ============================================================================
   PPX Widget (v6 COMPACT + UX-Update)
   Änderungen: 600ms Delay, 2-Zeilen-Clamp, Links-Ausrichtung in Speisen,
               „Reservieren“-Button aus Nav entfernt (Frage im Text),
               „Zurück“/„Hauptmenü“ gleich breit,
               Hauptmenü-Reset fix (echter Neustart)
   ============================================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 0) Daten & Setup
  // ---------------------------------------------------------------------------
  var W = window;
  var DATA = W.__PPX_DATA__ || {};
  var CFG = DATA.cfg || {};
  var DISH = DATA.dishes || {};
  var FAQ = DATA.faqs || [];
  var STICKY = true; // Append-Mode

  // Optional: EmailJS init
  (function () {
    try {
      if (W.emailjs && CFG.EMAIL && CFG.EMAIL.publicKey) {
        W.emailjs.init({ publicKey: CFG.EMAIL.publicKey });
      }
    } catch (e) {}
  })();

  // ---------------------------------------------------------------------------
  // STYLE – kompakter Look + spezielle Anpassungen
  // ---------------------------------------------------------------------------
  (function () {
    [
      'ppx-style-100w','ppx-style-100w-v2','ppx-style-100w-v3','ppx-style-100w-v4',
      'ppx-style-v5','ppx-style-v5-override','ppx-style-v6'
    ].forEach(function(id){ var n=document.getElementById(id); if(n) n.remove(); });

    var css = `
:root{
  --ppx-green-850:#0f3b33; --ppx-green-800:#114136; --ppx-green-700:#154a3e;
  --ppx-green-650:#1a5044; --ppx-green-600:#195446;
  --ppx-ink:#f1f7f4; --ppx-gold:#e6c48a; --ppx-gold-ink:#2a2a1f;
  --ppx-border:rgba(255,255,255,.10); --ppx-shadow:0 4px 12px rgba(0,0,0,.20);
}

/* Viewport */
#ppx-panel.ppx-v5 #ppx-v{
  overflow-y:auto; max-height:calc(100vh - 120px); -webkit-overflow-scrolling:touch;
  padding:10px 10px 16px;
}

/* Bot-Blocks */
#ppx-panel.ppx-v5 #ppx-v .ppx-bot{
  background:linear-gradient(180deg, rgba(14,59,51,.45), rgba(14,59,51,.30));
  border:1px solid var(--ppx-border); border-radius:14px;
  padding:14px; margin:12px auto; max-width:640px; box-shadow:var(--ppx-shadow);
  text-align:left !important;
}

/* Home-Block: volle Breite */
#ppx-panel.ppx-v5 #ppx-v [data-block="home"]{
  background:transparent !important; border:none !important; box-shadow:none !important;
  padding:0 !important; max-width:100% !important; margin-left:0 !important; margin-right:0 !important;
  text-align:center !important;
}

/* Speisen-Root: volle Breite */
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"]{
  background:transparent !important; border:none !important; box-shadow:none !important;
  padding:0 !important; max-width:100% !important; margin-left:0 !important; margin-right:0 !important;
}

/* Headline */
#ppx-panel.ppx-v5 #ppx-v .ppx-h{
  background:var(--ppx-green-800); color:var(--ppx-ink);
  border:1px solid var(--ppx-border); border-radius:12px;
  padding:10px 12px; margin:-2px -2px 10px;
  font-family:"Cinzel", serif; font-weight:600; letter-spacing:.02em; text-transform:uppercase;
  font-size:18px;
}

/* Fließtext */
#ppx-panel.ppx-v5 #ppx-v .ppx-m{
  color:var(--ppx-ink); line-height:1.5; margin:6px 0 10px;
  font-family:"Cormorant Garamond", serif; font-weight:400; font-size:18px;
}

/* Reihen/Grids */
#ppx-panel.ppx-v5 #ppx-v .ppx-row{ display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-start !important; margin-top:8px; width:100%; }
#ppx-panel.ppx-v5 #ppx-v .ppx-grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:8px; width:100%; }

/* Buttons & Chips */
#ppx-panel.ppx-v5 #ppx-v .ppx-b,
#ppx-panel.ppx-v5 #ppx-v .ppx-chip{
  -webkit-appearance:none; appearance:none; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:flex-start !important; gap:10px;
  width:100% !important; text-align:left;
  color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:14px;
  padding:10px 14px !important; background:var(--ppx-green-650);
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 2px 8px rgba(0,0,0,.20);
  transition:transform .06s ease, filter .2s ease, box-shadow .2s ease, background .2s ease;
  font-family:"Cormorant Garamond", serif; font-weight:400 !important; font-size:17px !important;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-cta{ background:var(--ppx-green-600); }
#ppx-panel.ppx-v5 #ppx-v .ppx-chip{ background:var(--ppx-green-700); }

/* Selected-State */
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-selected,
#ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-selected{
  filter: brightness(1.10);
  box-shadow: 0 0 0 2px rgba(230,196,138,.55) inset, 0 2px 8px rgba(0,0,0,.26);
}

/* Home größer (nur Home) */
#ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-b,
#ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-chip{
  justify-content:center !important; font-size:18.5px !important; padding:12px 16px !important;
}

/* Kategorie-Icons */
#ppx-panel.ppx-v5 #ppx-v .ppx-b[data-ic]::before,
#ppx-panel.ppx-v5 #ppx-v .ppx-chip[data-ic]::before{
  content:attr(data-ic); display:inline-flex; align-items:center; justify-content:center;
  width:26px; height:26px; min-width:26px; border-radius:999px;
  background:var(--ppx-gold); color:var(--ppx-gold-ink); font-size:15px; line-height:1;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.22) inset;
}
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-chip.ppx-cat::before{
  width:34px; height:34px; min-width:34px; background:#E9D18B; color:#111; font-size:18px;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.18), 0 1px 0 rgba(0,0,0,.18);
}

/* 2 Spalten in Speisen */
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-grid{ grid-template-columns:1fr 1fr !important; }
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"]  .ppx-grid{ grid-template-columns:1fr 1fr !important; }

/* Einheitliche Kachel + 2-Zeilen-Clamp */
#ppx-panel.ppx-v5 #ppx-v .ppx-b .ppx-label,
#ppx-panel.ppx-v5 #ppx-v .ppx-chip .ppx-label{
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  overflow:hidden; text-overflow:ellipsis; line-height:1.25; text-align:left;
}
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-chip,
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"] .ppx-chip{
  min-height:64px; align-items:center;
}

/* >>> Links-Ausrichtung erzwingen in Speisen (Kat + Items) <<< */
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-b,
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-chip,
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"] .ppx-b,
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"] .ppx-chip{
  justify-content:flex-start !important; text-align:left !important;
}
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-label,
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"] .ppx-label{
  text-align:left !important;
}

@media (max-width:380px){
  #ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-grid{ grid-template-columns:1fr 1fr !important; }
  #ppx-panel.ppx-v5 #ppx-v [data-block="speisen-cat"]  .ppx-grid{ grid-template-columns:1fr 1fr !important; }
}

/* Nav: gleich breite Buttons */
#ppx-panel.ppx-v5 #ppx-v .ppx-nav{ display:flex; gap:10px; width:100%; justify-content:flex-start !important; margin-top:10px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-nav .ppx-b{ flex:1 1 0; }

/* Links */
#ppx-panel.ppx-v5 #ppx-v .ppx-link{ color:var(--ppx-ink); text-decoration:underline; text-underline-offset:2px; }
`;
    var tag = document.createElement('style'); tag.id = 'ppx-style-v6'; tag.textContent = css; document.head.appendChild(tag);
  })();

  // ---------------------------------------------------------------------------
  // 1) Robuste Init
  // ---------------------------------------------------------------------------
  var $launch, $panel, $close, $view;
  var BOUND = false;

  function queryDom(){
    $launch=document.getElementById('ppx-launch');
    $panel=document.getElementById('ppx-panel');
    $close=document.getElementById('ppx-close');
    $view=document.getElementById('ppx-v');
    return !!($launch&&$panel&&$close&&$view);
  }
  function openPanel(){
    if(!queryDom())return;
    $panel.classList.add('ppx-open','ppx-v5');
    if(!$panel.dataset.init){ $panel.dataset.init='1'; stepHome(); }
  }
  function closePanel(){ if(!queryDom())return; $panel.classList.remove('ppx-open'); }

  function bindOnce(){
    if(BOUND) return true;
    if(!queryDom()) return false;
    $panel.classList.add('ppx-v5');
    $launch.addEventListener('click', openPanel);
    $close.addEventListener('click', closePanel);
    window.addEventListener('keydown', function(e){ if(e.key==='Escape') closePanel(); });
    $panel.addEventListener('click', function(ev){
      var t=ev.target&&ev.target.closest?ev.target.closest('.ppx-b, .ppx-chip'):null;
      if(t&&$view&&$view.contains(t)){
        t.classList.add('ppx-selected'); jumpBottom();
        setTimeout(jumpBottom,140); setTimeout(jumpBottom,700);
      }
    });
    document.addEventListener('click', function(ev){
      var t=ev.target&&ev.target.closest?ev.target.closest('#ppx-launch'):null;
      if(t) openPanel();
    });
    if($panel.classList.contains('ppx-open') && !$panel.dataset.init){
      $panel.dataset.init='1'; stepHome();
    }
    BOUND=true; return true;
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', bindOnce, {once:true});
  } else { bindOnce(); }
  if(!BOUND){
    var mo=new MutationObserver(function(){ if(bindOnce()) mo.disconnect(); });
    mo.observe(document.documentElement||document.body,{childList:true,subtree:true});
    setTimeout(function(){ try{mo.disconnect();}catch(e){} },5000);
  }

  // ---------------------------------------------------------------------------
  // 2) Utils + globale Back/Home-Logik
  // ---------------------------------------------------------------------------
  function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
  function jumpBottom(){
    if(!$view) return;
    try{ $view.scrollTop=$view.scrollHeight; requestAnimationFrame(function(){ $view.scrollTop=$view.scrollHeight; }); }catch(e){}
  }
  function el(tag, attrs){
    var n=document.createElement(tag); attrs=attrs||{};
    Object.keys(attrs).forEach(function(k){
      if(k==='style'&&isObj(attrs[k])){ Object.assign(n.style,attrs[k]); }
      else if(k==='text'){ n.textContent=attrs[k]; }
      else if(k==='html'){ n.innerHTML=attrs[k]; }
      else if(k.slice(0,2)==='on'&&typeof attrs[k]==='function'){ n.addEventListener(k.slice(2),attrs[k]); }
      else { n.setAttribute(k,attrs[k]); }
    });
    for(var i=2;i<arguments.length;i++){ var c=arguments[i]; if(c==null) continue; n.appendChild(typeof c==='string'?document.createTextNode(c):c); }
    return n;
  }
  function pretty(s){
    return String(s||'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim()
      .replace(/\b\w/g,function(c){ return c.toUpperCase(); });
  }
  function block(title,opts){
    opts=opts||{};
    var wrap=el('div',{class:'ppx-bot ppx-appear',style:{maxWidth:(opts.maxWidth||'640px'),margin:'12px auto'}});
    if(title) wrap.appendChild(el('div',{class:'ppx-h'},title));
    if($view) $view.appendChild(wrap);
    jumpBottom(); return wrap;
  }
  function line(txt){ return el('div',{class:'ppx-m'},txt); }
  function row(){ return el('div',{class:'ppx-row'}); }
  function grid(){ return el('div',{class:'ppx-grid'}); }

  // Scope-Back & Home-Reset
  function getScopeIndex(){ return $view ? $view.children.length : 0; }
  function popToScope(idx){
    if(!$view) return;
    while($view.children.length>idx){
      var last=$view.lastElementChild; if(!last) break; last.remove();
    }
    jumpBottom();
  }

  // Buttons/Chips (mit <span class="ppx-label"> für 2-Zeilen-Clamp)
  function btn(label, onClick, extraCls, ic){
    var attrs={class:'ppx-b '+(extraCls||''),onclick:onClick,type:'button'}; if(ic) attrs['data-ic']=ic;
    var n=el('button',attrs); n.appendChild(el('span',{class:'ppx-label'},label)); return n;
  }
  function chip(label, onClick, extraCls, ic){
    var attrs={class:'ppx-chip '+(extraCls||''),onclick:onClick,type:'button'}; if(ic) attrs['data-ic']=ic;
    var n=el('button',attrs); n.appendChild(el('span',{class:'ppx-label'},label)); return n;
  }

  function nav(btns){ var r=el('div',{class:'ppx-nav'}); btns.forEach(function(b){ if(b) r.appendChild(b); }); return r; }
  function backBtnAt(scopeIdx){ return btn('← Zurück', function(){ popToScope(scopeIdx); }); }

  // Echter Home-Reset (fix für deinen Punkt 4)
  function stepHome(force){
    if (!force && $view && $view.querySelector('[data-block="home"]')) return;
    var brand=(CFG.brand||'Pizza Papa Hamburg');
    var B=block(brand.toUpperCase()); B.setAttribute('data-block','home');
    B.appendChild(line('👋 WILLKOMMEN BEI '+brand.toUpperCase()+'!'));
    B.appendChild(line('Schön, dass du da bist. Wie können wir dir heute helfen?'));
    var r1=row(); r1.appendChild(btn('Speisen',function(){ stepSpeisen(); },'ppx-cta','🍽️')); B.appendChild(r1);
    var r2=row(); r2.appendChild(btn('Reservieren',function(){ stepReservieren(); },'','📅')); B.appendChild(r2);
    var r3=row(); r3.appendChild(btn('Öffnungszeiten',function(){ stepHours(); },'','⏰')); B.appendChild(r3);
    var r4=row(); r4.appendChild(btn('Kontaktdaten',function(){ stepKontakt(); },'','☎️')); B.appendChild(r4);
    var r5=row(); r5.appendChild(btn('Q&As',function(){ stepQAs(); },'','❓')); B.appendChild(r5);
  }
  function goHome(){ popToScope(0); stepHome(true); }
  function homeBtn(){ return btn('Zurück ins Hauptmenü', goHome, '', '🏠'); }
  function doneBtn(){ return btn('Fertig ✓', function(){ var B=block(null); B.appendChild(line('Danke dir bis zum nächsten Mal! 👋')); jumpBottom(); setTimeout(closePanel,1100); }); }
  // resBtn entfernt aus Navs (Frage erfolgt im Text)
  // ---------------------------------------------------------------------------
  // 4) SPEISEN
  // ---------------------------------------------------------------------------
  function stepSpeisen(){
    var scopeIdx = getScopeIndex(); // Zustand VOR Info
    var M = block(null);
    M.setAttribute('data-block','speisen-info');
    M.appendChild(line('Super Wahl 👍  Hier sind unsere Speisen-Kategorien:'));
    jumpBottom();
    // Delay bis die Kategorien erscheinen (600 ms)
    setTimeout(function(){ renderSpeisenRoot(scopeIdx); jumpBottom(); }, 600);
  }

  function orderCats(keys){
    var pref = ['Antipasti','Salate','Pizza','Pasta','Desserts','Getränke'];
    var pos  = Object.create(null);
    pref.forEach(function(k,i){ pos[k]=i; });
    return keys.slice().sort(function(a,b){
      var ia = (a in pos)? pos[a] : 999;
      var ib = (b in pos)? pos[b] : 999;
      return ia-ib || a.localeCompare(b);
    });
  }

  function renderSpeisenRoot(scopeIdx){
    var B = block('SPEISEN');
    B.setAttribute('data-block','speisen-root');

    // --- PDF Button (immer anzeigen) ---
    var pdfUrl = CFG.menuPdf ||
                 (CFG.pdf && (CFG.pdf.menu || CFG.pdf.url)) ||
                 CFG.menuPDF ||
                 'speisekarte.pdf';
    var r = row();
    r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Speisekarte als PDF', function(){
      try{ window.open(pdfUrl, '_blank', 'noopener'); }catch(e){}
    }, '', '📄'));
    B.appendChild(r);

    B.appendChild(line('…oder wähle eine Kategorie:'));

    var cats = Object.keys(DISH);
    cats = cats.length ? orderCats(cats.map(function(k){ return pretty(k); })) :
                         ['Antipasti','Salate','Pizza','Pasta','Desserts','Getränke'];

    // Map zurück auf Original-Keys (lowercase) falls nötig
    var map = {};
    Object.keys(DISH).forEach(function(k){ map[pretty(k)] = k; });

    var G = grid(); // 2 Spalten
    cats.forEach(function(catPretty){
      var rawKey = map[catPretty] || catPretty.toLowerCase();
      G.appendChild(
        chip(catPretty, function(){ renderCategory(rawKey); }, 'ppx-cat', '►')
      );
    });
    B.appendChild(G);

    // Nav: Zurück + Hauptmenü (kein Reservieren-Button)
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

  function renderCategory(catKey){
    var scopeIdx = getScopeIndex();
    var title = 'Gern! Hier ist die Auswahl für '+pretty(catKey)+':';
    var B = block(title);
    B.setAttribute('data-block','speisen-cat');

    var list = Array.isArray(DISH[catKey]) ? DISH[catKey] : [];
    if (!list.length) {
      list = [
        { name: pretty(catKey)+' Classic', price:'9,50 €' },
        { name: pretty(catKey)+' Special', price:'12,90 €' }
      ];
    }

    // --- 2-Spalten-Liste mit gleichmäßigen Kacheln (ohne Preis hier) ---
    var L = grid();
    list.forEach(function(it){
      var label = (it && it.name) ? it.name : 'Artikel';
      L.appendChild(
        chip(label, function(){ renderItem(catKey, it); }, '', '➜')
      );
    });
    B.appendChild(L);

    // Nav: Zurück + Hauptmenü
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

  function renderItem(catKey, item){
    var scopeIdx = getScopeIndex();
    var title = (item && item.name) ? item.name : pretty(catKey);
    var B = block(title);
    B.setAttribute('data-block','speisen-item');

    // Beschreibung
    if (item && (item.info || item.desc)) {
      B.appendChild(line(item.info || item.desc));
    }

    // Preis (als String, kein doppeltes "€")
    if (item && item.price){
      var p = String(item.price);
      B.appendChild(line('Preis: ' + p));
    }

    // Hinweis
    if (item && item.hinweis){
      B.appendChild(line('ℹ️ ' + item.hinweis));
    }

    // KEIN Reservieren-Button hier. Stattdessen nach 600ms die Frage einblenden.
    setTimeout(function(){ askReserveAfterItem(scopeIdx); }, 600);

    jumpBottom();
  }

  function askReserveAfterItem(scopeIdx){
    var Q = block(null);
    Q.setAttribute('data-block','speisen-item-ask');
    Q.appendChild(line('Na, Appetit bekommen? 😍 Soll ich dir gleich einen Tisch reservieren, damit du das bald probieren kannst?'));

    // Primär/sekundär-CTAs
    var r = row();
    r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '✅'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, '', '↩️'));
    Q.appendChild(r);

    // Zusätzlich „← Zurück“ (zur vorherigen Liste) + „Hauptmenü“ gleich breit
    Q.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }
  // ---------------------------------------------------------------------------
  // 5) RESERVIEREN
  // ---------------------------------------------------------------------------
  function stepReservieren(){
    var scopeIdx = getScopeIndex();
    var B = block('RESERVIEREN');
    B.setAttribute('data-block','reservieren');

    B.appendChild(line('Schnell-Anfrage senden oder E-Mail öffnen:'));

    var r = row();
    r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Schnell senden', function(){ quickEmail(); }, 'ppx-cta', '⚡'));

    var addr = CFG.email ||
               (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) ||
               'info@example.com';

    r.appendChild(btn('E-Mail öffnen', function(){ openEmailDraft(addr); }, '', '✉️'));
    B.appendChild(r);

    // Nav: Zurück + Hauptmenü
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

  function openEmailDraft(addr){
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
    window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;

    // Nach dem Öffnen des E-Mail-Clients Bestätigung zeigen
    showReservationSuccess('mailto');
  }

  function quickEmail(){
    var name = prompt('Dein Name:');                            if (!name) return;
    var when = prompt('Datum & Uhrzeit (z. B. 24.09. 19:00):'); if (!when) return;
    var ppl  = prompt('Personenanzahl:');                       if (!ppl) return;
    var tel  = prompt('Telefon (optional):') || '';

    var payload = { name:name, when:when, persons:ppl, phone:tel, brand:(CFG.brand||'Restaurant') };

    // EmailJS tolerant: serviceId|service, templateId|toTemplate
    var svcId = CFG.EMAIL && (CFG.EMAIL.serviceId || CFG.EMAIL.service);
    var tplId = CFG.EMAIL && (CFG.EMAIL.templateId || CFG.EMAIL.toTemplate);

    if (window.emailjs && svcId && tplId) {
      emailjs.send(svcId, tplId, payload).then(
        function(){ showReservationSuccess('emailjs'); },
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
    window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
    showReservationSuccess('mailto');
  }

  function showReservationSuccess(kind){
    var B = block('RESERVIERUNG');
    B.setAttribute('data-block','reservieren-success');

    if (kind === 'emailjs') {
      B.appendChild(line('Danke! Deine Reservierungsanfrage wurde gesendet. Wir melden uns asap. ✅'));
    } else {
      B.appendChild(line('Hast du die E-Mail versendet? Falls ja, kannst du hier abschließen. ✉️'));
    }

    // Nur hier „Fertig ✓“ erlauben
    B.appendChild(nav([ homeBtn(), doneBtn() ]));
    jumpBottom();
  }

  // ---------------------------------------------------------------------------
  // 6) ÖFFNUNGSZEITEN
  // ---------------------------------------------------------------------------
  function stepHours(){
    var scopeIdx = getScopeIndex();
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
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

  // ---------------------------------------------------------------------------
  // 7) KONTAKT
  // ---------------------------------------------------------------------------
  function stepKontakt(){
    var scopeIdx = getScopeIndex();
    var B = block('KONTAKTDATEN');
    B.setAttribute('data-block','kontakt');

    if (CFG.phone) {
      B.appendChild(line('📞 '+CFG.phone));
      var r1 = row(); r1.style.justifyContent = 'flex-start';
      r1.appendChild(btn('Anrufen', function(){
        window.location.href='tel:'+String(CFG.phone).replace(/\s+/g,'');
      }, '', '📞'));
      B.appendChild(r1);
    }
    if (CFG.email) {
      B.appendChild(line('✉️  '+CFG.email));
      var r2 = row(); r2.style.justifyContent = 'flex-start';
      r2.appendChild(btn('E-Mail schreiben', function(){
        window.location.href='mailto:'+CFG.email;
      }, '', '✉️'));
      B.appendChild(r2);
    }
    if (CFG.address) {
      B.appendChild(line('📍 '+CFG.address));
      var maps = 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(CFG.address);
      var r3 = row(); r3.style.justifyContent = 'flex-start';
      r3.appendChild(btn('Anfahrt öffnen', function(){ window.open(maps, '_blank'); }, '', '🗺️'));
      B.appendChild(r3);
    }

    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

  // ---------------------------------------------------------------------------
  // 8) Q&As
  // ---------------------------------------------------------------------------
  function stepQAs(){
    var scopeIdx = getScopeIndex();
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
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

})(); // Ende IIFE
