import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Vibration & Solder-Fatigue Sensor Array — physical discrete parts
const VIBRATION_PARTS_CONFIG = [
  {
    id: 'vib_piezo',
    name: 'MURATA 7BB-20-6L0 PIEZOELECTRIC DISC',
    code: 'PZT-7BB-20-6L0',
    spec: '20mm brass-backed PZT ceramic disc for wideband acoustic emission and solder-fatigue crack detection',
    role: 'ACOUSTIC EMISSION SENSOR',
    w: 140,
    h: 140,
    assembled: { x: 530, y: 230 },
    exploded: { x: 100, y: 230 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'vib_adxl',
    name: 'ANALOG DEVICES ADXL355 ACCELEROMETER',
    code: 'ADXL355-BCCZ',
    spec: 'Low-noise 3-axis MEMS accelerometer, ±2g/±4g/±8g range, 4kHz bandwidth, 25μg/√Hz noise density',
    role: 'VIBRATION FREQUENCY ANALYSIS',
    w: 120,
    h: 160,
    assembled: { x: 540, y: 220 },
    exploded: { x: 310, y: 220 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'vib_carrier',
    name: 'SENSOR CARRIER PCB',
    code: 'PCB-VIB-CARRIER-4L',
    spec: '4-layer FR-4 carrier with analog front-end, SPI interface, and EMI shielding ground plane',
    role: 'SIGNAL CONDITIONING',
    w: 180,
    h: 200,
    assembled: { x: 510, y: 200 },
    exploded: { x: 510, y: 200 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'vib_mount',
    name: 'STAINLESS STEEL MOUNTING BRACKET',
    code: 'BRK-SS304-VIB-MNT',
    spec: '304 stainless steel L-bracket with M3 threaded inserts for rigid coupling to monitored structure',
    role: 'MECHANICAL COUPLING',
    w: 160,
    h: 180,
    assembled: { x: 520, y: 210 },
    exploded: { x: 870, y: 210 },
    start: 0.05,
    end: 0.45,
    step: 4,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS ————————————————
const PiezoDisc = React.memo(({ w, h }) => (
  <g>
    {/* Brass backing disc */}
    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="url(#brass-gradient)" stroke="#b8860b" strokeWidth="2" />
    {/* PZT ceramic centre */}
    <ellipse cx={w / 2} cy={h / 2} rx={w / 4} ry={h / 4} fill="#d4d4d4" stroke="#999" strokeWidth="1.5" />
    {/* Solder pads */}
    <circle cx={w / 2 - 15} cy={h / 2 + 30} r="4" fill="#d4af37" stroke="#fff" strokeWidth="0.5" />
    <circle cx={w / 2 + 15} cy={h / 2 + 30} r="4" fill="#d4af37" stroke="#fff" strokeWidth="0.5" />
    {/* Lead wires */}
    <line x1={w / 2 - 15} y1={h / 2 + 34} x2={w / 2 - 15} y2={h - 4} stroke="#d82b2b" strokeWidth="2" strokeLinecap="round" />
    <line x1={w / 2 + 15} y1={h / 2 + 34} x2={w / 2 + 15} y2={h - 4} stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    <text x={w / 2} y="18" fill="#8B7355" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">7BB-20-6L0</text>
  </g>
));

const AdxlAccel = React.memo(({ w, h }) => (
  <g>
    {/* QFN Package */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#111215" stroke="#3a3d42" strokeWidth="1.5" />
    {/* Die pad */}
    <rect x={w / 2 - 22} y={h / 2 - 22} width="44" height="44" rx="2" fill="#1a1d22" stroke="#555" strokeWidth="1" />
    {/* MEMS sensing element */}
    <rect x={w / 2 - 14} y={h / 2 - 14} width="28" height="28" rx="1" fill="#2a2d35" stroke="#666" strokeWidth="0.8" />
    {/* Axis indicators */}
    <line x1={w / 2} y1={h / 2 - 10} x2={w / 2} y2={h / 2 + 10} stroke="#58d6ff" strokeWidth="1.5" opacity="0.7" />
    <line x1={w / 2 - 10} y1={h / 2} x2={w / 2 + 10} y2={h / 2} stroke="#ff8158" strokeWidth="1.5" opacity="0.7" />
    {/* QFN pads */}
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={`l-${i}`} x="0" y={24 + i * 22} width="6" height="10" rx="0.5" fill="#d4af37" />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={`r-${i}`} x={w - 6} y={24 + i * 22} width="6" height="10" rx="0.5" fill="#d4af37" />
    ))}
    <text x={w / 2} y="16" fill="#7ac4e8" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="800" textAnchor="middle">ADXL355</text>
    <text x={w / 2} y={h - 8} fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">3-AXIS MEMS</text>
  </g>
));

const CarrierPcb = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* Traces */}
    <path d="M 20,40 L 80,40 L 80,80 L 160,80" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    <path d="M 20,120 L 60,120 L 60,160 L 160,160" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    {/* SPI header */}
    <rect x={w - 30} y="20" width="20" height="80" rx="2" fill="#1a1c1e" stroke="#444" strokeWidth="1" />
    {Array.from({ length: 6 }).map((_, i) => (
      <circle key={i} cx={w - 20} cy={30 + i * 12} r="3" fill="#d4af37" stroke="#fff" strokeWidth="0.5" />
    ))}
    {/* Ground plane indicator */}
    <rect x="10" y={h - 30} width={w - 20} height="16" rx="2" fill="none" stroke="#2b6b3f" strokeWidth="1" strokeDasharray="3 3" />
    <text x={w / 2} y={h - 18} fill="#3d8c5a" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">GND PLANE</text>
    <text x={w / 2} y="16" fill="#2b9951" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" textAnchor="middle">CARRIER PCB</text>
  </g>
));

