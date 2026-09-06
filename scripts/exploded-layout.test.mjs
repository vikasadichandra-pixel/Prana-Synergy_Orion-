import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { layoutExplodedParts, intersects } from '../src/lib/explodedLayout.js';
import { PART_BOUNDS } from '../src/data/componentBounds.js';

test('all 23 component drawings have clearance between every fully detached part',async()=>{
  let components=0,parts=0;
  for(const name of await readdir('src/components')) {
    if(!name.endsWith('ExplodedView.jsx')) continue;
    const source=await readFile(`src/components/${name}`,'utf8');
    const match=source.match(/const \w+PARTS_CONFIG = layoutExplodedParts\((\[[\s\S]*?\n\])\);/);
    if(!match) continue;
    const original=JSON.parse(JSON.stringify(runInNewContext(`(${match[1]})`))),layout=layoutExplodedParts(original);
    const moving=layout.filter(part=>part.end>part.start);
    assert.equal(Math.min(...moving.map(part=>part.start)),0,`${name}: explosion must start on the common playhead`);
    assert.equal(Math.max(...moving.map(part=>part.end)),1,`${name}: explosion must end on the common playhead`);
    const boxes=layout.map(part=>{
      const b=PART_BOUNDS[part.id];assert.ok(b,`Measured geometry missing for ${part.id}`);
      return {...b,x:part.exploded.x+b.x,y:part.exploded.y+b.y};
    });
    for(let i=0;i<layout.length;i++) {
      assert.deepEqual(layout[i].assembled,original[i].assembled,`${name}: assembled placement changed`);
      if(layout[i].start===layout[i].end) assert.deepEqual(layout[i].exploded,original[i].exploded,`${name}: structural anchor moved`);
      for(let j=i+1;j<layout.length;j++) assert.equal(intersects(boxes[i],boxes[j],12),false,`${name}: ${layout[i].id} intersects ${layout[j].id}`);
    }
    assert.deepEqual(layoutExplodedParts(original),layout,'Layout must not depend on scroll direction or render order');
    components++;parts+=layout.length;
  }
  assert.equal(components,23);
  assert.equal(parts,Object.keys(PART_BOUNDS).length);
});
