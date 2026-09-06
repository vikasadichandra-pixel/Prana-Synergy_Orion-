import { useEffect, useRef } from 'react';

// One lightweight, full-stage 2D canvas keeps wind and dust behind the 3D model
// without creating another WebGL context. No React updates inside the draw loop.
export default function PranaAtmosphere({ running, reduced }) {
  const canvasRef = useRef(null);
  const time = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width=1,height=1,frame=0,last=0;
    const particles=Array.from({length:90},(_,i)=>({
      x:((i*137.508)%997)/997,y:((i*271.37)%991)/991,
      speed:.018+(i%7)*.003,alpha:.14+(i%5)*.075,length:i%8===0?18:1.5,
    }));
    function draw(now) {
      const dt=last?Math.min((now-last)/1000,.05):0;
      last=now;
      if(!reduced) time.current+=dt;
      ctx.clearRect(0,0,width,height);
      const t=time.current;
      for(const p of particles) {
        const x=((p.x+t*p.speed)%1.15-.075)*width;
        const y=(p.y+.025*Math.sin(t*.35+p.x*20))*height;
        // Keep the title area quiet and concentrate the field around the drone.
        const fade=Math.min(1,Math.max(0,(y-130)/130),Math.max(0,(height-y)/80));
        ctx.strokeStyle=`rgba(${p.length>2?'88,211,255':'201,232,123'},${p.alpha*fade})`;
        ctx.lineWidth=p.length>2?.65:1.3;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+p.length,y-p.length*.15);ctx.stroke();
      }
      // Fine moving airflow contours: cinematic activity without a dense HUD.
      for(let lane=0;lane<5;lane++) {
        ctx.beginPath();
        for(let x=0;x<=width;x+=16) {
          const y=height*(.36+lane*.105)+Math.sin(x/width*5+t*.2+lane*.55)*height*.065;
          if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`rgba(88,211,255,${.025+lane*.004})`;ctx.lineWidth=.7;ctx.stroke();
      }
      if(running&&!reduced) frame=requestAnimationFrame(draw);
    }
    function resize() {
      const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      cancelAnimationFrame(frame);last=0;draw(performance.now());
    }
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();};
  },[running,reduced]);
  return <div className={`prana-ambient ${running?'':'is-paused'} ${reduced?'is-reduced':''}`} aria-hidden="true">
    <div className="prana-aurora prana-aurora-lime" />
    <div className="prana-aurora prana-aurora-cyan" />
    <div className="prana-sweep" />
    <canvas ref={canvasRef} className="prana-wind" />
  </div>;
}
