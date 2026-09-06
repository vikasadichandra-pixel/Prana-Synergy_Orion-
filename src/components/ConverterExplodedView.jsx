import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';

// DC-DC Converter physical discrete parts + TI INA228 / Vishay WSL Shunt
const CONVERTER_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'conv_inductors',
    name: 'POWER CONVERSION STAGE',
    code: 'LC-FILTER-BUCKBOOST',
    spec: 'High-current toroidal inductors and low-ESR electrolytic capacitors for ripple suppression',
    role: 'ENERGY STORAGE & FILTERING',
    w: 180, h: 120,
    assembled: { x: 510, y: 160 },
    exploded: { x: 130, y: 160 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 220, x2: 510, y2: 220 }
  },
  {
    id: 'conv_pcb',
    name: 'HIGH-CURRENT PCB SUBSTRATE',
    code: 'PCB-FR4-2OZ-CU',
    spec: 'Heavy 2oz copper FR4 PCB with integrated switching controller ICs and thermal vias',
    role: 'SWITCHING LOGIC & ROUTING',
    w: 220, h: 220,
    assembled: { x: 490, y: 190 },
    exploded: { x: 490, y: 190 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'conv_terminals',
    name: 'INPUT/OUTPUT SCREW TERMINALS',
    code: 'TERM-BLOCK-20A',
    spec: 'Heavy-duty PCB mount screw terminal blocks rated for 20A continuous current',
    role: 'POWER INTERFACE',
    w: 120, h: 180,
    assembled: { x: 490, y: 210 },
    exploded: { x: 730, y: 210 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'conv_ina228',
    name: 'TI INA228 POWER MONITOR',
    code: 'INA228-I2C',
    spec: '85V, 20-bit ultra-precise digital power monitor with I2C/SMBus interface',
    role: '[IC SUB-ASSEMBLY] CURRENT SENSING',
    isSubComponent: true,
    w: 80, h: 80,
    assembled: { x: 520, y: 340 },
    exploded: { x: 920, y: 340 },
    start: 0.22, end: 0.62, step: 4,
    line: { x1: 520, y1: 380, x2: 'left', y2: 380 }
  },
  {
    id: 'conv_wsl',
    name: 'VISHAY WSL SHUNT RESISTOR',
    code: 'WSL-3921-1MOHM',
    spec: 'Ultra-low 1mΩ 3W Power Metal Strip shunt for high-current measurement',
    role: '[IC SUB-ASSEMBLY] SHUNT RESISTOR',
    isSubComponent: true,
    w: 60, h: 40,
    assembled: { x: 580, y: 360 },
    exploded: { x: 1040, y: 360 },
    start: 0.25, end: 0.65, step: 5,
    line: { x1: 580, y1: 380, x2: 'left', y2: 380 }
  }
]);

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function ConverterExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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
    CONVERTER_PARTS_CONFIG.forEach((part) => {
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
    <div className="converter-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
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
            <marker id="conv-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="conv-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <radialGradient id="cap-top-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d1d6db" /><stop offset="70%" stopColor="#9da8b3" /><stop offset="100%" stopColor="#67737d" />
            </radialGradient>
            <linearGradient id="pcb-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a1215" /><stop offset="100%" stopColor="#3d0709" />
            </linearGradient>
            <linearGradient id="terminal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a7836" /><stop offset="100%" stopColor="#0d401c" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...CONVERTER_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'conv_inductors' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#conv-marker-orange)' : `url(#conv-marker-${part.id === 'conv_inductors' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#conv-marker-orange)' : `url(#conv-marker-${part.id === 'conv_inductors' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {[...CONVERTER_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} data-part-id={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'conv_inductors' && (
                  <g>
                    <circle cx="50" cy="60" r="45" fill="none" stroke="#222" strokeWidth="15" />
                    {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle) => (
                      <g key={`w1-${angle}`} transform={`translate(50, 60) rotate(${angle})`}>
                        <rect x="-4" y="-55" width="8" height="20" rx="4" fill="#c7722a" stroke="#874712" strokeWidth="0.5" />
                      </g>
                    ))}
                    <circle cx="140" cy="50" r="25" fill="none" stroke="#222" strokeWidth="10" />
                    {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((angle) => (
                      <g key={`w2-${angle}`} transform={`translate(140, 50) rotate(${angle})`}>
                        <rect x="-2" y="-32" width="4" height="14" rx="2" fill="#c7722a" stroke="#874712" strokeWidth="0.5" />
                      </g>
                    ))}
                    <circle cx="120" cy="100" r="15" fill="url(#cap-top-grad)" stroke="#333" strokeWidth="1" />
                    <path d="M 112,92 L 128,108 M 128,92 L 112,108" stroke="#555" strokeWidth="1.5" opacity="0.5" />
                    <circle cx="155" cy="95" r="12" fill="url(#cap-top-grad)" stroke="#333" strokeWidth="1" />
                    <path d="M 149,89 L 161,101 M 161,89 L 149,101" stroke="#555" strokeWidth="1.5" opacity="0.5" />
                  </g>
                )}

                {part.id === 'conv_pcb' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="6" fill="url(#pcb-red-grad)" stroke="#4a0b0d" strokeWidth="2" />
                    <path d="M 20,40 L 80,40 L 80,120" fill="none" stroke="#d4af37" strokeWidth="20" opacity="0.8" />
                    <path d="M 120,80 L 180,80 L 180,160" fill="none" stroke="#d4af37" strokeWidth="15" opacity="0.8" />
                    <rect x="80" y="140" width="40" height="40" fill="#111" stroke="#333" strokeWidth="1" />
                    <text x="100" y="160" fill="#777" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">XL4015</text>
                    <rect x="130" y="140" width="8" height="14" fill="#111" />
                    <rect x="130" y="160" width="8" height="14" fill="#c4a56c" />
                    <rect x="160" y="20" width="16" height="30" fill="#1a3d5e" stroke="#122a42" />
                    <circle cx="168" cy="35" r="5" fill="#c4a56c" />
                    <rect x="180" y="20" width="16" height="30" fill="#1a3d5e" stroke="#122a42" />
                    <circle cx="188" cy="35" r="5" fill="#c4a56c" />
                    <circle cx="50" cy="50" r="4" fill="#111" stroke="#d4af37" strokeWidth="2" />
                    <circle cx="80" cy="90" r="4" fill="#111" stroke="#d4af37" strokeWidth="2" />
                    <circle cx="20" cy="20" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                    <circle cx="200" cy="200" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                    <circle cx="20" cy="200" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                    <circle cx="200" cy="20" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                  </g>
                )}

                {part.id === 'conv_terminals' && (
                  <g>
                    <rect x="10" y="10" width="30" height="60" rx="2" fill="url(#terminal-grad)" stroke="#111" strokeWidth="1" />
                    <circle cx="25" cy="25" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="25" x2="31" y2="25" stroke="#333" strokeWidth="2" />
                    <circle cx="25" cy="55" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="55" x2="31" y2="55" stroke="#333" strokeWidth="2" />
                    <text x="25" y="5" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="10" fontWeight="bold" textAnchor="middle">IN</text>
                    <rect x="10" y="110" width="30" height="60" rx="2" fill="url(#terminal-grad)" stroke="#111" strokeWidth="1" />
                    <circle cx="25" cy="125" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="125" x2="31" y2="125" stroke="#333" strokeWidth="2" />
                    <circle cx="25" cy="155" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="155" x2="31" y2="155" stroke="#333" strokeWidth="2" />
                    <text x="25" y="105" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="10" fontWeight="bold" textAnchor="middle">OUT</text>
                    <rect x="0" y="22" width="10" height="6" fill="#778494" />
                    <rect x="0" y="52" width="10" height="6" fill="#778494" />
                    <rect x="0" y="122" width="10" height="6" fill="#778494" />
                    <rect x="0" y="152" width="10" height="6" fill="#778494" />
                  </g>
                )}

                {/* SUB-COMPONENT: INA228 */}
                {part.id === 'conv_ina228' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 12} y="15" width="24" height="24" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 6} cy="21" r="1.5" fill="#888" />
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 16} y={18 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 12} y={18 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    <text x={part.w / 2} y="32" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="6" fontWeight="800" textAnchor="middle">INA228</text>
                    <text x={part.w / 2} y="50" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">POWER MONITOR</text>
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}

                {/* SUB-COMPONENT: VISHAY WSL SHUNT */}
                {part.id === 'conv_wsl' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x="10" y="12" width="40" height="16" rx="1" fill="#444a52" stroke="#222" strokeWidth="1" />
                    <rect x="10" y="12" width="8" height="16" fill="#aab4c2" />
                    <rect x="42" y="12" width="8" height="16" fill="#aab4c2" />
                    <text x={part.w / 2} y="22" fill="#000" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold" textAnchor="middle">1mΩ</text>
                    <rect x="2" y={part.h - 10} width={part.w - 4} height="8" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 3} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="700" textAnchor="middle">SHUNT RESISTOR</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? CONVERTER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'DC-DC CONVERTER · 5 COMPONENTS WITH INA228 + SHUNT'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? CONVERTER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES I2C POWER MONITORING SENSOR ARRAY'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? CONVERTER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
