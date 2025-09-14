/* ============================================================================
   PPX Widget (v7.5.4 – EmailJS + kompakter Back + Home zentriert + solide Hours)
   - Reservieren: Name → Datum → Zeit → Personen → Phone? → E-Mail
   - Kontaktformular: E-Mail → Nachricht → Absenden (EmailJS + Fallback)
   ============================================================================ */
(function () {
  'use strict';

  // 0) Daten & Setup
  var W = window;
  var DATA = W.__PPX_DATA__ || {};
  var CFG  = DATA.cfg || {};
  var DISH = DATA.dishes || {};
  var FAQ  = DATA.faqs  || [];

  try { W.PPX_VERSION = '7.5.4'; console.log('[PPX] widget v'+W.PPX_VERSION+' loaded'); } catch(e){}

  // Delays
  var D = { tap:260, step:450, sub:550, long:1000 };
  function delay(fn, ms){ setTimeout(fn, ms); }

  // EmailJS init (robust)
  (function () {
    try {
      if (W.emailjs && CFG.EMAIL && CFG.EMAIL.publicKey) {
        W.emailjs.init({ publicKey: CFG.EMAIL.publicKey });
      }
    } catch (e) {}
  })();

  // STYLE (inkl. kompakter Back-Button + Home/Kategorien zentriert)
  (function () {
    [
      'ppx-style-100w','ppx-style-100w-v2','ppx-style-100w-v3','ppx-style-100w-v4',
      'ppx-style-v5','ppx-style-v5-override','ppx-style-v6','ppx-style-v7',
      'ppx-style-v73','ppx-style-v752','ppx-style-v753','ppx-style-v754'
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
#ppx-panel.ppx-v5 #ppx-v [data-block="home"]{ background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; max-width:100% !important; margin-left:0 !important; margin-right:0 !important; }

/* Headings + Body */
#ppx-panel.ppx-v5 #ppx-v .ppx-h{ background:var(--ppx-green-800); color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:12px; padding:10px 12px; margin:-2px -2px 10px; font-family:"Cinzel", serif; font-weight:600; letter-spacing:.02em; text-transform:uppercase; font-size:18px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-m{ color:var(--ppx-ink); line-height:1.5; margin:6px 0 10px; font-family:"Cormorant Garamond", serif; font-weight:400; font-size:18px; }

/* Rows/Grids */
#ppx-panel.ppx-v5 #ppx-v .ppx-row{ display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-start !important; margin-top:8px; width:100%; }
#ppx-panel.ppx-v5 #ppx-v .ppx-grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:8px; width:100%; }

/* Buttons & Chips */
#ppx-panel.ppx-v5 #ppx-v .ppx-b, #ppx-panel.ppx-v5 #ppx-v .ppx-chip{
  -webkit-appearance:none; appearance:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:flex-start !important; gap:10px; width:100% !important; text-align:left;
  color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:14px; padding:10px 14px !important; background:var(--ppx-green-650);
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 2px 8px rgba(0,0,0,.20); transition:transform .06s ease, filter .2s ease, box-shadow .2s ease, background .2s ease;
  font-family:"Cormorant Garamond", serif; font-weight:400 !important; font-size:17px !important;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-cta{ background:var(--ppx-green-600); }
#ppx-panel.ppx-v5 #ppx-v .ppx-chip{ background:var(--ppx-green-700); }
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-secondary, #ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-secondary{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.22); padding:8px 12px !important; font-size:15px !important; box-shadow:none; }
#ppx-panel.ppx-v5 #ppx-v .ppx-b[data-ic]::before, #ppx-panel.ppx-v5 #ppx-v .ppx-chip[data-ic]::before{
  content:attr(data-ic); display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; min-width:26px; border-radius:999px; background:var(--ppx-gold); color:var(--ppx-gold-ink); font-size:15px; line-height:1;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.22) inset;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-selected, #ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-selected{ filter:brightness(1.10); box-shadow:0 0 0 2px rgba(230,196,138,.55) inset, 0 2px 8px rgba(0,0,0,.26); }

/* Inputs */
#ppx-panel.ppx-v5 #ppx-v .ppx-input{ display:flex; gap:8px; margin-top:8px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-input input, #ppx-panel.ppx-v5 #ppx-v .ppx-input select, #ppx-panel.ppx-v5 #ppx-v .ppx-input textarea{
  width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.1); color:#fff; font-size:15px; outline:none;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-input textarea{ min-height:96px; resize:vertical; }

/* Slotgrid */
#ppx-panel.ppx-v5 #ppx-v .ppx-grid.ppx-slotgrid{ grid-template-columns:repeat(3,minmax(0,1fr)); max-height:280px; overflow:auto; padding-right:4px; }
@media (max-width:520px){ #ppx-panel.ppx-v5 #ppx-v .ppx-grid.ppx-slotgrid{ grid-template-columns:repeat(2,minmax(0,1fr)); max-height:260px; } }

/* >>> SPEISEN-Kategorien (zentriert) */
#ppx-panel.ppx-v5 #ppx-v .ppx-chip.ppx-cat{ justify-content:center !important; text-align:center !important; }

/* >>> HOME: Buttons & Text zentriert */
#ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-row{ justify-content:center !important; }
#ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-b,
#ppx-panel.ppx-v5 #ppx-v [data-block="home"] .ppx-chip{
  justify-content:center !important; text-align:center !important;
}

/* Nav + kompakter Zurück-Button */
#ppx-panel.ppx-v5 #ppx-v .ppx-nav{ display:flex; gap:10px; width:100%; justify-content:flex-start !important; margin-top:10px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-nav .ppx-b{ flex:1 1 0; }
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-back{
  width:auto !important; min-width:130px !important; flex:0 0 auto !important;
  font-size:14px !important; padding:8px 10px !important;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-nav .ppx-b.ppx-back{ flex:0 0 auto !important; }
`;
    var tag = document.createElement('style'); tag.id = 'ppx-style-v754'; tag.textContent = css; document.head.appendChild(tag);
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
      if(t&&$view&&$view.contains(t)){ t.classList.add('ppx-selected'); jumpBottom(); delay(jumpBottom,140); delay(jumpBottom,700); }
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
  function el(tag, attrs){ var n=document.createElement(tag); attrs=attrs||{}; Object.keys(attrs).forEach(function(k){
    if(k==='style'&&isObj(attrs[k])){ Object.assign(n.style,attrs[k]); }
    else if(k==='text'){ n.textContent=attrs[k]; }
    else if(k==='html'){ n.innerHTML=attrs[k]; }
    else if(k.slice(0,2)==='on'&&typeof attrs[k]==='function'){ n.addEventListener(k.slice(2),attrs[k]); }
    else { n.setAttribute(k, attrs[k]); }
  });
  for(var i=2;i<arguments.length;i++){ var c=arguments[i]; if(c==null) continue; n.appendChild(typeof c==='string'?document.createTextNode(c):c); }
  return n; }
  function pretty(s){ return String(s||'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g, function(c){ return c.toUpperCase(); }); }
  function block(title,opts){ opts=opts||{}; var w=el('div',{class:'ppx-bot ppx-appear',style:{maxWidth:(opts.maxWidth||'640px'),margin:'12px auto'}}); if(title) w.appendChild(el('div',{class:'ppx-h'},title)); if($view) $view.appendChild(w); jumpBottom(); return w; }
  function line(txt){ return el('div',{class:'ppx-m'},txt); }
  function row(){ return el('div',{class:'ppx-row'}); }
  function grid(){ return el('div',{class:'ppx-grid'}); }
  function getScopeIndex(){ return $view ? $view.children.length : 0; }
  function popToScope(idx){ if(!$view) return; while($view.children.length>idx){ var last=$view.lastElementChild; if(!last) break; last.remove(); } jumpBottom(); }

  // Buttons/Chips/Nav
  function btn(label, onClick, extraCls, ic){
    var a={class:'ppx-b '+(extraCls||''),onclick:onClick,type:'button'};
    if(ic) a['data-ic']=ic;
    var n=el('button',a); n.appendChild(el('span',{class:'ppx-label'},label)); return n;
  }
  function chip(label, onClick, extraCls, ic){
    var a={class:'ppx-chip '+(extraCls||''),onclick:onClick,type:'button'};
    if(ic) a['data-ic']=ic;
    var n=el('button',a); n.appendChild(el('span',{class:'ppx-label'},label)); return n;
  }
  function nav(btns){ var r=el('div',{class:'ppx-nav'}); btns.forEach(function(b){ if(b) r.appendChild(b); }); return r; }
  function backBtnAt(scopeIdx){ return btn('← Zurück', function(){ popToScope(scopeIdx); }, 'ppx-secondary ppx-back'); }

  // Home
  function stepHome(force){
    if (!force && $view && $view.querySelector('[data-block="home"]')) return;
    var brand=(CFG.brand||'Pizza Papa Hamburg');
    var B=block(brand.toUpperCase()); B.setAttribute('data-block','home');
    B.appendChild(line('👋 WILLKOMMEN BEI '+brand.toUpperCase()+'!'));
    B.appendChild(line('Schön, dass du da bist. Wie können wir dir heute helfen?'));

    var r1=row(); r1.appendChild(btn('Speisen',function(){ stepSpeisen(); },'ppx-cta','🍽️')); B.appendChild(r1);
    var r2=row(); r2.appendChild(btn('Reservieren',function(){ stepReservieren(); },'','📅')); B.appendChild(r2);
    var r2b=row(); r2b.appendChild(btn('Kontaktformular',function(){ stepContactForm(); },'','📝')); B.appendChild(r2b);
    var r4=row(); r4.appendChild(btn('Kontaktdaten',function(){ stepKontakt(); },'','☎️')); B.appendChild(r4);
    var r3=row(); r3.appendChild(btn('Öffnungszeiten',function(){ stepHours(); },'','⏰')); B.appendChild(r3);
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
    delay(function(){ renderSpeisenRoot(scopeIdx); }, D.step);
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

    var pdfUrl = CFG.menuPdf || (CFG.pdf && (CFG.pdf.menu || CFG.pdf.url)) || CFG.menuPDF || 'speisekarte.pdf';
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Speisekarte als PDF', function(){ try{ window.open(pdfUrl,'_blank','noopener'); }catch(e){} }, '', '📄'));
    B.appendChild(r);

    delay(function(){
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
      B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
      jumpBottom();
    }, D.long);
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

    setTimeout(function(){ askReserveAfterItem(scopeIdx); }, 3000);
    jumpBottom();
  }

  function askReserveAfterItem(scopeIdx){
    var Q = block(null); Q.setAttribute('data-block','speisen-item-ask');
    Q.appendChild(line('Na, Appetit bekommen? 😍 Soll ich dir gleich einen Tisch reservieren?'));

    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ delay(stepReservieren, D.step); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
    Q.appendChild(nav([ backBtnAt(scopeIdx) ]));
    jumpBottom();
  }
  // 5) RESERVIEREN – Flow (Name → Datum → Zeit(Gruppen→Slots) → Personen → Phone? → E-Mail)
  var RESV = null;

  function stepReservieren(){
    RESV = { name:'', dateISO:'', dateReadable:'', time:'', persons:'', phone:'', email:'' };
    var B = block('RESERVIEREN', {maxWidth:'100%'}); B.setAttribute('data-block','resv-name');
    B.appendChild(line('Du möchtest gerne reservieren?'));
    B.appendChild(line('Darf ich bitte deinen Namen wissen?'));

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'text',placeholder:'Vor- und Nachname'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var v = String(inp.value||'').trim();
      if(v.length<2){ alert('Bitte gib einen gültigen Namen ein.'); inp.focus(); return; }
      RESV.name = v;
      delay(renderResvDate, D.step);
    }, 'ppx-cta', '➡️'));
    r.appendChild(homeBtn());
    B.appendChild(r);
  }

  function todayISO(){ var d=new Date(); var m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0'); return d.getFullYear()+'-'+m+'-'+day; }
  function parseDateAny(s){
    if(!s) return null;
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)){ var p=s.split('-'); return new Date(Number(p[0]),Number(p[1])-1,Number(p[2])); }
    var m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if(m){ return new Date(Number(m[3]),Number(m[2])-1,Number(m[1])); }
    return null;
  }
  function fmtDateReadable(d){ var wd=['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()]; var dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return wd+', '+dd+'.'+mm+'.'; }

  function renderResvDate(){
    var scopeIdx = getScopeIndex();
    var B = block('Perfekt, '+RESV.name+'! :)', {maxWidth:'100%'}); B.setAttribute('data-block','resv-date');
    B.appendChild(line('Für welches Datum möchtest du reservieren?'));

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'date', min:todayISO(), placeholder:'TT.MM.JJJJ'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var val = inp.value || '';
      var d = val ? parseDateAny(val) : null;
      if(!d){ alert('Bitte wähle ein Datum.'); inp.focus(); return; }
      RESV.dateISO = d.toISOString().slice(0,10);
      RESV.dateReadable = fmtDateReadable(d);
      delay(function(){ renderResvTime(d, scopeIdx); }, D.step);
    }, 'ppx-cta', '🗓️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }
  function hmToMin(s){ var a=s.split(':'), h=Number(a[0]), m=Number(a[1]||0); if(h===24&&m===0) return 1440; return h*60+m; }
  function minToHM(n){ var h=Math.floor(n/60), m=n%60; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); }

  function buildSlotsForDate(d){
    var wd = d.getDay();
    var span = (CFG.OPEN && CFG.OPEN[String(wd)]) || null;
    if(!span || !Array.isArray(span) || span.length<2) return [];
    var openMin = hmToMin(span[0]);
    var closeMin = hmToMin(span[1]);
    var lastStartExclusive = closeMin - 60;
    if (lastStartExclusive <= openMin) return [];
    var slots = [];
    for(var t=openMin; t<lastStartExclusive; t+=30){ slots.push(t); }
    var now = new Date();
    var isToday = now.getFullYear()===d.getFullYear() && now.getMonth()===d.getMonth() && now.getDate()===d.getDate();
    if(isToday){
      var lead = (now.getHours()*60 + now.getMinutes()) + 240;
      slots = slots.filter(function(t){ return t >= lead; });
    }
    return slots;
  }

  function groupSlots(mins){
    if(!mins || !mins.length) return [];
    var start = mins[0]; var lastStart = mins[mins.length-1]; var endExclusive = lastStart + 30;
    var L = endExclusive - start; if (L <= 0) return [{ from:start, to:endExclusive, slots:mins }];
    var G = (L <= 180) ? 1 : (L <= 360 ? 2 : 3);
    if (G === 1) return [{ from:start, to:endExclusive, slots:mins }];
    var step = Math.max(60, Math.round((L / G) / 30) * 30);
    var cuts = []; for (var i=1; i<G; i++){ cuts.push(start + step*i); }
    cuts = cuts.map(function(c){ var onHour = Math.round(c / 60) * 60; if (Math.abs(onHour - c) <= 30) return onHour; return Math.round(c / 30) * 30; })
      .filter(function(c){ return c>start && c<endExclusive; }).sort(function(a,b){ return a-b; });
    var bounds = [start].concat(cuts).concat([endExclusive]); var groups = [];
    for (var j=0; j<bounds.length-1; j++){
      var a = bounds[j], b = bounds[j+1]; var gSlots = mins.filter(function(t){ return t>=a && t<b; });
      if (gSlots.length >= 2){ groups.push({ from:a, to:b, slots:gSlots }); }
    }
    if (!groups.length) groups = [{ from:start, to:endExclusive, slots:mins }];
    return groups;
  }

  function renderResvTime(dateObj, backScopeIdx){
    var B = block('Um welche Uhrzeit möchtest du reservieren?', {maxWidth:'100%'}); 
    B.setAttribute('data-block','resv-time');

    var minutes = buildSlotsForDate(dateObj);
    if(!minutes.length){
      B.appendChild(line('Für dieses Datum sind aktuell keine Reservierungszeiten verfügbar (geschlossen oder zu kurzfristig).'));
      B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
      return;
    }

    var groups = groupSlots(minutes);

    if (groups.length === 1){
      var only = groups[0];
      B.appendChild(line(minToHM(only.from) + ' – ' + minToHM(only.to)));
      var G = grid(); G.classList.add('ppx-slotgrid');
      delay(function(){
        only.slots.forEach(function(t){
          var hm = minToHM(t);
          G.appendChild(chip(hm, function(){ RESV.time = hm; delay(renderResvPersons, D.step); }, '', '🕒'));
        });
        B.appendChild(G);
        B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
      }, D.sub);
      return;
    }

    var slotWrap = el('div', {class:'ppx-slotwrap'});
    groups.forEach(function(g){
      var label = minToHM(g.from) + ' – ' + minToHM(g.to);
      var r = row(); r.classList.add('ppx-grouprow');
      r.appendChild(chip(label, function(){
        slotWrap.innerHTML = '';
        delay(function(){
          var G = grid(); G.classList.add('ppx-slotgrid');
          g.slots.forEach(function(t){
            var hm = minToHM(t);
            G.appendChild(chip(hm, function(){ RESV.time = hm; delay(renderResvPersons, D.step); }, '', '🕒'));
          });
          slotWrap.appendChild(G);
        }, D.tap);
      }, 'ppx-group'));
      B.appendChild(r);
    });

    delay(function(){ B.appendChild(slotWrap); B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ])); }, D.sub);
  }

  // Persons
  function renderResvPersons(){
    var scopeIdx = getScopeIndex();
    var B = block('Super, '+RESV.name+'!', {maxWidth:'100%'}); 
    B.setAttribute('data-block','resv-persons');
    B.appendChild(line('Für wie viele Personen darf ich den Tisch vorbereiten?'));

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'number', min:'1', max:'20', value:'2'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var val = Number(inp.value||0);
      if(!val || val<1){ alert('Bitte gib eine gültige Anzahl ein.'); inp.focus(); return; }
      RESV.persons = String(val);
      delay(function(){ renderResvPhone(scopeIdx); }, D.step);
    }, 'ppx-cta', '➡️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  // Phone (optional)
  function renderResvPhone(backScopeIdx){
    var B = block('Magst du mir deine Nummer dalassen? (optional)', {maxWidth:'100%'}); 
    B.setAttribute('data-block','resv-phone');

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'tel',placeholder:'+49 …'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Ohne Telefon weiter', function(){ 
      RESV.phone='';
      delay(renderResvEmail, D.step);
    }, 'ppx-secondary', '⏭️'));
    r.appendChild(btn('Weiter', function(){ 
      RESV.phone = String(inp.value||'').trim(); 
      delay(renderResvEmail, D.step);
    }, 'ppx-cta', '➡️'));
    B.appendChild(r);
    B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
  }

  // Email (required)
  function isValidEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s||'').trim()); }

  function renderResvEmail(){
    var scopeIdx = getScopeIndex();
    var B = block('Und deine E-Mail für die Bestätigung?', {maxWidth:'100%'}); 
    B.setAttribute('data-block','resv-email');

    B.appendChild(line('Wir schicken dir dort eine kurze Eingangsbestätigung.'));

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'email',placeholder:'dein.name@example.com'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Anfrage senden', function(){
      var v = String(inp.value||'').trim();
      if(!isValidEmail(v)){ alert('Bitte gib eine gültige E-Mail-Adresse ein.'); inp.focus(); return; }
      RESV.email = v;
      delay(submitReservation, D.tap);
    }, 'ppx-cta', '✉️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  // Submit Reservation (EmailJS → Fallback mailto)
  function submitReservation(){
    var brand = (CFG.brand||'Restaurant');
    var payload = {
      brand: brand,
      name: RESV.name,
      date: RESV.dateReadable,
      time: RESV.time,
      persons: RESV.persons,
      phone: RESV.phone||'',
      email: RESV.email,
      message: ''
    };
    var svcId   = CFG.EMAIL && (CFG.EMAIL.service || CFG.EMAIL.serviceId);
    var tplTo   = CFG.EMAIL && (CFG.EMAIL.toTemplate || CFG.EMAIL.templateId);
    var tplAuto = CFG.EMAIL && CFG.EMAIL.autoReplyTemplate;

    if (window.emailjs && svcId && tplTo && CFG.EMAIL && CFG.EMAIL.publicKey){
      try{ emailjs.init({ publicKey: CFG.EMAIL.publicKey }); }catch(e){}
      emailjs.send(svcId, tplTo, payload).then(function(){
        if (tplAuto){ return emailjs.send(svcId, tplAuto, payload).catch(function(){}); }
      }).then(function(){ showReservationSuccess('emailjs'); })
        .catch(function(){ fallbackMailto(payload); showReservationSuccess('mailto'); });
      return;
    }
    fallbackMailto(payload); showReservationSuccess('mailto');
  }
  function fallbackMailto(p){
    var addr = CFG.email || (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) || 'info@example.com';
    var bodyLines = [
      'Reservierungsanfrage',
      'Name: '+p.name,
      'Datum: '+p.date,
      'Uhrzeit: '+p.time,
      'Personen: '+p.persons,
      'Telefon: '+(p.phone||'-'),
      'E-Mail: '+p.email,
      '— gesendet via Bot'
    ];
    var body = encodeURIComponent(bodyLines.join('\n'));
    try{ window.location.href = 'mailto:'+addr+'?subject='+encodeURIComponent('Reservierung')+'&body='+body; }catch(e){}
  }

  function showReservationSuccess(kind){
    var B = block('RESERVIERUNG', {maxWidth:'100%'}); 
    B.setAttribute('data-block','reservieren-success');
    B.appendChild(line('Danke für deine Anfrage! Schau doch mal in deinem E-Mail-Postfach vorbei! ;)'));
    B.appendChild(line('Möchtest du noch etwas anderes wissen?'));
    var r = row();
    r.appendChild(btn('Ja, zeig mir die Q&As', function(){ delay(stepQAs, D.step); }, 'ppx-cta', '❓'));
    r.appendChild(btn('Nein, danke', function(){ var X=block(null); X.appendChild(line('Bis bald und buon appetito! 👋')); }, 'ppx-secondary', '✅'));
    B.appendChild(r);
    B.appendChild(nav([ homeBtn(), doneBtn() ]));
    jumpBottom();
  }
  // ==== Öffnungszeiten (robust: hoursLines bevorzugt, sonst aus OPEN) ====
  function normalizeHoursLines(v){
    var out = [];
    if (Array.isArray(v)){
      v.forEach(function(it){
        if (Array.isArray(it) && it.length >= 2){
          out.push([ String(it[0]), String(it[1]) ]);
        } else if (isObj(it)){
          var day = it.day || it.name || it.title || it[0];
          var time = it.time || it.hours || it[1];
          if (day && time) out.push([ String(day), String(time) ]);
        }
      });
      return out;
    }
    if (isObj(v)){
      var order = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
      order.forEach(function(d){ if (v[d]) out.push([d, String(v[d])]); });
    }
    return out;
  }

  function hoursFromOpen(){
    var dnames = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    var out = [];
    var O = CFG.OPEN || {};
    function spanToTxt(span){
      return (Array.isArray(span) && span.length>=2) ? (span[0]+' – '+span[1]+' Uhr') : 'geschlossen';
    }
    for (var i=1;i<=6;i++){ out.push([dnames[i], spanToTxt(O[String(i)])]); } // Mo–Sa
    out.push([dnames[0], spanToTxt(O['0'])]); // So
    return out;
  }

  function stepHours(){
    var scopeIdx = getScopeIndex();
    var B = block('ÖFFNUNGSZEITEN', {maxWidth:'100%'}); 
    B.setAttribute('data-block','hours');

    var lines = normalizeHoursLines(CFG.hoursLines);
    if (!lines.length) lines = hoursFromOpen();

    if (!Array.isArray(lines) || !lines.length) {
      B.appendChild(line('Keine Zeiten hinterlegt.'));
    } else {
      lines.forEach(function(rowArr){
        var txt = Array.isArray(rowArr) ? (rowArr[0]+': '+rowArr[1]) : String(rowArr);
        B.appendChild(line('• '+txt));
      });
    }
    setTimeout(function(){ askReserveAfterHours(scopeIdx); }, 3000);
  }
  function askReserveAfterHours(scopeIdx){
    var Q = block(null, {maxWidth:'100%'}); Q.setAttribute('data-block','hours-ask');
    Q.appendChild(line('Samstagabend ist meistens richtig voll – willst du dir jetzt schon einen Platz sichern?'));
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ delay(stepReservieren, D.step); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
  }

  // 7) KONTAKTDATEN
  function stepKontakt(){
    var scopeIdx = getScopeIndex();
    var B = block('KONTAKTDATEN', {maxWidth:'100%'}); 
    B.setAttribute('data-block','kontakt');

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

  // 7b) KONTAKTFORMULAR (EmailJS + Fallback)
  var CF = null;

  function stepContactForm(){
    CF = { email:'', message:'' };
    var B = block('KONTAKTFORMULAR', {maxWidth:'100%'}); 
    B.setAttribute('data-block','cf-intro');
    B.appendChild(line('Du möchtest uns gerne eine Nachricht da lassen?'));
    delay(renderContactEmail, D.step);
  }

  function renderContactEmail(){
    var scopeIdx = getScopeIndex();
    var B = block('Alles klar – dann brauche ich erstmal deine E-Mail-Adresse.', {maxWidth:'100%'}); 
    B.setAttribute('data-block','cf-email');

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'email',placeholder:'dein.name@example.com'});
    rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var v = String(inp.value||'').trim();
      if(!isValidEmail(v)){ alert('Bitte gib eine gültige E-Mail-Adresse ein.'); inp.focus(); return; }
      CF.email = v;
      delay(renderContactMessage, D.step);
    }, 'ppx-cta', '➡️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  function renderContactMessage(){
    var scopeIdx = getScopeIndex();
    var B = block('Worum geht’s?', {maxWidth:'100%'}); 
    B.setAttribute('data-block','cf-msg');

    var rowIn = row(); rowIn.className='ppx-input';
    var ta = el('textarea',{placeholder:'Hier kannst du dein Anliegen äußern. Wir freuen uns über deine Nachricht! :)'});
    rowIn.appendChild(ta); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Absenden', function(){
      var msg = String(ta.value||'').trim();
      if(!msg){ alert('Bitte schreib kurz, worum es geht.'); ta.focus(); return; }
      CF.message = msg;
      delay(submitContactForm, D.tap);
    }, 'ppx-cta', '✉️'));
    r.appendChild(backBtnAt(scopeIdx));
    B.appendChild(r);
  }

  function submitContactForm(){
    var brand = (CFG.brand||'Restaurant');
    var payload = { brand: brand, email: CF.email, message: CF.message };
    var svcId = CFG.EMAIL && (CFG.EMAIL.service || CFG.EMAIL.serviceId);
    var tplContact = CFG.EMAIL && (CFG.EMAIL.contactTemplate || CFG.EMAIL.contactTemplateId);
    var tplContactAuto = CFG.EMAIL && CFG.EMAIL.contactAutoReplyTemplate;

    if (window.emailjs && svcId && tplContact && CFG.EMAIL && CFG.EMAIL.publicKey){
      try{ emailjs.init({ publicKey: CFG.EMAIL.publicKey }); }catch(e){}
      emailjs.send(svcId, tplContact, payload).then(function(){
        if (tplContactAuto){ return emailjs.send(svcId, tplContactAuto, payload).catch(function(){}); }
      }).then(function(){ showContactSuccess('emailjs'); })
        .catch(function(){ fallbackMailtoContact(payload); showContactSuccess('mailto'); });
      return;
    }
    fallbackMailtoContact(payload); showContactSuccess('mailto');
  }

  function fallbackMailtoContact(p){
    var addr = CFG.email || (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) || 'info@example.com';
    var body = encodeURIComponent(['Kontaktformular','E-Mail: '+p.email,'',p.message,'','— gesendet via Bot'].join('\n'));
    try{ window.location.href='mailto:'+addr+'?subject='+encodeURIComponent('Kontaktformular')+'&body='+body; }catch(e){}
  }

  function showContactSuccess(kind){
    var B = block('NACHRICHT GESENDET', {maxWidth:'100%'}); 
    B.setAttribute('data-block','cf-success');
    B.appendChild(line('Danke – deine Nachricht ist bei uns eingegangen. Wir melden uns so schnell wie möglich!'));
    var r = row();
    r.appendChild(btn('Zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    B.appendChild(r);
  }

  // ==== FAQ (unverändert) ====
  function getFaqPdfUrl(){
    return (CFG.faqPdf) || ((isObj(FAQ) && FAQ.pdfUrl) ? FAQ.pdfUrl : null) || (CFG.pdf && (CFG.pdf.faq || CFG.pdf.url)) || 'pizza_papa_faq.pdf';
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
      return (ta in pos ? pos[ta] : 999) - (tb in pos ? pos[tb] : 999) || ta.localeCompare(tb);
    });
  }
  function getFaqCats(){
    if (Array.isArray(FAQ)) { return orderFaqCats([{ key:'all', title:'Speisekarte', icon:'🍕', items:FAQ }]); }
    if (isObj(FAQ)) {
      if (Array.isArray(FAQ.cats)) return orderFaqCats(FAQ.cats.slice());
      if (Array.isArray(FAQ.items)) return orderFaqCats([{ key:'all', title:(FAQ.title||'Speisekarte'), icon:(FAQ.icon||'🍕'), items:FAQ.items }]);
    }
    return [];
  }
  function stepQAs(){
    var scopeIdx = getScopeIndex();
    var B = block('Q&As', {maxWidth:'100%'}); B.setAttribute('data-block','faq-root');

    var rTop = row(); rTop.className += ' ppx-center';
    rTop.appendChild(btn('Alle FAQs als PDF', function(){ try{ window.open(getFaqPdfUrl(),'_blank','noopener'); }catch(e){} }, '', '📄'));
    B.appendChild(rTop);

    delay(function(){
      var cats = getFaqCats();
      if (!cats.length){ B.appendChild(line('Häufige Fragen folgen in Kürze.')); B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ])); return; }
      B.appendChild(line('Wonach möchtest du schauen?'));
      var G = grid();
      cats.forEach(function(ct){
        var label = (ct.icon ? (ct.icon+' ') : '') + (ct.title || 'Kategorie');
        G.appendChild(chip(label, function(){ renderFaqCat(ct); }, 'ppx-cat'));
      });
      B.appendChild(G);
      B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
    }, D.long);
  }
  function renderFaqCat(ct){
    var scopeIdx = getScopeIndex();
    var title = (ct && (ct.title || ct.name)) || 'Fragen';
    var items = (ct && Array.isArray(ct.items)) ? ct.items.slice() : [];
    var B = block(title, {maxWidth:'100%'}); B.setAttribute('data-block','faq-cat');

    if (!items.length){ B.appendChild(line('Für diese Kategorie sind noch keine Fragen hinterlegt.')); B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ])); return; }

    B.appendChild(line('Wähle eine Frage:'));
    var L = row();
    items.forEach(function(it){
      var q = (it && (it.q || it.question)) || '';
      if (!q) return;
      L.appendChild(btn(q, function(){ delay(function(){ renderFaqAnswer(ct, it, scopeIdx); }, D.tap); }, '', '➜'));
    });
    B.appendChild(L);
    B.appendChild(nav([ backBtnAt(scopeIdx), homeBtn() ]));
  }
  function isOrderQuick(it){ var q = (it && (it.q || it.question) || '').toLowerCase(); return (it && it.special === 'orderQuick') || /wie\s+bestelle\s+ich\s+am\s+schnellsten/.test(q); }
  function renderFaqAnswer(ct, it, backScopeIdx){
    var q = (it && (it.q || it.question)) || 'Frage';
    var a = (it && (it.a || it.answer)) || '';
    var more = it && it.more;

    var B = block(q, {maxWidth:'100%'}); B.setAttribute('data-block','faq-answer');
    if (a)   B.appendChild(line(a));
    if (more) B.appendChild(line(more));

    if (isOrderQuick(it)){
      var r = row(); r.style.justifyContent = 'flex-start';
      var orderUrl = (CFG.orderUrl || (CFG.links && CFG.links.lieferando) || 'https://www.lieferando.de/');
      r.appendChild(btn('Lieferando öffnen', function(){ try{ window.open(orderUrl,'_blank','noopener'); }catch(e){} }, 'ppx-cta', '⚡'));
      if (CFG.phone){ r.appendChild(btn('Anrufen', function(){ window.location.href='tel:'+String(CFG.phone).replace(/\s+/g,''); }, '', '📞')); }
      B.appendChild(r); B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ])); return;
    }

    setTimeout(function(){ askAfterFaqAnswer(backScopeIdx); }, 3000);
  }
  function askAfterFaqAnswer(backScopeIdx){
    var Q = block(null, {maxWidth:'100%'}); Q.setAttribute('data-block','faq-answer-ask');
    Q.appendChild(line('Hilft dir das? Möchtest du als nächstes reservieren? 🙂'));
    var r = row(); r.style.justifyContent='flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ delay(stepReservieren, D.step); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
    Q.appendChild(nav([ backBtnAt(backScopeIdx) ]));
  }

})(); // Ende IIFE
/* ======================================================================= */
