import test from 'node:test';
import assert from 'node:assert/strict';
import { departurePose, arrivalPose, loaderPose, liftOffDistance, FILL_SECONDS, FLIGHT_START, REVEAL_SECONDS, REVEAL_FADE_SECONDS, DEPARTURE_SECONDS, ARRIVAL_SECONDS } from '../src/lib/introFlight.js';

test('the original blue fill completes before the drone can enter',()=>{
  for(let t=0;t<=FILL_SECONDS;t+=.01) assert.equal(loaderPose(t).flightTime,0);
  assert.equal(loaderPose(FILL_SECONDS).fill,1);
  assert.equal(loaderPose(FLIGHT_START).flightTime,0);
  assert.equal(loaderPose(FLIGHT_START+.1).fill,1);
  assert.ok(loaderPose(FLIGHT_START+.1).flightTime>0);
});

test('accent marks share the letter sweep and have no final-frame clip or fill jump',()=>{
  let previous=loaderPose(0);
  for(let i=1;i<=280;i++) {
    const pose=loaderPose(i/100);
    const clip=pose.fillClip.match(/^inset\((-?[\d.]+)% ([\d.]+)% (-?[\d.]+)% 0\)$/);
    assert.ok(clip);
    assert.equal(clip[1],'-50');assert.equal(clip[3],'-50');
    assert.ok(pose.fill>=previous.fill && pose.fill<=1);
    previous=pose;
  }
  assert.ok(loaderPose(FILL_SECONDS).fill-loaderPose(FILL_SECONDS-.00001).fill<.000001);
  assert.equal(loaderPose(FILL_SECONDS).fillClip,'inset(-50% 0% -50% 0)');
});
test('aircraft and payload vanish completely before the page reveal',()=>{
  assert.equal(departurePose(DEPARTURE_SECONDS).vanish,1);
  assert.ok(REVEAL_SECONDS>FLIGHT_START+DEPARTURE_SECONDS);
  assert.equal(departurePose(loaderPose(REVEAL_SECONDS).flightTime).vanish,1);
});

test('payload attaches only after approach and before departure',()=>{
  assert.equal(departurePose(2.2).attached,false);
  assert.equal(departurePose(2.6).attached,true);
  assert.equal(departurePose(2.6).cable,1);
  assert.equal(departurePose(2.6).x,0);
  assert.equal(departurePose(3.5).depart,0);
  assert.equal(departurePose(DEPARTURE_SECONDS).z,0);
});

test('the payload rises at full size and clears the top edge before vanishing on every viewport',()=>{
  for(const [width,height] of [[1920,1080],[1280,720],[390,844],[844,390]]) {
    const textHeight=Math.min(240,Math.max(80,width*.18)),centerY=height*.53;
    const units=30*Math.tan(Math.PI/6)/height;
    const distance=liftOffDistance(centerY,textHeight,height,units);
    let previousY=0;
    for(let t=3.6;t<=4.95;t+=.01) {
      const pose=departurePose(t,distance);
      assert.equal(pose.x,0);assert.equal(pose.z,0);
      assert.equal(pose.vanish,0);
      assert.ok(pose.y>=previousY);previousY=pose.y;
    }
    const exit=departurePose(4.95,distance);
    assert.ok(centerY+textHeight*.7-exit.y/units<0,'The lowest accent must clear the screen before hiding');
    assert.equal(exit.vanish,0);
    assert.equal(departurePose(DEPARTURE_SECONDS,distance).vanish,1);
  }
});
test('the main drone appears promptly after the upward exit',()=>{
  assert.ok(REVEAL_SECONDS-FLIGHT_START-DEPARTURE_SECONDS<=.025);
  assert.ok(REVEAL_FADE_SECONDS<=.3);
  assert.ok(arrivalPose(REVEAL_FADE_SECONDS).scale>.6);
  assert.ok(ARRIVAL_SECONDS<=1.3);
});
test('return flight grows continuously and settles exactly into the normal viewer',()=>{
  let scale=0;
  for(let t=0;t<ARRIVAL_SECONDS+.1;t+=.01) {
    const pose=arrivalPose(t);
    assert.ok(pose.scale>=scale && pose.scale<=1);
    assert.ok(Number.isFinite(pose.y) && Number.isFinite(pose.bank));
    scale=pose.scale;
  }
  const final=arrivalPose(ARRIVAL_SECONDS);
  assert.equal(final.scale,1);
  assert.equal(final.y,0);
  assert.ok(Math.abs(final.bank)<1e-12);
  assert.deepEqual(arrivalPose(20),final);
});
