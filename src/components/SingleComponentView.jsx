import React from 'react';
import { Zap, Radio, Thermometer, ShieldAlert, Cpu } from 'lucide-react';
import CutoutImage from '../CutoutImage';

export default function SingleComponentView({ scene }) {
  const isRf = scene.effect === 'rf';
  const isPower = scene.effect === 'power';
  const isHeat = scene.effect === 'heat';

  return (
    <div className="single-inspection-object" style={{ position: 'relative', width: '100%', maxWidth: '580px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* HUD Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', background: 'rgba(16, 20, 20, 0.85)', border: '1px solid rgba(222, 232, 224, 0.15)', borderRadius: '4px', marginBottom: '14px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: '600 10px "DM Mono", monospace', color: '#c9e87b' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#c9e87b', boxShadow: '0 0 6px #c9e87b' }} />
          AUTHENTIC HARDWARE INSPECTION · 1 PHYSICAL UNIT
        </div>
        <div style={{ font: '500 9px "DM Mono", monospace', color: '#a0aaa2' }}>
          ID: {scene.index} // {scene.category}
        </div>
      </div>

      {/* Main Inspection Frame */}
      <div style={{ position: 'relative', width: '100%', minHeight: '360px', maxHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.12)', background: 'radial-gradient(ellipse at center, rgba(201,232,123,0.03) 0%, rgba(10,13,13,0.8) 75%)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Engineering Crosshairs & Reticle */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.08)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.08)' }} />
          {/* Corner brackets */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '14px', height: '14px', borderTop: '2px solid #c9e87b', borderLeft: '2px solid #c9e87b' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '14px', height: '14px', borderTop: '2px solid #c9e87b', borderRight: '2px solid #c9e87b' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '14px', height: '14px', borderBottom: '2px solid #c9e87b', borderLeft: '2px solid #c9e87b' }} />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '14px', height: '14px', borderBottom: '2px solid #c9e87b', borderRight: '2px solid #c9e87b' }} />
        </div>

        {/* Ambient Engineering Effects */}
        {isRf && (
          <>
            <i className="wave wave-one" />
            <i className="wave wave-two" />
          </>
        )}
        {isPower && (
          <div className="energy-flow">
            <Zap size={15} />
            <i />
            <Zap size={15} />
          </div>
        )}
        {isHeat && (
          <div className="heat-flow">
            <i />
            <i />
            <i />
          </div>
        )}

        {/* ONE SINGLE AUTHENTIC COMPONENT IMAGE */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '340px', maxHeight: '340px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={scene.image}
            alt={scene.title}
            style={{
              maxWidth: '100%',
              maxHeight: '320px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.6))',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* Component Title Overlay Badge */}
        <div className="component-name">
          {scene.title.replace(/\n/g, ' ')} <i />
        </div>
      </div>

      {/* Subsystem Layers Breakdown Callout (Legend - NOT duplicate images) */}
      {scene.layers && scene.layers.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', alignItems: 'center' }}>
          <span style={{ font: '700 8px "DM Mono", monospace', color: '#88938b', marginRight: '4px' }}>
            FUNCTIONAL LAYERS:
          </span>
          {scene.layers.map((layer, idx) => (
            <span
              key={layer}
              style={{
                background: 'rgba(201, 232, 123, 0.08)',
                border: '1px solid rgba(201, 232, 123, 0.25)',
                color: '#c9e87b',
                font: '500 8px "DM Mono", monospace',
                padding: '3px 8px',
                borderRadius: '3px',
                letterSpacing: '0.5px'
              }}
            >
              0{idx + 1} · {layer}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
