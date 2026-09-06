import { useEffect } from 'react';
import { wheelDistance, queueScroll, stepScroll } from '../lib/scrollMotion';

export default function useSteadyScroll(enabled) {
  useEffect(()=>{
    if(!enabled) return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame=0,last=0,current=window.scrollY,target=current,written=current;
    const stop=()=>{
      cancelAnimationFrame(frame);frame=0;last=0;
      current=target=written=window.scrollY;
    };
    const tick=now=>{
      const dt=last?(now-last)/1000:1/60;last=now;
      current=stepScroll(current,target,dt,window.innerHeight);
      if(Math.abs(current-target)<.5) current=target;
      window.scrollTo({top:current,behavior:'instant'});
      written=window.scrollY;
      if(Math.abs(current-target)<.5) {frame=0;last=0;}
      else frame=requestAnimationFrame(tick);
    };
    const enqueue=distance=>{
      if(!frame) current=target=written=window.scrollY;
      target=queueScroll(current,target,distance,window.innerHeight,document.documentElement.scrollHeight-window.innerHeight);
      if(reduced) {
        window.scrollTo({top:target,behavior:'instant'});
        current=target=written=window.scrollY;
        return;
      }
      if(!frame && current!==target) frame=requestAnimationFrame(tick);
    };
    const hasOwnScroll=element=>{
      for(let node=element;node && node!==document.body;node=node.parentElement) {
        if(node.matches?.('input,textarea,select,[contenteditable="true"]')) return true;
        if(node.scrollHeight>node.clientHeight+1 && /auto|scroll/.test(getComputedStyle(node).overflowY)) return true;
      }
      return false;
    };
    const wheel=event=>{
      if(event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX)>Math.abs(event.deltaY) || hasOwnScroll(event.target)) return;
      if(!event.cancelable) return;
      event.preventDefault();
      enqueue(wheelDistance(event.deltaY,event.deltaMode,window.innerHeight));
    };
    const key=event=>{
      if(event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || hasOwnScroll(event.target)) return;
      if(event.key===' ' && event.target.closest?.('a,button,[role="button"]')) return;
      const distance={ArrowDown:90,ArrowUp:-90,PageDown:window.innerHeight*.75,PageUp:-window.innerHeight*.75,' ':window.innerHeight*(event.shiftKey?-.75:.75)}[event.key];
      if(distance===undefined) {if(event.key==='Home'||event.key==='End') stop();return;}
      event.preventDefault();enqueue(distance);
    };
    // Touch, scrollbar dragging and anchor navigation keep native behavior.
    // External navigation cancels queued wheel inertia immediately.
    const nativeScroll=()=>{if(frame && Math.abs(window.scrollY-written)>2) stop();};
    window.addEventListener('wheel',wheel,{passive:false});
    window.addEventListener('keydown',key);
    window.addEventListener('scroll',nativeScroll,{passive:true});
    for(const event of ['pointerdown','touchstart','hashchange','resize','blur']) window.addEventListener(event,stop,{passive:true});
    return ()=>{
      stop();window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('scroll',nativeScroll);
      for(const event of ['pointerdown','touchstart','hashchange','resize','blur']) window.removeEventListener(event,stop);
    };
  },[enabled]);
}
