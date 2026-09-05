import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// 2.8" ILI9341 SPI TFT Display Module — physical discrete parts
// Coordinates in 1200 x 600 artboard
const DISPLAY_PARTS_CONFIG = [
  {
    id: 'disp_bezel',
    name: 'FRONT PROTECTIVE BEZEL',
    code: 'BZL-ABS-2.8-BLK',
    spec: 'Injection-molded ABS bezel with anti-glare rim and snap-fit retention clips',
    role: 'SCREEN PROTECTION & ALIGNMENT',
    w: 160,
    h: 240,
    assembled: { x: 520, y: 180 },
    exploded: { x: 80, y: 180 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 520, y2: 300 }
  },
  {
    id: 'disp_tft',
    name: '2.8" ILI9341 SPI TFT LCD PANEL',
    code: 'TFT-ILI9341-240X320-SPI',
    spec: '240×320px 262K-color TFT with ILI9341 controller, 4-wire SPI interface, 40MHz clock',
    role: 'PRIMARY VISUAL OUTPUT',
    w: 140,
    h: 220,
    assembled: { x: 530, y: 190 },
    exploded: { x: 280, y: 190 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'disp_backlight',
    name: 'LED BACKLIGHT DIFFUSER PANEL',
    code: 'BLU-LED-WHT-2.8',
    spec: 'White LED edge-lit backlight unit with acrylic light-guide plate and optical diffuser films',
    role: 'UNIFORM ILLUMINATION',
    w: 140,
    h: 220,
    assembled: { x: 530, y: 190 },
    exploded: { x: 530, y: 190 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'disp_fpc',
    name: 'FPC RIBBON CABLE',
    code: 'FPC-40P-0.5MM',
    spec: '40-pin 0.5mm pitch flex cable connecting display panel to driver PCB',
    role: 'SIGNAL INTERCONNECT',
    w: 80,
    h: 120,
    assembled: { x: 560, y: 240 },
    exploded: { x: 730, y: 240 },
    start: 0.18,
    end: 0.62,
    step: 4,
    line: { x1: 560, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'disp_pcb',
    name: 'ILI9341 DRIVER PCB & SPI HEADER',
    code: 'PCB-TFT-DRV-SPI-8P',
    spec: 'Red soldermask FR-4 breakout board with 8-pin SPI header (VCC, GND, CS, RESET, DC, SDI, SCK, LED)',
    role: 'DIGITAL INTERFACE & CONTROL',
    w: 160,
    h: 200,
    assembled: { x: 520, y: 200 },
    exploded: { x: 920, y: 200 },
    start: 0.05,
    end: 0.45,
    step: 5,
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

// ——— STATIC SVG PART DRAWINGS (memoized, never re-rendered) ————————————
const FrontBezel = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="10" fill="#1a1c1e" stroke="#333" strokeWidth="2" />
    <rect x="8" y="8" width={w - 16} height={h - 16} rx="6" fill="#0d0f10" stroke="#2a2d31" strokeWidth="1.5" />
    {/* Screen window cutout */}
    <rect x="14" y="20" width={w - 28} height={h - 48} rx="3" fill="#050607" stroke="#444" strokeWidth="1" />
    {/* Anti-glare texture */}
    <line x1="14" y1="20" x2={w - 14} y2={h - 28} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
    <line x1={w - 14} y1="20" x2="14" y2={h - 28} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
    {/* Snap clips */}
    <rect x={w / 2 - 8} y={h - 6} width="16" height="6" rx="1" fill="#2a2d31" />
    <rect x={w / 2 - 8} y="0" width="16" height="6" rx="1" fill="#2a2d31" />
  </g>
));

const TftPanel = React.memo(({ w, h }) => (
  <g>
    {/* Glass substrate */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#tft-screen-gradient)" stroke="#1a6b9c" strokeWidth="1.5" />
    {/* Pixel grid suggestion */}
    {[0, 1, 2, 3].map(row =>
      [0, 1, 2].map(col => (
        <rect key={`px-${row}-${col}`} x={16 + col * 38} y={18 + row * 50} width="32" height="44" rx="2" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.15)" strokeWidth="0.5" />
      ))
    )}
    {/* ILI9341 Controller chip */}
    <rect x={w / 2 - 20} y={h - 30} width="40" height="20" rx="2" fill="#111" stroke="#3a3a3a" strokeWidth="1" />
    <text x={w / 2} y={h - 16} fill="#7ac4e8" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">ILI9341</text>
    {/* 240x320 spec */}
    <text x={w / 2} y="12" fill="rgba(120,200,255,0.5)" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">240×320</text>
  </g>
));

const BacklightDiffuser = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#backlight-gradient)" stroke="#8ca0aa" strokeWidth="1" />
    {/* LED strip indicators */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <circle key={i} cx="6" cy={20 + i * 28} r="3" fill="#fffbe6" stroke="#e8d44d" strokeWidth="0.8" opacity="0.7" />
    ))}
    {/* Light guide grooves */}
    {[1, 2, 3, 4, 5].map(i => (
      <line key={i} x1="16" y1={i * 38} x2={w - 8} y2={i * 38} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
    ))}
    <text x={w / 2} y={h / 2 + 3} fill="#556874" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle">DIFFUSER</text>
  </g>
));

