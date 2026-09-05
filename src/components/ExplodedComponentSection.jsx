import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ShieldCheck } from 'lucide-react';
import Esp32ExplodedView from './Esp32ExplodedView';
import MicroSdExplodedView from './MicroSdExplodedView';
import DisplayExplodedView from './DisplayExplodedView';
import BatteryExplodedView from './BatteryExplodedView';
import AntennaExplodedView from './AntennaExplodedView';
import HorizontalExplodedView from './HorizontalExplodedView';
import RegulatorExplodedView from './RegulatorExplodedView';
import ThermistorExplodedView from './ThermistorExplodedView';
import BatterySensorExplodedView from './BatterySensorExplodedView';
import RfSensorExplodedView from './RfSensorExplodedView';
import VibrationSensorExplodedView from './VibrationSensorExplodedView';
import EnvSensorExplodedView from './EnvSensorExplodedView';
import MosfetExplodedView from './MosfetExplodedView';
import TempSensorExplodedView from './TempSensorExplodedView';
import ConverterExplodedView from './ConverterExplodedView';
import EnergyHarvestingExplodedView from './EnergyHarvestingExplodedView';
import HeatPipeExplodedView from './HeatPipeExplodedView';
import RadiatorExplodedView from './RadiatorExplodedView';
import StructureExplodedView from './StructureExplodedView';
import PrototypeBoardExplodedView from './PrototypeBoardExplodedView';
import LoraExplodedView from './LoraExplodedView';
import InsulationExplodedView from './InsulationExplodedView';
import SolderProtectionExplodedView from './SolderProtectionExplodedView';
import RadiationShieldExplodedView from './RadiationShieldExplodedView';

function Placeholder({ scene }) {
  const resilience = scene.kind === 'resilience';
  return (
    <div className={`concept-layer ${resilience ? 'resilience' : ''}`}>
      {resilience ? (
        <>
          <div className="shield">
            <ShieldCheck size={46} />
            <span>PHYSICAL PROTECTION</span>
          </div>
          <div className="integrity">
            <b>SYSTEM RESILIENCE</b>
            <span>WATCHDOG</span>
            <span>ERROR CHECKING</span>
            <span>CHECKSUM</span>
          </div>
        </>
      ) : (
        <>
          <div className="tbd-line">
            <i />
            <b />
            <i />
          </div>
          <div className="tbd-core">TBD</div>
          <p>
            PROTECTION LAYER
            <br />
            COMPONENTS TO BE DEFINED
          </p>
        </>
      )}
    </div>
  );
}

export default function ExplodedComponentSection({ scene }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isEsp32 = scene.index === '01' || scene.id === 'esp32';
  const isMicroSd = scene.index === '02' || scene.id === 'microsd';
  const isDisplay = scene.index === '03' || scene.id === 'display';
  const isRegulator = scene.index === '04' || scene.id === 'regulator';
  const isThermistor = scene.index === '05' || scene.id === 'thermistor';
  const isBatterySensor = scene.index === '06' || scene.id === 'battery-sensor';
  const isRfSensor = scene.index === '07' || scene.id === 'rf-sensor';
  const isVibrationSensor = scene.index === '08' || scene.id === 'vibration-sensor';
  const isEnvSensor = scene.index === '09' || scene.id === 'env-sensor';
  const isBattery = scene.index === '10' || scene.id === 'battery';
  const isMosfet = scene.index === '11' || scene.id === 'mosfet';
  const isTempSensor = scene.index === '12' || scene.id === 'temp-sensor';
  const isConverter = scene.index === '13' || scene.id === 'converter';
  const isEnergyHarvesting = scene.index === '14' || scene.id === 'energy-harvesting';
  const isHeatPipe = scene.index === '15' || scene.id === 'heat-pipe';
  const isRadiator = scene.index === '16' || scene.id === 'radiator';
  const isStructure = scene.index === '17' || scene.id === 'structure';
  const isPrototypeBoard = scene.index === '18' || scene.id === 'prototype-board';
  const isInsulation = scene.index === '19' || scene.id === 'insulation';
  const isSolderProtection = scene.index === '20' || scene.id === 'solder-protection';
  const isRadiationShield = scene.index === '21' || scene.id === 'radiation-shield';
  const isLora = scene.index === '22' || scene.id === 'lora';
  const isAntenna = scene.index === '23' || scene.id === 'antenna';
  const isHardware = scene.kind === 'component';

  // Intersection observer to activate scene styling
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Track global scroll progress over this section natively
  const [internalScroll, setInternalScroll] = useState(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const visualStageRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isHardware) return;
    
    const container = ref.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = container.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrolled = -rect.top;
      targetScrollRef.current = Math.max(0, Math.min(1, scrolled / scrollable));
    };

    const loop = () => {
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.08;
      setInternalScroll(currentScrollRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHardware]);

  const progress = isHardware ? internalScroll : 0;

  return (
    <section
      ref={ref}
      className={`scene ${active ? 'active' : ''}`}
      style={isHardware ? { height: '250vh', position: 'relative' } : {}}
    >
      <div className="scene-sticky" style={isHardware ? { position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' } : {}}>
        <div className="scene-grid" />
        <div className="scene-content">
          {/* Left Side: Technical Copy & Dynamic Sequence Status */}
          <div className="scene-copy">
            <p>
              {scene.index} / {scene.category}
            </p>
            <h2>
              {scene.title.split('\n').map((line, i) => (
                <span key={line}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h2>
            <b>{scene.role}</b>
            <article>{scene.description}</article>

            <small style={{ marginTop: '24px' }}>
              <ArrowDown size={14} />
              {isHardware
                ? 'SCROLL TO EXPLODE COMPONENT'
                : 'SCROLL TO PROGRESS SUBSYSTEMS'}
            </small>
          </div>

          {/* Right Side: Visual Stage */}
          <div className="visual-stage" ref={visualStageRef}>
            {isEsp32 ? (
              <Esp32ExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isMicroSd ? (
              <MicroSdExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isDisplay ? (
              <DisplayExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRegulator ? (
              <RegulatorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isThermistor ? (
              <ThermistorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isBatterySensor ? (
              <BatterySensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRfSensor ? (
              <RfSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isVibrationSensor ? (
              <VibrationSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isEnvSensor ? (
              <EnvSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isBattery ? (
              <BatteryExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isMosfet ? (
              <MosfetExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isTempSensor ? (
              <TempSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isConverter ? (
              <ConverterExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isEnergyHarvesting ? (
              <EnergyHarvestingExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isHeatPipe ? (
              <HeatPipeExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRadiator ? (
              <RadiatorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isStructure ? (
              <StructureExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isPrototypeBoard ? (
              <PrototypeBoardExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isAntenna ? (
              <AntennaExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isInsulation ? (
              <InsulationExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isSolderProtection ? (
              <SolderProtectionExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRadiationShield ? (
              <RadiationShieldExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isLora ? (
              <LoraExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isHardware ? (
              <HorizontalExplodedView
                scene={scene}
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : (
              <Placeholder scene={scene} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
