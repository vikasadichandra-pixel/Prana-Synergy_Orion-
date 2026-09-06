import { clamp01, ramp, sectionProgress } from './inspection.js';

export function componentStoryPose(value) {
  const p=clamp01(value);
  const dock=ramp(p,.14,.28), reveal=ramp(p,.24,.40);
  // Each physical part supplies its own easing; keep the shared playhead linear.
  const explosion=clamp01((p-.48)/.36), exit=ramp(p,.97,1);
  return {
    titleOpacity:1-dock, titleY:-70*dock, titleScale:1-.08*dock,
    objectOpacity:reveal, objectY:72*(1-reveal), objectScale:.78+.22*reveal,
    detailsOpacity:ramp(p,.28,.42), explosion, exit,
    stage:p<.24?'name':p<.48?'assembled':p<.84?'exploding':'complete',
  };
}
export function normalizePartTiming(parts) {
  const moving=parts.filter(part=>part.end>part.start);
  if(!moving.length) return parts;
  const start=Math.min(...moving.map(part=>part.start)),end=Math.max(...moving.map(part=>part.end));
  return parts.map(part=>part.end>part.start?{...part,start:(part.start-start)/(end-start),end:(part.end-start)/(end-start)}:part);
}
export { sectionProgress };
export function chapterLines(title) {
  if(title.includes('\n')) return title.split('\n');
  const lines=[];
  for(const word of title.split(/\s+/)) {
    if(!lines.length || `${lines.at(-1)} ${word}`.length>17) lines.push(word);
    else lines[lines.length-1]+=` ${word}`;
  }
  return lines;
}
