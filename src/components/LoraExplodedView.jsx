import React, { useState, useRef, useEffect, useCallback } from 'react';

// LoRa Module physical discrete parts
// Coordinates in 1200 x 600 artboard
const LORA_PARTS_CONFIG = [
  {
    id: 'lora_shield',
    name: 'NICKEL-SILVER RF SHIELD',
    code: 'SHIELD-SX1276-RF',
    spec: 'Stamped nickel-silver alloy shielding can to prevent RF leakage and external EMI interference',
    role: 'ELECTROMAGNETIC ISOLATION',
    w: 100,
    h: 120,
    assembled: { x: 550, y: 220 },
    exploded: { x: 250, y: 220 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 280, x2: 550, y2: 280 }
  },
  {
    id: 'lora_pcb',
    name: 'TRANSCEIVER IC & SUBSTRATE',
    code: 'SX1276-LORA-NODE',
    spec: 'High-frequency FR4 PCB integrating the Semtech SX1276 LoRa transceiver and matching network',
    role: 'LONG-RANGE RF MODEM',
    w: 140,
    h: 180,
    assembled: { x: 530, y: 190 },
    exploded: { x: 530, y: 190 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'lora_pins',
    name: 'CASTELLATED PAD INTERFACE',
    code: 'CAST-PAD-2.0MM',
    spec: 'Gold-plated half-hole castellated edges for surface mount soldering or header pin attachment',
    role: 'POWER, SPI & RF I/O',
    w: 160,
    h: 200,
    assembled: { x: 520, y: 180 },
    exploded: { x: 820, y: 180 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 520, y1: 280, x2: 'left', y2: 280 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function LoraExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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

    LORA_PARTS_CONFIG.forEach((part) => {
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
      className="lora-horizontal-view-container"
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
            <marker id="lora-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="lora-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="lora-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1dae3" />
              <stop offset="50%" stopColor="#aab4c2" />
              <stop offset="100%" stopColor="#7a8794" />
            </linearGradient>

            <linearGradient id="lora-pcb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5831" />
              <stop offset="100%" stopColor="#11361c" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {LORA_PARTS_CONFIG.map((part) => {
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

              const isOrange = part.id === 'lora_shield';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#lora-marker-orange)' : 'url(#lora-marker-lime)';

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
          {LORA_PARTS_CONFIG.map((part) => {
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
                  {/* PART 1: RF SHIELD */}
                  {part.id === 'lora_shield' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="2" fill="url(#lora-shield-grad)" stroke="#5f6770" strokeWidth="1.5" />
                      {/* Shield Dimples */}
                      <circle cx="10" cy="10" r="2" fill="#5f6770" />
                      <circle cx="90" cy="10" r="2" fill="#5f6770" />
                      <circle cx="10" cy="110" r="2" fill="#5f6770" />
                      <circle cx="90" cy="110" r="2" fill="#5f6770" />
                      
                      {/* Laser-etched text */}
                      <text x="50" y="55" fill="#49525c" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">SX1276</text>
                      <text x="50" y="75" fill="#5f6770" fontFamily="'DM Mono', monospace" fontSize="9" textAnchor="middle">915 MHz</text>
                    </g>
                  )}

                  {/* PART 2: LORA PCB */}
                  {part.id === 'lora_pcb' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#lora-pcb-grad)" stroke="#1a4726" strokeWidth="2" />
                      
                      {/* Shield footprint outline */}
                      <rect x="20" y="30" width="100" height="120" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
                      
                      {/* Transceiver IC */}
                      <rect x="50" y="60" width="40" height="40" rx="1" fill="#111" stroke="#333" strokeWidth="1" />
                      <circle cx="55" cy="65" r="2" fill="#444" />
                      <text x="70" y="80" fill="#666" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">SEMTECH</text>
                      
                      {/* Crystal Oscillator (TCXO) */}
                      <rect x="60" y="110" width="20" height="15" fill="#b0bcc7" stroke="#7a8794" strokeWidth="1" />
                      
                      {/* RF Matching Network (Inductors/Caps) */}
                      <rect x="35" y="45" width="8" height="12" fill="#111" />
                      <rect x="50" y="45" width="8" height="12" fill="#c4a56c" />
                      <rect x="65" y="45" width="8" height="12" fill="#111" />
                      
                      {/* RF Trace to antenna pad */}
                      <path d="M 70,45 L 70,10" fill="none" stroke="#d4af37" strokeWidth="3" />
                      <circle cx="70" cy="10" r="5" fill="#d4af37" />
                    </g>
                  )}

                  {/* PART 3: CASTELLATED PADS */}
                  {part.id === 'lora_pins' && (
                    <g>
                      {/* Gold plated half-holes along the edges */}
                      
                      {/* Left edge castellations */}
                      {[30, 50, 70, 90, 110, 130, 150].map((py, i) => (
                        <g key={`l-${i}`}>
                          {/* Inner pad */}
                          <rect x="5" y={py - 3} width="10" height="6" fill="#d4af37" />
                          {/* Half hole cut */}
                          <path d={`M 0,${py - 4} A 4,4 0 0,1 0,${py + 4}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
                        </g>
                      ))}
                      
                      {/* Right edge castellations */}
                      {[30, 50, 70, 90, 110, 130, 150].map((py, i) => (
                        <g key={`r-${i}`}>
                          {/* Inner pad */}
                          <rect x={part.w - 15} y={py - 3} width="10" height="6" fill="#d4af37" />
                          {/* Half hole cut */}
                          <path d={`M ${part.w},${py - 4} A 4,4 0 0,0 ${part.w},${py + 4}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
                        </g>
                      ))}
                      
                      <text x="-15" y="32" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">GND</text>
                      <text x="-15" y="52" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">MISO</text>
                      <text x="-15" y="72" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">MOSI</text>
                      <text x="-15" y="92" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">SCK</text>
                      <text x="-15" y="112" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">NSS</text>
                      
                      <text x={part.w + 5} y="32" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">3.3V</text>
                      <text x={part.w + 5} y="52" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">RST</text>
                      <text x={part.w + 5} y="72" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">DIO0</text>
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
                ? LORA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'LORA RF TRANSCEIVER MODULE Â· 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? LORA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? LORA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
