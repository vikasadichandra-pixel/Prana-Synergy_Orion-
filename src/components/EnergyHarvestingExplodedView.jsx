import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react';

// Energy Harvesting Module — TEG + LTC3108
const ENERGY_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'eh_hotpad',
    name: 'HOT-SIDE THERMAL PAD',
    code: 'TPAD-CU-HOT-40X40',
    spec: '40×40mm copper thermal interface pad with graphite TIM for efficient heat collection from waste source',
    role: 'THERMAL ENERGY COLLECTION',
    w: 140,
    h: 140,
    assembled: { x: 530, y: 230 },
    exploded: { x: 80, y: 230 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'eh_teg',
    name: 'THERMOELECTRIC GENERATOR ARRAY',
    code: 'TEG-TEC1-12706-MOD',
    spec: '40×40mm Bi₂Te₃ Peltier module operated in Seebeck mode, 127 thermocouples, ~4.2V at ΔT=40°C',
    role: 'THERMAL-TO-ELECTRIC CONVERSION',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 280, y: 220 },
    start: 0.10,
    end: 0.50,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 520, y2: 300 }
  },
  {
    id: 'eh_ltc3108',
    name: 'LTC3108 ENERGY HARVESTER IC',
    code: 'LTC3108EDE-PBF',
    spec: 'Ultra-low voltage step-up converter, 20mV startup, integrated LDO, VOUT programmable 2.35–5V',
    role: 'DC-DC BOOST & REGULATION',
    w: 120,
    h: 160,
    assembled: { x: 540, y: 220 },
    exploded: { x: 540, y: 220 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'eh_transformer',
    name: 'STEP-UP TRANSFORMER COIL',
    code: 'XFMR-1:100-LTC3108',
    spec: '1:100 turns ratio coupled inductor for LTC3108 resonant boost topology, ferrite core',
    role: 'VOLTAGE MULTIPLICATION',
    w: 100,
    h: 120,
    assembled: { x: 550, y: 240 },
    exploded: { x: 750, y: 240 },
    start: 0.12,
    end: 0.55,
    step: 4,
    line: { x1: 550, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'eh_coldpad',
    name: 'COLD-SIDE HEATSINK PAD',
    code: 'HSINK-AL-COLD-40X40',
    spec: '40×40mm finned aluminum heatsink maintaining ΔT across TEG for sustained power generation',
    role: 'THERMAL ENERGY REJECTION',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 920, y: 220 },
    start: 0.05,
    end: 0.45,
    step: 5,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  }
]);

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS ————————————————
const HotPad = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#copper-gradient)" stroke="#b87333" strokeWidth="2" />
    {/* Graphite TIM layer */}
    <rect x="8" y="8" width={w - 16} height={h - 16} rx="2" fill="#2a2a2a" stroke="#444" strokeWidth="1" opacity="0.7" />
    {/* Heat flow arrows */}
    <path d={`M ${w / 2},${h - 10} L ${w / 2},20`} stroke="#ff6b3d" strokeWidth="2" markerEnd="url(#eh-arrow-hot)" opacity="0.6" />
    <path d={`M ${w / 2 - 20},${h - 10} L ${w / 2 - 20},30`} stroke="#ff6b3d" strokeWidth="1.5" opacity="0.3" />
    <path d={`M ${w / 2 + 20},${h - 10} L ${w / 2 + 20},30`} stroke="#ff6b3d" strokeWidth="1.5" opacity="0.3" />
    <text x={w / 2} y={h / 2 + 3} fill="#ff8c5a" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" textAnchor="middle">HOT SIDE</text>
  </g>
));

const TegArray = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#f0f0f0" stroke="#ccc" strokeWidth="1.5" />
    {/* Thermocouple grid */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 6 }).map((_, col) => (
        <g key={`tc-${row}-${col}`}>
          <rect x={10 + col * 24} y={10 + row * 24} width="10" height="18" rx="1" fill={(row + col) % 2 === 0 ? '#c0392b' : '#2980b9'} opacity="0.8" />
          <rect x={20 + col * 24} y={10 + row * 24} width="4" height="18" rx="0.5" fill="#d4af37" opacity="0.6" />
        </g>
      ))
    )}
    {/* Lead wires */}
    <circle cx="20" cy={h - 12} r="4" fill="#d82b2b" stroke="#fff" strokeWidth="0.5" />
    <circle cx="44" cy={h - 12} r="4" fill="#1a1a1a" stroke="#fff" strokeWidth="0.5" />
    <text x={w / 2} y={h - 6} fill="#666" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">127 THERMOCOUPLES</text>
  </g>
));

