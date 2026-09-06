import * as T from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

// Deterministic, self-contained glTF 2.0 authoring. Y is the separation axis.
const mats = [
  ['Anodized gunmetal', '#555c5b', .88, .3],
  ['Forged carbon composite', '#babfba', .25, .39],
  ['Raw copper', '#c77a42', .96, .25],
  ['Dark blue FR4', '#082847', .18, .35],
  ['Gold plated contacts', '#e8b957', .93, .23],
  ['Ceramic and rubber', '#15191f', .12, .66],
  ['Machined titanium', '#9daab3', .92, .27],
  ['PCB silkscreen', '#becdcd', .05, .6],
  ['Status phosphor', '#b6ff70', .1, .28],
];
const groups = Object.fromEntries(['Chassis', 'Heatpipe', 'PCB', 'Battery'].map(n => [n, mats.map(() => [])]));
const rotors = [];
let partCount = 0;
function put(g, m, geometry, pos = [0,0,0], rot = [0,0,0], scale = [1,1,1]) {
  geometry.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...pos), new T.Quaternion().setFromEuler(new T.Euler(...rot)), new T.Vector3(...scale)));
  groups[g][m].push(geometry.index ? geometry.toNonIndexed() : geometry); partCount++;
}
function box(g,m,p,s,r=[0,0,0], bevel=.018) { put(g,m,new RoundedBoxGeometry(...s,2,Math.min(bevel,...s.map(v=>v/3))),p,r); }
function cyl(g,m,p,r,h,r2=r,segments=32) { put(g,m,new T.CylinderGeometry(r2,r,h,segments),p); }
function bolt(g,x,y,z) {
  cyl(g,6,[x,y,z],.036,.018,.036,12);
  cyl(g,5,[x,y+.011,z],.014,.005,.014,6);
}
function pipe(g,m,points,r=.04,flatten=1) {
  const curve = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  const geom = new T.TubeGeometry(curve,64,r,10,false);
  put(g,m,geom,[0,0,0],[0,0,0],[1,flatten,1]);
}
function strut(g,m,a,b,r) {
  const direction=new T.Vector3(...b).sub(new T.Vector3(...a));
  const geo=new T.CylinderGeometry(r,r,direction.length(),24);
  geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction.clone().normalize()));
  put(g,m,geo,new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray());
}
function deck(y,thickness,material,slots=false,inset=0) {
  const outline=[[-.76,-.96],[.76,-.96],[1.02,-.64],[1.02,.64],[.76,.96],[-.76,.96],[-1.02,.64],[-1.02,-.64]];
  const shape=new T.Shape(outline.map(([x,z])=>new T.Vector2(x*(1-inset),z*(1-inset))));
  if(slots) for(const side of [-1,1]) for(let i=0;i<10;i++) {
    const x=side*.6,z=(i-4.5)*.13,w=.34,h=.058;
    const hole=new T.Path();hole.moveTo(x-w/2,z-h/2);hole.lineTo(x-w/2,z+h/2);hole.lineTo(x+w/2,z+h/2);hole.lineTo(x+w/2,z-h/2);hole.closePath();shape.holes.push(hole);
  }
  put('Chassis',material,new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.015}),[0,y,0],[-Math.PI/2,0,0]);
}
// Machined decks with genuinely open cooling slots, recessed fasteners and ribs.
deck(.45,.07,1);
deck(.59,.035,5,false,.01);
deck(.64,.055,0,true,.035);
box('Chassis',0,[0,.714,0],[.68,.06,.74],undefined,.055);
for(const side of [-1,1]) {
  for(let i=0;i<10;i++) {
    box('Chassis',5,[side*.61,.57,(i-4.5)*.13],[.32,.1,.025],undefined,.004);
  }
  for(const z of [-.83,.83]) {
    box('Chassis',0,[side*.55,.732,z],[.53,.035,.08],undefined,.012);
    for(const dx of [-.19,.19]) bolt('Chassis',side*.55+dx,.76,z);
  }
  for(let i=0;i<7;i++) box('Chassis',0,[side*.986,.568,(i-3)*.16],[.048,.14,.065],undefined,.006);
}
for(let x of [-1,1]) for(let z of [-1,1]) {
  const a = new T.Vector3(x*.65,.49,z*.65), b = new T.Vector3(x*1.85,.49,z*1.85);
  const mid=a.clone().add(b).multiplyScalar(.5), len=a.distanceTo(b);
  strut('Chassis',1,a.toArray(),b.toArray(),.125);
  strut('Chassis',1,[x*.86,.34,z*.86],[x*1.84,.40,z*1.84],.065);
  box('Chassis',0,[x*.90,.48,z*.90],[.37,.26,.30],[0,Math.atan2(x,z),0],.038);
  for(const t of [1.02,1.59,1.78]) {
    box('Chassis',0,[x*t,.48,z*t],[.30,.27,.11],[0,Math.atan2(x,z),0],.03);
    bolt('Chassis',x*t,.63,z*t);
  }
  pipe('Chassis',5,[[x*.85,.53,z*.85],[x*1.16,.59,z*1.13],[x*1.52,.59,z*1.47],[x*1.82,.56,z*1.82]],.021);
  bolt('Chassis',x*.80,.622,z*.80);
  const mx=x*1.85,mz=z*1.85;
  const rotorName = `Rotor_${rotors.length + 1}`;
  rotors.push({name:rotorName,translation:[mx,.85,mz],spinDirection:x*z});
  groups[rotorName] = mats.map(() => []);
  cyl('Chassis',0,[mx,.51,mz],.27,.12);
  cyl('Chassis',5,[mx,.64,mz],.235,.16);
  for(let i=0;i<16;i++) {
    const t=i*Math.PI/8;
    box('Chassis',2,[mx+Math.sin(t)*.185,.65,mz+Math.cos(t)*.185],[.042,.095,.058],[0,t,0],.009);
  }
  cyl('Chassis',0,[mx,.75,mz],.25,.085,.215);
  for(let j=0;j<5;j++) {
    put('Chassis',6,new T.TorusGeometry(.237,.006,6,48),[mx,.58+j*.034,mz],[Math.PI/2,0,0]);
  }
  for(let i=0;i<12;i++) { const t=i*Math.PI/6; box('Chassis',5,[mx+Math.sin(t)*.165,.795,mz+Math.cos(t)*.165],[.032,.008,.075],[0,t,0],.004); }
  cyl('Chassis',6,[mx,.835,mz],.073,.075,.055);
  // Swept, tapered airfoil blades with actual upper/lower camber.
  for(let sign of [-1,1]) {
    const verts=[],idx=[];
    for(let i=0;i<=24;i++) {
      const t=i/24, radius=.09+t*1.21, chord=.04+.25*Math.sin(Math.PI*t)**.6;
      for(let j=0;j<12;j++) {
        const theta=j/12*Math.PI*2;
        verts.push(sign*radius,.85+Math.sin(theta)*.013*Math.sin(Math.PI*t)+Math.cos(theta)*.02,sign*(.13*t*t+Math.cos(theta)*chord*.5));
      }
    }
    for(let i=0;i<24;i++) for(let j=0;j<12;j++) { const a=i*12+j,b=i*12+(j+1)%12; idx.push(a,b,a+12,b,b+12,a+12); }
    const geo=new T.BufferGeometry(); geo.setAttribute('position',new T.Float32BufferAttribute(verts,3)); geo.setAttribute('uv',new T.Float32BufferAttribute(verts.flatMap((_,i)=>i%3===0?[verts[i],verts[i+2]]:[]),2)); geo.setIndex(idx); geo.computeVertexNormals();
    // Author blades around their own motor pivot, retaining the chassis parent.
    geo.translate(0,-.85,0);
    put(rotorName,1,geo,[0,0,0],[0,x*z*.38,0]);
  }
  bolt('Chassis',mx,.882,mz);
  strut('Chassis',0,[x*.84,.44,z*.62],[x*1.00,-.64,z*.70],.044);
  strut('Chassis',1,[x*1.0,-.64,z*.70],[x*1.0,-.68,z*1.07],.05);
  box('Chassis',5,[x*1.0,-.69,z*1.07],[.13,.10,.28],undefined,.04);
}
// RF mast and front instrument housing.
cyl('Chassis',5,[.56,.93,-.58],.024,.53);
cyl('Chassis',0,[-.47,.78,-.48],.11,.16,.085);
box('Chassis',0,[0,.40,.96],[.50,.27,.20]);
put('Chassis',5,new T.CylinderGeometry(.083,.083,.04,32),[0,.42,1.075],[Math.PI/2,0,0]);
put('Chassis',3,new T.SphereGeometry(.067,24,12),[0,.42,1.095],[0,0,0],[1,1,.2]);
for(let x of [-.2,.2]) bolt('Chassis',x,.55,1);
// Front optical payload, suspension yoke and machined lens rings.
box('Chassis',0,[0,.1,1.03],[.50,.12,.12],undefined,.025);
for(let side of [-1,1]) box('Chassis',0,[side*.245,-.02,1.03],[.07,.30,.12],undefined,.015);
box('Chassis',0,[0,-.09,1.06],[.37,.28,.30],undefined,.07);
for(const [r,d,m] of [[.12,1.24,5],[.103,1.265,6],[.091,1.29,5]]) put('Chassis',m,new T.CylinderGeometry(r,r,.036,48),[0,-.06,d],[Math.PI/2,0,0]);
put('Chassis',3,new T.SphereGeometry(.079,32,16),[0,-.06,1.315],[0,0,0],[1,1,.20]);
for(const x of [-.85,.85]) box('Chassis',8,[x,.53,.79],[.12,.024,.018],undefined,.005);
// Flattened thermal assembly; tubes are flattened around the local Y origin.
box('Heatpipe',2,[0,.29,0],[.65,.085,.66]);
for(let z of [-.28,-.09,.09,.28]) {
  pipe('Heatpipe',2,[[-.82,0,z-.12],[-.66,0,z],[-.32,0,z],[.3,0,z],[.64,0,z],[.81,0,z+.12]],.063,.40);
}
// Lift flattened tubes to their assembled mounting plane.
for(const geo of groups.Heatpipe[2].slice(1)) geo.translate(0,.30,0);
for(let x of [-.80,.80]) {
  box('Heatpipe',2,[x,.30,0],[.18,.06,1.03]);
  for(let i=0;i<14;i++) box('Heatpipe',0,[x,.37,(i-6.5)*.071],[.26,.14,.022],undefined,.003);
}
for(let x of [-.48,.48]) for(let z of [-.48,.48]) { box('Heatpipe',0,[x,.29,z],[.16,.045,.12]); bolt('Heatpipe',x,.323,z); }
// Controller: dark FR4, ground-plane edging, gold traces and via arrays.
box('PCB',3,[0,.04,0],[1.42,.065,1.35],undefined,.055);
box('PCB',4,[0,.085,0],[.45,.025,.45]);
box('PCB',5,[0,.11,0],[.39,.035,.39]);
box('PCB',4,[0,.137,0],[.35,.021,.35]);
for(let side of [-1,1]) for(let i=0;i<16;i++) {
  const a=(i-7.5)*.024;
  box('PCB',4,[side*.231,.095,a],[.045,.013,.011],undefined,.002);
  box('PCB',4,[a,.095,side*.231],[.011,.013,.045],undefined,.002);
}
for(let x of [-1,1]) for(let z of [-1,1]) {
  for(let i=0;i<8;i++) {
    const offset=i*.027;
    pipe('PCB',4,[[x*(.27+offset),.079,z*.18],[x*(.27+offset),.079,z*(.29+offset*.4)],[x*(.39+offset),.079,z*(.40+offset*.4)],[x*(.39+offset),.079,z*.59]],.0035);
  }
  cyl('PCB',4,[x*.62,.080,z*.575],.045,.012);
  cyl('PCB',5,[x*.62,.088,z*.575],.024,.008);
  for(let i=0;i<5;i++) {
    box('PCB',5,[x*(.31+i*.064),.101,z*.29],[.045,.043,.074],undefined,.004);
    for(let e of [-1,1]) box('PCB',6,[x*(.31+i*.064),.097,z*.29+e*.037],[.043,.027,.009],undefined,.002);
  }
}
for(let z of [-.47,.47]) for(let x of [-.18,0,.18]) {
  box('PCB',5,[x,.11,z],[.125,.07,.15],undefined,.009);
  for(let i=0;i<5;i++) for(let side of [-1,1]) box('PCB',6,[x+(i-2)*.023,.09,z+side*.085],[.009,.012,.034],undefined,.002);
}
for(let x of [-.62,.62]) for(let i=0;i<12;i++) {
  cyl('PCB',4,[x,.084,(i-5.5)*.036],.009,.009,.009,8);
}
box('PCB',5,[0,.11,-.62],[.40,.12,.105]);
for(let i=0;i<10;i++) box('PCB',4,[(i-4.5)*.035,.18,-.62],[.012,.10,.012],undefined,.002);
box('PCB',6,[0,.105,.62],[.18,.09,.14]);
box('PCB',5,[0,.105,.697],[.135,.046,.006]);
for(let i=0;i<3;i++) box('PCB',8,[.52,.091,-.12+i*.075],[.025,.02,.042],undefined,.003);
// Dense peripheral population: passives, test points, silkscreen and IC packages.
for(const sign of [-1,1]) {
  for(let row=0;row<3;row++) for(let col=0;col<9;col++) {
    const x=(col-4)*.054,z=sign*(.33+row*.039);
    box('PCB',row===1?0:5,[x,.087,z],[.031,.014,.018],undefined,.002);
    for(const end of [-1,1]) box('PCB',6,[x+end*.017,.087,z],[.007,.013,.018],undefined,.001);
  }
  for(let row=0;row<4;row++) {
    const x=sign*.47,z=(row-1.5)*.113;
    box('PCB',5,[x,.103,z],[.085,.057,.08],undefined,.008);
    for(const edge of [-1,1]) for(let pin=0;pin<4;pin++) box('PCB',6,[x+edge*.05,.084,z+(pin-1.5)*.018],[.025,.014,.007],undefined,.001);
    box('PCB',7,[x,.077,z-.052],[.104,.002,.004],undefined,.0005);
    box('PCB',7,[x+.057,.077,z],[.004,.002,.10],undefined,.0005);
  }
  for(let j=0;j<10;j++) {
    const x=(j-4.5)*.035;
    cyl('PCB',4,[x,.081,sign*.565],.007,.009,.007,8);
  }
}
// Rugged 3S enclosure: individual cell cushions, ribs, clamps and cable.
box('Battery',5,[0,-.29,0],[1.22,.47,1.05],undefined,.07);
for(let x of [-.40,0,.40]) box('Battery',0,[x,-.29,0],[.37,.43,1.01],undefined,.045);
for(let i=0;i<11;i++) box('Battery',0,[0,-.29,(i-5)*.092],[1.29,.50,.034],undefined,.008);
for(let x of [-.43,.43]) box('Battery',5,[x,-.29,0],[.10,.54,1.08],undefined,.02);
box('Battery',0,[0,-.018,0],[.60,.025,.52]);
for(let x of [-.52,.52]) for(let z of [-.43,.43]) bolt('Battery',x,-.02,z);
pipe('Battery',5,[[.54,-.17,.33],[.76,-.15,.40],[.81,-.06,.2],[.74,.01,.10]],.026);
pipe('Battery',2,[[.54,-.23,.33],[.84,-.22,.4],[.90,-.07,.19],[.78,.01,.10]],.019);
box('Battery',4,[.76,.012,.07],[.14,.085,.13]);

