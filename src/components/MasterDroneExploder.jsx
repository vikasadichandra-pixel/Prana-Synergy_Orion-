import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './MasterDroneExploder.css';

// Cubic easing functions
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const smoothStep = (progress, start, end, easingFn = easeInOutCubic) => {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return easingFn((progress - start) / (end - start));
};

// ──────────────────────────────────────────────────────────────────────────────
// WEBGL 3D PARTICLE FIELD (Interactive Background)
// ──────────────────────────────────────────────────────────────────────────────
const ParticleFieldBackground = memo(({ scrollRef }) => {
    const ref = useRef();
    
    const [positions, colors] = useMemo(() => {
        const count = 3000;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const color1 = new THREE.Color('#c9e87b');
        const color2 = new THREE.Color('#58d3ff');
        const mixed = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const r = 30 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            mixed.copy(color1).lerp(color2, Math.sin(pos[i * 3 + 1] * 0.5) * 0.5 + 0.5);
            col[i * 3] = mixed.r;
            col[i * 3 + 1] = mixed.g;
            col[i * 3 + 2] = mixed.b;
        }
        return [pos, col];
    }, []);

    useFrame((state) => {
        const points = ref.current;
        if (!points) return;
        const dt = Math.min(state.clock.getDelta(), .05);
        points.rotation.y += dt * 0.05;
        points.rotation.x += dt * 0.02;

        const t = state.clock.elapsedTime;
        const breath = Math.sin(t * 6.0);
        points.scale.setScalar(1 + breath * 0.06);
        points.material.opacity = 0.4 + breath * 0.2;

        if (scrollRef?.current) {
            const p = scrollRef.current.current;
            points.position.z = p * 8;
            points.rotation.z = p * 0.2;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.06} vertexColors transparent opacity={0.3} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
});

const HUD_TEXT = [
    { title: 'PRĀŅA HOMEOSTATIC DRONE', detail: 'SCROLL TO BEGIN DEEP INSPECTION', sub: 'Fully Assembled · 34 Components', count: '34' },
    { title: 'PHASE I · MACRO DISAGGREGATION', detail: '4 PRIMARY LAYERS SEPARATING', sub: 'Crown · Heatpipe · Core · Power Vault', count: '4' },
    { title: 'FOCUS: RADIATIVE CROWN', detail: 'AEROSPACE GRADE PROTECTION', sub: 'Camera Zoom Engaged', count: '1' },
    { title: 'FOCUS: THERMAL HEATPIPE', detail: 'PASSIVE COOLING SYSTEM', sub: 'Heat Dissipation Layer', count: '1' },
    { title: 'FOCUS: LOGIC CORE', detail: 'V4.1 COMPUTE ENGINE', sub: 'Sensors & Processing Unlocked', count: '1' },
    { title: 'FOCUS: POWER VAULT', detail: 'HIGH DENSITY ENERGY STORAGE', sub: 'Solid State Battery Cell', count: '1' },
];

export default function MasterDroneExploder() {
  const containerRef = useRef(null);
  const refs = useRef({});
  const scrollRef = useRef({ target: 0, current: 0 });
  const velocityRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const [phase, setPhase] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const setRef = useCallback((key) => (el) => { refs.current[key] = el; }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = container.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      scrollRef.current.target = Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    const tick = (now) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 1 / 30);
      lastTimeRef.current = now;

      if (reducedMotion) {
        scrollRef.current.current = scrollRef.current.target;
      } else {
        const dx = scrollRef.current.target - scrollRef.current.current;
        const force = 180 * dx;
        velocityRef.current += (force - 22 * velocityRef.current) * dt;
        scrollRef.current.current += velocityRef.current * dt;
        if (Math.abs(scrollRef.current.current - scrollRef.current.target) < 0.0001) {
          scrollRef.current.current = scrollRef.current.target;
          velocityRef.current = 0;
        }
      }

      const p = scrollRef.current.current;

      let ph = 0;
      if (p > 0.05) ph = 1;
      if (p > 0.30) ph = 2;
      if (p > 0.55) ph = 3;
      if (p > 0.69) ph = 4;
      if (p > 0.85) ph = 5;
      setPhase((prev) => (prev !== ph ? ph : prev));

      const p1 = smoothStep(p, 0.0, 0.2, easeOutCubic);
      const crownDy = -200 * p1;
      const heatpipeDy = -67 * p1;
      const coreDy = 67 * p1;
      const powerDy = 200 * p1;

      const p2 = smoothStep(p, 0.20, 0.47);
      const scale = 1 + 0.8 * p2;
      const panY2 = 200 * p2;

      const p3 = smoothStep(p, 0.47, 0.65);
      const panY3 = -133 * p3;

      const p4 = smoothStep(p, 0.65, 0.73);
      const panY4 = -134 * p4;

      const p5 = smoothStep(p, 0.73, 1.0, easeOutCubic);
      const panY5 = -133 * p5;

      const totalPanY = panY2 + panY3 + panY4 + panY5;

      const separation = Math.abs(crownDy - powerDy);

      const crownDepth = Math.min(separation / 400, 1);
      const heatpipeDepth = Math.min(separation / 400 * 0.7, 1);
      const coreDepth = Math.min(separation / 400 * 0.4, 1);
      const powerDepth = Math.min(separation / 400, 1);

      const crownScale = 1 + 0.02 * crownDepth;
      const heatpipeScale = 1 + 0.01 * heatpipeDepth;
      const coreScale = 1 - 0.005 * coreDepth;
      const powerScale = 1 - 0.015 * powerDepth;

      const coreBlur = 0.8 * coreDepth * (1 - p4 + p5);
      const powerBlur = 1.5 * powerDepth * (1 - p5);

      const powerOpacity = 1 - 0.08 * powerDepth * (1 - p5);

      const shadowSpread = (base, depth) => base + 12 * depth;

      const cam = refs.current.camera;
      if (cam) cam.style.transform = `scale(${scale}) translateY(${totalPanY}px)`;

      const cr = refs.current.crown;
      if (cr) {
        cr.style.transform = `translateY(${crownDy}px) scale(${crownScale}) translateZ(0)`;
        cr.style.filter = `drop-shadow(0 ${shadowSpread(25, crownDepth)}px ${shadowSpread(35, crownDepth)}px rgba(0,0,0,${0.9 - 0.1 * crownDepth}))`;
      }

      const hp = refs.current.heatpipe;
      if (hp) {
        hp.style.transform = `translateY(${heatpipeDy}px) scale(${heatpipeScale}) translateZ(0)`;
        hp.style.filter = `drop-shadow(0 ${shadowSpread(20, heatpipeDepth)}px ${shadowSpread(30, heatpipeDepth)}px rgba(0,0,0,${0.85 - 0.1 * heatpipeDepth}))`;
      }

      const cw = refs.current.coreWrapper;
      if (cw) {
        cw.style.transform = `translateY(${coreDy}px) scale(${coreScale}) translateZ(0)`;
        cw.style.filter = `drop-shadow(0 ${shadowSpread(15, coreDepth)}px ${shadowSpread(25, coreDepth)}px rgba(0,0,0,${0.8 - 0.1 * coreDepth})) blur(${coreBlur}px)`;
      }

      const pw = refs.current.power;
      if (pw) {
        pw.style.transform = `translateY(${powerDy}px) scale(${powerScale}) translateZ(0)`;
        pw.style.opacity = powerOpacity;
        pw.style.filter = `drop-shadow(0 ${shadowSpread(15, powerDepth)}px ${shadowSpread(25, powerDepth)}px rgba(0,0,0,${0.8 - 0.15 * powerDepth})) blur(${powerBlur}px)`;
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
  }, [reducedMotion]);

  const hud = HUD_TEXT[phase];

  return (
    <div className="drone-exploder-container" ref={containerRef}>
      <div className="drone-sticky-wrapper">

        {/* INTERACTIVE WEBGL BACKGROUND */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <ParticleFieldBackground scrollRef={scrollRef} />
          </Canvas>
        </div>

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
          <div style={{ fontSize: '28px', color: '#fff', fontWeight: 700, marginTop: '4px' }}>{hud.count}</div>
        </div>

        {/* === THE SVG CORE LAYOUT === */}
        <svg
          viewBox="0 0 1200 800"
          className="drone-svg-stage"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="translate(600, 400)">
            <g ref={setRef('camera')} className="drone-camera">

              {/* 1. BOTTOM: POWER VAULT */}
              <g ref={setRef('power')} className="drone-layer drone-power">
                <g transform="scale(0.25)">
                  <image href="/components/drone-slices/power_transparent.png" x={-320} y={-240} width={640} height={480} className="drone-asset" preserveAspectRatio="xMidYMid meet" />
                </g>
              </g>

              {/* 2. MIDDLE: CORE LOGIC */}
              <g ref={setRef('coreWrapper')} className="drone-layer drone-core">
                <g transform="scale(0.25)">
                  <image href="/components/drone-slices/core_transparent.png" x={-520} y={-360} width={1040} height={720} className="drone-asset" preserveAspectRatio="xMidYMid meet" />
                </g>
              </g>

              {/* 3. UPPER-MID: HEATPIPE */}
              <g ref={setRef('heatpipe')} className="drone-layer drone-heatpipe">
                <g transform="scale(0.25)">
                  <image href="/components/drone-slices/heatpipe.png" x={-440} y={-300} width={880} height={600} className="drone-asset" preserveAspectRatio="xMidYMid meet" />
                </g>
              </g>

              {/* 4. TOP: CROWN */}
              <g ref={setRef('crown')} className="drone-layer drone-crown">
                <g transform="scale(0.25)">
                  <image href="/components/drone-slices/crown_transparent.png" x={-1600} y={-1200} width={3200} height={2400} className="drone-asset" preserveAspectRatio="xMidYMid meet" />
                </g>
              </g>

            </g>
          </g>
        </svg>

      </div>
    </div>
  );
}
