import React, { useState } from 'react';

const COMPONENT_CUTOUT_MAP = {
  esp32: {
    prefix: 'esp32',
    cutout: '/components/cutouts/esp32.png',
    slices: [
      '/components/slices/esp32-left.png',
      '/components/slices/esp32-center.png',
      '/components/slices/esp32-right.png'
    ],
    baseW: 220,
    baseH: 420,
    maxDisplacement: 155
  },
  microsd: {
    prefix: 'microsd',
    cutout: '/components/cutouts/microsd.png',
    slices: [
      '/components/slices/microsd-left.png',
      '/components/slices/microsd-center.png',
      '/components/slices/microsd-right.png'
    ],
    baseW: 340,
    baseH: 248,
    maxDisplacement: 150
  },
  regulator: {
    prefix: 'voltage-regulator',
    cutout: '/components/cutouts/voltage-regulator.png',
    slices: [
      '/components/slices/voltage-regulator-left.png',
      '/components/slices/voltage-regulator-center.png',
      '/components/slices/voltage-regulator-right.png'
    ],
    baseW: 320,
    baseH: 312,
    maxDisplacement: 160
  },
  thermistor: {
    prefix: 'thermistor',
    cutout: '/components/cutouts/thermistor.png',
    slices: [
      '/components/slices/thermistor-left.png',
      '/components/slices/thermistor-center.png',
      '/components/slices/thermistor-right.png'
    ],
    baseW: 210,
    baseH: 345,
    maxDisplacement: 145
  },
  'battery-sensor': {
    prefix: 'battery-voltage-sensor',
    cutout: '/components/cutouts/battery-voltage-sensor.png',
    slices: [
      '/components/slices/battery-voltage-sensor-left.png',
      '/components/slices/battery-voltage-sensor-center.png',
      '/components/slices/battery-voltage-sensor-right.png'
    ],
    baseW: 350,
    baseH: 305,
    maxDisplacement: 160
  },
  'rf-sensor': {
    prefix: 'rf-sensor',
    cutout: '/components/cutouts/rf-sensor.png',
    slices: [
      '/components/slices/rf-sensor-left.png',
      '/components/slices/rf-sensor-center.png',
      '/components/slices/rf-sensor-right.png'
    ],
    baseW: 330,
    baseH: 297,
    maxDisplacement: 155
  },
  battery: {
    prefix: 'battery-pack',
    cutout: '/components/cutouts/battery-pack.png',
    slices: [
      '/components/slices/battery-pack-left.png',
      '/components/slices/battery-pack-center.png',
      '/components/slices/battery-pack-right.png'
    ],
    baseW: 340,
    baseH: 305,
    maxDisplacement: 165
  },
  mosfet: {
    prefix: 'mosfet',
    cutout: '/components/cutouts/mosfet.png',
    slices: [
      '/components/slices/mosfet-left.png',
      '/components/slices/mosfet-center.png',
      '/components/slices/mosfet-right.png'
    ],
    baseW: 330,
    baseH: 275,
    maxDisplacement: 150
  },
  'temp-sensor': {
    prefix: 'temperature-sensor',
    cutout: '/components/cutouts/temperature-sensor.png',
    slices: [
      '/components/slices/temperature-sensor-left.png',
      '/components/slices/temperature-sensor-center.png',
      '/components/slices/temperature-sensor-right.png'
    ],
    baseW: 280,
    baseH: 337,
    maxDisplacement: 150
  },
  converter: {
    prefix: 'dc-dc-converter',
    cutout: '/components/cutouts/dc-dc-converter.png',
    slices: [
      '/components/slices/dc-dc-converter-left.png',
      '/components/slices/dc-dc-converter-center.png',
      '/components/slices/dc-dc-converter-right.png'
    ],
    baseW: 350,
    baseH: 284,
    maxDisplacement: 165
  },
  'heat-pipe': {
    prefix: 'heat-pipe',
    cutout: '/components/cutouts/heat-pipe.png',
    slices: [
      '/components/slices/heat-pipe-left.png',
      '/components/slices/heat-pipe-center.png',
      '/components/slices/heat-pipe-right.png'
    ],
    baseW: 390,
    baseH: 205,
    maxDisplacement: 170
  },
  radiator: {
    prefix: 'radiator',
    cutout: '/components/cutouts/radiator.png',
    slices: [
      '/components/slices/radiator-left.png',
      '/components/slices/radiator-center.png',
      '/components/slices/radiator-right.png'
    ],
    baseW: 340,
    baseH: 300,
    maxDisplacement: 160
  },
  structure: {
    prefix: 'aluminium-structure',
    cutout: '/components/cutouts/aluminium-structure.png',
    slices: [
      '/components/slices/aluminium-structure-left.png',
      '/components/slices/aluminium-structure-center.png',
      '/components/slices/aluminium-structure-right.png'
    ],
    baseW: 380,
    baseH: 295,
    maxDisplacement: 175
  },
  lora: {
    prefix: 'lora-module',
    cutout: '/components/cutouts/lora-module.png',
    slices: [
      '/components/slices/lora-module-left.png',
      '/components/slices/lora-module-center.png',
      '/components/slices/lora-module-right.png'
    ],
    baseW: 320,
    baseH: 331,
    maxDisplacement: 155
  },
  antenna: {
    prefix: 'antenna',
    cutout: '/components/cutouts/antenna.png',
    slices: [
      '/components/slices/antenna-left.png',
      '/components/slices/antenna-center.png',
      '/components/slices/antenna-right.png'
    ],
    baseW: 220,
    baseH: 356,
    maxDisplacement: 150
  }
};

