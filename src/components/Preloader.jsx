import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { PranaModel } from './PranaWebGL';
import { departurePose, loaderPose, liftOffDistance, FLIGHT_START, REVEAL_SECONDS, REVEAL_FADE_SECONDS, ARRIVAL_SECONDS } from '../lib/introFlight';
import { ramp } from '../lib/inspection';
import './Preloader.css';

// The original spherical lime/cyan particle field and camera are preserved.
function Starfield() {
  const ref = useRef();
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(4000 * 3), colors = new Float32Array(4000 * 3);
    const lime = new THREE.Color('#c9e87b'), cyan = new THREE.Color('#58d3ff');
    const noise = n => { const f = Math.sin(n * 127.1) * 43758.5453; return f - Math.floor(f); };
    for (let i = 0; i < 4000; i++) {
      const radius = 25 * Math.cbrt(noise(i + 1));
      const theta = noise(i + 4100) * Math.PI * 2, phi = Math.acos(2 * noise(i + 8200) - 1);
      positions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = radius * Math.cos(phi);
      const color = lime.clone().lerp(cyan, Math.sin(positions[i*3+1] * .5) * .5 + .5);
      color.toArray(colors, i*3);
    }
    return [positions, colors];
  }, []);
  useFrame((_, delta) => {
    ref.current.rotation.y += Math.min(delta, .05) * .15;
    ref.current.rotation.x += Math.min(delta, .05) * .05;
  });
  return <points ref={ref}><bufferGeometry>
    <bufferAttribute attach="attributes-position" args={[positions,3]} />
    <bufferAttribute attach="attributes-color" args={[colors,3]} />
  </bufferGeometry><pointsMaterial size={.06} vertexColors transparent opacity={.8} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} /></points>;
}

function Flight({ clock, layout, wordmark, onReady }) {
  const aircraft = useRef(), model = useRef(), rig = useRef();
  const cables = useRef([]), clamps = useRef([]);
  const progress = useRef(0);
  const { camera, size } = useThree();
  const vectors = useMemo(() => ({origin:new THREE.Vector3(), projected:new THREE.Vector3(), start:new THREE.Vector3(), end:new THREE.Vector3(), direction:new THREE.Vector3(), up:new THREE.Vector3(0,1,0)}), []);
  useFrame(() => {
    const time = loaderPose(clock.current).flightTime;
    const box = layout.current;
    if (!box) { aircraft.current.visible = false; return; }
    const units = 2 * 15 * Math.tan(Math.PI / 6) / size.height;
    const pose = departurePose(time,liftOffDistance(box.y,box.height,size.height,units));
    const width = box.width * units, height = box.height * units;
    const modelScale = width * .078;
    const droneY = height * .5 + modelScale * 1.2;
    vectors.origin.set((box.x-size.width/2)*units,(size.height/2-box.y)*units,0);
    aircraft.current.visible = time > 0 && pose.vanish < 1;
    aircraft.current.position.copy(vectors.origin).add(new THREE.Vector3(pose.x - size.width*units*.8*(1-pose.approach),pose.y,pose.z));
    aircraft.current.rotation.z = pose.bank;
    aircraft.current.scale.setScalar(1);
    model.current.position.y = droneY;
    model.current.scale.setScalar(modelScale);
    rig.current.visible = pose.cable > 0;
    [-1,1].forEach((side,index) => {
      vectors.start.set(side*modelScale*1.3,droneY,0);
      vectors.end.set(side*width*.28,height*.38,0).lerp(vectors.start,1-pose.cable);
      vectors.direction.subVectors(vectors.end,vectors.start);
      const length = vectors.direction.length();
      const cable = cables.current[index];
      cable.position.copy(vectors.start).add(vectors.end).multiplyScalar(.5);
      cable.scale.set(1,length,1);
      cable.quaternion.setFromUnitVectors(vectors.up,vectors.direction.normalize());
      clamps.current[index].position.copy(vectors.end);
    });
    // Project the same payload plane into CSS. The original live text never swaps
    // to a texture, so the blue fill, font, size and pickup position remain exact.
    if (wordmark.current) {
      const attached = pose.attached;
      vectors.projected.copy(vectors.origin);
      if(attached) vectors.projected.add(new THREE.Vector3(pose.x,pose.y,pose.z));
      vectors.projected.project(camera);
      const x = (vectors.projected.x+1)*size.width/2-box.x;
      const y = (1-vectors.projected.y)*size.height/2-box.y;
      const scale = attached ? 15/(15-pose.z) : 1;
      wordmark.current.style.transform = `translate3d(${x}px,${y}px,0) rotate(${attached?-pose.bank:0}rad) scale(${scale})`;
      wordmark.current.style.visibility = pose.vanish===1 ? 'hidden' : 'visible';
    }
  });
  return <group ref={aircraft} visible={false}>
    <group ref={model} rotation={[.38,0,0]}><PranaModel progressRef={progress} onReady={onReady} hovering={false} /></group>
    <group ref={rig}>
      {[-1,1].map((side,index) => <group key={side}>
        <mesh ref={node=>{cables.current[index]=node;}}><cylinderGeometry args={[.016,.016,1,8]} /><meshStandardMaterial color="#91b9b3" metalness={.8} roughness={.3} /></mesh>
        <group ref={node=>{clamps.current[index]=node;}}>
          <mesh><boxGeometry args={[.3,.09,.2]} /><meshStandardMaterial color="#303c36" metalness={.85} roughness={.3} /></mesh>
          {[-1,1].map(jaw=><mesh key={jaw} position={[jaw*.13,-.07,0]}><boxGeometry args={[.035,.18,.16]} /><meshStandardMaterial color="#58d3ff" metalness={.6} roughness={.3} /></mesh>)}
        </group>
      </group>)}
    </group>
  </group>;
}

