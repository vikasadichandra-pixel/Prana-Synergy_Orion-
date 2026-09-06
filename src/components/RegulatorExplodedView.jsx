import { useExplodedParts } from '../hooks/useHardwareFraming';
import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useRef, useCallback, useMemo } from 'react';

// Voltage Regulator physical discrete parts + Protection & ADC
const REGULATOR_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'reg_heatsink',
    name: 'ANODIZED ALUMINIUM HEATSINK',
    code: 'HS-AL-TO220-BLK',
    spec: 'Black anodized extruded aluminum alloy with 6 thermal fins for passive convection cooling',
    role: 'THERMAL DISSIPATION',
    w: 120, h: 180,
    assembled: { x: 540, y: 210 },
    exploded: { x: 120, y: 210 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'reg_ic',
    name: 'SWITCHING REGULATOR CORE & PCB',
    code: 'REG-BUCK-5V-3A',
    spec: 'High-efficiency buck converter IC with integrated MOSFETs and SMD ceramic filter capacitors on FR4 substrate',
    role: 'VOLTAGE STEP-DOWN & STABILIZATION',
    w: 160, h: 210,
    assembled: { x: 520, y: 195 },
    exploded: { x: 520, y: 195 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'reg_pins',
    name: 'HIGH-CURRENT PIN INTERFACE',
    code: 'HDR-PWR-3P-2.54',
    spec: '3-pin 2.54mm pitch gold-plated through-hole header (VIN, GND, VOUT) rated for 3A continuous',
    role: 'POWER DELIVERY & ROUTING',
    w: 160, h: 120,
    assembled: { x: 520, y: 195 },
    exploded: { x: 740, y: 195 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'reg_xt30',
    name: 'AMASS XT30 POWER CONNECTOR',
    code: 'XT30U-M',
    spec: 'High-current (30A) nylon plug with gold-plated bullet connectors for main battery input',
    role: '[SUB-ASSEMBLY] PRIMARY INPUT',
    isSubComponent: true,
    w: 50, h: 40,
    assembled: { x: 510, y: 320 },
    exploded: { x: 860, y: 320 },
    start: 0.2, end: 0.6, step: 4,
    line: { x1: 510, y1: 340, x2: 'left', y2: 340 }
  },
  {
    id: 'reg_fuse',
    name: 'BLADE FUSE PROTECTION',
    code: 'FUSE-AUTO-10A',
    spec: '10A fast-acting automotive blade fuse protecting the regulator from catastrophic load shorts',
    role: '[SUB-ASSEMBLY] OVERCURRENT SAFETY',
    isSubComponent: true,
    w: 40, h: 50,
    assembled: { x: 565, y: 310 },
    exploded: { x: 920, y: 310 },
    start: 0.22, end: 0.62, step: 5,
    line: { x1: 565, y1: 340, x2: 'left', y2: 340 }
  },
  {
    id: 'reg_tvs',
    name: 'TVS DIODE ARRAY',
    code: 'SMAJ15CA',
    spec: 'Transient Voltage Suppression diode array clamping inductive load spikes and ESD events',
    role: '[SUB-ASSEMBLY] VOLTAGE CLAMPING',
    isSubComponent: true,
    w: 40, h: 40,
    assembled: { x: 610, y: 320 },
    exploded: { x: 970, y: 320 },
    start: 0.24, end: 0.64, step: 6,
    line: { x1: 610, y1: 340, x2: 'left', y2: 340 }
  },
  {
    id: 'reg_ads1115',
    name: 'TI ADS1115 VOLTAGE MONITOR',
    code: 'ADS1115-I2C',
    spec: '16-bit precision ADC with PGA for continuous monitoring of input and output voltage levels',
    role: '[IC SUB-ASSEMBLY] TELEMETRY',
    isSubComponent: true,
    w: 70, h: 70,
    assembled: { x: 550, y: 370 },
    exploded: { x: 1040, y: 370 },
    start: 0.28, end: 0.68, step: 7,
    line: { x1: 550, y1: 405, x2: 'left', y2: 405 }
  }
]);


