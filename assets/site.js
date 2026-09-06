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
    while(track.scrollLeft<=0)track.scrollLeft+=loopWidth;
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
      // Screenshot sets stay ordered 1 → n; autoplay travels toward item 1.
      track.scrollLeft-=speed*(time-previousTime)/1000;
      normalize();
    }
    previousTime=time;
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
});
