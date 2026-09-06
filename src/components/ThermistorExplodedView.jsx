import { layoutExplodedParts } from '../lib/explodedLayout';
﻿import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';

// Thermistor physical discrete parts
// Coordinates in 1200 x 600 artboard
const THERMISTOR_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'thm_glass',
    name: 'GLASS ENCAPSULATION BEAD',
    code: 'NTC-GLASS-BEAD-10K',
    spec: 'Hermetically sealed glass envelope for high-temperature stability up to 300°C',
    role: 'ENVIRONMENTAL & THERMAL SEAL',
    w: 60,
    h: 100,
    assembled: { x: 570, y: 150 },
    exploded: { x: 300, y: 150 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 200, x2: 570, y2: 200 }
  },
  {
    id: 'thm_core',
    name: 'NTC CERAMIC SEMICONDUCTOR DIE',
    code: 'NTC-DIE-10K-3950',
    spec: 'Negative Temperature Coefficient (NTC) metal-oxide ceramic sensing element, 10kΩ @ 25°C, B-value 3950K',
    role: 'THERMAL MEASUREMENT SENSOR',
    w: 40,
    h: 60,
    assembled: { x: 580, y: 170 },
    exploded: { x: 580, y: 170 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'thm_leads',
    name: 'DUMET RADIAL LEADS',
    code: 'LEAD-DUMET-AWG24',
    spec: 'Copper-clad nickel-iron alloy (Dumet) wire leads for matched thermal expansion with glass',
    role: 'ELECTRICAL & THERMAL PATH',
    w: 80,
    h: 220,
    assembled: { x: 560, y: 200 },
    exploded: { x: 800, y: 200 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 600, y1: 200, x2: 'left', y2: 200 }
  }
]);

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function ThermistorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useLayoutEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    THERMISTOR_PARTS_CONFIG.forEach((part) => {
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
      className="thermistor-horizontal-view-container"
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
            <marker id="thm-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="thm-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="glass-bead-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff3d9" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#d69728" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#875103" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="ceramic-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2c30" />
              <stop offset="50%" stopColor="#15171a" />
              <stop offset="100%" stopColor="#0b0c0d" />
            </linearGradient>

            <linearGradient id="dumet-wire-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3a76f" />
              <stop offset="30%" stopColor="#ffcca1" />
              <stop offset="70%" stopColor="#c7803e" />
              <stop offset="100%" stopColor="#8a4d13" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...THERMISTOR_PARTS_CONFIG].reverse().map((part) => {
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

              const isOrange = part.id === 'thm_glass';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#thm-marker-orange)' : 'url(#thm-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`} data-wire-id={part.id}>
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
          {[...THERMISTOR_PARTS_CONFIG].reverse().map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id} data-part-id={part.id}
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
                  {/* PART 1: GLASS ENCAPSULATION */}
                  {part.id === 'thm_glass' && (
                    <g>
                      <path d="M 15,100 C 15,100 0,60 0,30 C 0,0 60,0 60,30 C 60,60 45,100 45,100 Z" fill="url(#glass-bead-grad)" stroke="#d9a543" strokeWidth="1.5" />
                      {/* Glass highlight */}
                      <path d="M 15,30 C 15,15 30,10 40,15" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                    </g>
                  )}

                  {/* PART 2: CERAMIC DIE */}
                  {part.id === 'thm_core' && (
                    <g>
                      <rect x="5" y="10" width="30" height="35" rx="3" fill="url(#ceramic-die-grad)" stroke="#444" strokeWidth="1" />
                      {/* Sensing surface texture */}
                      {[15, 20, 25, 30, 35].map((y) => (
                        <line key={y} x1="8" y1={y} x2="32" y2={y} stroke="#333" strokeWidth="1" />
                      ))}
                      {/* Silver top/bottom contacts */}
                      <rect x="5" y="10" width="30" height="6" fill="#c0c5cc" />
                      <rect x="5" y="39" width="30" height="6" fill="#c0c5cc" />
                    </g>
                  )}

                  {/* PART 3: DUMET LEADS */}
                  {part.id === 'thm_leads' && (
                    <g>
                      {/* Left wire */}
                      <path d="M 20,0 C 20,40 10,70 10,220" fill="none" stroke="url(#dumet-wire-grad)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 20,0 C 20,40 10,70 10,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                      {/* Right wire */}
                      <path d="M 60,0 C 60,40 70,70 70,220" fill="none" stroke="url(#dumet-wire-grad)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 60,0 C 60,40 70,70 70,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
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
                ? THERMISTOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'THERMISTOR SYSTEM · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? THERMISTOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? THERMISTOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
