  // ---------------------------------------------------------------------------
  // 5) RESERVIEREN (Append)
  // ---------------------------------------------------------------------------
  function stepReservieren(prevBlock){
    var B = block('RESERVIEREN');
    B.setAttribute('data-block','reservieren');

    B.appendChild(line('Schnell-Anfrage senden oder E-Mail öffnen:'));

    var r = row();
    r.style.justifyContent = 'flex-start';
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
      window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
    }, '', '✉️'));
    B.appendChild(r);

    B.appendChild(nav([ backBtn(prevBlock), doneBtn() ]));
  }

  function quickEmail(){
    var name = prompt('Dein Name:');                            if (!name) return;
    var when = prompt('Datum & Uhrzeit (z. B. 24.09. 19:00):'); if (!when) return;
    var ppl  = prompt('Personenanzahl:');                       if (!ppl) return;
    var tel  = prompt('Telefon (optional):') || '';

    var payload = {
      name: name, when: when, persons: ppl, phone: tel,
      brand: (CFG.brand || 'Restaurant')
    };

    // EmailJS vorhanden?
    if (window.emailjs && CFG.EMAIL && CFG.EMAIL.serviceId && CFG.EMAIL.templateId) {
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
    window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
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
      stepHome(); // Home einmalig rendern; bleibt stehen
    }
  });

  $close.addEventListener('click', function(){
    $panel.classList.remove('ppx-open');
  });

  // ESC schließt Panel
  window.addEventListener('keydown', function(e){
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
  // ---------------------------------------------------------------------------
  // 4) SPEISEN (erst Info, Delay, dann Block mit PDF + Kategorien)
  // ---------------------------------------------------------------------------
  function stepSpeisen(prevBlock){
    // 4.1) Info-Meldung wie gewünscht
    var M = block(null);
    M.appendChild(line('Super Wahl 👍  Hier sind unsere Speisen-Kategorien:'));

    // 4.2) kurzer Delay, dann eigentlicher "SPEISEN"-Block
    setTimeout(function(){ renderSpeisenRoot(prevBlock); }, 500);
  }

  function renderSpeisenRoot(prevBlock){
    var B = block('SPEISEN');
    B.setAttribute('data-block','speisen-root');

    // PDF-Button wie im Screenshot (links ausgerichtet)
    if (CFG.menuPdf) {
      var r = row();
      r.style.justifyContent = 'flex-start';
      r.appendChild(
        btn('Speisekarte als PDF', function(){
          window.open(CFG.menuPdf, '_blank');
        }, '', '📄')
      );
      B.appendChild(r);
    }

    // Hinweiszeile
    B.appendChild(line('…oder wähle eine Kategorie:'));

    // Kategorien: Daten oder Fallback exakt wie gewünscht
    var cats = Object.keys(DISH);
    if (!cats.length) cats = ['Antipasti','Salat','Pizza','Pasta','Drinks','Desserts'];

    // Kategorien-Liste als EINSPALTIGE Liste (volle Zeile je Chip)
    var G = grid();
    G.style.gridTemplateColumns = '1fr'; // volle Zeile pro Button
    cats.forEach(function(cat){
      var list  = Array.isArray(DISH[cat]) ? DISH[cat] : [];
      var count = list.length ? ' ('+list.length+')' : '';
      G.appendChild(
        chip(pretty(cat)+count, function(){ renderCategory(cat, B); }, '', '▶️')
      );
    });
    B.appendChild(G);

    // Nav: Zurück | Reservieren | Fertig (eine Reihe, linksbündig)
    B.appendChild(nav([ backBtn(prevBlock), resBtn(B), doneBtn() ]));
  }

  function renderCategory(catKey, parentBlock){
    var title = 'Gern! Hier ist die Auswahl für '+pretty(catKey)+':';
    var B = block(title);
    B.setAttribute('data-block','speisen-cat');

    var list = Array.isArray(DISH[catKey]) ? DISH[catKey] : [];

    // Fallback-Demos, falls keine Items hinterlegt sind
    if (!list.length) {
      list = [
        { name: pretty(catKey)+' Classic', price:'9,50' },
        { name: pretty(catKey)+' Special', price:'12,90' }
      ];
    }

    // Items als Chips (links ausgerichtet, kompakter)
    var L = grid();
    L.style.gridTemplateColumns = '1fr'; // eine Spalte, volle Breite
    list.forEach(function(it){
      var label = (it.name || 'Artikel') + (it.price ? (' – '+it.price+' €') : '');
      L.appendChild(
        chip(label, function(){ renderItem(catKey, it, B); }, '', '➜')
      );
    });
    B.appendChild(L);

    // Nav
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
    r.style.justifyContent = 'flex-start';
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
      window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
    }, '', '✉️'));
    B.appendChild(r);

    B.appendChild(nav([ backBtn(prevBlock), doneBtn() ]));
  }

  function quickEmail(){
    var name = prompt('Dein Name:');                            if (!name) return;
    var when = prompt('Datum & Uhrzeit (z. B. 24.09. 19:00):'); if (!when) return;
    var ppl  = prompt('Personenanzahl:');                       if (!ppl) return;
    var tel  = prompt('Telefon (optional):') || '';

    var payload = {
      name: name, when: when, persons: ppl, phone: tel,
      brand: (CFG.brand || 'Restaurant')
    };

    // EmailJS vorhanden?
    if (window.emailjs && CFG.EMAIL && CFG.EMAIL.serviceId && CFG.EMAIL.templateId) {
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
    window.location.href = 'mailto:'+addr+'?subject=Reservierung&body='+body;
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
      stepHome(); // Home einmalig rendern; bleibt stehen (zentriert)
    }
  });

  $close.addEventListener('click', function(){
    $panel.classList.remove('ppx-open');
  });

  // ESC schließt Panel
  window.addEventListener('keydown', function(e){
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
