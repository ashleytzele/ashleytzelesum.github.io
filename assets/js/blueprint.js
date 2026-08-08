(function(){
  var sheets=[].slice.call(document.querySelectorAll('[data-draw]'));
  if('IntersectionObserver'in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('drawn');io.unobserve(e.target)}})},{threshold:0,rootMargin:'0px 0px -8% 0px'});
    sheets.forEach(function(s){io.observe(s)});
  } else sheets.forEach(function(s){s.classList.add('drawn')});

  var links=[].slice.call(document.querySelectorAll('.index a'));
  var order=links.map(function(a){return a.hash.slice(1)}), open=new Set();
  if('IntersectionObserver'in window){
    var io2=new IntersectionObserver(function(en){
      en.forEach(function(e){e.isIntersecting?open.add(e.target.id):open.delete(e.target.id)});
      var cur=order.find(function(id){return open.has(id)});
      links.forEach(function(a){a.hash.slice(1)===cur?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
    },{rootMargin:'-42% 0px -42% 0px'});
    order.forEach(function(id){var el=document.getElementById(id);if(el)io2.observe(el)});
  }

  /* project details expand in place */
  [].slice.call(document.querySelectorAll('.more')).forEach(function(b){
    b.addEventListener('click',function(){
      var d=document.getElementById(b.dataset.more);
      var isOpen=d.getAttribute('data-open')==='true';
      d.setAttribute('data-open',String(!isOpen));
      b.setAttribute('aria-expanded',String(!isOpen));
      var lab=b.dataset.label||b.dataset.more.replace('p','05.');
      b.textContent=(isOpen?'Open detail \u2014 ':'Close detail \u2014 ')+lab;
    });
  });

  /* A-001 component specifications */
  var SPEC={
    engineering:{t:'Engineering',p:'Most of what I build sits between software and something physical: roadside equipment, thermal printers, CAD drawings, race timing. The interesting part is usually making something complicated operable by whoever has to use it.',d:[['Ref drawing','A-004'],['Projects','6'],['Public','4']]},
    athlete:{t:'Athlete',p:'I swim competitively, which is where SplitWise came from. Knowing which numbers actually matter to a swimmer turned out to be most of the design work.',d:[['Ref drawing','A-002'],['Discipline','Swimming'],['Applied in','05.4']]},
    leadership:{t:'Leadership',p:'Lifeguard first, then student lead in aquatics. Both are places where other people depend on you paying attention, which is a different kind of pressure from a deadline.',d:[['Ref drawing','A-003'],['Current','Student Lead, Aquatics'],['Since','2025']]},
    background:{t:'Background',p:'From Malaysia, via INTI International College, now Computer Science at San Francisco State.',d:[['Ref drawing','A-002'],['From','Malaysia'],['Now','San Francisco']]}
  };
  var parts=[].slice.call(document.querySelectorAll('.part')),
      st=document.getElementById('spec-t'),
      sp=document.getElementById('spec-p'),
      sd=document.getElementById('spec-d');
  var panel=document.getElementById('specpanel');
  function show(k,focus){var s=SPEC[k];if(!s)return;
    parts.forEach(function(n){var on=n.dataset.part===k;
      n.setAttribute('aria-selected',String(on));n.tabIndex=on?0:-1;
      if(on&&focus)n.focus();});
    panel.setAttribute('aria-labelledby','tab-'+k);
    st.textContent=s.t;sp.textContent=s.p;
    sd.innerHTML=s.d.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('');}
  // Roving tabindex: one stop for the whole group, arrows move between components.
  var STEP={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1};
  parts.forEach(function(n,i){
    n.addEventListener('click',function(){show(n.dataset.part)});
    n.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();show(n.dataset.part);return}
      var d=STEP[e.key],j=e.key==='Home'?0:e.key==='End'?parts.length-1:d?(i+d+parts.length)%parts.length:-1;
      if(j<0)return;e.preventDefault();show(parts[j].dataset.part,true);});});

  /* theme toggle: "sheet polarity" field in the index footer. The initial
     theme itself is applied by the inline script in <body> so there is no
     flash; this only wires the click and keeps the label/meta in sync. No
     localStorage read here — the inline script already applied any stored
     choice to data-theme before this file even loaded. */
  var themeBtn=document.getElementById('themeToggle');
  if(themeBtn){
    var THEME_LABEL={light:'Sheet · Normal',dark:'Sheet · Inverted'};
    var effectiveTheme=function(){
      var t=document.documentElement.getAttribute('data-theme');
      if(t==='light'||t==='dark')return t;
      return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    };
    var syncThemeBtn=function(theme){
      themeBtn.textContent=THEME_LABEL[theme];
      themeBtn.setAttribute('aria-pressed',String(theme==='dark'));
    };
    syncThemeBtn(effectiveTheme());
    themeBtn.addEventListener('click',function(){
      var next=effectiveTheme()==='dark'?'light':'dark';
      document.documentElement.setAttribute('data-theme',next);
      var color=next==='dark'?'#0D0D0D':'#FFFFFF';
      [].slice.call(document.querySelectorAll('meta[name="theme-color"]')).forEach(function(m){
        m.setAttribute('content',color);
      });
      try{localStorage.setItem('theme',next)}catch(e){}
      syncThemeBtn(next);
    });
  }
})();
