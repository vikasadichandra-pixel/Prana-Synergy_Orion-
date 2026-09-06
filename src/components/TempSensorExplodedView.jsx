import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';

// Temperature Sensor physical discrete parts + MAX31865 RTD Converter
const TEMPSENSOR_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'ts_face',
    name: 'POLYMER ENCAPSULATION',
    code: 'TO-92-PLASTIC',
    spec: 'Molded polymer casing providing mechanical protection and moderate thermal coupling to the environment',
    role: 'ENVIRONMENTAL HOUSING',
    w: 80, h: 80,
    assembled: { x: 560, y: 160 },
    exploded: { x: 300, y: 160 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 200, x2: 560, y2: 200 }
  },
  {
    id: 'ts_die',
    name: 'DIGITAL THERMOMETER DIE',
    code: 'DS-IC-DIE',
    spec: 'Silicon die containing a bandgap temperature sensor and 9-to-12 bit analog-to-digital converter (ADC)',
    role: 'THERMAL MEASUREMENT & DIGITIZATION',
    w: 40, h: 40,
    assembled: { x: 580, y: 180 },
    exploded: { x: 580, y: 180 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'ts_leads',
    name: 'COPPER-ALLOY LEADFRAME',
    code: 'LEADFRAME-3P-TO92',
    spec: '3-pin tinned copper leadframe for VDD, GND, and 1-Wire digital data (DQ) connection',
    role: 'POWER & DATA I/O',
    w: 60, h: 220,
    assembled: { x: 570, y: 150 },
    exploded: { x: 840, y: 150 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 570, y1: 200, x2: 'left', y2: 200 }
  },
  {
    id: 'ts_max31865',
    name: 'MAX31865 RTD-TO-DIGITAL',
    code: 'MAX31865AAP+',
    spec: 'Precision 15-bit RTD-to-Digital converter with SPI interface for PT100/PT1000 temperature sensors',
    role: '[IC SUB-ASSEMBLY] PRECISION ADC',
    isSubComponent: true,
    w: 90, h: 90,
    assembled: { x: 555, y: 280 },
    exploded: { x: 970, y: 280 },
    start: 0.22, end: 0.62, step: 4,
    line: { x1: 555, y1: 325, x2: 'left', y2: 325 }
  }
]);

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function TempSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useLayoutEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    TEMPSENSOR_PARTS_CONFIG.forEach((part) => {
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

  return (
    <div className="tempsensor-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="ts-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="ts-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="polymer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1c1e" /><stop offset="50%" stopColor="#25282b" /><stop offset="100%" stopColor="#0f1112" />
            </linearGradient>
            <linearGradient id="si-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#294031" /><stop offset="100%" stopColor="#121f17" />
            </linearGradient>
            <linearGradient id="lead-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9da7b3" /><stop offset="50%" stopColor="#c5d0db" /><stop offset="100%" stopColor="#7e868f" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...TEMPSENSOR_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'ts_face' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#ts-marker-orange)' : `url(#ts-marker-${part.id === 'ts_face' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#ts-marker-orange)' : `url(#ts-marker-${part.id === 'ts_face' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {[...TEMPSENSOR_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} data-part-id={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'ts_face' && (
                  <g>
                    <path d="M 0,25 C 0,0 80,0 80,25 L 80,60 L 0,60 Z" fill="url(#polymer-grad)" stroke="#111" strokeWidth="1" />
                    <rect x="0" y="60" width="80" height="20" fill="#15171a" stroke="#000" strokeWidth="1" />
                    <text x="40" y="35" fill="#5b6066" fontFamily="'DM Mono', monospace" fontSize="11" fontWeight="bold" textAnchor="middle">DS18B20</text>
                    <text x="40" y="50" fill="#44484d" fontFamily="'DM Mono', monospace" fontSize="9" textAnchor="middle">DALLAS</text>
                    <text x="40" y="65" fill="#3a3d42" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">2135C4</text>
                  </g>
                )}

                {part.id === 'ts_die' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} fill="url(#si-die-grad)" stroke="#1a2e21" strokeWidth="1.5" />
                    <rect x="5" y="5" width="15" height="15" fill="none" stroke="#486e55" strokeWidth="0.5" strokeDasharray="1 1" />
                    <rect x="20" y="5" width="15" height="15" fill="none" stroke="#486e55" strokeWidth="0.5" strokeDasharray="1 1" />
                    <rect x="5" y="25" width="30" height="10" fill="#1f3325" stroke="#2c4a36" strokeWidth="0.5" />
                    <rect x="4" y="35" width="8" height="4" fill="#d4af37" />
                    <rect x="16" y="35" width="8" height="4" fill="#d4af37" />
                    <rect x="28" y="35" width="8" height="4" fill="#d4af37" />
                    <path d="M 8,37 Q 8,50 -2,60" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                    <path d="M 20,37 Q 20,50 15,60" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                    <path d="M 32,37 Q 32,50 42,60" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                  </g>
                )}

                {part.id === 'ts_leads' && (
                  <g>
                    <rect x="0" y="0" width="60" height="30" fill="url(#lead-grad)" stroke="#5f6770" strokeWidth="1" />
                    <rect x="10" y="5" width="40" height="20" fill="#8c97a3" />
                    <path d="M 5,30 L 15,40 L 15,220" fill="none" stroke="url(#lead-grad)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M 5,30 L 15,40 L 15,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                    <path d="M 27,30 L 30,40 L 30,220" fill="none" stroke="url(#lead-grad)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M 27,30 L 30,40 L 30,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                    <path d="M 55,30 L 45,40 L 45,220" fill="none" stroke="url(#lead-grad)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M 55,30 L 45,40 L 45,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                    <text x="15" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">GND</text>
                    <text x="30" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">DQ</text>
                    <text x="45" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">VDD</text>
                  </g>
                )}

                {/* SUB-COMPONENT: MAX31865 */}
                {part.id === 'ts_max31865' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 20} y="15" width="40" height="30" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 14} cy="22" r="2.5" fill="#888" />
                    {Array.from({ length: 10 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 24} y={17 + i * 3} width="4" height="1.5" fill="#d4af37" />))}
                    {Array.from({ length: 10 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 20} y={17 + i * 3} width="4" height="1.5" fill="#d4af37" />))}
                    <text x={part.w / 2} y="32" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">MAX31865</text>
                    <text x={part.w / 2} y="42" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">15-BIT RTD ADC</text>
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? TEMPSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'DIGITAL TEMPERATURE SENSOR · 4 COMPONENTS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? TEMPSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES MAX31865 RTD TO DIGITAL CONVERTER'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? TEMPSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
