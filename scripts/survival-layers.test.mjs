import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectionPose, TRAVEL, UPPER_TRAVEL } from '../src/lib/inspection.js';

async function glb(name) {
  const bytes=await readFile(`public/models/${name}`);
  const length=bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(8),bytes.length);
  return {doc:JSON.parse(bytes.subarray(20,20+length).toString()),bin:bytes.subarray(28+length)};
}
test('new GLB preserves every original mesh, material, texture and binary byte',async()=>{
  const [base,added]=await Promise.all([glb('prana.glb'),glb('prana-survival.glb')]);
  assert.deepEqual(added.bin.subarray(0,base.bin.length),base.bin);
  for(const key of ['meshes','materials','accessors','bufferViews','images','textures']) {
    assert.deepEqual(added.doc[key].slice(0,base.doc[key].length),base.doc[key]);
  }
  assert.deepEqual(added.doc.nodes.slice(1,base.doc.nodes.length),base.doc.nodes.slice(1));
  const roots=added.doc.nodes[0].children.map(i=>added.doc.nodes[i].name);
  assert.deepEqual(roots,['Chassis','Heatpipe','PCB','Battery','PhaseHeatpipes','AntiIcing']);
  assert.equal(added.doc.nodes.find(n=>n.name==='PhaseHeatpipes').extras.sealedPipeCount,2);
});
test('both added layers stay above the unchanged chassis throughout reverse scrolling',()=>{
  for(let i=100;i>=0;i--) {
    const s=inspectionPose(i/100).separation;
    const crown=.76+TRAVEL[0]*s,pipes=.95+UPPER_TRAVEL.PhaseHeatpipes*s,coating=1.055+UPPER_TRAVEL.AntiIcing*s;
    assert.ok(coating>pipes && pipes>crown);
  }
});
test('the two added layers receive their own focus and the complete assembly returns before release',()=>{
  assert.equal(inspectionPose(.32).weights[0],1);
  assert.equal(inspectionPose(.43).weights[1],1);
  assert.equal(inspectionPose(.98).focus,0);
  assert.equal(inspectionPose(.98).separation,1);
  assert.deepEqual(inspectionPose(1),inspectionPose(.98));
});
