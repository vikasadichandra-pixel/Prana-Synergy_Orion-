import test from 'node:test';
import assert from 'node:assert/strict';
import { componentStoryPose, chapterLines } from '../src/lib/componentStory.js';
import { SCROLL_SPEED, wheelDistance, queueScroll, stepScroll } from '../src/lib/scrollMotion.js';

test('names appear before hardware, with an assembled hold before explosion',()=>{
  assert.equal(componentStoryPose(0).titleOpacity,1);
  assert.equal(componentStoryPose(.2).objectOpacity,0);
  assert.equal(componentStoryPose(.4).objectOpacity,1);
  for(let i=0;i<=48;i++) assert.equal(componentStoryPose(i/100).explosion,0);
  assert.ok(componentStoryPose(.7).explosion>0);
  assert.equal(componentStoryPose(.84).explosion,1);
  assert.equal(componentStoryPose(.94).stage,'complete');
});
test('the whole document has bounded velocity, normalized input and immediate reversal',()=>{
  assert.equal(wheelDistance(120,0,800),wheelDistance(6,1,800));
  assert.equal(wheelDistance(100000,0,800),480);
  assert.equal(queueScroll(500,1500,-120,800,10000),380);
  assert.equal(queueScroll(500,1000,100000,800,10000),1700);
  assert.equal(queueScroll(0,0,-100,800,10000),0);
  for(const rate of [30,60,120]) {
    let current=0;
    for(let i=0;i<rate*3;i++) {
      const next=stepScroll(current,1200,1/rate,800);
      assert.ok(next>=current && next<=1200);
      assert.ok(next-current<=800*SCROLL_SPEED/rate+.5);
      current=next;
    }
    assert.equal(current,1200);
  }
});

test('every chapter finishes before release even under sustained high-speed scrolling',()=>{
  for(const height of [720,844,1080]) {
    const runway=height*5.6;
    let position=0,completeAt=null,releaseAt=null;
    for(let frame=0;frame<600;frame++) {
      position=stepScroll(position,runway+height,1/60,height);
      const pose=componentStoryPose(position/runway);
      if(pose.explosion===1 && completeAt===null) completeAt=frame/60;
      if(position>=runway) {releaseAt=frame/60;assert.equal(pose.explosion,1);break;}
    }
    assert.ok(releaseAt-completeAt>=.45,'The complete assembly must hold before the next chapter enters');
  }
});
test('reverse scrolling retraces the same phases and preserves long component names',()=>{
  for(let i=100;i>=0;i--) {
    const pose=componentStoryPose(i/100);
    assert.ok(pose.explosion>=0 && pose.explosion<=1);
    assert.ok(pose.objectOpacity>=0 && pose.objectOpacity<=1);
  }
  assert.equal(chapterLines('BATTERY VOLTAGE SENSOR').join(' '),'BATTERY VOLTAGE SENSOR');
  assert.deepEqual(chapterLines('ILI9341\nDISPLAY'),['ILI9341','DISPLAY']);
  assert.equal(componentStoryPose(NaN).stage,'name');
});
