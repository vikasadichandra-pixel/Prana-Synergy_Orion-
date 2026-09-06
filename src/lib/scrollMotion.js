// One velocity curve for the document, rather than separate lagging animations.
export const SCROLL_SPEED = 1.8; // viewport heights per second
export function wheelDistance(delta, mode, height) {
  const pixels=delta*(mode===1?20:mode===2?height:1);
  return Math.sign(pixels)*Math.min(Math.abs(pixels)*.85,height*.6);
}
export function queueScroll(current,target,distance,height,max) {
  if((target-current)*distance<0) target=current;
  return Math.max(0,Math.min(max,current+Math.max(-height*1.5,Math.min(height*1.5,target-current+distance))));
}
export function stepScroll(current,target,seconds,height) {
  const dt=Math.max(0,Math.min(seconds,.05)),difference=target-current;
  if(Math.abs(difference)<.5) return target;
  const movement=Math.min(Math.abs(difference)*(1-Math.exp(-dt/.11)),height*SCROLL_SPEED*dt);
  return current+Math.sign(difference)*movement;
}
