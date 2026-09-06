import { useLayoutEffect, useRef } from 'react';
import { smoothSubProgress } from '../lib/componentStory';

export function useExplodedParts(parts,progress,partRefs,lineRefs,containerRef) {
  const previous=useRef(-1),lineCache=useRef(new WeakMap());
  useLayoutEffect(()=>{
    if(progress===previous.current || (progress>0 && progress<1 && Math.abs(progress-previous.current)<.0005)) return;
    previous.current=progress;
    containerRef.current?.setAttribute('opacity',progress>.04?'1':'0');
    for(const part of parts) {
      const p=smoothSubProgress(progress,part.start,part.end);
      const x=part.assembled.x+(part.exploded.x-part.assembled.x)*p;
      const y=part.assembled.y+(part.exploded.y-part.assembled.y)*p;
      partRefs.current[part.id]?.setAttribute('transform',`translate(${x}, ${y})`);
      const group=lineRefs.current[part.id];
      if(!group || !part.line) continue;
      group.setAttribute('opacity',p>.02?'1':'0');
      if(p<=.02) continue;
      let line=lineCache.current.get(group);
      if(!line) {line=group.querySelector('line');if(line) lineCache.current.set(group,line);}
      if(!line) continue;
      const coordinate=value=>value==='right'?x+part.w:value==='left'?x:value;
      line.setAttribute('x1',coordinate(part.line.x1));line.setAttribute('x2',coordinate(part.line.x2));
      line.setAttribute('y1',part.line.y1);line.setAttribute('y2',part.line.y2);
    }
  },[parts,progress,partRefs,lineRefs,containerRef]);
}

// Fit the real visible part geometry, rather than the old oversized SVG artboard.
// Child effects update part transforms first; this effect then frames their union.
export default function useHardwareFraming(ref,progress,near) {
  const cache=useRef({svg:null,groups:[],bounds:new WeakMap()});
  useLayoutEffect(()=>{
    if(!near) return;
    const svg=ref.current?.querySelector('svg[viewBox]');
    if(!svg) return;
    if(cache.current.svg!==svg) cache.current={svg,groups:[...svg.children].filter(node=>node.hasAttribute('data-part-id')),bounds:new WeakMap()};
    const {groups,bounds:measured}=cache.current;
    if(!groups.length) return;
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const group of groups) {
      let bounds=measured.get(group);
      if(!bounds) {
        const box=group.getBBox();
        bounds={x:box.x,y:box.y,width:box.width,height:box.height};
        if(bounds.width && bounds.height) measured.set(group,bounds);
      }
      if(!bounds.width || !bounds.height) continue;
      if(group.dataset.partId && !group.dataset.partBounds) group.dataset.partBounds=JSON.stringify({x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height});
      // These groups are direct children of the SVG. Read their current SVG
      // transforms directly; a composited getCTM can retain the previous pose.
      let local=new DOMMatrix();
      const transforms=group.transform.baseVal;
      for(let index=0;index<transforms.numberOfItems;index++) local=local.multiply(transforms.getItem(index).matrix);
      for(const [x,y] of [[bounds.x,bounds.y],[bounds.x+bounds.width,bounds.y],[bounds.x,bounds.y+bounds.height],[bounds.x+bounds.width,bounds.y+bounds.height]]) {
        const px=local.a*x+local.c*y+local.e,py=local.b*x+local.d*y+local.f;
        left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
      }
    }
    if(!Number.isFinite(left) || right<=left || bottom<=top) return;
    const width=right-left,height=bottom-top;
    const padX=Math.max(width*.10,20),padY=Math.max(height*.14,24);
    const viewBox=`${left-padX} ${top-padY} ${width+padX*2} ${height+padY*2}`;
    if(svg.getAttribute('viewBox')!==viewBox) svg.setAttribute('viewBox',viewBox);
  },[ref,progress,near]);
}