const FpcRibbon = React.memo(({ w, h }) => (
  <g>
    {/* Flex cable body */}
    <rect x="0" y="10" width={w} height={h - 20} rx="2" fill="url(#fpc-gradient)" stroke="#c4a04e" strokeWidth="1" />
    {/* Conductor traces */}
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={6 + i * 6} y1="14" x2={6 + i * 6} y2={h - 14} stroke="#d4af37" strokeWidth="0.8" opacity="0.6" />
    ))}
    {/* ZIF connector end */}
    <rect x={w - 4} y="20" width="4" height={h - 40} rx="1" fill="#1a1c1e" stroke="#555" strokeWidth="0.5" />
    <text x={w / 2} y={h / 2 + 3} fill="#7a5c1a" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">40P FPC</text>
  </g>
));

const DriverPcb = React.memo(({ w, h }) => (
  <g>
    {/* Red soldermask FR4 board */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#driver-pcb-gradient)" stroke="#a82424" strokeWidth="2" />
    {/* 8-pin SPI header */}
    <rect x="12" y="12" width="20" height={8 * 12 + 4} rx="2" fill="#1a1c1e" stroke="#444" strokeWidth="1" />
    {['VCC', 'GND', 'CS', 'RST', 'DC', 'SDI', 'SCK', 'LED'].map((pin, i) => (
      <g key={pin}>
        <circle cx="22" cy={22 + i * 12} r="3.5" fill="#d4af37" stroke="#fff" strokeWidth="0.6" />
        <text x="38" y={25 + i * 12} fill="#f5e6e6" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="600">{pin}</text>
      </g>
    ))}
    {/* ILI9341 driver IC */}
    <rect x="80" y="30" width="60" height="40" rx="3" fill="#0a0a0a" stroke="#555" strokeWidth="1.2" />
    <text x="110" y="48" fill="#e87b7b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="800" textAnchor="middle">ILI9341</text>
    <text x="110" y="60" fill="#c0a0a0" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">DRIVER IC</text>
    {/* Decoupling caps */}
    {[0, 1, 2].map(i => (
      <rect key={i} x={80 + i * 22} y="80" width="14" height="8" rx="1" fill="#222" stroke="#444" strokeWidth="0.8" />
    ))}
    {/* FPC connector */}
    <rect x="70" y={h - 30} width="72" height="18" rx="2" fill="#1a1c1e" stroke="#666" strokeWidth="1" />
    <text x="106" y={h - 18} fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">ZIF 40P</text>
    {/* Board label */}
    <text x={w / 2} y={h - 6} fill="#6a2020" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">TFT-DRV-SPI-V2</text>
  </g>
));

// Map part IDs to their static drawing components
const PART_RENDERERS = {
  disp_bezel: FrontBezel,
  disp_tft: TftPanel,
  disp_backlight: BacklightDiffuser,
  disp_fpc: FpcRibbon,
  disp_pcb: DriverPcb,
};

// ——— MAIN COMPONENT ————————————————————————————————————————————
export default function DisplayExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM manipulation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // —— DIRECT DOM ANIMATION (runs outside React render) ——
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    DISPLAY_PARTS_CONFIG.forEach((part) => {
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

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="disp-marker-cyan" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#58d6ff" />
      </marker>
      <marker id="disp-marker-amber" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#ffb347" />
      </marker>
      <linearGradient id="tft-screen-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a2a3d" />
        <stop offset="40%" stopColor="#0d3854" />
        <stop offset="100%" stopColor="#061e2c" />
      </linearGradient>
      <linearGradient id="backlight-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e8edf2" />
        <stop offset="50%" stopColor="#f5f7fa" />
        <stop offset="100%" stopColor="#dde3ea" />
      </linearGradient>
      <linearGradient id="fpc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f5c842" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#c49510" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="driver-pcb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b1a1a" />
        <stop offset="50%" stopColor="#8c2828" />
        <stop offset="100%" stopColor="#4a1010" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div
      className="display-view-container"
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
                'linear-gradient(rgba(88, 214, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 214, 255, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(88,214,255,0.6)', borderLeft: '2px solid rgba(88,214,255,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(88,214,255,0.6)', borderRight: '2px solid rgba(88,214,255,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(88,214,255,0.6)', borderLeft: '2px solid rgba(88,214,255,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(88,214,255,0.6)', borderRight: '2px solid rgba(88,214,255,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {svgDefs}

          {/* Dynamic Laser Projection Lines — DOM-mutated */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {DISPLAY_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isRight = part.line.x1 === 'right';
              const color = isRight ? '#58d6ff' : '#ffb347';
              const marker = isRight ? 'url(#disp-marker-cyan)' : 'url(#disp-marker-amber)';
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

          {/* 5 Physical Discrete Display Parts — transforms mutated via ref */}
          {DISPLAY_PARTS_CONFIG.map((part) => {
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
                  filter: isHovered
                    ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)'
                    : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
                  transition: 'filter 0.15s ease-out'
                }}
              >
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#58d6ff"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
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
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#58d6ff' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart
                ? DISPLAY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ILI9341 TFT DISPLAY MODULE · 5 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart
                ? DISPLAY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ffb347', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart
              ? DISPLAY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
