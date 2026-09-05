import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// 11.1V 3000mAh 18650 3S1P Li-ion Battery Pack physical discrete parts
// Coordinates in 1200 x 600 artboard
const BATTERY_PARTS_CONFIG = [
  {
    id: 'bat_pvc',
    name: 'BLUE PVC HEAT-SHRINK SLEEVE WITH SPEC LABEL',
    code: 'BATT-WRAP-PVC-3S1P',
    spec: '0.12mm high-dielectric blue PVC shrink jacket with 11.1V 3000mAh technical specification label',
    role: 'ENVIRONMENTAL & DIELECTRIC ENCLOSURE',
    w: 140,
    h: 220,
    assembled: { x: 505, y: 170 },
    exploded: { x: 45, y: 170 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 280, x2: 505, y2: 280 }
  },
  {
    id: 'bat_cells',
    name: '3S1P 18650 LI-ION CELL BANK',
    code: 'CELL-18650-30Q-3S1P',
    spec: '3x cylindrical 3.7V 3000mAh purple 18650 Li-ion cells in series with ABS spacer brackets & pure nickel busbars',
    role: 'ELECTROCHEMICAL ENERGY CORE',
    w: 140,
    h: 220,
    assembled: { x: 505, y: 170 },
    exploded: { x: 210, y: 170 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 280, x2: 505, y2: 280 }
  },
  {
    id: 'bat_bms',
    name: '3S 20A BMS PROTECTION CIRCUIT BOARD',
    code: 'BMS-3S-20A-PCM',
    spec: 'Emerald FR-4 PCB with cell overvoltage, undervoltage, overcurrent monitoring IC & 4 power MOSFET switches',
    role: 'BATTERY MANAGEMENT & CELL SAFETY',
    w: 115,
    h: 200,
    assembled: { x: 518, y: 180 },
    exploded: { x: 375, y: 180 },
    start: 0.18,
    end: 0.62,
    step: 3,
    line: { x1: 'right', y1: 280, x2: 518, y2: 280 }
  },
  {
    id: 'bat_foam',
    name: 'SILICONE THERMAL DAMPING FOAM PAD',
    code: 'FOAM-PAD-SIL-DAMP',
    spec: '1.5mm closed-cell white silicone foam buffer for mechanical shock absorption and cell thermal relief',
    role: 'VIBRATION & EXPANSION BUFFER',
    w: 110,
    h: 200,
    assembled: { x: 520, y: 180 },
    exploded: { x: 515, y: 180 },
    start: 0,
    end: 0,
    step: 4
  },
  {
    id: 'bat_kapton',
    name: 'HIGH-TEMP KAPTON POLYIMIDE TAPE',
    code: 'TAPE-KAPTON-POLY-15MM',
    spec: '260Â°C rated amber polyimide adhesive film for terminal dielectric isolation and busbar retention',
    role: 'ELECTRICAL ARC & SHORT ISOLATION',
    w: 95,
    h: 180,
    assembled: { x: 528, y: 190 },
    exploded: { x: 650, y: 190 },
    start: 0.18,
    end: 0.62,
    step: 5,
    line: { x1: 528, y1: 280, x2: 'left', y2: 280 }
  },
  {
    id: 'bat_wire',
    name: '18AWG DC BARREL WIRE HARNESS',
    code: 'WIRE-18AWG-DC-MALE',
    spec: 'Red/black high-strand silicone copper leads terminated with 5.5mm x 2.1mm male DC barrel power plug',
    role: 'DC POWER DELIVERY INTERFACE',
    w: 140,
    h: 170,
    assembled: { x: 505, y: 195 },
    exploded: { x: 770, y: 195 },
    start: 0.12,
    end: 0.55,
    step: 6,
    line: { x1: 505, y1: 280, x2: 'left', y2: 280 }
  },
  {
    id: 'bat_socket',
    name: 'DC BARREL JACK CHASSIS CONNECTOR',
    code: 'CONN-DC-BARREL-FEMALE-5.5',
    spec: 'Ribbed black molded female inline DC coaxial socket adapter with internal spring-loaded brass contact sleeve',
    role: 'EXTERNAL CHARGE & LOAD COUPLER',
    w: 105,
    h: 130,
    assembled: { x: 522, y: 215 },
    exploded: { x: 935, y: 215 },
    start: 0.05,
    end: 0.45,
    step: 7,
    line: { x1: 522, y1: 280, x2: 'left', y2: 280 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// â”€â”€â”€ STATIC SVG PART DRAWINGS (memoized, never re-rendered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PvcSleeve = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="12" fill="url(#pvc-blue-gradient)" stroke="#3985ea" strokeWidth="1.5" />
    <line x1={w * 0.33} y1="4" x2={w * 0.33} y2={h - 4} stroke="#103c7a" strokeWidth="2.5" opacity="0.4" />
    <line x1={w * 0.66} y1="4" x2={w * 0.66} y2={h - 4} stroke="#103c7a" strokeWidth="2.5" opacity="0.4" />
    <rect x="12" y="24" width={w - 24} height={h - 48} rx="4" fill="#ffffff" stroke="#c0c8d0" strokeWidth="1" />
    <rect x="12" y="24" width={w - 24} height="42" rx="4" fill="#133d82" />
    <text x={w / 2} y="44" fill="#ffffff" fontFamily="'DM Mono', monospace" fontWeight="900" fontSize="13" textAnchor="middle" letterSpacing="0.5">
      11.1V 3000 MAH
    </text>
    <text x={w / 2} y="58" fill="#a4cbff" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="9" textAnchor="middle">
      RECHARGEABLE BATTERY
    </text>
    <text x="20" y="86" fill="#111" fontFamily="'DM Mono', monospace" fontWeight="700" fontSize="9">TYPE: 18650 3S1P</text>
    <text x="20" y="102" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">NOM: 11.1V / 33.3Wh</text>
    <text x="20" y="117" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">MAX CHARGE: 12.6V</text>
    <text x="20" y="132" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">CUT-OFF: 9.0V</text>
    <text x="20" y="147" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">BMS INTEGRATED</text>
    <line x1="20" y1="156" x2={w - 20} y2="156" stroke="#e0e0e0" strokeWidth="1" />
    <text x={w / 2} y="168" fill="#666" fontFamily="'DM Sans', sans-serif" fontSize="8" textAnchor="middle">MADE IN INDIA Â· RoHS</text>
  </g>
));

const CellBank = React.memo(({ w, h }) => (
  <g>
    <rect x="4" y="0" width={w - 8} height="24" rx="4" fill="#1e2226" stroke="#373d45" strokeWidth="1.5" />
    <rect x="4" y={h - 24} width={w - 8} height="24" rx="4" fill="#1e2226" stroke="#373d45" strokeWidth="1.5" />
    {[0, 1, 2].map((i) => {
      const cellX = 12 + i * 40;
      return (
        <g key={i}>
          <rect x={cellX} y="14" width="36" height={h - 28} rx="4" fill="url(#cell-purple-gradient)" stroke="#431e54" strokeWidth="1.2" />
          <line x1={cellX + 10} y1="18" x2={cellX + 10} y2={h - 18} stroke="#d59af2" strokeWidth="1.5" opacity="0.35" />
          <rect x={cellX + 8} y="8" width="20" height="8" rx="2" fill="url(#nickel-strip-gradient)" stroke="#888" strokeWidth="0.5" />
          <rect x={cellX + 8} y={h - 16} width="20" height="8" rx="2" fill="url(#nickel-strip-gradient)" stroke="#888" strokeWidth="0.5" />
        </g>
      );
    })}
    <rect x="22" y="6" width="56" height="10" rx="2" fill="url(#nickel-strip-gradient)" stroke="#666" strokeWidth="0.8" />
    <circle cx="32" cy="11" r="1.5" fill="#333" />
    <circle cx="68" cy="11" r="1.5" fill="#333" />
    <rect x="62" y={h - 16} width="56" height="10" rx="2" fill="url(#nickel-strip-gradient)" stroke="#666" strokeWidth="0.8" />
    <circle cx="72" cy={h - 11} r="1.5" fill="#333" />
    <circle cx="108" cy={h - 11} r="1.5" fill="#333" />
  </g>
));

const BmsPcb = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#1b6333" stroke="#2b9951" strokeWidth="1.8" />
    {['B-', 'B1', 'B2', 'B+', 'P+', 'P-'].map((pad, idx) => (
      <g key={pad}>
        <circle cx="16" cy={28 + idx * 28} r="6.5" fill="#d4af37" stroke="#fff" strokeWidth="0.8" />
        <text x="28" y={32 + idx * 28} fill="#e2faea" fontFamily="'DM Mono', monospace" fontWeight="700" fontSize="9">{pad}</text>
      </g>
    ))}
    <rect x="52" y="32" width="48" height="34" rx="2" fill="#121517" stroke="#444b52" strokeWidth="1.2" />
    <text x="76" y="52" fill="#ced4da" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" textAnchor="middle">BMS-IC</text>
    {[0, 1, 2, 3].map((m) => (
      <g key={m}>
        <rect x="52" y={80 + m * 26} width="48" height="20" rx="1.5" fill="#1a1d20" stroke="#333" strokeWidth="1" />
        <rect x="58" y={84 + m * 26} width="12" height="6" fill="#888" rx="0.5" />
        <text x="76" y={94 + m * 26} fill="#a0abb5" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">MOSFET</text>
      </g>
    ))}
  </g>
));

