import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './MasterDroneExploder.css';

/**
 * =============================================================================
 * ANIMATION PHYSICS & EASING UTILITIES
 * =============================================================================
 * Spring physics for organic, weighty motion + cubic-bezier easing for UI phases.
 * All math runs in the RAF tick — zero React renders during scroll.
 */

// Cubic easing: Apple-style ease-out-expo for buttery deceleration
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Smoothstep with easing (smootherstep: 6t^5 - 15t^4 + 10t^3)
const smoothStep = (progress, start, end, easingFn = easeInOutCubic) => {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  const t = (progress - start) / (end - start);
  return easingFn(t);
};

// Spring simulation for the scroll lerp — feels "alive", not linear
// stiffness: 120, damping: 14 → critically damped, no overshoot, instant response
const springStep = (current, target, dt = 1 / 60, stiffness = 120, damping = 14) => {
  const dx = target - current;
  const force = stiffness * dx;
  const velocity = damping * -current; // simplified: assumes velocity ~ -current for lerp-like behavior
  const acceleration = force + velocity;
  return current + acceleration * dt * 60; // dt normalized to 60fps
};

/**
 * Reduced motion check — respects OS-level preference instantly.
 * Returns a boolean that we can branch on for instant-state fallbacks.
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

// ──────────────────────────────────────────────────────────────────────────────
// WEBGL 3D PARTICLE FIELD (Interactive Background)
// ──────────────────────────────────────────────────────────────────────────────
const ParticleFieldBackground = ({ scrollRef }) => {
    const ref = useRef();
    
    const [positions, colors] = useMemo(() => {
        const count = 3000;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const color1 = new THREE.Color('#c9e87b'); // Lime
        const color2 = new THREE.Color('#58d3ff'); // Cyan

        for (let i = 0; i < count; i++) {
            const r = 30 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            const mixRatio = Math.sin(pos[i * 3 + 1] * 0.5) * 0.5 + 0.5;
            const mixedColor = color1.clone().lerp(color2, mixRatio);
            
            col[i * 3] = mixedColor.r;
            col[i * 3 + 1] = mixedColor.g;
            col[i * 3 + 2] = mixedColor.b;
        }
        return [pos, col];
    }, []);

    useFrame((state, delta) => {
        if (!ref.current) return;
        
        // Base idle rotation
        ref.current.rotation.y += delta * 0.05;
        ref.current.rotation.x += delta * 0.02;

        // "Prana" (Life Force) Heartbeat Pulse
        // A smooth breathing sine wave (lub-dub)
        const t = state.clock.elapsedTime;
        const breath = Math.sin(t * 2.0); // Breathes 2 radians per sec
        
        // Channel heartbeat into slight expansion and opacity pulsing
        ref.current.scale.setScalar(1 + breath * 0.04);
        ref.current.material.opacity = 0.35 + (breath * 0.15); 

        // Tie Z position and additional rotation to scroll progress!
        if (scrollRef && scrollRef.current) {
            const p = scrollRef.current.current;
            // Particles rush forward dynamically as the user scrolls
            ref.current.position.z = p * 15;
            // Subtle tilt based on scroll
            ref.current.rotation.z = p * 0.2;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.06} vertexColors transparent opacity={0.3} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
};

export default function MasterDroneExploder() {
  const containerRef = useRef(null);
  const refs = useRef({});
  const scrollRef = useRef({ target: 0, current: 0 });
  const velocityRef = useRef(0); // for spring physics
  const rafRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const [phase, setPhase] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Cache DOM refs without React render cycle
  const setRef = useCallback((key) => (el) => { refs.current[key] = el; }, []);

  // Detect reduced motion once on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

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

    const tick = (now) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 1 / 30); // clamp dt
      lastTimeRef.current = now;

      // ── SPRING PHYSICS ──────────────────────────────────────────────
      // If reduced motion: snap instantly to target (no interpolation)
      if (reducedMotion) {
        scrollRef.current.current = scrollRef.current.target;
      } else {
        // Critically-damped spring (stiffness 180, damping 22) — weighty, no bounce
        const dx = scrollRef.current.target - scrollRef.current.current;
        const force = 180 * dx;
        velocityRef.current += (force - 22 * velocityRef.current) * dt;
        scrollRef.current.current += velocityRef.current * dt;
        // Clamp to prevent tiny floating-point drift at extremes
        if (Math.abs(scrollRef.current.current - scrollRef.current.target) < 0.0001) {
          scrollRef.current.current = scrollRef.current.target;
          velocityRef.current = 0;
        }
      }

      const p = scrollRef.current.current;

      // ── HUD PHASE DETECTION (unchanged logic, just cleaner) ─────────
      let ph = 0;
      if (p > 0.05) ph = 1;
      if (p > 0.30) ph = 2; // Crown focus
      if (p > 0.55) ph = 3; // Heatpipe focus
      if (p > 0.69) ph = 4; // Core focus
      if (p > 0.85) ph = 5; // Power focus
      setPhase((prev) => (prev !== ph ? ph : prev));

      // ── PHASE 1: MACRO EXPLOSION (0.0 → 0.2) ──────────────────────
      // Uniform 200px separation between layers → ~133px gaps
      const p1 = smoothStep(p, 0.0, 0.2, easeOutCubic);
      const crownDy = -200 * p1;
      const heatpipeDy = -67 * p1;
      const coreDy = 67 * p1;
      const powerDy = 200 * p1;

      // ── PHASE 2: ZOOM TO CROWN (0.20 → 0.47) ──────────────────────
      const p2 = smoothStep(p, 0.20, 0.47, easeOutExpo);
      const scale = 1 + 0.8 * p2;          // 1.0 → 1.8x
      const panY2 = 200 * p2;

      // ── PHASE 3: PAN TO HEATPIPE (0.47 → 0.65) ────────────────────
      const p3 = smoothStep(p, 0.47, 0.65, easeInOutCubic);
      const panY3 = -133 * p3;

      // ── PHASE 4: PAN TO CORE (0.65 → 0.73) ────────────────────────
      const p4 = smoothStep(p, 0.65, 0.73, easeInOutCubic);
      const panY4 = -134 * p4;

      // ── PHASE 5: PAN TO POWER (0.73 → 1.00) ───────────────────────
      const p5 = smoothStep(p, 0.73, 1.0, easeOutCubic);
      const panY5 = -133 * p5;

      const totalPanY = panY2 + panY3 + panY4 + panY5;

      // ── PARALLAX / DEPTH CALCULATIONS ─────────────────────────────
      // Separation distance drives: scale, blur, opacity, shadow spread
      // Crown moves UP (-), Power moves DOWN (+) → max separation = 400px
      const separation = Math.abs(crownDy - powerDy); // 0 → 400

      // Depth factors per layer (0 = assembled, 1 = fully exploded)
      const crownDepth = Math.min(separation / 400, 1);       // top layer → foreground
      const heatpipeDepth = Math.min(separation / 400 * 0.7, 1);
      const coreDepth = Math.min(separation / 400 * 0.4, 1);
      const powerDepth = Math.min(separation / 400, 1);       // bottom layer → background

      // Parallax: foreground scales UP slightly, background scales DOWN
      // This creates the illusion of camera moving THROUGH the stack
      const crownScale = 1 + 0.02 * crownDepth;       // +2% at max separation
      const heatpipeScale = 1 + 0.01 * heatpipeDepth; // +1%
      const coreScale = 1 - 0.005 * coreDepth;        // -0.5%
      const powerScale = 1 - 0.015 * powerDepth;      // -1.5%

      // Blur: background layers get subtle defocus (simulates depth of field)
      // They come into sharp focus when the camera pans to their specific layer
      const coreBlur = 0.8 * coreDepth * (1 - p4 + p5);      // focus in phase 4, blur again in phase 5
      const powerBlur = 1.5 * powerDepth * (1 - p5);         // focus in phase 5

      // Opacity: very subtle fade on farthest layer for atmospheric perspective
      const powerOpacity = 1 - 0.08 * powerDepth * (1 - p5); // fades back in when focused

      // Dynamic shadow spread: ambient occlusion grows as gaps widen
      // Base shadow + separation-driven expansion
      const shadowSpread = (base, depth) => base + 12 * depth; // +12px at max

      // ── APPLY TRANSFORMS (direct DOM mutation — zero React renders) ──
      const cam = refs.current.camera;
      if (cam) {
        cam.style.transform = `scale(${scale}) translateY(${totalPanY}px)`;
      }

      // Crown (top / foreground)
      const cr = refs.current.crown;
      if (cr) {
        cr.style.transform = `translateY(${crownDy}px) scale(${crownScale}) translateZ(0)`;
        cr.style.filter = `drop-shadow(0 ${shadowSpread(25, crownDepth)}px ${shadowSpread(35, crownDepth)}px rgba(0,0,0,${0.9 - 0.1 * crownDepth}))`;
      }

      // Heatpipe (upper-mid)
      const hp = refs.current.heatpipe;
      if (hp) {
        hp.style.transform = `translateY(${heatpipeDy}px) scale(${heatpipeScale}) translateZ(0)`;
        hp.style.filter = `drop-shadow(0 ${shadowSpread(20, heatpipeDepth)}px ${shadowSpread(30, heatpipeDepth)}px rgba(0,0,0,${0.85 - 0.1 * heatpipeDepth}))`;
      }

      // Core (lower-mid) — subtle blur + scale down
      const cw = refs.current.coreWrapper;
      if (cw) {
        cw.style.transform = `translateY(${coreDy}px) scale(${coreScale}) translateZ(0)`;
        cw.style.filter = `drop-shadow(0 ${shadowSpread(15, coreDepth)}px ${shadowSpread(25, coreDepth)}px rgba(0,0,0,${0.8 - 0.1 * coreDepth})) blur(${coreBlur}px)`;
      }

      // Power (bottom / background) — blur, slight fade, scale down
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

  // ── HUD COPY (unchanged) ───────────────────────────────────────────
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
          <div style={{ fontSize: '28px', color: '#fff', fontWeight: 700, marginTop: '4px' }}>34</div>
        </div>

        {/* === THE SVG CORE LAYOUT === */}
        <svg
          viewBox="0 0 1200 800"
          className="drone-svg-stage"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="shadow-crown" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="25" stdDeviation="35" flood-color="#000" flood-opacity="0.9" />
            </filter>
            <filter id="shadow-heatpipe" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#000" flood-opacity="0.85" />
            </filter>
            <filter id="shadow-core" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#000" flood-opacity="0.8" />
            </filter>
            <filter id="shadow-power" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#000" flood-opacity="0.8" />
            </filter>
          </defs>

          <g transform="translate(600, 400)">
            <g ref={setRef('camera')} className="drone-camera" style={{ willChange: 'transform' }}>

              {/* 1. BOTTOM Z-INDEX: POWER VAULT (Battery) — Background */}
              <g
                ref={setRef('power')}
                className="drone-layer drone-power"
                style={{ willChange: 'transform, opacity, filter', transformOrigin: 'center center' }}
              >
                <g transform="scale(0.25)">
                  <image
                    href="/components/drone-slices/power_transparent.png"
                    x={-320} y={-240} width={640} height={480}
                    className="drone-asset"
                    imageRendering="optimizeQuality"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              </g>

              {/* 2. MIDDLE Z-INDEX: CORE LOGIC (Circuit Board) */}
              <g
                ref={setRef('coreWrapper')}
                className="drone-layer drone-core"
                style={{ willChange: 'transform, filter', transformOrigin: 'center center' }}
              >
                <g transform="scale(0.25)">
                  <image
                    href="/components/drone-slices/core_transparent.png"
                    x={-520} y={-360} width={1040} height={720}
                    className="drone-asset"
                    imageRendering="optimizeQuality"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              </g>

              {/* 3. UPPER-MID Z-INDEX: HEATPIPE */}
              <g
                ref={setRef('heatpipe')}
                className="drone-layer drone-heatpipe"
                style={{ willChange: 'transform, opacity, filter', transformOrigin: 'center center' }}
              >
                <g transform="scale(0.25)">
                  <image
                    href="/components/drone-slices/heatpipe.png"
                    x={-440} y={-300} width={880} height={600}
                    className="drone-asset"
                    imageRendering="optimizeQuality"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              </g>

              {/* 4. TOP Z-INDEX: CROWN (Drone) — Foreground */}
              <g
                ref={setRef('crown')}
                className="drone-layer drone-crown"
                style={{ willChange: 'transform, opacity, filter', transformOrigin: 'center center' }}
              >
                <g transform="scale(0.25)">
                  <image
                    href="/components/drone-slices/crown_transparent.png"
                    x={-1600} y={-1200} width={3200} height={2400}
                    className="drone-asset"
                    imageRendering="optimizeQuality"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              </g>

            </g>
          </g>
        </svg>

      </div>
    </div>
  );
}
