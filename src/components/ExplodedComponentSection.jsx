import React, { lazy, memo, Suspense, useMemo, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
const Esp32ExplodedView=lazy(()=>import('./Esp32ExplodedView'));
const MicroSdExplodedView=lazy(()=>import('./MicroSdExplodedView'));
const DisplayExplodedView=lazy(()=>import('./DisplayExplodedView'));
const BatteryExplodedView=lazy(()=>import('./BatteryExplodedView'));
const AntennaExplodedView=lazy(()=>import('./AntennaExplodedView'));
const HorizontalExplodedView=lazy(()=>import('./HorizontalExplodedView'));
const RegulatorExplodedView=lazy(()=>import('./RegulatorExplodedView'));
const ThermistorExplodedView=lazy(()=>import('./ThermistorExplodedView'));
const BatterySensorExplodedView=lazy(()=>import('./BatterySensorExplodedView'));
const RfSensorExplodedView=lazy(()=>import('./RfSensorExplodedView'));
const VibrationSensorExplodedView=lazy(()=>import('./VibrationSensorExplodedView'));
const EnvSensorExplodedView=lazy(()=>import('./EnvSensorExplodedView'));
const MosfetExplodedView=lazy(()=>import('./MosfetExplodedView'));
const TempSensorExplodedView=lazy(()=>import('./TempSensorExplodedView'));
const ConverterExplodedView=lazy(()=>import('./ConverterExplodedView'));
const EnergyHarvestingExplodedView=lazy(()=>import('./EnergyHarvestingExplodedView'));
const HeatPipeExplodedView=lazy(()=>import('./HeatPipeExplodedView'));
const RadiatorExplodedView=lazy(()=>import('./RadiatorExplodedView'));
const StructureExplodedView=lazy(()=>import('./StructureExplodedView'));
const PrototypeBoardExplodedView=lazy(()=>import('./PrototypeBoardExplodedView'));
const LoraExplodedView=lazy(()=>import('./LoraExplodedView'));
const InsulationExplodedView=lazy(()=>import('./InsulationExplodedView'));
const SolderProtectionExplodedView=lazy(()=>import('./SolderProtectionExplodedView'));
const RadiationShieldExplodedView=lazy(()=>import('./RadiationShieldExplodedView'));
import useComponentStory from '../hooks/useComponentStory';
import useHardwareFraming from '../hooks/useHardwareFraming';
import { componentStoryPose, chapterLines } from '../lib/componentStory';
import './ComponentStory.css';

const VIEWERS = Object.fromEntries(Object.entries({
  esp32:Esp32ExplodedView, microsd:MicroSdExplodedView, display:DisplayExplodedView,
  regulator:RegulatorExplodedView, thermistor:ThermistorExplodedView, 'battery-sensor':BatterySensorExplodedView,
  'rf-sensor':RfSensorExplodedView, 'vibration-sensor':VibrationSensorExplodedView, 'env-sensor':EnvSensorExplodedView,
  battery:BatteryExplodedView, mosfet:MosfetExplodedView, 'temp-sensor':TempSensorExplodedView,
  converter:ConverterExplodedView, 'energy-harvesting':EnergyHarvestingExplodedView,
  'heat-pipe':HeatPipeExplodedView, radiator:RadiatorExplodedView, structure:StructureExplodedView,
  'prototype-board':PrototypeBoardExplodedView, insulation:InsulationExplodedView,
  'solder-protection':SolderProtectionExplodedView, 'radiation-shield':RadiationShieldExplodedView,
  lora:LoraExplodedView, antenna:AntennaExplodedView,
}).map(([id, Viewer]) => [id, memo(Viewer)]));

function FramedHardware({ Renderer, scene, progress }) {
  const hardware=useRef(null);
  useHardwareFraming(hardware,progress,true);
  return <div className="story-hardware" ref={hardware}><Renderer scene={scene} scrollProgress={progress} isSceneActive /></div>;
}

export default function ExplodedComponentSection({ scene }) {
  const section=useRef(null);
  const {progress,near}=useComponentStory(section);
  const pose=componentStoryPose(progress);
  const Renderer=VIEWERS[scene.id]??HorizontalExplodedView;
  const lines=useMemo(()=>chapterLines(scene.title),[scene.title]);
  const longest=Math.max(...lines.map(line=>line.length));
  const stageNames={name:'01 / DISCOVER',assembled:'02 / ASSEMBLED',exploding:'03 / EXPLORE',complete:'03 / EXPLORED'};
  const nextCue=Number(scene.index)===23?'CONTINUE TO COMPLETE SYSTEM':'CONTINUE TO NEXT COMPONENT';
  return <section ref={section} className={`component-story ${near?'is-near':''}`} data-component={scene.id} data-stage={pose.stage} data-explosion={pose.explosion.toFixed(4)} aria-label={`${scene.title.replace(/\n/g,' ')} component inspection`}
    style={{'--chapter-size':`${Math.min(16,135/longest)}vw`,'--title-opacity':pose.titleOpacity,'--title-y':`${pose.titleY}px`,'--title-scale':pose.titleScale,'--object-opacity':pose.objectOpacity,'--object-y':`${pose.objectY}px`,'--object-scale':pose.objectScale,'--details-opacity':pose.detailsOpacity,'--chapter-exit':1-pose.exit*.3}}>
    <div className="component-story-sticky">
      <div className="story-atmosphere" aria-hidden="true"><i /><b /></div>
      <div className="story-topline"><span>PRĀŅA / COMPONENT ARCHIVE</span><span>{scene.index} <i>/ 23</i></span></div>
      <div className="story-title" aria-hidden={pose.titleOpacity<.01}>
        <p><span>{scene.index}</span> {scene.category} SYSTEM</p>
        <h2>{lines.map((line,index)=><span key={index}>{line}</span>)}</h2>
        <div className="story-title-bottom"><span>{scene.role}</span><ArrowDown size={24} strokeWidth={1} /></div>
      </div>
      <div className="story-caption" aria-hidden={pose.detailsOpacity<.01}>
        <div><p>{scene.index} / {scene.category}</p><h3>{scene.title.replace(/\n/g,' ')}</h3></div>
        <p>{scene.description}</p>
      </div>
      <div className="story-object" aria-hidden={pose.objectOpacity<.01} inert={pose.objectOpacity<.9?true:undefined}>
        {near && <Suspense fallback={null}><FramedHardware Renderer={Renderer} scene={scene} progress={pose.explosion} /></Suspense>}
      </div>
      <div className="story-footer"><span className="story-phase">{stageNames[pose.stage]}</span><span>{pose.stage==='name'?'SCROLL TO REVEAL':pose.stage==='assembled'?'SCROLL TO EXPLODE':pose.stage==='complete'?nextCue:'SCROLL BACK TO REASSEMBLE'} <ArrowDown size={12} /></span><span>{scene.category} / PRĀŅA</span></div>
    </div>
  </section>;
}
