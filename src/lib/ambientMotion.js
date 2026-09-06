// Seconds and radians. The inspection animation remains independent of idle time.
export function hoverOffset(time, separation, reduced = false) {
  if (reduced) return 0;
  const amplitude = .075 * (1 - separation) + .018 * separation;
  return amplitude * (Math.sin(time * .95) + .18 * Math.sin(time * 1.9));
}

export function rotorAngle(time, direction, reduced = false) {
  return reduced ? 0 : direction * ((time * 1.55) % (Math.PI * 2));
}
