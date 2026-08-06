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
    engineering:{t:'Engineering',p:'Six documented projects: three from a professional engagement, three published as open source. Most of it has been enterprise systems — dashboards, ERP customisation, mobile, hardware integration.',d:[['Ref drawing','A-005'],['Projects','6'],['Public','3']]},
    experience:{t:'Experience',p:'Four roles across software and operations. The software work is at OSPIT Mobility; the aquatics and support roles are where I learned to run things other people depend on.',d:[['Ref drawing','A-003'],['Roles','4'],['Current','Software Engineering Intern']]},
    education:{t:'Education',p:'Computer Science at San Francisco State, transferred from INTI International College in Malaysia. Coursework has been fundamentals: data structures, algorithms, object-oriented programming, systems.',d:[['Ref drawing','A-002'],['Institution','San Francisco State'],['Degree','B.S. Computer Science']]},
    modules:{t:'System Modules',p:'What I build with, arranged by where it sits in the stack. Python and Flask do most of the work, Java and Android for mobile, MongoDB and SQL for what persists.',d:[['Ref drawing','A-004'],['Languages','6'],['Interests','10']]}
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
})();
