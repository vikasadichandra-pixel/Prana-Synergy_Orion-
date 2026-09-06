import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, Html, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import usePinnedProgress from '../hooks/usePinnedProgress';
import PranaAtmosphere from './PranaAtmosphere';
import { hoverOffset, rotorAngle } from '../lib/ambientMotion';
import { inspectionPose, TRAVEL, UPPER_TRAVEL, INSPECTION_LAYERS, LAYER_TRAVEL, fitViewport, openingZoomMultiplier, ramp } from '../lib/inspection';
import { arrivalPose, ARRIVAL_SECONDS } from '../lib/introFlight';
import './PranaWebGL.css';

const MODEL = `${import.meta.env.BASE_URL}models/prana-survival.glb?v=3`;
useGLTF.preload(MODEL);
const ASSEMBLIES = ['Chassis', 'Heatpipe', 'PCB', 'Battery'];
const PHASES = [
  ['PRĀŅA HOMEOSTATIC DRONE', 'SCROLL TO BEGIN DEEP INSPECTION', 'Fully assembled. Built around thermal resilience.'],
  ['ONE SYSTEM. SIX LAYERS.', 'INTERNAL ARCHITECTURE / TOP TO BOTTOM', 'The assembly opens before a closer inspection of each layer.'],
  ['THE FIRST LINE OF DEFENCE.', '01 / SUPERHYDROPHOBIC ANTI-ICING COATING', 'A close inspection of the surface film and its water-beading finish.'],
  ['HEAT, IN PHASE.', '02 / PAIRED TWO-PHASE HEAT PIPES', 'Two sealed copper paths above the airframe, with clamps and thermal interfaces.'],
  ['AIRFRAME INSPECTION', '03 / FORGED CARBON + MACHINED ALUMINUM', 'A closer look at the structure that protects the system.'],
  ['PASSIVE THERMAL TRANSFER', '04 / COPPER HEAT PIPE ASSEMBLY', 'Flattened copper paths connect the central spreader to the fin arrays.'],
  ['THE HOMEOSTATIC CORE', '05 / FLIGHT CONTROL ASSEMBLY', 'A custom blue FR-4 board with a gold control package and peripheral circuitry.'],
  ['ENERGY, PROTECTED.', '06 / RUGGEDIZED 3S POWER', 'A ribbed enclosure surrounds the power module beneath the controller.'],
  ['INSPECTION COMPLETE', 'CONTINUE TO COMPONENT EXPLORER', 'The full assembly returns to view before the page continues.'],
];

