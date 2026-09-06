import * as T from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

// Append two assemblies to the existing GLB. Original geometry, materials,
// textures, rotor pivots and all four original assemblies are preserved exactly.
const source = await readFile('public/models/prana.glb');
const jsonLength = source.readUInt32LE(12);
const doc = JSON.parse(source.subarray(20,20+jsonLength).toString());
const originalBinary = source.subarray(28+jsonLength);
const chunks = [originalBinary];
let bytes = originalBinary.length, addedParts = 0, addedTriangles = 0;
function view(data,target) {
  const buffer = Buffer.from(data.buffer??data,data.byteOffset??0,data.byteLength);
  const index = doc.bufferViews.length;
  doc.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:buffer.length,...(target?{target}:{})});
  chunks.push(buffer,Buffer.alloc((4-buffer.length%4)%4));
  bytes += buffer.length+(4-buffer.length%4)%4;
  return index;
}
function material(name,color,metallicFactor,roughnessFactor,extra={}) {
  const index=doc.materials.length;
  doc.materials.push({name,pbrMetallicRoughness:{baseColorFactor:[...new T.Color(color).toArray(),1],metallicFactor,roughnessFactor},...extra});
  return index;
}
function texture(png) {
  const index=doc.textures.length;
  doc.images.push({bufferView:view(png),mimeType:'image/png'});
  doc.textures.push({source:doc.images.length-1,sampler:0});
  return index;
}
const copper = material('Two-phase pipes / brushed oxygen-free copper','#d89764',.97,.28);
const seam = material('Brazed copper seams','#895126',.94,.38);
const titanium = material('Thermal saddles / satin titanium','#a2b3bd',.92,.29);
const ceramic = material('Thermal isolation / dark ceramic','#172124',.1,.65);
const film = material('Superhydrophobic anti-icing / clear fluoropolymer','#a5dfe3',.12,.2,{alphaMode:'BLEND',doubleSided:true,extensions:{KHR_materials_clearcoat:{clearcoatFactor:1,clearcoatRoughnessFactor:.08},KHR_materials_ior:{ior:1.36}}});
// A deliberately visible section of a surface coating for exploded inspection.
// It remains translucent so the existing crown can be seen through it.
const edge = material('Coating section / pale blue edge','#9bcbd1',.6,.25);
const bead = material('Beaded water / high contact angle','#effaff',0,.055,{extensions:{KHR_materials_clearcoat:{clearcoatFactor:1,clearcoatRoughnessFactor:.025},KHR_materials_ior:{ior:1.333},KHR_materials_transmission:{transmissionFactor:.97},KHR_materials_volume:{thicknessFactor:.035,attenuationDistance:1,attenuationColor:[.83,.96,1]}}});
doc.materials[film].pbrMetallicRoughness.baseColorFactor[3]=.095;
doc.extensionsUsed=[...new Set([...(doc.extensionsUsed??[]),'KHR_materials_clearcoat','KHR_materials_ior','KHR_materials_transmission','KHR_materials_volume'])];
// Deterministic microtexture: restrained machining grain on copper and fine
// isotropic structure on the coating. All textures are embedded in the GLB.
const grain=Buffer.alloc(256*256*3), micro=Buffer.alloc(256*256*3);
for(let y=0;y<256;y++) for(let x=0;x<256;x++) {
  const i=(y*256+x)*3, n=((x*73+y*151+x*y*13)%101)/100;
  grain[i]=127;grain[i+1]=122+Math.floor(n*12);grain[i+2]=255;
  micro[i]=124+Math.floor(n*8);micro[i+1]=124+Math.floor(((x*23+y*37)%79)/79*8);micro[i+2]=255;
}
const grainIndex=texture(await sharp(grain,{raw:{width:256,height:256,channels:3}}).png().toBuffer());
const microIndex=texture(await sharp(micro,{raw:{width:256,height:256,channels:3}}).png().toBuffer());
doc.materials[copper].normalTexture={index:grainIndex,scale:.18};
doc.materials[film].normalTexture={index:microIndex,scale:.23};
const groups={PhaseHeatpipes:new Map(),AntiIcing:new Map()};
function put(group,mat,geometry,position=[0,0,0],rotation=[0,0,0],scale=[1,1,1]) {
  geometry.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...position),new T.Quaternion().setFromEuler(new T.Euler(...rotation)),new T.Vector3(...scale)));
  if(!groups[group].has(mat)) groups[group].set(mat,[]);
  groups[group].get(mat).push(geometry.index?geometry.toNonIndexed():geometry);
  addedParts++;
}
function box(g,m,p,s,r=[0,0,0],bevel=.009) {put(g,m,new RoundedBoxGeometry(...s,2,Math.min(bevel,...s.map(x=>x/3))),p,r);}
function cylinder(g,m,p,r,h) {put(g,m,new T.CylinderGeometry(r,r,h,24),p);}
function bolt(g,x,y,z) {
  cylinder(g,titanium,[x,y,z],.027,.018);
  put(g,ceramic,new T.CylinderGeometry(.012,.012,.005,6),[x,y+.01,z]);
}
// Two independently sealed U-shaped pipes, each with an evaporator contact,
// parallel vapor/return legs, a rounded condenser bend and brazed end plugs.
for(const side of [-1,1]) {
  const inner=side*.46, outer=side*.77;
  const curve=new T.CatmullRomCurve3([
    new T.Vector3(inner,0,-.66),new T.Vector3(inner,0,-.40),new T.Vector3(inner,0,.34),
    new T.Vector3(inner,0,.55),new T.Vector3(side*.53,0,.69),new T.Vector3(side*.69,0,.69),
    new T.Vector3(outer,0,.55),new T.Vector3(outer,0,.28),new T.Vector3(outer,0,-.42),new T.Vector3(outer,0,-.66),
  ],false,'centripetal');
  put('PhaseHeatpipes',copper,new T.TubeGeometry(curve,112,.051,20,false),[0,.875,0],[0,0,0],[1,.68,1]);
  box('PhaseHeatpipes',copper,[side*.615,.84,-.61],[.43,.064,.27],[0,0,0],.025);
  for(const x of [inner,outer]) {
    put('PhaseHeatpipes',seam,new T.TorusGeometry(.043,.007,8,24),[x,.875,-.64]);
    put('PhaseHeatpipes',copper,new T.SphereGeometry(.041,20,12),[x,.875,-.66],[0,0,0],[1,.7,.28]);
  }
  for(const z of [-.22,.30]) {
    box('PhaseHeatpipes',ceramic,[side*.615,.77,z],[.45,.035,.15]);
    box('PhaseHeatpipes',titanium,[side*.615,.806,z],[.45,.037,.15]);
    // Two narrow bridge clips leave most of the copper exposed.
    for(const x of [inner,outer]) {
      box('PhaseHeatpipes',titanium,[x,.915,z],[.13,.019,.075]);
      for(const end of [-1,1]) box('PhaseHeatpipes',titanium,[x+end*.06,.866,z],[.018,.09,.075]);
    }
    for(const x of [side*.40,side*.83]) bolt('PhaseHeatpipes',x,.84,z);
  }
  // Small condenser fin bank around the curved return at the rear.
  for(let i=0;i<7;i++) box('PhaseHeatpipes',titanium,[side*(.48+i*.044),.89,.59],[.012,.12,.27],[0,0,0],.002);
}
// A thin chamfered coating section, vent apertures and a clearance for the
// existing RF mast. It does not replace or alter any part of the drone.
const outline=[[-.69,-.81],[.69,-.81],[.89,-.59],[.89,.59],[.69,.81],[-.69,.81],[-.89,.59],[-.89,-.59]];
const shape=new T.Shape(outline.map(([x,z])=>new T.Vector2(x,z)));
const mast=new T.Path();mast.absarc(.56,.58,.077,0,Math.PI*2,true);shape.holes.push(mast);
for(const side of [-1,1]) for(let i=0;i<8;i++) {
  const x=side*.60,z=(i-3.5)*.12,w=.23,h=.039;
  const hole=new T.Path();hole.moveTo(x-w/2,z-h/2);hole.lineTo(x-w/2,z+h/2);hole.lineTo(x+w/2,z+h/2);hole.lineTo(x+w/2,z-h/2);hole.closePath();shape.holes.push(hole);
}
put('AntiIcing',film,new T.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:2,steps:1}),[0,1.055,0],[-Math.PI/2,0,0]);
// A fine visible edge makes the thin film legible in the exploded view.
for(let i=0;i<outline.length;i++) {
  const a=outline[i],b=outline[(i+1)%outline.length];
  const start=new T.Vector3(a[0],1.06,-a[1]),end=new T.Vector3(b[0],1.06,-b[1]);
  const curve=new T.LineCurve3(start,end);
  put('AntiIcing',edge,new T.TubeGeometry(curve,1,.009,8,false));
}
for(const x of [-.78,.78]) for(const z of [-.57,.57]) {
  box('AntiIcing',edge,[x,1.058,z],[.08,.02,.13]);
  bolt('AntiIcing',x,1.074,z);
}
// Nearly spherical beads demonstrate the high-contact-angle surface, with
// varying size and spacing rather than an opaque frost layer.
for(let i=0;i<19;i++) {
  const x=(((i*37)%97)/97-.5)*.76,z=(((i*53+11)%101)/101-.5)*1.32;
  const radius=.014+((i*17)%13)/13*.025;
  put('AntiIcing',bead,new T.SphereGeometry(radius,20,14),[x,1.073+radius*.67,z],[0,0,0],[1,.92,1]);
}
// Restrained technical markings engraved into the new mounting plate only.
const labelPng=await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="256"><rect width="1024" height="256" fill="#9c663e"/><text x="512" y="114" text-anchor="middle" fill="#251e18" font-family="monospace" font-size="66">2-PHASE / Cu</text><text x="512" y="194" text-anchor="middle" fill="#251e18" font-family="monospace" font-size="37">EVAPORATOR  •  CONDENSER</text></svg>')).png().toBuffer();
const label=material('Two-phase assembly / etched identification','#ffffff',.83,.4);
doc.materials[label].pbrMetallicRoughness.baseColorTexture={index:texture(labelPng)};
for(const side of [-1,1]) {
  const plane=new T.PlaneGeometry(.32,.10), uv=plane.getAttribute('uv');
  for(let i=0;i<uv.count;i++) uv.setY(i,1-uv.getY(i));
  put('PhaseHeatpipes',label,plane,[side*.615,.874,-.61],[-Math.PI/2,0,0]);
}
// Clear the existing raised sensor housing without moving the original crown.
for(const geos of groups.PhaseHeatpipes.values()) for(const geometry of geos) geometry.translate(0,.075,0);
for(const [name,buckets] of Object.entries(groups)) {
  const primitives=[];
  for(const [material,geos] of buckets) {
    const geometry=mergeVertices(mergeGeometries(geos));geometry.computeBoundingBox();
    const attributes={};
    for(const [key,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']]) {
      const attr=geometry.getAttribute(key);if(!attr)continue;
      attributes[semantic]=doc.accessors.length;
      doc.accessors.push({bufferView:view(attr.array,34962),componentType:5126,count:attr.count,type:key==='uv'?'VEC2':'VEC3',...(key==='position'?{min:geometry.boundingBox.min.toArray(),max:geometry.boundingBox.max.toArray()}:{})});
    }
    const indices=doc.accessors.length;
    doc.accessors.push({bufferView:view(geometry.index.array,34963),componentType:geometry.index.array instanceof Uint32Array?5125:5123,count:geometry.index.count,type:'SCALAR'});
    addedTriangles+=geometry.index.count/3;primitives.push({attributes,indices,material});
  }
  doc.nodes[0].children.push(doc.nodes.length);
  doc.nodes.push({name,mesh:doc.meshes.length,extras:{assembly:name==='AntiIcing'?'Superhydrophobic anti-icing coating':'Paired two-phase copper heat pipes',...(name==='PhaseHeatpipes'?{sealedPipeCount:2}:{})}});
  doc.meshes.push({name,primitives});
}
doc.asset.generator='PRANA additive survival-layer generator';
doc.buffers[0].byteLength=bytes;
const raw=Buffer.from(JSON.stringify(doc)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),bin=Buffer.concat(chunks);
const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);
const jh=Buffer.alloc(8);jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);
const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
await writeFile('public/models/prana-survival.glb',Buffer.concat([header,jh,json,bh,bin]));
const manifest={base:'prana.glb',assemblies:doc.nodes[0].children.map(i=>doc.nodes[i].name),addedParts,addedTriangles,bytes:header.readUInt32LE(8),baseGeometryPreserved:true};
await writeFile('public/models/prana-survival-manifest.json',JSON.stringify(manifest,null,2));
console.log(manifest);