const FoamPad = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="6" fill="#f0f3f6" stroke="#d5dbe2" strokeWidth="1.5" />
    {[1, 2, 3, 4, 5, 6].map((row) =>
      [1, 2, 3].map((col) => (
        <circle key={`${row}-${col}`} cx={col * 28} cy={row * 28} r="3" fill="#dde2e8" />
      ))
    )}
    <text x={w / 2} y={h - 14} fill="#88929e" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">THERMAL FOAM</text>
  </g>
));

const KaptonTape = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="3" fill="url(#kapton-gradient)" stroke="#d99918" strokeWidth="1.2" />
    <line x1="8" y1="4" x2="8" y2={h - 4} stroke="#ffea94" strokeWidth="1.5" opacity="0.75" />
    <line x1="4" y1={h / 2} x2={w - 4} y2={h / 2} stroke="#ffea94" strokeWidth="1" opacity="0.4" />
    <text x={w / 2} y={h / 2 + 3} fill="#573703" fontFamily="'DM Mono', monospace" fontWeight="800" fontSize="9" textAnchor="middle" letterSpacing="0.8">KAPTON 260Â°C</text>
  </g>
));

const WireHarness = React.memo(() => (
  <g>
    <path d="M 0,55 Q 35,45 60,75 T 90,80" fill="none" stroke="#d82b2b" strokeWidth="7" strokeLinecap="round" />
    <path d="M 0,85 Q 35,75 60,105 T 90,95" fill="none" stroke="#22252a" strokeWidth="7" strokeLinecap="round" />
    <rect x="85" y="72" width="24" height="30" rx="3" fill="#181a1c" stroke="#333" strokeWidth="1" />
    <line x1="91" y1="72" x2="91" y2="102" stroke="#444" strokeWidth="1.5" />
    <line x1="97" y1="72" x2="97" y2="102" stroke="#444" strokeWidth="1.5" />
    <line x1="103" y1="72" x2="103" y2="102" stroke="#444" strokeWidth="1.5" />
    <rect x="109" y="80" width="28" height="14" rx="1" fill="url(#barrel-metal-gradient)" stroke="#777" strokeWidth="0.8" />
    <rect x="134" y="82" width="4" height="10" fill="#222" />
  </g>
));

