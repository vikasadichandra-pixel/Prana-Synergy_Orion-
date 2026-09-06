# PRĀŅA 3D asset

The website now loads `prana-survival.glb`. It contains the unchanged original drone plus two upper assemblies: `PhaseHeatpipes` (two sealed copper U-pipes, condenser fins and mounting saddles) and `AntiIcing` (a thin translucent coating section with fine surface texture and beaded water). The coating thickness and droplets are visual aids for inspection; the coating is not an opaque ice sheet. These material illustrations do not establish anti-icing performance.

Build the added layers with `node scripts/generate-survival-layers.mjs`, after generating the base if needed. The script appends data to the existing asset and leaves `prana.glb` intact. The original four assemblies keep their offsets; the added pipe and coating layers use Y travel of 2.95 and 3.55 times separation. The downloadable model includes all six assemblies.

`node --test scripts/survival-layers.test.mjs` checks preservation of the original binary data, meshes, materials, textures and rotor nodes, and verifies that both added layers remain above the chassis during scrolling.

`prana.glb` is a self-contained glTF 2.0 visual concept, Y-up, with embedded PNG textures and metallic/roughness PBR materials. Dimensions use illustrative model units, not production measurements. Performance at the displayed environmental targets has not been validated. The enlarged gold ESP32-S3 package is a design visualization, not an accurate commercial package or PCB layout.

Four named assemblies share the same origin: `Chassis`, `Heatpipe`, `PCB`, `Battery`. Preserve their X/Z transforms and change only each assembly's Y translation for explosion. The offsets are `[2.3, 0.6, -0.65, -1.9]` times the separation value returned by `inspectionPose(progress)`. Geometry is batched by material within each assembly. Materials include embedded forged-carbon flakes, machining roughness and normal maps.

Regenerate from the repository root with `node scripts/generate-prana.mjs`. No external assets or network requests are needed. The generated manifest records triangle, part and draw-call counts.

The React integration lives in `src/components/PranaWebGL.jsx`. To embed just the renderer:

```jsx
import { useRef } from 'react';
import { PranaCanvas } from './components/PranaWebGL';

function Viewer() {
  const progress = useRef(0);
  // Assign your normalized scroll progress to progress.current (0–1).
  return <div style={{ height: '80vh' }}>
    <PranaCanvas progressRef={progress} />
  </div>;
}
```

The orthographic camera starts in an equal-XYZ viewing direction. Its zoom and target change through the airframe, explosion, thermal, controller, battery and overview phases defined in `src/lib/inspection.js`. The model has a fixed 30° display yaw. OrbitControls are always active: dragging rotates the camera, while scrolling moves the eye and target together to preserve the selected angle. Wheel zoom and panning are disabled. On touch screens, horizontal swipes rotate and vertical swipes scroll; the entire canvas ancestor path uses `touch-action: pan-y`. Focus the viewer and use left/right arrows for keyboard rotation.

The first section is 620vh (520vh on phones), with a viewport-sticky stage. `usePinnedProgress` reads native document scrolling without intercepting the mouse wheel. The sequence completes at 97% and holds until the section releases. Component sections similarly finish their animations at 85% of their sticky runway. Reduced-motion styles keep the runway intact and remove CSS animation instead of disabling sticky positioning. Inline body overflow is restored after the preloader, preserving viewport stickiness.

The viewer uses local studio light cards, contact shadows and model download. The scene fills the width with environmental telemetry in a compact footer line; there is no rotation-mode switch or progress slider. Rendering pauses when the first section leaves view. Resolution follows viewport and device pixel ratio (capped at 2); this is a WebGL asset, not an 8K raster suite. Materials and geometry remain a designed visual concept.

The chassis owns four pivoted child meshes (`Rotor_1` through `Rotor_4`), with glTF extras describing their alternating spin direction. The viewer rotates these blades slowly, independent of scroll. A bounded hover offset moves all four assemblies together and becomes quieter during exploded inspection. The animated atmosphere uses a single 2D canvas for wind/dust plus CSS light fields; it does not add a second WebGL context. Idle motion is continuous, with no play/pause UI. Offscreen animation pauses to avoid unnecessary rendering. The preloader retains the original large PRĀŅA lettering, lime-to-blue fill and spherical particle field. After the fill completes, the GLB arrives and pickup cables carry that same DOM wordmark away using matched perspective projection. Aircraft and text vanish completely before the existing return flight settles into the inspection viewer and unlocks scroll and rotation.

Verification: `node --test scripts/inspection.test.mjs scripts/ambient-motion.test.mjs scripts/intro-flight.test.mjs` and `npm run build`.