export default function RegulatorExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  useExplodedParts(REGULATOR_PARTS_CONFIG, progress, partGroupRefs, lineGroupRefs, linesContainerRef);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return useMemo(() => (
    <div className="regulator-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
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
            <marker id="reg-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="reg-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="heatsink-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1c1e" /><stop offset="30%" stopColor="#2a2d33" /><stop offset="70%" stopColor="#1f2226" /><stop offset="100%" stopColor="#141618" />
            </linearGradient>
            <linearGradient id="pcb-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#143e63" /><stop offset="100%" stopColor="#0d2942" />
            </linearGradient>
            <linearGradient id="gold-pin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3b432" /><stop offset="50%" stopColor="#f5dc7f" /><stop offset="100%" stopColor="#c79918" />
            </linearGradient>
            <linearGradient id="xt30-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca311" /><stop offset="100%" stopColor="#d38206" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...REGULATOR_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'reg_heatsink' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} data-wire-id={part.id} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#reg-marker-orange)' : `url(#reg-marker-${part.id === 'reg_heatsink' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#reg-marker-orange)' : `url(#reg-marker-${part.id === 'reg_heatsink' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {[...REGULATOR_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} data-part-id={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'reg_heatsink' && (
                  <g>
                    <rect x="0" y="0" width="30" height={part.h} rx="2" fill="url(#heatsink-grad)" stroke="#3a3d42" strokeWidth="1" />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <rect key={i} x="30" y={10 + i * 30} width="80" height="10" rx="1" fill="url(#heatsink-grad)" stroke="#2b2d30" strokeWidth="1" />
                    ))}
                    <circle cx="15" cy="25" r="8" fill="#0d0f11" stroke="#333" strokeWidth="1" />
                    <circle cx="15" cy="25" r="6" fill="#15171a" />
                  </g>
                )}

                {part.id === 'reg_ic' && (
                  <g>
                    <rect x="0" y="20" width={part.w} height="170" rx="4" fill="url(#pcb-blue-grad)" stroke="#21507a" strokeWidth="1.5" />
                    <rect x="0" y="20" width="30" height="170" fill="#aebac7" stroke="#778696" strokeWidth="1" />
                    <circle cx="15" cy="40" r="8" fill="#143e63" stroke="#526475" />
                    <rect x="50" y="45" width="60" height="60" rx="4" fill="#16181a" stroke="#3a3d42" strokeWidth="1.5" />
                    <circle cx="80" cy="75" r="22" fill="#222" stroke="#333" strokeWidth="1" />
                    <text x="80" y="80" fill="#666" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">470</text>
                    <rect x="60" y="125" width="40" height="40" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                    <circle cx="68" cy="133" r="3" fill="#444" />
                    <text x="80" y="150" fill="#888" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">LM</text>
                    <rect x="125" y="55" width="16" height="25" rx="1" fill="#c4a56c" stroke="#8c703f" strokeWidth="0.5" />
                    <rect x="125" y="130" width="16" height="25" rx="1" fill="#c4a56c" stroke="#8c703f" strokeWidth="0.5" />
                    <path d="M 40,75 L 50,75 M 110,75 L 133,75 L 133,55" fill="none" stroke="#3173ad" strokeWidth="4" />
                    <path d="M 100,145 L 125,145 M 60,110 L 60,125" fill="none" stroke="#3173ad" strokeWidth="4" />
                    <circle cx="140" cy="35" r="5" fill="#0d2942" stroke="#d4af37" strokeWidth="1.5" />
                    <circle cx="140" cy="175" r="5" fill="#0d2942" stroke="#d4af37" strokeWidth="1.5" />
                  </g>
                )}

                {part.id === 'reg_pins' && (
                  <g>
                    <rect x="140" y="50" width="14" height="110" rx="2" fill="#141618" stroke="#222" strokeWidth="1" />
                    {[65, 100, 135].map((py, i) => (
                      <g key={i}>
                        <rect x="135" y={py} width="5" height="10" fill="#778494" />
                        <rect x="154" y={py} width="35" height="10" rx="1" fill="url(#gold-pin-grad)" stroke="#9a7615" strokeWidth="0.5" />
                      </g>
                    ))}
                    <text x="175" y="62" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">VIN</text>
                    <text x="175" y="97" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">GND</text>
                    <text x="175" y="132" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">OUT</text>
                  </g>
                )}

                {/* SUB-COMPONENT: XT30 */}
                {part.id === 'reg_xt30' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <path d="M 10,10 L 40,10 L 40,25 L 35,30 L 10,30 Z" fill="url(#xt30-grad)" stroke="#8e5809" strokeWidth="1" />
                    <circle cx="18" cy="20" r="3" fill="url(#gold-pin-grad)" />
                    <circle cx="30" cy="20" r="3" fill="url(#gold-pin-grad)" />
                    <text x="18" y="27" fill="#8e5809" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="bold" textAnchor="middle">+</text>
                    <text x="30" y="27" fill="#8e5809" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="bold" textAnchor="middle">-</text>
                    <rect x="2" y={part.h - 8} width={part.w - 4} height="6" rx="1" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 2} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="700" textAnchor="middle">XT30 PWR</text>
                  </g>
                )}

                {/* SUB-COMPONENT: BLADE FUSE */}
                {part.id === 'reg_fuse' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x="8" y="10" width="24" height="20" rx="2" fill="#d92121" stroke="#871313" strokeWidth="1" />
                    <rect x="12" y="30" width="4" height="10" fill="#aab4c2" stroke="#555" strokeWidth="0.5" />
                    <rect x="24" y="30" width="4" height="10" fill="#aab4c2" stroke="#555" strokeWidth="0.5" />
                    <text x="20" y="24" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">10A</text>
                    <rect x="2" y={part.h - 8} width={part.w - 4} height="6" rx="1" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 2} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="3.5" fontWeight="700" textAnchor="middle">AUTO FUSE</text>
                  </g>
                )}

                {/* SUB-COMPONENT: TVS DIODE */}
                {part.id === 'reg_tvs' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x="10" y="12" width="20" height="16" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                    <rect x="12" y="12" width="4" height="16" fill="#555" /> {/* Polarity band */}
                    <rect x="4" y="16" width="6" height="8" fill="#aab4c2" />
                    <rect x="30" y="16" width="6" height="8" fill="#aab4c2" />
                    <rect x="2" y={part.h - 8} width={part.w - 4} height="6" rx="1" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 2} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="3.5" fontWeight="700" textAnchor="middle">TVS DIODE</text>
                  </g>
                )}

                {/* SUB-COMPONENT: ADS1115 */}
                {part.id === 'reg_ads1115' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 12} y="15" width="24" height="24" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 6} cy="21" r="1.5" fill="#888" />
                    {Array.from({ length: 5 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 16} y={17 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    {Array.from({ length: 5 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 12} y={17 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    <text x={part.w / 2} y="32" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="800" textAnchor="middle">ADS1115</text>
                    <text x={part.w / 2} y="50" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="4.5" textAnchor="middle">16-BIT ADC</text>
                    <rect x="2" y={part.h - 12} width={part.w - 4} height="10" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 4} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="4.5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? REGULATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'VOLTAGE REGULATOR · 7 COMPONENTS WITH PROTECTION & ADC'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? REGULATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES XT30, 10A FUSE, TVS, AND ADS1115 ADC'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? REGULATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '7 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  ), [hoveredPart]);
}
