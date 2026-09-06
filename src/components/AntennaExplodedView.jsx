import { useExplodedParts } from '../hooks/useHardwareFraming';
import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useMemo } from 'react';

// LoRa / RF High-Gain Magnetic Mount Whip Antenna physical discrete parts
// Coordinates in 1200 x 540 artboard
const ANTENNA_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'ant_tip',
    name: 'PROTECTIVE RUBBER MAST TIP CAP',
    code: 'ANT-CAP-EPDM-WEATHER',
    spec: 'UV-resistant molded EPDM rubber tapered protective end cap to prevent corona discharge and tip injury',
    role: 'WEATHERPROOFING & CORONA ARREST',
    w: 45,
    h: 50,
    assembled: { x: 500, y: 225 },
    exploded: { x: 50, y: 225 },
    start: 0.05,
    end: 0.42,
    step: 1,
    line: { x1: 'right', y1: 250, x2: 500, y2: 250 }
  },
  {
    id: 'ant_rod',
    name: 'STAINLESS STEEL RADIATOR WHIP MAST',
    code: 'ANT-WHIP-17-7PH-STEEL',
    spec: '17-7 PH hardened stainless steel black-passivated radiating whip element tuned for 868/915 MHz Sub-GHz',
    role: 'PRIMARY RF RADIATING ELEMENT',
    w: 270,
    h: 30,
    assembled: { x: 500, y: 235 },
    exploded: { x: 145, y: 235 },
    start: 0.10,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 250, x2: 500, y2: 250 }
  },
  {
    id: 'ant_coupler',
    name: 'THREADED COUPLING COLLAR BUSHING',
    code: 'ANT-COUPLER-M3-STEEL',
    spec: 'Precision CNC-machined steel threaded adapter bushing joining the whip mast to the loading inductor',
    role: 'MECHANICAL & RF CURRENT COUPLING',
    w: 45,
    h: 40,
    assembled: { x: 510, y: 230 },
    exploded: { x: 460, y: 230 },
    start: 0.16,
    end: 0.62,
    step: 3,
    line: { x1: 'right', y1: 250, x2: 510, y2: 250 }
  },
  {
    id: 'ant_coil',
    name: 'CENTER-LOADED HELICAL MATCHING INDUCTOR',
    code: 'ANT-COIL-HIGH-Q-SPRING',
    spec: 'Spring-wound steel loading coil for 50Ω impedance matching, electrical height loading, and high Q factor',
    role: 'IMPEDANCE MATCHING & RESONANCE',
    w: 125,
    h: 70,
    assembled: { x: 510, y: 215 },
    exploded: { x: 550, y: 215 },
    start: 0,
    end: 0,
    step: 4
  },
  {
    id: 'ant_base',
    name: 'MAGNETIC BASE WITH COAX CABLE & SMA PLUG',
    code: 'ANT-BASE-MAG-RG174-SMA',
    spec: 'Conical zinc base with NdFeB magnet, brass receiver stud, 3m bundled RG-174 coax, and gold SMA male connector',
    role: 'GROUND PLANE MOUNT & FEEDLINE',
    w: 390,
    h: 220,
    assembled: { x: 520, y: 140 },
    exploded: { x: 740, y: 140 },
    start: 0.08,
    end: 0.50,
    step: 5,
    line: { x1: 520, y1: 250, x2: 'left', y2: 250 }
  }
]);


