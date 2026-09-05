import React, { useState, useRef, useEffect, useCallback } from 'react';

// Aluminium Structure physical discrete parts
// Coordinates in 1200 x 600 artboard
const STRUCTURE_PARTS_CONFIG = [
  {
    id: 'str_top',
    name: 'AEROSPACE-GRADE FACE PLATE',
    code: 'AL-PLATE-6061-T6-TOP',
    spec: '3mm thick 6061-T6 aluminum alloy face plate with countersunk hex bolt holes',
    role: 'STRUCTURAL INTEGRITY & SHIELDING',
    w: 260,
    h: 60,
    assembled: { x: 470, y: 180 },
    exploded: { x: 470, y: 50 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 600, y1: 'bottom', x2: 600, y2: 180 }
  },
  {
    id: 'str_core',
    name: 'EXTRUDED CORE CHASSIS',
    code: 'EXT-AL-PROFILE-2020',
    spec: 'Custom extruded aluminum structural rails with integrated T-slots for modular component mounting',
    role: 'PRIMARY LOAD-BEARING FRAME',
    w: 240,
    h: 120,
    assembled: { x: 480, y: 220 },
    exploded: { x: 480, y: 220 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'str_base',
    name: 'MOUNTING PLANE & BOTTOM PLATE',
    code: 'AL-PLATE-6061-T6-BTM',
    spec: 'Rigid base plate providing unified ground plane and payload attachment points',
    role: 'FOUNDATIONAL SUPPORT',
    w: 280,
    h: 40,
    assembled: { x: 460, y: 320 },
    exploded: { x: 460, y: 440 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 600, y1: 320, x2: 600, y2: 'top' }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function StructureExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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

    STRUCTURE_PARTS_CONFIG.forEach((part) => {
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
      className="structure-horizontal-view-container"
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

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="str-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="str-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="al-plate-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bdc4cc" />
              <stop offset="100%" stopColor="#798694" />
            </linearGradient>

            <linearGradient id="al-ext-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4c5661" />
              <stop offset="50%" stopColor="#8d97a3" />
              <stop offset="100%" stopColor="#353e47" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {STRUCTURE_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (y1 === 'bottom') y1 = currentY + part.h;
              if (y1 === 'top') y1 = currentY;
              if (y2 === 'bottom') y2 = currentY + part.h;
              if (y2 === 'top') y2 = currentY;

              const isOrange = part.id === 'str_top';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#str-marker-orange)' : 'url(#str-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
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

          {/* Physical Discrete Parts */}
          {STRUCTURE_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
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
                  {/* PART 1: TOP FACE PLATE */}
                  {part.id === 'str_top' && (
                    <g>
                      {/* Main plate body */}
                      <path d={`M 0,10 L ${part.w},10 L ${part.w - 10},${part.h} L 10,${part.h} Z`} fill="url(#al-plate-grad)" stroke="#49525c" strokeWidth="2" />
                      {/* Top thickness edge */}
                      <path d={`M 0,10 L 0,0 L ${part.w},0 L ${part.w},10 Z`} fill="#d3dae0" />
                      
                      {/* Countersunk Hex Bolts */}
                      <circle cx="30" cy="30" r="6" fill="#4c5661" stroke="#333" strokeWidth="1" />
                      <polygon points="30,26 33.5,28 33.5,32 30,34 26.5,32 26.5,28" fill="#111" />
                      
                      <circle cx={part.w - 30} cy="30" r="6" fill="#4c5661" stroke="#333" strokeWidth="1" />
                      <polygon points={`${part.w - 30},26 ${part.w - 26.5},28 ${part.w - 26.5},32 ${part.w - 30},34 ${part.w - 33.5},32 ${part.w - 33.5},28`} fill="#111" />
                      
                      <circle cx="130" cy="40" r="6" fill="#4c5661" stroke="#333" strokeWidth="1" />
                      <polygon points="130,36 133.5,38 133.5,42 130,44 126.5,42 126.5,38" fill="#111" />
                      
                      {/* Laser Etched Logo / Identification */}
                      <text x="130" y="25" fill="#49525c" fontFamily="'DM Mono', monospace" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="2">AERO-6061</text>
                    </g>
                  )}

                  {/* PART 2: EXTRUDED CORE */}
                  {part.id === 'str_core' && (
                    <g>
                      {/* Central rails forming a robust square/rectangular frame */}
                      {/* Back rail */}
                      <rect x="10" y="10" width={part.w - 20} height="20" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      {/* Left rail */}
                      <rect x="10" y="30" width="20" height="80" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      {/* Right rail */}
                      <rect x={part.w - 30} y="30" width="20" height="80" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      {/* Front rail */}
                      <rect x="10" y="90" width={part.w - 20} height="20" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      
                      {/* T-Slot details */}
                      <rect x="20" y="30" width="4" height="60" fill="#111" />
                      <rect x={part.w - 24} y="30" width="4" height="60" fill="#111" />
                      <rect x="30" y="18" width={part.w - 60} height="4" fill="#111" />
                      <rect x="30" y="98" width={part.w - 60} height="4" fill="#111" />
                      
                      {/* Corner braces */}
                      <path d="M 30,30 L 50,30 L 30,50 Z" fill="#798694" stroke="#333" />
                      <path d={`M ${part.w - 30},30 L ${part.w - 50},30 L ${part.w - 30},50 Z`} fill="#798694" stroke="#333" />
                      <path d="M 30,90 L 50,90 L 30,70 Z" fill="#798694" stroke="#333" />
                      <path d={`M ${part.w - 30},90 L ${part.w - 50},90 L ${part.w - 30},70 Z`} fill="#798694" stroke="#333" />
                    </g>
                  )}

                  {/* PART 3: BOTTOM MOUNTING PLANE */}
                  {part.id === 'str_base' && (
                    <g>
                      {/* Bottom plate thickness */}
                      <path d={`M 10,0 L ${part.w - 10},0 L ${part.w},10 L 0,10 Z`} fill="#9ea9b5" />
                      {/* Main plate body */}
                      <path d={`M 0,10 L ${part.w},10 L ${part.w},${part.h} L 0,${part.h} Z`} fill="url(#al-plate-grad)" stroke="#49525c" strokeWidth="2" />
                      
                      {/* Attachment points / screw holes */}
                      {[20, 80, 140, 200, 260].map(x => (
                        <g key={`hole-${x}`}>
                          <circle cx={x} cy="25" r="4" fill="#111" />
                          <circle cx={x} cy="25" r="5" fill="none" stroke="#49525c" strokeWidth="1" />
                        </g>
                      ))}
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
                ? STRUCTURE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ALUMINIUM MECHANICAL STRUCTURE Â· 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? STRUCTURE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG VERTICAL PROJECTION AXES AS YOU SCROLL'}
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
              ? STRUCTURE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