const Ltc3108Ic = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* IC package */}
    <rect x={w / 2 - 24} y="20" width="48" height="36" rx="3" fill="#0a0a0a" stroke="#555" strokeWidth="1.2" />
    <circle cx={w / 2 - 16} cy="30" r="2" fill="#888" />
    <text x={w / 2} y="38" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">LTC3108</text>
    <text x={w / 2} y="50" fill="#667" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">20mV START</text>
    {/* Passive components */}
    {[0, 1, 2].map(i => (
      <rect key={i} x={16 + i * 34} y="72" width="22" height="10" rx="1.5" fill="#222" stroke="#444" strokeWidth="0.8" />
    ))}
    {/* Storage capacitor */}
    <rect x="20" y="96" width={w - 40} height="24" rx="3" fill="#1a1d22" stroke="#3a3d42" strokeWidth="1" />
    <text x={w / 2} y="112" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">VSTORE 100μF</text>
    {/* Output LDO */}
    <rect x="20" y="132" width={w - 40} height="16" rx="2" fill="#111" stroke="#444" strokeWidth="0.8" />
    <text x={w / 2} y="144" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">LDO 3.3V OUT</text>
  </g>
));

const StepUpTransformer = React.memo(({ w, h }) => (
  <g>
    {/* Ferrite core */}
    <rect x="10" y="10" width={w - 20} height={h - 20} rx="6" fill="#2a2215" stroke="#5a4820" strokeWidth="2" />
    {/* Primary winding */}
    {Array.from({ length: 4 }).map((_, i) => (
      <ellipse key={`p-${i}`} cx={w / 2 - 14} cy={26 + i * 18} rx="12" ry="5" fill="none" stroke="#d82b2b" strokeWidth="2" />
    ))}
    {/* Secondary winding (more turns) */}
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={`s-${i}`} cx={w / 2 + 14} cy={20 + i * 10} rx="10" ry="3" fill="none" stroke="#2977dd" strokeWidth="1.2" />
    ))}
    {/* Core label */}
    <text x={w / 2} y={h - 6} fill="#8a7a50" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">1:100</text>
  </g>
));

const ColdSink = React.memo(({ w, h }) => (
  <g>
    {/* Heatsink base */}
    <rect x="0" y={h * 0.6} width={w} height={h * 0.4} rx="3" fill="url(#aluminum-gradient)" stroke="#8e96a1" strokeWidth="1.5" />
    {/* Fins */}
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={8 + i * 18} y="0" width="12" height={h * 0.65} rx="1" fill="url(#aluminum-gradient)" stroke="#8e96a1" strokeWidth="0.8" />
    ))}
    {/* Airflow arrows */}
    <path d={`M 10,${h * 0.3} L ${w - 10},${h * 0.3}`} stroke="#58d6ff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
    <text x={w / 2} y={h - 8} fill="#6e7680" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">COLD SIDE</text>
  </g>
));

const PART_RENDERERS = {
  eh_hotpad: HotPad,
  eh_teg: TegArray,
  eh_ltc3108: Ltc3108Ic,
  eh_transformer: StepUpTransformer,
  eh_coldpad: ColdSink,
};

export default function EnergyHarvestingExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useLayoutEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    ENERGY_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="eh-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#ff8c5a" />
      </marker>
      <marker id="eh-arrow-hot" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M 0,0 L 8,4 L 0,8 Z" fill="#ff6b3d" opacity="0.6" />
      </marker>
      <linearGradient id="copper-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b87333" />
        <stop offset="50%" stopColor="#da8a47" />
        <stop offset="100%" stopColor="#a0602a" />
      </linearGradient>
      <linearGradient id="aluminum-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c0c8d0" />
        <stop offset="50%" stopColor="#a8b2be" />
        <stop offset="100%" stopColor="#d0d8e0" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div className="energy-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 140, 90, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 140, 90, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(255,140,90,0.6)', borderLeft: '2px solid rgba(255,140,90,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(255,140,90,0.6)', borderRight: '2px solid rgba(255,140,90,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(255,140,90,0.6)', borderLeft: '2px solid rgba(255,140,90,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(255,140,90,0.6)', borderRight: '2px solid rgba(255,140,90,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...ENERGY_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#ff8c5a" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#eh-marker-orange)" markerEnd="url(#eh-marker-orange)" />
                </g>
              );
            })}
          </g>
          {[...ENERGY_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} data-part-id={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#ff8c5a" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#ff8c5a' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? ENERGY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'ENERGY HARVESTING MODULE · 5 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? ENERGY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'TEG SEEBECK CONVERSION + LTC3108 ULTRA-LOW VOLTAGE BOOST'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8c5a', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? ENERGY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
