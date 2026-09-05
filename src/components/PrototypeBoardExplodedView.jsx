import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// MB-102 Breadboard / Custom Prototype PCB — physical discrete parts
const PROTO_PARTS_CONFIG = [
  {
    id: 'proto_rails',
    name: 'POWER DISTRIBUTION RAILS',
    code: 'RAIL-MB102-PWR-2X',
    spec: 'Dual power bus strips (VCC + GND) running full board length with 0.1" pitch spring contacts',
    role: 'POWER DISTRIBUTION',
    w: 280,
    h: 60,
    assembled: { x: 460, y: 270 },
    exploded: { x: 60, y: 270 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 460, y2: 300 }
  },
  {
    id: 'proto_grid',
    name: 'MB-102 SOLDERLESS BREADBOARD',
    code: 'MB-102-830PT',
    spec: '830-point solderless breadboard, 2×63 rows of 5-connected tie points, ABS body with adhesive backing',
    role: 'PROTOTYPING PLATFORM',
    w: 280,
    h: 200,
    assembled: { x: 460, y: 200 },
    exploded: { x: 260, y: 200 },
    start: 0.10,
    end: 0.50,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 460, y2: 300 }
  },
  {
    id: 'proto_pcb',
    name: 'CUSTOM PROTOTYPE PCB SUBSTRATE',
    code: 'PCB-PROTO-FR4-100X160',
    spec: '100×160mm double-sided FR-4, 1oz copper, HASL finish, designed as final integration platform',
    role: 'PERMANENT INTEGRATION BASE',
    w: 300,
    h: 220,
    assembled: { x: 450, y: 190 },
    exploded: { x: 450, y: 190 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'proto_standoffs',
    name: 'M3 NYLON STANDOFF KIT',
    code: 'STOFF-M3-NYLON-12MM',
    spec: '12mm nylon hex standoffs with M3 brass threaded inserts for board-to-enclosure mounting',
    role: 'MECHANICAL MOUNTING',
    w: 200,
    h: 120,
    assembled: { x: 500, y: 240 },
    exploded: { x: 850, y: 240 },
    start: 0.05,
    end: 0.45,
    step: 4,
    line: { x1: 500, y1: 300, x2: 'left', y2: 300 }
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
const PowerRails = React.memo(({ w, h }) => (
  <g>
    {/* Red VCC rail */}
    <rect x="0" y="0" width={w} height={h / 2 - 2} rx="3" fill="#2a0a0a" stroke="#d82b2b" strokeWidth="1.5" />
    <line x1="8" y1={h / 4} x2={w - 8} y2={h / 4} stroke="#d82b2b" strokeWidth="2" />
    {Array.from({ length: 18 }).map((_, i) => (
      <circle key={`v-${i}`} cx={12 + i * 15} cy={h / 4} r="2" fill="#d82b2b" />
    ))}
    <text x="8" y="12" fill="#ff6b6b" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800">VCC +</text>
    {/* Blue GND rail */}
    <rect x="0" y={h / 2 + 2} width={w} height={h / 2 - 2} rx="3" fill="#0a0a2a" stroke="#2977dd" strokeWidth="1.5" />
    <line x1="8" y1={h * 0.75} x2={w - 8} y2={h * 0.75} stroke="#2977dd" strokeWidth="2" />
    {Array.from({ length: 18 }).map((_, i) => (
      <circle key={`g-${i}`} cx={12 + i * 15} cy={h * 0.75} r="2" fill="#2977dd" />
    ))}
    <text x="8" y={h - 6} fill="#58a6ff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800">GND −</text>
  </g>
));

const BreadboardGrid = React.memo(({ w, h }) => (
  <g>
    {/* ABS body */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#f5f5f0" stroke="#c0c0b0" strokeWidth="2" />
    {/* Center divider */}
    <rect x="0" y={h / 2 - 4} width={w} height="8" rx="1" fill="#e0e0d8" stroke="#c0c0b0" strokeWidth="0.5" />
    {/* Tie point grid - top half */}
    {Array.from({ length: 12 }).map((_, row) =>
      Array.from({ length: 24 }).map((_, col) => (
        <circle key={`t-${row}-${col}`} cx={14 + col * 11} cy={14 + row * 7} r="1.5" fill="#333" />
      ))
    )}
    {/* Tie point grid - bottom half */}
    {Array.from({ length: 12 }).map((_, row) =>
      Array.from({ length: 24 }).map((_, col) => (
        <circle key={`b-${row}-${col}`} cx={14 + col * 11} cy={h / 2 + 8 + row * 7} r="1.5" fill="#333" />
      ))
    )}
    {/* Row labels */}
    {['a', 'b', 'c', 'd', 'e'].map((letter, i) => (
      <text key={letter} x="4" y={24 + i * 14} fill="#999" fontFamily="'DM Mono', monospace" fontSize="5">{letter}</text>
    ))}
    <text x={w / 2} y={h - 4} fill="#888" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">MB-102 · 830 POINTS</text>
  </g>
));

const ProtoPcb = React.memo(({ w, h }) => (
  <g>
    {/* FR-4 substrate */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* Plated through-hole grid */}
    {Array.from({ length: 10 }).map((_, row) =>
      Array.from({ length: 14 }).map((_, col) => (
        <circle key={`h-${row}-${col}`} cx={16 + col * 20} cy={16 + row * 20} r="2.5" fill="#d4af37" stroke="#b89530" strokeWidth="0.5" />
      ))
    )}
    {/* Mounting holes */}
    <circle cx="16" cy="16" r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    <circle cx={w - 16} cy="16" r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    <circle cx="16" cy={h - 16} r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    <circle cx={w - 16} cy={h - 16} r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    {/* Silkscreen label */}
    <rect x={w / 2 - 50} y={h / 2 - 12} width="100" height="24" rx="2" fill="none" stroke="#2b6b3f" strokeWidth="1" />
    <text x={w / 2} y={h / 2 + 4} fill="#2b9951" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle">SIH26-PROTO-V1</text>
  </g>
));

const StandoffKit = React.memo(({ w, h }) => (
  <g>
    {/* 4 standoffs in a row */}
    {[0, 1, 2, 3].map(i => (
      <g key={i}>
        {/* Hex body */}
        <rect x={10 + i * 48} y="20" width="30" height="60" rx="2" fill="#e8e0d0" stroke="#c0b8a0" strokeWidth="1.5" />
        {/* Hex facet lines */}
        <line x1={16 + i * 48} y1="20" x2={16 + i * 48} y2="80" stroke="#d0c8b0" strokeWidth="0.8" />
        <line x1={34 + i * 48} y1="20" x2={34 + i * 48} y2="80" stroke="#d0c8b0" strokeWidth="0.8" />
        {/* Brass threaded insert (top) */}
        <circle cx={25 + i * 48} cy="24" r="6" fill="#d4af37" stroke="#b89530" strokeWidth="1" />
        <circle cx={25 + i * 48} cy="24" r="2.5" fill="#222" />
        {/* Brass threaded insert (bottom) */}
        <circle cx={25 + i * 48} cy="76" r="6" fill="#d4af37" stroke="#b89530" strokeWidth="1" />
        <circle cx={25 + i * 48} cy="76" r="2.5" fill="#222" />
      </g>
    ))}
    <text x={w / 2} y={h - 8} fill="#8a8070" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">M3 × 12mm NYLON</text>
  </g>
));

const PART_RENDERERS = {
  proto_rails: PowerRails,
  proto_grid: BreadboardGrid,
  proto_pcb: ProtoPcb,
  proto_standoffs: StandoffKit,
};

export default function PrototypeBoardExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    PROTO_PARTS_CONFIG.forEach((part) => {
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
      <marker id="proto-marker-yellow" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#f0c242" />
      </marker>
    </defs>
  ), []);

  return (
    <div className="proto-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(240, 194, 66, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 194, 66, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(240,194,66,0.6)', borderLeft: '2px solid rgba(240,194,66,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(240,194,66,0.6)', borderRight: '2px solid rgba(240,194,66,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(240,194,66,0.6)', borderLeft: '2px solid rgba(240,194,66,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(240,194,66,0.6)', borderRight: '2px solid rgba(240,194,66,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {PROTO_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#f0c242" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#proto-marker-yellow)" markerEnd="url(#proto-marker-yellow)" />
                </g>
              );
            })}
          </g>
          {PROTO_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#f0c242" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#f0c242' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? PROTO_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'PROTOTYPE BOARD ASSEMBLY · 4 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? PROTO_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'MB-102 BREADBOARD + CUSTOM FR-4 INTEGRATION PLATFORM'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#f0c242', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? PROTO_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
