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
    background:{t:'Background',p:'From Malaysia, through INTI International College, to San Francisco State, where I am pursuing a B.S. in Computer Science.',d:[['Ref drawing','A-002'],['From','Malaysia'],['Previous','INTI International College']]},
    now:{t:'Now',p:'I am studying Computer Science at San Francisco State and working as a Student Lead in Aquatics, with software engineering experience across systems, interfaces and physical operations.',d:[['Studying','B.S. Computer Science'],['Current','Student Lead, Aquatics'],['Seeking','Summer 2027 software engineering internship']]},
    engineering:{t:'Engineering',p:'I am interested in software that connects systems, interfaces and physical operations, with a focus on making complicated tools usable by the people who depend on them.',d:[['Ref drawings','A-004 · A-005'],['Experience','Backend · full stack · mobile'],['Focus','Systems · operability']]},
    athletics:{t:'Athletics',p:'Competitive swimming provides the domain knowledge behind SplitWise, while lifeguarding and aquatics work bring a different kind of operational responsibility outside software.',d:[['Ref drawing','A-002'],['Discipline','Swimming'],['Applied in','SplitWise · 05.6']]}
  };
  var parts=[].slice.call(document.querySelectorAll('#a001 .part')),
      st=document.getElementById('spec-t'),
      sp=document.getElementById('spec-p'),
      sd=document.getElementById('spec-d');
      panel=document.getElementById('specpanel');
  if(parts.length&&st&&sp&&sd&&panel){
    function show(k,focus){var s=SPEC[k];if(!s)return;
      parts.forEach(function(n){var on=n.dataset.part===k;
        n.setAttribute('aria-selected',String(on));n.tabIndex=on?0:-1;
        if(on&&focus)n.focus();});
      panel.setAttribute('aria-labelledby','tab-'+k);
      st.textContent=s.t;sp.textContent=s.p;
      sd.innerHTML=s.d.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('');}
    var STEP={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1};
    parts.forEach(function(n,i){
      n.addEventListener('click',function(){show(n.dataset.part)});
      n.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();show(n.dataset.part);return}
        var d=STEP[e.key],j=e.key==='Home'?0:e.key==='End'?parts.length-1:d?(i+d+parts.length)%parts.length:-1;
        if(j<0)return;e.preventDefault();show(parts[j].dataset.part,true);});});
  }

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

/* A-004: selecting a module lists the drawings that use it. aria-pressed is the
   right pattern here — this is a toggle, not a single-select tab set, and the
   A-001 assembly's tablist is deliberately scoped separately. */
(function(){
  var mods=[].slice.call(document.querySelectorAll('.mod')),
      out=document.getElementById('modout-body');
  if(!mods.length||!out)return;
  var PROJ={'05.1':'cad-to-map','05.2':'Asset Management','05.3':'ePOS Simulator',
            '05.4':'ScoutMini','05.5':'MeeTeam','05.6':'SplitWise'};
  var IDLE='Select a module above to see which drawings use it.';
  function label(ref){
    if(ref.charAt(0)==='A')return '<a href="#a003">'+ref+' Experience</a>';
    return '<a href="#a005">'+ref+' '+(PROJ[ref]||'')+'</a>';
  }
  mods.forEach(function(b){
    b.addEventListener('click',function(){
      var wasOn=b.getAttribute('aria-pressed')==='true';
      mods.forEach(function(m){m.setAttribute('aria-pressed','false')});
      if(wasOn){out.textContent=IDLE;return}
      b.setAttribute('aria-pressed','true');
      var refs=(b.getAttribute('data-refs')||'').split(' ').filter(Boolean);
      if(!refs.length){out.textContent='Used across the whole set rather than in one drawing.';return}
      out.innerHTML=refs.map(label).join(' &nbsp;&middot;&nbsp; ');
    });
  });
})();