export default function AntennaExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useExplodedParts(ANTENNA_PARTS_CONFIG, progress, partGroupRefs, lineGroupRefs, linesContainerRef);


  return useMemo(() => (
    <div
      className="antenna-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 540 */}
        <svg
          viewBox="0 0 1200 540"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="ant-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="ant-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            {/* Metal and rubber gradients */}
            <linearGradient id="black-rod-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#454b52" />
              <stop offset="40%" stopColor="#25282c" />
              <stop offset="70%" stopColor="#15171a" />
              <stop offset="100%" stopColor="#30353b" />
            </linearGradient>

            <linearGradient id="brass-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fae78b" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#9a7615" />
            </linearGradient>

            <linearGradient id="spring-wire-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22252a" />
              <stop offset="30%" stopColor="#4b535d" />
              <stop offset="70%" stopColor="#272a2f" />
              <stop offset="100%" stopColor="#16181b" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...ANTENNA_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = part.assembled.x + part.w;
              if (x1 === 'left') x1 = part.assembled.x;
              if (x2 === 'right') x2 = part.assembled.x + part.w;
              if (x2 === 'left') x2 = part.assembled.x;

              const isOrange = part.id.includes('coil') || part.id.includes('base');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#ant-marker-orange)' : 'url(#ant-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`} data-wire-id={part.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* 5 Physical Discrete Antenna Sub-Assemblies */}
          {[...ANTENNA_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id} data-part-id={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: PROTECTIVE MAST TIP CAP */}
                  {part.id === 'ant_tip' && (
                    <g>
                      {/* Tapered black rubber cap */}
                      <path d="M 0,25 Q 5,16 20,17 L 45,21 L 45,29 L 20,33 Q 5,34 0,25 Z" fill="#1b1d20" stroke="#373d45" strokeWidth="1.2" />
                      {/* Inner socket hole on the right edge */}
                      <ellipse cx="44" cy="25" rx="3" ry="5" fill="#0d0e10" />
                    </g>
                  )}

                  {/* PART 2: RADIATING STEEL WHIP ROD */}
                  {part.id === 'ant_rod' && (
                    <g>
                      {/* Long cylindrical rod */}
                      <rect x="0" y="9" width={part.w} height="12" rx="2" fill="url(#black-rod-gradient)" stroke="#373d45" strokeWidth="0.8" />
                      {/* Longitudinal highlight reflection */}
                      <line x1="2" y1="12" x2={part.w - 2} y2="12" stroke="#5d6570" strokeWidth="1.2" opacity="0.6" />
                      {/* Threaded stud at right tip */}
                      <rect x={part.w - 18} y="11" width="18" height="8" rx="1" fill="#7d8692" stroke="#444" strokeWidth="0.5" />
                      {[0, 3, 6, 9, 12, 15].map((t) => (
                        <line key={t} x1={part.w - 18 + t} y1="11" x2={part.w - 18 + t} y2="19" stroke="#333" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {/* PART 3: THREADED COUPLING COLLAR */}
                  {part.id === 'ant_coupler' && (
                    <g>
                      {/* Hexagonal / knurled collar */}
                      <rect x="0" y="8" width={part.w} height="24" rx="2" fill="#24282e" stroke="#444b54" strokeWidth="1.2" />
                      {/* Internal threads visible at both ends */}
                      <rect x="2" y="12" width="6" height="16" fill="#131518" />
                      <rect x={part.w - 8} y="12" width="6" height="16" fill="#131518" />
                      {/* Center grip knurling */}
                      {[12, 16, 20, 24, 28, 32].map((k) => (
                        <line key={k} x1={k} y1="8" x2={k} y2="32" stroke="#383f47" strokeWidth="1.5" />
                      ))}
                    </g>
                  )}

                  {/* PART 4: CENTER-LOADED HELICAL COIL */}
                  {part.id === 'ant_coil' && (
                    <g>
                      {/* Front threaded connector stud */}
                      <rect x="0" y="30" width="16" height="10" rx="1" fill="#6d7682" stroke="#333" strokeWidth="0.5" />
                      {/* Helical wound spring loops (10 spring coils) */}
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((coilIdx) => {
                        const cx = 20 + coilIdx * 12;
                        return (
                          <g key={coilIdx}>
                            <ellipse cx={cx} cy="35" rx="7" ry="28" fill="none" stroke="url(#spring-wire-gradient)" strokeWidth="6" />
                            {/* Spring highlight */}
                            <ellipse cx={cx} cy="35" rx="7" ry="28" fill="none" stroke="#778494" strokeWidth="1.5" strokeDasharray="14 30" opacity="0.7" />
                          </g>
                        );
                      })}
                      {/* Base threaded mounting post */}
                      <rect x="110" y="29" width="15" height="12" rx="1" fill="#6d7682" stroke="#333" strokeWidth="0.5" />
                      {[2, 5, 8, 11].map((t) => (
                        <line key={t} x1={110 + t} y1="29" x2={110 + t} y2="41" stroke="#333" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {/* PART 5: MAGNETIC BASE ASSEMBLY */}
                  {part.id === 'ant_base' && (
                    <g>
                      {/* Female Brass Thread Receiver on top of pedestal */}
                      <rect x="10" y="98" width="18" height="24" rx="2" fill="url(#brass-gold-gradient)" stroke="#8c6a12" strokeWidth="1" />
                      <circle cx="19" cy="110" r="4" fill="#222" />

                      {/* Conical Magnetic Pedestal Housing */}
                      <path
                        d="M 26,104 L 75,70 Q 85,65 95,65 L 140,65 Q 150,65 155,75 L 175,145 Q 180,155 170,155 L 45,155 Q 35,155 32,145 Z"
                        fill="#1c1f24"
                        stroke="#383e47"
                        strokeWidth="2"
                      />
                      {/* Pedestal grip contour flutes */}
                      <line x1="85" y1="75" x2="65" y2="145" stroke="#2c323b" strokeWidth="3" />
                      <line x1="115" y1="75" x2="105" y2="145" stroke="#2c323b" strokeWidth="3" />
                      <line x1="140" y1="75" x2="145" y2="145" stroke="#2c323b" strokeWidth="3" />

                      {/* Rubber base anti-scratch pad at bottom */}
                      <rect x="35" y="152" width="145" height="8" rx="2" fill="#0d0e10" stroke="#222" />

                      {/* Coiled Bundled RG-174 Coaxial Cable Bundle */}
                      <g transform="translate(165, 55)">
                        {/* Coiled loops */}
                        {[0, 1, 2, 3].map((loop) => (
                          <ellipse
                            key={loop}
                            cx="70"
                            cy={50 + loop * 4}
                            rx={45 + loop * 2}
                            ry={32 + loop * 2}
                            fill="none"
                            stroke="#181a1d"
                            strokeWidth="8"
                          />
                        ))}
                        {/* Cable ties / velcro wraps */}
                        <rect x="62" y="14" width="16" height="14" rx="2" fill="#2d333b" stroke="#444" />
                        <rect x="62" y="76" width="16" height="14" rx="2" fill="#2d333b" stroke="#444" />

                        {/* Coax wire extending to SMA connector */}
                        <path d="M 115,50 Q 140,50 155,75 T 175,95" fill="none" stroke="#181a1d" strokeWidth="8" strokeLinecap="round" />

                        {/* Heatshrink boot */}
                        <rect x="165" y="88" width="18" height="14" rx="2" fill="#121315" stroke="#333" />

                        {/* Gold SMA Male RF Connector */}
                        <rect x="183" y="85" width="28" height="20" rx="2" fill="url(#brass-gold-gradient)" stroke="#8c6a12" strokeWidth="1" />
                        {/* Knurled Hex Nut ridges */}
                        {[188, 194, 200, 206].map((x) => (
                          <line key={x} x1={x} y1="85" x2={x} y2="105" stroke="#a47e17" strokeWidth="1.5" />
                        ))}
                        {/* Male center pin cavity */}
                        <rect x="211" y="88" width="10" height="14" rx="1" fill="#333" />
                        <rect x="216" y="93" width="7" height="4" rx="1" fill="url(#brass-gold-gradient)" />
                      </g>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? ANTENNA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'LORA WHIP ANTENNA SYSTEM · 5 DISCRETE RF SUB-ASSEMBLIES'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? ANTENNA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? ANTENNA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  ), [hoveredPart]);
}
