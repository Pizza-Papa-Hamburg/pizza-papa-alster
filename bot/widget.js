/* ============================================================================
   PPX Widget (v7 – Reservation Flow)
   - Neuer Reservierungsflow (Name → Datum → Slot 30min → Personen → Phone? → E-Mail)
   - Slots: aus CFG.OPEN (0=So..6=Sa), 30-min, letzte Stunde ausgenommen, mind. 4h Vorlauf
   - EmailJS: 2 Sends (toTemplate an Restaurant, autoReplyTemplate an Gast), Fallback: mailto
   - Bestehende Speisen/FAQ/Öffnungszeiten-Logik bleibt erhalten
   ============================================================================ */
(function () {
  'use strict';

  // 0) Daten & Setup
  var W = window;
  var DATA = W.__PPX_DATA__ || {};
  var CFG  = DATA.cfg || {};
  var DISH = DATA.dishes || {};
  var FAQ  = DATA.faqs  || [];   // Objekt mit {cats:[]} oder Array

  // EmailJS init
  (function () {
    try {
      if (W.emailjs && CFG.EMAIL && CFG.EMAIL.publicKey) {
        W.emailjs.init({ publicKey: CFG.EMAIL.publicKey });
      }
    } catch (e) {}
  })();

  // STYLE (inkl. Q&A-Zentrierung & Reservierungsflow-Hilfen)
  (function () {
    [
      'ppx-style-100w','ppx-style-100w-v2','ppx-style-100w-v3','ppx-style-100w-v4',
      'ppx-style-v5','ppx-style-v5-override','ppx-style-v6','ppx-style-v7'
    ].forEach(function(id){ var n=document.getElementById(id); if(n) n.remove(); });

    var css = `
:root{
  --ppx-green-850:#0f3b33; --ppx-green-800:#114136; --ppx-green-700:#154a3e;
  --ppx-green-650:#1a5044; --ppx-green-600:#195446;
  --ppx-ink:#f1f7f4; --ppx-gold:#e6c48a; --ppx-gold-ink:#2a2a1f;
  --ppx-border:rgba(255,255,255,.10); --ppx-shadow:0 4px 12px rgba(0,0,0,.20);
}
#ppx-panel.ppx-v5 #ppx-v{ overflow-y:auto; max-height:calc(100vh - 120px); -webkit-overflow-scrolling:touch; padding:10px 10px 16px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-bot{ background:linear-gradient(180deg, rgba(14,59,51,.45), rgba(14,59,51,.30)); border:1px solid var(--ppx-border); border-radius:14px; padding:14px; margin:12px auto; max-width:640px; box-shadow:var(--ppx-shadow); text-align:left !important; }
#ppx-panel.ppx-v5 #ppx-v [data-block="home"]{ background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; max-width:100% !important; margin-left:0 !important; margin-right:0 !important; text-align:center !important; }
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"]{ background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; max-width:100% !important; margin-left:0 !important; margin-right:0 !important; }
#ppx-panel.ppx-v5 #ppx-v .ppx-h{ background:var(--ppx-green-800); color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:12px; padding:10px 12px; margin:-2px -2px 10px; font-family:"Cinzel", serif; font-weight:600; letter-spacing:.02em; text-transform:uppercase; font-size:18px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-m{ color:var(--ppx-ink); line-height:1.5; margin:6px 0 10px; font-family:"Cormorant Garamond", serif; font-weight:400; font-size:18px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-row{ display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-start !important; margin-top:8px; width:100%; }
#ppx-panel.ppx-v5 #ppx-v .ppx-grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:8px; width:100%; }
#ppx-panel.ppx-v5 #ppx-v .ppx-b, #ppx-panel.ppx-v5 #ppx-v .ppx-chip{
  -webkit-appearance:none; appearance:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:flex-start !important; gap:10px; width:100% !important; text-align:left;
  color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:14px; padding:10px 14px !important; background:var(--ppx-green-650);
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 2px 8px rgba(0,0,0,.20); transition:transform .06s ease, filter .2s ease, box-shadow .2s ease, background .2s ease;
  font-family:"Cormorant Garamond", serif; font-weight:400 !important; font-size:17px !important;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-cta{ background:var(--ppx-green-600); }
#ppx-panel.ppx-v5 #ppx-v .ppx-chip{ background:var(--ppx-green-700); }
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-secondary, #ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-secondary{
  background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.22); padding:8px 12px !important; font-size:15px !important; box-shadow:none;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-selected, #ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-selected{ filter:brightness(1.10); box-shadow:0 0 0 2px rgba(230,196,138,.55) inset, 0 2px 8px rgba(0,0,0,.26); }
#ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-b, #ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-chip{ justify-content:center !important; font-size:18.5px !important; padding:12px 16px !important; }
#ppx-panel.ppx-v5 #ppx-v .ppx-b[data-ic]::before, #ppx-panel.ppx-v5 #ppx-v .ppx-chip[data-ic]::before{
  content:attr(data-ic); display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; min-width:26px; border-radius:999px; background:var(--ppx-gold); color:var(--ppx-gold-ink); font-size:15px; line-height:1;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.22) inset;
}
/* Cat-Icons größer */
#ppx-panel.ppx-v5 #ppx-v [data-block="speisen-root"] .ppx-chip.ppx-cat::before,
#ppx-panel.ppx-v5 #ppx-v [data-block="faq-root"] .ppx-chip.ppx-cat::before{ width:34px; height:34px; min-width:34px; background:#E9D18B; color:#111; font-size:18px; box-shadow: inset 0 0 0 2px rgba(255,255,255,.18), 0 1px 0 rgba(0,0,0,.18); }
/* Nav gleich breit */
#ppx-panel.ppx-v5 #ppx-v .ppx-nav{ display:flex; gap:10px; width:100%; justify-content:flex-start !important; margin-top:10px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-nav .ppx-b{ flex:1 1 0; }
/* Q&A Header & PDF-Link zentriert */
#ppx-panel.ppx-v5 #ppx-v [data-block="faq-root"] .ppx-h{ text-align:center; }
#ppx-panel.ppx-v5 #ppx-v [data-block="faq-root"] .ppx-center{ display:flex; justify-content:center; }
/* Inputs */
#ppx-panel.ppx-v5 #ppx-v .ppx-input{ display:flex; gap:8px; margin-top:8px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-input input, #ppx-panel.ppx-v5 #ppx-v .ppx-input select, #ppx-panel.ppx-v5 #ppx-v .ppx-input textarea{
  width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.1); color:#fff; font-size:15px; outline:none;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-disabled{ opacity:.45; pointer-events:none; text-decoration:line-through; }
/* Fragen volle Breite */
#ppx-panel.ppx-v5 #ppx-v [data-block="faq-cat"] .ppx-row > .ppx-b{ width:100% !important; }
@media (max-width:380px){
  #ppx-panel.ppx-v5 #ppx-v .ppx-grid{ grid-template-columns:1fr 1fr !important; }
}
`;
    var tag = document.createElement('style'); tag.id = 'ppx-style-v7'; tag.textContent = css; document.head.appendChild(tag);
  })();

  // 1) Init
  var $launch, $panel, $close, $view; var BOUND = false;
  function queryDom(){ $launch=document.getElementById('ppx-launch'); $panel=document.getElementById('ppx-panel'); $close=document.getElementById('ppx-close'); $view=document.getElementById('ppx-v'); return !!($launch&&$panel&&$close&&$view); }
  function openPanel(){ if(!queryDom())return; $panel.classList.add('ppx-open','ppx-v5'); if(!$panel.dataset.init){ $panel.dataset.init='1'; stepHome(); } }
  function closePanel(){ if(!queryDom())return; $panel.classList.remove('ppx-open'); }
  function bindOnce(){
    if(BOUND) return true; if(!queryDom()) return false;
    $panel.classList.add('ppx-v5');
    $launch.addEventListener('click', openPanel);
    $close.addEventListener('click', closePanel);
    window.addEventListener('keydown', function(e){ if(e.key==='Escape') closePanel(); });
    $panel.addEventListener('click', function(ev){
      var t=ev.target&&ev.target.closest?ev.target.closest('.ppx-b, .ppx-chip'):null;
      if(t&&$view&&$view.contains(t)){ t.classList.add('ppx-selected'); jumpBottom(); setTimeout(jumpBottom,140); setTimeout(jumpBottom,700); }
    });
    document.addEventListener('click', function(ev){ var t=ev.target&&ev.target.closest?ev.target.closest('#ppx-launch'):null; if(t) openPanel(); });
    if($panel.classList.contains('ppx-open') && !$panel.dataset.init){ $panel.dataset.init='1'; stepHome(); }
    BOUND=true; return true;
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', bindOnce, {once:true}); } else { bindOnce(); }
  if(!BOUND){ var mo=new MutationObserver(function(){ if(bindOnce()) mo.disconnect(); }); mo.observe(document.documentElement||document.body,{childList:true,subtree:true}); setTimeout(function(){ try{mo.disconnect();}catch(e){} },5000); }

  // 2) Utils
  function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
  function jumpBottom(){ if(!$view) return; try{ $view.scrollTop=$view.scrollHeight; requestAnimationFrame(function(){ $view.scrollTop=$view.scrollHeight; }); }catch(e){} }
  function el(tag, attrs){ var n=document.createElement(tag); attrs=attrs||{}; Object.keys(attrs).forEach(function(k){ if(k==='style'&&isObj(attrs[k])){ Object.assign(n.style,attrs[k]); } else if(k==='text'){ n.textContent=attrs[k]; } else if(k==='html'){ n.innerHTML=attrs[k]; } else if(k.slice(0,2)==='on'&&typeof attrs[k]==='function'){ n.addEventListener(k.slice(2),attrs[k]); } else { n.setAttribute(k, attrs[k]); } }); for(var i=2;i<arguments.length;i++){ var c=arguments[i]; if(c==null) continue; n.appendChild(typeof c==='string'?document.createTextNode(c):c); } return n; }
  function pretty(s){ return String(s||'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,function(c){ return c.toUpperCase(); }); }
  function block(title,opts){ opts=opts||{}; var w=el('div',{class:'ppx-bot ppx-appear',style:{maxWidth:(opts.maxWidth||'640px'),margin:'12px auto'}}); if(title) w.appendChild(el('div',{class:'ppx-h'},title)); if($view) $view.appendChild(w); jumpBottom(); return w; }
  function line(txt){ return el('div',{class:'ppx-m'},txt); }
  function row(){ return el('div',{class:'ppx-row'}); }
  function grid(){ return el('div',{class:'ppx-grid'}); }
  function getScopeIndex(){ return $view ? $view.children.length : 0; }
  function popToScope(idx){ if(!$view) return; while($view.children.length>idx){ var last=$view.lastElementChild; if(!last) break; last.remove(); } jumpBottom(); }

  // Buttons/Chips/Nav
  function btn(label, onClick, extraCls, ic){ var a={class:'ppx-b '+(extraCls||''),onclick:onClick,type:'button'}; if(ic) a['data-ic']=ic; var n=el('button',a); n.appendChild(el('span',{class:'ppx-label'},label)); return n; }
  function chip(label, onClick, extraCls, ic){ var a={class:'ppx-chip '+(extraCls||''),onclick:onClick,type:'button'}; if(ic) a['data-ic']=ic; var n=el('button',a); n.appendChild(el('span',{class:'ppx-label'},label)); return n; }
  function nav(btns){ var r=el('div',{class:'ppx-nav'}); btns.forEach(function(b){ if(b) r.appendChild(b); }); return r; }
  function backBtnAt(scopeIdx){ return btn('← Zurück', function(){ popToScope(scopeIdx); }, 'ppx-secondary'); }

  // Home
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
  function homeBtn(){ return btn('Zurück ins Hauptmenü', goHome, 'ppx-secondary', '🏠'); }
  function doneBtn(){ return btn('Fertig ✓', function(){ var B=block(null); B.appendChild(line('Danke dir bis zum nächsten Mal! 👋')); jumpBottom(); setTimeout(closePanel,1100); }); }
  // 4) SPEISEN
  function stepSpeisen(){
    var scopeIdx = getScopeIndex();
    var M = block(null);
    M.setAttribute('data-block','speisen-info');
    M.appendChild(line('Super Wahl 👍  Hier sind unsere Speisen-Kategorien:'));
    setTimeout(function(){ renderSpeisenRoot(scopeIdx); }, 400);
  }

  function orderCats(keys){
    var pref = Array.isArray(CFG.menuOrder) && CFG.menuOrder.length ? CFG.menuOrder.map(pretty) :
               ['Antipasti','Salate','Pizza','Pasta','Desserts','Getränke'];
    var pos  = Object.create(null);
    pref.forEach(function(k,i){ pos[k]=i; });
    return keys.slice().sort(function(a,b){
      var ia = (a in pos)? pos[a] : 999;
      var ib = (b in pos)? pos[b] : 999;
      return ia-ib || a.localeCompare(b);
    });
  }

  function renderSpeisenRoot(scopeIdx){
    var B = block('SPEISEN'); B.setAttribute('data-block','speisen-root');

    // PDF Button sofort
    var pdfUrl = CFG.menuPdf || (CFG.pdf && (CFG.pdf.menu || CFG.pdf.url)) || CFG.menuPDF || 'speisekarte.pdf';
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Speisekarte als PDF', function(){ try{ window.open(pdfUrl,'_blank','noopener'); }catch(e){} }, '', '📄'));
    B.appendChild(r);

    // Kategorien + Nav erst nach 1.0 s
    setTimeout(function(){
      B.appendChild(line('…oder wähle eine Kategorie:'));

      var cats = Object.keys(DISH);
      cats = cats.length ? orderCats(cats.map(function(k){ return pretty(k); })) :
                           ['Antipasti','Salate','Pizza','Pasta','Desserts','Getränke'];
      var map = {}; Object.keys(DISH).forEach(function(k){ map[pretty(k)] = k; });

      var G = grid();
      cats.forEach(function(catPretty){
        var rawKey = map[catPretty] || catPretty.toLowerCase();
        G.appendChild(chip(catPretty, function(){ renderCategory(rawKey); }, 'ppx-cat', '►'));
      });
      B.appendChild(G);

      // Nav: Zurück + Hauptmenü
      B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
      jumpBottom();
    }, 1000);
  }

  function renderCategory(catKey){
    var scopeIdx = getScopeIndex();
    var B = block('Gern! Hier ist die Auswahl für '+pretty(catKey)+':');
    B.setAttribute('data-block','speisen-cat');

    var list = Array.isArray(DISH[catKey]) ? DISH[catKey] : [];
    if (!list.length) list = [
      { name: pretty(catKey)+' Classic', price:'9,50 €' },
      { name: pretty(catKey)+' Special', price:'12,90 €' }
    ];

    var L = grid();
    list.forEach(function(it){
      var label = (it && it.name) ? it.name : 'Artikel';
      L.appendChild(chip(label, function(){ renderItem(catKey, it); }, '', '➜'));
    });
    B.appendChild(L);

    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    jumpBottom();
  }

  function renderItem(catKey, item){
    var scopeIdx = getScopeIndex();
    var title = (item && item.name) ? item.name : pretty(catKey);
    var B = block(title); B.setAttribute('data-block','speisen-item');

    if (item && (item.info || item.desc)) B.appendChild(line(item.info || item.desc));
    if (item && item.price) B.appendChild(line('Preis: ' + String(item.price)));
    if (item && item.hinweis) B.appendChild(line('ℹ️ ' + item.hinweis));

    // LÄNGERER Delay bis zur Reservierungsfrage (3.0 s)
    setTimeout(function(){ askReserveAfterItem(scopeIdx); }, 3000);
    jumpBottom();
  }

  function askReserveAfterItem(scopeIdx){
    var Q = block(null); Q.setAttribute('data-block','speisen-item-ask');
    Q.appendChild(line('Na, Appetit bekommen? 😍 Soll ich dir gleich einen Tisch reservieren, damit du das bald probieren kannst?'));

    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);

    // Nur „← Zurück“ in der Nav
    Q.appendChild(nav([ backBtnAt(scopeIdx) ]));
    jumpBottom();
  }
  // 5) RESERVIEREN – geführter Flow (Name → Datum → Zeit → Personen → Phone? → E-Mail)
  var RESV = null;

  function stepReservieren(){
    RESV = { name:'', dateISO:'', dateReadable:'', time:'', persons:'', phone:'', email:'' };
    var B = block('RESERVIEREN'); B.setAttribute('data-block','resv-name');
    B.appendChild(line('Du möchtest gerne reservieren?'));
    B.appendChild(line('Darf ich bitte deinen Namen wissen?'));

    var rowIn = row();
    var inp = el('input',{type:'text',placeholder:'Dein Name'});
    rowIn.className = 'ppx-input';
    rowIn.appendChild(inp);
    B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var v = String(inp.value||'').trim();
      if(v.length<2){ alert('Bitte gib einen gültigen Namen ein.'); inp.focus(); return; }
      RESV.name = v;
      renderResvDate();
    }, 'ppx-cta', '➡️'));
    r.appendChild(homeBtn());
    B.appendChild(r);
  }

  // ---- Date → Time
  function todayISO(){
    var d=new Date(); var m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    return d.getFullYear()+'-'+m+'-'+day;
  }
  function parseDateAny(s){
    if(!s) return null;
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)){ var p=s.split('-'); return new Date(Number(p[0]),Number(p[1])-1,Number(p[2])); }
    var m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if(m){ return new Date(Number(m[3]),Number(m[2])-1,Number(m[1])); }
    return null;
  }
  function fmtDateReadable(d){
    var wd=['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()];
    var dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0');
    return wd+', '+dd+'.'+mm+'.';
  }

  function renderResvDate(){
    var scopeIdx = getScopeIndex();
    var B = block('Perfekt, '+RESV.name+'! :)'); B.setAttribute('data-block','resv-date');
    B.appendChild(line('Für welches Datum möchtest du reservieren?'));

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'date', min:todayISO(), placeholder:'TT.MM.JJJJ'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var val = inp.value || '';
      // Einige Browser liefern lokalisiertes Datum; parse fallback
      var d = val ? parseDateAny(val) : null;
      if(!d){ alert('Bitte wähle ein Datum.'); inp.focus(); return; }
      var iso = d.toISOString().slice(0,10);
      RESV.dateISO = iso; RESV.dateReadable = fmtDateReadable(d);
      renderResvTime(d, scopeIdx);
    }, 'ppx-cta', '🗓️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  // ---- Slots
  function hmToMin(s){ var a=s.split(':'); var h=Number(a[0]), m=Number(a[1]||0); if(h===24&&m===0) return 1440; return h*60+m; }
  function minToHM(n){ var h=Math.floor(n/60), m=n%60; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); }

  function buildSlotsForDate(d){
    var wd = d.getDay(); // 0=So..6=Sa
    var span = (CFG.OPEN && CFG.OPEN[String(wd)]) || null;
    if(!span || !Array.isArray(span) || span.length<2) return [];
    var openMin = hmToMin(span[0]);
    var closeMin = hmToMin(span[1]);
    if(closeMin - openMin < 90) return []; // weniger als 1.5h → praktisch zu
    var lastStart = closeMin - 60; // letzte Stunde ausgenommen
    var slots = [];
    for(var t=openMin; t<=lastStart; t+=30){ slots.push(minToHM(t)); }

    // Lead-Time 4h nur für HEUTE
    var now = new Date();
    var isToday = now.getFullYear()===d.getFullYear() && now.getMonth()===d.getMonth() && now.getDate()===d.getDate();
    if(isToday){
      var lead = (now.getHours()*60 + now.getMinutes()) + 240; // +4h
      slots = slots.filter(function(hm){ return hmToMin(hm) >= lead; });
    }
    return slots;
  }

  function renderResvTime(dateObj, backScopeIdx){
    var B = block('Um welche Uhrzeit möchtest du reservieren?'); B.setAttribute('data-block','resv-time');

    var slots = buildSlotsForDate(dateObj);

    if(!slots.length){
      B.appendChild(line('Für dieses Datum sind aktuell keine Reservierungszeiten verfügbar (geschlossen oder zu kurzfristig).'));
      B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
      return;
    }

    var G = grid();
    slots.forEach(function(hm){
      G.appendChild(chip(hm, function(){
        RESV.time = hm;
        renderResvPersons();
      }, '', '🕒'));
    });
    B.appendChild(G);
    B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
  }

  // ---- Persons
  function renderResvPersons(){
    var scopeIdx = getScopeIndex();
    var B = block('Super, '+RESV.name+'!'); B.setAttribute('data-block','resv-persons');
    B.appendChild(line('Für wie viele Personen darf ich den Tisch vorbereiten?'));

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'number', min:'1', max:'20', value:'2'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var val = Number(inp.value||0);
      if(!val || val<1){ alert('Bitte gib eine gültige Anzahl ein.'); inp.focus(); return; }
      RESV.persons = String(val);
      renderResvPhone(scopeIdx);
    }, 'ppx-cta', '➡️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  // ---- Phone (optional)
  function renderResvPhone(backScopeIdx){
    var B = block('Magst du mir deine Nummer dalassen? (optional)'); B.setAttribute('data-block','resv-phone');

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'tel',placeholder:'+49 …'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Überspringen', function(){ RESV.phone=''; renderResvEmail(); }, 'ppx-secondary', '⏭️'));
    r.appendChild(btn('Weiter', function(){ RESV.phone = String(inp.value||'').trim(); renderResvEmail(); }, 'ppx-cta', '➡️'));
    B.appendChild(r);
    B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
  }

  // ---- Email (required)
  function isValidEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s||'').trim()); }

  function renderResvEmail(){
    var scopeIdx = getScopeIndex();
    var B = block('Und deine E-Mail für die Bestätigung?'); B.setAttribute('data-block','resv-email');

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'email',placeholder:'dein.name@example.com'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Anfrage senden', function(){
      var v = String(inp.value||'').trim();
      if(!isValidEmail(v)){ alert('Bitte gib eine gültige E-Mail-Adresse ein.'); inp.focus(); return; }
      RESV.email = v;
      submitReservation();
    }, 'ppx-cta', '✉️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  // ---- Submit via EmailJS (+ Fallback mailto)
  function submitReservation(){
    var brand = (CFG.brand||'Restaurant');
    var payload = {
      brand: brand,
      name: RESV.name,
      date_iso: RESV.dateISO,
      date_readable: RESV.dateReadable + ' ' + RESV.time + ' Uhr',
      time: RESV.time,
      persons: RESV.persons,
      phone: RESV.phone||'',
      email: RESV.email
    };

    var svcId = CFG.EMAIL && (CFG.EMAIL.service || CFG.EMAIL.serviceId);
    var tplTo = CFG.EMAIL && (CFG.EMAIL.toTemplate || CFG.EMAIL.templateId);
    var tplAuto = CFG.EMAIL && CFG.EMAIL.autoReplyTemplate;

    if (window.emailjs && svcId && tplTo){
      emailjs.send(svcId, tplTo, payload).then(function(){
        if (tplAuto){ return emailjs.send(svcId, tplAuto, payload).catch(function(){ /* ignore */ }); }
      }).then(function(){
        showReservationSuccess('emailjs');
      }).catch(function(){
        fallbackMailto(payload);
        showReservationSuccess('mailto');
      });
      return;
    }

    fallbackMailto(payload);
    showReservationSuccess('mailto');
  }

  function fallbackMailto(p){
    var addr = CFG.email || (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) || 'info@example.com';
    var body = [
      'Reservierungsanfrage',
      'Name: '+p.name,
      'Datum: '+p.date_readable,
      'Personen: '+p.persons,
      'Telefon: '+(p.phone||'-'),
      'E-Mail: '+p.email,
      '— gesendet via Bot'
    ].join('%0A');
    try{ window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body; }catch(e){}
  }

  function showReservationSuccess(kind){
    var B = block('RESERVIERUNG'); B.setAttribute('data-block','reservieren-success');
    B.appendChild(line('Danke für deine Anfrage! Schau doch mal in deinem E-Mail-Postfach vorbei! ;)'));
    B.appendChild(line('Möchtest du noch etwas anderes wissen?'));
    var r = row();
    r.appendChild(btn('Ja, zeig mir die Q&As', function(){ stepQAs(); }, 'ppx-cta', '❓'));
    r.appendChild(btn('Nein, danke', function(){ var X=block(null); X.appendChild(line('Bis bald und buon appetito! 👋')); }, 'ppx-secondary', '✅'));
    B.appendChild(r);
    B.appendChild(nav([ homeBtn(), doneBtn() ]));
    jumpBottom();
  }
  // 6) ÖFFNUNGSZEITEN (ohne Nav; nach 3.0s Frage)
  function stepHours(){
    var scopeIdx = getScopeIndex();
    var B = block('ÖFFNUNGSZEITEN'); B.setAttribute('data-block','hours');
    var lines = CFG.hoursLines || [];
    if (!lines.length) { B.appendChild(line('Keine Zeiten hinterlegt.')); }
    else {
      lines.forEach(function(rowArr){
        var txt = Array.isArray(rowArr) ? (rowArr[0]+': '+rowArr[1]) : String(rowArr);
        B.appendChild(line('• '+txt));
      });
    }
    // Nach identischem Delay wie bei Gerichten (3.0 s) die Reservierungsfrage einblenden
    setTimeout(function(){ askReserveAfterHours(scopeIdx); }, 3000);
  }
  function askReserveAfterHours(scopeIdx){
    var Q = block(null); Q.setAttribute('data-block','hours-ask');
    Q.appendChild(line('Passen die Zeiten? Wenn du magst, können wir jetzt mit der Reservierung fortfahren.'));
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
  }

  // 7) KONTAKT
  function stepKontakt(){
    var scopeIdx = getScopeIndex();
    var B = block('KONTAKTDATEN'); B.setAttribute('data-block','kontakt');

    if (CFG.phone){
      B.appendChild(line('📞 '+CFG.phone));
      var r1=row(); r1.style.justifyContent='flex-start';
      r1.appendChild(btn('Anrufen', function(){ window.location.href='tel:'+String(CFG.phone).replace(/\s+/g,''); }, '', '📞'));
      B.appendChild(r1);
    }
    if (CFG.email){
      B.appendChild(line('✉️  '+CFG.email));
      var r2=row(); r2.style.justifyContent='flex-start';
      r2.appendChild(btn('E-Mail schreiben', function(){ window.location.href='mailto:'+CFG.email; }, '', '✉️'));
      B.appendChild(r2);
    }
    if (CFG.address){
      B.appendChild(line('📍 '+CFG.address));
      var maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(CFG.address);
      var r3=row(); r3.style.justifyContent='flex-start';
      r3.appendChild(btn('Anfahrt öffnen', function(){ window.open(maps,'_blank'); }, '', '🗺️'));
      B.appendChild(r3);
    }

    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
  }

  // 8) Q&As
  function getFaqPdfUrl(){
    return (CFG.faqPdf) ||
           ((isObj(FAQ) && FAQ.pdfUrl) ? FAQ.pdfUrl : null) ||
           (CFG.pdf && (CFG.pdf.faq || CFG.pdf.url)) ||
           'pizza_papa_faq.pdf';
  }
  var FAQ_ORDER = ['Speisekarte','Allergene','Lieferung','Öffnungszeiten','Preise','Bestellung'];
  function orderFaqCats(cats){
    var allow = Object.create(null); FAQ_ORDER.forEach(function(t){ allow[t]=1; });
    var filtered = cats.filter(function(c){
      var t = (c.title||c.name||'').trim();
      if (/speisekarte/i.test(t)) c.title = 'Speisekarte';
      return allow[c.title||c.name];
    });
    var pos = Object.create(null); FAQ_ORDER.forEach(function(t,i){ pos[t]=i; });
    return filtered.sort(function(a,b){
      var ta=a.title||a.name||'', tb=b.title||b.name||'';
      var ia = ta in pos ? pos[ta] : 999, ib = tb in pos ? pos[tb] : 999;
      return ia-ib || ta.localeCompare(tb);
    });
  }
  function getFaqCats(){
    if (Array.isArray(FAQ)) {
      return orderFaqCats([{ key:'all', title:'Speisekarte', icon:'🍕', items:FAQ }]);
    }
    if (isObj(FAQ)) {
      if (Array.isArray(FAQ.cats)) return orderFaqCats(FAQ.cats.slice());
      if (Array.isArray(FAQ.items)) {
        return orderFaqCats([{ key:'all', title:(FAQ.title||'Speisekarte'), icon:(FAQ.icon||'🍕'), items:FAQ.items }]);
      }
    }
    return [];
  }
  function stepQAs(){
    var scopeIdx = getScopeIndex();
    var B = block('Q&As'); B.setAttribute('data-block','faq-root');

    var rTop = row(); rTop.className += ' ppx-center';
    rTop.appendChild(btn('Alle FAQs als PDF', function(){ try{ window.open(getFaqPdfUrl(),'_blank','noopener'); }catch(e){} }, '', '📄'));
    B.appendChild(rTop);

    setTimeout(function(){
      var cats = getFaqCats();
      if (!cats.length){
        B.appendChild(line('Häufige Fragen folgen in Kürze.'));
        B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ])); return;
      }
      B.appendChild(line('Wonach möchtest du schauen?'));
      var G = grid();
      cats.forEach(function(ct){
        var label = (ct.icon ? (ct.icon+' ') : '') + (ct.title || 'Kategorie');
        G.appendChild(chip(label, function(){ renderFaqCat(ct); }, 'ppx-cat'));
      });
      B.appendChild(G);
      B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    }, 1000);
  }
  function renderFaqCat(ct){
    var scopeIdx = getScopeIndex();
    var title = (ct && (ct.title || ct.name)) || 'Fragen';
    var items = (ct && Array.isArray(ct.items)) ? ct.items.slice() : [];
    var B = block(title); B.setAttribute('data-block','faq-cat');

    if (!items.length){
      B.appendChild(line('Für diese Kategorie sind noch keine Fragen hinterlegt.'));
      B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ])); return;
    }

    B.appendChild(line('Wähle eine Frage:'));
    var L = row();
    items.forEach(function(it){
      var q = (it && (it.q || it.question)) || '';
      if (!q) return;
      L.appendChild(btn(q, function(){ renderFaqAnswer(ct, it, scopeIdx); }, '', '➜'));
    });
    B.appendChild(L);
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
  }
  function isOrderQuick(it){
    var q = (it && (it.q || it.question) || '').toLowerCase();
    return (it && it.special === 'orderQuick') || /wie\s+bestelle\s+ich\s+am\s+schnellsten/.test(q);
  }
  function renderFaqAnswer(ct, it, backScopeIdx){
    var q = (it && (it.q || it.question)) || 'Frage';
    var a = (it && (it.a || it.answer)) || '';
    var more = it && it.more;

    var B = block(q); B.setAttribute('data-block','faq-answer');
    if (a)   B.appendChild(line(a));
    if (more) B.appendChild(line(more));

    if (isOrderQuick(it)){
      var r = row(); r.style.justifyContent = 'flex-start';
      var orderUrl = (CFG.orderUrl || (CFG.links && CFG.links.lieferando) || 'https://www.lieferando.de/');
      r.appendChild(btn('Lieferando öffnen', function(){ try{ window.open(orderUrl,'_blank','noopener'); }catch(e){} }, 'ppx-cta', '⚡'));
      if (CFG.phone){
        r.appendChild(btn('Anrufen', function(){ window.location.href='tel:'+String(CFG.phone).replace(/\s+/g,''); }, '', '📞'));
      }
      B.appendChild(r);
      B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
      return;
    }

    setTimeout(function(){ askAfterFaqAnswer(backScopeIdx); }, 3000);
  }
  function askAfterFaqAnswer(backScopeIdx){
    var Q = block(null); Q.setAttribute('data-block','faq-answer-ask');
    Q.appendChild(line('Hilft dir das? Möchtest du als nächstes reservieren? 🙂'));
    var r = row(); r.style.justifyContent='flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
    Q.appendChild(nav([ backBtnAt(backScopeIdx) ]));
  }

})(); // Ende IIFE
