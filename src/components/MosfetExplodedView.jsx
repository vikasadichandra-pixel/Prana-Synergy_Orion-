import { useExplodedParts } from '../hooks/useHardwareFraming';
import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useCallback, useMemo } from 'react';

// MOSFET physical discrete parts + TC4420 Gate Driver sub-component
const MOSFET_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'mos_face',
    name: 'EPOXY RESIN ENCAPSULATION',
    code: 'TO-220-EPOXY-FRONT',
    spec: 'Injection-molded flame-retardant epoxy plastic casing with laser-etched part markings',
    role: 'ENVIRONMENTAL SEAL & DIELECTRIC',
    w: 120, h: 120,
    assembled: { x: 540, y: 180 },
    exploded: { x: 180, y: 180 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 240, x2: 540, y2: 240 }
  },
  {
    id: 'mos_die',
    name: 'SILICON CARBIDE (SiC) TRENCH DIE',
    code: 'SIC-MOSFET-DIE',
    spec: 'High-voltage SiC semiconductor die with aluminum wire bonds for high current switching capability',
    role: 'POWER SWITCHING MATRIX',
    w: 60, h: 60,
    assembled: { x: 570, y: 220 },
    exploded: { x: 570, y: 220 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'mos_tab',
    name: 'COPPER HEAT TAB & TERMINALS',
    code: 'TO-220-CU-LEADFRAME',
    spec: 'Tinned copper leadframe providing electrical connections (G, D, S) and primary thermal dissipation path',
    role: 'THERMAL MASS & ELECTRICAL I/O',
    w: 140, h: 240,
    assembled: { x: 530, y: 160 },
    exploded: { x: 750, y: 160 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 530, y1: 240, x2: 'left', y2: 240 }
  },
  {
    id: 'mos_tc4420',
    name: 'TC4420 MOSFET GATE DRIVER',
    code: 'TC4420CPA',
    spec: 'Microchip 6A peak output gate driver, non-inverting, fast 25ns rise/fall for clean MOSFET switching',
    role: '[IC SUB-ASSEMBLY] GATE DRIVE',
    isSubComponent: true,
    w: 80, h: 80,
    assembled: { x: 560, y: 310 },
    exploded: { x: 980, y: 310 },
    start: 0.22, end: 0.62, step: 4,
    line: { x1: 560, y1: 350, x2: 'left', y2: 350 }
  }
]);


export default function MosfetExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useExplodedParts(MOSFET_PARTS_CONFIG, progress, partGroupRefs, lineGroupRefs, linesContainerRef);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return useMemo(() => (
    <div className="mosfet-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="mos-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="mos-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="epoxy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e2022" /><stop offset="50%" stopColor="#141517" /><stop offset="100%" stopColor="#0b0c0d" />
            </linearGradient>
            <linearGradient id="cu-tab-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b0bcc7" /><stop offset="25%" stopColor="#d1dae3" /><stop offset="75%" stopColor="#8c97a3" /><stop offset="100%" stopColor="#b0bcc7" />
            </linearGradient>
            <linearGradient id="sic-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a1859" /><stop offset="50%" stopColor="#2e0c38" /><stop offset="100%" stopColor="#1b0521" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...MOSFET_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'mos_face' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} />
                </g>
              );
            })}
          </g>

          {[...MOSFET_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} data-part-id={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'mos_face' && (
                  <g>
                    <rect x="0" y="30" width={part.w} height="90" rx="3" fill="url(#epoxy-grad)" stroke="#333" strokeWidth="1" />
                    <path d="M 30,30 L 40,35 L 80,35 L 90,30" fill="#141517" />
                    <text x="60" y="55" fill="#777c82" fontFamily="'DM Mono', monospace" fontSize="11" fontWeight="bold" textAnchor="middle">IRFZ44N</text>
                    <text x="60" y="70" fill="#5b6066" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">IR 113P</text>
                    <text x="60" y="85" fill="#5b6066" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">4C  9E</text>
                    <circle cx="15" cy="105" r="4" fill="#0b0c0d" stroke="#222" />
                    <circle cx="105" cy="105" r="4" fill="#0b0c0d" stroke="#222" />
                  </g>
                )}

                {part.id === 'mos_die' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} fill="url(#sic-die-grad)" stroke="#222" strokeWidth="1.5" />
                    <rect x="4" y="4" width={part.w-8} height={part.h-8} fill="none" stroke="#6e2d82" strokeWidth="0.5" strokeDasharray="2 2" />
                    <rect x="10" y="10" width={part.w-20} height={part.h-20} fill="none" stroke="#6e2d82" strokeWidth="0.5" strokeDasharray="2 2" />
                    <rect x="8" y="42" width="10" height="10" fill="#c0c5cc" />
                    <rect x="25" y="10" width="30" height="42" fill="#c0c5cc" />
                    <path d="M 13,47 Q 0,40 -20,100" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
                    <path d="M 35,25 Q 40,-10 30,100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
                    <path d="M 45,25 Q 60,-10 80,100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
                  </g>
                )}

                {part.id === 'mos_tab' && (
                  <g>
                    <rect x="10" y="0" width="120" height="140" rx="4" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1.5" />
                    <circle cx="70" cy="25" r="15" fill="#111" stroke="#aab4c2" strokeWidth="1" />
                    <rect x="30" y="55" width="80" height="70" rx="2" fill="#aab4c2" />
                    <rect x="25" y="140" width="14" height="100" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1" />
                    <rect x="63" y="140" width="14" height="100" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1" />
                    <rect x="101" y="140" width="14" height="100" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1" />
                    <text x="32" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">G</text>
                    <text x="70" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">D</text>
                    <text x="108" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">S</text>
                  </g>
                )}

                {part.id === 'mos_tc4420' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 16} y="10" width="32" height="24" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 8} cy="16" r="2" fill="#888" />
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 20} y={12 + i * 5} width="4" height="3" fill="#d4af37" />))}
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 16} y={12 + i * 5} width="4" height="3" fill="#d4af37" />))}
                    <text x={part.w / 2} y="28" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">TC4420</text>
                    <text x={part.w / 2} y="48" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">GATE DRIVER</text>
                    <text x={part.w / 2} y="58" fill="#666" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">6A PEAK / 25ns</text>
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? MOSFET_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'POWER MOSFET · 4 DISCRETE LAYERS + GATE DRIVER IC'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? MOSFET_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES TC4420 GATE DRIVER IC SUB-ASSEMBLY'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? MOSFET_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  ), [hoveredPart]);
}