/** Mesh geometry stays intact; Y separation and material emphasis follow the tour. */
export function PranaModel({ progressRef, reduced = false, onReady, hovering = true }) {
  const floating = useRef();
  const time = useRef(0);
  const { scene } = useGLTF(MODEL);
  useEffect(() => { onReady?.(); }, [scene, onReady]);
  const clone = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse(object => {
      if (object.isMesh) { object.castShadow = !object.material.transparent && !object.material.transmission; object.receiveShadow = true; }
    });
    return copy;
  }, [scene]);
  const layers = useMemo(() => ASSEMBLIES.map(name => {
    const object = clone.getObjectByName(name);
    if (!object) throw new Error(`Missing PRANA assembly: ${name}`);
    return object;
  }), [clone]);
  const upperLayers = useMemo(() => Object.entries(UPPER_TRAVEL).map(([name,travel]) => {
    const object = clone.getObjectByName(name);
    if (!object) throw new Error(`Missing PRANA upper assembly: ${name}`);
    return {object,travel};
  }), [clone]);
  const rotors = useMemo(() => [1,2,3,4].map(index => {
    const rotor = clone.getObjectByName(`Rotor_${index}`);
    if (!rotor) throw new Error(`Missing PRANA rotor: ${index}`);
    return rotor;
  }), [clone]);
  // Instance-owned materials let the upper layers recede during close-ups without
  // changing the shared GLB or the aircraft used by the preloader.
  const surfaces = useMemo(()=>INSPECTION_LAYERS.map(name=>{
    const items=[];
    clone.getObjectByName(name).traverse(mesh=>{
      if(!mesh.isMesh) return;
      const materials=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(material=>material.clone());
      mesh.material=Array.isArray(mesh.material)?materials:materials[0];
      items.push({mesh,materials:materials.map(material=>({material,opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite}))});
    });
    return items;
  }),[clone]);
  useEffect(()=>()=>surfaces.flat().forEach(item=>item.materials.forEach(({material})=>material.dispose())),[surfaces]);
  useFrame((_, delta) => {
    if (!reduced) time.current += Math.min(delta, .05);
    const { separation, focus, weights } = inspectionPose(progressRef.current);
    layers.forEach((layer, i) => { layer.position.y = TRAVEL[i] * separation; });
    upperLayers.forEach(({object,travel}) => {object.position.y = travel * separation;});
    floating.current.position.y = .1 + (hovering ? hoverOffset(time.current, separation, reduced) : 0);
    rotors.forEach(rotor => { rotor.rotation.y = rotorAngle(time.current, rotor.userData.spinDirection, reduced); });
    surfaces.forEach((items,index)=>{
      const visibility=1-.93*focus+.93*weights[index];
      items.forEach(({mesh,materials})=>{
        materials.forEach(({material,opacity,transparent,depthWrite})=>{
          const translucent=transparent || visibility<.999;
          if(material.transparent!==translucent) {material.transparent=translucent;material.needsUpdate=true;}
          material.opacity=opacity*visibility;
          material.depthWrite=depthWrite && visibility>.999;
        });
        mesh.castShadow=visibility>.95 && !materials[0].transparent;
      });
    });
  });
  return <group ref={floating} rotation={[0, Math.PI / 6, 0]}><primitive object={clone} dispose={null} /></group>;
}

const INITIAL_TARGET = [0, .4, 0];