// Embedded procedural carbon texture: no network dependencies or random build drift.
let seed=261026;
function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const flakes=Array.from({length:1800},()=>{
  const x=random()*512,y=random()*512,length=4+random()*32,width=1+random()*6,angle=random()*360,v=22+Math.floor(random()*40);
  return `<path d="M0 0 L${length} ${width*.3} L${length*.7} ${width} L${length*.12} ${width*.6}Z" fill="rgb(${v},${v+2},${v+1})" transform="translate(${x} ${y}) rotate(${angle})"/>`;
}).join('');
const carbon=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#121715"/>${flakes}</svg>`)).png().toBuffer();
// Labels are baked into their own thin top-facing planes and embedded in GLB.
const labelSvgs = [
  ['Chassis',[0,.746,0],[.60,.64],'PRĀŅA','H-01 / THERMAL SYSTEM'],
  ['PCB',[0,.149,0],[.31,.31],'ESP32-S3','PRANA / CONTROL'],
  ['Battery',[0,-.003,0],[.53,.44],'3S / 11.1V','PRANA / POWER MODULE'],
];
const textures=[carbon];
for(const [g,p,s,title,sub] of labelSvgs) {
  const svg=`<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="${g==='PCB'?'#b88b3d':'#26313a'}"/><rect x="35" y="35" width="954" height="954" rx="25" fill="none" stroke="#96a2a7" stroke-width="4"/><text x="512" y="440" text-anchor="middle" fill="${g==='PCB'?'#292b29':'#e1e9e7'}" font-family="sans-serif" font-weight="bold" font-size="100">${title}</text><text x="512" y="555" text-anchor="middle" fill="#aab6b9" font-family="monospace" font-size="36">${sub}</text><path d="M180 700H844 M180 725H600" stroke="#98a3a4" stroke-width="7"/></svg>`;
  textures.push(await sharp(Buffer.from(svg)).png().toBuffer());
  mats.push([`${g} engraved identification`,'#ffffff',g==='PCB'?.8:.5,.4]);
  for(const arr of Object.values(groups)) arr.push([]);
  const label=new T.PlaneGeometry(...s);
  const uv=label.getAttribute('uv');
  // glTF images have a top-left origin; Three's authored planes use bottom-left.
  for(let i=0;i<uv.count;i++) uv.setY(i,1-uv.getY(i));
  put(g,mats.length-1,label,p,[-Math.PI/2,0,0]);
}
const doc={asset:{version:'2.0',generator:'PRANA deterministic aerospace concept generator'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'PRANA',children:[]}],meshes:[],materials:mats.map(([name,c,metallicFactor,roughnessFactor],i)=>({name,pbrMetallicRoughness:{baseColorFactor:[...new T.Color(c).toArray(),1],metallicFactor,roughnessFactor,...(i===1?{baseColorTexture:{index:0}}:i>=9?{baseColorTexture:{index:i-8}}:{})},...(i===8?{emissiveFactor:[.25,.5,.06]}:{})})),buffers:[{byteLength:0}],bufferViews:[],accessors:[],images:[],textures:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}]};
// Fine machining grain in roughness and tangent-space normals breaks up the
// perfectly uniform highlights that made the original model look like plastic.
const roughness=Buffer.alloc(256*256*3), normals=Buffer.alloc(256*256*3);
for(let y=0;y<256;y++) for(let x=0;x<256;x++) {
  const i=(y*256+x)*3, grain=random();
  roughness[i]=255;roughness[i+1]=185+Math.floor(grain*65);roughness[i+2]=255;
  normals[i]=122+Math.floor(grain*12);normals[i+1]=124+Math.floor(random()*8);normals[i+2]=255;
}
const roughIndex=textures.length;
textures.push(await sharp(roughness,{raw:{width:256,height:256,channels:3}}).png().toBuffer());
const normalIndex=textures.length;
textures.push(await sharp(normals,{raw:{width:256,height:256,channels:3}}).png().toBuffer());
for(const i of [0,1,2,6]) {
  doc.materials[i].pbrMetallicRoughness.metallicRoughnessTexture={index:roughIndex};
  doc.materials[i].normalTexture={index:normalIndex,scale:i===1?.35:.16};
}
const chunks=[];let bytes=0,triangles=0;
function view(data,target) {const b=Buffer.from(data.buffer??data,data.byteOffset??0,data.byteLength);const id=doc.bufferViews.length;doc.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:b.length,...(target?{target}:{})});chunks.push(b);const pad=(4-b.length%4)%4;chunks.push(Buffer.alloc(pad));bytes+=b.length+pad;return id;}
for(const png of textures) {const i=doc.images.length;doc.images.push({bufferView:view(png),mimeType:'image/png'});doc.textures.push({source:i,sampler:0});}
for(const [name,buckets] of Object.entries(groups)) {
  const primitives=[];
  buckets.forEach((geos,material)=>{
    if(!geos.length)return;
    const geo=mergeVertices(mergeGeometries(geos));geo.computeBoundingBox();const attributes={};
    for(const [key,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']]) {
      const attr=geo.getAttribute(key);if(!attr)continue;
      attributes[semantic]=doc.accessors.length;
      doc.accessors.push({bufferView:view(attr.array,34962),componentType:5126,count:attr.count,type:key==='uv'?'VEC2':'VEC3',...(key==='position'?{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()}:{})});
    }
    const indices=doc.accessors.length;
    doc.accessors.push({bufferView:view(geo.index.array,34963),componentType:geo.index.array instanceof Uint32Array?5125:5123,count:geo.index.count,type:'SCALAR'});
    triangles+=geo.index.count/3;primitives.push({attributes,indices,material});
  });
  const rotor = rotors.find(item => item.name === name);
  if (!rotor) doc.nodes[0].children.push(doc.nodes.length);
  doc.nodes.push({name,mesh:doc.meshes.length,...(rotor?{translation:rotor.translation,extras:{spinDirection:rotor.spinDirection}}:{})});
  doc.meshes.push({name,primitives});
}
doc.nodes.find(node=>node.name==='Chassis').children=rotors.map(rotor=>doc.nodes.findIndex(node=>node.name===rotor.name));
doc.buffers[0].byteLength=bytes;
const raw=Buffer.from(JSON.stringify(doc)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),bin=Buffer.concat(chunks);
const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+bin.length,8);
const jh=Buffer.alloc(8);jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);
const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
await mkdir('public/models',{recursive:true});
await writeFile('public/models/prana.glb',Buffer.concat([header,jh,json,bh,bin]));
await writeFile('public/models/prana-manifest.json',JSON.stringify({assemblies:Object.keys(groups).filter(name=>!name.startsWith('Rotor_')),rotors,parts:partCount,triangles,drawCalls:doc.meshes.reduce((n,m)=>n+m.primitives.length,0),bytes:header.readUInt32LE(8)},null,2));
console.log({partCount,triangles,megabytes:(header.readUInt32LE(8)/1e6).toFixed(2)});
