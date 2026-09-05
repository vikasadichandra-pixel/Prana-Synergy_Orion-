import React, { useState, useRef, useEffect, useCallback } from 'react';

// SanDisk Extreme PRO MicroSD card physical discrete parts
// Coordinates in 1200 x 650 artboard:
// Assembled center: X: 480, Y: 180, W: 240, h: 320
const MICROSD_PARTS_CONFIG = [
  {
    id: 'sd_faceplate',
    name: 'FRONT BRANDED FACEPLATE / TOP CASING',
    code: 'SD-CASING-TOP-EXTREME-PRO',
    spec: 'Red/black polymer laser-etched faceplate with UHS-I Class 10 U3 V30 A2 ratings',
    role: 'CHASSIS SEAL & LABELLING',
    w: 140,
    h: 195,
    assembled: { x: 530, y: 220 },
    exploded: { x: 50, y: 220 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 317, x2: 530, y2: 317 }
  },
  {
    id: 'sd_front_spacer',
    name: 'INTERNAL STRUCTURAL FRAME / SPACER',
    code: 'SD-SPACER-FRAME-ABS',
    spec: 'Injection-molded polycarbonate structural cavity spacer for internal silicon die protection',
    role: 'DIE ISOLATION & SHOCK BUFFER',
    w: 135,
    h: 195,
    assembled: { x: 530, y: 220 },
    exploded: { x: 215, y: 220 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 317, x2: 530, y2: 317 }
  },
  {
    id: 'sd_nand_die',
    name: '1TB 3D NAND FLASH MEMORY DIE',
    code: 'SANDISK-BICS5-3D-TLC',
    spec: '112-layer 3D TLC NAND flash memory multi-die stacked silicon BGA substrate package',
    role: 'HIGH-DENSITY MASS DATA STORE',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 375, y: 222 },
    start: 0.20,
    end: 0.65,
    step: 3,
    line: { x1: 'right', y1: 317, x2: 535, y2: 317 }
  },
  {
    id: 'sd_controller',
    name: 'FLASH MEMORY CONTROLLER ASIC',
    code: 'SANDISK-CTL-4CH-ECC',
    spec: 'Proprietary 4-channel RISC-V flash controller with LDPC error correction and wear leveling',
    role: 'STORAGE TRANSLATION & BUS I/O',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 535, y: 222 },
    start: 0,
    end: 0,
    step: 4
  },
  {
    id: 'sd_pcb_substrate',
    name: 'HIGH-DENSITY INTERCONNECT (HDI) PCB',
    code: 'SD-HDI-FR4-SUBSTRATE',
    spec: 'Micro-via multi-layer green circuit substrate with precision gold test points and interconnect vias',
    role: 'SIGNAL ROUTING & POWER RAIL',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 695, y: 222 },
    start: 0.20,
    end: 0.65,
    step: 5,
    line: { x1: 535, y1: 317, x2: 'left', y2: 317 }
  },
  {
    id: 'sd_contact_pins',
    name: '8-PIN GOLD CONTACT INTERFACE ARRAY',
    code: 'CONN-SD-8P-AU-FINGERS',
    spec: '30Î¼m hard gold-plated 8-pin UHS-I bus interface fingers (DAT0-DAT3, CLK, CMD, VDD, VSS)',
    role: 'HIGH-SPEED PHYSICAL HOST BUS',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 855, y: 222 },
    start: 0.12,
    end: 0.55,
    step: 6,
    line: { x1: 535, y1: 317, x2: 'left', y2: 317 }
  },
  {
    id: 'sd_rear_shell',
    name: 'REAR PROTECTIVE ENCLOSURE BACKPLATE',
    code: 'SD-HOUSING-BACK-MOLD',
    spec: 'High-impact molded black plastic rear casing with retention extraction ridge and side rails',
    role: 'STRUCTURAL BASE & CONTACT RESTRAINT',
    w: 135,
    h: 195,
    assembled: { x: 530, y: 220 },
    exploded: { x: 1015, y: 220 },
    start: 0.05,
    end: 0.45,
    step: 7,
    line: { x1: 530, y1: 317, x2: 'left', y2: 317 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function MicroSdExplodedView({ scrollProgress = 0, isSceneActive = false }) {
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

    MICROSD_PARTS_CONFIG.forEach((part) => {
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

  const isExploded = progress >= 0.06;

  // MicroSD silhouette path helper
  // Normal MicroSD shape: 130 wide x 190 tall with bottom-right bevel/notch and top rounded corners
  const sdOuterPath = (w, h) =>
    `M 8,0 L ${w - 8},0 Q ${w},0 ${w},8 L ${w},${h - 42} L ${w - 14},${h - 24} L ${w - 14},${h - 8} Q ${w - 14},${h} ${w - 22},${h} L 18,${h} Q 0,${h} 0,${h - 18} L 0,8 Q 0,0 8,0 Z`;

  return (
    <div
      className="microsd-horizontal-view-container"
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

        {/* SVG Artboard: 1200 x 650 */}
        <svg
          viewBox="0 0 1200 650"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="sd-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="sd-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            {/* MicroSD Gradients */}
            <linearGradient id="sd-red-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e52628" />
              <stop offset="100%" stopColor="#aa1416" />
            </linearGradient>

            <linearGradient id="sd-black-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#25272a" />
              <stop offset="50%" stopColor="#181a1c" />
              <stop offset="100%" stopColor="#0f1112" />
            </linearGradient>

            <linearGradient id="sd-gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fae68b" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#aa8214" />
            </linearGradient>

            <linearGradient id="sd-pcb-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5831" />
              <stop offset="100%" stopColor="#11361c" />
            </linearGradient>

            <linearGradient id="sd-silicon-die" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e3338" />
              <stop offset="40%" stopColor="#1e2225" />
              <stop offset="100%" stopColor="#131618" />
            </linearGradient>

            {/* Drop Shadow for components */}
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {MICROSD_PARTS_CONFIG.map((part) => {
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

              const isOrange = part.id.includes('nand') || part.id.includes('contact');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#sd-marker-orange)' : 'url(#sd-marker-lime)';

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

          {/* 7 Physical Discrete MicroSD Parts */}
          {MICROSD_PARTS_CONFIG.map((part) => {
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

                {/* Graphical Render for each discrete part */}
                <g>
                  {/* PART 1: FRONT FACEPLATE */}
                  {part.id === 'sd_faceplate' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="url(#sd-black-gradient)" stroke="#383b40" strokeWidth="1.5" />
                      {/* Top Red Header Band */}
                      <path
                        d={`M 8,0 L ${part.w - 8},0 Q ${part.w},0 ${part.w},8 L ${part.w},74 L 0,74 L 0,8 Q 0,0 8,0 Z`}
                        fill="url(#sd-red-gradient)"
                      />
                      {/* SanDisk text */}
                      <text x={part.w / 2} y="34" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontWeight="800" fontSize="18" textAnchor="middle" letterSpacing="0.4">
                        SanDisk
                      </text>
                      <text x={part.w / 2} y="54" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="13" fontStyle="italic" textAnchor="middle">
                        Extreme PRO
                      </text>
                      {/* Gold capacity & rating */}
                      <text x="24" y="108" fill="url(#sd-gold-foil)" fontFamily="'DM Mono', monospace" fontWeight="900" fontSize="28">
                        1TB
                      </text>
                      <text x="24" y="132" fill="url(#sd-gold-foil)" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="12">
                        microSD XC I
                      </text>
                      <text x="24" y="152" fill="url(#sd-gold-foil)" fontFamily="'DM Mono', monospace" fontWeight="700" fontSize="11">
                        [3] A2 Â· V30
                      </text>
                      {/* Grip notch */}
                      <path d={`M ${part.w / 2 - 12},${part.h - 14} L ${part.w / 2 + 12},${part.h - 14} L ${part.w / 2},${part.h - 4} Z`} fill="#2d3035" />
                    </g>
                  )}

                  {/* PART 2: INNER PLASTIC FRAME */}
                  {part.id === 'sd_front_spacer' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="#16181a" stroke="#33373b" strokeWidth="1.5" />
                      {/* Internal Hollow Cavity for Die */}
                      <rect x="14" y="18" width={part.w - 28} height={part.h - 40} rx="4" fill="#0c0d0e" stroke="#25282c" strokeWidth="1.2" />
                      <line x1="20" y1="36" x2={part.w - 20} y2="36" stroke="#222529" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="130" x2={part.w - 20} y2="130" stroke="#222529" strokeWidth="1" strokeDasharray="3 3" />
                      <text x={part.w / 2} y="95" fill="#444b52" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">
                        CHASSIS CAVITY
                      </text>
                    </g>
                  )}

                  {/* PART 3: 3D NAND FLASH DIE */}
                  {part.id === 'sd_nand_die' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="url(#sd-silicon-die)" stroke="#8e5d2d" strokeWidth="2.5" />
                      <rect x="4" y="4" width={part.w - 8} height={part.h - 8} rx="2" fill="none" stroke="#3e454d" strokeWidth="1" />
                      {/* Laser-etched branding */}
                      <text x={part.w / 2} y="70" fill="#ced4da" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="16" textAnchor="middle" letterSpacing="0.8">
                        SanDisk
                      </text>
                      <text x={part.w / 2} y="96" fill="#9ba5af" fontFamily="'DM Mono', monospace" fontWeight="600" fontSize="11" textAnchor="middle">
                        NAND Flash
                      </text>
                      <text x={part.w / 2} y="114" fill="#9ba5af" fontFamily="'DM Mono', monospace" fontWeight="600" fontSize="11" textAnchor="middle">
                        Memory
                      </text>
                      <text x={part.w / 2} y="148" fill="#6c757d" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">
                        112L BiCS5 3D TLC
                      </text>
                    </g>
                  )}

                  {/* PART 4: CONTROLLER ASIC */}
                  {part.id === 'sd_controller' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#sd-pcb-green)" stroke="#2b6b3e" strokeWidth="1.5" />
                      {/* Controller IC Chip in center */}
                      <rect x="22" y="38" width={part.w - 44} height="95" rx="3" fill="#14171a" stroke="#40464d" strokeWidth="1.8" />
                      <text x={part.w / 2} y="78" fill="#ced4da" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="13" textAnchor="middle">
                        SanDisk
                      </text>
                      <text x={part.w / 2} y="100" fill="#9ba5af" fontFamily="'DM Mono', monospace" fontWeight="600" fontSize="10" textAnchor="middle">
                        Controller
                      </text>
                      {/* Surrounding SMD Ceramic Capacitors */}
                      <rect x="8" y="42" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x="8" y="65" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x="8" y="88" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x={part.w - 16} y="45" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x={part.w - 16} y="72" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x={part.w - 16} y="98" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      {/* Bottom test via array */}
                      <circle cx="35" cy="155" r="3" fill="#e6c875" />
                      <circle cx="55" cy="155" r="3" fill="#e6c875" />
                      <circle cx="75" cy="155" r="3" fill="#e6c875" />
                      <circle cx="95" cy="155" r="3" fill="#e6c875" />
                    </g>
                  )}

                  {/* PART 5: HDI PCB SUBSTRATE */}
                  {part.id === 'sd_pcb_substrate' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="url(#sd-pcb-green)" stroke="#2b6b3e" strokeWidth="1.5" />
                      {/* Gold test pads grid */}
                      <rect x="22" y="24" width="14" height="14" fill="#d4af37" rx="1" />
                      <rect x="46" y="24" width="14" height="14" fill="#d4af37" rx="1" />
                      <rect x="70" y="24" width="14" height="14" fill="#d4af37" rx="1" />
                      <rect x="94" y="24" width="18" height="18" fill="#d4af37" rx="1" />
                      <rect x="22" y="58" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="48" y="70" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="74" y="58" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="94" y="80" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="22" y="112" width="14" height="10" fill="#d4af37" rx="1" />
                      <rect x="52" y="114" width="14" height="10" fill="#d4af37" rx="1" />
                      <rect x="80" y="114" width="14" height="10" fill="#d4af37" rx="1" />
                      {/* Fine copper routing traces */}
                      <line x1="29" y1="38" x2="29" y2="58" stroke="#e6c875" strokeWidth="1" />
                      <line x1="76" y1="38" x2="54" y2="70" stroke="#e6c875" strokeWidth="1" />
                      <line x1="100" y1="42" x2="100" y2="80" stroke="#e6c875" strokeWidth="1" />
                    </g>
                  )}

                  {/* PART 6: GOLD CONTACT PINS */}
                  {part.id === 'sd_contact_pins' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="#1a1c1e" stroke="#333" strokeWidth="1.5" />
                      {/* 8 Gold-plated contact fingers along left edge */}
                      {[
                        { num: 1, name: 'DAT2', y: 16 },
                        { num: 2, name: 'CD/DAT3', y: 36 },
                        { num: 3, name: 'CMD', y: 56 },
                        { num: 4, name: 'VDD', y: 76 },
                        { num: 5, name: 'CLK', y: 96 },
                        { num: 6, name: 'VSS', y: 116 },
                        { num: 7, name: 'DAT0', y: 136 },
                        { num: 8, name: 'DAT1', y: 156 }
                      ].map((pin) => (
                        <g key={pin.num}>
                          <rect x="10" y={pin.y} width="38" height="15" rx="1.5" fill="url(#sd-gold-foil)" stroke="#fff" strokeWidth="0.4" />
                          <line x1="10" y1={pin.y + 4} x2="48" y2={pin.y + 4} stroke="#fae68b" strokeWidth="0.8" opacity="0.6" />
                        </g>
                      ))}
                      {/* Molded back structural ribs */}
                      <rect x="56" y="20" width={part.w - 68} height={part.h - 40} rx="2" fill="#121415" stroke="#2a2d30" />
                    </g>
                  )}

                  {/* PART 7: REAR PLASTIC CASING */}
                  {part.id === 'sd_rear_shell' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="url(#sd-black-gradient)" stroke="#383b40" strokeWidth="1.5" />
                      {/* Molded structural retention frame */}
                      <path
                        d={`M 12,12 L ${part.w - 12},12 L ${part.w - 12},${part.h - 12} L 12,${part.h - 12} Z`}
                        fill="none"
                        stroke="#25282c"
                        strokeWidth="2"
                      />
                      {/* Lateral guide rails */}
                      <rect x="6" y="24" width="4" height={part.h - 48} fill="#2f3338" />
                      <rect x={part.w - 10} y="24" width="4" height={part.h - 60} fill="#2f3338" />
                      <text x={part.w / 2} y={part.h / 2} fill="#353b42" fontFamily="'DM Mono', monospace" fontSize="9" textAnchor="middle">
                        REAR CASING
                      </text>
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
                ? MICROSD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'MICROSD HARDWARE DECOMPOSITION Â· 7 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? MICROSD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? MICROSD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '7 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}