function InspectionCamera({ targetProgress, progressRef, controlsRef, rotationRef }) {
  const { camera, size, gl } = useThree();
  const { scene } = useGLTF(MODEL);
  const boxes=useMemo(()=>{
    scene.updateMatrixWorld(true);
    return INSPECTION_LAYERS.map(name=>{
      const box=new THREE.Box3().setFromObject(scene.getObjectByName(name));
      if(name==='Chassis') {box.min.x=box.min.z=-3.2;box.max.x=box.max.z=3.2;}
      return box;
    });
  },[scene]);
  const openingPoints=useMemo(()=>{
    const points=[],point=new THREE.Vector3();
    scene.updateMatrixWorld(true);
    // Fit the real airframe silhouette, not the empty corners of a large cube.
    scene.getObjectByName('Chassis').traverse(mesh=>{
      if(!mesh.isMesh) return;
      for(let parent=mesh;parent;parent=parent.parent) if(/^Rotor_\d$/.test(parent.name)) return;
      mesh.geometry.computeBoundingBox();
      const box=mesh.geometry.boundingBox;
      for(const x of [box.min.x,box.max.x]) for(const y of [box.min.y,box.max.y]) for(const z of [box.min.z,box.max.z]) points.push(new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld));
    });
    // Include the entire rotor sweep, so spinning or rotating cannot crop a tip.
    for(let i=1;i<=4;i++) {
      const rotor=scene.getObjectByName(`Rotor_${i}`),box=new THREE.Box3().setFromObject(rotor);
      rotor.getWorldPosition(point);
      const radius=Math.hypot(Math.max(Math.abs(box.min.x-point.x),Math.abs(box.max.x-point.x)),Math.max(Math.abs(box.min.z-point.z),Math.abs(box.max.z-point.z)));
      for(let step=0;step<24;step++) for(const y of [box.min.y,box.max.y]) points.push(new THREE.Vector3(point.x+radius*Math.cos(step*Math.PI/12),y,point.z+radius*Math.sin(step*Math.PI/12)));
    }
    return points;
  },[scene]);
  const scratch=useMemo(()=>({right:new THREE.Vector3(),up:new THREE.Vector3(),forward:new THREE.Vector3(),point:new THREE.Vector3(),target:new THREE.Vector3(),delta:new THREE.Vector3(),rotation:new THREE.Matrix4().makeRotationY(Math.PI/6)}),[]);
  useFrame((_,delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    // Wheel motion is already smoothed at document level. Keep the camera and
    // meshes on that same playhead, including the final hold before release.
    progressRef.current=targetProgress.current;
    const pose = inspectionPose(progressRef.current);
    if (rotationRef.current) {
      camera.position.sub(controls.target).applyAxisAngle(camera.up, rotationRef.current).add(controls.target);
      rotationRef.current = 0;
    }
    camera.updateMatrixWorld();
    const {right,up,forward,point,target,rotation}=scratch;
    right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);camera.getWorldDirection(forward);
    const projected=boxes.map((box,index)=>{
      const extent={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};
      for(const x of [box.min.x,box.max.x]) for(const y of [box.min.y,box.max.y]) for(const z of [box.min.z,box.max.z]) {
        point.set(x,y+LAYER_TRAVEL[index]*pose.separation+.1,z).applyMatrix4(rotation);
        const px=point.dot(right),py=point.dot(up),pz=point.dot(forward);
        extent.minX=Math.min(extent.minX,px);extent.maxX=Math.max(extent.maxX,px);
        extent.minY=Math.min(extent.minY,py);extent.maxY=Math.max(extent.maxY,py);
        extent.minZ=Math.min(extent.minZ,pz);extent.maxZ=Math.max(extent.maxZ,pz);
      }
      return extent;
    });
    const full={};
    for(const key of ['minX','minY','minZ']) full[key]=Math.min(...projected.map(box=>box[key]));
    for(const key of ['maxX','maxY','maxZ']) full[key]=Math.max(...projected.map(box=>box[key]));
    const opening=1-ramp(progressRef.current,.08,.24);
    if(opening>0) {
      const silhouette={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity};
      for(const vertex of openingPoints) {
        point.copy(vertex);point.y+=LAYER_TRAVEL[2]*pose.separation+.1;point.applyMatrix4(rotation);
        const x=point.dot(right),y=point.dot(up),z=point.dot(forward);
        silhouette.minX=Math.min(silhouette.minX,x);silhouette.maxX=Math.max(silhouette.maxX,x);
        silhouette.minY=Math.min(silhouette.minY,y);silhouette.maxY=Math.max(silhouette.maxY,y);
        silhouette.minZ=Math.min(silhouette.minZ,z);silhouette.maxZ=Math.max(silhouette.maxZ,z);
      }
      const openingViews=[silhouette,...projected.filter((_,index)=>index!==2)];
      for(const key of ['minX','minY','minZ']) full[key]=THREE.MathUtils.lerp(full[key],Math.min(...openingViews.map(box=>box[key])),opening);
      for(const key of ['maxX','maxY','maxZ']) full[key]=THREE.MathUtils.lerp(full[key],Math.max(...openingViews.map(box=>box[key])),opening);
    }
    const views=[full,...projected],weights=[1-pose.focus,...pose.weights];
    let zoom=0;target.set(0,0,0);
    views.forEach((box,index)=>{
      const weight=weights[index];
      target.addScaledVector(right,(box.minX+box.maxX)*.5*weight).addScaledVector(up,(box.minY+box.maxY)*.5*weight).addScaledVector(forward,(box.minZ+box.maxZ)*.5*weight);
      zoom+=weight*fitViewport(size.width,size.height,box.maxX-box.minX,box.maxY-box.minY);
    });
    scratch.delta.copy(target).sub(controls.target);
    camera.position.add(scratch.delta);controls.target.copy(target);
    zoom*=openingZoomMultiplier(progressRef.current,size.width,size.height,full.maxX-full.minX,full.maxY-full.minY);
    camera.zoom=zoom;
    camera.updateProjectionMatrix();
    controls.update();
    if(import.meta.env.DEV) {
      gl.domElement.dataset.inspectionPhase=String(pose.phase);
      gl.domElement.dataset.cameraZoom=zoom.toFixed(3);
      const selected=pose.weights.findIndex(weight=>weight>.999);
      gl.domElement.dataset.focus=selected<0?'overview':INSPECTION_LAYERS[selected];
      if(selected>=0 || pose.focus<.001) {
        const box=selected<0?full:projected[selected],x=target.dot(right),y=target.dot(up);
        gl.domElement.dataset.frameFit=JSON.stringify([(box.minX-x)*zoom/(size.width/2),(box.maxX-x)*zoom/(size.width/2),(box.minY-y)*zoom/(size.height/2),(box.maxY-y)*zoom/(size.height/2)]);
      }
    }
  }, -2);
  return null;
}

