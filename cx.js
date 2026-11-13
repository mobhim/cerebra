/* Cerebra unified layer. Loaded by every page. */
(function(){
  /* SHOWCASE=true plays full motion for everyone (client demo). Set it to false before the real launch
     so visitors whose system asks for reduced motion get the calm version. */
  var SHOWCASE=true;
  var reduced=!SHOWCASE&&!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches), EASE='cubic-bezier(.16,1,.3,1)';
  if(reduced) document.documentElement.classList.add('cxm-reduced');
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var noop=function(){};

  /* ---------- light mode for weak devices ----------
     Same pages and the same motion, minus the parts that cost the most to draw: animated blur, frosted glass,
     looping photo reels, background video. It switches on from what the device says about itself (few cores,
     little memory, data-saver, reduced motion), from ?lite=1, or by itself if the first second runs slowly. */
  var root=document.documentElement, conn=navigator.connection||{};
  var LITE=reduced||!!conn.saveData||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory>0&&navigator.deviceMemory<=4)||/[?&]lite=1/.test(location.search);
  var liteHooks=[];
  function goLite(){ if(LITE&&root.classList.contains('cx-lite')) return; LITE=true; root.classList.add('cx-lite'); liteHooks.forEach(function(f){try{f()}catch(e){}}) }
  if(LITE) root.classList.add('cx-lite');
  else if(window.requestAnimationFrame){
    /* frame-time probe: ~1.2s after load; if frames average slower than 30fps the page drops to light mode */
    addEventListener('load',function(){setTimeout(function(){
      if(document.hidden) return;
      var n=0,t0=performance.now(),last=t0,worst=0;
      (function f(now){ var d=now-last; last=now; if(n>2&&d>worst) worst=d; n++;
        if(now-t0<1200) requestAnimationFrame(f); else { var avg=(now-t0)/n; if(n>8&&avg>33) goLite() } })(t0);
    },600)});
  }

  /* One file for every page. The parts that rebuild the homepage only run there (the page sets window.CX_HOME). */
  var HOME=!!window.CX_HOME; if(HOME) document.documentElement.classList.add('cx-home');

  /* ---------- 1. hero (the prompt's layout, Cerebra's own words) ---------- */
  var cover=HOME&&$('.banner-cover');
  if(cover){
    cover.insertBefore($('#cxh-tpl').content.cloneNode(true),cover.firstChild);
    cover.classList.add('cxm-hero-on');
    var hero=$('.cxh',cover);
    /* the site's own hero video moves in behind the new hero (its poster paints first) */
    var ov=$('.section-banner video',cover), hb=$('.cxh-bg',hero);
    if(ov&&hb){hb.appendChild(ov);ov.muted=true}   /* playback is handled with every other video, below */
    /* one quick entrance: the headline first (it is the message), the rest lands right behind it. Done in about 0.8s. */
    var ins=$$('.cxm-in',hero), h1=$('h1',hero);
    if(reduced){ins.forEach(function(el,i){el.animate([{opacity:0},{opacity:1}],{duration:300,delay:i*40,easing:'ease-out',fill:'forwards'})})}
    else{
      var blk=function(el,d){el.animate([{opacity:0,transform:'translateY(.6rem)'},{opacity:1,transform:'none'}],{duration:480,delay:d,easing:EASE,fill:'forwards'})};
      h1.style.opacity=1;h1.classList.add('cxh-split');
      var words=h1.textContent.trim().split(/\s+/); h1.innerHTML=words.map(function(w){return '<span class="fw">'+w+'</span>'}).join(' ');
      $$('.fw',h1).forEach(function(w,i){w.animate(LITE?[{opacity:0,transform:'translateY(.28em)'},{opacity:1,transform:'none'}]:[{opacity:0,transform:'translateY(.28em)',filter:'blur(8px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:560,delay:60+i*55,easing:EASE,fill:'backwards'})});
      ins.forEach(function(el,i){if(el!==h1)blk(el,el.classList.contains('cxh-pill')?260:200+i*60)});
    }
  }

  /* in-page links glide to their section and account for the fixed navbar */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#cx-"]'); if(!a) return;
    var to=document.getElementById(a.getAttribute('href').slice(1)); if(!to) return;
    e.preventDefault();
    scrollTo({top:to.getBoundingClientRect().top+scrollY-90,behavior:reduced?'auto':'smooth'});
    var f=to.querySelector('input:not([type=radio])'); if(f) setTimeout(function(){f.focus({preventScroll:true})},reduced?0:500);
  });

  /* ---------- Black Hat photos (the site's own) as two vertical reels in the hero ---------- */
  (function(){
    var srcs=[];$$('.banner-cover .marquee-image').forEach(function(i){var s=i.getAttribute('src');if(s&&srcs.indexOf(s)<0)srcs.push(s)});
    if(!srcs.length) return;
    var half=Math.ceil(srcs.length/2), cols=[srcs.slice(0,half),srcs.slice(half).concat(srcs.slice(0,1))];
    $$('.cxh-reel .track').forEach(function(t,i){var list=cols[i%2],h='';list.concat(list).forEach(function(s){h+='<img src="'+s+'" alt="" loading="lazy" decoding="async">'});t.innerHTML=h});
  })();

  /* ---------- platforms: a small live panel per platform, in place of the lottie clips ----------
     Same job as the clips (show what the platform does) but built from the site's own type and glass,
     readable, and a few hundred bytes each. Labels are the modules the copy beside them already names. */
  (function(){
    var sec=HOME&&$('.teaser-section'); if(!sec) return;
    var I={
      user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/>',
      key:'<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5 19 4M16 7l2.5 2.5M13.5 9.5l2 2"/>',
      shield:'<path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6z"/><path d="m9 12 2.2 2.2L15 10.5"/>',
      reset:'<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5M20 5v4.5h-4.5M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5M4 19v-4.5h4.5"/>',
      mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7.5 8 6 8-6"/>',
      board:'<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4h6v3H9zM9 13.5l2 2 4-4"/>',
      learn:'<path d="M3 9.5 12 5l9 4.5-9 4.5z"/><path d="M7 12v4c1.5 1.3 3.2 2 5 2s3.5-.7 5-2v-4"/>',
      alert:'<path d="M12 4 3 19.5h18z"/><path d="M12 10v4.5M12 17.2v.3"/>',
      msg:'<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/>',
      phone:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
      chat:'<path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1.100A8 8 0 1 0 12 4z"/>',
      call:'<path d="M6 4h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4z"/>',
      bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0"/>',
      check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>'
    };
    var svg=function(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+I[k]+'</svg>'};
    var S=[
      {ic:'user',t:'طلب تسجيل دخول',s:'هوية واحدة لكل الأنظمة والتطبيقات',a:'جارٍ التحقق',b:'تم التحقق',
       rows:[['key','الدخول الموحّد','SSO'],['shield','المصادقة متعددة العوامل','MFA'],['reset','إعادة تعيين كلمة المرور ذاتيًا','SSPR']]},
      {ic:'mail',t:'رسالة واردة للموظف',s:'محاكاة تصيّد احتيالي',a:'قيد الفحص',b:'تم كشفها',
       rows:[['board','الحوكمة والمخاطر والامتثال','BeShield'],['learn','التوعية بالأمن السيبراني','InfoShield'],['alert','محاكاة التصيّد الاحتيالي','PhishGuard']]},
      {ic:'msg',t:'رسالة واحدة',s:'إدارة مركزية لجميع القنوات',a:'جارٍ الإرسال',b:'تم التسليم',
       rows:[['phone','الرسائل النصية','SMS'],['mail','البريد الإلكتروني','Email'],['chat','واتساب','WhatsApp'],['call','المكالمات الصوتية','Voice'],['bell','الإشعارات الفورية','Push']]}
    ];
    function scene(d,done){
      var h='<div class="cxp-scene'+(done?' on fin':'')+'"><div class="cxp-card cxp-top"><span class="cxp-ic">'+svg(d.ic)+'</span><span class="cxp-tx"><b>'+d.t+'</b><span>'+d.s+'</span></span><span class="cxp-pill"><i>'+d.a+'</i><i>'+d.b+'</i></span></div><div class="cxp-card cxp-list">';
      d.rows.forEach(function(r){h+='<div class="cxp-row'+(done?' done':'')+'"><span class="cxp-ic">'+svg(r[0])+'</span><span class="cxp-tx"><b>'+r[1]+'</b><span>'+r[2]+'</span></span><span class="cxp-st">'+svg('check')+'</span></div>'});
      return h+'</div></div>';
    }
    /* tablet / phone: one finished panel inside each platform block */
    $$('.teaser-img-tablet-down',sec).forEach(function(box,i){if(!S[i])return;var p=document.createElement('div');p.className='cxp';p.setAttribute('aria-hidden','true');p.innerHTML=scene(S[i],true);box.appendChild(p)});
    /* desktop: one sticky stage; the panel follows whichever platform is being read */
    var wrap=$('.p-teaser-img-wrap-3',sec), copies=$$('.teaser-copy-wrap-2',sec); if(!wrap) return;
    var stage=document.createElement('div');stage.className='cxp';stage.setAttribute('aria-hidden','true');
    stage.innerHTML=S.map(function(d){return scene(d,reduced)}).join('');wrap.appendChild(stage);
    var scenes=$$('.cxp-scene',stage), cur=-1, timer=0;
    function run(sc){            /* rows confirm one after another, then the request resolves; replays while on screen */
      clearTimeout(timer); if(reduced) return;
      var rows=$$('.cxp-row',sc), k=0;
      sc.classList.remove('fin');rows.forEach(function(r){r.classList.remove('done')});
      (function next(){
        if(k<rows.length){rows[k++].classList.add('done');timer=setTimeout(next,260)}
        else{sc.classList.add('fin');timer=setTimeout(function(){run(sc)},3200)}
      })();
    }
    function show(i){
      if(i===cur) return; cur=i;
      scenes.forEach(function(s,j){s.classList.toggle('on',j===i)});
      if(i>=0){clearTimeout(timer);timer=setTimeout(function(){run(scenes[i])},160)} else clearTimeout(timer);
    }
    if(!('IntersectionObserver' in window)){show(0);return}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)show(copies.indexOf(e.target))})},{rootMargin:'-45% 0px -45% 0px'});
    copies.forEach(function(c){io.observe(c)});
    show(0);
    /* nothing ticks while the section is off screen */
    new IntersectionObserver(function(es){if(!es[0].isIntersecting){clearTimeout(timer)}else if(cur>=0){run(scenes[cur])}}).observe(sec);
  })();

  /* ---------- proof: the ministry case study and the frameworks, moved from the mPass page to the front page ----------
     Every figure and name here is taken from cerebra.sa/mpass as published. */
  (function(){
    var after=HOME&&$('.section-trust'); if(!after) return;
    var s=document.createElement('section');s.className='cxn cxn-case';s.id='cx-case';
    s.innerHTML='<div class="cxn-in"><div class="cxc-card">'
      +'<div class="cxc-num"><b class="cxc-fig">98%</b><span>انخفاض في الوصول غير المصرّح به</span></div>'
      +'<div class="cxc-body"><h2 class="section-title">وزارة وطنية أمّنت <span class="purple-text">أكثر من 20,000 موظف</span></h2>'
      +'<p class="text-base">طبّقت الوزارة المصادقة متعددة العوامل والدخول الموحّد من mPass على موظفيها في مواقعهم المختلفة، بتوافق كامل مع معايير الهيئة الوطنية للأمن السيبراني.</p>'
      +'<a class="cxb" href="mpass.html">اطّلع على دراسة الحالة</a></div>'
      +'<div class="cxc-std"><p>mPass مصمَّمة لتلبية متطلبات</p><ul>'
      +[['NCA','الهيئة الوطنية للأمن السيبراني'],['SAMA','البنك المركزي السعودي'],['PCI-DSS','أمن بيانات بطاقات الدفع'],['GDPR','اللائحة العامة لحماية البيانات'],['HIPAA','خصوصية البيانات الصحية']]
        .map(function(x){return '<li><b>'+x[0]+'</b><span>'+x[1]+'</span></li>'}).join('')
      +'</ul></div></div></div>';
    after.parentNode.insertBefore(s,after.nextSibling);
  })();

  /* ---------- reviews: keep the ones that read clearly; three were garbled or lukewarm in translation ---------- */
  ['إنه على رأس الحلول بعد انتهاء الترخيص','ملاحظات SAAS','منتج جيد بشكل عام يمكن تحسينه'].forEach(function(k){
    $$('.section-review .review-card').forEach(function(c){if(c.textContent.indexOf(k)>-1)c.remove()});
  });

  /* ---------- reviews as a rating summary plus one swipeable row of cards ----------
     The same reviews and the same Gartner rating, laid out the way phone app stores present them: the score
     on one side, review cards in a row that snaps as you swipe or use the arrows. It replaces five screens of
     scattered cards that had to be scrolled past. All text is read from the original cards. */
  (function(){
    var sec=HOME&&$('.section-review'); if(!sec) return;
    var old=$('.section-main-wrapper.review',sec), rate=$('.rating-card-wrapper',sec); if(!old||!rate) return;
    var txt=function(el){return el?el.textContent.replace(/\s+/g,' ').trim():''};
    var esc=function(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
    var seen={}, cards=[];
    $$('.review-card',sec).forEach(function(c){
      var meta=$$('.p-name',c).map(txt), t=txt($('.body-text',c)); if(!t||seen[t]) return; seen[t]=1;
      cards.push({star:($('img',c)||{}).src||'', product:(meta[0]||'').replace(/^المنتج:\s*/,''), date:(meta[1]||'').replace(/^تمت المراجعة في\s*/,''), title:t, body:txt($('.review-des',c))});
    });
    if(!cards.length) return;
    var link=$('a',rate), head=$('h2',old), headWrap=head&&(head.closest('[class*="header"]')||head.parentNode);
    var box=document.createElement('div');box.className='cxr';
    box.innerHTML='<div class="cxr-head"></div><div class="cxr-body">'
      +'<div class="cxr-sum"><img class="cxr-logo" alt="Gartner Peer Insights" loading="lazy" src="'+esc(($('.gratner-logo',rate)||{}).src||'')+'">'
      +'<div class="cxr-score"><b>'+esc(txt($('.rate',rate)))+'</b><span>من 5</span></div>'
      +'<img class="cxr-stars" alt="" loading="lazy" src="'+esc(($('img.star',rate)||{}).src||'')+'">'
      +'<p><strong>'+esc(txt($('.title-32-px',rate)))+'</strong>'+esc(txt($('.rating-des',rate)))+'</p>'
      +(link?'<a class="cxr-link" target="_blank" rel="noopener" href="'+esc(link.getAttribute('href'))+'">'+esc(txt(link))+'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 5 7 10l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>':'')
      +'</div><div class="cxr-side"><div class="cxr-rail" role="list" tabindex="0" aria-label="مراجعات العملاء">'
      +cards.map(function(c){return '<article class="cxr-card" role="listitem"><header><h3>'+esc(c.title)+'</h3><time>'+esc(c.date)+'</time></header>'
        +'<div class="cxr-meta">'+(c.star?'<img alt="" loading="lazy" src="'+esc(c.star)+'">':'')+'<span>'+esc(c.product)+'</span></div><p>'+esc(c.body)+'</p></article>'}).join('')
      +'</div><div class="cxr-nav"><button type="button" class="cxr-prev" aria-label="المراجعة السابقة"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      +'<button type="button" class="cxr-next" aria-label="المراجعة التالية"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 5 7 10l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div></div>';
    if(headWrap) $('.cxr-head',box).appendChild(headWrap);
    old.parentNode.insertBefore(box,old); old.style.display='none'; sec.classList.add('cxr-on');
    var rail=$('.cxr-rail',box), prev=$('.cxr-prev',box), next=$('.cxr-next',box);
    var rtl=getComputedStyle(rail).direction==='rtl', step=function(){var c=$('.cxr-card',rail);return c?c.getBoundingClientRect().width+14:320};
    var go=function(d){rail.scrollBy({left:d*(rtl?-1:1)*step(),behavior:reduced?'auto':'smooth'})};
    prev.addEventListener('click',function(){go(-1)}); next.addEventListener('click',function(){go(1)});
    var tick=0, sync=function(){tick=0;var x=Math.abs(rail.scrollLeft), max=rail.scrollWidth-rail.clientWidth; prev.disabled=x<4; next.disabled=x>max-4};
    rail.addEventListener('scroll',function(){if(!tick)tick=requestAnimationFrame(sync)},{passive:true});
    addEventListener('resize',sync); sync();
  })();

  /* ---------- book a demo: one short flow on the page itself ----------
     Pick the platform, three fields, a clear confirmation. DEMO BUILD: nothing is transmitted yet;
     on the real site the submit handler posts to the CRM form that the contact form already uses. */
  (function(){
    var foot=$('.section-footer'); if(!foot||/book-a-demo/.test(location.pathname)) return;   /* that page already is the form */
    var P=[['mPass','الهوية والوصول'],['Deep I','الحوكمة والتوعية'],['LinQ2','التواصل الموحّد'],['لم أحدد بعد','ساعدوني في الاختيار']];
    var s=document.createElement('section');s.className='cxn cxn-demo';s.id='cx-demo';
    s.innerHTML='<div class="cxn-in"><div class="cxd-card">'
      +'<div class="cxd-copy"><h2 class="section-title">احجز <span class="purple-text">عرضًا تجريبيًا</span></h2>'
      +'<p class="text-base">اختر المنصة التي تهمّك، وسيتواصل معك أحد مختصّينا لتحديد موعد عرض يناسب جهتك.</p>'
      +'<ul class="cxd-pts"><li>عرض حيّ على حالة استخدام من قطاعك</li><li>إجابات عن التكامل مع أنظمتك الحالية</li><li>بدون أي التزام</li></ul></div>'
      +'<form class="cxd-form" novalidate><fieldset><legend>المنصة</legend><div class="cxd-chips">'
      +P.map(function(p,i){return '<label class="cxd-chip"><input type="radio" name="platform" value="'+p[0]+'"'+(i===0?' checked':'')+'><span><b>'+p[0]+'</b>'+p[1]+'</span></label>'}).join('')
      +'</div></fieldset>'
      +'<label class="cxd-f"><span>الاسم</span><input name="name" autocomplete="name" required><em>اكتب اسمك</em></label>'
      +'<label class="cxd-f"><span>بريد العمل</span><input name="email" type="email" inputmode="email" autocomplete="email" dir="ltr" placeholder="name@company.sa" required><em>اكتب بريد عمل صحيح، مثل name@company.sa</em></label>'
      +'<label class="cxd-f"><span>الجهة</span><input name="org" autocomplete="organization" required><em>اكتب اسم الجهة</em></label>'
      +'<button type="submit" class="cxb">أرسل الطلب</button></form>'
      +'<div class="cxd-done" hidden tabindex="-1" role="status"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></i>'
      +'<h3></h3><p class="text-base"></p><small>نسخة عرض: الطلب لا يُرسل فعليًا بعد.</small><button type="button" class="cxd-again">طلب آخر</button></div>'
      +'</div></div>';
    foot.parentNode.insertBefore(s,foot);
    var f=$('.cxd-form',s), done=$('.cxd-done',s);
    function check(inp){var v=inp.value.trim(), ok=inp.type==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v):v.length>1;
      inp.parentNode.classList.toggle('bad',!ok);inp.setAttribute('aria-invalid',ok?'false':'true');return ok}
    $$('input:not([type=radio])',f).forEach(function(i){i.addEventListener('blur',function(){if(i.value)check(i)});i.addEventListener('input',function(){if(i.parentNode.classList.contains('bad'))check(i)})});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=$$('input:not([type=radio])',f).filter(function(i){return !check(i)});
      if(bad.length){bad[0].focus();return}
      var name=f.elements.name.value.trim(), plat=f.elements.platform.value;
      $('h3',done).textContent='استلمنا طلبك، '+name;
      $('p',done).textContent=(plat==='لم أحدد بعد'?'سيساعدك مختصّ في اختيار المنصة المناسبة':'طلب عرض '+plat)+'. سنتواصل معك على '+f.elements.email.value.trim()+' لتحديد الموعد.';
      f.hidden=true;done.hidden=false;done.focus({preventScroll:true});
    });
    $('.cxd-again',done).addEventListener('click',function(){f.reset();done.hidden=true;f.hidden=false;f.elements.name.focus()});
  })();

  /* ---------- word split (Arabic-safe) ---------- */
  function split(el){
    var out=[];
    (function walk(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){var parts=n.textContent.split(/(\s+)/),frag=document.createDocumentFragment();
          parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return}
            var s=document.createElement('span');s.className='cxm-w';s.textContent=p;frag.appendChild(s);out.push(s)});
          n.parentNode.replaceChild(frag,n);
        } else if(n.nodeType===1&&n.tagName!=='BR'&&!n.classList.contains('cxm-w')) walk(n);
      });
    })(el);
    return out;
  }

  /* ---------- 2. heading reveal on scroll (existing headings) ---------- */
  /* Plays once when the heading enters, in its own time: the words come into focus right-to-left.
     Not tied to scroll position, so a heading is never left half-readable. Headings already on screen at load stay put. */
  var heads=$$('.main-wrapper > :not(.navbar):not(.banner-cover) h2').filter(function(h){return !h.classList.contains('card-count-44-px')&&h.offsetParent!==null&&h.textContent.trim().length>3&&!h.closest('.w-dyn-item')});
  if('IntersectionObserver' in window&&heads.length){
    var hio=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting) return; hio.unobserve(e.target);
      var ws=e.target._ws; if(!ws) return;
      var step=Math.min(40,200/ws.length);
      ws.forEach(function(w,i){w.style.opacity='';
        /* opacity and position only: both run on the compositor, so a page full of headings never drops frames */
        w.animate(reduced?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(.22em)'},{opacity:1,transform:'none'}],
          {duration:reduced?250:480,delay:reduced?0:i*step,easing:EASE,fill:'backwards'})});
    })},{rootMargin:'0px 0px -12% 0px',threshold:.2});
    heads.forEach(function(h){
      if(h.getBoundingClientRect().top<innerHeight*.88) return;   /* already visible: leave it alone */
      h._ws=LITE?[h]:split(h);   /* light mode moves the heading as one piece instead of word by word */
      h._ws.forEach(function(w){w.style.opacity=0}); hio.observe(h);
    });
  }


  /* ---------- 3. numbers roll like a track (odometer) ---------- */
  function visual(raw){var last=raw.slice(-1);return /[+×x]/.test(last)?last+raw.slice(0,-1):raw}   // keep the site's RTL look: "10B+" shows as "+10B", "99%" stays
  function build(el){
    var raw=el.textContent.trim(); if(!/\d/.test(raw)) return null;
    var cs=getComputedStyle(el), fs=parseFloat(cs.fontSize), own=parseFloat(cs.lineHeight); if(!own||isNaN(own)) own=fs*1.15;
    var lh=Math.max(own,Math.round(fs*1.36));   /* the site sets line-height below font-size here; a reel that short clips the digits */
    el.setAttribute('aria-label',raw);
    var box=document.createElement('span');box.className='cxm-odo';box.setAttribute('aria-hidden','true');box.style.setProperty('--lh',lh+'px');box.style.setProperty('--pull',((own-lh)/2)+'px');
    var reels=[];
    /* Only the digits become reels. Everything between them stays one whole run, so a word such as "مليون"
       keeps its joined letters; values that contain words are laid out right-to-left like the text around them. */
    var wordy=/[ء-ي]|[A-Za-z]{2,}/.test(raw);   /* Arabic letters or a Latin word; signs such as ٪ do not count */
    if(wordy) box.classList.add('rtl');
    ((wordy?raw:visual(raw)).match(/\d+|\D+/g)||[]).forEach(function(tok){
      if(/\d/.test(tok)){
        var num=document.createElement('span');num.className='num';
        tok.split('').forEach(function(ch){
          var r=document.createElement('span');r.className='reel';var col=document.createElement('span');col.className='col';
          for(var k=0;k<20;k++){var d=document.createElement('span');d.textContent=String(k%10);col.appendChild(d)}
          r.appendChild(col);num.appendChild(r);reels.push({col:col,d:+ch});
        });
        box.appendChild(num);
      } else {var s=document.createElement('span');s.className='ch';s.textContent=tok;box.appendChild(s)}
    });
    el.textContent='';el.appendChild(box);
    return {el:el,reels:reels,lh:lh};
  }
  function roll(o){
    o.reels.forEach(function(r,i){
      r.col.style.transition='none';r.col.style.transform='translateY(0)';void r.col.offsetHeight;
      r.col.style.transition='transform '+(850+i*90)+'ms '+EASE+' '+(i*40)+'ms';
      r.col.style.transform='translateY(-'+((10+r.d)*o.lh)+'px)';
    });
  }
  function rest(o){o.reels.forEach(function(r){r.col.style.transition='none';r.col.style.transform='translateY(-'+((10+r.d)*o.lh)+'px)'})}
  /* ---------- the site's own flip counters (events page) ----------
     They were laid out for the English page: in a right-to-left page the digit columns came out mirrored
     ("50+" read "+05", "95%" read "%59"). Digits now run left-to-right, a leading plus sits before the number
     and a unit word sits after it in reading order, the same way the other figures on the site are written. */
  $$('.counter-nums-block').forEach(function(b){
    var kids=[].slice.call(b.children), plus=[], words=[];
    kids.forEach(function(k){
      if(!k.classList.contains('counter-nums-char')) return;
      var t=k.textContent.trim();
      if(t==='+') plus.push(k);
      else if(/[ء-ي]/.test(t)){ if(t==='ك'){var n=k.querySelector('.counter-num')||k;n.textContent='ألف'} words.push(k) }
    });
    plus.forEach(function(k){b.insertBefore(k,b.firstChild)});
    words.forEach(function(k){b.insertBefore(k,b.firstChild)});
    b.classList.add('cx-ltr');
    /* Each column now lands exactly on its last value. The built-in animation moved every column by a fixed
       share, so a column with a different number of steps stopped between two digits ("100" with a raised 1). */
    $$('.counter-nums-items',b).forEach(function(col,i){
      var n=col.children.length; if(n<1) return;
      col.classList.add('cx-col');
      col.style.setProperty('--to',(-(n-1)/n*100).toFixed(4)+'%');
      col.style.setProperty('--d',(i*70)+'ms');
    });
    if(reduced||!('IntersectionObserver' in window)) b.classList.add('cx-in');
    else new IntersectionObserver(function(es,o){if(es[0].isIntersecting){b.classList.add('cx-in');o.disconnect()}},{threshold:.6}).observe(b);
  });

  /* ---------- nothing works while it is off screen ----------
     Background videos, Lottie animations and the hero photo reels used to keep running wherever the visitor
     had scrolled to. Each now runs only while it is actually visible, and not at all in light mode. */
  (function(){
    if(!('IntersectionObserver' in window)) return;
    var vids=$$('.w-background-video video, .cxh-bg video');
    var vio=new IntersectionObserver(function(es){es.forEach(function(e){
      var v=e.target; v._on=e.isIntersecting;
      if(v._on&&!LITE&&!document.hidden) v.play().catch(noop); else v.pause();
    })},{rootMargin:'120px'});
    vids.forEach(function(v){v.removeAttribute('autoplay');v.preload='none';vio.observe(v)});
    document.addEventListener('visibilitychange',function(){vids.forEach(function(v){if(document.hidden||LITE||!v._on)v.pause();else v.play().catch(noop)})});
    liteHooks.push(function(){vids.forEach(function(v){v.pause()})});

    /* hero photo reels: the loop pauses with the hero out of view */
    var hero=$('.cxh'); if(hero) new IntersectionObserver(function(es){hero.classList.toggle('cx-away',!es[0].isIntersecting)}).observe(hero);

    /* Lottie: Webflow registers them after load */
    function lotties(){
      var api; try{api=window.Webflow&&Webflow.require('lottie').lottie}catch(e){} if(!api||!api.getRegisteredAnimations) return;
      var lio=new IntersectionObserver(function(es){es.forEach(function(e){
        var a=e.target._cxLottie; if(!a) return; a._cxOn=e.isIntersecting;
        if(a._cxOn&&!LITE) a.play(); else a.pause();
      })},{rootMargin:'100px'});
      var list=api.getRegisteredAnimations().filter(function(a){return a.wrapper&&a.loop!==false&&!a.wrapper.closest('.navbar')});   /* menu icons are driven by clicks; leave them */
      list.forEach(function(a){a.wrapper._cxLottie=a;lio.observe(a.wrapper)});
      liteHooks.push(function(){list.forEach(function(a){a.pause()})});
    }
    if(document.readyState==='complete') setTimeout(lotties,400); else addEventListener('load',function(){setTimeout(lotties,400)});
  })();

  /* ---------- reCAPTCHA loads when a form is about to be used, not with the page (it is 841 KB of script) ---------- */
  (function(){
    var caps=$$('.g-recaptcha'); if(!caps.length) return;
    var done=false;
    function load(){ if(done) return; done=true;
      var s=document.createElement('script');s.src='https://www.google.com/recaptcha/api.js';s.async=true;s.defer=true;document.head.appendChild(s) }
    document.addEventListener('focusin',function(e){if(e.target.closest&&e.target.closest('form'))load()});
    document.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('form'))load()},{passive:true});
    if('IntersectionObserver' in window){
      var cio=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){load();cio.disconnect()}},{rootMargin:'300px'});
      caps.forEach(function(c){cio.observe(c)});
    } else load();
  })();

  document.documentElement.setAttribute('data-cx','1');   /* read by qa.html: the layer ran to the end */
  var odos=$$('.card-count-44-px, .cxc-fig').map(build).filter(Boolean);
  if(reduced||!('IntersectionObserver' in window)) odos.forEach(rest);
  else{
    /* rolls once, the first time the figure is properly on screen; after that the number just stays true */
    var io=new IntersectionObserver(function(es){es.forEach(function(e){var o=e.target._odo;if(!o||!e.isIntersecting)return;io.unobserve(e.target);roll(o)})},{threshold:.6});
    odos.forEach(function(o){o.el._odo=o;io.observe(o.el)});
  }
})();