class FlightBoundary extends React.Component {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  componentDidCatch() {this.props.onFailure();}
  render() {return this.state.failed ? null : this.props.children;}
}

export default function Preloader({ onComplete, onReveal }) {
  const [failed,setFailed] = useState(false), [done,setDone] = useState(false);
  const [phase,setPhase] = useState('BLUE FILL');
  const root=useRef(), clock=useRef(0), ready=useRef(false), failedRef=useRef(false);
  const anchor=useRef(), wordmark=useRef(), fill=useRef(), telemetry=useRef(), layout=useRef();
  const modelReady=useCallback(()=>{ready.current=true;},[]);
  const fail=useCallback(()=>{failedRef.current=true;ready.current=true;setFailed(true);},[]);

  useLayoutEffect(() => {
    if(done || !anchor.current) return;
    const measure = () => {
      if(!anchor.current) return;
      const box=anchor.current.getBoundingClientRect();
      layout.current={x:box.left+box.width/2,y:box.top+box.height/2,width:box.width,height:box.height};
    };
    const observer=new ResizeObserver(measure);
    observer.observe(anchor.current);
    window.addEventListener('resize',measure);
    document.fonts.ready.then(measure);
    measure();
    return ()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  }, [done]);
  useEffect(() => {
    if(done) return;
    const previous=document.body.style.overflow, restoration=window.history.scrollRestoration;
    window.history.scrollRestoration='manual'; document.body.style.overflow='hidden';
    window.scrollTo({top:0,behavior:'instant'});
    return ()=>{document.body.style.overflow=previous;window.history.scrollRestoration=restoration;};
  }, [done]);
  useEffect(() => {
    const timeout=setTimeout(()=>{if(!ready.current) fail();},12000);
    return ()=>clearTimeout(timeout);
  }, [fail]);
  useEffect(() => {
    let frame, previous=performance.now(), revealed=false;
    const tick=now=>{
      const delta=Math.min((now-previous)/1000,.05); previous=now;
      // The blue fill can run while the GLB loads; flight waits for both.
      clock.current=ready.current ? clock.current+delta : Math.min(FLIGHT_START,clock.current+delta);
      const t=clock.current, pose=loaderPose(t);
      const revealAt=failedRef.current?FLIGHT_START+.4:REVEAL_SECONDS;
      if(t>=revealAt && !revealed) {revealed=true;window.scrollTo({top:0,behavior:'instant'});onReveal?.();}
      setPhase(pose.phase);
      if(fill.current) {
        // Accents share the same moving horizontal edge as the letters.
        // Keep the vertical bleed constant so nothing pops in on the final frame.
        fill.current.style.clipPath=pose.fillClip;
      }
      if(telemetry.current) telemetry.current.style.opacity=String(1-ramp(pose.flightTime,.15,.8));
      if(root.current) root.current.style.opacity=String(1-ramp(t,revealAt,revealAt+REVEAL_FADE_SECONDS));
      if(t>=revealAt+ARRIVAL_SECONDS+.08) {window.scrollTo({top:0,behavior:'instant'});setDone(true);onComplete?.();}
      else frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  }, [onReveal,onComplete]);

  if(done) return null;
  return <div ref={root} className="preloader" role="status" aria-label={`Loading PRĀŅA: ${phase}`}>
    {!failed && <div className="preloader__canvas"><FlightBoundary onFailure={fail}>
      <Canvas dpr={[1,1.5]} camera={{position:[0,0,15],fov:60,near:.1,far:100}} gl={{alpha:true,antialias:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.1;}}>
        <ambientLight intensity={.65} /><directionalLight position={[-3,6,5]} intensity={4} color="#fff5e7" /><directionalLight position={[5,2,-3]} intensity={3} color="#8fdae7" />
        <Starfield />
        <Suspense fallback={null}>
          <Environment resolution={128}><Lightformer position={[-3,5,2]} rotation={[-1,0,0]} scale={[5,3,1]} intensity={4} /><Lightformer position={[5,1,-3]} rotation={[0,-Math.PI/2,0]} scale={[2,7,1]} intensity={5} color="#b7e8e6" /></Environment>
          <Flight clock={clock} layout={layout} wordmark={wordmark} onReady={modelReady} />
        </Suspense>
      </Canvas>
    </FlightBoundary></div>}
    <div className="preloader__ui" aria-hidden="true"><div className="preloader__content">
      <div ref={telemetry} className="preloader__telemetry"><span className="preloader__badge">PRĀŅA SYSTEMS</span><span className="preloader__sep">◆</span><span className="preloader__badge">WEBGL DIAGNOSTICS</span></div>
      <div ref={anchor} className="preloader__text-anchor"><div ref={wordmark} className="preloader__text-loader">
        <div className="preloader__text-base">PRĀŅA</div><div ref={fill} className="preloader__text-fill" style={{clipPath:loaderPose(0).fillClip}}>PRĀŅA</div>
      </div></div>
    </div></div>
  </div>;
}