function Grounding({ progressRef }) {
  const ref = useRef();
  useFrame(() => { if(ref.current) ref.current.visible = progressRef.current < .19; });
  return <group ref={ref}><ContactShadows frames={1} position={[0,-.76,0]} opacity={.55} scale={13} blur={2.5} far={5} resolution={512} color="#000000" /></group>;
}

function Arrival({ phase, children }) {
  const group = useRef();
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (phase === 'loading') elapsed.current = 0;
    else if (phase === 'arriving') elapsed.current = Math.min(ARRIVAL_SECONDS, elapsed.current + Math.min(delta, .05));
    else elapsed.current = ARRIVAL_SECONDS;
    const pose = arrivalPose(elapsed.current);
    group.current.scale.setScalar(pose.scale);
    group.current.position.y = pose.y;
    group.current.rotation.z = pose.bank;
  });
  return <group ref={group} scale={.035}>{children}</group>;
}

export function PranaCanvas({ progressRef, running = true, rotationRef, reduced = false, introPhase = 'ready' }) {
  const controlsRef = useRef();
  const visualProgress = useRef(0);
  const defaultRotation = useRef(0);
  const rotation = rotationRef ?? defaultRotation;
  return <Canvas shadows frameloop={running?'always':'demand'} dpr={[1, 2]} orthographic camera={{position:[8,8.4,8],near:.1,far:80}}
    gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}
    onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;}}>
    <ambientLight intensity={.4} />
    <directionalLight castShadow position={[-3,7,5]} intensity={3.8} color="#fff5e7" shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={.012} />
    <directionalLight position={[5,2,-4]} intensity={2.2} color="#a4d8dd" />
    <Suspense fallback={<Html center><span className="prana-loading">INITIALIZING FLIGHT ASSEMBLY…</span></Html>}>
      <InspectionCamera targetProgress={progressRef} progressRef={visualProgress} controlsRef={controlsRef} rotationRef={rotation} />
      <Environment resolution={256}>
        <Lightformer position={[-3,5,2]} rotation={[-Math.PI/3,0,-.4]} scale={[5,3,1]} intensity={4} color="#fff6e6" />
        <Lightformer position={[5,1,-3]} rotation={[0,-Math.PI/2,0]} scale={[1,7,1]} intensity={5} color="#b7e8e6" />
        <Lightformer position={[-4,1,0]} rotation={[0,Math.PI/2,0]} scale={[1,5,1]} intensity={2} />
        <Lightformer position={[0,2,5]} rotation={[0,Math.PI,0]} scale={[8,6,1]} intensity={3} />
      </Environment>
      <Arrival phase={introPhase}><PranaModel progressRef={visualProgress} reduced={reduced} /></Arrival>
      <Grounding progressRef={visualProgress} />
    </Suspense>
    <OrbitControls ref={controlsRef} makeDefault enabled={introPhase==='ready'} enableZoom={false} enablePan={false} enableDamping={false}
      target={INITIAL_TARGET} rotateSpeed={.6} minPolarAngle={.25} maxPolarAngle={Math.PI*.7}
      touches={{ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.ROTATE}} />
  </Canvas>;
}