export default function HorizontalExplodedView({ scene, scrollProgress = 0, isSceneActive = false }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const config = COMPONENT_CUTOUT_MAP[scene.id] || {
    prefix: 'microsd',
    cutout: scene.image || '/components/cutouts/microsd.png',
    slices: [
      '/components/slices/microsd-left.png',
      '/components/slices/microsd-center.png',
      '/components/slices/microsd-right.png'
    ],
    baseW: 320,
    baseH: 280,
    maxDisplacement: 150
  };

  // Clamp & smooth scroll progress (0.0 to 1.0)
  const p = Math.max(0, Math.min(1, scrollProgress));
  // Smooth ease-out cubic interpolation for natural hardware explosion
  const easedP = 1 - Math.pow(1 - p, 2.5);

  const displacement = config.maxDisplacement * easedP;
  const isExploded = p >= 0.12;
  const isFullyExploded = p >= 0.85;

  const isRf = scene.effect === 'rf';
  const isPower = scene.effect === 'power';
  const isHeat = scene.effect === 'heat';

  const layers = scene.layers && scene.layers.length >= 3
    ? scene.layers
    : ['INTERFACE STAGE', 'CORE ASSEMBLY', 'TERMINAL LEADS'];

  // Slice metadata for hover inspection
  const sliceMeta = [
    {
      idx: 0,
      title: layers[0],
      axis: 'WEST (LEFT) HORIZONTAL PROJECTION',
      role: 'EXTERNAL INTERFACE & INGRESS SURFACE',
      desc: 'Outer physical boundary and primary routing contacts'
    },
    {
      idx: 1,
      title: layers[1],
      axis: 'CENTRAL (CORE) ASSEMBLY NUCLEUS',
      role: 'CORE FUNCTIONAL & SUBSTRATE LOGIC',
      desc: 'Central processing matrix, primary die, and substrate bus'
    },
    {
      idx: 2,
      title: layers[2],
      axis: 'EAST (RIGHT) HORIZONTAL PROJECTION',
      role: 'POWER RAIL & TERMINAL INTERFACE',
      desc: 'Ground connection, decoupling capacitors, and trace egress'
    }
  ];

  const activeMeta = hoveredSlice !== null ? sliceMeta[hoveredSlice] : null;

  return (
    <div
      className="horizontal-inspection-object"
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
          overflow: 'visible',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid & Center Crosshairs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '8px' }}>
          {/* Subtle grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          {/* Axis markers */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Corner Framing Reticles */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* Ambient Effects */}
        {isRf && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <i className="wave wave-one" />
            <i className="wave wave-two" />
          </div>
        )}
        {isPower && (
          <div className="energy-flow" style={{ pointerEvents: 'none' }}>
            <Zap size={14} />
            <i />
            <Zap size={14} />
          </div>
        )}
        {isHeat && (
          <div className="heat-flow" style={{ pointerEvents: 'none' }}>
            <i />
            <i />
            <i />
          </div>
        )}

        {/* SVG Laser Projection Alignment Lines along Horizontal Axis */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          <defs>
            <marker id={`pip-lime-${scene.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id={`pip-orange-${scene.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>
          </defs>

          {/* Dynamic Laser Guide Lines (Visible when separating) */}
          <g opacity={p > 0.04 ? Math.min(1, (p - 0.04) * 3) : 0} style={{ transition: 'opacity 0.2s' }}>
            {/* Left projection track */}
            <line
              x1={`calc(50% - ${config.baseW * 0.28 + displacement}px)`}
              y1="50%"
              x2="calc(50% - 15px)"
              y2="50%"
              stroke="#c9e87b"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              strokeOpacity="0.75"
              markerStart={`url(#pip-lime-${scene.id})`}
              markerEnd={`url(#pip-lime-${scene.id})`}
            />

            {/* Right projection track */}
            <line
              x1="calc(50% + 15px)"
              y1="50%"
              x2={`calc(50% + ${config.baseW * 0.28 + displacement}px)`}
              y2="50%"
              stroke="#ff8158"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              strokeOpacity="0.75"
              markerStart={`url(#pip-orange-${scene.id})`}
              markerEnd={`url(#pip-orange-${scene.id})`}
            />
          </g>
        </svg>

        {/* Horizontal Moving Pictures Assembly Container */}
        <div
          style={{
            position: 'relative',
            width: `${config.baseW}px`,
            height: `${config.baseH}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4
          }}
        >
          {/* SLICE 1 (LEFT MOVING PICTURE) */}
          <div
            onMouseEnter={() => setHoveredSlice(0)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${config.baseW * 0.38}px`,
              height: '100%',
              transform: `translateX(-${displacement}px)`,
              transition: 'transform 0.08s linear, filter 0.2s',
              cursor: 'pointer',
              zIndex: hoveredSlice === 0 ? 10 : 6
            }}
          >
            <img
              src={config.slices[0]}
              alt={`${scene.title} - Left Layer`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  hoveredSlice === 0
                    ? 'drop-shadow(0 0 15px rgba(201, 232, 123, 0.8)) brightness(1.2)'
                    : isExploded
                    ? 'drop-shadow(-8px 12px 16px rgba(0, 0, 0, 0.6))'
                    : 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* Hover Accent Frame */}
            {hoveredSlice === 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '1px dashed #c9e87b',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Floating Layer Callout Badge (Left) */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                opacity: p > 0.08 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(12, 16, 16, 0.94)',
                  border: '1px solid #c9e87b',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  font: '700 8px "DM Mono", monospace',
                  color: '#c9e87b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}
              >
                <span>â—</span>
                <span>01 · {layers[0]}</span>
              </div>
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: '#c9e87b',
                  margin: '0 auto'
                }}
              />
            </div>
          </div>

          {/* SLICE 2 (CENTER MOVING PICTURE / CORE ANCHOR) */}
          <div
            onMouseEnter={() => setHoveredSlice(1)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              position: 'absolute',
              left: `${config.baseW * 0.31}px`,
              top: 0,
              width: `${config.baseW * 0.38}px`,
              height: '100%',
              transform: `scale(${1 + 0.04 * easedP})`,
              transition: 'transform 0.08s linear, filter 0.2s',
              cursor: 'pointer',
              zIndex: hoveredSlice === 1 ? 10 : 5
            }}
          >
            <img
              src={config.slices[1]}
              alt={`${scene.title} - Center Core`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  hoveredSlice === 1
                    ? 'drop-shadow(0 0 16px rgba(201, 232, 123, 0.9)) brightness(1.2)'
                    : isExploded
                    ? 'drop-shadow(0 14px 18px rgba(0, 0, 0, 0.7))'
                    : 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* Hover Accent Frame */}
            {hoveredSlice === 1 && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '1px dashed #c9e87b',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Floating Layer Callout Badge (Center) */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                opacity: p > 0.08 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: '#c9e87b',
                  margin: '0 auto'
                }}
              />
              <div
                style={{
                  background: 'rgba(12, 16, 16, 0.94)',
                  border: '1px solid #c9e87b',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  font: '700 8px "DM Mono", monospace',
                  color: '#ecf0ea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}
              >
                <span style={{ color: '#c9e87b' }}>â—</span>
                <span>02 · {layers[1]} (CORE)</span>
              </div>
            </div>
          </div>

          {/* SLICE 3 (RIGHT MOVING PICTURE) */}
          <div
            onMouseEnter={() => setHoveredSlice(2)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              position: 'absolute',
              left: `${config.baseW * 0.62}px`,
              top: 0,
              width: `${config.baseW * 0.38}px`,
              height: '100%',
              transform: `translateX(${displacement}px)`,
              transition: 'transform 0.08s linear, filter 0.2s',
              cursor: 'pointer',
              zIndex: hoveredSlice === 2 ? 10 : 4
            }}
          >
            <img
              src={config.slices[2]}
              alt={`${scene.title} - Right Layer`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  hoveredSlice === 2
                    ? 'drop-shadow(0 0 15px rgba(255, 129, 88, 0.8)) brightness(1.2)'
                    : isExploded
                    ? 'drop-shadow(8px 12px 16px rgba(0, 0, 0, 0.6))'
                    : 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* Hover Accent Frame */}
            {hoveredSlice === 2 && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '1px dashed #ff8158',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Floating Layer Callout Badge (Right) */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                opacity: p > 0.08 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(12, 16, 16, 0.94)',
                  border: '1px solid #ff8158',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  font: '700 8px "DM Mono", monospace',
                  color: '#ff8158',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}
              >
                <span>â—</span>
                <span>03 · {layers[2]}</span>
              </div>
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: '#ff8158',
                  margin: '0 auto'
                }}
              />
            </div>
          </div>
        </div>

        {/* Hover Inspection / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '14px',
            right: '14px',
            background: 'rgba(12, 16, 16, 0.92)',
            border: '1px solid rgba(222, 232, 224, 0.18)',
            padding: '7px 14px',
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
                font: '700 10px "DM Mono", monospace',
                color: activeMeta ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {activeMeta ? `LAYER 0${activeMeta.idx + 1}: ${activeMeta.title}` : `${scene.role}`}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8f9a91',
                marginTop: '2px'
              }}
            >
              {activeMeta ? activeMeta.desc : 'SCROLL TO SEPARATE COMPONENT INTO ITS PHYSICAL HORIZONTAL LAYERS'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222, 232, 224, 0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {activeMeta ? activeMeta.axis : '3 HORIZONTAL SECTORS'}
          </div>
        </div>
      </div>
    </div>
  );
}
