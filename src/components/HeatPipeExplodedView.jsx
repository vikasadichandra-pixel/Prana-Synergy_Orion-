import { layoutExplodedParts } from '../lib/explodedLayout';
﻿import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';

// Heat Pipe physical discrete parts
// Coordinates in 1200 x 600 artboard
const HEATPIPE_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'hp_evap',
    name: 'FLATTENED EVAPORATOR SECTION',
    code: 'CU-HP-EVAP',
    spec: 'High-purity OFHC copper flat section in direct thermal contact with primary heat source',
    role: 'HEAT ABSORPTION',
    w: 80,
    h: 120,
    assembled: { x: 500, y: 240 },
    exploded: { x: 200, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 500, y2: 300 }
  },
  {
    id: 'hp_core',
    name: 'SINTERED WICK & VAPOR CORE',
    code: 'SINTERED-WICK-6MM',
    spec: 'Porous sintered copper powder wick for capillary fluid return and central hollow vapor cavity',
    role: 'LATENT HEAT TRANSPORT',
    w: 240,
    h: 40,
    assembled: { x: 500, y: 280 },
    exploded: { x: 500, y: 280 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'hp_cond',
    name: 'ROUND CONDENSER SECTION',
    code: 'CU-HP-COND',
    spec: 'Standard 6mm round copper tube section for mating with aluminum radiator fin arrays',
    role: 'HEAT REJECTION',
    w: 80,
    h: 180,
    assembled: { x: 680, y: 210 },
    exploded: { x: 920, y: 210 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 680, y1: 300, x2: 'left', y2: 300 }
  }
]);

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function HeatPipeExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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

    HEATPIPE_PARTS_CONFIG.forEach((part) => {
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
      className="heatpipe-horizontal-view-container"
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
            <marker id="hp-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="hp-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="cu-pipe-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#874a2b" />
              <stop offset="30%" stopColor="#c77242" />
              <stop offset="70%" stopColor="#d9895b" />
              <stop offset="100%" stopColor="#6e3920" />
            </linearGradient>
            
            <linearGradient id="cu-flat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c77242" />
              <stop offset="100%" stopColor="#a3572d" />
            </linearGradient>

            <pattern id="sintered-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#753516" />
              <circle cx="0" cy="0" r="1" fill="#4d220e" />
              <circle cx="4" cy="4" r="1" fill="#4d220e" />
            </pattern>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...HEATPIPE_PARTS_CONFIG].reverse().map((part) => {
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

              const isOrange = part.id === 'hp_evap';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#hp-marker-orange)' : 'url(#hp-marker-lime)';

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
          {[...HEATPIPE_PARTS_CONFIG].reverse().map((part) => {
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
                  {/* PART 1: FLATTENED EVAPORATOR */}
                  {part.id === 'hp_evap' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="8" fill="url(#cu-flat-grad)" stroke="#874a2b" strokeWidth="2" />
                      {/* Thermal paste residue indicator */}
                      <path d="M 20,20 Q 40,40 30,60 T 50,90 Q 60,60 50,30 Z" fill="#b0bcc7" opacity="0.7" />
                      {/* Crimp end */}
                      <path d="M 0,0 L 0,120 L -10,110 L -10,10 Z" fill="#874a2b" stroke="#522c19" strokeWidth="1" />
                    </g>
                  )}

                  {/* PART 2: SINTERED WICK AND VAPOR CORE */}
                  {part.id === 'hp_core' && (
                    <g>
                      {/* Outer boundary of the wick */}
                      <rect x="0" y="0" width={part.w} height={part.h} fill="url(#sintered-pattern)" stroke="#874a2b" strokeWidth="1" />
                      {/* Vapor channel (hollow core) */}
                      <rect x="0" y="10" width={part.w} height="20" fill="#301306" stroke="#4d220e" strokeWidth="2" />
                      
                      {/* Vapor flow arrows (animated if we wanted) */}
                      <path d="M 20,15 L 40,15 L 35,10 M 40,15 L 35,20" fill="none" stroke="#d9895b" strokeWidth="2" opacity="0.6" />
                      <path d="M 120,15 L 140,15 L 135,10 M 140,15 L 135,20" fill="none" stroke="#d9895b" strokeWidth="2" opacity="0.6" />
                      
                      {/* Fluid return arrows */}
                      <path d="M 40,30 L 20,30 L 25,25 M 20,30 L 25,35" fill="none" stroke="#6589c2" strokeWidth="2" opacity="0.6" />
                      <path d="M 140,30 L 120,30 L 125,25 M 120,30 L 125,35" fill="none" stroke="#6589c2" strokeWidth="2" opacity="0.6" />
                    </g>
                  )}

                  {/* PART 3: ROUND CONDENSER */}
                  {part.id === 'hp_cond' && (
                    <g>
                      {/* Vertical copper tube */}
                      <rect x="0" y="0" width="30" height={part.h} rx="15" fill="url(#cu-pipe-grad)" stroke="#522c19" strokeWidth="1.5" />
                      
                      {/* Pipe bending marks / texture */}
                      <line x1="5" y1="40" x2="25" y2="40" stroke="#a3572d" strokeWidth="1" opacity="0.6" />
                      <line x1="5" y1="80" x2="25" y2="80" stroke="#a3572d" strokeWidth="1" opacity="0.6" />
                      <line x1="5" y1="120" x2="25" y2="120" stroke="#a3572d" strokeWidth="1" opacity="0.6" />
                      
                      {/* Top crimp tip */}
                      <path d="M 0,0 L 30,0 L 20,-10 L 10,-10 Z" fill="#c77242" stroke="#522c19" strokeWidth="1" />
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
                ? HEATPIPE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'COPPER HEAT PIPE · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? HEATPIPE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? HEATPIPE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
