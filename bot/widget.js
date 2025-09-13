/* ============================================================================
   PPX Widget (v7.4 – Chat-Style + Gruppen vor Slots)
   - Flow: Name → Datum → (Gruppen wählen) → Slots → Personen → Telefon? → E-Mail
   - Slots: aus CFG.OPEN (0=So..6=Sa), letzte Stunde raus, heute +4h Lead-Time
   - Gruppen: 1–3, gleichmäßig, auf :00/:30 geschnappt, lückenlos & ohne Überschneidung
   - Dezente Chat-Optik nur für Reservierungs-Blocks (kein Kitsch)
   ============================================================================ */
(function () {
  'use strict';

  // 0) Daten & Setup
  var W = window;
  var DATA = W.__PPX_DATA__ || {};
  var CFG  = DATA.cfg || {};
  var DISH = DATA.dishes || {};
  var FAQ  = DATA.faqs  || [];

  // EmailJS init
  (function () {
    try {
      if (W.emailjs && CFG.EMAIL && CFG.EMAIL.publicKey) {
        W.emailjs.init({ publicKey: CFG.EMAIL.publicKey });
      }
    } catch (e) {}
  })();

  // STYLE (dezente Chat-Optik für Reservierung)
  (function () {
    [
      'ppx-style-100w','ppx-style-v5','ppx-style-v6','ppx-style-v73','ppx-style-v74'
    ].forEach(function(id){ var n=document.getElementById(id); if(n) n.remove(); });

    var css = `
:root{
  --ppx-green-800:#114136; --ppx-green-700:#154a3e; --ppx-green-650:#1a5044;
  --ppx-ink:#f1f7f4; --ppx-gold:#e6c48a; --ppx-border:rgba(255,255,255,.12);
}
/* Basis (wie gehabt) */
#ppx-panel.ppx-v5 #ppx-v{ overflow-y:auto; max-height:calc(100vh - 120px); -webkit-overflow-scrolling:touch; padding:10px 10px 16px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-bot{ background:linear-gradient(180deg, rgba(14,59,51,.45), rgba(14,59,51,.30)); border:1px solid var(--ppx-border); border-radius:14px; padding:14px; margin:12px auto; max-width:640px; box-shadow:0 4px 12px rgba(0,0,0,.20); text-align:left !important; }
#ppx-panel.ppx-v5 #ppx-v .ppx-h{ background:var(--ppx-green-800); color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:12px; padding:10px 12px; margin:-2px -2px 10px; font-family:"Cinzel",serif; font-weight:600; letter-spacing:.02em; text-transform:uppercase; font-size:18px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-m{ color:var(--ppx-ink); line-height:1.55; margin:6px 0 10px; font-family:"Cormorant Garamond",serif; font-size:18px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-row{ display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-start !important; margin-top:8px; width:100%; }
#ppx-panel.ppx-v5 #ppx-v .ppx-grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:8px; width:100%; }
#ppx-panel.ppx-v5 #ppx-v .ppx-b, #ppx-panel.ppx-v5 #ppx-v .ppx-chip{
  -webkit-appearance:none; appearance:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:flex-start !important; gap:10px; width:100% !important; text-align:left;
  color:var(--ppx-ink); border:1px solid var(--ppx-border); border-radius:14px; padding:10px 14px !important; background:var(--ppx-green-650);
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 2px 8px rgba(0,0,0,.20); transition:transform .06s ease, filter .2s ease, box-shadow .2s ease, background .2s ease;
  font-family:"Cormorant Garamond",serif; font-size:17px !important;
}
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-cta{ background:#195446; }
#ppx-panel.ppx-v5 #ppx-v .ppx-b.ppx-secondary{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.22); padding:8px 12px !important; font-size:15px !important; box-shadow:none; }

/* >>> Reservierungsflow: kein Außenrahmen, Chat-Zeilen */
#ppx-panel.ppx-v5 #ppx-v [data-block^="resv-"]{ background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; max-width:100% !important; margin:10px 0 !important; }
#ppx-panel.ppx-v5 #ppx-v [data-block^="resv-"] .ppx-h{ display:none; }
#ppx-panel.ppx-v5 #ppx-v .ppx-msg{ background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.15); border-radius:12px; padding:8px 12px; margin:6px 0; display:inline-block; }

/* Inputs schlicht */
#ppx-panel.ppx-v5 #ppx-v .ppx-input input, #ppx-panel.ppx-v5 #ppx-v .ppx-input select, #ppx-panel.ppx-v5 #ppx-v .ppx-input textarea{
  width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.1); color:#fff; font-size:15px; outline:none;
}

/* Gruppenliste: vertikal, mittig, trotzdem volle Breite nutzbar */
#ppx-panel.ppx-v5 #ppx-v .ppx-groupcol{ display:flex; flex-direction:column; gap:10px; align-items:stretch; max-width:520px; margin:6px auto 2px; }

/* Slotgrid: eigener Scroll */
#ppx-panel.ppx-v5 #ppx-v .ppx-grid.ppx-slotgrid{ grid-template-columns:repeat(3,minmax(0,1fr)); max-height:280px; overflow:auto; padding-right:4px; }
@media (max-width:520px){ #ppx-panel.ppx-v5 #ppx-v .ppx-grid.ppx-slotgrid{ grid-template-columns:repeat(2,minmax(0,1fr)); max-height:260px; } }

/* Sonstiges */
#ppx-panel.ppx-v5 #ppx-v .ppx-nav{ display:flex; gap:10px; width:100%; justify-content:flex-start !important; margin-top:10px; }
#ppx-panel.ppx-v5 #ppx-v .ppx-nav .ppx-b{ flex:1 1 0; }
#ppx-panel.ppx-v5 #ppx-v [data-block="faq-root"] .ppx-h{ text-align:center; }
`;
    var tag = document.createElement('style'); tag.id = 'ppx-style-v74'; tag.textContent = css; document.head.appendChild(tag);
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
  function el(tag, attrs){ var n=document.createElement(tag); attrs=attrs||{}; Object.keys(attrs).forEach(function(k){
    if(k==='style'&&isObj(attrs[k])){ Object.assign(n.style,attrs[k]); }
    else if(k==='text'){ n.textContent=attrs[k]; }
    else if(k==='html'){ n.innerHTML=attrs[k]; }
    else if(k.slice(0,2)==='on'&&typeof attrs[k]==='function'){ n.addEventListener(k.slice(2),attrs[k]); }
    else { n.setAttribute(k, attrs[k]); }
  });
  for(var i=2;i<arguments.length;i++){ var c=arguments[i]; if(c==null) continue; n.appendChild(typeof c==='string'?document.createTextNode(c):c); }
  return n; }
  function pretty(s){
    return String(s||'')
      .replace(/[_-]+/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }
  function block(title,opts){ opts=opts||{}; var w=el('div',{class:'ppx-bot ppx-appear',style:{maxWidth:(opts.maxWidth||'640px'),margin:'12px auto'}}); if(title) w.appendChild(el('div',{class:'ppx-h'},title)); if($view) $view.appendChild(w); jumpBottom(); return w; }
  function line(txt, cls){ var n=el('div',{class:'ppx-m'+(cls?(' '+cls):'')},txt); return n; }
  function row(){ return el('div',{class:'ppx-row'}); }
  function grid(){ return el('div',{class:'ppx-grid'}); }
  function getScopeIndex(){ return $view ? $view.children.length : 0; }
  function popToScope(idx){ if(!$view) return; while($view.children.length>idx){ var last=$view.lastElementChild; if(!last) break; last.remove(); } jumpBottom(); }

  // kleine Chat-Helfer
  function appendMsg(B, text, delay){ var n=line(text,'ppx-msg'); if(delay){ setTimeout(function(){ B.appendChild(n); jumpBottom(); }, delay); } else { B.appendChild(n); } }
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
  // 4) SPEISEN (unverändert)
  function stepSpeisen(){
    var scopeIdx = getScopeIndex();
    var M = block(null); M.setAttribute('data-block','speisen-info');
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
    var pdfUrl = CFG.menuPdf || (CFG.pdf && (CFG.pdf.menu || CFG.pdf.url)) || CFG.menuPDF || 'speisekarte.pdf';
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Speisekarte als PDF', function(){ try{ window.open(pdfUrl,'_blank','noopener'); }catch(e){} }, '', '📄'));
    B.appendChild(r);

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
  }
  function renderItem(catKey, item){
    var scopeIdx = getScopeIndex();
    var title = (item && item.name) ? item.name : pretty(catKey);
    var B = block(title); B.setAttribute('data-block','speisen-item');
    if (item && (item.info || item.desc)) B.appendChild(line(item.info || item.desc));
    if (item && item.price) B.appendChild(line('Preis: ' + String(item.price)));
    if (item && item.hinweis) B.appendChild(line('ℹ️ ' + item.hinweis));
    setTimeout(function(){ askReserveAfterItem(scopeIdx); }, 3000);
  }
  function askReserveAfterItem(scopeIdx){
    var Q = block(null); Q.setAttribute('data-block','speisen-item-ask');
    Q.appendChild(line('Na, Appetit bekommen? 😍 Soll ich dir gleich einen Tisch reservieren?'));
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
    Q.appendChild(nav([ backBtnAt(scopeIdx) ]));
  }

  // 5) RESERVIEREN – Chat-Style
  var RESV = null;

  function stepReservieren(){
    RESV = { name:'', dateISO:'', dateReadable:'', time:'', persons:'', phone:'', email:'', group:null };
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-name');
    appendMsg(B, 'Du möchtest gerne reservieren?', 0);
    appendMsg(B, 'Darf ich bitte deinen Namen wissen?', 120);

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'text',placeholder:'Vor- und Nachname'}); rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var v = String(inp.value||'').trim();
      if(v.length<2){ alert('Bitte gib einen gültigen Namen ein.'); inp.focus(); return; }
      RESV.name = v;
      renderResvDate();
    }, 'ppx-cta', '➡️'));
    r.appendChild(homeBtn()); B.appendChild(r);
  }

  // ---- Date utils
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
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-date');
    appendMsg(B, 'Perfekt, '+RESV.name+'! 🙂', 0);
    appendMsg(B, 'Für welches Datum möchtest du reservieren?', 120);

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'date', min:todayISO(), placeholder:'TT.MM.JJJJ'}); rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var val = inp.value || ''; var d = val ? parseDateAny(val) : null;
      if(!d){ alert('Bitte wähle ein Datum.'); inp.focus(); return; }
      RESV.dateISO = d.toISOString().slice(0,10); RESV.dateReadable = fmtDateReadable(d);
      renderResvGroups(d, scopeIdx);
    }, 'ppx-cta', '🗓️'));
    r.appendChild(backBtnAt(scopeIdx)); B.appendChild(r);
  }

  // ---- Slot utils
  function hmToMin(s){ var a=s.split(':'), h=Number(a[0]), m=Number(a[1]||0); if(h===24&&m===0) return 1440; return h*60+m; }
  function minToHM(n){ var h=Math.floor(n/60), m=n%60; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); }

  function buildSlotsForDate(d){
    var wd = d.getDay(); // 0=So..6=Sa
    var span = (CFG.OPEN && CFG.OPEN[String(wd)]) || null;
    if(!span || !Array.isArray(span) || span.length<2) return [];
    var openMin = hmToMin(span[0]);
    var closeMin = hmToMin(span[1]);

    // letzte Stunde ausnehmen
    var lastStart = closeMin - 60;
    if (lastStart <= openMin) return [];

    var slots = [];
    for(var t=openMin; t<lastStart; t+=30){ slots.push(t); } // < lastStart

    // Lead-Time 4h nur für HEUTE
    var now = new Date();
    var isToday = now.getFullYear()===d.getFullYear() && now.getMonth()===d.getMonth() && now.getDate()===d.getDate();
    if(isToday){
      var lead = (now.getHours()*60 + now.getMinutes()) + 240; // +4h
      slots = slots.filter(function(t){ return t >= lead; });
    }
    return slots;
  }

  // Gruppenbildung: 1–3 Blöcke, lückenlos, Grenzen auf :00/:30
  function buildGroups(mins){
    if(!mins.length) return [];
    var start = mins[0], end = mins[mins.length-1] + 30; // end = exklusive Obergrenze
    var L = end - start;
    var G = (L <= 180) ? 1 : (L <= 360 ? 2 : 3);

    // naive Schnitte
    var cuts = [];
    for (var i=1;i<G;i++){ cuts.push(start + (L*i/G)); }

    // runde auf 30-Minuten, bevorzuge volle Stunde wenn nah
    cuts = cuts.map(function(c){
      var half = Math.round(c/30)*30;
      var onHour = Math.round(c/60)*60;
      if (Math.abs(onHour - c) <= 20) return onHour;
      return half;
    });

    // sortiert & innerhalb
    cuts = cuts.filter(function(c){ return c>start && c<end; }).sort(function(a,b){ return a-b; });

    // Bounds bilden und Segmente erzeugen
    var bounds = [start].concat(cuts).concat([end]);
    var groups = [];
    for (var j=0;j<bounds.length-1;j++){
      var a=bounds[j], b=bounds[j+1];
      // Slots im Bereich [a,b)
      var gSlots = mins.filter(function(t){ return t>=a && t<b; });
      if (gSlots.length >= 2){ // min 60 Min
        groups.push({from:a, to:b, slots:gSlots});
      }
    }
    if (!groups.length) groups = [{from:start, to:end, slots:mins}];
    return groups;
  }
  // Gruppen zuerst anzeigen
  function renderResvGroups(dateObj, backScopeIdx){
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-groups');

    appendMsg(B, 'Um welche Uhrzeit möchtest du reservieren?', 0);

    var minutes = buildSlotsForDate(dateObj);
    if(!minutes.length){
      appendMsg(B, 'Für dieses Datum sind aktuell keine Reservierungszeiten verfügbar (geschlossen oder zu kurzfristig).', 100);
      B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
      return;
    }

    var groups = buildGroups(minutes);

    // vertikale Liste
    var col = el('div',{class:'ppx-groupcol'});
    groups.forEach(function(g, idx){
      var label = minToHM(g.from)+' – '+minToHM(g.to);
      col.appendChild(btn(label, function(){ RESV.group=g; renderResvSlots(dateObj, g, backScopeIdx); }, (idx===groups.length-1?'ppx-cta':''), '⏱️'));
    });
    B.appendChild(col);

    B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
  }

  // Danach nur Slots des gewählten Blocks
  function renderResvSlots(dateObj, group, backScopeIdx){
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-time');
    appendMsg(B, 'Bitte wähle eine Uhrzeit:', 0);

    var G = grid(); G.classList.add('ppx-slotgrid');
    group.slots.forEach(function(t){
      var hm = minToHM(t);
      G.appendChild(chip(hm, function(){ RESV.time = hm; renderResvPersons(); }, '', '🕒'));
    });
    B.appendChild(G);

    // Zurück führt zur Gruppenauswahl
    B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
  }

  // ---- Persons
  function renderResvPersons(){
    var scopeIdx = getScopeIndex();
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-persons');
    appendMsg(B, 'Super, '+RESV.name+'!', 0);
    appendMsg(B, 'Für wie viele Personen darf ich den Tisch vorbereiten?', 120);

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'number', min:'1', max:'20', value:'2'}); rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Weiter', function(){
      var val = Number(inp.value||0);
      if(!val || val<1){ alert('Bitte gib eine gültige Anzahl ein.'); inp.focus(); return; }
      RESV.persons = String(val);
      renderResvPhone(scopeIdx);
    }, 'ppx-cta', '➡️'));
    r.appendChild(backBtnAt(scopeIdx)); B.appendChild(r);
  }

  // ---- Phone (optional)
  function renderResvPhone(backScopeIdx){
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-phone');
    appendMsg(B, 'Magst du mir deine Nummer dalassen? (optional)', 0);

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'tel',placeholder:'+49 …'}); rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Ohne Telefon weiter', function(){ RESV.phone=''; renderResvEmail(); }, 'ppx-secondary', '⏭️'));
    r.appendChild(btn('Weiter', function(){ RESV.phone = String(inp.value||'').trim(); renderResvEmail(); }, 'ppx-cta', '➡️'));
    B.appendChild(r);
    B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
  }

  // ---- Email (required)
  function isValidEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s||'').trim()); }
  function renderResvEmail(){
    var scopeIdx = getScopeIndex();
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','resv-email');
    appendMsg(B, 'Und deine E-Mail für die Bestätigung?', 0);
    appendMsg(B, 'Wir schicken dir dort eine kurze Eingangsbestätigung.', 120);

    var rowIn = row(); rowIn.className='ppx-input';
    var inp = el('input',{type:'email',placeholder:'dein.name@example.com'}); rowIn.appendChild(inp); B.appendChild(rowIn);

    var r = row();
    r.appendChild(btn('Anfrage senden', function(){
      var v = String(inp.value||'').trim();
      if(!isValidEmail(v)){ alert('Bitte gib eine gültige E-Mail-Adresse ein.'); inp.focus(); return; }
      RESV.email = v; submitReservation();
    }, 'ppx-cta', '✉️'));
    r.appendChild(backBtnAt(scopeIdx)); B.appendChild(r);
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
        if (tplAuto){ return emailjs.send(svcId, tplAuto, payload).catch(function(){}); }
      }).then(function(){ showReservationSuccess('emailjs'); })
        .catch(function(){ fallbackMailto(payload); showReservationSuccess('mailto'); });
      return;
    }
    fallbackMailto(payload); showReservationSuccess('mailto');
  }
  function fallbackMailto(p){
    var addr = CFG.email || (CFG.EMAIL && (CFG.EMAIL.to || CFG.EMAIL.toEmail)) || 'info@example.com';
    var body = encodeURIComponent([
      'Reservierungsanfrage',
      'Name: '+p.name,
      'Datum: '+p.date_readable,
      'Personen: '+p.persons,
      'Telefon: '+(p.phone||'-'),
      'E-Mail: '+p.email,
      '— gesendet via Bot'
    ].join('\n'));
    try{ window.location.href = 'mailto:'+addr+'?subject='+encodeURIComponent('Reservierung')+'&body='+body; }catch(e){}
  }
  function showReservationSuccess(kind){
    var B = block(null, {maxWidth:'100%'}); B.setAttribute('data-block','reservieren-success');
    appendMsg(B, 'Danke für deine Anfrage! Schau doch mal in deinem E-Mail-Postfach vorbei! 🙂', 0);
    appendMsg(B, 'Möchtest du noch etwas anderes wissen?', 120);
    var r = row();
    r.appendChild(btn('Ja, zeig mir die Q&As', function(){ stepQAs(); }, 'ppx-cta', '❓'));
    r.appendChild(btn('Nein, danke', function(){ var X=block(null); X.appendChild(line('Bis bald und buon appetito! 👋')); }, 'ppx-secondary', '✅'));
    B.appendChild(r);
    B.appendChild(nav([ homeBtn(), doneBtn() ]));
  }
  // 6) ÖFFNUNGSZEITEN
  function stepHours(){
    var scopeIdx = getScopeIndex();
    var B = block('ÖFFNUNGSZEITEN', {maxWidth:'100%'}); 
    B.setAttribute('data-block','hours');
    var lines = CFG.hoursLines || [];
    if (!lines.length) { B.appendChild(line('Keine Zeiten hinterlegt.')); }
    else { lines.forEach(function(rowArr){ var txt = Array.isArray(rowArr) ? (rowArr[0]+': '+rowArr[1]) : String(rowArr); B.appendChild(line('• '+txt)); }); }
    setTimeout(function(){ askReserveAfterHours(scopeIdx); }, 3000);
  }
  function askReserveAfterHours(scopeIdx){
    var Q = block(null, {maxWidth:'100%'}); Q.setAttribute('data-block','hours-ask');
    Q.appendChild(line('Passen die Zeiten? Wenn du magst, können wir jetzt mit der Reservierung fortfahren.'));
    var r = row(); r.style.justifyContent = 'flex-start';
    r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '🗓️'));
    r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
    Q.appendChild(r);
  }

  // 7) KONTAKT
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

  // 8) Q&As (wie gehabt)
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
    var B = block('Q&As', {maxWidth:'100%'}); B.setAttribute('data-block','faq-root');
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
    var B = block(title, {maxWidth:'100%'}); B.setAttribute('data-block','faq-cat');
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
    var B = block(q, {maxWidth:'100%'}); B.setAttribute('data-block','faq-answer');
    if (a)   B.appendChild(line(a));
    if (more) B.appendChild(line(more));
    if (isOrderQuick(it)){
      var r = row(); r.style.justifyContent = 'flex-start';
      var orderUrl = (CFG.orderUrl || (CFG.links && CFG.links.lieferando) || 'https://www.lieferando.de/');
      r.appendChild(btn('Lieferando öffnen', function(){ try{ window.open(orderUrl,'_blank','noopener'); }catch(e){} }, 'ppx-cta', '⚡'));
      if (CFG.phone){ r.appendChild(btn('Anrufen', function(){ window.location.href='tel:'+String(CFG.phone).replace(/\s+/g,''); }, '', '📞')); }
      B.appendChild(r);
      B.appendChild(nav([ backBtnAt(backScopeIdx), homeBtn() ]));
      return;
    }
    setTimeout(function(){ var Q = block(null, {maxWidth:'100%'}); Q.setAttribute('data-block','faq-answer-ask');
      Q.appendChild(line('Hilft dir das? Möchtest du als nächstes reservieren? 🙂'));
      var r = row(); r.style.justifyContent='flex-start';
      r.appendChild(btn('Ja, bitte reservieren', function(){ stepReservieren(); }, 'ppx-cta', '🗓️'));
      r.appendChild(btn('Nein, zurück ins Hauptmenü', function(){ goHome(); }, 'ppx-secondary', '🏠'));
      Q.appendChild(r);
      Q.appendChild(nav([ backBtnAt(backScopeIdx) ]));
    }, 3000);
  }

})(); // Ende IIFE
