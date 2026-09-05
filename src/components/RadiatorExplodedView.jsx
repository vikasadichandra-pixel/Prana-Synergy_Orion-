import React, { useState, useRef, useEffect, useCallback } from 'react';

// Radiator physical discrete parts
// Coordinates in 1200 x 600 artboard
const RADIATOR_PARTS_CONFIG = [
  {
    id: 'rad_base',
    name: 'ALUMINIUM MOUNTING BASE',
    code: 'AL-BASE-120MM',
    spec: 'Extruded aluminum alloy base plate with grooved channels for direct heat pipe contact',
    role: 'THERMAL INTERFACE',
    w: 60,
    h: 180,
    assembled: { x: 530, y: 210 },
    exploded: { x: 280, y: 210 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'rad_fins',
    name: 'HIGH-DENSITY COOLING FIN ARRAY',
    code: 'FIN-STACK-40X',
    spec: 'Stack of 40 ultra-thin (0.4mm) aluminum fins press-fitted to the base to maximize surface area',
    role: 'CONVECTIVE HEAT REJECTION',
    w: 120,
    h: 220,
    assembled: { x: 540, y: 190 },
    exploded: { x: 540, y: 190 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'rad_shroud',
    name: 'AERODYNAMIC SHROUD & MOUNTS',
    code: 'SHROUD-ABS-120',
    spec: 'Injection molded ABS plastic frame to direct airflow through the fin stack and mount 120mm fans',
    role: 'AIRFLOW MANAGEMENT',
    w: 80,
    h: 240,
    assembled: { x: 580, y: 180 },
    exploded: { x: 800, y: 180 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 580, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function RadiatorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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

    RADIATOR_PARTS_CONFIG.forEach((part) => {
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
      className="radiator-horizontal-view-container"
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
            <marker id="rad-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="rad-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="al-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#909ba8" />
              <stop offset="50%" stopColor="#c5cfd9" />
              <stop offset="100%" stopColor="#67737d" />
            </linearGradient>

            <linearGradient id="al-fin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b3bcc4" />
              <stop offset="50%" stopColor="#dee4eb" />
              <stop offset="100%" stopColor="#838d96" />
            </linearGradient>
            
            <linearGradient id="shroud-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#121314" />
              <stop offset="20%" stopColor="#25272b" />
              <stop offset="80%" stopColor="#1a1c1f" />
              <stop offset="100%" stopColor="#0a0b0c" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {RADIATOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id === 'rad_base';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#rad-marker-orange)' : 'url(#rad-marker-lime)';

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
          {RADIATOR_PARTS_CONFIG.map((part) => {
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
                  {/* PART 1: MOUNTING BASE */}
                  {part.id === 'rad_base' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="2" fill="url(#al-base-grad)" stroke="#535c66" strokeWidth="1" />
                      {/* Heat pipe contact grooves */}
                      <path d="M 15,0 L 15,180 M 30,0 L 30,180 M 45,0 L 45,180" stroke="#7a8794" strokeWidth="4" />
                      {/* Mounting holes */}
                      <circle cx="30" cy="15" r="5" fill="#111" stroke="#333" />
                      <circle cx="30" cy="165" r="5" fill="#111" stroke="#333" />
                    </g>
                  )}

                  {/* PART 2: COOLING FINS */}
                  {part.id === 'rad_fins' && (
                    <g>
                      {/* The fin stack represented as closely packed lines/rects */}
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#al-fin-grad)" stroke="#67737d" strokeWidth="1" />
                      {/* Individual fin lines */}
                      {Array.from({ length: 38 }).map((_, i) => (
                        <line key={`fin-${i}`} x1="0" y1={5 + i * 5.6} x2={part.w} y2={5 + i * 5.6} stroke="#535c66" strokeWidth="1" opacity="0.6" />
                      ))}
                      {/* Heat pipe through-holes in fins */}
                      <circle cx="30" cy="40" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                      <circle cx="90" cy="40" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                      <circle cx="30" cy="180" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                      <circle cx="90" cy="180" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                    </g>
                  )}

                  {/* PART 3: SHROUD AND MOUNTS */}
                  {part.id === 'rad_shroud' && (
                    <g>
                      {/* Side brackets */}
                      <rect x="0" y="0" width="20" height={part.h} fill="url(#shroud-grad)" stroke="#222" />
                      <rect x="60" y="0" width="20" height={part.h} fill="url(#shroud-grad)" stroke="#222" />
                      {/* Cross bars */}
                      <rect x="20" y="20" width="40" height="20" fill="url(#shroud-grad)" stroke="#222" />
                      <rect x="20" y="200" width="40" height="20" fill="url(#shroud-grad)" stroke="#222" />
                      
                      {/* Fan mounting holes */}
                      <circle cx="10" cy="10" r="4" fill="#000" />
                      <circle cx="70" cy="10" r="4" fill="#000" />
                      <circle cx="10" cy="230" r="4" fill="#000" />
                      <circle cx="70" cy="230" r="4" fill="#000" />
                      
                      {/* Angled aerodynamic guides */}
                      <path d="M 20,40 L 30,60 L 30,180 L 20,200 Z" fill="#111" opacity="0.5" />
                      <path d="M 60,40 L 50,60 L 50,180 L 60,200 Z" fill="#111" opacity="0.5" />
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
                ? RADIATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ALUMINIUM FIN RADIATOR Â· 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? RADIATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? RADIATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