const MountingBracket = React.memo(({ w, h }) => (
  <g>
    {/* L-bracket body */}
    <path d={`M 0,0 L ${w},0 L ${w},${h * 0.3} L ${w * 0.3},${h * 0.3} L ${w * 0.3},${h} L 0,${h} Z`}
      fill="url(#steel-gradient)" stroke="#8e96a1" strokeWidth="2" />
    {/* M3 threaded inserts */}
    <circle cx="20" cy="20" r="6" fill="#555" stroke="#888" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="2.5" fill="#333" />
    <circle cx={w - 20} cy="20" r="6" fill="#555" stroke="#888" strokeWidth="1.5" />
    <circle cx={w - 20} cy="20" r="2.5" fill="#333" />
    <circle cx="20" cy={h - 20} r="6" fill="#555" stroke="#888" strokeWidth="1.5" />
    <circle cx="20" cy={h - 20} r="2.5" fill="#333" />
    {/* Surface texture */}
    {[1, 2, 3].map(i => (
      <line key={i} x1="10" y1={h * 0.35 + i * 30} x2={w * 0.25} y2={h * 0.35 + i * 30} stroke="#6e7680" strokeWidth="0.8" opacity="0.5" />
    ))}
    <text x={w * 0.15} y={h / 2 + 10} fill="#6e7680" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle" transform={`rotate(-90, ${w * 0.15}, ${h / 2 + 10})`}>SS304</text>
  </g>
));

const PART_RENDERERS = {
  vib_piezo: PiezoDisc,
  vib_adxl: AdxlAccel,
  vib_carrier: CarrierPcb,
  vib_mount: MountingBracket,
};

export default function VibrationSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }
    VIBRATION_PARTS_CONFIG.forEach((part) => {
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
      <marker id="vib-marker-green" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#7be88a" />
      </marker>
      <linearGradient id="brass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4a849" />
        <stop offset="50%" stopColor="#c4942a" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
      <linearGradient id="steel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8e96a1" />
        <stop offset="50%" stopColor="#a8b2be" />
        <stop offset="100%" stopColor="#6e7680" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div className="vibration-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(123, 232, 138, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 232, 138, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(123,232,138,0.6)', borderLeft: '2px solid rgba(123,232,138,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(123,232,138,0.6)', borderRight: '2px solid rgba(123,232,138,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(123,232,138,0.6)', borderLeft: '2px solid rgba(123,232,138,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(123,232,138,0.6)', borderRight: '2px solid rgba(123,232,138,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {VIBRATION_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#7be88a" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#vib-marker-green)" markerEnd="url(#vib-marker-green)" />
                </g>
              );
            })}
          </g>
          {VIBRATION_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#7be88a" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#7be88a' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? VIBRATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'VIBRATION SENSOR ARRAY · 4 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? VIBRATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'ADXL355 MEMS + PIEZOELECTRIC ACOUSTIC EMISSION DETECTION'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#7be88a', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? VIBRATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
