import { useExplodedParts } from '../hooks/useHardwareFraming';
import { layoutExplodedParts } from '../lib/explodedLayout';
import React, { useState, useMemo, useRef } from 'react';

// Physical coordinates in 1024 x 1536 artboard:
// PCB: X: 215, Y: 445, W: 605, H: 740
// Center X = 517.5
// All parts now explode along HORIZONTAL projection axes:
// West / Left: RF Module, Left Header, Left Standoff, EN Button
// Center: Main System PCB
// East / Right: Boot Button, USB Bracket, Micro-USB Connector, Right Standoff, Right Header
const HORIZONTAL_PARTS_CONFIG = layoutExplodedParts([
  {
    id: 'pcb',
    name: 'MAIN SYSTEM PCB',
    code: 'ESP32-CORE-PCB',
    spec: '4-layer FR-4 gold immersion substrate with 3.3V LDO regulator and CP2102 USB bridge',
    role: 'PRIMARY CIRCUIT BACKBONE',
    file: '/components/esp32-parts/main-pcb.png',
    w: 605,
    h: 740,
    assembled: { x: 215, y: 445 },
    exploded: { x: 215, y: 445 },
    start: 0,
    end: 0,
    step: 0
  },
  {
    id: 'rf_module',
    name: 'ESP32-WROOM-32D RF MODULE',
    code: 'ESP32-WROOM-32D',
    spec: 'Dual-core Xtensa 32-bit LX6 @ 240 MHz, integrated 2.4 GHz Wi-Fi 802.11b/g/n & BLE 4.2',
    role: 'COMPUTE & WIRELESS ENGINE',
    file: '/components/esp32-parts/esp32-rf-module.png',
    w: 330,
    h: 415,
    assembled: { x: 350, y: 470 },
    exploded: { x: 110, y: 460 },
    start: 0.04,
    end: 0.35,
    step: 1,
    line: { x1: 'right', y1: 580, x2: 350, y2: 580 }
  },
  {
    id: 'header_left',
    name: 'LEFT PIN HEADER (19-PIN)',
    code: 'HDR-19P-2.54MM-L',
    spec: '19-position 2.54mm pitch through-hole male header (3V3, EN, GPIO36-GPIO19)',
    role: 'PERIPHERAL & POWER INTERFACE',
    file: '/components/esp32-parts/header-left.png',
    w: 80,
    h: 265,
    assembled: { x: 215, y: 670 },
    exploded: { x: 40, y: 670 },
    start: 0.16,
    end: 0.50,
    step: 2,
    line: { x1: 'right', y1: 760, x2: 215, y2: 760 }
  },
  {
    id: 'header_right',
    name: 'RIGHT PIN HEADER (19-PIN)',
    code: 'HDR-19P-2.54MM-R',
    spec: '19-position 2.54mm pitch through-hole male header (GND, 5V, GPIO21-GPIO23)',
    role: 'DIGITAL I/O & BUS INTERFACE',
    file: '/components/esp32-parts/header-right.png',
    w: 80,
    h: 265,
    assembled: { x: 740, y: 670 },
    exploded: { x: 910, y: 670 },
    start: 0.16,
    end: 0.50,
    step: 2,
    line: { x1: 740, y1: 760, x2: 'left', y2: 760 }
  },
  {
    id: 'button_en',
    name: 'EN (RESET) TACTILE SWITCH',
    code: 'SW-TACT-SMD-EN',
    spec: 'Micro momentary tactile push-button with 100nF debounce RC timing filter',
    role: 'HARDWARE RESET CONTROL',
    file: '/components/esp32-parts/button-en.png',
    w: 68,
    h: 68,
    assembled: { x: 318, y: 1115 },
    exploded: { x: 140, y: 1115 },
    start: 0.35,
    end: 0.68,
    step: 3,
    line: { x1: 'right', y1: 1149, x2: 318, y2: 1149 }
  },
  {
    id: 'button_boot',
    name: 'BOOT (GPIO0) TACTILE SWITCH',
    code: 'SW-TACT-SMD-BOOT',
    spec: 'Micro tactile switch pulling GPIO0 low for ESP32 ROM bootloader flash mode',
    role: 'BOOTLOADER STRAPPING PIN',
    file: '/components/esp32-parts/button-boot.png',
    w: 68,
    h: 68,
    assembled: { x: 660, y: 1115 },
    exploded: { x: 815, y: 1115 },
    start: 0.35,
    end: 0.68,
    step: 3,
    line: { x1: 660, y1: 1149, x2: 'left', y2: 1149 }
  },
  {
    id: 'usb_bracket',
    name: 'USB REINFORCEMENT SHIELD',
    code: 'USB-SHLD-BRKT',
    spec: 'Cold-rolled steel retention bracket for port strain relief and chassis ground',
    role: 'MECHANICAL RETENTION',
    file: '/components/esp32-parts/usb-bracket.png',
    w: 135,
    h: 95,
    assembled: { x: 440, y: 1140 },
    exploded: { x: 570, y: 1220 },
    start: 0.50,
    end: 0.78,
    step: 4,
    line: { x1: 507, y1: 1140, x2: 'left', y2: 1220 }
  },
  {
    id: 'usb_connector',
    name: 'MICRO-USB TYPE-B CONNECTOR',
    code: 'CONN-USB-MICRO-B',
    spec: '5-pin SMT micro-USB 2.0 receptacle with 5V VBUS rail and CP2102 D+/D- lines',
    role: 'POWER & PROGRAMMING PORT',
    file: '/components/esp32-parts/usb-connector.png',
    w: 165,
    h: 180,
    assembled: { x: 425, y: 1145 },
    exploded: { x: 675, y: 1290 },
    start: 0.55,
    end: 0.84,
    step: 4,
    line: { x1: 507, y1: 1145, x2: 'left', y2: 1290 }
  },
  {
    id: 'spacer_left',
    name: 'LEFT M2.5 MOUNTING STANDOFF',
    code: 'MECH-STANDOFF-M2.5-L',
    spec: 'Brass hexagonal threaded standoff for mechanical PCB vibration dampening',
    role: 'CHASSIS ISOLATION',
    file: '/components/esp32-parts/spacer-left.png',
    w: 48,
    h: 48,
    assembled: { x: 225, y: 1140 },
    exploded: { x: 60, y: 1140 },
    start: 0.68,
    end: 0.94,
    step: 5,
    line: { x1: 'right', y1: 1164, x2: 225, y2: 1164 }
  },
  {
    id: 'spacer_right',
    name: 'RIGHT M2.5 MOUNTING STANDOFF',
    code: 'MECH-STANDOFF-M2.5-R',
    spec: 'Brass hexagonal threaded standoff for mechanical PCB vibration dampening',
    role: 'CHASSIS ISOLATION',
    file: '/components/esp32-parts/spacer-right.png',
    w: 48,
    h: 48,
    assembled: { x: 750, y: 1140 },
    exploded: { x: 915, y: 1140 },
    start: 0.68,
    end: 0.94,
    step: 5,
    line: { x1: 750, y1: 1164, x2: 'left', y2: 1164 }
  }
]);


