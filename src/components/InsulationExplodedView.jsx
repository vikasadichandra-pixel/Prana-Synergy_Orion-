import { useExplodedParts } from '../hooks/useHardwareFraming';
import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useMemo } from 'react';

const INSULATION_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'ins_top',
    name: 'TOP DIELECTRIC FILM',
    code: 'KAPTON-PI-50UM-T',
    spec: '50-micron polyimide film with high dielectric strength and thermal stability',
    role: 'SURFACE ISOLATION',
    w: 180,
    h: 280,
    assembled: { x: 510, y: 160 },
    exploded: { x: 150, y: 160 },
    start: 0.1,
    end: 0.6,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 510, y2: 300 }
  },
  {
    id: 'ins_core',
    name: 'ISOLATION MATRIX',
    code: 'EPOXY-FR4-HV-CORE',
    spec: 'Solid flame-retardant epoxy matrix blocking high-potential arc flash paths',
    role: 'PRIMARY BARRIER',
    w: 220,
    h: 320,
    assembled: { x: 490, y: 140 },
    exploded: { x: 490, y: 140 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'ins_bottom',
    name: 'BOTTOM DIELECTRIC FILM',
    code: 'KAPTON-PI-50UM-B',
    spec: '50-micron polyimide film protecting lower routing channels and ground plane',
    role: 'SUBSTRATE ISOLATION',
    w: 180,
    h: 280,
    assembled: { x: 510, y: 160 },
    exploded: { x: 870, y: 160 },
    start: 0.1,
    end: 0.6,
    step: 3,
    line: { x1: 510, y1: 300, x2: 'left', y2: 300 }
  }
]);


export default function InsulationExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useExplodedParts(INSULATION_PARTS_CONFIG, progress, partGroupRefs, lineGroupRefs, linesContainerRef);

  return useMemo(() => (
    <div
      className="insulation-view-container"
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
            <marker id="ins-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <linearGradient id="polyimide-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212, 143, 38, 0.7)" />
              <stop offset="100%" stopColor="rgba(163, 94, 15, 0.85)" />
            </linearGradient>
            <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a252c" />
              <stop offset="100%" stopColor="#0f161a" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...INSULATION_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#c9e87b" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#ins-marker-lime)" markerEnd="url(#ins-marker-lime)" />
                </g>
              );
            })}
          </g>

          {/* Physical Parts */}
          {[...INSULATION_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            return (
              <g 
                key={part.id} data-part-id={part.id}
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
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#c9e87b" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                
                {part.id.includes('top') || part.id.includes('bottom') ? (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#polyimide-grad)" stroke="#dca843" strokeWidth="2" opacity="0.9" />
                    {/* Dielectric Texture */}
                    <path d="M 20,20 L 160,260 M 160,20 L 20,260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="20" cy="20" r="4" fill="#8c5008" />
                    <circle cx="160" cy="20" r="4" fill="#8c5008" />
                    <circle cx="20" cy="260" r="4" fill="#8c5008" />
                    <circle cx="160" cy="260" r="4" fill="#8c5008" />
                  </g>
                ) : (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="6" fill="url(#core-grad)" stroke="#2b3b47" strokeWidth="3" />
                    <rect x="20" y="20" width={part.w - 40} height={part.h - 40} fill="none" stroke="#212f38" strokeWidth="2" strokeDasharray="4 4" />
                    <text x={part.w / 2} y={part.h / 2} fill="#465c6b" fontFamily="'DM Mono', monospace" fontSize="14" fontWeight="bold" textAnchor="middle">HV-ISO MATRIX</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea' }}>
              {hoveredPart ? INSULATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'HIGH-VOLTAGE INSULATION · 3 DISCRETE LAYERS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? INSULATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#c9e87b', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px' }}>
            {hoveredPart ? INSULATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  ), [hoveredPart]);
}
