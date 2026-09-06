import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hoverOffset, rotorAngle } from '../src/lib/ambientMotion.js';

test('hover is bounded and becomes quieter during exploded inspection',()=>{
  for(let t=0;t<60;t+=.1) {
    assert.ok(Math.abs(hoverOffset(t,0))<=.09);
    assert.ok(Math.abs(hoverOffset(t,1))<=.022);
  }
  assert.notEqual(hoverOffset(1,0),hoverOffset(3,0));
  assert.equal(hoverOffset(1,0,true),0);
  assert.equal(rotorAngle(1,1,true),0);
});
test('opposing rotors counter-rotate with a frame-rate independent angle',()=>{
  assert.equal(rotorAngle(3,-1),-rotorAngle(3,1));
  assert.notEqual(rotorAngle(1,1),rotorAngle(2,1));
});
test('GLB keeps four assemblies and attaches all rotor pivots to Chassis',async()=>{
  const file=await readFile('public/models/prana.glb');
  const length=file.readUInt32LE(12);
  const gltf=JSON.parse(file.subarray(20,20+length).toString());
  const root=gltf.nodes[0];
  assert.deepEqual(root.children.map(index=>gltf.nodes[index].name),['Chassis','Heatpipe','PCB','Battery']);
  const chassis=gltf.nodes.find(node=>node.name==='Chassis');
  assert.equal(chassis.children.length,4);
  for(const index of chassis.children) {
    const rotor=gltf.nodes[index];
    assert.match(rotor.name,/^Rotor_[1-4]$/);
    assert.equal(Math.abs(rotor.translation[0]),1.85);
    assert.equal(rotor.translation[1],.85);
    assert.equal(Math.abs(rotor.translation[2]),1.85);
    assert.equal(Math.abs(rotor.extras.spinDirection),1);
  }
});
