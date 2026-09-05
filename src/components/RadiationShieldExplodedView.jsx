import React, { useState, useRef, useEffect } from 'react';

const RAD_PARTS_CONFIG = [
  {
    id: 'rad_outer',
    name: 'TUNGSTEN SHIELD',
    code: 'W-ALLOY-2MM-HV',
    spec: '2mm high-density tungsten alloy blocking ionizing radiation and heavy particles',
    role: 'PRIMARY SHIELDING',
    w: 220,
    h: 300,
    assembled: { x: 490, y: 150 },
    exploded: { x: 140, y: 150 },
    start: 0.1,
    end: 0.6,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 490, y2: 300 }
  },
  {
    id: 'rad_absorb',
    name: 'ALUMINUM ABSORBER',
    code: 'AL-6061-1MM',
    spec: '1mm secondary absorber mitigating Bremsstrahlung secondary radiation',
    role: 'SECONDARY ABSORBER',
    w: 200,
    h: 280,
    assembled: { x: 500, y: 160 },
    exploded: { x: 500, y: 160 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'rad_inner',
    name: 'KAPTON ISOLATOR',
    code: 'KAPTON-PI-0.1MM',
    spec: 'Inner dielectric isolator preventing galvanic reaction with electronics chassis',
    role: 'GALVANIC ISOLATION',
    w: 180,
    h: 260,
    assembled: { x: 510, y: 170 },
    exploded: { x: 860, y: 170 },
    start: 0.1,
    end: 0.6,
    step: 3,
    line: { x1: 510, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function RadiationShieldExplodedView({ scrollProgress = 0 }) {
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

    RAD_PARTS_CONFIG.forEach((part) => {
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
      className="radiation-view-container"
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
            <marker id="rad-marker-pink" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#e87bc9" />
            </marker>
            <linearGradient id="tungsten-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2b2d30" />
              <stop offset="50%" stopColor="#43474d" />
              <stop offset="100%" stopColor="#1c1e21" />
            </linearGradient>
            <linearGradient id="alum-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6e7680" />
              <stop offset="100%" stopColor="#454b52" />
            </linearGradient>
            <linearGradient id="pi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212, 143, 38, 0.8)" />
              <stop offset="100%" stopColor="rgba(163, 94, 15, 0.9)" />
            </linearGradient>
          </defs>

          {/* Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {RAD_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#e87bc9" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#rad-marker-pink)" markerEnd="url(#rad-marker-pink)" />
                </g>
              );
            })}
          </g>

          {/* Parts */}
          {RAD_PARTS_CONFIG.map((part) => {
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
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#e87bc9" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                
                {part.id === 'rad_outer' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="8" fill="url(#tungsten-grad)" stroke="#555" strokeWidth="1" />
                    {/* Tungsten Heavy Texture */}
                    <path d="M 20,20 L 20,280 M 200,20 L 200,280" stroke="#1c1e21" strokeWidth="6" />
                    <circle cx="30" cy="30" r="6" fill="#111" />
                    <circle cx="190" cy="30" r="6" fill="#111" />
                    <circle cx="30" cy="270" r="6" fill="#111" />
                    <circle cx="190" cy="270" r="6" fill="#111" />
                  </g>
                )}
                {part.id === 'rad_absorb' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="6" fill="url(#alum-grad)" stroke="#8e96a1" strokeWidth="1" />
                    {/* Horizontal ridges */}
                    {[1,2,3,4,5,6].map(i => (
                      <line key={i} x1="10" y1={i * 40} x2="190" y2={i * 40} stroke="#454b52" strokeWidth="3" />
                    ))}
                  </g>
                )}
                {part.id === 'rad_inner' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pi-grad)" stroke="#dca843" strokeWidth="2" opacity="0.95" />
                    <rect x="10" y="10" width={part.w - 20} height={part.h - 20} fill="none" stroke="#8c5008" strokeWidth="1" strokeDasharray="2 2" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#e87bc9' : '#ecf0ea' }}>
              {hoveredPart ? RAD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'RADIATION PROTECTION · 3 DISCRETE SHIELDING LAYERS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? RAD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'MULTI-LAYER IONIZING RADIATION & EMP HARDENING'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#e87bc9', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px' }}>
            {hoveredPart ? RAD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
