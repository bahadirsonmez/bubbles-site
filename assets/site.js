document.querySelectorAll('[data-year]').forEach((node)=>{node.textContent=new Date().getFullYear();});

document.querySelectorAll('[data-carousel]').forEach((carousel)=>{
  const track=carousel.querySelector('.screenshot-track');
  const original=carousel.querySelector('.screenshot-set');
  if(!track||!original)return;

  const clone=original.cloneNode(true);
  clone.setAttribute('aria-hidden','true');
  clone.querySelectorAll('img').forEach((image)=>{image.alt='';image.loading='lazy';});
  track.append(clone);

  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let resumeAt=0;
  let previousTime=0;
  let dragging=false;
  let gesture=null;
  let startX=0;
  let startY=0;
  let startScroll=0;

  const pause=(delay=3500)=>{resumeAt=performance.now()+delay;};
  const normalize=()=>{
    const loopWidth=original.getBoundingClientRect().width;
    if(!loopWidth)return;
    while(track.scrollLeft>=loopWidth)track.scrollLeft-=loopWidth;
    while(track.scrollLeft<0)track.scrollLeft+=loopWidth;
  };

  track.addEventListener('pointerdown',(event)=>{
    dragging=true;gesture=null;startX=event.clientX;startY=event.clientY;startScroll=track.scrollLeft;
    if(event.pointerType==='mouse')track.setPointerCapture(event.pointerId);
    pause(10000);
  });
  track.addEventListener('pointermove',(event)=>{
    if(!dragging)return;
    const deltaX=event.clientX-startX;
    const deltaY=event.clientY-startY;
    if(!gesture&&Math.max(Math.abs(deltaX),Math.abs(deltaY))>6){
      gesture=Math.abs(deltaX)>Math.abs(deltaY)?'horizontal':'vertical';
    }
    if(gesture==='horizontal'){
      event.preventDefault();
      track.scrollLeft=startScroll-deltaX;
    }
  });
  const finishDrag=()=>{
    if(!dragging)return;
    dragging=false;gesture=null;normalize();pause();
  };
  track.addEventListener('pointerup',finishDrag);
  track.addEventListener('pointercancel',finishDrag);
  track.addEventListener('wheel',()=>pause(),{passive:true});
  track.addEventListener('keydown',()=>pause());

  if(reducedMotion)return;
  const speed=(Number(carousel.dataset.speed)||24)*1.9;
  const animate=(time)=>{
    if(previousTime&&time>=resumeAt&&!dragging&&!document.hidden){
      track.scrollLeft+=speed*(time-previousTime)/1000;
      normalize();
    }
    previousTime=time;
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
});

// ---- Header, menu overlay and scroll reveals (Handsome Frank-style motion) ----
document.documentElement.classList.add('js');
(()=>{
  const header=document.querySelector('body > header');
  const toggle=document.querySelector('[data-nav-toggle]');
  const nav=document.querySelector('body > header nav');
  if(header){
    const dark=[...document.querySelectorAll('.hero, footer')];
    const update=()=>{const y=40;const over=dark.some(el=>{const r=el.getBoundingClientRect();return r.top<=y&&r.bottom>=y;});header.classList.toggle('on-light',!over);};
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  }
  if(toggle&&nav){
    const set=open=>{nav.classList.toggle('open',open);header.classList.toggle('nav-open',open);document.body.classList.toggle('nav-locked',open);toggle.setAttribute('aria-expanded',String(open));};
    toggle.addEventListener('click',()=>set(!nav.classList.contains('open')));
    nav.addEventListener('click',e=>{if(e.target.closest('a'))set(false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
  }
  const targets=document.querySelectorAll('.section:not(.screens) > *, .screens-intro, .showcase, .cards article, .rail figure, .faq-list details, .section.screens:has(.rail) > *');
  targets.forEach(el=>{el.setAttribute('data-reveal','');const i=[...el.parentElement.children].indexOf(el);el.style.setProperty('--d',Math.min(i,3)*0.08+'s');});
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:0,rootMargin:'0px 0px -4% 0px'});
    targets.forEach(el=>io.observe(el));
  }else targets.forEach(el=>el.classList.add('in'));
})();
