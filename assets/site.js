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
  let startX=0;
  let startScroll=0;

  const pause=(delay=3500)=>{resumeAt=performance.now()+delay;};
  const normalize=()=>{
    const loopWidth=original.getBoundingClientRect().width;
    if(!loopWidth)return;
    while(track.scrollLeft>=loopWidth)track.scrollLeft-=loopWidth;
    while(track.scrollLeft<0)track.scrollLeft+=loopWidth;
  };

  track.addEventListener('pointerdown',(event)=>{
    dragging=true;startX=event.clientX;startScroll=track.scrollLeft;
    if(event.pointerType==='mouse')track.setPointerCapture(event.pointerId);
    pause(10000);
  });
  track.addEventListener('pointermove',(event)=>{
    if(dragging&&event.pointerType==='mouse')track.scrollLeft=startScroll-(event.clientX-startX);
  });
  const finishDrag=()=>{if(dragging){dragging=false;normalize();pause();}};
  track.addEventListener('pointerup',finishDrag);
  track.addEventListener('pointercancel',finishDrag);
  track.addEventListener('wheel',()=>pause(),{passive:true});
  track.addEventListener('keydown',()=>pause());

  if(reducedMotion)return;
  const speed=Number(carousel.dataset.speed)||24;
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
