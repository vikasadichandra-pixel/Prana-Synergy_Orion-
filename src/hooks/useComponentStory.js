import { useEffect, useState } from 'react';
import { sectionProgress } from '../lib/componentStory';

// The document is smoothed once. Hardware follows its exact position so an
// unfinished explosion can never trail behind a departing sticky section.
export default function useComponentStory(ref) {
  const [state,setState]=useState({progress:0,near:false});
  useEffect(()=>{
    const element=ref.current;
    if(!element) return;
    let near=false,frame=0,current=0;
    const tick=()=>{
      frame=0;
      const rect=element.getBoundingClientRect();
      current=sectionProgress(rect.top,element.offsetHeight,window.innerHeight);
      setState(previous=>previous.progress===current && previous.near===near?previous:{progress:current,near});
    };
    const schedule=()=>{if(near && !frame) frame=requestAnimationFrame(tick);};
    const observer=new IntersectionObserver(([entry])=>{
      near=entry.isIntersecting;
      if(near) schedule();
      else {
        cancelAnimationFrame(frame);frame=0;
        current=element.getBoundingClientRect().top>0?0:1;
        setState({progress:current,near:false});
      }
    },{rootMargin:'60% 0px'});
    observer.observe(element);
    const resize=new ResizeObserver(schedule);resize.observe(element);
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    return ()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[ref]);
  return state;
}
