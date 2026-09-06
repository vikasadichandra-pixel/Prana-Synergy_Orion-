import { useLayoutEffect } from 'react';

// Fit the real visible part geometry, rather than the old oversized SVG artboard.
// Child effects update part transforms first; this effect then frames their union.
export default function useHardwareFraming(ref,progress,near) {
  useLayoutEffect(()=>{
    if(!near) return;
    const svg=ref.current?.querySelector('svg[viewBox]');
    if(!svg) return;
    const groups=[...svg.children].filter(node=>node.tagName.toLowerCase()==='g' && node.style.cursor==='pointer');
    if(!groups.length) return;
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const group of groups) {
      const bounds=group.getBBox();if(!bounds.width || !bounds.height) continue;
      if(group.dataset.partId && !group.dataset.partBounds) group.dataset.partBounds=JSON.stringify({x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height});
      // These groups are direct children of the SVG. Read their current SVG
      // transforms directly; a composited getCTM can retain the previous pose.
      let local=new DOMMatrix();
      const transforms=group.transform.baseVal;
      for(let index=0;index<transforms.numberOfItems;index++) local=local.multiply(transforms.getItem(index).matrix);
      for(const [x,y] of [[bounds.x,bounds.y],[bounds.x+bounds.width,bounds.y],[bounds.x,bounds.y+bounds.height],[bounds.x+bounds.width,bounds.y+bounds.height]]) {
        const point=new DOMPoint(x,y).matrixTransform(local);
        left=Math.min(left,point.x);right=Math.max(right,point.x);top=Math.min(top,point.y);bottom=Math.max(bottom,point.y);
      }
    }
    if(!Number.isFinite(left) || right<=left || bottom<=top) return;
    const width=right-left,height=bottom-top;
    const padX=Math.max(width*.10,20),padY=Math.max(height*.14,24);
    svg.setAttribute('viewBox',`${left-padX} ${top-padY} ${width+padX*2} ${height+padY*2}`);
  },[ref,progress,near]);
}
