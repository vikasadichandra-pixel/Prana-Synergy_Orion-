import { ramp } from './inspection.js';

export const DEPARTURE_SECONDS = 5.1;
export const ARRIVAL_SECONDS = 1.25;
export const FILL_SECONDS = 2.8;
export const FLIGHT_START = FILL_SECONDS + .35;
export const REVEAL_SECONDS = FLIGHT_START + DEPARTURE_SECONDS + .02;
export const REVEAL_FADE_SECONDS = .3;

export function loaderPose(seconds) {
  const filling = Math.min(1, Math.max(0, seconds / FILL_SECONDS));
  const fill=(1 - Math.pow(2, -10 * filling)) / (1 - Math.pow(2, -10));
  return {
    fill,
    fillClip:`inset(-50% ${100-fill*100}% -50% 0)`,
    flightTime: Math.max(0, seconds - FLIGHT_START),
    phase: seconds < FILL_SECONDS ? 'BLUE FILL' : seconds < FLIGHT_START ? 'FILL COMPLETE' : seconds < REVEAL_SECONDS ? departurePose(seconds - FLIGHT_START).phase : 'FLIGHT SYSTEM ONLINE',
  };
}

// One timeline drives the aircraft, its payload and the departure cues.
export function liftOffDistance(centerY,textHeight,viewportHeight,worldPerPixel) {
  // Include the low accent and a full margin beyond the upper screen edge.
  return (centerY+textHeight*.75+viewportHeight*.025)*worldPerPixel;
}

export function departurePose(seconds,exitHeight=14) {
  const approach = ramp(seconds, .3, 2.2);
  const lift = ramp(seconds, 2.7, 3.5);
  const depart = ramp(seconds, 3.6, 4.95);
  return {
    approach,
    x: 5.5 * (approach - 1),
    y: 2.8 * (1 - approach) + .65 * lift + exitHeight * depart,
    z: 3 * (approach - 1),
    bank: -.2 * (1 - approach) + .018 * Math.sin(Math.PI * depart),
    pitch: -.035 * Math.sin(Math.PI * depart),
    cable: ramp(seconds, 1.9, 2.6),
    attached: seconds >= 2.6,
    payloadY: -.05 + .65 * lift + exitHeight * depart,
    depart,
    vanish: ramp(seconds, 5, DEPARTURE_SECONDS),
    phase: seconds < 2.2 ? 'APPROACH' : seconds < 3.5 ? 'PAYLOAD CAPTURE' : 'ASCENDING',
  };
}

export function arrivalPose(seconds) {
  const elapsed=Math.max(0,Math.min(1,seconds/ARRIVAL_SECONDS));
  const t=1-Math.pow(1-elapsed,3);
  return { scale: .18 + .82 * t, y: 1.6 * (1 - t), bank: -.2 * Math.sin(Math.PI * t) };
}
