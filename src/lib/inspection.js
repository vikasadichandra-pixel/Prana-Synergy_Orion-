export const clamp01 = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function ramp(value, start, end) {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}
export function sectionProgress(top, height, viewportHeight) {
  return clamp01(-top / Math.max(1, height - viewportHeight));
}
export const TRAVEL = [2.3, .6, -.65, -1.9];
export const UPPER_TRAVEL = { PhaseHeatpipes:2.95, AntiIcing:3.55 };
export const INSPECTION_LAYERS = ['AntiIcing','PhaseHeatpipes','Chassis','Heatpipe','PCB','Battery'];
export const LAYER_TRAVEL = [3.55,2.95,2.3,.6,-.65,-1.9];
export const INSPECTION_STOPS = [
  [0,-1],[.24,-1],[.29,0],[.34,0],[.40,1],[.45,1],
  [.51,2],[.56,2],[.62,3],[.67,3],[.73,4],[.78,4],
  [.84,5],[.91,5],[.97,-1],[1,-1],
];

export function inspectionPose(value) {
  const p = clamp01(value);
  const index=Math.max(1,INSPECTION_STOPS.findIndex(([time])=>time>=p));
  const [start,from]=INSPECTION_STOPS[index-1], [end,to]=INSPECTION_STOPS[index];
  const t=ramp(p,start,end), weights=INSPECTION_LAYERS.map((_,i)=>(from===i?1-t:0)+(to===i?t:0));
  const focus=weights.reduce((sum,weight)=>sum+weight,0);
  const selected=t<.5?from:to;
  return {
    separation:ramp(p,.12,.24), weights, focus,
    zoom:1+focus*.5,
    targetY:1.2*(1-focus)+weights.reduce((sum,weight,i)=>sum+weight*[4.64,3.88,2.53,.944,-.531,-2.153][i],0),
    phase:p<.12?0:selected>=0?selected+2:p>=.94?8:1,
  };
}

// Orthographic framing from projected geometry bounds, including rotor clearance.
export function fitViewport(width,height,extentX,extentY) {
  return Math.max(1,Math.min(width*.86/Math.max(.01,extentX),height*.82/Math.max(.01,extentY)));
}

export function openingZoomMultiplier(progress,width,height,extentX,extentY) {
  const desired=1+.4*(1-ramp(progress,.08,.24));
  const fitted=fitViewport(width,height,extentX,extentY);
  const clearance=Math.min(width*.96/(fitted*extentX),height*.96/(fitted*extentY));
  return Math.min(desired,clearance);
}
