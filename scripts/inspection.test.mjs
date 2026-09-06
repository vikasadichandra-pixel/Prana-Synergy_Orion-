import test from 'node:test';
import assert from 'node:assert/strict';
import { sectionProgress, inspectionPose, TRAVEL, INSPECTION_LAYERS, fitViewport, openingZoomMultiplier } from '../src/lib/inspection.js';

test('inspection progress follows only the sticky scroll runway',()=>{
  assert.equal(sectionProgress(720,4464,720),0);
  assert.equal(sectionProgress(0,4464,720),0);
  assert.equal(sectionProgress(-1872,4464,720),.5);
  assert.equal(sectionProgress(-3744,4464,720),1);
  assert.equal(sectionProgress(-4000,4464,720),1);
});
test('sequence finishes and holds before the stage releases',()=>{
  assert.equal(inspectionPose(0).separation,0);
  assert.equal(inspectionPose(.11).separation,0);
  assert.equal(inspectionPose(.24).separation,1);
  for(const [index,p] of [.315,.425,.535,.645,.755,.875].entries()) {
    const pose=inspectionPose(p);
    assert.equal(pose.phase,index+2);
    assert.equal(pose.weights[index],1,`${INSPECTION_LAYERS[index]} must receive its own held close-up`);
    assert.equal(pose.focus,1);
  }
  assert.deepEqual(inspectionPose(.98),inspectionPose(1));
  assert.equal(inspectionPose(1).phase,8);
  assert.equal(inspectionPose(1).focus,0);
});
test('all reverse-scroll poses are deterministic, finite and keep the layers ordered',()=>{
  for(let i=100;i>=0;i--){
    const pose=inspectionPose(i/100);
    assert.ok(pose.zoom>0 && Number.isFinite(pose.targetY));
    assert.ok(pose.separation>=0 && pose.separation<=1);
    assert.ok(pose.weights.every(weight=>weight>=0 && weight<=1));
    assert.ok(pose.focus>=0 && pose.focus<=1);
    for(let layer=1;layer<4;layer++) assert.ok(TRAVEL[layer-1]*pose.separation >= TRAVEL[layer]*pose.separation);
  }
  assert.equal(inspectionPose(NaN).separation,0);
});

test('close-up fitting reserves room for projected geometry at every screen size',()=>{
  for(const [width,height] of [[1100,440],[1700,750],[390,440],[800,250]]) {
    for(const [x,y] of [[8.7,5.4],[2.4,1.8],[1.6,2.2],[3,7.6]]) {
      const zoom=fitViewport(width,height,x,y);
      assert.ok(x*zoom<=width*.86+.001);
      assert.ok(y*zoom<=height*.82+.001);
    }
  }
});

test('the opening drone is larger while rotor clearance and later close-ups stay intact',()=>{
  for(const [width,height] of [[1700,650],[1100,420],[390,440],[800,220]]) {
    const x=8.7,y=5.4,zoom=fitViewport(width,height,x,y);
    const boost=openingZoomMultiplier(0,width,height,x,y);
    assert.ok(boost>1.1 && boost<=1.18);
    assert.ok(x*zoom*boost<=width*.96+.001);
    assert.ok(y*zoom*boost<=height*.96+.001);
    let previous=boost;
    for(let i=1;i<=100;i++) {
      const current=openingZoomMultiplier(i/100,width,height,x,y);
      assert.ok(current<=previous+.000001);previous=current;
      if(i>=24) assert.equal(current,1);
    }
  }
});
