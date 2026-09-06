import React, { memo, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
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

export default function ExplodedComponentSection({ scene }) {
  const section=useRef(null), hardware=useRef(null);
  const {progress,near}=useComponentStory(section);
  const pose=componentStoryPose(progress);
  const Renderer=VIEWERS[scene.id]??HorizontalExplodedView;
  const lines=chapterLines(scene.title);
  const longest=Math.max(...lines.map(line=>line.length));
  useHardwareFraming(hardware,pose.explosion,near);
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
        <div className="story-hardware" ref={hardware}>
          {near && <Renderer scene={scene} scrollProgress={pose.explosion} isSceneActive={near} />}
        </div>
      </div>
      <div className="story-footer"><span className="story-phase">{stageNames[pose.stage]}</span><span>{pose.stage==='name'?'SCROLL TO REVEAL':pose.stage==='assembled'?'SCROLL TO EXPLODE':pose.stage==='complete'?nextCue:'SCROLL BACK TO REASSEMBLE'} <ArrowDown size={12} /></span><span>{scene.category} / PRĀŅA</span></div>
    </div>
  </section>;
}
