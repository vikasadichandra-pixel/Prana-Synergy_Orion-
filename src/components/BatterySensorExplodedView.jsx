import { useExplodedParts } from '../hooks/useHardwareFraming';
import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useCallback, useMemo } from 'react';

// Battery Voltage Sensor physical discrete parts + AD5933 sub-component
// Coordinates in 1200 x 600 artboard
const BATSENSOR_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'bs_face',
    name: 'VOLTAGE DIVIDER SENSOR FACE',
    code: 'VDIV-0-25V-SMD',
    spec: 'Precision 30kΩ/7.5kΩ SMD resistor network reducing 0-25V input to 0-5V safe ADC levels',
    role: 'VOLTAGE SCALING & MEASUREMENT',
    w: 140,
    h: 140,
    assembled: { x: 530, y: 230 },
    exploded: { x: 130, y: 230 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'bs_body',
    name: 'FR-4 SENSOR SUBSTRATE & MOUNTING',
    code: 'PCB-FR4-BATSENSE',
    spec: '1.6mm thickness FR-4 glass epoxy substrate with ENIG finish and M3 mounting hole',
    role: 'MECHANICAL BASE & ROUTING',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 520, y: 220 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'bs_pins',
    name: 'ADC & POWER INTERFACE PINS',
    code: 'HDR-3P-ADC',
    spec: '3-pin standard 2.54mm pitch right-angle header (S, +, -) for direct MCU analog input',
    role: 'DATA ACQUISITION LINK',
    w: 60,
    h: 120,
    assembled: { x: 520, y: 240 },
    exploded: { x: 780, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'bs_ad5933',
    name: 'AD5933 BATTERY IMPEDANCE IC',
    code: 'AD5933-YRSZ',
    spec: 'Analog Devices 12-bit impedance analyzer, 1kHz–100kHz excitation, I²C, measures battery ESR & cell degradation',
    role: '[IC SUB-ASSEMBLY] IMPEDANCE SPECTROSCOPY',
    isSubComponent: true,
    w: 90,
    h: 90,
    assembled: { x: 555, y: 255 },
    exploded: { x: 960, y: 255 },
    start: 0.20,
    end: 0.60,
    step: 4,
    line: { x1: 555, y1: 300, x2: 'left', y2: 300 }
  }
]);


export default function BatterySensorExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  useExplodedParts(BATSENSOR_PARTS_CONFIG, progress, partGroupRefs, lineGroupRefs, linesContainerRef);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return useMemo(() => (
    <div className="batsensor-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
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
            <marker id="bs-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="bs-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="pcb-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5831" /><stop offset="100%" stopColor="#11361c" />
            </linearGradient>
            <linearGradient id="gold-pin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3b432" /><stop offset="50%" stopColor="#f5dc7f" /><stop offset="100%" stopColor="#c79918" />
            </linearGradient>
          </defs>

          {/* Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...BATSENSOR_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'bs_face' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#bs-marker-orange)' : `url(#bs-marker-${part.id === 'bs_face' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#bs-marker-orange)' : `url(#bs-marker-${part.id === 'bs_face' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {[...BATSENSOR_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} data-part-id={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && (
                  <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />
                )}

                {part.id === 'bs_face' && (
                  <g>
                    <rect x="0" y="30" width="30" height="80" rx="2" fill="#1b85d1" stroke="#12568a" strokeWidth="1" />
                    <rect x="15" y="40" width="10" height="20" fill="#aebac7" stroke="#333" />
                    <circle cx="20" cy="50" r="3" fill="#111" />
                    <rect x="15" y="80" width="10" height="20" fill="#aebac7" stroke="#333" />
                    <circle cx="20" cy="90" r="3" fill="#111" />
                    <path d="M 30,50 L 70,50 M 30,90 L 70,90" fill="none" stroke="#d4af37" strokeWidth="6" />
                    <path d="M 70,50 L 70,70 L 100,70" fill="none" stroke="#d4af37" strokeWidth="6" />
                    <path d="M 70,90 L 100,90" fill="none" stroke="#d4af37" strokeWidth="6" />
                    <rect x="60" y="42" width="20" height="12" fill="#111" stroke="#fff" strokeWidth="0.5" />
                    <rect x="58" y="42" width="4" height="12" fill="#ccc" />
                    <rect x="78" y="42" width="4" height="12" fill="#ccc" />
                    <text x="70" y="50" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">303</text>
                    <rect x="60" y="84" width="20" height="12" fill="#111" stroke="#fff" strokeWidth="0.5" />
                    <rect x="58" y="84" width="4" height="12" fill="#ccc" />
                    <rect x="78" y="84" width="4" height="12" fill="#ccc" />
                    <text x="70" y="92" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">752</text>
                  </g>
                )}

                {part.id === 'bs_body' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pcb-blue-grad)" stroke="#1a4726" strokeWidth="2" />
                    <circle cx="80" cy="130" r="14" fill="#0c2414" stroke="#d4af37" strokeWidth="4" />
                    <circle cx="80" cy="130" r="8" fill="#11361c" />
                    <text x="80" y="25" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">VCC-SENSE</text>
                    <text x="80" y="40" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="10" textAnchor="middle">0 - 25V</text>
                  </g>
                )}

                {part.id === 'bs_pins' && (
                  <g>
                    <rect x="0" y="20" width="15" height="80" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                    {[30, 55, 80].map((py, i) => (
                      <g key={i}>
                        <rect x="-5" y={py} width="5" height="8" fill="#778494" />
                        <rect x="15" y={py} width="35" height="8" rx="1" fill="url(#gold-pin-grad)" stroke="#9a7615" strokeWidth="0.5" />
                      </g>
                    ))}
                    <text x="25" y="42" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">S</text>
                    <text x="25" y="67" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">+</text>
                    <text x="25" y="92" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">-</text>
                  </g>
                )}

                {/* SUB-COMPONENT: AD5933 Battery Impedance IC */}
                {part.id === 'bs_ad5933' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    {/* SSOP package */}
                    <rect x={part.w / 2 - 18} y="12" width="36" height="28" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 10} cy="18" r="2" fill="#888" />
                    {/* Pin rows */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <rect key={`l-${i}`} x={part.w / 2 - 22} y={14 + i * 3} width="4" height="2" fill="#d4af37" />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <rect key={`r-${i}`} x={part.w / 2 + 18} y={14 + i * 3} width="4" height="2" fill="#d4af37" />
                    ))}
                    <text x={part.w / 2} y="30" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">AD5933</text>
                    <text x={part.w / 2} y="54" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">IMPEDANCE</text>
                    <text x={part.w / 2} y="64" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">ANALYZER</text>
                    <text x={part.w / 2} y="78" fill="#666" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">1kHz–100kHz</text>
                    {/* Sub-component badge */}
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
              {hoveredPart ? BATSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'BATTERY VOLTAGE SENSOR · 4 DISCRETE LAYERS + IC'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? BATSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES AD5933 IMPEDANCE SPECTROSCOPY SUB-ASSEMBLY'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? BATSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  ), [hoveredPart]);
}
