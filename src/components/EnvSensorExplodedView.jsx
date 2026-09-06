import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react';

// Environmental Sensor Array — SHT41 + BMP390 physical discrete parts
const ENV_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'env_grill',
    name: 'PTFE INTAKE GRILL',
    code: 'GRILL-PTFE-IP67',
    spec: 'Sintered PTFE membrane grill with IP67 protection allowing gas diffusion while blocking liquid ingress',
    role: 'ENVIRONMENTAL INTERFACE',
    w: 120,
    h: 200,
    assembled: { x: 540, y: 200 },
    exploded: { x: 100, y: 200 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'env_sht41',
    name: 'SENSIRION SHT41 HUMIDITY / TEMP',
    code: 'SHT41-AD1B-R2',
    spec: '±1.8%RH accuracy, ±0.2°C accuracy, integrated heater for condensation recovery, I²C interface',
    role: 'HUMIDITY & TEMPERATURE',
    w: 100,
    h: 130,
    assembled: { x: 550, y: 235 },
    exploded: { x: 280, y: 235 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 550, y2: 300 }
  },
  {
    id: 'env_bmp390',
    name: 'BOSCH BMP390 PRESSURE SENSOR',
    code: 'BMP390-MI-E',
    spec: '±0.5hPa absolute accuracy, 200Hz ODR, 24-bit ADC, barometric altitude resolution <8cm',
    role: 'BAROMETRIC PRESSURE',
    w: 100,
    h: 130,
    assembled: { x: 550, y: 235 },
    exploded: { x: 550, y: 235 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'env_carrier',
    name: 'SENSOR CARRIER PCB',
    code: 'PCB-ENV-CARRIER-2L',
    spec: '2-layer FR-4 with I²C bus, 3.3V LDO, decoupling, and thermal isolation slot between sensors',
    role: 'SIGNAL ROUTING & POWER',
    w: 180,
    h: 220,
    assembled: { x: 510, y: 190 },
    exploded: { x: 720, y: 190 },
    start: 0.10,
    end: 0.50,
    step: 4,
    line: { x1: 510, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'env_shield',
    name: 'EMI SHIELD CAN',
    code: 'SHLD-TIN-ENV-01',
    spec: 'Tin-plated steel RF shield can protecting analog sensor readings from electromagnetic interference',
    role: 'EMI PROTECTION',
    w: 140,
    h: 180,
    assembled: { x: 530, y: 210 },
    exploded: { x: 930, y: 210 },
    start: 0.05,
    end: 0.45,
    step: 5,
    line: { x1: 530, y1: 300, x2: 'left', y2: 300 }
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
const PtfeGrill = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="8" fill="#e8edf2" stroke="#b8c0cc" strokeWidth="1.5" />
    {/* Membrane pore pattern */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 4 }).map((_, col) => (
        <circle key={`p-${row}-${col}`} cx={15 + col * 28} cy={18 + row * 28} r="5" fill="none" stroke="#c4ccd6" strokeWidth="1" />
      ))
    )}
    {/* PTFE texture */}
    <rect x="8" y="8" width={w - 16} height={h - 16} rx="4" fill="none" stroke="#d5dbe2" strokeWidth="0.8" strokeDasharray="2 2" />
    <text x={w / 2} y={h - 10} fill="#8899a8" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">PTFE IP67</text>
  </g>
));

