import React, { useState, useRef, useEffect } from 'react';

const SOLDER_PARTS_CONFIG = [
  {
    id: 'sol_coat',
    name: 'CONFORMAL COATING',
    code: 'SIL-CC-TR-01',
    spec: 'Silicone-based moisture and fungus-resistant conformal coating',
    role: 'ENVIRONMENTAL SEAL',
    w: 240,
    h: 300,
    assembled: { x: 480, y: 150 },
    exploded: { x: 120, y: 150 },
    start: 0.15,
    end: 0.65,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 480, y2: 300 }
  },
  {
    id: 'sol_fill',
    name: 'EPOXY UNDERFILL',
    code: 'EPX-UF-BGA-99',
    spec: 'Capillary underfill epoxy protecting BGA and QFN solder joints from thermal fatigue',
    role: 'VIBRATION RESISTANCE',
    w: 160,
    h: 220,
    assembled: { x: 520, y: 190 },
    exploded: { x: 520, y: 190 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'sol_base',
    name: 'PCB REINFORCEMENT',
    code: 'FR4-RIGID-3.2MM',
    spec: 'Thickened 3.2mm FR4 substrate minimizing board flex during high-G acceleration',
    role: 'MECHANICAL SUPPORT',
    w: 280,
    h: 340,
    assembled: { x: 460, y: 130 },
    exploded: { x: 840, y: 130 },
    start: 0.15,
    end: 0.65,
    step: 3,
    line: { x1: 460, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function SolderProtectionExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    SOLDER_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="solder-view-container"
      style={{
        position: 'relative', width: '100%', maxWidth: '680px', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none'
      }}
    >
      <div
        style={{
          position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box'
        }}
      >
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' /* removed filter for perf */ }}>
          <defs>
            <marker id="sol-marker-cyan" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#58d6ff" />
            </marker>
            <linearGradient id="coat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(88, 214, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(20, 100, 120, 0.6)" />
            </linearGradient>
            <linearGradient id="pcb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d2b1f" />
              <stop offset="100%" stopColor="#061a12" />
            </linearGradient>
          </defs>

          {/* Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {SOLDER_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#58d6ff" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#sol-marker-cyan)" markerEnd="url(#sol-marker-cyan)" />
                </g>
              );
            })}
          </g>

          {/* Parts */}
          {SOLDER_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            return (
              <g 
                key={part.id} 
                onMouseEnter={() => setHoveredPart(part.id)} 
                onMouseLeave={() => setHoveredPart(null)} 
                ref={(el) => { partGroupRefs.current[part.id] = el; }}
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                style={{ 
                  cursor: 'pointer', 
                  willChange: 'transform', 
                  filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', 
                  transition: 'filter 0.15s ease-out' 
                }}
              >
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#58d6ff" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                
                {part.id === 'sol_coat' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="8" fill="url(#coat-grad)" stroke="#7de4ff" strokeWidth="1" />
                    <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.05)" />
                    <circle cx="150" cy="200" r="60" fill="rgba(255,255,255,0.05)" />
                  </g>
                )}
                {part.id === 'sol_fill' && (
                  <g>
                    {/* BGA chip */}
                    <rect x="30" y="30" width="100" height="100" rx="4" fill="#111" stroke="#333" strokeWidth="2" />
                    {/* Epoxy blobs */}
                    <path d="M 25,25 Q 80,10 135,25 Q 150,80 135,135 Q 80,150 25,135 Q 10,80 25,25 Z" fill="#080808" stroke="#1c1c1c" strokeWidth="3" opacity="0.8" />
                    <circle cx="80" cy="80" r="10" fill="#222" />
                  </g>
                )}
                {part.id === 'sol_base' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pcb-grad)" stroke="#1a543b" strokeWidth="2" />
                    <line x1="20" y1="20" x2="20" y2={part.h - 20} stroke="#133d2b" strokeWidth="4" />
                    <line x1={part.w - 20} y1="20" x2={part.w - 20} y2={part.h - 20} stroke="#133d2b" strokeWidth="4" />
                    {Array.from({length: 10}).map((_, i) => (
                      <circle key={i} cx="40" cy={30 + i * 30} r="2" fill="#d4af37" />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#58d6ff' : '#ecf0ea' }}>
              {hoveredPart ? SOLDER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'SOLDER JOINT PROTECTION · 3 DISCRETE LAYERS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? SOLDER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'ENVIRONMENTAL SEAL & VIBRATION DAMPENING'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#58d6ff', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px' }}>
            {hoveredPart ? SOLDER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
