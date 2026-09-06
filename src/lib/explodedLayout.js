import { PART_BOUNDS } from '../data/componentBounds.js';
import { normalizePartTiming } from './componentStory.js';

// Preserve each assembled drawing; give the detached parts their own clear space.
// Bounds can include details extending beyond a part's nominal width and height.
export function intersects(a, b, gap = 0) {
  return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}

export function layoutExplodedParts(parts, measured = PART_BOUNDS) {
  const bounds = part => measured[part.id] ?? {x:0, y:0, width:part.w, height:part.h};
  const gap = Math.max(24, Math.max(...parts.map(p=>Math.min(bounds(p).width,bounds(p).height))) * .12);
  const placed = [], destinations = new Map();
  // Keep stationary structural parts fixed, then place larger parts before fittings.
  const ordered = [...parts].sort((a,b)=>
    Number(b.start===b.end)-Number(a.start===a.end) ||
    bounds(b).width*bounds(b).height-bounds(a).width*bounds(a).height || a.id.localeCompare(b.id));
  for (const part of ordered) {
    const b=bounds(part), desired={x:part.exploded.x+b.x,y:part.exploded.y+b.y,width:b.width,height:b.height};
    let chosen=desired;
    if (placed.some(p=>intersects(desired,p,gap))) {
      const xs=[desired.x], ys=[desired.y];
      for (const p of placed) {xs.push(p.x-b.width-gap,p.x+p.width+gap);ys.push(p.y-b.height-gap,p.y+p.height+gap);}
      const dx=part.exploded.x-part.assembled.x, dy=part.exploded.y-part.assembled.y;
      let best=Infinity;
      for (const x of xs) for (const y of ys) {
        const candidate={...desired,x,y};
        if (placed.some(p=>intersects(candidate,p,gap-.01))) continue;
        const cost=(x-desired.x)**2*(Math.abs(dy)>Math.abs(dx)?4:1)+(y-desired.y)**2*(Math.abs(dx)>=Math.abs(dy)?4:1);
        if (cost<best) {best=cost;chosen=candidate;}
      }
    }
    placed.push(chosen);
    destinations.set(part.id,{x:chosen.x-b.x,y:chosen.y-b.y});
  }
  return normalizePartTiming(parts.map(part=>({...part,exploded:destinations.get(part.id)})));
}
