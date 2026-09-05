import React, { useRef, useEffect, useState, useCallback } from 'react';
import './MasterDroneExploder.css';

function smoothStep(progress, start, end) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

export default function MasterDroneExploder() {
  const containerRef = useRef(null);
  const refs = useRef({});
  const scrollRef = useRef({ target: 0, current: 0 });
  const rafRef = useRef(null);
  const [phase, setPhase] = useState(0);

  const setRef = useCallback((key) => (el) => { refs.current[key] = el; }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = container.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrolled = -rect.top;
      scrollRef.current.target = Math.max(0, Math.min(1, scrolled / scrollable));
    };

    const tick = () => {
      scrollRef.current.current += (scrollRef.current.target - scrollRef.current.current) * 0.08;
      const p = scrollRef.current.current;

      // Determine phase for HUD
      let ph = 0;
      if (p > 0.05) ph = 1;
      if (p > 0.30) ph = 2; // Crown focus
      if (p > 0.55) ph = 3; // Heatpipe focus
      if (p > 0.69) ph = 4; // Core focus
      if (p > 0.85) ph = 5; // Power focus
      setPhase(prev => prev !== ph ? ph : prev);

      // Phase 1 (0.0 to 0.2) - Macro Split
      const p1 = smoothStep(p, 0.0, 0.2);
      const crownDy = -300 * p1;
      const heatpipeDy = -100 * p1;
      const powerDy = 300 * p1;

      // Phase 2: zoom to crown. Distance: 300px (0.20 to 0.47)
      const p2 = smoothStep(p, 0.20, 0.47);
      const scale = 1 + (0.8 * p2);
      const panY2 = 300 * p2; 
      
      // Phase 3: pan to heatpipe. Distance: 200px (0.47 to 0.65)
      const p3 = smoothStep(p, 0.47, 0.65);
      const panY3 = -200 * p3; 
      
      // Phase 4: pan to core. Distance: 100px (0.65 to 0.73)
      const p4 = smoothStep(p, 0.65, 0.73);
      const panY4 = -100 * p4;

      // Phase 5: pan to power. Distance: 300px (0.73 to 1.00)
      const p5 = smoothStep(p, 0.73, 1.0);
      const panY5 = -300 * p5;

      const totalPanY = panY2 + panY3 + panY4 + panY5;

      // Apply transforms
      if (refs.current.camera) {
        refs.current.camera.style.transform = `scale(${scale}) translateY(${totalPanY}px)`;
      }

      if (refs.current.crown) {
        refs.current.crown.style.transform = `translateY(${crownDy}px) translateZ(0)`;
      }

      if (refs.current.heatpipe) {
        refs.current.heatpipe.style.transform = `translateY(${heatpipeDy}px) translateZ(0)`;
      }

      if (refs.current.power) {
        refs.current.power.style.transform = `translateY(${powerDy}px) translateZ(0)`;
      }

      if (refs.current.coreWrapper) {
        refs.current.coreWrapper.style.transform = `translateZ(0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const HUD_TEXT = [
    { title: 'PRĀŅA HOMEOSTATIC DRONE', detail: 'SCROLL TO BEGIN DEEP INSPECTION', sub: 'Fully Assembled · 34 Components' },
    { title: 'PHASE I · MACRO DISAGGREGATION', detail: '4 PRIMARY LAYERS SEPARATING', sub: 'Crown · Heatpipe · Core · Power Vault' },
    { title: 'FOCUS: RADIATIVE CROWN', detail: 'AEROSPACE GRADE PROTECTION', sub: 'Camera Zoom Engaged' },
    { title: 'FOCUS: THERMAL HEATPIPE', detail: 'PASSIVE COOLING SYSTEM', sub: 'Heat Dissipation Layer' },
    { title: 'FOCUS: LOGIC CORE', detail: 'V4.1 COMPUTE ENGINE', sub: 'Sensors & Processing Unlocked' },
    { title: 'FOCUS: POWER VAULT', detail: 'HIGH DENSITY ENERGY STORAGE', sub: 'Solid State Battery Cell' },
  ];
  const hud = HUD_TEXT[phase];

  return (
    <div className="drone-exploder-container" ref={containerRef} style={{ height: '400vh' }}>
      <div className="drone-sticky-wrapper" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* HUD OVERLAY */}
        <div className="drone-hud">
          <div className="drone-hud-title">PRĀŅA · HOMEOSTATIC DRONE SURVIVAL SYSTEM</div>
          <div className="drone-hud-phase">{hud.title}</div>
          <div className="drone-hud-detail">{hud.detail}</div>
          <div style={{ marginTop: '8px', color: '#88948b', fontSize: '11px', fontFamily: '"DM Mono", monospace', letterSpacing: '1px' }}>{hud.sub}</div>
        </div>



        {/* ENVIRONMENT PANEL */}
        <div className="drone-env-panel">
          <div style={{ fontSize: '13px', color: '#ff8158', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px' }}>ENVIRONMENT: LADAKH</div>
          <div style={{ fontSize: '9px', color: '#aab4b0', lineHeight: '1.8', letterSpacing: '0.8px' }}>
            • Altitude: 3500 – 5500 m<br />
            • Ambient Temp: -20°C to -30°C<br />
            • Low Pressure, High UV<br />
            • Icing, Wind, Vibration
          </div>
        </div>

        {/* COMPONENT COUNT PANEL */}
        <div className="drone-count-panel">
          <div style={{ fontSize: '9px', color: '#c9e87b', fontWeight: 700, letterSpacing: '2px' }}>COMPONENT COUNT</div>
          <div style={{ fontSize: '28px', color: '#fff', fontWeight: 700, marginTop: '4px' }}>34</div>
        </div>



        {/* === THE SVG CORE LAYOUT === */}
        <svg viewBox="0 0 1200 800" style={{ width: '100%', height: '100%', maxWidth: '100vw', maxHeight: '100vh', position: 'absolute', zIndex: 1 }}>
          <g transform="translate(600, 400)">
            <g ref={setRef('camera')} style={{ willChange: 'transform' }}>
              {/* 1. BOTTOM Z-INDEX (Renders First): POWER VAULT (Battery) */}
              <g ref={setRef('power')} style={{ willChange: 'transform, opacity' }}>
                <image
                  href="/components/drone-slices/power_transparent.png"
                  x={-80} y={-60} width={160} height={120}
                  style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' }}
                />
              </g>

              {/* 2. MIDDLE Z-INDEX: CORE LOGIC (Circuit Board) */}
              <g ref={setRef('coreWrapper')} style={{ willChange: 'transform', transformOrigin: '0 0' }}>

                {/* THERE IS EXACTLY ONE IMAGE. DO NOT DUPLICATE OR CLIP THIS. */}
                <image
                  href="/components/drone-slices/core_transparent.png"
                  x={-130} y={-90} width={260} height={180}
                  style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' }}
                />
              </g>

              {/* 3. UPPER-MID Z-INDEX: HEATPIPE */}
              <g ref={setRef('heatpipe')} style={{ willChange: 'transform, opacity' }}>
                <image
                  href="/components/drone-slices/heatpipe.png"
                  x={-110} y={-75} width={220} height={150}
                  style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.85))' }}
                />
              </g>

              {/* 4. TOP Z-INDEX (Renders Last, Covers Everything): CROWN (Drone) */}
              <g ref={setRef('crown')} style={{ willChange: 'transform, opacity' }}>
                <image
                  href="/components/drone-slices/crown_transparent.png"
                  x={-400} y={-300} width={800} height={600}
                  style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.9))' }}
                />
              </g>

            </g>
          </g>
        </svg>

      </div>
    </div>
  );
}