export default function Esp32ExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  const progress = Math.max(0, Math.min(1, scrollProgress));
  const partGroupRefs=useRef({}),lineGroupRefs=useRef({}),linesContainerRef=useRef(null);
  useExplodedParts(HORIZONTAL_PARTS_CONFIG,progress,partGroupRefs,lineGroupRefs,linesContainerRef);

  return useMemo(() => (
    <div
      className="esp32-horizontal-view-container"
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

        {/* SVG Artboard: 1024 x 1536 */}
        <svg
          viewBox="0 0 1024 1536"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.6))'
          }}
        >
          <defs>
            <marker id="esp32-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="esp32-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>
          </defs>

          {/* Dynamic Horizontal Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {[...HORIZONTAL_PARTS_CONFIG].reverse().map((part) => {
              if (!part.line) return null;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = part.assembled.x + part.w;
              if (x1 === 'left') x1 = part.assembled.x;
              if (x2 === 'right') x2 = part.assembled.x + part.w;
              if (x2 === 'left') x2 = part.assembled.x;

              const isOrange = part.id.includes('usb') || part.id.includes('button');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#esp32-marker-orange)' : 'url(#esp32-marker-lime)';

              return (
                <g ref={el=>{lineGroupRefs.current[part.id]=el;}} opacity="0" key={`line-${part.id}`} data-wire-id={part.id}>
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

          {/* 10 Physical Parts moving horizontally */}
          {[...HORIZONTAL_PARTS_CONFIG].reverse().map((part) => {
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id} data-part-id={part.id}
                ref={el=>{partGroupRefs.current[part.id]=el;}} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform' }}
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
                {/* Authentic Part PNG */}
                <image
                  href={part.file}
                  x={0}
                  y={0}
                  width={part.w}
                  height={part.h}
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    filter: isHovered
                      ? 'brightness(1.2) drop-shadow(0 0 14px rgba(201,232,123,0.7))'
                      : 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
                    transition: 'filter 0.2s'
                  }}
                />
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
                ? HORIZONTAL_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ESP32 HARDWARE DECOMPOSITION · 10 PHYSICAL PARTS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? HORIZONTAL_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
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
              ? HORIZONTAL_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '10 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  ), [hoveredPart]);
}
