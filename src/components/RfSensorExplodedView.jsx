import React, { useState, useRef, useEffect, useCallback } from 'react';

const RFSENSOR_PARTS_CONFIG = [
  {
    id: 'rf_shield',
    name: 'NICKEL-SILVER RF SHIELDING CAN',
    code: 'SHIELD-EMI-RF',
    spec: '0.2mm nickel-silver alloy EMI/RFI shielding enclosure with ventilation holes to prevent interference',
    role: 'ELECTROMAGNETIC ISOLATION',
    w: 120,
    h: 120,
    assembled: { x: 540, y: 240 },
    exploded: { x: 240, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'rf_pcb',
    name: 'RF LOG DETECTOR IC & SUBSTRATE',
    code: 'AD8317-RF-DETECTOR',
    spec: '1MHz - 10GHz Logarithmic Demodulating Amplifier IC on high-frequency Rogers/FR4 hybrid PCB',
    role: 'RF POWER MEASUREMENT',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 520, y: 220 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'rf_pins',
    name: 'ANALOG OUT & POWER INTERFACE',
    code: 'HDR-3P-RF',
    spec: '3-pin 2.54mm header (VCC, GND, VOUT) delivering analog DC voltage proportional to RF power',
    role: 'DATA ACQUISITION LINK',
    w: 60,
    h: 120,
    assembled: { x: 520, y: 240 },
    exploded: { x: 820, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 3,
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

export default function RfSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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

    RFSENSOR_PARTS_CONFIG.forEach((part) => {
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
      className="rfsensor-horizontal-view-container"
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
            <marker id="rf-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="rf-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0c5cc" />
              <stop offset="50%" stopColor="#8d99a6" />
              <stop offset="100%" stopColor="#5d6570" />
            </linearGradient>

            <linearGradient id="pcb-hf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b2913" />
              <stop offset="100%" stopColor="#061208" />
            </linearGradient>

            <linearGradient id="gold-pin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3b432" />
              <stop offset="50%" stopColor="#f5dc7f" />
              <stop offset="100%" stopColor="#c79918" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {RFSENSOR_PARTS_CONFIG.map((part) => {
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

              const isOrange = part.id === 'rf_shield';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#rf-marker-orange)' : 'url(#rf-marker-lime)';

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
          {RFSENSOR_PARTS_CONFIG.map((part) => {
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
                  {/* PART 1: RF SHIELDING CAN */}
                  {part.id === 'rf_shield' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="2" fill="url(#shield-grad)" stroke="#4a5059" strokeWidth="1.5" />
                      {/* Shield Ventilation/Tuning Holes */}
                      <circle cx="30" cy="30" r="10" fill="#222" />
                      <circle cx="60" cy="30" r="10" fill="#222" />
                      <circle cx="90" cy="30" r="10" fill="#222" />

                      <circle cx="30" cy="60" r="10" fill="#222" />
                      <circle cx="90" cy="60" r="10" fill="#222" />

                      <circle cx="30" cy="90" r="10" fill="#222" />
                      <circle cx="60" cy="90" r="10" fill="#222" />
                      <circle cx="90" cy="90" r="10" fill="#222" />

                      <text x="60" y="65" fill="#5d6570" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">RF-ISO</text>
                    </g>
                  )}

                  {/* PART 2: RF PCB & DETECTOR IC */}
                  {part.id === 'rf_pcb' && (
                    <g>
                      {/* Substrate */}
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pcb-hf-grad)" stroke="#1a4726" strokeWidth="1.5" />

                      {/* SMA Connector Edge Pad */}
                      <rect x="-10" y="60" width="20" height="40" fill="url(#gold-pin-grad)" stroke="#9a7615" />
                      <rect x="-15" y="65" width="10" height="30" rx="1" fill="#c0c5cc" stroke="#333" />
                      <circle cx="-5" cy="80" r="3" fill="#111" />

                      {/* RF Traces (Impedance controlled) */}
                      <path d="M 10,80 L 50,80 L 60,70" fill="none" stroke="#d4af37" strokeWidth="3" />

                      {/* Detector IC */}
                      <rect x="55" y="60" width="24" height="24" rx="1" fill="#111" stroke="#333" strokeWidth="0.5" />
                      <circle cx="60" cy="65" r="2" fill="#555" />
                      <text x="67" y="75" fill="#888" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">AD</text>

                      {/* Ground Plane Vias */}
                      {[20, 40, 60, 80, 100, 120, 140].map(vx => (
                        <circle key={`v1-${vx}`} cx={vx} cy="20" r="1.5" fill="#d4af37" />
                      ))}
                      {[20, 40, 60, 80, 100, 120, 140].map(vx => (
                        <circle key={`v2-${vx}`} cx={vx} cy="140" r="1.5" fill="#d4af37" />
                      ))}

                      {/* Output Traces to header */}
                      <path d="M 75,75 L 140,75" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                      <path d="M 70,85 L 140,110" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                      <path d="M 60,85 L 140,145" fill="none" stroke="#d4af37" strokeWidth="1.5" />

                      {/* Mounting Holes */}
                      <circle cx="130" cy="30" r="12" fill="#061208" stroke="#d4af37" strokeWidth="3" />
                      <circle cx="130" cy="30" r="7" fill="#11361c" />
                    </g>
                  )}

                  {/* PART 3: PIN INTERFACE */}
                  {part.id === 'rf_pins' && (
                    <g>
                      {/* Black plastic header base */}
                      <rect x="0" y="20" width="15" height="110" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                      {/* 3 Gold Pins */}
                      {[40, 75, 110].map((py, i) => (
                        <g key={i}>
                          <rect x="-5" y={py} width="5" height="8" fill="#778494" />
                          <rect x="15" y={py} width="35" height="8" rx="1" fill="url(#gold-pin-grad)" stroke="#9a7615" strokeWidth="0.5" />
                        </g>
                      ))}
                      <text x="25" y="52" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold">VCC</text>
                      <text x="25" y="87" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold">GND</text>
                      <text x="25" y="122" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold">OUT</text>
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
                ? RFSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'RF SENSOR SYSTEM Â· 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? RFSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? RFSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