const Sht41Sensor = React.memo(({ w, h }) => (
  <g>
    {/* DFN package */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#1a1d22" stroke="#3a3d42" strokeWidth="1.5" />
    {/* Sensing aperture */}
    <rect x={w / 2 - 12} y="16" width="24" height="24" rx="12" fill="#0d1117" stroke="#58d6ff" strokeWidth="1" />
    <circle cx={w / 2} cy="28" r="6" fill="none" stroke="#58d6ff" strokeWidth="1.5" opacity="0.6" />
    {/* Heater element */}
    <path d={`M ${w / 2 - 8},50 Q ${w / 2},44 ${w / 2 + 8},50 Q ${w / 2},56 ${w / 2 - 8},50`} fill="none" stroke="#ff6b6b" strokeWidth="1" opacity="0.5" />
    {/* IC pads */}
    {Array.from({ length: 4 }).map((_, i) => (
      <rect key={i} x={10 + i * 22} y={h - 10} width="14" height="6" rx="1" fill="#d4af37" />
    ))}
    <text x={w / 2} y="78" fill="#7ac4e8" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="800" textAnchor="middle">SHT41</text>
    <text x={w / 2} y="92" fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">RH ±1.8%</text>
    <text x={w / 2} y="104" fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">T ±0.2°C</text>
  </g>
));

const Bmp390Sensor = React.memo(({ w, h }) => (
  <g>
    {/* LGA package */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#1a1d22" stroke="#3a3d42" strokeWidth="1.5" />
    {/* Pressure port */}
    <circle cx={w / 2} cy="28" r="10" fill="#0d1117" stroke="#c9e87b" strokeWidth="1.5" />
    <circle cx={w / 2} cy="28" r="4" fill="none" stroke="#c9e87b" strokeWidth="1" opacity="0.6" />
    {/* 24-bit ADC block */}
    <rect x="16" y="52" width={w - 32} height="24" rx="2" fill="#111" stroke="#444" strokeWidth="0.8" />
    <text x={w / 2} y="68" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">24-BIT ADC</text>
    {/* IC pads */}
    {Array.from({ length: 4 }).map((_, i) => (
      <rect key={i} x={10 + i * 22} y={h - 10} width="14" height="6" rx="1" fill="#d4af37" />
    ))}
    <text x={w / 2} y="96" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="800" textAnchor="middle">BMP390</text>
    <text x={w / 2} y="110" fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">±0.5 hPa</text>
  </g>
));

const EnvCarrierPcb = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* I2C bus traces */}
    <path d="M 20,50 L 80,50 L 80,100 L 160,100" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    <path d="M 20,70 L 60,70 L 60,140 L 160,140" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    {/* LDO regulator */}
    <rect x="14" y="14" width="36" height="24" rx="2" fill="#111" stroke="#444" strokeWidth="1" />
    <text x="32" y="30" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">3V3 LDO</text>
    {/* Thermal isolation slot */}
    <rect x={w / 2 - 2} y="40" width="4" height={h - 80} rx="1" fill="#0a140e" stroke="#1a3d22" strokeWidth="0.8" />
    {/* I2C header */}
    <rect x={w - 28} y="20" width="18" height="50" rx="2" fill="#1a1c1e" stroke="#444" strokeWidth="1" />
    {['SDA', 'SCL', 'VCC', 'GND'].map((pin, i) => (
      <text key={pin} x={w - 10} y={34 + i * 10} fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="end">{pin}</text>
    ))}
    <text x={w / 2} y={h - 8} fill="#2b9951" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">ENV-CARRIER-V1</text>
  </g>
));

const EmiShieldCan = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="6" fill="url(#shield-tin-gradient)" stroke="#999" strokeWidth="1.5" />
    {/* Ventilation slots */}
    {[1, 2, 3].map(i => (
      <rect key={i} x="20" y={30 + i * 35} width={w - 40} height="4" rx="1" fill="#888" stroke="#777" strokeWidth="0.5" />
    ))}
    {/* Ground clip tabs */}
    <rect x="-4" y="30" width="8" height="20" rx="1" fill="#b0b8c0" />
    <rect x="-4" y={h - 50} width="8" height="20" rx="1" fill="#b0b8c0" />
    <rect x={w - 4} y="30" width="8" height="20" rx="1" fill="#b0b8c0" />
    <rect x={w - 4} y={h - 50} width="8" height="20" rx="1" fill="#b0b8c0" />
    <text x={w / 2} y={h / 2} fill="#6e7680" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle">EMI SHIELD</text>
  </g>
));

const PART_RENDERERS = {
  env_grill: PtfeGrill,
  env_sht41: Sht41Sensor,
  env_bmp390: Bmp390Sensor,
  env_carrier: EnvCarrierPcb,
  env_shield: EmiShieldCan,
};

export default function EnvSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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
    ENV_PARTS_CONFIG.forEach((part) => {
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
      <marker id="env-marker-teal" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#4dd0b5" />
      </marker>
      <linearGradient id="shield-tin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c0c8d0" />
        <stop offset="50%" stopColor="#a8b2be" />
        <stop offset="100%" stopColor="#d0d8e0" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div className="env-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(77, 208, 181, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 208, 181, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(77,208,181,0.6)', borderLeft: '2px solid rgba(77,208,181,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(77,208,181,0.6)', borderRight: '2px solid rgba(77,208,181,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(77,208,181,0.6)', borderLeft: '2px solid rgba(77,208,181,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(77,208,181,0.6)', borderRight: '2px solid rgba(77,208,181,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...ENV_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#4dd0b5" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#env-marker-teal)" markerEnd="url(#env-marker-teal)" />
                </g>
              );
            })}
          </g>
          {[...ENV_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} data-part-id={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#4dd0b5" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#4dd0b5' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? ENV_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'ENVIRONMENTAL SENSOR ARRAY · 5 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? ENV_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'SHT41 HUMIDITY + BMP390 BAROMETRIC PRESSURE SENSING'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#4dd0b5', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? ENV_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