class ViewerBoundary extends React.Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="prana-failure">The 3D viewer could not load. <a href={MODEL} download>Download the model</a> to inspect it locally.</div>:this.props.children;}
}

export default function PranaWebGL({ introPhase = 'ready' }) {
  const section=useRef(null), heading=useRef(null), progress=useRef(0), rotation=useRef(0);
  const scroll=usePinnedProgress(section);
  const reduced = false;
  const [visible,setVisible]=useState(true);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
    if(section.current) observer.observe(section.current);
    return ()=>observer.disconnect();
  },[]);
  progress.current=introPhase==='ready'?scroll:0;
  const {phase}=inspectionPose(scroll);
  const [title,subtitle,description]=PHASES[phase];
  useEffect(()=>{
    const measure=()=>{if(heading.current && section.current) section.current.style.setProperty('--drone-stage-top',`${heading.current.offsetTop+heading.current.offsetHeight+22}px`);};
    const observer=new ResizeObserver(measure);observer.observe(heading.current);measure();
    return ()=>observer.disconnect();
  },[]);
  return <section id="top" className="prana-webgl" ref={section} aria-label="PRANA interactive drone inspection">
    <div className="prana-sticky">
      <PranaAtmosphere running={visible} reduced={reduced} />
      <div ref={heading} className="prana-heading"><p className="prana-eyebrow">PRĀŅA SYSTEMS <i>◆</i> HIGH-ALTITUDE ENGINEERING</p><h1>{title}</h1><p className="prana-subtitle">{subtitle}</p><p className="prana-description">{description}</p></div>
      <div className="prana-render" role="region" tabIndex={0}
        aria-label="Interactive drone: drag or use left and right arrow keys to rotate; scroll to explode. On touch screens, swipe horizontally to rotate and vertically to scroll."
        onKeyDown={event=>{
          if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
            event.preventDefault();
            rotation.current += event.key==='ArrowLeft'?.15:-.15;
          }
        }}><ViewerBoundary><PranaCanvas progressRef={progress} running={visible && introPhase!=='loading'} rotationRef={rotation} reduced={reduced} introPhase={introPhase} /></ViewerBoundary></div>
      <aside className="prana-environment" aria-label="Ladakh environmental conditions"><span>LADAKH</span><b>−30°C</b><span>3,500–5,500 m</span></aside>
      <div className="prana-materials"><span>ASSEMBLY / {phase===0?'CONNECTED':'SEPARATED'}</span>{[
        ['SUPERHYDROPHOBIC COATING','#a5dfe3',2],['TWO-PHASE HEAT PIPES','#d89764',3],
        ['CARBON AIRFRAME','#a5b7b0',4],['COPPER THERMAL BUS','#d39566',5],
        ['FLIGHT CONTROLLER','#58d3ff',6],['3S POWER ENCLOSURE','#c9e87b',7],
      ].map(([name,color,activePhase],i)=><div key={name} className={phase===activePhase?'active':''}><b>0{i+1}</b><i style={{background:color}} />{name}</div>)}</div>
      <div className="prana-gesture-hint"><span>{phase===8?'INSPECTION COMPLETE · SCROLL TO CONTINUE':'DRAG TO ROTATE · SCROLL TO EXPLODE'}</span><a href="#architecture">Skip inspection ↓</a></div>
      <div className="prana-view-note"><span><i /> SYSTEM STATUS / NOMINAL</span><span>THERMAL RESILIENCE / SIH26</span><a href={MODEL} download="prana.glb">3D ASSET ↓</a></div>
    </div>
  </section>;
}
