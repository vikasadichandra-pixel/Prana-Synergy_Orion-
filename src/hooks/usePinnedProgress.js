import { useEffect, useState } from 'react';
import { sectionProgress } from '../lib/inspection';

// The document's actual scroll position drives the viewport-sticky stage.
// Updates only on scroll/resize and settles immediately, so there is no animation
// chasing the user after the section has already released.
export default function usePinnedProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (el) setProgress(sectionProgress(el.getBoundingClientRect().top, el.offsetHeight, window.innerHeight));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    if (ref.current) observer.observe(ref.current);
    measure();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref]);
  return progress;
}
