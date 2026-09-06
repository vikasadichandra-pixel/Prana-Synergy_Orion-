import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { wheelDistance, queueScroll, stepScroll } from '../src/lib/scrollMotion.js';

// Exercise the real event-handling effect with a deterministic browser clock.
async function browserHarness(reduced=false) {
  const handlers=new Map(),frames=new Map(),body={},document={body,documentElement:{scrollHeight:100000}};
  let id=0,now=0,cleanup,scrolled=false;
  const emit=(name,event={})=>{for(const handler of handlers.get(name)??[]) handler(event);};
  const window={
    innerHeight:800,scrollY:0,matchMedia:()=>({matches:reduced}),
    addEventListener:(name,fn)=>{if(!handlers.has(name)) handlers.set(name,new Set());handlers.get(name).add(fn);},
    removeEventListener:(name,fn)=>handlers.get(name)?.delete(fn),
    scrollTo:({top})=>{window.scrollY=top;scrolled=true;},
  };
  const source=(await readFile('src/hooks/useSteadyScroll.js','utf8')).replace(/^import .*;\r?\n/gm,'').replace('export default function','function');
  runInNewContext(`${source}\nuseSteadyScroll(true);`,{
    window,document,wheelDistance,queueScroll,stepScroll,
    useEffect:fn=>{cleanup=fn();},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
    getComputedStyle:()=>({overflowY:'visible'}),
  });
  return {window,emit,frames,handlers,cleanup,
    wheel(delta,extras={}){const event={target:body,deltaX:0,deltaY:delta,deltaMode:0,cancelable:true,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extras};emit('wheel',event);return event;},
    advance(count=1){for(let i=0;i<count;i++){now+=1000/60;const batch=[...frames.values()];frames.clear();for(const fn of batch) fn(now);if(scrolled){scrolled=false;emit('scroll');}}},
  };
}

test('wheel input animates the document, reverses promptly and cancels for anchor navigation',async()=>{
  const browser=await browserHarness();
  assert.equal(browser.wheel(120).defaultPrevented,true);
  assert.equal(browser.window.scrollY,0);
  browser.advance();assert.ok(browser.window.scrollY>0 && browser.window.scrollY<102);
  browser.advance(120);assert.equal(browser.window.scrollY,102);
  browser.wheel(10000);browser.advance(5);
  const reverseFrom=browser.window.scrollY;
  browser.wheel(-120);browser.advance();assert.ok(browser.window.scrollY<reverseFrom);
  browser.window.scrollY=50000;browser.emit('hashchange');browser.advance(120);
  assert.equal(browser.window.scrollY,50000);
  browser.cleanup();assert.equal(browser.frames.size,0);
  assert.ok([...browser.handlers.values()].every(set=>set.size===0));
});

test('zoom gestures and nested scroll areas retain their native behavior',async()=>{
  const browser=await browserHarness();
  assert.equal(browser.wheel(120,{ctrlKey:true}).defaultPrevented,false);
  assert.equal(browser.wheel(120,{deltaX:200}).defaultPrevented,false);
  assert.equal(browser.wheel(120,{target:{matches:()=>true}}).defaultPrevented,false);
  assert.equal(browser.frames.size,0);browser.cleanup();
});

test('reduced motion keeps the same bounded input without an inertia animation',async()=>{
  const browser=await browserHarness(true);
  browser.wheel(10000);
  assert.equal(browser.window.scrollY,480);
  assert.equal(browser.frames.size,0);browser.cleanup();
});