const BarrelSocket = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="30" width="80" height="70" rx="6" fill="#1a1c1e" stroke="#353b42" strokeWidth="1.5" />
    {[15, 27, 39, 51, 63].map((rib) => (
      <line key={rib} x1={rib} y1="32" x2={rib} y2="98" stroke="#2a2f35" strokeWidth="3" />
    ))}
    <rect x="80" y="44" width="18" height="42" rx="2" fill="url(#barrel-metal-gradient)" stroke="#555" strokeWidth="1" />
    <circle cx="89" cy="65" r="7" fill="#111" />
    <circle cx="89" cy="65" r="2.5" fill="#f0c242" />
  </g>
));

// Map part IDs to their static drawing components
const PART_RENDERERS = {
  bat_pvc: PvcSleeve,
  bat_cells: CellBank,
  bat_bms: BmsPcb,
  bat_foam: FoamPad,
  bat_kapton: KaptonTape,
  bat_wire: WireHarness,
  bat_socket: BarrelSocket,
};

// â”€â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function BatteryExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM manipulation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);

  // Store last known progress to skip unnecessary RAF work
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // â”€â”€ DIRECT DOM ANIMATION (runs outside React render) â”€â”€
  useEffect(() => {
    // Skip if progress hasn't meaningfully changed
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    // Update lines container opacity
    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    // Update each part's transform and its projection line directly on the DOM
    BATTERY_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      // Move the part group
      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      // Move the projection line
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

  // Memoize hover callbacks to prevent re-creation
  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  // Memoize the gradient defs (completely static, never changes)
  const svgDefs = useMemo(() => (
    <defs>
      <marker id="bat-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
      </marker>
      <marker id="bat-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
      </marker>
      <linearGradient id="pvc-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e5cb3" />
        <stop offset="35%" stopColor="#2977dd" />
        <stop offset="70%" stopColor="#2267c7" />
        <stop offset="100%" stopColor="#164b96" />
      </linearGradient>
      <linearGradient id="cell-purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6d3985" />
        <stop offset="40%" stopColor="#9b56bc" />
        <stop offset="75%" stopColor="#7a3f95" />
        <stop offset="100%" stopColor="#502863" />
      </linearGradient>
      <linearGradient id="nickel-strip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e6eb" />
        <stop offset="50%" stopColor="#b4bcc6" />
        <stop offset="100%" stopColor="#eef1f5" />
      </linearGradient>
      <linearGradient id="kapton-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5b838" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#c28511" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="barrel-metal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e0e0e0" />
        <stop offset="50%" stopColor="#9e9e9e" />
        <stop offset="100%" stopColor="#f5f5f5" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div
      className="battery-horizontal-view-container"
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
            overflow: 'visible'
            /* REMOVED: filter: 'drop-shadow(...)' from the root SVG â€” 
               this was forcing the browser to composite the ENTIRE SVG tree 
               through a single expensive paint layer. Shadows are now per-part via CSS. */
          }}
        >
          {svgDefs}

          {/* Dynamic Laser Projection Lines â€” DOM-mutated, not React-rendered */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {BATTERY_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isOrange = part.id.includes('cells') || part.id.includes('wire');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#bat-marker-orange)' : 'url(#bat-marker-lime)';

              return (
                <g
                  key={`line-${part.id}`}
                  ref={(el) => { lineGroupRefs.current[part.id] = el; }}
                  opacity="0"
                >
                  <line
                    x1={part.assembled.x}
                    y1={part.line.y1}
                    x2={part.assembled.x}
                    y2={part.line.y2}
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

          {/* 7 Physical Discrete Battery Parts â€” transforms mutated via ref, not state */}
          {BATTERY_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];

            return (
              <g
                key={part.id}
                ref={(el) => { partGroupRefs.current[part.id] = el; }}
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                onMouseEnter={() => handleMouseEnter(part.id)}
                onMouseLeave={handleMouseLeave}
                style={{
                  cursor: 'pointer',
                  willChange: 'transform',
                  /* GPU-accelerated CSS drop-shadow replaces the SVG feDropShadow filter.
                     CSS filter is composited by the GPU, SVG filter runs on the CPU paint thread. */
                  filter: isHovered
                    ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)'
                    : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
                  transition: 'filter 0.15s ease-out'
                }}
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

                {/* Static memoized part drawing â€” React never diffs this subtree */}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
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
                ? BATTERY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'BATTERY PACK ARCHITECTURE Â· 7 DISCRETE PHYSICAL SUB-ASSEMBLIES'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? BATTERY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? BATTERY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '7 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
