# Synergy SIH26 Project Codebase

## src/CutoutImage.jsx

``jsx
import { useEffect, useState } from 'react';
import './image-explosion.css';

const looksLikeBackground = (r, g, b) => {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return r > 220 && g > 220 && b > 220 && spread < 24;
};

export default function CutoutImage({ src, alt, exploded = false }) {
  const [cutout, setCutout] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        if (!canvas.width || !canvas.height) return;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = pixels;
        const width = canvas.width;
        const height = canvas.height;
        const visited = new Uint8Array(width * height);
        const queue = [];
        const add = (x, y) => {
          const point = y * width + x;
          if (visited[point]) return;
          const offset = point * 4;
          if (!looksLikeBackground(data[offset], data[offset + 1], data[offset + 2])) return;
          visited[point] = 1;
          queue.push(point);
        };

        for (let x = 0; x < width; x += 1) { add(x, 0); add(x, height - 1); }
        for (let y = 1; y < height - 1; y += 1) { add(0, y); add(width - 1, y); }

        for (let cursor = 0; cursor < queue.length; cursor += 1) {
          const point = queue[cursor];
          const x = point % width;
          const y = Math.floor(point / width);
          data[point * 4 + 3] = 0;
          if (x) add(x - 1, y);
          if (x < width - 1) add(x + 1, y);
          if (y) add(x, y - 1);
          if (y < height - 1) add(x, y + 1);
        }

        context.putImageData(pixels, 0, 0);
        if (!cancelled) setCutout(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Could not process cutout image:', err);
      }
    };
    image.src = src;
    return () => { cancelled = true; };
  }, [src]);

  const imageSource = cutout || src;
  if (!exploded) return <img className="cutout" src={imageSource} alt={alt} />;

  return <div className="image-explosion" role="img" aria-label={alt}>
    <img className="slice slice-left" src={imageSource} alt="" />
    <img className="slice slice-center" src={imageSource} alt="" />
    <img className="slice slice-right" src={imageSource} alt="" />
  </div>;
}

``

## src/horizontal-explode.css

``css
/* Horizontal exploded axis: real component in the center, reserved assembly layers on either side. */
.view .ghost.top,
.view .ghost.bottom {
  top: 50%;
  bottom: auto;
  width: 104px;
  height: 82px;
  transform: translateY(-50%);
}

.view .ghost.top { left: 9%; }
.view .ghost.bottom { left: auto; right: 9%; }

.view .guide.left,
.view .guide.right {
  top: 50%;
  transform: translateY(-50%);
}

.view .guide.left { left: 7%; }
.view .guide.right { right: 7%; }

.view .guide.left i,
.view .guide.right i {
  width: 160px;
  height: 1px;
  border-left: 0;
  border-top: 1px dashed #a2a7a2;
  top: 9px;
}

.view .guide.left i { left: 20px; }
.view .guide.right i { right: 20px; left: auto; }

.view .guide.left b,
.view .guide.right b {
  width: 1px;
  height: 42px;
  top: 9px;
}

.view .guide.left b { left: 180px; }
.view .guide.right b { right: 180px; }

.view .guide.center {
  top: 16%;
}

.view .guide.center i { height: 145px; }

.view .component-photo,
.view .photo {
  width: min(48%, 350px);
}

@media (max-width: 830px) {
  .view .ghost.top { left: 7%; }
  .view .ghost.bottom { right: 7%; }
  .view .ghost.top,
  .view .ghost.bottom { width: 58px; height: 56px; }
  .view .guide.left i,
  .view .guide.right i { width: 86px; }
  .view .guide.left b { left: 106px; }
  .view .guide.right b { right: 106px; }
  .view .photo { width: 56%; }
}

``

## src/image-explosion.css

``css
.image-explosion {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-explosion .slice {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 13px rgba(10, 10, 10, .24));
  transition: transform .65s cubic-bezier(.2, .8, .2, 1);
}

.image-explosion .slice-left {
  clip-path: inset(0 66.5% 0 0);
  transform: translateX(-31%);
}

.image-explosion .slice-center {
  clip-path: inset(0 33.3% 0 33.3%);
  transform: translateY(-5%);
}

.image-explosion .slice-right {
  clip-path: inset(0 0 0 66.5%);
  transform: translateX(31%);
}

.view:hover .slice-left { transform: translateX(-39%); }
.view:hover .slice-center { transform: translateY(-10%); }
.view:hover .slice-right { transform: translateX(39%); }

@media (max-width: 830px) {
  .image-explosion .slice-left { transform: translateX(-23%); }
  .image-explosion .slice-right { transform: translateX(23%); }
}

``

## src/main.jsx

``jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronDown, Cpu, Layers3 } from 'lucide-react';
import { scenes } from './data/scenes';
import ExplodedComponentSection from './components/ExplodedComponentSection';
import './styles.css';
function App(){return <main><header><a href="#top">NEXUS <i>HARDWARE</i></a><span>ENGINEERING INSPECTION / 01</span><span className="nominal">SYSTEM STATUS / NOMINAL</span></header><section className="hero" id="top"><div className="hero-grid"/><div className="hero-copy"><p>COMPLETE HARDWARE ARCHITECTURE</p><h1>ENGINEERED<br/>TO <em>SURVIVE.</em></h1><span>A component-by-component engineering inspection of the complete hardware system.</span></div><div className="hero-object"><Layers3 size={62}/><i/><Cpu size={112}/><i/><b>CONTROL · POWER · SENSORS<br/>THERMAL · DATA · PROTECTION</b></div><footer>SCROLL TO INSPECT <ChevronDown size={17}/></footer></section><nav aria-label="Component progression"><i/>{scenes.map(scene=><a key={scene.index} href={`#scene-${scene.index}`}>{scene.index}</a>)}</nav>{scenes.map(scene=><div id={`scene-${scene.index}`} key={scene.index}><ExplodedComponentSection scene={scene}/></div>)}<section className="complete"><p>20 / COMPLETE SYSTEM</p><h2>ONE SYSTEM.<br/>MANY LAYERS<br/>OF PROTECTION.</h2><div>{['CONTROL','POWER','SENSORS','THERMAL','COMMUNICATION','PROTECTION','DATA'].map(item=><span key={item}>{item}</span>)}</div></section></main>};createRoot(document.getElementById('root')).render(<App/>);

``

## src/overrides.css

``css
.piece.dim { opacity: .55; }

``

## src/styles.css

``css
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap");
:root {
  --bg: #0c0f0f;
  --ink: #ecf0ea;
  --line: rgba(222, 232, 224, 0.16);
  --accent: #c9e87b;
  --orange: #ff8158;
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Manrope, Arial, sans-serif;
  overflow-x: hidden;
}
header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 20;
  height: 68px;
  padding: 0 5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  background: rgba(12, 15, 15, 0.82);
  backdrop-filter: blur(16px);
  color: #a8b0aa;
  font:
    9px "DM Mono",
    monospace;
  letter-spacing: 1px;
}
header a {
  font:
    800 13px Manrope,
    sans-serif;
  letter-spacing: 1.3px;
  color: var(--ink);
  text-decoration: none;
}
header a i {
  color: var(--orange);
  font-style: normal;
}
.nominal:before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 11px var(--accent);
}
.hero {
  height: 100vh;
  min-height: 700px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 100px 13vw;
}
.hero-grid,
.scene-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(235, 244, 236, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(235, 244, 236, 0.035) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: radial-gradient(ellipse at center, #000 8%, transparent 72%);
}
.hero-copy {
  position: relative;
  z-index: 2;
}
.hero p,
.scene-copy > p,
.complete > p {
  color: var(--accent);
  font:
    10px "DM Mono",
    monospace;
  letter-spacing: 1.2px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}
.hero h1,
.complete h2 {
  font-size: clamp(46px, 6vw, 100px);
  line-height: 0.91;
  margin: 21px 0;
  font-weight: 700;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}
.hero h1 em {
  font-style: normal;
  color: var(--orange);
}
.hero-copy > span {
  display: block;
  width: 100%;
  max-width: 100%;
  color: #a9b2ac;
  font-size: 14px;
  line-height: 1.8;
}
.hero-object {
  position: absolute;
  right: 15vw;
  top: 50%;
  width: 310px;
  height: 410px;
  transform: translateY(-50%);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: var(--accent);
  box-shadow: 0 0 100px rgba(201, 232, 123, 0.08);
}
.hero-object:before,
.hero-object:after {
  content: "";
  position: absolute;
  width: 1px;
  height: 55px;
  background: var(--orange);
}
.hero-object:before {
  top: -55px;
}
.hero-object:after {
  bottom: -55px;
}
.hero-object i {
  display: block;
  width: 1px;
  height: 33px;
  background: var(--orange);
}
.hero-object b {
  text-align: center;
  color: #9da7a0;
  font:
    8px "DM Mono",
    monospace;
  line-height: 1.8;
  letter-spacing: 1px;
}
.hero footer {
  position: absolute;
  left: 13vw;
  bottom: 35px;
  display: flex;
  gap: 9px;
  align-items: center;
  color: #a6afa8;
  font:
    9px "DM Mono",
    monospace;
  letter-spacing: 0.9px;
}
nav {
  position: fixed;
  z-index: 12;
  right: 2.4vw;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
nav > i {
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 9px;
  width: 1px;
  background: #34403a;
}
nav a {
  position: relative;
  width: 19px;
  height: 19px;
  display: grid;
  place-items: center;
  border: 1px solid #34403a;
  background: #101313;
  color: #79837c;
  text-decoration: none;
  font:
    7px "DM Mono",
    monospace;
  transition: 0.2s;
}
nav a:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.scene {
  height: 155vh;
  position: relative;
}
.scene-sticky {
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 62% 49%,
    #19201e 0%,
    #101313 45%,
    #090b0b 100%
  );
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.scene-content {
  height: 100%;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(260px, 0.65fr) minmax(600px, 1.35fr);
  gap: 5vw;
  align-items: center;
  padding: 95px 9vw 55px 13vw;
}
.scene-copy {
  width: 100%;
  max-width: 100%;
  z-index: 5;
}
.scene-copy > p {
  margin: 0 0 19px;
}
.scene-copy h2 {
  margin: 0;
  font-size: clamp(32px, 4vw, 58px);
  line-height: 0.95;
  text-transform: uppercase;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}
.scene-copy > b {
  display: block;
  margin: 19px 0;
  color: var(--orange);
  font:
    600 10px "DM Mono",
    monospace;
  letter-spacing: 1px;
}
.scene-copy article {
  margin: 0;
  color: #adb6af;
  font-size: 13px;
  line-height: 1.8;
}
.scene-copy dl {
  display: flex;
  gap: 22px;
  margin: 27px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
dt {
  font:
    8px "DM Mono",
    monospace;
  letter-spacing: 0.7px;
  color: #768078;
}
dd {
  margin: 5px 0 0;
  font:
    9px "DM Mono",
    monospace;
  letter-spacing: 0.5px;
  color: #dbe4dc;
}
.scene-copy small {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 23px;
  color: #89938c;
  font:
    8px "DM Mono",
    monospace;
  letter-spacing: 0.7px;
}
.visual-stage {
  height: min(72vh, 650px);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.visual-stage:before,
.visual-stage:after {
  content: "";
  position: absolute;
  background: rgba(224, 240, 226, 0.11);
}
.visual-stage:before {
  width: 1px;
  height: 100%;
  left: 50%;
}
.visual-stage:after {
  height: 1px;
  width: 100%;
  top: 50%;
}
.inspection-object {
  position: relative;
  width: min(650px, 100%);
  height: 100%;
  z-index: 2;
}
.assembly-lines {
  position: absolute;
  left: 50%;
  top: 15%;
  bottom: 15%;
  width: 1px;
  z-index: 1;
  transform: translateX(-50%);
  border-left: 1px dashed rgba(201, 232, 123, 0.55);
}
.assembly-lines i {
  position: absolute;
  left: -4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
}
.assembly-lines i:nth-child(1) {
  top: 0;
}
.assembly-lines i:nth-child(2) {
  top: 50%;
}
.assembly-lines i:nth-child(3) {
  bottom: 0;
}
.layer {
  position: absolute;
  left: 50%;
  z-index: 2;
  width: 270px;
  height: 210px;
  transform: translate(-50%, -50%) scale(0.86);
  opacity: 0;
  filter: blur(6px);
  transition:
    transform 1.15s cubic-bezier(0.18, 0.9, 0.2, 1),
    opacity 0.65s,
    filter 0.65s;
}
.layer .image-explosion {
  width: 100%;
  height: 100%;
}
.layer > span {
  position: absolute;
  z-index: 4;
  left: calc(100% + 18px);
  top: 50%;
  padding-left: 9px;
  transform: translateY(-50%);
  white-space: nowrap;
  border-left: 1px solid var(--accent);
  color: #bfcec2;
  font:
    8px "DM Mono",
    monospace;
  letter-spacing: 0.7px;
  opacity: 0;
  transition: opacity 0.4s 0.55s;
}
.layer > span:before {
  content: "";
  position: absolute;
  right: 100%;
  top: 50%;
  width: 18px;
  height: 1px;
  background: var(--accent);
}
.layer-one {
  top: 49%;
}
.layer-two {
  top: 51%;
}
.layer-three {
  top: 53%;
}
.scene.active .layer {
  opacity: 1;
  filter: none;
}
.scene.active .layer-one {
  transform: translate(-50%, -50%) translateY(-185px) rotate(-2deg);
}
.scene.active .layer-two {
  transform: translate(-50%, -50%) translateX(16px) scale(1.07);
}
.scene.active .layer-three {
  transform: translate(-50%, -50%) translateY(185px) rotate(2deg);
}
.scene.active .layer > span {
  opacity: 1;
}
.component-name {
  position: absolute;
  z-index: 5;
  top: 6%;
  left: 50%;
  transform: translateX(-50%);
  color: #e3ebe3;
  font:
    9px "DM Mono",
    monospace;
  letter-spacing: 1px;
  white-space: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  max-width: 90vw;
  text-align: center;
}
.component-name i {
  display: inline-block;
  width: 22px;
  height: 1px;
  margin-left: 8px;
  vertical-align: middle;
  background: var(--orange);
}
.wave {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  border: 1px solid rgba(201, 232, 123, 0.34);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.3);
  opacity: 0;
}
.wave-one {
  width: 400px;
  height: 400px;
}
.wave-two {
  width: 550px;
  height: 550px;
}
.scene.active .wave {
  animation: wave 2.8s ease-out infinite;
}
.scene.active .wave-two {
  animation-delay: 1.4s;
}
@keyframes wave {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.35);
  }
  20% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}
.energy-flow {
  position: absolute;
  z-index: 5;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translate(-50%, -50%);
  color: var(--accent);
}
.energy-flow i {
  width: 250px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  background-size: 200% 100%;
}
.scene.active .energy-flow i {
  animation: energy 1.5s linear infinite;
}
@keyframes energy {
  to {
    background-position: -200% 0;
  }
}
.heat-flow {
  position: absolute;
  left: 50%;
  bottom: 5%;
  z-index: 4;
  display: flex;
  gap: 12px;
  transform: translateX(-50%);
}
.heat-flow i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--orange);
  opacity: 0;
}
.scene.active .heat-flow i {
  animation: heat 1.7s ease-out infinite;
}
.scene.active .heat-flow i:nth-child(2) {
  animation-delay: 0.3s;
}
.scene.active .heat-flow i:nth-child(3) {
  animation-delay: 0.6s;
}
@keyframes heat {
  from {
    opacity: 0;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(-170px);
  }
}
.concept-layer {
  position: relative;
  z-index: 4;
  width: min(620px, 100%);
  height: 78%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255, 129, 88, 0.75);
  background: repeating-linear-gradient(
    135deg,
    transparent 0 18px,
    rgba(255, 129, 88, 0.04) 18px 19px
  );
  color: var(--orange);
}
.tbd-line {
  display: flex;
  align-items: center;
  gap: 25px;
}
.tbd-line i {
  width: 110px;
  height: 1px;
  background: var(--orange);
}
.tbd-line b {
  width: 16px;
  height: 16px;
  border: 1px solid var(--orange);
  border-radius: 50%;
}
.tbd-core {
  display: grid;
  place-items: center;
  width: 150px;
  height: 150px;
  margin: 31px 0;
  border: 1px dashed var(--orange);
  border-radius: 50%;
  font:
    500 24px "DM Mono",
    monospace;
  letter-spacing: 1px;
}
.concept-layer p {
  text-align: center;
  font:
    9px "DM Mono",
    monospace;
  line-height: 1.8;
  letter-spacing: 1px;
}
.concept-layer.resilience {
  display: flex;
  flex-direction: row;
  gap: 45px;
  border-color: rgba(201, 232, 123, 0.55);
  background: rgba(201, 232, 123, 0.03);
  color: var(--accent);
}
.shield {
  width: 190px;
  height: 190px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 13px;
  box-shadow: 0 0 60px rgba(201, 232, 123, 0.12);
}
.shield span,
.integrity {
  font:
    8px "DM Mono",
    monospace;
  letter-spacing: 0.8px;
  text-align: center;
}
.integrity {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding-left: 25px;
  border-left: 1px solid var(--line);
  text-align: left;
  color: #c6d2c7;
}
.integrity b {
  color: var(--accent);
  font-weight: 400;
}
.complete {
  min-height: 100vh;
  padding: 130px 13vw;
  background: #111515;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.complete h2 {
  margin: 20px 0 42px;
}
.complete > div {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.complete span {
  padding: 9px 11px;
  border: 1px solid #47514b;
  color: #c4cdc5;
  font:
    9px "DM Mono",
    monospace;
  letter-spacing: 0.8px;
}
@media (max-width: 850px) {
  header {
    padding: 0 21px;
  }
  header > span:nth-child(2),
  nav {
    display: none;
  }
  .hero {
    padding: 110px 25px;
  }
  .hero h1 {
    font-size: 55px;
  }
  .hero-object {
    right: 25px;
    bottom: 75px;
    top: auto;
    transform: none;
    width: 185px;
    height: 210px;
    opacity: 0.55;
  }
  .hero-object svg:nth-of-type(2) {
    width: 75px;
  }
  .scene {
    height: 135vh;
  }
  .scene-content {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 90px 24px 35px;
    gap: 28px;
  }
  .scene-copy {
    max-width: 330px;
  }
  .scene-copy h2 {
    font-size: 38px;
  }
  .visual-stage {
    height: 48vh;
    min-height: 375px;
  }
  .layer {
    width: 205px;
    height: 160px;
  }
  .scene.active .layer-one {
    transform: translate(-50%, -50%) translateY(-120px);
  }
  .scene.active .layer-three {
    transform: translate(-50%, -50%) translateY(120px);
  }
  .layer > span {
    font-size: 6px;
    left: calc(100% + 8px);
  }
  .layer > span:before {
    width: 8px;
  }
  .component-name {
    top: 2%;
  }
  .concept-layer {
    height: 90%;
    width: 100%;
  }
  .concept-layer.resilience {
    gap: 18px;
  }
  .shield {
    width: 130px;
    height: 130px;
  }
  .integrity {
    font-size: 7px;
    padding-left: 14px;
  }
  .complete {
    padding: 110px 25px;
  }
  .complete h2 {
    font-size: 52px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *:after,
  *:before {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .layer {
    opacity: 1;
    filter: none;
  }
  .layer-one {
    transform: translate(-50%, -50%) translateY(-185px) !important;
  }
  .layer-two {
    transform: translate(-50%, -50%) !important;
  }
  .layer-three {
    transform: translate(-50%, -50%) translateY(185px) !important;
  }
}

``

## src/components/AntennaExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// LoRa / RF High-Gain Magnetic Mount Whip Antenna physical discrete parts
// Coordinates in 1200 x 540 artboard
const ANTENNA_PARTS_CONFIG = [
  {
    id: 'ant_tip',
    name: 'PROTECTIVE RUBBER MAST TIP CAP',
    code: 'ANT-CAP-EPDM-WEATHER',
    spec: 'UV-resistant molded EPDM rubber tapered protective end cap to prevent corona discharge and tip injury',
    role: 'WEATHERPROOFING & CORONA ARREST',
    w: 45,
    h: 50,
    assembled: { x: 500, y: 225 },
    exploded: { x: 50, y: 225 },
    start: 0.05,
    end: 0.42,
    step: 1,
    line: { x1: 'right', y1: 250, x2: 500, y2: 250 }
  },
  {
    id: 'ant_rod',
    name: 'STAINLESS STEEL RADIATOR WHIP MAST',
    code: 'ANT-WHIP-17-7PH-STEEL',
    spec: '17-7 PH hardened stainless steel black-passivated radiating whip element tuned for 868/915 MHz Sub-GHz',
    role: 'PRIMARY RF RADIATING ELEMENT',
    w: 270,
    h: 30,
    assembled: { x: 500, y: 235 },
    exploded: { x: 145, y: 235 },
    start: 0.10,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 250, x2: 500, y2: 250 }
  },
  {
    id: 'ant_coupler',
    name: 'THREADED COUPLING COLLAR BUSHING',
    code: 'ANT-COUPLER-M3-STEEL',
    spec: 'Precision CNC-machined steel threaded adapter bushing joining the whip mast to the loading inductor',
    role: 'MECHANICAL & RF CURRENT COUPLING',
    w: 45,
    h: 40,
    assembled: { x: 510, y: 230 },
    exploded: { x: 460, y: 230 },
    start: 0.16,
    end: 0.62,
    step: 3,
    line: { x1: 'right', y1: 250, x2: 510, y2: 250 }
  },
  {
    id: 'ant_coil',
    name: 'CENTER-LOADED HELICAL MATCHING INDUCTOR',
    code: 'ANT-COIL-HIGH-Q-SPRING',
    spec: 'Spring-wound steel loading coil for 50Ω impedance matching, electrical height loading, and high Q factor',
    role: 'IMPEDANCE MATCHING & RESONANCE',
    w: 125,
    h: 70,
    assembled: { x: 510, y: 215 },
    exploded: { x: 550, y: 215 },
    start: 0,
    end: 0,
    step: 4
  },
  {
    id: 'ant_base',
    name: 'MAGNETIC BASE WITH COAX CABLE & SMA PLUG',
    code: 'ANT-BASE-MAG-RG174-SMA',
    spec: 'Conical zinc base with NdFeB magnet, brass receiver stud, 3m bundled RG-174 coax, and gold SMA male connector',
    role: 'GROUND PLANE MOUNT & FEEDLINE',
    w: 390,
    h: 220,
    assembled: { x: 520, y: 140 },
    exploded: { x: 740, y: 140 },
    start: 0.08,
    end: 0.50,
    step: 5,
    line: { x1: 520, y1: 250, x2: 'left', y2: 250 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function AntennaExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    ANTENNA_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="antenna-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 540 */}
        <svg
          viewBox="0 0 1200 540"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="ant-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="ant-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            {/* Metal and rubber gradients */}
            <linearGradient id="black-rod-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#454b52" />
              <stop offset="40%" stopColor="#25282c" />
              <stop offset="70%" stopColor="#15171a" />
              <stop offset="100%" stopColor="#30353b" />
            </linearGradient>

            <linearGradient id="brass-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fae78b" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#9a7615" />
            </linearGradient>

            <linearGradient id="spring-wire-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22252a" />
              <stop offset="30%" stopColor="#4b535d" />
              <stop offset="70%" stopColor="#272a2f" />
              <stop offset="100%" stopColor="#16181b" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {ANTENNA_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id.includes('coil') || part.id.includes('base');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#ant-marker-orange)' : 'url(#ant-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* 5 Physical Discrete Antenna Sub-Assemblies */}
          {ANTENNA_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: PROTECTIVE MAST TIP CAP */}
                  {part.id === 'ant_tip' && (
                    <g>
                      {/* Tapered black rubber cap */}
                      <path d="M 0,25 Q 5,16 20,17 L 45,21 L 45,29 L 20,33 Q 5,34 0,25 Z" fill="#1b1d20" stroke="#373d45" strokeWidth="1.2" />
                      {/* Inner socket hole on the right edge */}
                      <ellipse cx="44" cy="25" rx="3" ry="5" fill="#0d0e10" />
                    </g>
                  )}

                  {/* PART 2: RADIATING STEEL WHIP ROD */}
                  {part.id === 'ant_rod' && (
                    <g>
                      {/* Long cylindrical rod */}
                      <rect x="0" y="9" width={part.w} height="12" rx="2" fill="url(#black-rod-gradient)" stroke="#373d45" strokeWidth="0.8" />
                      {/* Longitudinal highlight reflection */}
                      <line x1="2" y1="12" x2={part.w - 2} y2="12" stroke="#5d6570" strokeWidth="1.2" opacity="0.6" />
                      {/* Threaded stud at right tip */}
                      <rect x={part.w - 18} y="11" width="18" height="8" rx="1" fill="#7d8692" stroke="#444" strokeWidth="0.5" />
                      {[0, 3, 6, 9, 12, 15].map((t) => (
                        <line key={t} x1={part.w - 18 + t} y1="11" x2={part.w - 18 + t} y2="19" stroke="#333" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {/* PART 3: THREADED COUPLING COLLAR */}
                  {part.id === 'ant_coupler' && (
                    <g>
                      {/* Hexagonal / knurled collar */}
                      <rect x="0" y="8" width={part.w} height="24" rx="2" fill="#24282e" stroke="#444b54" strokeWidth="1.2" />
                      {/* Internal threads visible at both ends */}
                      <rect x="2" y="12" width="6" height="16" fill="#131518" />
                      <rect x={part.w - 8} y="12" width="6" height="16" fill="#131518" />
                      {/* Center grip knurling */}
                      {[12, 16, 20, 24, 28, 32].map((k) => (
                        <line key={k} x1={k} y1="8" x2={k} y2="32" stroke="#383f47" strokeWidth="1.5" />
                      ))}
                    </g>
                  )}

                  {/* PART 4: CENTER-LOADED HELICAL COIL */}
                  {part.id === 'ant_coil' && (
                    <g>
                      {/* Front threaded connector stud */}
                      <rect x="0" y="30" width="16" height="10" rx="1" fill="#6d7682" stroke="#333" strokeWidth="0.5" />
                      {/* Helical wound spring loops (10 spring coils) */}
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((coilIdx) => {
                        const cx = 20 + coilIdx * 12;
                        return (
                          <g key={coilIdx}>
                            <ellipse cx={cx} cy="35" rx="7" ry="28" fill="none" stroke="url(#spring-wire-gradient)" strokeWidth="6" />
                            {/* Spring highlight */}
                            <ellipse cx={cx} cy="35" rx="7" ry="28" fill="none" stroke="#778494" strokeWidth="1.5" strokeDasharray="14 30" opacity="0.7" />
                          </g>
                        );
                      })}
                      {/* Base threaded mounting post */}
                      <rect x="110" y="29" width="15" height="12" rx="1" fill="#6d7682" stroke="#333" strokeWidth="0.5" />
                      {[2, 5, 8, 11].map((t) => (
                        <line key={t} x1={110 + t} y1="29" x2={110 + t} y2="41" stroke="#333" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {/* PART 5: MAGNETIC BASE ASSEMBLY */}
                  {part.id === 'ant_base' && (
                    <g>
                      {/* Female Brass Thread Receiver on top of pedestal */}
                      <rect x="10" y="98" width="18" height="24" rx="2" fill="url(#brass-gold-gradient)" stroke="#8c6a12" strokeWidth="1" />
                      <circle cx="19" cy="110" r="4" fill="#222" />

                      {/* Conical Magnetic Pedestal Housing */}
                      <path
                        d="M 26,104 L 75,70 Q 85,65 95,65 L 140,65 Q 150,65 155,75 L 175,145 Q 180,155 170,155 L 45,155 Q 35,155 32,145 Z"
                        fill="#1c1f24"
                        stroke="#383e47"
                        strokeWidth="2"
                      />
                      {/* Pedestal grip contour flutes */}
                      <line x1="85" y1="75" x2="65" y2="145" stroke="#2c323b" strokeWidth="3" />
                      <line x1="115" y1="75" x2="105" y2="145" stroke="#2c323b" strokeWidth="3" />
                      <line x1="140" y1="75" x2="145" y2="145" stroke="#2c323b" strokeWidth="3" />

                      {/* Rubber base anti-scratch pad at bottom */}
                      <rect x="35" y="152" width="145" height="8" rx="2" fill="#0d0e10" stroke="#222" />

                      {/* Coiled Bundled RG-174 Coaxial Cable Bundle */}
                      <g transform="translate(165, 55)">
                        {/* Coiled loops */}
                        {[0, 1, 2, 3].map((loop) => (
                          <ellipse
                            key={loop}
                            cx="70"
                            cy={50 + loop * 4}
                            rx={45 + loop * 2}
                            ry={32 + loop * 2}
                            fill="none"
                            stroke="#181a1d"
                            strokeWidth="8"
                          />
                        ))}
                        {/* Cable ties / velcro wraps */}
                        <rect x="62" y="14" width="16" height="14" rx="2" fill="#2d333b" stroke="#444" />
                        <rect x="62" y="76" width="16" height="14" rx="2" fill="#2d333b" stroke="#444" />

                        {/* Coax wire extending to SMA connector */}
                        <path d="M 115,50 Q 140,50 155,75 T 175,95" fill="none" stroke="#181a1d" strokeWidth="8" strokeLinecap="round" />

                        {/* Heatshrink boot */}
                        <rect x="165" y="88" width="18" height="14" rx="2" fill="#121315" stroke="#333" />

                        {/* Gold SMA Male RF Connector */}
                        <rect x="183" y="85" width="28" height="20" rx="2" fill="url(#brass-gold-gradient)" stroke="#8c6a12" strokeWidth="1" />
                        {/* Knurled Hex Nut ridges */}
                        {[188, 194, 200, 206].map((x) => (
                          <line key={x} x1={x} y1="85" x2={x} y2="105" stroke="#a47e17" strokeWidth="1.5" />
                        ))}
                        {/* Male center pin cavity */}
                        <rect x="211" y="88" width="10" height="14" rx="1" fill="#333" />
                        <rect x="216" y="93" width="7" height="4" rx="1" fill="url(#brass-gold-gradient)" />
                      </g>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? ANTENNA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'LORA WHIP ANTENNA SYSTEM · 5 DISCRETE RF SUB-ASSEMBLIES'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? ANTENNA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? ANTENNA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/BatteryExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// 11.1V 3000mAh 18650 3S1P Li-ion Battery Pack physical discrete parts
// Coordinates in 1200 x 600 artboard
const BATTERY_PARTS_CONFIG = [
  {
    id: 'bat_pvc',
    name: 'BLUE PVC HEAT-SHRINK SLEEVE WITH SPEC LABEL',
    code: 'BATT-WRAP-PVC-3S1P',
    spec: '0.12mm high-dielectric blue PVC shrink jacket with 11.1V 3000mAh technical specification label',
    role: 'ENVIRONMENTAL & DIELECTRIC ENCLOSURE',
    w: 140,
    h: 220,
    assembled: { x: 505, y: 170 },
    exploded: { x: 45, y: 170 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 280, x2: 505, y2: 280 }
  },
  {
    id: 'bat_cells',
    name: '3S1P 18650 LI-ION CELL BANK',
    code: 'CELL-18650-30Q-3S1P',
    spec: '3x cylindrical 3.7V 3000mAh purple 18650 Li-ion cells in series with ABS spacer brackets & pure nickel busbars',
    role: 'ELECTROCHEMICAL ENERGY CORE',
    w: 140,
    h: 220,
    assembled: { x: 505, y: 170 },
    exploded: { x: 210, y: 170 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 280, x2: 505, y2: 280 }
  },
  {
    id: 'bat_bms',
    name: '3S 20A BMS PROTECTION CIRCUIT BOARD',
    code: 'BMS-3S-20A-PCM',
    spec: 'Emerald FR-4 PCB with cell overvoltage, undervoltage, overcurrent monitoring IC & 4 power MOSFET switches',
    role: 'BATTERY MANAGEMENT & CELL SAFETY',
    w: 115,
    h: 200,
    assembled: { x: 518, y: 180 },
    exploded: { x: 375, y: 180 },
    start: 0.18,
    end: 0.62,
    step: 3,
    line: { x1: 'right', y1: 280, x2: 518, y2: 280 }
  },
  {
    id: 'bat_foam',
    name: 'SILICONE THERMAL DAMPING FOAM PAD',
    code: 'FOAM-PAD-SIL-DAMP',
    spec: '1.5mm closed-cell white silicone foam buffer for mechanical shock absorption and cell thermal relief',
    role: 'VIBRATION & EXPANSION BUFFER',
    w: 110,
    h: 200,
    assembled: { x: 520, y: 180 },
    exploded: { x: 515, y: 180 },
    start: 0,
    end: 0,
    step: 4
  },
  {
    id: 'bat_kapton',
    name: 'HIGH-TEMP KAPTON POLYIMIDE TAPE',
    code: 'TAPE-KAPTON-POLY-15MM',
    spec: '260°C rated amber polyimide adhesive film for terminal dielectric isolation and busbar retention',
    role: 'ELECTRICAL ARC & SHORT ISOLATION',
    w: 95,
    h: 180,
    assembled: { x: 528, y: 190 },
    exploded: { x: 650, y: 190 },
    start: 0.18,
    end: 0.62,
    step: 5,
    line: { x1: 528, y1: 280, x2: 'left', y2: 280 }
  },
  {
    id: 'bat_wire',
    name: '18AWG DC BARREL WIRE HARNESS',
    code: 'WIRE-18AWG-DC-MALE',
    spec: 'Red/black high-strand silicone copper leads terminated with 5.5mm x 2.1mm male DC barrel power plug',
    role: 'DC POWER DELIVERY INTERFACE',
    w: 140,
    h: 170,
    assembled: { x: 505, y: 195 },
    exploded: { x: 770, y: 195 },
    start: 0.12,
    end: 0.55,
    step: 6,
    line: { x1: 505, y1: 280, x2: 'left', y2: 280 }
  },
  {
    id: 'bat_socket',
    name: 'DC BARREL JACK CHASSIS CONNECTOR',
    code: 'CONN-DC-BARREL-FEMALE-5.5',
    spec: 'Ribbed black molded female inline DC coaxial socket adapter with internal spring-loaded brass contact sleeve',
    role: 'EXTERNAL CHARGE & LOAD COUPLER',
    w: 105,
    h: 130,
    assembled: { x: 522, y: 215 },
    exploded: { x: 935, y: 215 },
    start: 0.05,
    end: 0.45,
    step: 7,
    line: { x1: 522, y1: 280, x2: 'left', y2: 280 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ─── STATIC SVG PART DRAWINGS (memoized, never re-rendered) ────────────────
const PvcSleeve = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="12" fill="url(#pvc-blue-gradient)" stroke="#3985ea" strokeWidth="1.5" />
    <line x1={w * 0.33} y1="4" x2={w * 0.33} y2={h - 4} stroke="#103c7a" strokeWidth="2.5" opacity="0.4" />
    <line x1={w * 0.66} y1="4" x2={w * 0.66} y2={h - 4} stroke="#103c7a" strokeWidth="2.5" opacity="0.4" />
    <rect x="12" y="24" width={w - 24} height={h - 48} rx="4" fill="#ffffff" stroke="#c0c8d0" strokeWidth="1" />
    <rect x="12" y="24" width={w - 24} height="42" rx="4" fill="#133d82" />
    <text x={w / 2} y="44" fill="#ffffff" fontFamily="'DM Mono', monospace" fontWeight="900" fontSize="13" textAnchor="middle" letterSpacing="0.5">
      11.1V 3000 MAH
    </text>
    <text x={w / 2} y="58" fill="#a4cbff" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="9" textAnchor="middle">
      RECHARGEABLE BATTERY
    </text>
    <text x="20" y="86" fill="#111" fontFamily="'DM Mono', monospace" fontWeight="700" fontSize="9">TYPE: 18650 3S1P</text>
    <text x="20" y="102" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">NOM: 11.1V / 33.3Wh</text>
    <text x="20" y="117" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">MAX CHARGE: 12.6V</text>
    <text x="20" y="132" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">CUT-OFF: 9.0V</text>
    <text x="20" y="147" fill="#333" fontFamily="'DM Mono', monospace" fontSize="8.5">BMS INTEGRATED</text>
    <line x1="20" y1="156" x2={w - 20} y2="156" stroke="#e0e0e0" strokeWidth="1" />
    <text x={w / 2} y="168" fill="#666" fontFamily="'DM Sans', sans-serif" fontSize="8" textAnchor="middle">MADE IN INDIA · RoHS</text>
  </g>
));

const CellBank = React.memo(({ w, h }) => (
  <g>
    <rect x="4" y="0" width={w - 8} height="24" rx="4" fill="#1e2226" stroke="#373d45" strokeWidth="1.5" />
    <rect x="4" y={h - 24} width={w - 8} height="24" rx="4" fill="#1e2226" stroke="#373d45" strokeWidth="1.5" />
    {[0, 1, 2].map((i) => {
      const cellX = 12 + i * 40;
      return (
        <g key={i}>
          <rect x={cellX} y="14" width="36" height={h - 28} rx="4" fill="url(#cell-purple-gradient)" stroke="#431e54" strokeWidth="1.2" />
          <line x1={cellX + 10} y1="18" x2={cellX + 10} y2={h - 18} stroke="#d59af2" strokeWidth="1.5" opacity="0.35" />
          <rect x={cellX + 8} y="8" width="20" height="8" rx="2" fill="url(#nickel-strip-gradient)" stroke="#888" strokeWidth="0.5" />
          <rect x={cellX + 8} y={h - 16} width="20" height="8" rx="2" fill="url(#nickel-strip-gradient)" stroke="#888" strokeWidth="0.5" />
        </g>
      );
    })}
    <rect x="22" y="6" width="56" height="10" rx="2" fill="url(#nickel-strip-gradient)" stroke="#666" strokeWidth="0.8" />
    <circle cx="32" cy="11" r="1.5" fill="#333" />
    <circle cx="68" cy="11" r="1.5" fill="#333" />
    <rect x="62" y={h - 16} width="56" height="10" rx="2" fill="url(#nickel-strip-gradient)" stroke="#666" strokeWidth="0.8" />
    <circle cx="72" cy={h - 11} r="1.5" fill="#333" />
    <circle cx="108" cy={h - 11} r="1.5" fill="#333" />
  </g>
));

const BmsPcb = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#1b6333" stroke="#2b9951" strokeWidth="1.8" />
    {['B-', 'B1', 'B2', 'B+', 'P+', 'P-'].map((pad, idx) => (
      <g key={pad}>
        <circle cx="16" cy={28 + idx * 28} r="6.5" fill="#d4af37" stroke="#fff" strokeWidth="0.8" />
        <text x="28" y={32 + idx * 28} fill="#e2faea" fontFamily="'DM Mono', monospace" fontWeight="700" fontSize="9">{pad}</text>
      </g>
    ))}
    <rect x="52" y="32" width="48" height="34" rx="2" fill="#121517" stroke="#444b52" strokeWidth="1.2" />
    <text x="76" y="52" fill="#ced4da" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" textAnchor="middle">BMS-IC</text>
    {[0, 1, 2, 3].map((m) => (
      <g key={m}>
        <rect x="52" y={80 + m * 26} width="48" height="20" rx="1.5" fill="#1a1d20" stroke="#333" strokeWidth="1" />
        <rect x="58" y={84 + m * 26} width="12" height="6" fill="#888" rx="0.5" />
        <text x="76" y={94 + m * 26} fill="#a0abb5" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">MOSFET</text>
      </g>
    ))}
  </g>
));

const FoamPad = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="6" fill="#f0f3f6" stroke="#d5dbe2" strokeWidth="1.5" />
    {[1, 2, 3, 4, 5, 6].map((row) =>
      [1, 2, 3].map((col) => (
        <circle key={`${row}-${col}`} cx={col * 28} cy={row * 28} r="3" fill="#dde2e8" />
      ))
    )}
    <text x={w / 2} y={h - 14} fill="#88929e" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">THERMAL FOAM</text>
  </g>
));

const KaptonTape = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="3" fill="url(#kapton-gradient)" stroke="#d99918" strokeWidth="1.2" />
    <line x1="8" y1="4" x2="8" y2={h - 4} stroke="#ffea94" strokeWidth="1.5" opacity="0.75" />
    <line x1="4" y1={h / 2} x2={w - 4} y2={h / 2} stroke="#ffea94" strokeWidth="1" opacity="0.4" />
    <text x={w / 2} y={h / 2 + 3} fill="#573703" fontFamily="'DM Mono', monospace" fontWeight="800" fontSize="9" textAnchor="middle" letterSpacing="0.8">KAPTON 260°C</text>
  </g>
));

const WireHarness = React.memo(() => (
  <g>
    <path d="M 0,55 Q 35,45 60,75 T 90,80" fill="none" stroke="#d82b2b" strokeWidth="7" strokeLinecap="round" />
    <path d="M 0,85 Q 35,75 60,105 T 90,95" fill="none" stroke="#22252a" strokeWidth="7" strokeLinecap="round" />
    <rect x="85" y="72" width="24" height="30" rx="3" fill="#181a1c" stroke="#333" strokeWidth="1" />
    <line x1="91" y1="72" x2="91" y2="102" stroke="#444" strokeWidth="1.5" />
    <line x1="97" y1="72" x2="97" y2="102" stroke="#444" strokeWidth="1.5" />
    <line x1="103" y1="72" x2="103" y2="102" stroke="#444" strokeWidth="1.5" />
    <rect x="109" y="80" width="28" height="14" rx="1" fill="url(#barrel-metal-gradient)" stroke="#777" strokeWidth="0.8" />
    <rect x="134" y="82" width="4" height="10" fill="#222" />
  </g>
));

const BarrelSocket = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="30" width="80" height="70" rx="6" fill="#1a1c1e" stroke="#353b42" strokeWidth="1.5" />
    {[15, 27, 39, 51, 63].map((rib) => (
      <line key={rib} x1={rib} y1="32" x2={rib} y2="98" stroke="#2a2f35" strokeWidth="3" />
    ))}
    <rect x="80" y="44" width="18" height="42" rx="2" fill="url(#barrel-metal-gradient)" stroke="#555" strokeWidth="1" />
    <circle cx="89" cy="65" r="7" fill="#111" />
    <circle cx="89" cy="65" r="2.5" fill="#f0c242" />
  </g>
));

// Map part IDs to their static drawing components
const PART_RENDERERS = {
  bat_pvc: PvcSleeve,
  bat_cells: CellBank,
  bat_bms: BmsPcb,
  bat_foam: FoamPad,
  bat_kapton: KaptonTape,
  bat_wire: WireHarness,
  bat_socket: BarrelSocket,
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function BatteryExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM manipulation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);

  // Store last known progress to skip unnecessary RAF work
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // ── DIRECT DOM ANIMATION (runs outside React render) ──
  useEffect(() => {
    // Skip if progress hasn't meaningfully changed
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    // Update lines container opacity
    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    // Update each part's transform and its projection line directly on the DOM
    BATTERY_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      // Move the part group
      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      // Move the projection line
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;

            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;

            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  // Memoize hover callbacks to prevent re-creation
  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  // Memoize the gradient defs (completely static, never changes)
  const svgDefs = useMemo(() => (
    <defs>
      <marker id="bat-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
      </marker>
      <marker id="bat-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
      </marker>
      <linearGradient id="pvc-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e5cb3" />
        <stop offset="35%" stopColor="#2977dd" />
        <stop offset="70%" stopColor="#2267c7" />
        <stop offset="100%" stopColor="#164b96" />
      </linearGradient>
      <linearGradient id="cell-purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6d3985" />
        <stop offset="40%" stopColor="#9b56bc" />
        <stop offset="75%" stopColor="#7a3f95" />
        <stop offset="100%" stopColor="#502863" />
      </linearGradient>
      <linearGradient id="nickel-strip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e6eb" />
        <stop offset="50%" stopColor="#b4bcc6" />
        <stop offset="100%" stopColor="#eef1f5" />
      </linearGradient>
      <linearGradient id="kapton-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5b838" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#c28511" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="barrel-metal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e0e0e0" />
        <stop offset="50%" stopColor="#9e9e9e" />
        <stop offset="100%" stopColor="#f5f5f5" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div
      className="battery-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible'
            /* REMOVED: filter: 'drop-shadow(...)' from the root SVG — 
               this was forcing the browser to composite the ENTIRE SVG tree 
               through a single expensive paint layer. Shadows are now per-part via CSS. */
          }}
        >
          {svgDefs}

          {/* Dynamic Laser Projection Lines — DOM-mutated, not React-rendered */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {BATTERY_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isOrange = part.id.includes('cells') || part.id.includes('wire');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#bat-marker-orange)' : 'url(#bat-marker-lime)';

              return (
                <g
                  key={`line-${part.id}`}
                  ref={(el) => { lineGroupRefs.current[part.id] = el; }}
                  opacity="0"
                >
                  <line
                    x1={part.assembled.x}
                    y1={part.line.y1}
                    x2={part.assembled.x}
                    y2={part.line.y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* 7 Physical Discrete Battery Parts — transforms mutated via ref, not state */}
          {BATTERY_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];

            return (
              <g
                key={part.id}
                ref={(el) => { partGroupRefs.current[part.id] = el; }}
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                onMouseEnter={() => handleMouseEnter(part.id)}
                onMouseLeave={handleMouseLeave}
                style={{
                  cursor: 'pointer',
                  willChange: 'transform',
                  /* GPU-accelerated CSS drop-shadow replaces the SVG feDropShadow filter.
                     CSS filter is composited by the GPU, SVG filter runs on the CPU paint thread. */
                  filter: isHovered
                    ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)'
                    : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
                  transition: 'filter 0.15s ease-out'
                }}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                {/* Static memoized part drawing — React never diffs this subtree */}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? BATTERY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'BATTERY PACK ARCHITECTURE · 7 DISCRETE PHYSICAL SUB-ASSEMBLIES'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? BATTERY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? BATTERY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '7 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/BatterySensorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Battery Voltage Sensor physical discrete parts + AD5933 sub-component
// Coordinates in 1200 x 600 artboard
const BATSENSOR_PARTS_CONFIG = [
  {
    id: 'bs_face',
    name: 'VOLTAGE DIVIDER SENSOR FACE',
    code: 'VDIV-0-25V-SMD',
    spec: 'Precision 30kΩ/7.5kΩ SMD resistor network reducing 0-25V input to 0-5V safe ADC levels',
    role: 'VOLTAGE SCALING & MEASUREMENT',
    w: 140,
    h: 140,
    assembled: { x: 530, y: 230 },
    exploded: { x: 130, y: 230 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'bs_body',
    name: 'FR-4 SENSOR SUBSTRATE & MOUNTING',
    code: 'PCB-FR4-BATSENSE',
    spec: '1.6mm thickness FR-4 glass epoxy substrate with ENIG finish and M3 mounting hole',
    role: 'MECHANICAL BASE & ROUTING',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 520, y: 220 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'bs_pins',
    name: 'ADC & POWER INTERFACE PINS',
    code: 'HDR-3P-ADC',
    spec: '3-pin standard 2.54mm pitch right-angle header (S, +, -) for direct MCU analog input',
    role: 'DATA ACQUISITION LINK',
    w: 60,
    h: 120,
    assembled: { x: 520, y: 240 },
    exploded: { x: 780, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'bs_ad5933',
    name: 'AD5933 BATTERY IMPEDANCE IC',
    code: 'AD5933-YRSZ',
    spec: 'Analog Devices 12-bit impedance analyzer, 1kHz–100kHz excitation, I²C, measures battery ESR & cell degradation',
    role: '[IC SUB-ASSEMBLY] IMPEDANCE SPECTROSCOPY',
    isSubComponent: true,
    w: 90,
    h: 90,
    assembled: { x: 555, y: 255 },
    exploded: { x: 960, y: 255 },
    start: 0.20,
    end: 0.60,
    step: 4,
    line: { x1: 555, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function BatterySensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }
    BATSENSOR_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return (
    <div className="batsensor-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="bs-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="bs-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="pcb-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5831" /><stop offset="100%" stopColor="#11361c" />
            </linearGradient>
            <linearGradient id="gold-pin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3b432" /><stop offset="50%" stopColor="#f5dc7f" /><stop offset="100%" stopColor="#c79918" />
            </linearGradient>
          </defs>

          {/* Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {BATSENSOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'bs_face' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#bs-marker-orange)' : `url(#bs-marker-${part.id === 'bs_face' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#bs-marker-orange)' : `url(#bs-marker-${part.id === 'bs_face' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {BATSENSOR_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && (
                  <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />
                )}

                {part.id === 'bs_face' && (
                  <g>
                    <rect x="0" y="30" width="30" height="80" rx="2" fill="#1b85d1" stroke="#12568a" strokeWidth="1" />
                    <rect x="15" y="40" width="10" height="20" fill="#aebac7" stroke="#333" />
                    <circle cx="20" cy="50" r="3" fill="#111" />
                    <rect x="15" y="80" width="10" height="20" fill="#aebac7" stroke="#333" />
                    <circle cx="20" cy="90" r="3" fill="#111" />
                    <path d="M 30,50 L 70,50 M 30,90 L 70,90" fill="none" stroke="#d4af37" strokeWidth="6" />
                    <path d="M 70,50 L 70,70 L 100,70" fill="none" stroke="#d4af37" strokeWidth="6" />
                    <path d="M 70,90 L 100,90" fill="none" stroke="#d4af37" strokeWidth="6" />
                    <rect x="60" y="42" width="20" height="12" fill="#111" stroke="#fff" strokeWidth="0.5" />
                    <rect x="58" y="42" width="4" height="12" fill="#ccc" />
                    <rect x="78" y="42" width="4" height="12" fill="#ccc" />
                    <text x="70" y="50" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">303</text>
                    <rect x="60" y="84" width="20" height="12" fill="#111" stroke="#fff" strokeWidth="0.5" />
                    <rect x="58" y="84" width="4" height="12" fill="#ccc" />
                    <rect x="78" y="84" width="4" height="12" fill="#ccc" />
                    <text x="70" y="92" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">752</text>
                  </g>
                )}

                {part.id === 'bs_body' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pcb-blue-grad)" stroke="#1a4726" strokeWidth="2" />
                    <circle cx="80" cy="130" r="14" fill="#0c2414" stroke="#d4af37" strokeWidth="4" />
                    <circle cx="80" cy="130" r="8" fill="#11361c" />
                    <text x="80" y="25" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">VCC-SENSE</text>
                    <text x="80" y="40" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="10" textAnchor="middle">0 - 25V</text>
                  </g>
                )}

                {part.id === 'bs_pins' && (
                  <g>
                    <rect x="0" y="20" width="15" height="80" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                    {[30, 55, 80].map((py, i) => (
                      <g key={i}>
                        <rect x="-5" y={py} width="5" height="8" fill="#778494" />
                        <rect x="15" y={py} width="35" height="8" rx="1" fill="url(#gold-pin-grad)" stroke="#9a7615" strokeWidth="0.5" />
                      </g>
                    ))}
                    <text x="25" y="42" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">S</text>
                    <text x="25" y="67" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">+</text>
                    <text x="25" y="92" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">-</text>
                  </g>
                )}

                {/* SUB-COMPONENT: AD5933 Battery Impedance IC */}
                {part.id === 'bs_ad5933' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    {/* SSOP package */}
                    <rect x={part.w / 2 - 18} y="12" width="36" height="28" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 10} cy="18" r="2" fill="#888" />
                    {/* Pin rows */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <rect key={`l-${i}`} x={part.w / 2 - 22} y={14 + i * 3} width="4" height="2" fill="#d4af37" />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <rect key={`r-${i}`} x={part.w / 2 + 18} y={14 + i * 3} width="4" height="2" fill="#d4af37" />
                    ))}
                    <text x={part.w / 2} y="30" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">AD5933</text>
                    <text x={part.w / 2} y="54" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">IMPEDANCE</text>
                    <text x={part.w / 2} y="64" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">ANALYZER</text>
                    <text x={part.w / 2} y="78" fill="#666" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">1kHz–100kHz</text>
                    {/* Sub-component badge */}
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? BATSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'BATTERY VOLTAGE SENSOR · 4 DISCRETE LAYERS + IC'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? BATSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES AD5933 IMPEDANCE SPECTROSCOPY SUB-ASSEMBLY'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? BATSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/ConverterExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// DC-DC Converter physical discrete parts + TI INA228 / Vishay WSL Shunt
const CONVERTER_PARTS_CONFIG = [
  {
    id: 'conv_inductors',
    name: 'POWER CONVERSION STAGE',
    code: 'LC-FILTER-BUCKBOOST',
    spec: 'High-current toroidal inductors and low-ESR electrolytic capacitors for ripple suppression',
    role: 'ENERGY STORAGE & FILTERING',
    w: 180, h: 120,
    assembled: { x: 510, y: 160 },
    exploded: { x: 130, y: 160 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 220, x2: 510, y2: 220 }
  },
  {
    id: 'conv_pcb',
    name: 'HIGH-CURRENT PCB SUBSTRATE',
    code: 'PCB-FR4-2OZ-CU',
    spec: 'Heavy 2oz copper FR4 PCB with integrated switching controller ICs and thermal vias',
    role: 'SWITCHING LOGIC & ROUTING',
    w: 220, h: 220,
    assembled: { x: 490, y: 190 },
    exploded: { x: 490, y: 190 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'conv_terminals',
    name: 'INPUT/OUTPUT SCREW TERMINALS',
    code: 'TERM-BLOCK-20A',
    spec: 'Heavy-duty PCB mount screw terminal blocks rated for 20A continuous current',
    role: 'POWER INTERFACE',
    w: 120, h: 180,
    assembled: { x: 490, y: 210 },
    exploded: { x: 730, y: 210 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'conv_ina228',
    name: 'TI INA228 POWER MONITOR',
    code: 'INA228-I2C',
    spec: '85V, 20-bit ultra-precise digital power monitor with I2C/SMBus interface',
    role: '[IC SUB-ASSEMBLY] CURRENT SENSING',
    isSubComponent: true,
    w: 80, h: 80,
    assembled: { x: 520, y: 340 },
    exploded: { x: 920, y: 340 },
    start: 0.22, end: 0.62, step: 4,
    line: { x1: 520, y1: 380, x2: 'left', y2: 380 }
  },
  {
    id: 'conv_wsl',
    name: 'VISHAY WSL SHUNT RESISTOR',
    code: 'WSL-3921-1MOHM',
    spec: 'Ultra-low 1mΩ 3W Power Metal Strip shunt for high-current measurement',
    role: '[IC SUB-ASSEMBLY] SHUNT RESISTOR',
    isSubComponent: true,
    w: 60, h: 40,
    assembled: { x: 580, y: 360 },
    exploded: { x: 1040, y: 360 },
    start: 0.25, end: 0.65, step: 5,
    line: { x1: 580, y1: 380, x2: 'left', y2: 380 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function ConverterExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    CONVERTER_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return (
    <div className="converter-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="conv-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="conv-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <radialGradient id="cap-top-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d1d6db" /><stop offset="70%" stopColor="#9da8b3" /><stop offset="100%" stopColor="#67737d" />
            </radialGradient>
            <linearGradient id="pcb-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a1215" /><stop offset="100%" stopColor="#3d0709" />
            </linearGradient>
            <linearGradient id="terminal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a7836" /><stop offset="100%" stopColor="#0d401c" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {CONVERTER_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'conv_inductors' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#conv-marker-orange)' : `url(#conv-marker-${part.id === 'conv_inductors' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#conv-marker-orange)' : `url(#conv-marker-${part.id === 'conv_inductors' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {CONVERTER_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'conv_inductors' && (
                  <g>
                    <circle cx="50" cy="60" r="45" fill="none" stroke="#222" strokeWidth="15" />
                    {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle) => (
                      <g key={`w1-${angle}`} transform={`translate(50, 60) rotate(${angle})`}>
                        <rect x="-4" y="-55" width="8" height="20" rx="4" fill="#c7722a" stroke="#874712" strokeWidth="0.5" />
                      </g>
                    ))}
                    <circle cx="140" cy="50" r="25" fill="none" stroke="#222" strokeWidth="10" />
                    {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((angle) => (
                      <g key={`w2-${angle}`} transform={`translate(140, 50) rotate(${angle})`}>
                        <rect x="-2" y="-32" width="4" height="14" rx="2" fill="#c7722a" stroke="#874712" strokeWidth="0.5" />
                      </g>
                    ))}
                    <circle cx="120" cy="100" r="15" fill="url(#cap-top-grad)" stroke="#333" strokeWidth="1" />
                    <path d="M 112,92 L 128,108 M 128,92 L 112,108" stroke="#555" strokeWidth="1.5" opacity="0.5" />
                    <circle cx="155" cy="95" r="12" fill="url(#cap-top-grad)" stroke="#333" strokeWidth="1" />
                    <path d="M 149,89 L 161,101 M 161,89 L 149,101" stroke="#555" strokeWidth="1.5" opacity="0.5" />
                  </g>
                )}

                {part.id === 'conv_pcb' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="6" fill="url(#pcb-red-grad)" stroke="#4a0b0d" strokeWidth="2" />
                    <path d="M 20,40 L 80,40 L 80,120" fill="none" stroke="#d4af37" strokeWidth="20" opacity="0.8" />
                    <path d="M 120,80 L 180,80 L 180,160" fill="none" stroke="#d4af37" strokeWidth="15" opacity="0.8" />
                    <rect x="80" y="140" width="40" height="40" fill="#111" stroke="#333" strokeWidth="1" />
                    <text x="100" y="160" fill="#777" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">XL4015</text>
                    <rect x="130" y="140" width="8" height="14" fill="#111" />
                    <rect x="130" y="160" width="8" height="14" fill="#c4a56c" />
                    <rect x="160" y="20" width="16" height="30" fill="#1a3d5e" stroke="#122a42" />
                    <circle cx="168" cy="35" r="5" fill="#c4a56c" />
                    <rect x="180" y="20" width="16" height="30" fill="#1a3d5e" stroke="#122a42" />
                    <circle cx="188" cy="35" r="5" fill="#c4a56c" />
                    <circle cx="50" cy="50" r="4" fill="#111" stroke="#d4af37" strokeWidth="2" />
                    <circle cx="80" cy="90" r="4" fill="#111" stroke="#d4af37" strokeWidth="2" />
                    <circle cx="20" cy="20" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                    <circle cx="200" cy="200" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                    <circle cx="20" cy="200" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                    <circle cx="200" cy="20" r="8" fill="#3d0709" stroke="#d4af37" strokeWidth="3" />
                  </g>
                )}

                {part.id === 'conv_terminals' && (
                  <g>
                    <rect x="10" y="10" width="30" height="60" rx="2" fill="url(#terminal-grad)" stroke="#111" strokeWidth="1" />
                    <circle cx="25" cy="25" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="25" x2="31" y2="25" stroke="#333" strokeWidth="2" />
                    <circle cx="25" cy="55" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="55" x2="31" y2="55" stroke="#333" strokeWidth="2" />
                    <text x="25" y="5" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="10" fontWeight="bold" textAnchor="middle">IN</text>
                    <rect x="10" y="110" width="30" height="60" rx="2" fill="url(#terminal-grad)" stroke="#111" strokeWidth="1" />
                    <circle cx="25" cy="125" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="125" x2="31" y2="125" stroke="#333" strokeWidth="2" />
                    <circle cx="25" cy="155" r="8" fill="#aab4c2" stroke="#333" />
                    <line x1="19" y1="155" x2="31" y2="155" stroke="#333" strokeWidth="2" />
                    <text x="25" y="105" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="10" fontWeight="bold" textAnchor="middle">OUT</text>
                    <rect x="0" y="22" width="10" height="6" fill="#778494" />
                    <rect x="0" y="52" width="10" height="6" fill="#778494" />
                    <rect x="0" y="122" width="10" height="6" fill="#778494" />
                    <rect x="0" y="152" width="10" height="6" fill="#778494" />
                  </g>
                )}

                {/* SUB-COMPONENT: INA228 */}
                {part.id === 'conv_ina228' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 12} y="15" width="24" height="24" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 6} cy="21" r="1.5" fill="#888" />
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 16} y={18 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 12} y={18 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    <text x={part.w / 2} y="32" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="6" fontWeight="800" textAnchor="middle">INA228</text>
                    <text x={part.w / 2} y="50" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">POWER MONITOR</text>
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}

                {/* SUB-COMPONENT: VISHAY WSL SHUNT */}
                {part.id === 'conv_wsl' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x="10" y="12" width="40" height="16" rx="1" fill="#444a52" stroke="#222" strokeWidth="1" />
                    <rect x="10" y="12" width="8" height="16" fill="#aab4c2" />
                    <rect x="42" y="12" width="8" height="16" fill="#aab4c2" />
                    <text x={part.w / 2} y="22" fill="#000" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold" textAnchor="middle">1mΩ</text>
                    <rect x="2" y={part.h - 10} width={part.w - 4} height="8" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 3} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="700" textAnchor="middle">SHUNT RESISTOR</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? CONVERTER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'DC-DC CONVERTER · 5 COMPONENTS WITH INA228 + SHUNT'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? CONVERTER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES I2C POWER MONITORING SENSOR ARRAY'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? CONVERTER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/DisplayExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// 2.8" ILI9341 SPI TFT Display Module — physical discrete parts
// Coordinates in 1200 x 600 artboard
const DISPLAY_PARTS_CONFIG = [
  {
    id: 'disp_bezel',
    name: 'FRONT PROTECTIVE BEZEL',
    code: 'BZL-ABS-2.8-BLK',
    spec: 'Injection-molded ABS bezel with anti-glare rim and snap-fit retention clips',
    role: 'SCREEN PROTECTION & ALIGNMENT',
    w: 160,
    h: 240,
    assembled: { x: 520, y: 180 },
    exploded: { x: 80, y: 180 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 520, y2: 300 }
  },
  {
    id: 'disp_tft',
    name: '2.8" ILI9341 SPI TFT LCD PANEL',
    code: 'TFT-ILI9341-240X320-SPI',
    spec: '240×320px 262K-color TFT with ILI9341 controller, 4-wire SPI interface, 40MHz clock',
    role: 'PRIMARY VISUAL OUTPUT',
    w: 140,
    h: 220,
    assembled: { x: 530, y: 190 },
    exploded: { x: 280, y: 190 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'disp_backlight',
    name: 'LED BACKLIGHT DIFFUSER PANEL',
    code: 'BLU-LED-WHT-2.8',
    spec: 'White LED edge-lit backlight unit with acrylic light-guide plate and optical diffuser films',
    role: 'UNIFORM ILLUMINATION',
    w: 140,
    h: 220,
    assembled: { x: 530, y: 190 },
    exploded: { x: 530, y: 190 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'disp_fpc',
    name: 'FPC RIBBON CABLE',
    code: 'FPC-40P-0.5MM',
    spec: '40-pin 0.5mm pitch flex cable connecting display panel to driver PCB',
    role: 'SIGNAL INTERCONNECT',
    w: 80,
    h: 120,
    assembled: { x: 560, y: 240 },
    exploded: { x: 730, y: 240 },
    start: 0.18,
    end: 0.62,
    step: 4,
    line: { x1: 560, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'disp_pcb',
    name: 'ILI9341 DRIVER PCB & SPI HEADER',
    code: 'PCB-TFT-DRV-SPI-8P',
    spec: 'Red soldermask FR-4 breakout board with 8-pin SPI header (VCC, GND, CS, RESET, DC, SDI, SCK, LED)',
    role: 'DIGITAL INTERFACE & CONTROL',
    w: 160,
    h: 200,
    assembled: { x: 520, y: 200 },
    exploded: { x: 920, y: 200 },
    start: 0.05,
    end: 0.45,
    step: 5,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS (memoized, never re-rendered) ————————————
const FrontBezel = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="10" fill="#1a1c1e" stroke="#333" strokeWidth="2" />
    <rect x="8" y="8" width={w - 16} height={h - 16} rx="6" fill="#0d0f10" stroke="#2a2d31" strokeWidth="1.5" />
    {/* Screen window cutout */}
    <rect x="14" y="20" width={w - 28} height={h - 48} rx="3" fill="#050607" stroke="#444" strokeWidth="1" />
    {/* Anti-glare texture */}
    <line x1="14" y1="20" x2={w - 14} y2={h - 28} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
    <line x1={w - 14} y1="20" x2="14" y2={h - 28} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
    {/* Snap clips */}
    <rect x={w / 2 - 8} y={h - 6} width="16" height="6" rx="1" fill="#2a2d31" />
    <rect x={w / 2 - 8} y="0" width="16" height="6" rx="1" fill="#2a2d31" />
  </g>
));

const TftPanel = React.memo(({ w, h }) => (
  <g>
    {/* Glass substrate */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#tft-screen-gradient)" stroke="#1a6b9c" strokeWidth="1.5" />
    {/* Pixel grid suggestion */}
    {[0, 1, 2, 3].map(row =>
      [0, 1, 2].map(col => (
        <rect key={`px-${row}-${col}`} x={16 + col * 38} y={18 + row * 50} width="32" height="44" rx="2" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.15)" strokeWidth="0.5" />
      ))
    )}
    {/* ILI9341 Controller chip */}
    <rect x={w / 2 - 20} y={h - 30} width="40" height="20" rx="2" fill="#111" stroke="#3a3a3a" strokeWidth="1" />
    <text x={w / 2} y={h - 16} fill="#7ac4e8" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">ILI9341</text>
    {/* 240x320 spec */}
    <text x={w / 2} y="12" fill="rgba(120,200,255,0.5)" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">240×320</text>
  </g>
));

const BacklightDiffuser = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#backlight-gradient)" stroke="#8ca0aa" strokeWidth="1" />
    {/* LED strip indicators */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <circle key={i} cx="6" cy={20 + i * 28} r="3" fill="#fffbe6" stroke="#e8d44d" strokeWidth="0.8" opacity="0.7" />
    ))}
    {/* Light guide grooves */}
    {[1, 2, 3, 4, 5].map(i => (
      <line key={i} x1="16" y1={i * 38} x2={w - 8} y2={i * 38} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
    ))}
    <text x={w / 2} y={h / 2 + 3} fill="#556874" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle">DIFFUSER</text>
  </g>
));

const FpcRibbon = React.memo(({ w, h }) => (
  <g>
    {/* Flex cable body */}
    <rect x="0" y="10" width={w} height={h - 20} rx="2" fill="url(#fpc-gradient)" stroke="#c4a04e" strokeWidth="1" />
    {/* Conductor traces */}
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={6 + i * 6} y1="14" x2={6 + i * 6} y2={h - 14} stroke="#d4af37" strokeWidth="0.8" opacity="0.6" />
    ))}
    {/* ZIF connector end */}
    <rect x={w - 4} y="20" width="4" height={h - 40} rx="1" fill="#1a1c1e" stroke="#555" strokeWidth="0.5" />
    <text x={w / 2} y={h / 2 + 3} fill="#7a5c1a" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">40P FPC</text>
  </g>
));

const DriverPcb = React.memo(({ w, h }) => (
  <g>
    {/* Red soldermask FR4 board */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#driver-pcb-gradient)" stroke="#a82424" strokeWidth="2" />
    {/* 8-pin SPI header */}
    <rect x="12" y="12" width="20" height={8 * 12 + 4} rx="2" fill="#1a1c1e" stroke="#444" strokeWidth="1" />
    {['VCC', 'GND', 'CS', 'RST', 'DC', 'SDI', 'SCK', 'LED'].map((pin, i) => (
      <g key={pin}>
        <circle cx="22" cy={22 + i * 12} r="3.5" fill="#d4af37" stroke="#fff" strokeWidth="0.6" />
        <text x="38" y={25 + i * 12} fill="#f5e6e6" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="600">{pin}</text>
      </g>
    ))}
    {/* ILI9341 driver IC */}
    <rect x="80" y="30" width="60" height="40" rx="3" fill="#0a0a0a" stroke="#555" strokeWidth="1.2" />
    <text x="110" y="48" fill="#e87b7b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="800" textAnchor="middle">ILI9341</text>
    <text x="110" y="60" fill="#c0a0a0" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">DRIVER IC</text>
    {/* Decoupling caps */}
    {[0, 1, 2].map(i => (
      <rect key={i} x={80 + i * 22} y="80" width="14" height="8" rx="1" fill="#222" stroke="#444" strokeWidth="0.8" />
    ))}
    {/* FPC connector */}
    <rect x="70" y={h - 30} width="72" height="18" rx="2" fill="#1a1c1e" stroke="#666" strokeWidth="1" />
    <text x="106" y={h - 18} fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">ZIF 40P</text>
    {/* Board label */}
    <text x={w / 2} y={h - 6} fill="#6a2020" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">TFT-DRV-SPI-V2</text>
  </g>
));

// Map part IDs to their static drawing components
const PART_RENDERERS = {
  disp_bezel: FrontBezel,
  disp_tft: TftPanel,
  disp_backlight: BacklightDiffuser,
  disp_fpc: FpcRibbon,
  disp_pcb: DriverPcb,
};

// ——— MAIN COMPONENT ————————————————————————————————————————————
export default function DisplayExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM manipulation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // —— DIRECT DOM ANIMATION (runs outside React render) ——
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    DISPLAY_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="disp-marker-cyan" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#58d6ff" />
      </marker>
      <marker id="disp-marker-amber" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#ffb347" />
      </marker>
      <linearGradient id="tft-screen-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a2a3d" />
        <stop offset="40%" stopColor="#0d3854" />
        <stop offset="100%" stopColor="#061e2c" />
      </linearGradient>
      <linearGradient id="backlight-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e8edf2" />
        <stop offset="50%" stopColor="#f5f7fa" />
        <stop offset="100%" stopColor="#dde3ea" />
      </linearGradient>
      <linearGradient id="fpc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f5c842" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#c49510" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="driver-pcb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b1a1a" />
        <stop offset="50%" stopColor="#8c2828" />
        <stop offset="100%" stopColor="#4a1010" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div
      className="display-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(88, 214, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 214, 255, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(88,214,255,0.6)', borderLeft: '2px solid rgba(88,214,255,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(88,214,255,0.6)', borderRight: '2px solid rgba(88,214,255,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(88,214,255,0.6)', borderLeft: '2px solid rgba(88,214,255,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(88,214,255,0.6)', borderRight: '2px solid rgba(88,214,255,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {svgDefs}

          {/* Dynamic Laser Projection Lines — DOM-mutated */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {DISPLAY_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isRight = part.line.x1 === 'right';
              const color = isRight ? '#58d6ff' : '#ffb347';
              const marker = isRight ? 'url(#disp-marker-cyan)' : 'url(#disp-marker-amber)';
              return (
                <g
                  key={`line-${part.id}`}
                  ref={(el) => { lineGroupRefs.current[part.id] = el; }}
                  opacity="0"
                >
                  <line
                    x1={part.assembled.x}
                    y1={part.line.y1}
                    x2={part.assembled.x}
                    y2={part.line.y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* 5 Physical Discrete Display Parts — transforms mutated via ref */}
          {DISPLAY_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];

            return (
              <g
                key={part.id}
                ref={(el) => { partGroupRefs.current[part.id] = el; }}
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                onMouseEnter={() => handleMouseEnter(part.id)}
                onMouseLeave={handleMouseLeave}
                style={{
                  cursor: 'pointer',
                  willChange: 'transform',
                  filter: isHovered
                    ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)'
                    : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
                  transition: 'filter 0.15s ease-out'
                }}
              >
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#58d6ff"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#58d6ff' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart
                ? DISPLAY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ILI9341 TFT DISPLAY MODULE · 5 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart
                ? DISPLAY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ffb347', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart
              ? DISPLAY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/EnergyHarvestingExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Energy Harvesting Module — TEG + LTC3108
const ENERGY_PARTS_CONFIG = [
  {
    id: 'eh_hotpad',
    name: 'HOT-SIDE THERMAL PAD',
    code: 'TPAD-CU-HOT-40X40',
    spec: '40×40mm copper thermal interface pad with graphite TIM for efficient heat collection from waste source',
    role: 'THERMAL ENERGY COLLECTION',
    w: 140,
    h: 140,
    assembled: { x: 530, y: 230 },
    exploded: { x: 80, y: 230 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'eh_teg',
    name: 'THERMOELECTRIC GENERATOR ARRAY',
    code: 'TEG-TEC1-12706-MOD',
    spec: '40×40mm Bi₂Te₃ Peltier module operated in Seebeck mode, 127 thermocouples, ~4.2V at ΔT=40°C',
    role: 'THERMAL-TO-ELECTRIC CONVERSION',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 280, y: 220 },
    start: 0.10,
    end: 0.50,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 520, y2: 300 }
  },
  {
    id: 'eh_ltc3108',
    name: 'LTC3108 ENERGY HARVESTER IC',
    code: 'LTC3108EDE-PBF',
    spec: 'Ultra-low voltage step-up converter, 20mV startup, integrated LDO, VOUT programmable 2.35–5V',
    role: 'DC-DC BOOST & REGULATION',
    w: 120,
    h: 160,
    assembled: { x: 540, y: 220 },
    exploded: { x: 540, y: 220 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'eh_transformer',
    name: 'STEP-UP TRANSFORMER COIL',
    code: 'XFMR-1:100-LTC3108',
    spec: '1:100 turns ratio coupled inductor for LTC3108 resonant boost topology, ferrite core',
    role: 'VOLTAGE MULTIPLICATION',
    w: 100,
    h: 120,
    assembled: { x: 550, y: 240 },
    exploded: { x: 750, y: 240 },
    start: 0.12,
    end: 0.55,
    step: 4,
    line: { x1: 550, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'eh_coldpad',
    name: 'COLD-SIDE HEATSINK PAD',
    code: 'HSINK-AL-COLD-40X40',
    spec: '40×40mm finned aluminum heatsink maintaining ΔT across TEG for sustained power generation',
    role: 'THERMAL ENERGY REJECTION',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 920, y: 220 },
    start: 0.05,
    end: 0.45,
    step: 5,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS ————————————————
const HotPad = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="url(#copper-gradient)" stroke="#b87333" strokeWidth="2" />
    {/* Graphite TIM layer */}
    <rect x="8" y="8" width={w - 16} height={h - 16} rx="2" fill="#2a2a2a" stroke="#444" strokeWidth="1" opacity="0.7" />
    {/* Heat flow arrows */}
    <path d={`M ${w / 2},${h - 10} L ${w / 2},20`} stroke="#ff6b3d" strokeWidth="2" markerEnd="url(#eh-arrow-hot)" opacity="0.6" />
    <path d={`M ${w / 2 - 20},${h - 10} L ${w / 2 - 20},30`} stroke="#ff6b3d" strokeWidth="1.5" opacity="0.3" />
    <path d={`M ${w / 2 + 20},${h - 10} L ${w / 2 + 20},30`} stroke="#ff6b3d" strokeWidth="1.5" opacity="0.3" />
    <text x={w / 2} y={h / 2 + 3} fill="#ff8c5a" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" textAnchor="middle">HOT SIDE</text>
  </g>
));

const TegArray = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#f0f0f0" stroke="#ccc" strokeWidth="1.5" />
    {/* Thermocouple grid */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 6 }).map((_, col) => (
        <g key={`tc-${row}-${col}`}>
          <rect x={10 + col * 24} y={10 + row * 24} width="10" height="18" rx="1" fill={(row + col) % 2 === 0 ? '#c0392b' : '#2980b9'} opacity="0.8" />
          <rect x={20 + col * 24} y={10 + row * 24} width="4" height="18" rx="0.5" fill="#d4af37" opacity="0.6" />
        </g>
      ))
    )}
    {/* Lead wires */}
    <circle cx="20" cy={h - 12} r="4" fill="#d82b2b" stroke="#fff" strokeWidth="0.5" />
    <circle cx="44" cy={h - 12} r="4" fill="#1a1a1a" stroke="#fff" strokeWidth="0.5" />
    <text x={w / 2} y={h - 6} fill="#666" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">127 THERMOCOUPLES</text>
  </g>
));

const Ltc3108Ic = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* IC package */}
    <rect x={w / 2 - 24} y="20" width="48" height="36" rx="3" fill="#0a0a0a" stroke="#555" strokeWidth="1.2" />
    <circle cx={w / 2 - 16} cy="30" r="2" fill="#888" />
    <text x={w / 2} y="38" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">LTC3108</text>
    <text x={w / 2} y="50" fill="#667" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">20mV START</text>
    {/* Passive components */}
    {[0, 1, 2].map(i => (
      <rect key={i} x={16 + i * 34} y="72" width="22" height="10" rx="1.5" fill="#222" stroke="#444" strokeWidth="0.8" />
    ))}
    {/* Storage capacitor */}
    <rect x="20" y="96" width={w - 40} height="24" rx="3" fill="#1a1d22" stroke="#3a3d42" strokeWidth="1" />
    <text x={w / 2} y="112" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">VSTORE 100μF</text>
    {/* Output LDO */}
    <rect x="20" y="132" width={w - 40} height="16" rx="2" fill="#111" stroke="#444" strokeWidth="0.8" />
    <text x={w / 2} y="144" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">LDO 3.3V OUT</text>
  </g>
));

const StepUpTransformer = React.memo(({ w, h }) => (
  <g>
    {/* Ferrite core */}
    <rect x="10" y="10" width={w - 20} height={h - 20} rx="6" fill="#2a2215" stroke="#5a4820" strokeWidth="2" />
    {/* Primary winding */}
    {Array.from({ length: 4 }).map((_, i) => (
      <ellipse key={`p-${i}`} cx={w / 2 - 14} cy={26 + i * 18} rx="12" ry="5" fill="none" stroke="#d82b2b" strokeWidth="2" />
    ))}
    {/* Secondary winding (more turns) */}
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={`s-${i}`} cx={w / 2 + 14} cy={20 + i * 10} rx="10" ry="3" fill="none" stroke="#2977dd" strokeWidth="1.2" />
    ))}
    {/* Core label */}
    <text x={w / 2} y={h - 6} fill="#8a7a50" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">1:100</text>
  </g>
));

const ColdSink = React.memo(({ w, h }) => (
  <g>
    {/* Heatsink base */}
    <rect x="0" y={h * 0.6} width={w} height={h * 0.4} rx="3" fill="url(#aluminum-gradient)" stroke="#8e96a1" strokeWidth="1.5" />
    {/* Fins */}
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={8 + i * 18} y="0" width="12" height={h * 0.65} rx="1" fill="url(#aluminum-gradient)" stroke="#8e96a1" strokeWidth="0.8" />
    ))}
    {/* Airflow arrows */}
    <path d={`M 10,${h * 0.3} L ${w - 10},${h * 0.3}`} stroke="#58d6ff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
    <text x={w / 2} y={h - 8} fill="#6e7680" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">COLD SIDE</text>
  </g>
));

const PART_RENDERERS = {
  eh_hotpad: HotPad,
  eh_teg: TegArray,
  eh_ltc3108: Ltc3108Ic,
  eh_transformer: StepUpTransformer,
  eh_coldpad: ColdSink,
};

export default function EnergyHarvestingExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    ENERGY_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="eh-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#ff8c5a" />
      </marker>
      <marker id="eh-arrow-hot" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M 0,0 L 8,4 L 0,8 Z" fill="#ff6b3d" opacity="0.6" />
      </marker>
      <linearGradient id="copper-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b87333" />
        <stop offset="50%" stopColor="#da8a47" />
        <stop offset="100%" stopColor="#a0602a" />
      </linearGradient>
      <linearGradient id="aluminum-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c0c8d0" />
        <stop offset="50%" stopColor="#a8b2be" />
        <stop offset="100%" stopColor="#d0d8e0" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div className="energy-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 140, 90, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 140, 90, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(255,140,90,0.6)', borderLeft: '2px solid rgba(255,140,90,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(255,140,90,0.6)', borderRight: '2px solid rgba(255,140,90,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(255,140,90,0.6)', borderLeft: '2px solid rgba(255,140,90,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(255,140,90,0.6)', borderRight: '2px solid rgba(255,140,90,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {ENERGY_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#ff8c5a" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#eh-marker-orange)" markerEnd="url(#eh-marker-orange)" />
                </g>
              );
            })}
          </g>
          {ENERGY_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#ff8c5a" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#ff8c5a' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? ENERGY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'ENERGY HARVESTING MODULE · 5 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? ENERGY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'TEG SEEBECK CONVERSION + LTC3108 ULTRA-LOW VOLTAGE BOOST'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8c5a', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? ENERGY_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/EnvSensorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Environmental Sensor Array — SHT41 + BMP390 physical discrete parts
const ENV_PARTS_CONFIG = [
  {
    id: 'env_grill',
    name: 'PTFE INTAKE GRILL',
    code: 'GRILL-PTFE-IP67',
    spec: 'Sintered PTFE membrane grill with IP67 protection allowing gas diffusion while blocking liquid ingress',
    role: 'ENVIRONMENTAL INTERFACE',
    w: 120,
    h: 200,
    assembled: { x: 540, y: 200 },
    exploded: { x: 100, y: 200 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'env_sht41',
    name: 'SENSIRION SHT41 HUMIDITY / TEMP',
    code: 'SHT41-AD1B-R2',
    spec: '±1.8%RH accuracy, ±0.2°C accuracy, integrated heater for condensation recovery, I²C interface',
    role: 'HUMIDITY & TEMPERATURE',
    w: 100,
    h: 130,
    assembled: { x: 550, y: 235 },
    exploded: { x: 280, y: 235 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 550, y2: 300 }
  },
  {
    id: 'env_bmp390',
    name: 'BOSCH BMP390 PRESSURE SENSOR',
    code: 'BMP390-MI-E',
    spec: '±0.5hPa absolute accuracy, 200Hz ODR, 24-bit ADC, barometric altitude resolution <8cm',
    role: 'BAROMETRIC PRESSURE',
    w: 100,
    h: 130,
    assembled: { x: 550, y: 235 },
    exploded: { x: 550, y: 235 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'env_carrier',
    name: 'SENSOR CARRIER PCB',
    code: 'PCB-ENV-CARRIER-2L',
    spec: '2-layer FR-4 with I²C bus, 3.3V LDO, decoupling, and thermal isolation slot between sensors',
    role: 'SIGNAL ROUTING & POWER',
    w: 180,
    h: 220,
    assembled: { x: 510, y: 190 },
    exploded: { x: 720, y: 190 },
    start: 0.10,
    end: 0.50,
    step: 4,
    line: { x1: 510, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'env_shield',
    name: 'EMI SHIELD CAN',
    code: 'SHLD-TIN-ENV-01',
    spec: 'Tin-plated steel RF shield can protecting analog sensor readings from electromagnetic interference',
    role: 'EMI PROTECTION',
    w: 140,
    h: 180,
    assembled: { x: 530, y: 210 },
    exploded: { x: 930, y: 210 },
    start: 0.05,
    end: 0.45,
    step: 5,
    line: { x1: 530, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS ————————————————
const PtfeGrill = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="8" fill="#e8edf2" stroke="#b8c0cc" strokeWidth="1.5" />
    {/* Membrane pore pattern */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 4 }).map((_, col) => (
        <circle key={`p-${row}-${col}`} cx={15 + col * 28} cy={18 + row * 28} r="5" fill="none" stroke="#c4ccd6" strokeWidth="1" />
      ))
    )}
    {/* PTFE texture */}
    <rect x="8" y="8" width={w - 16} height={h - 16} rx="4" fill="none" stroke="#d5dbe2" strokeWidth="0.8" strokeDasharray="2 2" />
    <text x={w / 2} y={h - 10} fill="#8899a8" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">PTFE IP67</text>
  </g>
));

const Sht41Sensor = React.memo(({ w, h }) => (
  <g>
    {/* DFN package */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#1a1d22" stroke="#3a3d42" strokeWidth="1.5" />
    {/* Sensing aperture */}
    <rect x={w / 2 - 12} y="16" width="24" height="24" rx="12" fill="#0d1117" stroke="#58d6ff" strokeWidth="1" />
    <circle cx={w / 2} cy="28" r="6" fill="none" stroke="#58d6ff" strokeWidth="1.5" opacity="0.6" />
    {/* Heater element */}
    <path d={`M ${w / 2 - 8},50 Q ${w / 2},44 ${w / 2 + 8},50 Q ${w / 2},56 ${w / 2 - 8},50`} fill="none" stroke="#ff6b6b" strokeWidth="1" opacity="0.5" />
    {/* IC pads */}
    {Array.from({ length: 4 }).map((_, i) => (
      <rect key={i} x={10 + i * 22} y={h - 10} width="14" height="6" rx="1" fill="#d4af37" />
    ))}
    <text x={w / 2} y="78" fill="#7ac4e8" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="800" textAnchor="middle">SHT41</text>
    <text x={w / 2} y="92" fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">RH ±1.8%</text>
    <text x={w / 2} y="104" fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">T ±0.2°C</text>
  </g>
));

const Bmp390Sensor = React.memo(({ w, h }) => (
  <g>
    {/* LGA package */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#1a1d22" stroke="#3a3d42" strokeWidth="1.5" />
    {/* Pressure port */}
    <circle cx={w / 2} cy="28" r="10" fill="#0d1117" stroke="#c9e87b" strokeWidth="1.5" />
    <circle cx={w / 2} cy="28" r="4" fill="none" stroke="#c9e87b" strokeWidth="1" opacity="0.6" />
    {/* 24-bit ADC block */}
    <rect x="16" y="52" width={w - 32} height="24" rx="2" fill="#111" stroke="#444" strokeWidth="0.8" />
    <text x={w / 2} y="68" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">24-BIT ADC</text>
    {/* IC pads */}
    {Array.from({ length: 4 }).map((_, i) => (
      <rect key={i} x={10 + i * 22} y={h - 10} width="14" height="6" rx="1" fill="#d4af37" />
    ))}
    <text x={w / 2} y="96" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="800" textAnchor="middle">BMP390</text>
    <text x={w / 2} y="110" fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">±0.5 hPa</text>
  </g>
));

const EnvCarrierPcb = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* I2C bus traces */}
    <path d="M 20,50 L 80,50 L 80,100 L 160,100" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    <path d="M 20,70 L 60,70 L 60,140 L 160,140" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    {/* LDO regulator */}
    <rect x="14" y="14" width="36" height="24" rx="2" fill="#111" stroke="#444" strokeWidth="1" />
    <text x="32" y="30" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">3V3 LDO</text>
    {/* Thermal isolation slot */}
    <rect x={w / 2 - 2} y="40" width="4" height={h - 80} rx="1" fill="#0a140e" stroke="#1a3d22" strokeWidth="0.8" />
    {/* I2C header */}
    <rect x={w - 28} y="20" width="18" height="50" rx="2" fill="#1a1c1e" stroke="#444" strokeWidth="1" />
    {['SDA', 'SCL', 'VCC', 'GND'].map((pin, i) => (
      <text key={pin} x={w - 10} y={34 + i * 10} fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="end">{pin}</text>
    ))}
    <text x={w / 2} y={h - 8} fill="#2b9951" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">ENV-CARRIER-V1</text>
  </g>
));

const EmiShieldCan = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="6" fill="url(#shield-tin-gradient)" stroke="#999" strokeWidth="1.5" />
    {/* Ventilation slots */}
    {[1, 2, 3].map(i => (
      <rect key={i} x="20" y={30 + i * 35} width={w - 40} height="4" rx="1" fill="#888" stroke="#777" strokeWidth="0.5" />
    ))}
    {/* Ground clip tabs */}
    <rect x="-4" y="30" width="8" height="20" rx="1" fill="#b0b8c0" />
    <rect x="-4" y={h - 50} width="8" height="20" rx="1" fill="#b0b8c0" />
    <rect x={w - 4} y="30" width="8" height="20" rx="1" fill="#b0b8c0" />
    <rect x={w - 4} y={h - 50} width="8" height="20" rx="1" fill="#b0b8c0" />
    <text x={w / 2} y={h / 2} fill="#6e7680" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle">EMI SHIELD</text>
  </g>
));

const PART_RENDERERS = {
  env_grill: PtfeGrill,
  env_sht41: Sht41Sensor,
  env_bmp390: Bmp390Sensor,
  env_carrier: EnvCarrierPcb,
  env_shield: EmiShieldCan,
};

export default function EnvSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    ENV_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="env-marker-teal" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#4dd0b5" />
      </marker>
      <linearGradient id="shield-tin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c0c8d0" />
        <stop offset="50%" stopColor="#a8b2be" />
        <stop offset="100%" stopColor="#d0d8e0" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div className="env-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(77, 208, 181, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 208, 181, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(77,208,181,0.6)', borderLeft: '2px solid rgba(77,208,181,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(77,208,181,0.6)', borderRight: '2px solid rgba(77,208,181,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(77,208,181,0.6)', borderLeft: '2px solid rgba(77,208,181,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(77,208,181,0.6)', borderRight: '2px solid rgba(77,208,181,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {ENV_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#4dd0b5" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#env-marker-teal)" markerEnd="url(#env-marker-teal)" />
                </g>
              );
            })}
          </g>
          {ENV_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#4dd0b5" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#4dd0b5' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? ENV_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'ENVIRONMENTAL SENSOR ARRAY · 5 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? ENV_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'SHT41 HUMIDITY + BMP390 BAROMETRIC PRESSURE SENSING'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#4dd0b5', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? ENV_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '5 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/Esp32ExplodedView.jsx

``jsx
import React, { useState } from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import HorizontalExplodedView from './HorizontalExplodedView';

// Physical coordinates in 1024 x 1536 artboard:
// PCB: X: 215, Y: 445, W: 605, H: 740
// Center X = 517.5
// All parts now explode along HORIZONTAL projection axes:
// West / Left: RF Module, Left Header, Left Standoff, EN Button
// Center: Main System PCB
// East / Right: Boot Button, USB Bracket, Micro-USB Connector, Right Standoff, Right Header
const HORIZONTAL_PARTS_CONFIG = [
  {
    id: 'pcb',
    name: 'MAIN SYSTEM PCB',
    code: 'ESP32-CORE-PCB',
    spec: '4-layer FR-4 gold immersion substrate with 3.3V LDO regulator and CP2102 USB bridge',
    role: 'PRIMARY CIRCUIT BACKBONE',
    file: '/components/esp32-parts/main-pcb.png',
    w: 605,
    h: 740,
    assembled: { x: 215, y: 445 },
    exploded: { x: 215, y: 445 },
    start: 0,
    end: 0,
    step: 0
  },
  {
    id: 'rf_module',
    name: 'ESP32-WROOM-32D RF MODULE',
    code: 'ESP32-WROOM-32D',
    spec: 'Dual-core Xtensa 32-bit LX6 @ 240 MHz, integrated 2.4 GHz Wi-Fi 802.11b/g/n & BLE 4.2',
    role: 'COMPUTE & WIRELESS ENGINE',
    file: '/components/esp32-parts/esp32-rf-module.png',
    w: 330,
    h: 415,
    assembled: { x: 350, y: 470 },
    exploded: { x: 110, y: 460 },
    start: 0.04,
    end: 0.35,
    step: 1,
    line: { x1: 'right', y1: 580, x2: 350, y2: 580 }
  },
  {
    id: 'header_left',
    name: 'LEFT PIN HEADER (19-PIN)',
    code: 'HDR-19P-2.54MM-L',
    spec: '19-position 2.54mm pitch through-hole male header (3V3, EN, GPIO36-GPIO19)',
    role: 'PERIPHERAL & POWER INTERFACE',
    file: '/components/esp32-parts/header-left.png',
    w: 80,
    h: 265,
    assembled: { x: 215, y: 670 },
    exploded: { x: 40, y: 670 },
    start: 0.16,
    end: 0.50,
    step: 2,
    line: { x1: 'right', y1: 760, x2: 215, y2: 760 }
  },
  {
    id: 'header_right',
    name: 'RIGHT PIN HEADER (19-PIN)',
    code: 'HDR-19P-2.54MM-R',
    spec: '19-position 2.54mm pitch through-hole male header (GND, 5V, GPIO21-GPIO23)',
    role: 'DIGITAL I/O & BUS INTERFACE',
    file: '/components/esp32-parts/header-right.png',
    w: 80,
    h: 265,
    assembled: { x: 740, y: 670 },
    exploded: { x: 910, y: 670 },
    start: 0.16,
    end: 0.50,
    step: 2,
    line: { x1: 740, y1: 760, x2: 'left', y2: 760 }
  },
  {
    id: 'button_en',
    name: 'EN (RESET) TACTILE SWITCH',
    code: 'SW-TACT-SMD-EN',
    spec: 'Micro momentary tactile push-button with 100nF debounce RC timing filter',
    role: 'HARDWARE RESET CONTROL',
    file: '/components/esp32-parts/button-en.png',
    w: 68,
    h: 68,
    assembled: { x: 318, y: 1115 },
    exploded: { x: 140, y: 1115 },
    start: 0.35,
    end: 0.68,
    step: 3,
    line: { x1: 'right', y1: 1149, x2: 318, y2: 1149 }
  },
  {
    id: 'button_boot',
    name: 'BOOT (GPIO0) TACTILE SWITCH',
    code: 'SW-TACT-SMD-BOOT',
    spec: 'Micro tactile switch pulling GPIO0 low for ESP32 ROM bootloader flash mode',
    role: 'BOOTLOADER STRAPPING PIN',
    file: '/components/esp32-parts/button-boot.png',
    w: 68,
    h: 68,
    assembled: { x: 660, y: 1115 },
    exploded: { x: 815, y: 1115 },
    start: 0.35,
    end: 0.68,
    step: 3,
    line: { x1: 660, y1: 1149, x2: 'left', y2: 1149 }
  },
  {
    id: 'usb_bracket',
    name: 'USB REINFORCEMENT SHIELD',
    code: 'USB-SHLD-BRKT',
    spec: 'Cold-rolled steel retention bracket for port strain relief and chassis ground',
    role: 'MECHANICAL RETENTION',
    file: '/components/esp32-parts/usb-bracket.png',
    w: 135,
    h: 95,
    assembled: { x: 440, y: 1140 },
    exploded: { x: 570, y: 1220 },
    start: 0.50,
    end: 0.78,
    step: 4,
    line: { x1: 507, y1: 1140, x2: 'left', y2: 1220 }
  },
  {
    id: 'usb_connector',
    name: 'MICRO-USB TYPE-B CONNECTOR',
    code: 'CONN-USB-MICRO-B',
    spec: '5-pin SMT micro-USB 2.0 receptacle with 5V VBUS rail and CP2102 D+/D- lines',
    role: 'POWER & PROGRAMMING PORT',
    file: '/components/esp32-parts/usb-connector.png',
    w: 165,
    h: 180,
    assembled: { x: 425, y: 1145 },
    exploded: { x: 675, y: 1290 },
    start: 0.55,
    end: 0.84,
    step: 4,
    line: { x1: 507, y1: 1145, x2: 'left', y2: 1290 }
  },
  {
    id: 'spacer_left',
    name: 'LEFT M2.5 MOUNTING STANDOFF',
    code: 'MECH-STANDOFF-M2.5-L',
    spec: 'Brass hexagonal threaded standoff for mechanical PCB vibration dampening',
    role: 'CHASSIS ISOLATION',
    file: '/components/esp32-parts/spacer-left.png',
    w: 48,
    h: 48,
    assembled: { x: 225, y: 1140 },
    exploded: { x: 60, y: 1140 },
    start: 0.68,
    end: 0.94,
    step: 5,
    line: { x1: 'right', y1: 1164, x2: 225, y2: 1164 }
  },
  {
    id: 'spacer_right',
    name: 'RIGHT M2.5 MOUNTING STANDOFF',
    code: 'MECH-STANDOFF-M2.5-R',
    spec: 'Brass hexagonal threaded standoff for mechanical PCB vibration dampening',
    role: 'CHASSIS ISOLATION',
    file: '/components/esp32-parts/spacer-right.png',
    w: 48,
    h: 48,
    assembled: { x: 750, y: 1140 },
    exploded: { x: 915, y: 1140 },
    start: 0.68,
    end: 0.94,
    step: 5,
    line: { x1: 750, y1: 1164, x2: 'left', y2: 1164 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function Esp32ExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  const progress = Math.max(0, Math.min(1, scrollProgress));
  const isExploded = progress >= 0.08;
  const isFullyExploded = progress >= 0.88;

  return (
    <div
      className="esp32-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1024 x 1536 */}
        <svg
          viewBox="0 0 1024 1536"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.6))'
          }}
        >
          <defs>
            <marker id="esp32-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="esp32-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>
          </defs>

          {/* Dynamic Horizontal Laser Projection Lines */}
          <g opacity={progress > 0.04 ? 1 : 0} style={{ transition: 'opacity 0.25s' }}>
            {HORIZONTAL_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id.includes('usb') || part.id.includes('button');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#esp32-marker-orange)' : 'url(#esp32-marker-lime)';

              return (
                <g key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* 10 Physical Parts moving horizontally */}
          {HORIZONTAL_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform' }}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={currentX - 6}
                    y={currentY - 6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}
                {/* Authentic Part PNG */}
                <image
                  href={part.file}
                  x={currentX}
                  y={currentY}
                  width={part.w}
                  height={part.h}
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    filter: isHovered
                      ? 'brightness(1.2) drop-shadow(0 0 14px rgba(201,232,123,0.7))'
                      : 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
                    transition: 'filter 0.2s'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? HORIZONTAL_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ESP32 HARDWARE DECOMPOSITION · 10 PHYSICAL PARTS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? HORIZONTAL_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? HORIZONTAL_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '10 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/ExplodedComponentSection.jsx

``jsx
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ShieldCheck } from 'lucide-react';
import Esp32ExplodedView from './Esp32ExplodedView';
import MicroSdExplodedView from './MicroSdExplodedView';
import DisplayExplodedView from './DisplayExplodedView';
import BatteryExplodedView from './BatteryExplodedView';
import AntennaExplodedView from './AntennaExplodedView';
import HorizontalExplodedView from './HorizontalExplodedView';
import RegulatorExplodedView from './RegulatorExplodedView';
import ThermistorExplodedView from './ThermistorExplodedView';
import BatterySensorExplodedView from './BatterySensorExplodedView';
import RfSensorExplodedView from './RfSensorExplodedView';
import VibrationSensorExplodedView from './VibrationSensorExplodedView';
import EnvSensorExplodedView from './EnvSensorExplodedView';
import MosfetExplodedView from './MosfetExplodedView';
import TempSensorExplodedView from './TempSensorExplodedView';
import ConverterExplodedView from './ConverterExplodedView';
import EnergyHarvestingExplodedView from './EnergyHarvestingExplodedView';
import HeatPipeExplodedView from './HeatPipeExplodedView';
import RadiatorExplodedView from './RadiatorExplodedView';
import StructureExplodedView from './StructureExplodedView';
import PrototypeBoardExplodedView from './PrototypeBoardExplodedView';
import LoraExplodedView from './LoraExplodedView';
import InsulationExplodedView from './InsulationExplodedView';
import SolderProtectionExplodedView from './SolderProtectionExplodedView';
import RadiationShieldExplodedView from './RadiationShieldExplodedView';

function Placeholder({ scene }) {
  const resilience = scene.kind === 'resilience';
  return (
    <div className={`concept-layer ${resilience ? 'resilience' : ''}`}>
      {resilience ? (
        <>
          <div className="shield">
            <ShieldCheck size={46} />
            <span>PHYSICAL PROTECTION</span>
          </div>
          <div className="integrity">
            <b>SYSTEM RESILIENCE</b>
            <span>WATCHDOG</span>
            <span>ERROR CHECKING</span>
            <span>CHECKSUM</span>
          </div>
        </>
      ) : (
        <>
          <div className="tbd-line">
            <i />
            <b />
            <i />
          </div>
          <div className="tbd-core">TBD</div>
          <p>
            PROTECTION LAYER
            <br />
            COMPONENTS TO BE DEFINED
          </p>
        </>
      )}
    </div>
  );
}

export default function ExplodedComponentSection({ scene }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isEsp32 = scene.index === '01' || scene.id === 'esp32';
  const isMicroSd = scene.index === '02' || scene.id === 'microsd';
  const isDisplay = scene.index === '03' || scene.id === 'display';
  const isRegulator = scene.index === '04' || scene.id === 'regulator';
  const isThermistor = scene.index === '05' || scene.id === 'thermistor';
  const isBatterySensor = scene.index === '06' || scene.id === 'battery-sensor';
  const isRfSensor = scene.index === '07' || scene.id === 'rf-sensor';
  const isVibrationSensor = scene.index === '08' || scene.id === 'vibration-sensor';
  const isEnvSensor = scene.index === '09' || scene.id === 'env-sensor';
  const isBattery = scene.index === '10' || scene.id === 'battery';
  const isMosfet = scene.index === '11' || scene.id === 'mosfet';
  const isTempSensor = scene.index === '12' || scene.id === 'temp-sensor';
  const isConverter = scene.index === '13' || scene.id === 'converter';
  const isEnergyHarvesting = scene.index === '14' || scene.id === 'energy-harvesting';
  const isHeatPipe = scene.index === '15' || scene.id === 'heat-pipe';
  const isRadiator = scene.index === '16' || scene.id === 'radiator';
  const isStructure = scene.index === '17' || scene.id === 'structure';
  const isPrototypeBoard = scene.index === '18' || scene.id === 'prototype-board';
  const isInsulation = scene.index === '19' || scene.id === 'insulation';
  const isSolderProtection = scene.index === '20' || scene.id === 'solder-protection';
  const isRadiationShield = scene.index === '21' || scene.id === 'radiation-shield';
  const isLora = scene.index === '22' || scene.id === 'lora';
  const isAntenna = scene.index === '23' || scene.id === 'antenna';
  const isHardware = scene.kind === 'component';

  // Intersection observer to activate scene styling
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // We will now track internal scroll progress manually via a wheel listener on the visual stage
  const [internalScroll, setInternalScroll] = useState(0);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const visualStageRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isHardware) return;
    
    const el = visualStageRef.current;
    if (!el) return;

    const startLerp = () => {
      if (rafRef.current) return; // loop is already running

      const loop = () => {
        const diff = targetScrollRef.current - currentScrollRef.current;
        // If we are close enough, snap and stop animating
        if (Math.abs(diff) < 0.5) {
          currentScrollRef.current = targetScrollRef.current;
          setInternalScroll(currentScrollRef.current);
          rafRef.current = null;
          return;
        }

        // Exponential ease-out (butter smooth lerp)
        currentScrollRef.current += diff * 0.08;
        setInternalScroll(currentScrollRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };
      
      rafRef.current = requestAnimationFrame(loop);
    };

    const handleWheel = (e) => {
      // NEVER scroll the page when hovering over the visual stage
      e.preventDefault();

      const prev = targetScrollRef.current;
      const next = prev + e.deltaY * 1.5; // adjust sensitivity
      const maxScroll = 1500; // total "scroll" distance to fully explode

      if (next <= 0 && e.deltaY < 0) {
        targetScrollRef.current = 0;
        startLerp();
        return;
      }
      
      if (next >= maxScroll && e.deltaY > 0) {
        targetScrollRef.current = maxScroll;
        startLerp();
        return;
      }

      targetScrollRef.current = Math.max(0, Math.min(maxScroll, next));
      startLerp();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHardware]);

  const progress = isHardware ? internalScroll / 1500 : 0;

  return (
    <section
      ref={ref}
      className={`scene ${active ? 'active' : ''}`}
      style={isHardware ? { minHeight: '100vh', padding: '10vh 0' } : {}}
    >
      <div className="scene-sticky" style={isHardware ? { position: 'relative', height: 'auto' } : {}}>
        <div className="scene-grid" />
        <div className="scene-content">
          {/* Left Side: Technical Copy & Dynamic Sequence Status */}
          <div className="scene-copy">
            <p>
              {scene.index} / {scene.category}
            </p>
            <h2>
              {scene.title.split('\n').map((line, i) => (
                <span key={line}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h2>
            <b>{scene.role}</b>
            <article>{scene.description}</article>

            <small style={{ marginTop: '24px' }}>
              <ArrowDown size={14} />
              {isHardware
                ? 'HOVER OVER COMPONENT AND SCROLL TO EXPLODE'
                : 'SCROLL TO PROGRESS SUBSYSTEMS'}
            </small>
          </div>

          {/* Right Side: Visual Stage */}
          <div className="visual-stage" ref={visualStageRef}>
            {isEsp32 ? (
              <Esp32ExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isMicroSd ? (
              <MicroSdExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isDisplay ? (
              <DisplayExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRegulator ? (
              <RegulatorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isThermistor ? (
              <ThermistorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isBatterySensor ? (
              <BatterySensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRfSensor ? (
              <RfSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isVibrationSensor ? (
              <VibrationSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isEnvSensor ? (
              <EnvSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isBattery ? (
              <BatteryExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isMosfet ? (
              <MosfetExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isTempSensor ? (
              <TempSensorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isConverter ? (
              <ConverterExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isEnergyHarvesting ? (
              <EnergyHarvestingExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isHeatPipe ? (
              <HeatPipeExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRadiator ? (
              <RadiatorExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isStructure ? (
              <StructureExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isPrototypeBoard ? (
              <PrototypeBoardExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isAntenna ? (
              <AntennaExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isInsulation ? (
              <InsulationExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isSolderProtection ? (
              <SolderProtectionExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isRadiationShield ? (
              <RadiationShieldExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isLora ? (
              <LoraExplodedView
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : isHardware ? (
              <HorizontalExplodedView
                scene={scene}
                scrollProgress={progress}
                isSceneActive={active}
              />
            ) : (
              <Placeholder scene={scene} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

``

## src/components/HeatPipeExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Heat Pipe physical discrete parts
// Coordinates in 1200 x 600 artboard
const HEATPIPE_PARTS_CONFIG = [
  {
    id: 'hp_evap',
    name: 'FLATTENED EVAPORATOR SECTION',
    code: 'CU-HP-EVAP',
    spec: 'High-purity OFHC copper flat section in direct thermal contact with primary heat source',
    role: 'HEAT ABSORPTION',
    w: 80,
    h: 120,
    assembled: { x: 500, y: 240 },
    exploded: { x: 200, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 500, y2: 300 }
  },
  {
    id: 'hp_core',
    name: 'SINTERED WICK & VAPOR CORE',
    code: 'SINTERED-WICK-6MM',
    spec: 'Porous sintered copper powder wick for capillary fluid return and central hollow vapor cavity',
    role: 'LATENT HEAT TRANSPORT',
    w: 240,
    h: 40,
    assembled: { x: 500, y: 280 },
    exploded: { x: 500, y: 280 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'hp_cond',
    name: 'ROUND CONDENSER SECTION',
    code: 'CU-HP-COND',
    spec: 'Standard 6mm round copper tube section for mating with aluminum radiator fin arrays',
    role: 'HEAT REJECTION',
    w: 80,
    h: 180,
    assembled: { x: 680, y: 210 },
    exploded: { x: 920, y: 210 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 680, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function HeatPipeExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    HEATPIPE_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="heatpipe-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="hp-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="hp-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="cu-pipe-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#874a2b" />
              <stop offset="30%" stopColor="#c77242" />
              <stop offset="70%" stopColor="#d9895b" />
              <stop offset="100%" stopColor="#6e3920" />
            </linearGradient>
            
            <linearGradient id="cu-flat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c77242" />
              <stop offset="100%" stopColor="#a3572d" />
            </linearGradient>

            <pattern id="sintered-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#753516" />
              <circle cx="0" cy="0" r="1" fill="#4d220e" />
              <circle cx="4" cy="4" r="1" fill="#4d220e" />
            </pattern>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {HEATPIPE_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id === 'hp_evap';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#hp-marker-orange)' : 'url(#hp-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {HEATPIPE_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: FLATTENED EVAPORATOR */}
                  {part.id === 'hp_evap' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="8" fill="url(#cu-flat-grad)" stroke="#874a2b" strokeWidth="2" />
                      {/* Thermal paste residue indicator */}
                      <path d="M 20,20 Q 40,40 30,60 T 50,90 Q 60,60 50,30 Z" fill="#b0bcc7" opacity="0.7" />
                      {/* Crimp end */}
                      <path d="M 0,0 L 0,120 L -10,110 L -10,10 Z" fill="#874a2b" stroke="#522c19" strokeWidth="1" />
                    </g>
                  )}

                  {/* PART 2: SINTERED WICK AND VAPOR CORE */}
                  {part.id === 'hp_core' && (
                    <g>
                      {/* Outer boundary of the wick */}
                      <rect x="0" y="0" width={part.w} height={part.h} fill="url(#sintered-pattern)" stroke="#874a2b" strokeWidth="1" />
                      {/* Vapor channel (hollow core) */}
                      <rect x="0" y="10" width={part.w} height="20" fill="#301306" stroke="#4d220e" strokeWidth="2" />
                      
                      {/* Vapor flow arrows (animated if we wanted) */}
                      <path d="M 20,15 L 40,15 L 35,10 M 40,15 L 35,20" fill="none" stroke="#d9895b" strokeWidth="2" opacity="0.6" />
                      <path d="M 120,15 L 140,15 L 135,10 M 140,15 L 135,20" fill="none" stroke="#d9895b" strokeWidth="2" opacity="0.6" />
                      
                      {/* Fluid return arrows */}
                      <path d="M 40,30 L 20,30 L 25,25 M 20,30 L 25,35" fill="none" stroke="#6589c2" strokeWidth="2" opacity="0.6" />
                      <path d="M 140,30 L 120,30 L 125,25 M 120,30 L 125,35" fill="none" stroke="#6589c2" strokeWidth="2" opacity="0.6" />
                    </g>
                  )}

                  {/* PART 3: ROUND CONDENSER */}
                  {part.id === 'hp_cond' && (
                    <g>
                      {/* Vertical copper tube */}
                      <rect x="0" y="0" width="30" height={part.h} rx="15" fill="url(#cu-pipe-grad)" stroke="#522c19" strokeWidth="1.5" />
                      
                      {/* Pipe bending marks / texture */}
                      <line x1="5" y1="40" x2="25" y2="40" stroke="#a3572d" strokeWidth="1" opacity="0.6" />
                      <line x1="5" y1="80" x2="25" y2="80" stroke="#a3572d" strokeWidth="1" opacity="0.6" />
                      <line x1="5" y1="120" x2="25" y2="120" stroke="#a3572d" strokeWidth="1" opacity="0.6" />
                      
                      {/* Top crimp tip */}
                      <path d="M 0,0 L 30,0 L 20,-10 L 10,-10 Z" fill="#c77242" stroke="#522c19" strokeWidth="1" />
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? HEATPIPE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'COPPER HEAT PIPE · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? HEATPIPE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? HEATPIPE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/HorizontalExplodedView.jsx

``jsx
import React, { useState } from 'react';
import { Zap, Radio, Thermometer, ShieldAlert, Cpu } from 'lucide-react';

const COMPONENT_CUTOUT_MAP = {
  esp32: {
    prefix: 'esp32',
    cutout: '/components/cutouts/esp32.png',
    slices: [
      '/components/slices/esp32-left.png',
      '/components/slices/esp32-center.png',
      '/components/slices/esp32-right.png'
    ],
    baseW: 220,
    baseH: 420,
    maxDisplacement: 155
  },
  microsd: {
    prefix: 'microsd',
    cutout: '/components/cutouts/microsd.png',
    slices: [
      '/components/slices/microsd-left.png',
      '/components/slices/microsd-center.png',
      '/components/slices/microsd-right.png'
    ],
    baseW: 340,
    baseH: 248,
    maxDisplacement: 150
  },
  regulator: {
    prefix: 'voltage-regulator',
    cutout: '/components/cutouts/voltage-regulator.png',
    slices: [
      '/components/slices/voltage-regulator-left.png',
      '/components/slices/voltage-regulator-center.png',
      '/components/slices/voltage-regulator-right.png'
    ],
    baseW: 320,
    baseH: 312,
    maxDisplacement: 160
  },
  thermistor: {
    prefix: 'thermistor',
    cutout: '/components/cutouts/thermistor.png',
    slices: [
      '/components/slices/thermistor-left.png',
      '/components/slices/thermistor-center.png',
      '/components/slices/thermistor-right.png'
    ],
    baseW: 210,
    baseH: 345,
    maxDisplacement: 145
  },
  'battery-sensor': {
    prefix: 'battery-voltage-sensor',
    cutout: '/components/cutouts/battery-voltage-sensor.png',
    slices: [
      '/components/slices/battery-voltage-sensor-left.png',
      '/components/slices/battery-voltage-sensor-center.png',
      '/components/slices/battery-voltage-sensor-right.png'
    ],
    baseW: 350,
    baseH: 305,
    maxDisplacement: 160
  },
  'rf-sensor': {
    prefix: 'rf-sensor',
    cutout: '/components/cutouts/rf-sensor.png',
    slices: [
      '/components/slices/rf-sensor-left.png',
      '/components/slices/rf-sensor-center.png',
      '/components/slices/rf-sensor-right.png'
    ],
    baseW: 330,
    baseH: 297,
    maxDisplacement: 155
  },
  battery: {
    prefix: 'battery-pack',
    cutout: '/components/cutouts/battery-pack.png',
    slices: [
      '/components/slices/battery-pack-left.png',
      '/components/slices/battery-pack-center.png',
      '/components/slices/battery-pack-right.png'
    ],
    baseW: 340,
    baseH: 305,
    maxDisplacement: 165
  },
  mosfet: {
    prefix: 'mosfet',
    cutout: '/components/cutouts/mosfet.png',
    slices: [
      '/components/slices/mosfet-left.png',
      '/components/slices/mosfet-center.png',
      '/components/slices/mosfet-right.png'
    ],
    baseW: 330,
    baseH: 275,
    maxDisplacement: 150
  },
  'temp-sensor': {
    prefix: 'temperature-sensor',
    cutout: '/components/cutouts/temperature-sensor.png',
    slices: [
      '/components/slices/temperature-sensor-left.png',
      '/components/slices/temperature-sensor-center.png',
      '/components/slices/temperature-sensor-right.png'
    ],
    baseW: 280,
    baseH: 337,
    maxDisplacement: 150
  },
  converter: {
    prefix: 'dc-dc-converter',
    cutout: '/components/cutouts/dc-dc-converter.png',
    slices: [
      '/components/slices/dc-dc-converter-left.png',
      '/components/slices/dc-dc-converter-center.png',
      '/components/slices/dc-dc-converter-right.png'
    ],
    baseW: 350,
    baseH: 284,
    maxDisplacement: 165
  },
  'heat-pipe': {
    prefix: 'heat-pipe',
    cutout: '/components/cutouts/heat-pipe.png',
    slices: [
      '/components/slices/heat-pipe-left.png',
      '/components/slices/heat-pipe-center.png',
      '/components/slices/heat-pipe-right.png'
    ],
    baseW: 390,
    baseH: 205,
    maxDisplacement: 170
  },
  radiator: {
    prefix: 'radiator',
    cutout: '/components/cutouts/radiator.png',
    slices: [
      '/components/slices/radiator-left.png',
      '/components/slices/radiator-center.png',
      '/components/slices/radiator-right.png'
    ],
    baseW: 340,
    baseH: 300,
    maxDisplacement: 160
  },
  structure: {
    prefix: 'aluminium-structure',
    cutout: '/components/cutouts/aluminium-structure.png',
    slices: [
      '/components/slices/aluminium-structure-left.png',
      '/components/slices/aluminium-structure-center.png',
      '/components/slices/aluminium-structure-right.png'
    ],
    baseW: 380,
    baseH: 295,
    maxDisplacement: 175
  },
  lora: {
    prefix: 'lora-module',
    cutout: '/components/cutouts/lora-module.png',
    slices: [
      '/components/slices/lora-module-left.png',
      '/components/slices/lora-module-center.png',
      '/components/slices/lora-module-right.png'
    ],
    baseW: 320,
    baseH: 331,
    maxDisplacement: 155
  },
  antenna: {
    prefix: 'antenna',
    cutout: '/components/cutouts/antenna.png',
    slices: [
      '/components/slices/antenna-left.png',
      '/components/slices/antenna-center.png',
      '/components/slices/antenna-right.png'
    ],
    baseW: 220,
    baseH: 356,
    maxDisplacement: 150
  }
};

export default function HorizontalExplodedView({ scene, scrollProgress = 0, isSceneActive = false }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const config = COMPONENT_CUTOUT_MAP[scene.id] || {
    prefix: 'microsd',
    cutout: scene.image || '/components/cutouts/microsd.png',
    slices: [
      '/components/slices/microsd-left.png',
      '/components/slices/microsd-center.png',
      '/components/slices/microsd-right.png'
    ],
    baseW: 320,
    baseH: 280,
    maxDisplacement: 150
  };

  // Clamp & smooth scroll progress (0.0 to 1.0)
  const p = Math.max(0, Math.min(1, scrollProgress));
  // Smooth ease-out cubic interpolation for natural hardware explosion
  const easedP = 1 - Math.pow(1 - p, 2.5);

  const displacement = config.maxDisplacement * easedP;
  const isExploded = p >= 0.12;
  const isFullyExploded = p >= 0.85;

  const isRf = scene.effect === 'rf';
  const isPower = scene.effect === 'power';
  const isHeat = scene.effect === 'heat';

  const layers = scene.layers && scene.layers.length >= 3
    ? scene.layers
    : ['INTERFACE STAGE', 'CORE ASSEMBLY', 'TERMINAL LEADS'];

  // Slice metadata for hover inspection
  const sliceMeta = [
    {
      idx: 0,
      title: layers[0],
      axis: 'WEST (LEFT) HORIZONTAL PROJECTION',
      role: 'EXTERNAL INTERFACE & INGRESS SURFACE',
      desc: 'Outer physical boundary and primary routing contacts'
    },
    {
      idx: 1,
      title: layers[1],
      axis: 'CENTRAL (CORE) ASSEMBLY NUCLEUS',
      role: 'CORE FUNCTIONAL & SUBSTRATE LOGIC',
      desc: 'Central processing matrix, primary die, and substrate bus'
    },
    {
      idx: 2,
      title: layers[2],
      axis: 'EAST (RIGHT) HORIZONTAL PROJECTION',
      role: 'POWER RAIL & TERMINAL INTERFACE',
      desc: 'Ground connection, decoupling capacitors, and trace egress'
    }
  ];

  const activeMeta = hoveredSlice !== null ? sliceMeta[hoveredSlice] : null;

  return (
    <div
      className="horizontal-inspection-object"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'visible',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid & Center Crosshairs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '8px' }}>
          {/* Subtle grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          {/* Axis markers */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Corner Framing Reticles */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* Ambient Effects */}
        {isRf && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <i className="wave wave-one" />
            <i className="wave wave-two" />
          </div>
        )}
        {isPower && (
          <div className="energy-flow" style={{ pointerEvents: 'none' }}>
            <Zap size={14} />
            <i />
            <Zap size={14} />
          </div>
        )}
        {isHeat && (
          <div className="heat-flow" style={{ pointerEvents: 'none' }}>
            <i />
            <i />
            <i />
          </div>
        )}

        {/* SVG Laser Projection Alignment Lines along Horizontal Axis */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          <defs>
            <marker id={`pip-lime-${scene.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id={`pip-orange-${scene.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>
          </defs>

          {/* Dynamic Laser Guide Lines (Visible when separating) */}
          <g opacity={p > 0.04 ? Math.min(1, (p - 0.04) * 3) : 0} style={{ transition: 'opacity 0.2s' }}>
            {/* Left projection track */}
            <line
              x1={`calc(50% - ${config.baseW * 0.28 + displacement}px)`}
              y1="50%"
              x2="calc(50% - 15px)"
              y2="50%"
              stroke="#c9e87b"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              strokeOpacity="0.75"
              markerStart={`url(#pip-lime-${scene.id})`}
              markerEnd={`url(#pip-lime-${scene.id})`}
            />

            {/* Right projection track */}
            <line
              x1="calc(50% + 15px)"
              y1="50%"
              x2={`calc(50% + ${config.baseW * 0.28 + displacement}px)`}
              y2="50%"
              stroke="#ff8158"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              strokeOpacity="0.75"
              markerStart={`url(#pip-orange-${scene.id})`}
              markerEnd={`url(#pip-orange-${scene.id})`}
            />
          </g>
        </svg>

        {/* Horizontal Moving Pictures Assembly Container */}
        <div
          style={{
            position: 'relative',
            width: `${config.baseW}px`,
            height: `${config.baseH}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4
          }}
        >
          {/* SLICE 1 (LEFT MOVING PICTURE) */}
          <div
            onMouseEnter={() => setHoveredSlice(0)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${config.baseW * 0.38}px`,
              height: '100%',
              transform: `translateX(-${displacement}px)`,
              transition: 'transform 0.08s linear, filter 0.2s',
              cursor: 'pointer',
              zIndex: hoveredSlice === 0 ? 10 : 5
            }}
          >
            <img
              src={config.slices[0]}
              alt={`${scene.title} - Left Layer`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  hoveredSlice === 0
                    ? 'drop-shadow(0 0 15px rgba(201, 232, 123, 0.8)) brightness(1.2)'
                    : isExploded
                    ? 'drop-shadow(-8px 12px 16px rgba(0, 0, 0, 0.6))'
                    : 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* Hover Accent Frame */}
            {hoveredSlice === 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '1px dashed #c9e87b',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Floating Layer Callout Badge (Left) */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                opacity: p > 0.08 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(12, 16, 16, 0.94)',
                  border: '1px solid #c9e87b',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  font: '700 8px "DM Mono", monospace',
                  color: '#c9e87b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}
              >
                <span>●</span>
                <span>01 · {layers[0]}</span>
              </div>
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: '#c9e87b',
                  margin: '0 auto'
                }}
              />
            </div>
          </div>

          {/* SLICE 2 (CENTER MOVING PICTURE / CORE ANCHOR) */}
          <div
            onMouseEnter={() => setHoveredSlice(1)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              position: 'absolute',
              left: `${config.baseW * 0.31}px`,
              top: 0,
              width: `${config.baseW * 0.38}px`,
              height: '100%',
              transform: `scale(${1 + 0.04 * easedP})`,
              transition: 'transform 0.08s linear, filter 0.2s',
              cursor: 'pointer',
              zIndex: hoveredSlice === 1 ? 10 : 4
            }}
          >
            <img
              src={config.slices[1]}
              alt={`${scene.title} - Center Core`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  hoveredSlice === 1
                    ? 'drop-shadow(0 0 16px rgba(201, 232, 123, 0.9)) brightness(1.2)'
                    : isExploded
                    ? 'drop-shadow(0 14px 18px rgba(0, 0, 0, 0.7))'
                    : 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* Hover Accent Frame */}
            {hoveredSlice === 1 && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '1px dashed #c9e87b',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Floating Layer Callout Badge (Center) */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                opacity: p > 0.08 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: '#c9e87b',
                  margin: '0 auto'
                }}
              />
              <div
                style={{
                  background: 'rgba(12, 16, 16, 0.94)',
                  border: '1px solid #c9e87b',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  font: '700 8px "DM Mono", monospace',
                  color: '#ecf0ea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}
              >
                <span style={{ color: '#c9e87b' }}>●</span>
                <span>02 · {layers[1]} (CORE)</span>
              </div>
            </div>
          </div>

          {/* SLICE 3 (RIGHT MOVING PICTURE) */}
          <div
            onMouseEnter={() => setHoveredSlice(2)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              position: 'absolute',
              left: `${config.baseW * 0.62}px`,
              top: 0,
              width: `${config.baseW * 0.38}px`,
              height: '100%',
              transform: `translateX(${displacement}px)`,
              transition: 'transform 0.08s linear, filter 0.2s',
              cursor: 'pointer',
              zIndex: hoveredSlice === 2 ? 10 : 5
            }}
          >
            <img
              src={config.slices[2]}
              alt={`${scene.title} - Right Layer`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  hoveredSlice === 2
                    ? 'drop-shadow(0 0 15px rgba(255, 129, 88, 0.8)) brightness(1.2)'
                    : isExploded
                    ? 'drop-shadow(8px 12px 16px rgba(0, 0, 0, 0.6))'
                    : 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* Hover Accent Frame */}
            {hoveredSlice === 2 && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '1px dashed #ff8158',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Floating Layer Callout Badge (Right) */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                opacity: p > 0.08 ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(12, 16, 16, 0.94)',
                  border: '1px solid #ff8158',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  font: '700 8px "DM Mono", monospace',
                  color: '#ff8158',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}
              >
                <span>●</span>
                <span>03 · {layers[2]}</span>
              </div>
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  background: '#ff8158',
                  margin: '0 auto'
                }}
              />
            </div>
          </div>
        </div>

        {/* Hover Inspection / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '14px',
            right: '14px',
            background: 'rgba(12, 16, 16, 0.92)',
            border: '1px solid rgba(222, 232, 224, 0.18)',
            padding: '7px 14px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 10px "DM Mono", monospace',
                color: activeMeta ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {activeMeta ? `LAYER 0${activeMeta.idx + 1}: ${activeMeta.title}` : `${scene.role}`}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8f9a91',
                marginTop: '2px'
              }}
            >
              {activeMeta ? activeMeta.desc : 'SCROLL TO SEPARATE COMPONENT INTO ITS PHYSICAL HORIZONTAL LAYERS'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222, 232, 224, 0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {activeMeta ? activeMeta.axis : '3 HORIZONTAL SECTORS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/InsulationExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect } from 'react';

const INSULATION_PARTS_CONFIG = [
  {
    id: 'ins_top',
    name: 'TOP DIELECTRIC FILM',
    code: 'KAPTON-PI-50UM-T',
    spec: '50-micron polyimide film with high dielectric strength and thermal stability',
    role: 'SURFACE ISOLATION',
    w: 180,
    h: 280,
    assembled: { x: 510, y: 160 },
    exploded: { x: 150, y: 160 },
    start: 0.1,
    end: 0.6,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 510, y2: 300 }
  },
  {
    id: 'ins_core',
    name: 'ISOLATION MATRIX',
    code: 'EPOXY-FR4-HV-CORE',
    spec: 'Solid flame-retardant epoxy matrix blocking high-potential arc flash paths',
    role: 'PRIMARY BARRIER',
    w: 220,
    h: 320,
    assembled: { x: 490, y: 140 },
    exploded: { x: 490, y: 140 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'ins_bottom',
    name: 'BOTTOM DIELECTRIC FILM',
    code: 'KAPTON-PI-50UM-B',
    spec: '50-micron polyimide film protecting lower routing channels and ground plane',
    role: 'SUBSTRATE ISOLATION',
    w: 180,
    h: 280,
    assembled: { x: 510, y: 160 },
    exploded: { x: 870, y: 160 },
    start: 0.1,
    end: 0.6,
    step: 3,
    line: { x1: 510, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function InsulationExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    INSULATION_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  return (
    <div
      className="insulation-view-container"
      style={{
        position: 'relative', width: '100%', maxWidth: '680px', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none'
      }}
    >
      <div
        style={{
          position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box'
        }}
      >
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' /* removed filter for perf */ }}>
          <defs>
            <marker id="ins-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <linearGradient id="polyimide-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212, 143, 38, 0.7)" />
              <stop offset="100%" stopColor="rgba(163, 94, 15, 0.85)" />
            </linearGradient>
            <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a252c" />
              <stop offset="100%" stopColor="#0f161a" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {INSULATION_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#c9e87b" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#ins-marker-lime)" markerEnd="url(#ins-marker-lime)" />
                </g>
              );
            })}
          </g>

          {/* Physical Parts */}
          {INSULATION_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            return (
              <g 
                key={part.id} 
                onMouseEnter={() => setHoveredPart(part.id)} 
                onMouseLeave={() => setHoveredPart(null)} 
                ref={(el) => { partGroupRefs.current[part.id] = el; }} 
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                style={{ 
                  cursor: 'pointer', 
                  willChange: 'transform', 
                  filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', 
                  transition: 'filter 0.15s ease-out' 
                }}
              >
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#c9e87b" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                
                {part.id.includes('top') || part.id.includes('bottom') ? (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#polyimide-grad)" stroke="#dca843" strokeWidth="2" opacity="0.9" />
                    {/* Dielectric Texture */}
                    <path d="M 20,20 L 160,260 M 160,20 L 20,260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="20" cy="20" r="4" fill="#8c5008" />
                    <circle cx="160" cy="20" r="4" fill="#8c5008" />
                    <circle cx="20" cy="260" r="4" fill="#8c5008" />
                    <circle cx="160" cy="260" r="4" fill="#8c5008" />
                  </g>
                ) : (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="6" fill="url(#core-grad)" stroke="#2b3b47" strokeWidth="3" />
                    <rect x="20" y="20" width={part.w - 40} height={part.h - 40} fill="none" stroke="#212f38" strokeWidth="2" strokeDasharray="4 4" />
                    <text x={part.w / 2} y={part.h / 2} fill="#465c6b" fontFamily="'DM Mono', monospace" fontSize="14" fontWeight="bold" textAnchor="middle">HV-ISO MATRIX</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea' }}>
              {hoveredPart ? INSULATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'HIGH-VOLTAGE INSULATION · 3 DISCRETE LAYERS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? INSULATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#c9e87b', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px' }}>
            {hoveredPart ? INSULATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/LoraExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// LoRa Module physical discrete parts
// Coordinates in 1200 x 600 artboard
const LORA_PARTS_CONFIG = [
  {
    id: 'lora_shield',
    name: 'NICKEL-SILVER RF SHIELD',
    code: 'SHIELD-SX1276-RF',
    spec: 'Stamped nickel-silver alloy shielding can to prevent RF leakage and external EMI interference',
    role: 'ELECTROMAGNETIC ISOLATION',
    w: 100,
    h: 120,
    assembled: { x: 550, y: 220 },
    exploded: { x: 250, y: 220 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 280, x2: 550, y2: 280 }
  },
  {
    id: 'lora_pcb',
    name: 'TRANSCEIVER IC & SUBSTRATE',
    code: 'SX1276-LORA-NODE',
    spec: 'High-frequency FR4 PCB integrating the Semtech SX1276 LoRa transceiver and matching network',
    role: 'LONG-RANGE RF MODEM',
    w: 140,
    h: 180,
    assembled: { x: 530, y: 190 },
    exploded: { x: 530, y: 190 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'lora_pins',
    name: 'CASTELLATED PAD INTERFACE',
    code: 'CAST-PAD-2.0MM',
    spec: 'Gold-plated half-hole castellated edges for surface mount soldering or header pin attachment',
    role: 'POWER, SPI & RF I/O',
    w: 160,
    h: 200,
    assembled: { x: 520, y: 180 },
    exploded: { x: 820, y: 180 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 520, y1: 280, x2: 'left', y2: 280 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function LoraExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    LORA_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="lora-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="lora-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="lora-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="lora-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1dae3" />
              <stop offset="50%" stopColor="#aab4c2" />
              <stop offset="100%" stopColor="#7a8794" />
            </linearGradient>

            <linearGradient id="lora-pcb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5831" />
              <stop offset="100%" stopColor="#11361c" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {LORA_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id === 'lora_shield';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#lora-marker-orange)' : 'url(#lora-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {LORA_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: RF SHIELD */}
                  {part.id === 'lora_shield' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="2" fill="url(#lora-shield-grad)" stroke="#5f6770" strokeWidth="1.5" />
                      {/* Shield Dimples */}
                      <circle cx="10" cy="10" r="2" fill="#5f6770" />
                      <circle cx="90" cy="10" r="2" fill="#5f6770" />
                      <circle cx="10" cy="110" r="2" fill="#5f6770" />
                      <circle cx="90" cy="110" r="2" fill="#5f6770" />
                      
                      {/* Laser-etched text */}
                      <text x="50" y="55" fill="#49525c" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">SX1276</text>
                      <text x="50" y="75" fill="#5f6770" fontFamily="'DM Mono', monospace" fontSize="9" textAnchor="middle">915 MHz</text>
                    </g>
                  )}

                  {/* PART 2: LORA PCB */}
                  {part.id === 'lora_pcb' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#lora-pcb-grad)" stroke="#1a4726" strokeWidth="2" />
                      
                      {/* Shield footprint outline */}
                      <rect x="20" y="30" width="100" height="120" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
                      
                      {/* Transceiver IC */}
                      <rect x="50" y="60" width="40" height="40" rx="1" fill="#111" stroke="#333" strokeWidth="1" />
                      <circle cx="55" cy="65" r="2" fill="#444" />
                      <text x="70" y="80" fill="#666" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">SEMTECH</text>
                      
                      {/* Crystal Oscillator (TCXO) */}
                      <rect x="60" y="110" width="20" height="15" fill="#b0bcc7" stroke="#7a8794" strokeWidth="1" />
                      
                      {/* RF Matching Network (Inductors/Caps) */}
                      <rect x="35" y="45" width="8" height="12" fill="#111" />
                      <rect x="50" y="45" width="8" height="12" fill="#c4a56c" />
                      <rect x="65" y="45" width="8" height="12" fill="#111" />
                      
                      {/* RF Trace to antenna pad */}
                      <path d="M 70,45 L 70,10" fill="none" stroke="#d4af37" strokeWidth="3" />
                      <circle cx="70" cy="10" r="5" fill="#d4af37" />
                    </g>
                  )}

                  {/* PART 3: CASTELLATED PADS */}
                  {part.id === 'lora_pins' && (
                    <g>
                      {/* Gold plated half-holes along the edges */}
                      
                      {/* Left edge castellations */}
                      {[30, 50, 70, 90, 110, 130, 150].map((py, i) => (
                        <g key={`l-${i}`}>
                          {/* Inner pad */}
                          <rect x="5" y={py - 3} width="10" height="6" fill="#d4af37" />
                          {/* Half hole cut */}
                          <path d={`M 0,${py - 4} A 4,4 0 0,1 0,${py + 4}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
                        </g>
                      ))}
                      
                      {/* Right edge castellations */}
                      {[30, 50, 70, 90, 110, 130, 150].map((py, i) => (
                        <g key={`r-${i}`}>
                          {/* Inner pad */}
                          <rect x={part.w - 15} y={py - 3} width="10" height="6" fill="#d4af37" />
                          {/* Half hole cut */}
                          <path d={`M ${part.w},${py - 4} A 4,4 0 0,0 ${part.w},${py + 4}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
                        </g>
                      ))}
                      
                      <text x="-15" y="32" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">GND</text>
                      <text x="-15" y="52" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">MISO</text>
                      <text x="-15" y="72" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">MOSI</text>
                      <text x="-15" y="92" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">SCK</text>
                      <text x="-15" y="112" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">NSS</text>
                      
                      <text x={part.w + 5} y="32" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">3.3V</text>
                      <text x={part.w + 5} y="52" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">RST</text>
                      <text x={part.w + 5} y="72" fill="#c9e87b" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">DIO0</text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? LORA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'LORA RF TRANSCEIVER MODULE · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? LORA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? LORA_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/MicroSdExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// SanDisk Extreme PRO MicroSD card physical discrete parts
// Coordinates in 1200 x 650 artboard:
// Assembled center: X: 480, Y: 180, W: 240, h: 320
const MICROSD_PARTS_CONFIG = [
  {
    id: 'sd_faceplate',
    name: 'FRONT BRANDED FACEPLATE / TOP CASING',
    code: 'SD-CASING-TOP-EXTREME-PRO',
    spec: 'Red/black polymer laser-etched faceplate with UHS-I Class 10 U3 V30 A2 ratings',
    role: 'CHASSIS SEAL & LABELLING',
    w: 140,
    h: 195,
    assembled: { x: 530, y: 220 },
    exploded: { x: 50, y: 220 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 317, x2: 530, y2: 317 }
  },
  {
    id: 'sd_front_spacer',
    name: 'INTERNAL STRUCTURAL FRAME / SPACER',
    code: 'SD-SPACER-FRAME-ABS',
    spec: 'Injection-molded polycarbonate structural cavity spacer for internal silicon die protection',
    role: 'DIE ISOLATION & SHOCK BUFFER',
    w: 135,
    h: 195,
    assembled: { x: 530, y: 220 },
    exploded: { x: 215, y: 220 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 317, x2: 530, y2: 317 }
  },
  {
    id: 'sd_nand_die',
    name: '1TB 3D NAND FLASH MEMORY DIE',
    code: 'SANDISK-BICS5-3D-TLC',
    spec: '112-layer 3D TLC NAND flash memory multi-die stacked silicon BGA substrate package',
    role: 'HIGH-DENSITY MASS DATA STORE',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 375, y: 222 },
    start: 0.20,
    end: 0.65,
    step: 3,
    line: { x1: 'right', y1: 317, x2: 535, y2: 317 }
  },
  {
    id: 'sd_controller',
    name: 'FLASH MEMORY CONTROLLER ASIC',
    code: 'SANDISK-CTL-4CH-ECC',
    spec: 'Proprietary 4-channel RISC-V flash controller with LDPC error correction and wear leveling',
    role: 'STORAGE TRANSLATION & BUS I/O',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 535, y: 222 },
    start: 0,
    end: 0,
    step: 4
  },
  {
    id: 'sd_pcb_substrate',
    name: 'HIGH-DENSITY INTERCONNECT (HDI) PCB',
    code: 'SD-HDI-FR4-SUBSTRATE',
    spec: 'Micro-via multi-layer green circuit substrate with precision gold test points and interconnect vias',
    role: 'SIGNAL ROUTING & POWER RAIL',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 695, y: 222 },
    start: 0.20,
    end: 0.65,
    step: 5,
    line: { x1: 535, y1: 317, x2: 'left', y2: 317 }
  },
  {
    id: 'sd_contact_pins',
    name: '8-PIN GOLD CONTACT INTERFACE ARRAY',
    code: 'CONN-SD-8P-AU-FINGERS',
    spec: '30μm hard gold-plated 8-pin UHS-I bus interface fingers (DAT0-DAT3, CLK, CMD, VDD, VSS)',
    role: 'HIGH-SPEED PHYSICAL HOST BUS',
    w: 130,
    h: 190,
    assembled: { x: 535, y: 222 },
    exploded: { x: 855, y: 222 },
    start: 0.12,
    end: 0.55,
    step: 6,
    line: { x1: 535, y1: 317, x2: 'left', y2: 317 }
  },
  {
    id: 'sd_rear_shell',
    name: 'REAR PROTECTIVE ENCLOSURE BACKPLATE',
    code: 'SD-HOUSING-BACK-MOLD',
    spec: 'High-impact molded black plastic rear casing with retention extraction ridge and side rails',
    role: 'STRUCTURAL BASE & CONTACT RESTRAINT',
    w: 135,
    h: 195,
    assembled: { x: 530, y: 220 },
    exploded: { x: 1015, y: 220 },
    start: 0.05,
    end: 0.45,
    step: 7,
    line: { x1: 530, y1: 317, x2: 'left', y2: 317 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function MicroSdExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    MICROSD_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const isExploded = progress >= 0.06;

  // MicroSD silhouette path helper
  // Normal MicroSD shape: 130 wide x 190 tall with bottom-right bevel/notch and top rounded corners
  const sdOuterPath = (w, h) =>
    `M 8,0 L ${w - 8},0 Q ${w},0 ${w},8 L ${w},${h - 42} L ${w - 14},${h - 24} L ${w - 14},${h - 8} Q ${w - 14},${h} ${w - 22},${h} L 18,${h} Q 0,${h} 0,${h - 18} L 0,8 Q 0,0 8,0 Z`;

  return (
    <div
      className="microsd-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 650 */}
        <svg
          viewBox="0 0 1200 650"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="sd-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="sd-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            {/* MicroSD Gradients */}
            <linearGradient id="sd-red-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e52628" />
              <stop offset="100%" stopColor="#aa1416" />
            </linearGradient>

            <linearGradient id="sd-black-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#25272a" />
              <stop offset="50%" stopColor="#181a1c" />
              <stop offset="100%" stopColor="#0f1112" />
            </linearGradient>

            <linearGradient id="sd-gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fae68b" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#aa8214" />
            </linearGradient>

            <linearGradient id="sd-pcb-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5831" />
              <stop offset="100%" stopColor="#11361c" />
            </linearGradient>

            <linearGradient id="sd-silicon-die" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e3338" />
              <stop offset="40%" stopColor="#1e2225" />
              <stop offset="100%" stopColor="#131618" />
            </linearGradient>

            {/* Drop Shadow for components */}
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {MICROSD_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id.includes('nand') || part.id.includes('contact');
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#sd-marker-orange)' : 'url(#sd-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* 7 Physical Discrete MicroSD Parts */}
          {MICROSD_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                {/* Graphical Render for each discrete part */}
                <g>
                  {/* PART 1: FRONT FACEPLATE */}
                  {part.id === 'sd_faceplate' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="url(#sd-black-gradient)" stroke="#383b40" strokeWidth="1.5" />
                      {/* Top Red Header Band */}
                      <path
                        d={`M 8,0 L ${part.w - 8},0 Q ${part.w},0 ${part.w},8 L ${part.w},74 L 0,74 L 0,8 Q 0,0 8,0 Z`}
                        fill="url(#sd-red-gradient)"
                      />
                      {/* SanDisk text */}
                      <text x={part.w / 2} y="34" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontWeight="800" fontSize="18" textAnchor="middle" letterSpacing="0.4">
                        SanDisk
                      </text>
                      <text x={part.w / 2} y="54" fill="#ffffff" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="13" fontStyle="italic" textAnchor="middle">
                        Extreme PRO
                      </text>
                      {/* Gold capacity & rating */}
                      <text x="24" y="108" fill="url(#sd-gold-foil)" fontFamily="'DM Mono', monospace" fontWeight="900" fontSize="28">
                        1TB
                      </text>
                      <text x="24" y="132" fill="url(#sd-gold-foil)" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="12">
                        microSD XC I
                      </text>
                      <text x="24" y="152" fill="url(#sd-gold-foil)" fontFamily="'DM Mono', monospace" fontWeight="700" fontSize="11">
                        [3] A2 · V30
                      </text>
                      {/* Grip notch */}
                      <path d={`M ${part.w / 2 - 12},${part.h - 14} L ${part.w / 2 + 12},${part.h - 14} L ${part.w / 2},${part.h - 4} Z`} fill="#2d3035" />
                    </g>
                  )}

                  {/* PART 2: INNER PLASTIC FRAME */}
                  {part.id === 'sd_front_spacer' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="#16181a" stroke="#33373b" strokeWidth="1.5" />
                      {/* Internal Hollow Cavity for Die */}
                      <rect x="14" y="18" width={part.w - 28} height={part.h - 40} rx="4" fill="#0c0d0e" stroke="#25282c" strokeWidth="1.2" />
                      <line x1="20" y1="36" x2={part.w - 20} y2="36" stroke="#222529" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="130" x2={part.w - 20} y2="130" stroke="#222529" strokeWidth="1" strokeDasharray="3 3" />
                      <text x={part.w / 2} y="95" fill="#444b52" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">
                        CHASSIS CAVITY
                      </text>
                    </g>
                  )}

                  {/* PART 3: 3D NAND FLASH DIE */}
                  {part.id === 'sd_nand_die' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="url(#sd-silicon-die)" stroke="#8e5d2d" strokeWidth="2.5" />
                      <rect x="4" y="4" width={part.w - 8} height={part.h - 8} rx="2" fill="none" stroke="#3e454d" strokeWidth="1" />
                      {/* Laser-etched branding */}
                      <text x={part.w / 2} y="70" fill="#ced4da" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="16" textAnchor="middle" letterSpacing="0.8">
                        SanDisk
                      </text>
                      <text x={part.w / 2} y="96" fill="#9ba5af" fontFamily="'DM Mono', monospace" fontWeight="600" fontSize="11" textAnchor="middle">
                        NAND Flash
                      </text>
                      <text x={part.w / 2} y="114" fill="#9ba5af" fontFamily="'DM Mono', monospace" fontWeight="600" fontSize="11" textAnchor="middle">
                        Memory
                      </text>
                      <text x={part.w / 2} y="148" fill="#6c757d" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">
                        112L BiCS5 3D TLC
                      </text>
                    </g>
                  )}

                  {/* PART 4: CONTROLLER ASIC */}
                  {part.id === 'sd_controller' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#sd-pcb-green)" stroke="#2b6b3e" strokeWidth="1.5" />
                      {/* Controller IC Chip in center */}
                      <rect x="22" y="38" width={part.w - 44} height="95" rx="3" fill="#14171a" stroke="#40464d" strokeWidth="1.8" />
                      <text x={part.w / 2} y="78" fill="#ced4da" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="13" textAnchor="middle">
                        SanDisk
                      </text>
                      <text x={part.w / 2} y="100" fill="#9ba5af" fontFamily="'DM Mono', monospace" fontWeight="600" fontSize="10" textAnchor="middle">
                        Controller
                      </text>
                      {/* Surrounding SMD Ceramic Capacitors */}
                      <rect x="8" y="42" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x="8" y="65" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x="8" y="88" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x={part.w - 16} y="45" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x={part.w - 16} y="72" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      <rect x={part.w - 16} y="98" width="8" height="14" rx="1" fill="#c49a45" stroke="#eee" strokeWidth="0.5" />
                      {/* Bottom test via array */}
                      <circle cx="35" cy="155" r="3" fill="#e6c875" />
                      <circle cx="55" cy="155" r="3" fill="#e6c875" />
                      <circle cx="75" cy="155" r="3" fill="#e6c875" />
                      <circle cx="95" cy="155" r="3" fill="#e6c875" />
                    </g>
                  )}

                  {/* PART 5: HDI PCB SUBSTRATE */}
                  {part.id === 'sd_pcb_substrate' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="url(#sd-pcb-green)" stroke="#2b6b3e" strokeWidth="1.5" />
                      {/* Gold test pads grid */}
                      <rect x="22" y="24" width="14" height="14" fill="#d4af37" rx="1" />
                      <rect x="46" y="24" width="14" height="14" fill="#d4af37" rx="1" />
                      <rect x="70" y="24" width="14" height="14" fill="#d4af37" rx="1" />
                      <rect x="94" y="24" width="18" height="18" fill="#d4af37" rx="1" />
                      <rect x="22" y="58" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="48" y="70" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="74" y="58" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="94" y="80" width="12" height="12" fill="#d4af37" rx="1" />
                      <rect x="22" y="112" width="14" height="10" fill="#d4af37" rx="1" />
                      <rect x="52" y="114" width="14" height="10" fill="#d4af37" rx="1" />
                      <rect x="80" y="114" width="14" height="10" fill="#d4af37" rx="1" />
                      {/* Fine copper routing traces */}
                      <line x1="29" y1="38" x2="29" y2="58" stroke="#e6c875" strokeWidth="1" />
                      <line x1="76" y1="38" x2="54" y2="70" stroke="#e6c875" strokeWidth="1" />
                      <line x1="100" y1="42" x2="100" y2="80" stroke="#e6c875" strokeWidth="1" />
                    </g>
                  )}

                  {/* PART 6: GOLD CONTACT PINS */}
                  {part.id === 'sd_contact_pins' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="#1a1c1e" stroke="#333" strokeWidth="1.5" />
                      {/* 8 Gold-plated contact fingers along left edge */}
                      {[
                        { num: 1, name: 'DAT2', y: 16 },
                        { num: 2, name: 'CD/DAT3', y: 36 },
                        { num: 3, name: 'CMD', y: 56 },
                        { num: 4, name: 'VDD', y: 76 },
                        { num: 5, name: 'CLK', y: 96 },
                        { num: 6, name: 'VSS', y: 116 },
                        { num: 7, name: 'DAT0', y: 136 },
                        { num: 8, name: 'DAT1', y: 156 }
                      ].map((pin) => (
                        <g key={pin.num}>
                          <rect x="10" y={pin.y} width="38" height="15" rx="1.5" fill="url(#sd-gold-foil)" stroke="#fff" strokeWidth="0.4" />
                          <line x1="10" y1={pin.y + 4} x2="48" y2={pin.y + 4} stroke="#fae68b" strokeWidth="0.8" opacity="0.6" />
                        </g>
                      ))}
                      {/* Molded back structural ribs */}
                      <rect x="56" y="20" width={part.w - 68} height={part.h - 40} rx="2" fill="#121415" stroke="#2a2d30" />
                    </g>
                  )}

                  {/* PART 7: REAR PLASTIC CASING */}
                  {part.id === 'sd_rear_shell' && (
                    <g>
                      <path d={sdOuterPath(part.w, part.h)} fill="url(#sd-black-gradient)" stroke="#383b40" strokeWidth="1.5" />
                      {/* Molded structural retention frame */}
                      <path
                        d={`M 12,12 L ${part.w - 12},12 L ${part.w - 12},${part.h - 12} L 12,${part.h - 12} Z`}
                        fill="none"
                        stroke="#25282c"
                        strokeWidth="2"
                      />
                      {/* Lateral guide rails */}
                      <rect x="6" y="24" width="4" height={part.h - 48} fill="#2f3338" />
                      <rect x={part.w - 10} y="24" width="4" height={part.h - 60} fill="#2f3338" />
                      <text x={part.w / 2} y={part.h / 2} fill="#353b42" fontFamily="'DM Mono', monospace" fontSize="9" textAnchor="middle">
                        REAR CASING
                      </text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? MICROSD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'MICROSD HARDWARE DECOMPOSITION · 7 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? MICROSD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? MICROSD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '7 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/MosfetExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// MOSFET physical discrete parts + TC4420 Gate Driver sub-component
const MOSFET_PARTS_CONFIG = [
  {
    id: 'mos_face',
    name: 'EPOXY RESIN ENCAPSULATION',
    code: 'TO-220-EPOXY-FRONT',
    spec: 'Injection-molded flame-retardant epoxy plastic casing with laser-etched part markings',
    role: 'ENVIRONMENTAL SEAL & DIELECTRIC',
    w: 120, h: 120,
    assembled: { x: 540, y: 180 },
    exploded: { x: 180, y: 180 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 240, x2: 540, y2: 240 }
  },
  {
    id: 'mos_die',
    name: 'SILICON CARBIDE (SiC) TRENCH DIE',
    code: 'SIC-MOSFET-DIE',
    spec: 'High-voltage SiC semiconductor die with aluminum wire bonds for high current switching capability',
    role: 'POWER SWITCHING MATRIX',
    w: 60, h: 60,
    assembled: { x: 570, y: 220 },
    exploded: { x: 570, y: 220 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'mos_tab',
    name: 'COPPER HEAT TAB & TERMINALS',
    code: 'TO-220-CU-LEADFRAME',
    spec: 'Tinned copper leadframe providing electrical connections (G, D, S) and primary thermal dissipation path',
    role: 'THERMAL MASS & ELECTRICAL I/O',
    w: 140, h: 240,
    assembled: { x: 530, y: 160 },
    exploded: { x: 750, y: 160 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 530, y1: 240, x2: 'left', y2: 240 }
  },
  {
    id: 'mos_tc4420',
    name: 'TC4420 MOSFET GATE DRIVER',
    code: 'TC4420CPA',
    spec: 'Microchip 6A peak output gate driver, non-inverting, fast 25ns rise/fall for clean MOSFET switching',
    role: '[IC SUB-ASSEMBLY] GATE DRIVE',
    isSubComponent: true,
    w: 80, h: 80,
    assembled: { x: 560, y: 310 },
    exploded: { x: 980, y: 310 },
    start: 0.22, end: 0.62, step: 4,
    line: { x1: 560, y1: 350, x2: 'left', y2: 350 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function MosfetExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    MOSFET_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return (
    <div className="mosfet-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="mos-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="mos-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="epoxy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e2022" /><stop offset="50%" stopColor="#141517" /><stop offset="100%" stopColor="#0b0c0d" />
            </linearGradient>
            <linearGradient id="cu-tab-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b0bcc7" /><stop offset="25%" stopColor="#d1dae3" /><stop offset="75%" stopColor="#8c97a3" /><stop offset="100%" stopColor="#b0bcc7" />
            </linearGradient>
            <linearGradient id="sic-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a1859" /><stop offset="50%" stopColor="#2e0c38" /><stop offset="100%" stopColor="#1b0521" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {MOSFET_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'mos_face' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} />
                </g>
              );
            })}
          </g>

          {MOSFET_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'mos_face' && (
                  <g>
                    <rect x="0" y="30" width={part.w} height="90" rx="3" fill="url(#epoxy-grad)" stroke="#333" strokeWidth="1" />
                    <path d="M 30,30 L 40,35 L 80,35 L 90,30" fill="#141517" />
                    <text x="60" y="55" fill="#777c82" fontFamily="'DM Mono', monospace" fontSize="11" fontWeight="bold" textAnchor="middle">IRFZ44N</text>
                    <text x="60" y="70" fill="#5b6066" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">IR 113P</text>
                    <text x="60" y="85" fill="#5b6066" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">4C  9E</text>
                    <circle cx="15" cy="105" r="4" fill="#0b0c0d" stroke="#222" />
                    <circle cx="105" cy="105" r="4" fill="#0b0c0d" stroke="#222" />
                  </g>
                )}

                {part.id === 'mos_die' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} fill="url(#sic-die-grad)" stroke="#222" strokeWidth="1.5" />
                    <rect x="4" y="4" width={part.w-8} height={part.h-8} fill="none" stroke="#6e2d82" strokeWidth="0.5" strokeDasharray="2 2" />
                    <rect x="10" y="10" width={part.w-20} height={part.h-20} fill="none" stroke="#6e2d82" strokeWidth="0.5" strokeDasharray="2 2" />
                    <rect x="8" y="42" width="10" height="10" fill="#c0c5cc" />
                    <rect x="25" y="10" width="30" height="42" fill="#c0c5cc" />
                    <path d="M 13,47 Q 0,40 -20,100" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
                    <path d="M 35,25 Q 40,-10 30,100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
                    <path d="M 45,25 Q 60,-10 80,100" fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
                  </g>
                )}

                {part.id === 'mos_tab' && (
                  <g>
                    <rect x="10" y="0" width="120" height="140" rx="4" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1.5" />
                    <circle cx="70" cy="25" r="15" fill="#111" stroke="#aab4c2" strokeWidth="1" />
                    <rect x="30" y="55" width="80" height="70" rx="2" fill="#aab4c2" />
                    <rect x="25" y="140" width="14" height="100" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1" />
                    <rect x="63" y="140" width="14" height="100" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1" />
                    <rect x="101" y="140" width="14" height="100" fill="url(#cu-tab-grad)" stroke="#7a8794" strokeWidth="1" />
                    <text x="32" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">G</text>
                    <text x="70" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">D</text>
                    <text x="108" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">S</text>
                  </g>
                )}

                {part.id === 'mos_tc4420' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 16} y="10" width="32" height="24" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 8} cy="16" r="2" fill="#888" />
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 20} y={12 + i * 5} width="4" height="3" fill="#d4af37" />))}
                    {Array.from({ length: 4 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 16} y={12 + i * 5} width="4" height="3" fill="#d4af37" />))}
                    <text x={part.w / 2} y="28" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">TC4420</text>
                    <text x={part.w / 2} y="48" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">GATE DRIVER</text>
                    <text x={part.w / 2} y="58" fill="#666" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">6A PEAK / 25ns</text>
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? MOSFET_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'POWER MOSFET · 4 DISCRETE LAYERS + GATE DRIVER IC'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? MOSFET_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES TC4420 GATE DRIVER IC SUB-ASSEMBLY'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? MOSFET_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/PrototypeBoardExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// MB-102 Breadboard / Custom Prototype PCB — physical discrete parts
const PROTO_PARTS_CONFIG = [
  {
    id: 'proto_rails',
    name: 'POWER DISTRIBUTION RAILS',
    code: 'RAIL-MB102-PWR-2X',
    spec: 'Dual power bus strips (VCC + GND) running full board length with 0.1" pitch spring contacts',
    role: 'POWER DISTRIBUTION',
    w: 280,
    h: 60,
    assembled: { x: 460, y: 270 },
    exploded: { x: 60, y: 270 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 460, y2: 300 }
  },
  {
    id: 'proto_grid',
    name: 'MB-102 SOLDERLESS BREADBOARD',
    code: 'MB-102-830PT',
    spec: '830-point solderless breadboard, 2×63 rows of 5-connected tie points, ABS body with adhesive backing',
    role: 'PROTOTYPING PLATFORM',
    w: 280,
    h: 200,
    assembled: { x: 460, y: 200 },
    exploded: { x: 260, y: 200 },
    start: 0.10,
    end: 0.50,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 460, y2: 300 }
  },
  {
    id: 'proto_pcb',
    name: 'CUSTOM PROTOTYPE PCB SUBSTRATE',
    code: 'PCB-PROTO-FR4-100X160',
    spec: '100×160mm double-sided FR-4, 1oz copper, HASL finish, designed as final integration platform',
    role: 'PERMANENT INTEGRATION BASE',
    w: 300,
    h: 220,
    assembled: { x: 450, y: 190 },
    exploded: { x: 450, y: 190 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'proto_standoffs',
    name: 'M3 NYLON STANDOFF KIT',
    code: 'STOFF-M3-NYLON-12MM',
    spec: '12mm nylon hex standoffs with M3 brass threaded inserts for board-to-enclosure mounting',
    role: 'MECHANICAL MOUNTING',
    w: 200,
    h: 120,
    assembled: { x: 500, y: 240 },
    exploded: { x: 850, y: 240 },
    start: 0.05,
    end: 0.45,
    step: 4,
    line: { x1: 500, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS ————————————————
const PowerRails = React.memo(({ w, h }) => (
  <g>
    {/* Red VCC rail */}
    <rect x="0" y="0" width={w} height={h / 2 - 2} rx="3" fill="#2a0a0a" stroke="#d82b2b" strokeWidth="1.5" />
    <line x1="8" y1={h / 4} x2={w - 8} y2={h / 4} stroke="#d82b2b" strokeWidth="2" />
    {Array.from({ length: 18 }).map((_, i) => (
      <circle key={`v-${i}`} cx={12 + i * 15} cy={h / 4} r="2" fill="#d82b2b" />
    ))}
    <text x="8" y="12" fill="#ff6b6b" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800">VCC +</text>
    {/* Blue GND rail */}
    <rect x="0" y={h / 2 + 2} width={w} height={h / 2 - 2} rx="3" fill="#0a0a2a" stroke="#2977dd" strokeWidth="1.5" />
    <line x1="8" y1={h * 0.75} x2={w - 8} y2={h * 0.75} stroke="#2977dd" strokeWidth="2" />
    {Array.from({ length: 18 }).map((_, i) => (
      <circle key={`g-${i}`} cx={12 + i * 15} cy={h * 0.75} r="2" fill="#2977dd" />
    ))}
    <text x="8" y={h - 6} fill="#58a6ff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800">GND −</text>
  </g>
));

const BreadboardGrid = React.memo(({ w, h }) => (
  <g>
    {/* ABS body */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#f5f5f0" stroke="#c0c0b0" strokeWidth="2" />
    {/* Center divider */}
    <rect x="0" y={h / 2 - 4} width={w} height="8" rx="1" fill="#e0e0d8" stroke="#c0c0b0" strokeWidth="0.5" />
    {/* Tie point grid - top half */}
    {Array.from({ length: 12 }).map((_, row) =>
      Array.from({ length: 24 }).map((_, col) => (
        <circle key={`t-${row}-${col}`} cx={14 + col * 11} cy={14 + row * 7} r="1.5" fill="#333" />
      ))
    )}
    {/* Tie point grid - bottom half */}
    {Array.from({ length: 12 }).map((_, row) =>
      Array.from({ length: 24 }).map((_, col) => (
        <circle key={`b-${row}-${col}`} cx={14 + col * 11} cy={h / 2 + 8 + row * 7} r="1.5" fill="#333" />
      ))
    )}
    {/* Row labels */}
    {['a', 'b', 'c', 'd', 'e'].map((letter, i) => (
      <text key={letter} x="4" y={24 + i * 14} fill="#999" fontFamily="'DM Mono', monospace" fontSize="5">{letter}</text>
    ))}
    <text x={w / 2} y={h - 4} fill="#888" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">MB-102 · 830 POINTS</text>
  </g>
));

const ProtoPcb = React.memo(({ w, h }) => (
  <g>
    {/* FR-4 substrate */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* Plated through-hole grid */}
    {Array.from({ length: 10 }).map((_, row) =>
      Array.from({ length: 14 }).map((_, col) => (
        <circle key={`h-${row}-${col}`} cx={16 + col * 20} cy={16 + row * 20} r="2.5" fill="#d4af37" stroke="#b89530" strokeWidth="0.5" />
      ))
    )}
    {/* Mounting holes */}
    <circle cx="16" cy="16" r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    <circle cx={w - 16} cy="16" r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    <circle cx="16" cy={h - 16} r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    <circle cx={w - 16} cy={h - 16} r="5" fill="none" stroke="#888" strokeWidth="1.5" />
    {/* Silkscreen label */}
    <rect x={w / 2 - 50} y={h / 2 - 12} width="100" height="24" rx="2" fill="none" stroke="#2b6b3f" strokeWidth="1" />
    <text x={w / 2} y={h / 2 + 4} fill="#2b9951" fontFamily="'DM Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle">SIH26-PROTO-V1</text>
  </g>
));

const StandoffKit = React.memo(({ w, h }) => (
  <g>
    {/* 4 standoffs in a row */}
    {[0, 1, 2, 3].map(i => (
      <g key={i}>
        {/* Hex body */}
        <rect x={10 + i * 48} y="20" width="30" height="60" rx="2" fill="#e8e0d0" stroke="#c0b8a0" strokeWidth="1.5" />
        {/* Hex facet lines */}
        <line x1={16 + i * 48} y1="20" x2={16 + i * 48} y2="80" stroke="#d0c8b0" strokeWidth="0.8" />
        <line x1={34 + i * 48} y1="20" x2={34 + i * 48} y2="80" stroke="#d0c8b0" strokeWidth="0.8" />
        {/* Brass threaded insert (top) */}
        <circle cx={25 + i * 48} cy="24" r="6" fill="#d4af37" stroke="#b89530" strokeWidth="1" />
        <circle cx={25 + i * 48} cy="24" r="2.5" fill="#222" />
        {/* Brass threaded insert (bottom) */}
        <circle cx={25 + i * 48} cy="76" r="6" fill="#d4af37" stroke="#b89530" strokeWidth="1" />
        <circle cx={25 + i * 48} cy="76" r="2.5" fill="#222" />
      </g>
    ))}
    <text x={w / 2} y={h - 8} fill="#8a8070" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">M3 × 12mm NYLON</text>
  </g>
));

const PART_RENDERERS = {
  proto_rails: PowerRails,
  proto_grid: BreadboardGrid,
  proto_pcb: ProtoPcb,
  proto_standoffs: StandoffKit,
};

export default function PrototypeBoardExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    PROTO_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="proto-marker-yellow" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#f0c242" />
      </marker>
    </defs>
  ), []);

  return (
    <div className="proto-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(240, 194, 66, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 194, 66, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(240,194,66,0.6)', borderLeft: '2px solid rgba(240,194,66,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(240,194,66,0.6)', borderRight: '2px solid rgba(240,194,66,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(240,194,66,0.6)', borderLeft: '2px solid rgba(240,194,66,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(240,194,66,0.6)', borderRight: '2px solid rgba(240,194,66,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {PROTO_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#f0c242" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#proto-marker-yellow)" markerEnd="url(#proto-marker-yellow)" />
                </g>
              );
            })}
          </g>
          {PROTO_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#f0c242" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#f0c242' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? PROTO_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'PROTOTYPE BOARD ASSEMBLY · 4 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? PROTO_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'MB-102 BREADBOARD + CUSTOM FR-4 INTEGRATION PLATFORM'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#f0c242', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? PROTO_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/RadiationShieldExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect } from 'react';

const RAD_PARTS_CONFIG = [
  {
    id: 'rad_outer',
    name: 'TUNGSTEN SHIELD',
    code: 'W-ALLOY-2MM-HV',
    spec: '2mm high-density tungsten alloy blocking ionizing radiation and heavy particles',
    role: 'PRIMARY SHIELDING',
    w: 220,
    h: 300,
    assembled: { x: 490, y: 150 },
    exploded: { x: 140, y: 150 },
    start: 0.1,
    end: 0.6,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 490, y2: 300 }
  },
  {
    id: 'rad_absorb',
    name: 'ALUMINUM ABSORBER',
    code: 'AL-6061-1MM',
    spec: '1mm secondary absorber mitigating Bremsstrahlung secondary radiation',
    role: 'SECONDARY ABSORBER',
    w: 200,
    h: 280,
    assembled: { x: 500, y: 160 },
    exploded: { x: 500, y: 160 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'rad_inner',
    name: 'KAPTON ISOLATOR',
    code: 'KAPTON-PI-0.1MM',
    spec: 'Inner dielectric isolator preventing galvanic reaction with electronics chassis',
    role: 'GALVANIC ISOLATION',
    w: 180,
    h: 260,
    assembled: { x: 510, y: 170 },
    exploded: { x: 860, y: 170 },
    start: 0.1,
    end: 0.6,
    step: 3,
    line: { x1: 510, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function RadiationShieldExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    RAD_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  return (
    <div
      className="radiation-view-container"
      style={{
        position: 'relative', width: '100%', maxWidth: '680px', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none'
      }}
    >
      <div
        style={{
          position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box'
        }}
      >
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' /* removed filter for perf */ }}>
          <defs>
            <marker id="rad-marker-pink" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#e87bc9" />
            </marker>
            <linearGradient id="tungsten-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2b2d30" />
              <stop offset="50%" stopColor="#43474d" />
              <stop offset="100%" stopColor="#1c1e21" />
            </linearGradient>
            <linearGradient id="alum-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6e7680" />
              <stop offset="100%" stopColor="#454b52" />
            </linearGradient>
            <linearGradient id="pi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212, 143, 38, 0.8)" />
              <stop offset="100%" stopColor="rgba(163, 94, 15, 0.9)" />
            </linearGradient>
          </defs>

          {/* Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {RAD_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#e87bc9" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#rad-marker-pink)" markerEnd="url(#rad-marker-pink)" />
                </g>
              );
            })}
          </g>

          {/* Parts */}
          {RAD_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            return (
              <g 
                key={part.id} 
                onMouseEnter={() => setHoveredPart(part.id)} 
                onMouseLeave={() => setHoveredPart(null)} 
                ref={(el) => { partGroupRefs.current[part.id] = el; }}
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                style={{ 
                  cursor: 'pointer', 
                  willChange: 'transform', 
                  filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', 
                  transition: 'filter 0.15s ease-out' 
                }}
              >
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#e87bc9" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                
                {part.id === 'rad_outer' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="8" fill="url(#tungsten-grad)" stroke="#555" strokeWidth="1" />
                    {/* Tungsten Heavy Texture */}
                    <path d="M 20,20 L 20,280 M 200,20 L 200,280" stroke="#1c1e21" strokeWidth="6" />
                    <circle cx="30" cy="30" r="6" fill="#111" />
                    <circle cx="190" cy="30" r="6" fill="#111" />
                    <circle cx="30" cy="270" r="6" fill="#111" />
                    <circle cx="190" cy="270" r="6" fill="#111" />
                  </g>
                )}
                {part.id === 'rad_absorb' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="6" fill="url(#alum-grad)" stroke="#8e96a1" strokeWidth="1" />
                    {/* Horizontal ridges */}
                    {[1,2,3,4,5,6].map(i => (
                      <line key={i} x1="10" y1={i * 40} x2="190" y2={i * 40} stroke="#454b52" strokeWidth="3" />
                    ))}
                  </g>
                )}
                {part.id === 'rad_inner' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pi-grad)" stroke="#dca843" strokeWidth="2" opacity="0.95" />
                    <rect x="10" y="10" width={part.w - 20} height={part.h - 20} fill="none" stroke="#8c5008" strokeWidth="1" strokeDasharray="2 2" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#e87bc9' : '#ecf0ea' }}>
              {hoveredPart ? RAD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'RADIATION PROTECTION · 3 DISCRETE SHIELDING LAYERS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? RAD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'MULTI-LAYER IONIZING RADIATION & EMP HARDENING'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#e87bc9', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px' }}>
            {hoveredPart ? RAD_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/RadiatorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Radiator physical discrete parts
// Coordinates in 1200 x 600 artboard
const RADIATOR_PARTS_CONFIG = [
  {
    id: 'rad_base',
    name: 'ALUMINIUM MOUNTING BASE',
    code: 'AL-BASE-120MM',
    spec: 'Extruded aluminum alloy base plate with grooved channels for direct heat pipe contact',
    role: 'THERMAL INTERFACE',
    w: 60,
    h: 180,
    assembled: { x: 530, y: 210 },
    exploded: { x: 280, y: 210 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'rad_fins',
    name: 'HIGH-DENSITY COOLING FIN ARRAY',
    code: 'FIN-STACK-40X',
    spec: 'Stack of 40 ultra-thin (0.4mm) aluminum fins press-fitted to the base to maximize surface area',
    role: 'CONVECTIVE HEAT REJECTION',
    w: 120,
    h: 220,
    assembled: { x: 540, y: 190 },
    exploded: { x: 540, y: 190 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'rad_shroud',
    name: 'AERODYNAMIC SHROUD & MOUNTS',
    code: 'SHROUD-ABS-120',
    spec: 'Injection molded ABS plastic frame to direct airflow through the fin stack and mount 120mm fans',
    role: 'AIRFLOW MANAGEMENT',
    w: 80,
    h: 240,
    assembled: { x: 580, y: 180 },
    exploded: { x: 800, y: 180 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 580, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function RadiatorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    RADIATOR_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="radiator-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="rad-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="rad-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="al-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#909ba8" />
              <stop offset="50%" stopColor="#c5cfd9" />
              <stop offset="100%" stopColor="#67737d" />
            </linearGradient>

            <linearGradient id="al-fin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b3bcc4" />
              <stop offset="50%" stopColor="#dee4eb" />
              <stop offset="100%" stopColor="#838d96" />
            </linearGradient>
            
            <linearGradient id="shroud-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#121314" />
              <stop offset="20%" stopColor="#25272b" />
              <stop offset="80%" stopColor="#1a1c1f" />
              <stop offset="100%" stopColor="#0a0b0c" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {RADIATOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id === 'rad_base';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#rad-marker-orange)' : 'url(#rad-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {RADIATOR_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: MOUNTING BASE */}
                  {part.id === 'rad_base' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="2" fill="url(#al-base-grad)" stroke="#535c66" strokeWidth="1" />
                      {/* Heat pipe contact grooves */}
                      <path d="M 15,0 L 15,180 M 30,0 L 30,180 M 45,0 L 45,180" stroke="#7a8794" strokeWidth="4" />
                      {/* Mounting holes */}
                      <circle cx="30" cy="15" r="5" fill="#111" stroke="#333" />
                      <circle cx="30" cy="165" r="5" fill="#111" stroke="#333" />
                    </g>
                  )}

                  {/* PART 2: COOLING FINS */}
                  {part.id === 'rad_fins' && (
                    <g>
                      {/* The fin stack represented as closely packed lines/rects */}
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#al-fin-grad)" stroke="#67737d" strokeWidth="1" />
                      {/* Individual fin lines */}
                      {Array.from({ length: 38 }).map((_, i) => (
                        <line key={`fin-${i}`} x1="0" y1={5 + i * 5.6} x2={part.w} y2={5 + i * 5.6} stroke="#535c66" strokeWidth="1" opacity="0.6" />
                      ))}
                      {/* Heat pipe through-holes in fins */}
                      <circle cx="30" cy="40" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                      <circle cx="90" cy="40" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                      <circle cx="30" cy="180" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                      <circle cx="90" cy="180" r="12" fill="none" stroke="#67737d" strokeWidth="2" />
                    </g>
                  )}

                  {/* PART 3: SHROUD AND MOUNTS */}
                  {part.id === 'rad_shroud' && (
                    <g>
                      {/* Side brackets */}
                      <rect x="0" y="0" width="20" height={part.h} fill="url(#shroud-grad)" stroke="#222" />
                      <rect x="60" y="0" width="20" height={part.h} fill="url(#shroud-grad)" stroke="#222" />
                      {/* Cross bars */}
                      <rect x="20" y="20" width="40" height="20" fill="url(#shroud-grad)" stroke="#222" />
                      <rect x="20" y="200" width="40" height="20" fill="url(#shroud-grad)" stroke="#222" />
                      
                      {/* Fan mounting holes */}
                      <circle cx="10" cy="10" r="4" fill="#000" />
                      <circle cx="70" cy="10" r="4" fill="#000" />
                      <circle cx="10" cy="230" r="4" fill="#000" />
                      <circle cx="70" cy="230" r="4" fill="#000" />
                      
                      {/* Angled aerodynamic guides */}
                      <path d="M 20,40 L 30,60 L 30,180 L 20,200 Z" fill="#111" opacity="0.5" />
                      <path d="M 60,40 L 50,60 L 50,180 L 60,200 Z" fill="#111" opacity="0.5" />
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? RADIATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ALUMINIUM FIN RADIATOR · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? RADIATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? RADIATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/RegulatorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Voltage Regulator physical discrete parts + Protection & ADC
const REGULATOR_PARTS_CONFIG = [
  {
    id: 'reg_heatsink',
    name: 'ANODIZED ALUMINIUM HEATSINK',
    code: 'HS-AL-TO220-BLK',
    spec: 'Black anodized extruded aluminum alloy with 6 thermal fins for passive convection cooling',
    role: 'THERMAL DISSIPATION',
    w: 120, h: 180,
    assembled: { x: 540, y: 210 },
    exploded: { x: 120, y: 210 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'reg_ic',
    name: 'SWITCHING REGULATOR CORE & PCB',
    code: 'REG-BUCK-5V-3A',
    spec: 'High-efficiency buck converter IC with integrated MOSFETs and SMD ceramic filter capacitors on FR4 substrate',
    role: 'VOLTAGE STEP-DOWN & STABILIZATION',
    w: 160, h: 210,
    assembled: { x: 520, y: 195 },
    exploded: { x: 520, y: 195 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'reg_pins',
    name: 'HIGH-CURRENT PIN INTERFACE',
    code: 'HDR-PWR-3P-2.54',
    spec: '3-pin 2.54mm pitch gold-plated through-hole header (VIN, GND, VOUT) rated for 3A continuous',
    role: 'POWER DELIVERY & ROUTING',
    w: 160, h: 120,
    assembled: { x: 520, y: 195 },
    exploded: { x: 740, y: 195 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  },
  {
    id: 'reg_xt30',
    name: 'AMASS XT30 POWER CONNECTOR',
    code: 'XT30U-M',
    spec: 'High-current (30A) nylon plug with gold-plated bullet connectors for main battery input',
    role: '[SUB-ASSEMBLY] PRIMARY INPUT',
    isSubComponent: true,
    w: 50, h: 40,
    assembled: { x: 510, y: 320 },
    exploded: { x: 860, y: 320 },
    start: 0.2, end: 0.6, step: 4,
    line: { x1: 510, y1: 340, x2: 'left', y2: 340 }
  },
  {
    id: 'reg_fuse',
    name: 'BLADE FUSE PROTECTION',
    code: 'FUSE-AUTO-10A',
    spec: '10A fast-acting automotive blade fuse protecting the regulator from catastrophic load shorts',
    role: '[SUB-ASSEMBLY] OVERCURRENT SAFETY',
    isSubComponent: true,
    w: 40, h: 50,
    assembled: { x: 565, y: 310 },
    exploded: { x: 920, y: 310 },
    start: 0.22, end: 0.62, step: 5,
    line: { x1: 565, y1: 340, x2: 'left', y2: 340 }
  },
  {
    id: 'reg_tvs',
    name: 'TVS DIODE ARRAY',
    code: 'SMAJ15CA',
    spec: 'Transient Voltage Suppression diode array clamping inductive load spikes and ESD events',
    role: '[SUB-ASSEMBLY] VOLTAGE CLAMPING',
    isSubComponent: true,
    w: 40, h: 40,
    assembled: { x: 610, y: 320 },
    exploded: { x: 970, y: 320 },
    start: 0.24, end: 0.64, step: 6,
    line: { x1: 610, y1: 340, x2: 'left', y2: 340 }
  },
  {
    id: 'reg_ads1115',
    name: 'TI ADS1115 VOLTAGE MONITOR',
    code: 'ADS1115-I2C',
    spec: '16-bit precision ADC with PGA for continuous monitoring of input and output voltage levels',
    role: '[IC SUB-ASSEMBLY] TELEMETRY',
    isSubComponent: true,
    w: 70, h: 70,
    assembled: { x: 550, y: 370 },
    exploded: { x: 1040, y: 370 },
    start: 0.28, end: 0.68, step: 7,
    line: { x1: 550, y1: 405, x2: 'left', y2: 405 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function RegulatorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    REGULATOR_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return (
    <div className="regulator-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="reg-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="reg-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="heatsink-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1c1e" /><stop offset="30%" stopColor="#2a2d33" /><stop offset="70%" stopColor="#1f2226" /><stop offset="100%" stopColor="#141618" />
            </linearGradient>
            <linearGradient id="pcb-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#143e63" /><stop offset="100%" stopColor="#0d2942" />
            </linearGradient>
            <linearGradient id="gold-pin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3b432" /><stop offset="50%" stopColor="#f5dc7f" /><stop offset="100%" stopColor="#c79918" />
            </linearGradient>
            <linearGradient id="xt30-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca311" /><stop offset="100%" stopColor="#d38206" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {REGULATOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'reg_heatsink' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#reg-marker-orange)' : `url(#reg-marker-${part.id === 'reg_heatsink' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#reg-marker-orange)' : `url(#reg-marker-${part.id === 'reg_heatsink' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {REGULATOR_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'reg_heatsink' && (
                  <g>
                    <rect x="0" y="0" width="30" height={part.h} rx="2" fill="url(#heatsink-grad)" stroke="#3a3d42" strokeWidth="1" />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <rect key={i} x="30" y={10 + i * 30} width="80" height="10" rx="1" fill="url(#heatsink-grad)" stroke="#2b2d30" strokeWidth="1" />
                    ))}
                    <circle cx="15" cy="25" r="8" fill="#0d0f11" stroke="#333" strokeWidth="1" />
                    <circle cx="15" cy="25" r="6" fill="#15171a" />
                  </g>
                )}

                {part.id === 'reg_ic' && (
                  <g>
                    <rect x="0" y="20" width={part.w} height="170" rx="4" fill="url(#pcb-blue-grad)" stroke="#21507a" strokeWidth="1.5" />
                    <rect x="0" y="20" width="30" height="170" fill="#aebac7" stroke="#778696" strokeWidth="1" />
                    <circle cx="15" cy="40" r="8" fill="#143e63" stroke="#526475" />
                    <rect x="50" y="45" width="60" height="60" rx="4" fill="#16181a" stroke="#3a3d42" strokeWidth="1.5" />
                    <circle cx="80" cy="75" r="22" fill="#222" stroke="#333" strokeWidth="1" />
                    <text x="80" y="80" fill="#666" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">470</text>
                    <rect x="60" y="125" width="40" height="40" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                    <circle cx="68" cy="133" r="3" fill="#444" />
                    <text x="80" y="150" fill="#888" fontFamily="'DM Mono', monospace" fontSize="8" textAnchor="middle">LM</text>
                    <rect x="125" y="55" width="16" height="25" rx="1" fill="#c4a56c" stroke="#8c703f" strokeWidth="0.5" />
                    <rect x="125" y="130" width="16" height="25" rx="1" fill="#c4a56c" stroke="#8c703f" strokeWidth="0.5" />
                    <path d="M 40,75 L 50,75 M 110,75 L 133,75 L 133,55" fill="none" stroke="#3173ad" strokeWidth="4" />
                    <path d="M 100,145 L 125,145 M 60,110 L 60,125" fill="none" stroke="#3173ad" strokeWidth="4" />
                    <circle cx="140" cy="35" r="5" fill="#0d2942" stroke="#d4af37" strokeWidth="1.5" />
                    <circle cx="140" cy="175" r="5" fill="#0d2942" stroke="#d4af37" strokeWidth="1.5" />
                  </g>
                )}

                {part.id === 'reg_pins' && (
                  <g>
                    <rect x="140" y="50" width="14" height="110" rx="2" fill="#141618" stroke="#222" strokeWidth="1" />
                    {[65, 100, 135].map((py, i) => (
                      <g key={i}>
                        <rect x="135" y={py} width="5" height="10" fill="#778494" />
                        <rect x="154" y={py} width="35" height="10" rx="1" fill="url(#gold-pin-grad)" stroke="#9a7615" strokeWidth="0.5" />
                      </g>
                    ))}
                    <text x="175" y="62" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">VIN</text>
                    <text x="175" y="97" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">GND</text>
                    <text x="175" y="132" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold">OUT</text>
                  </g>
                )}

                {/* SUB-COMPONENT: XT30 */}
                {part.id === 'reg_xt30' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <path d="M 10,10 L 40,10 L 40,25 L 35,30 L 10,30 Z" fill="url(#xt30-grad)" stroke="#8e5809" strokeWidth="1" />
                    <circle cx="18" cy="20" r="3" fill="url(#gold-pin-grad)" />
                    <circle cx="30" cy="20" r="3" fill="url(#gold-pin-grad)" />
                    <text x="18" y="27" fill="#8e5809" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="bold" textAnchor="middle">+</text>
                    <text x="30" y="27" fill="#8e5809" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="bold" textAnchor="middle">-</text>
                    <rect x="2" y={part.h - 8} width={part.w - 4} height="6" rx="1" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 2} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="4" fontWeight="700" textAnchor="middle">XT30 PWR</text>
                  </g>
                )}

                {/* SUB-COMPONENT: BLADE FUSE */}
                {part.id === 'reg_fuse' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x="8" y="10" width="24" height="20" rx="2" fill="#d92121" stroke="#871313" strokeWidth="1" />
                    <rect x="12" y="30" width="4" height="10" fill="#aab4c2" stroke="#555" strokeWidth="0.5" />
                    <rect x="24" y="30" width="4" height="10" fill="#aab4c2" stroke="#555" strokeWidth="0.5" />
                    <text x="20" y="24" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">10A</text>
                    <rect x="2" y={part.h - 8} width={part.w - 4} height="6" rx="1" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 2} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="3.5" fontWeight="700" textAnchor="middle">AUTO FUSE</text>
                  </g>
                )}

                {/* SUB-COMPONENT: TVS DIODE */}
                {part.id === 'reg_tvs' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x="10" y="12" width="20" height="16" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                    <rect x="12" y="12" width="4" height="16" fill="#555" /> {/* Polarity band */}
                    <rect x="4" y="16" width="6" height="8" fill="#aab4c2" />
                    <rect x="30" y="16" width="6" height="8" fill="#aab4c2" />
                    <rect x="2" y={part.h - 8} width={part.w - 4} height="6" rx="1" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 2} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="3.5" fontWeight="700" textAnchor="middle">TVS DIODE</text>
                  </g>
                )}

                {/* SUB-COMPONENT: ADS1115 */}
                {part.id === 'reg_ads1115' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 12} y="15" width="24" height="24" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 6} cy="21" r="1.5" fill="#888" />
                    {Array.from({ length: 5 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 16} y={17 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    {Array.from({ length: 5 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 12} y={17 + i * 4} width="4" height="2" fill="#d4af37" />))}
                    <text x={part.w / 2} y="32" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="800" textAnchor="middle">ADS1115</text>
                    <text x={part.w / 2} y="50" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="4.5" textAnchor="middle">16-BIT ADC</text>
                    <rect x="2" y={part.h - 12} width={part.w - 4} height="10" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 4} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="4.5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? REGULATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'VOLTAGE REGULATOR · 7 COMPONENTS WITH PROTECTION & ADC'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? REGULATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES XT30, 10A FUSE, TVS, AND ADS1115 ADC'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? REGULATOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '7 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/RfSensorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

const RFSENSOR_PARTS_CONFIG = [
  {
    id: 'rf_shield',
    name: 'NICKEL-SILVER RF SHIELDING CAN',
    code: 'SHIELD-EMI-RF',
    spec: '0.2mm nickel-silver alloy EMI/RFI shielding enclosure with ventilation holes to prevent interference',
    role: 'ELECTROMAGNETIC ISOLATION',
    w: 120,
    h: 120,
    assembled: { x: 540, y: 240 },
    exploded: { x: 240, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'rf_pcb',
    name: 'RF LOG DETECTOR IC & SUBSTRATE',
    code: 'AD8317-RF-DETECTOR',
    spec: '1MHz - 10GHz Logarithmic Demodulating Amplifier IC on high-frequency Rogers/FR4 hybrid PCB',
    role: 'RF POWER MEASUREMENT',
    w: 160,
    h: 160,
    assembled: { x: 520, y: 220 },
    exploded: { x: 520, y: 220 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'rf_pins',
    name: 'ANALOG OUT & POWER INTERFACE',
    code: 'HDR-3P-RF',
    spec: '3-pin 2.54mm header (VCC, GND, VOUT) delivering analog DC voltage proportional to RF power',
    role: 'DATA ACQUISITION LINK',
    w: 60,
    h: 120,
    assembled: { x: 520, y: 240 },
    exploded: { x: 820, y: 240 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function RfSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);


  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));


  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    RFSENSOR_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="rfsensor-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="rf-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="rf-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0c5cc" />
              <stop offset="50%" stopColor="#8d99a6" />
              <stop offset="100%" stopColor="#5d6570" />
            </linearGradient>

            <linearGradient id="pcb-hf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b2913" />
              <stop offset="100%" stopColor="#061208" />
            </linearGradient>

            <linearGradient id="gold-pin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3b432" />
              <stop offset="50%" stopColor="#f5dc7f" />
              <stop offset="100%" stopColor="#c79918" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {RFSENSOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id === 'rf_shield';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#rf-marker-orange)' : 'url(#rf-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {RFSENSOR_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: RF SHIELDING CAN */}
                  {part.id === 'rf_shield' && (
                    <g>
                      <rect x="0" y="0" width={part.w} height={part.h} rx="2" fill="url(#shield-grad)" stroke="#4a5059" strokeWidth="1.5" />
                      {/* Shield Ventilation/Tuning Holes */}
                      <circle cx="30" cy="30" r="10" fill="#222" />
                      <circle cx="60" cy="30" r="10" fill="#222" />
                      <circle cx="90" cy="30" r="10" fill="#222" />

                      <circle cx="30" cy="60" r="10" fill="#222" />
                      <circle cx="90" cy="60" r="10" fill="#222" />

                      <circle cx="30" cy="90" r="10" fill="#222" />
                      <circle cx="60" cy="90" r="10" fill="#222" />
                      <circle cx="90" cy="90" r="10" fill="#222" />

                      <text x="60" y="65" fill="#5d6570" fontFamily="'DM Mono', monospace" fontSize="12" fontWeight="bold" textAnchor="middle">RF-ISO</text>
                    </g>
                  )}

                  {/* PART 2: RF PCB & DETECTOR IC */}
                  {part.id === 'rf_pcb' && (
                    <g>
                      {/* Substrate */}
                      <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pcb-hf-grad)" stroke="#1a4726" strokeWidth="1.5" />

                      {/* SMA Connector Edge Pad */}
                      <rect x="-10" y="60" width="20" height="40" fill="url(#gold-pin-grad)" stroke="#9a7615" />
                      <rect x="-15" y="65" width="10" height="30" rx="1" fill="#c0c5cc" stroke="#333" />
                      <circle cx="-5" cy="80" r="3" fill="#111" />

                      {/* RF Traces (Impedance controlled) */}
                      <path d="M 10,80 L 50,80 L 60,70" fill="none" stroke="#d4af37" strokeWidth="3" />

                      {/* Detector IC */}
                      <rect x="55" y="60" width="24" height="24" rx="1" fill="#111" stroke="#333" strokeWidth="0.5" />
                      <circle cx="60" cy="65" r="2" fill="#555" />
                      <text x="67" y="75" fill="#888" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">AD</text>

                      {/* Ground Plane Vias */}
                      {[20, 40, 60, 80, 100, 120, 140].map(vx => (
                        <circle key={`v1-${vx}`} cx={vx} cy="20" r="1.5" fill="#d4af37" />
                      ))}
                      {[20, 40, 60, 80, 100, 120, 140].map(vx => (
                        <circle key={`v2-${vx}`} cx={vx} cy="140" r="1.5" fill="#d4af37" />
                      ))}

                      {/* Output Traces to header */}
                      <path d="M 75,75 L 140,75" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                      <path d="M 70,85 L 140,110" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                      <path d="M 60,85 L 140,145" fill="none" stroke="#d4af37" strokeWidth="1.5" />

                      {/* Mounting Holes */}
                      <circle cx="130" cy="30" r="12" fill="#061208" stroke="#d4af37" strokeWidth="3" />
                      <circle cx="130" cy="30" r="7" fill="#11361c" />
                    </g>
                  )}

                  {/* PART 3: PIN INTERFACE */}
                  {part.id === 'rf_pins' && (
                    <g>
                      {/* Black plastic header base */}
                      <rect x="0" y="20" width="15" height="110" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                      {/* 3 Gold Pins */}
                      {[40, 75, 110].map((py, i) => (
                        <g key={i}>
                          <rect x="-5" y={py} width="5" height="8" fill="#778494" />
                          <rect x="15" y={py} width="35" height="8" rx="1" fill="url(#gold-pin-grad)" stroke="#9a7615" strokeWidth="0.5" />
                        </g>
                      ))}
                      <text x="25" y="52" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold">VCC</text>
                      <text x="25" y="87" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold">GND</text>
                      <text x="25" y="122" fill="#fff" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="bold">OUT</text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? RFSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'RF SENSOR SYSTEM · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? RFSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? RFSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/SingleComponentView.jsx

``jsx
import React from 'react';
import { Zap, Radio, Thermometer, ShieldAlert, Cpu } from 'lucide-react';
import CutoutImage from '../CutoutImage';

export default function SingleComponentView({ scene }) {
  const isRf = scene.effect === 'rf';
  const isPower = scene.effect === 'power';
  const isHeat = scene.effect === 'heat';

  return (
    <div className="single-inspection-object" style={{ position: 'relative', width: '100%', maxWidth: '580px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* HUD Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', background: 'rgba(16, 20, 20, 0.85)', border: '1px solid rgba(222, 232, 224, 0.15)', borderRadius: '4px', marginBottom: '14px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: '600 10px "DM Mono", monospace', color: '#c9e87b' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#c9e87b', boxShadow: '0 0 6px #c9e87b' }} />
          AUTHENTIC HARDWARE INSPECTION · 1 PHYSICAL UNIT
        </div>
        <div style={{ font: '500 9px "DM Mono", monospace', color: '#a0aaa2' }}>
          ID: {scene.index} // {scene.category}
        </div>
      </div>

      {/* Main Inspection Frame */}
      <div style={{ position: 'relative', width: '100%', minHeight: '360px', maxHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.12)', background: 'radial-gradient(ellipse at center, rgba(201,232,123,0.03) 0%, rgba(10,13,13,0.8) 75%)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Engineering Crosshairs & Reticle */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.08)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.08)' }} />
          {/* Corner brackets */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '14px', height: '14px', borderTop: '2px solid #c9e87b', borderLeft: '2px solid #c9e87b' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '14px', height: '14px', borderTop: '2px solid #c9e87b', borderRight: '2px solid #c9e87b' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '14px', height: '14px', borderBottom: '2px solid #c9e87b', borderLeft: '2px solid #c9e87b' }} />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '14px', height: '14px', borderBottom: '2px solid #c9e87b', borderRight: '2px solid #c9e87b' }} />
        </div>

        {/* Ambient Engineering Effects */}
        {isRf && (
          <>
            <i className="wave wave-one" />
            <i className="wave wave-two" />
          </>
        )}
        {isPower && (
          <div className="energy-flow">
            <Zap size={15} />
            <i />
            <Zap size={15} />
          </div>
        )}
        {isHeat && (
          <div className="heat-flow">
            <i />
            <i />
            <i />
          </div>
        )}

        {/* ONE SINGLE AUTHENTIC COMPONENT IMAGE */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '340px', maxHeight: '340px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={scene.image}
            alt={scene.title}
            style={{
              maxWidth: '100%',
              maxHeight: '320px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.6))',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* Component Title Overlay Badge */}
        <div className="component-name">
          {scene.title.replace(/\n/g, ' ')} <i />
        </div>
      </div>

      {/* Subsystem Layers Breakdown Callout (Legend - NOT duplicate images) */}
      {scene.layers && scene.layers.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', alignItems: 'center' }}>
          <span style={{ font: '700 8px "DM Mono", monospace', color: '#88938b', marginRight: '4px' }}>
            FUNCTIONAL LAYERS:
          </span>
          {scene.layers.map((layer, idx) => (
            <span
              key={layer}
              style={{
                background: 'rgba(201, 232, 123, 0.08)',
                border: '1px solid rgba(201, 232, 123, 0.25)',
                color: '#c9e87b',
                font: '500 8px "DM Mono", monospace',
                padding: '3px 8px',
                borderRadius: '3px',
                letterSpacing: '0.5px'
              }}
            >
              0{idx + 1} · {layer}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

``

## src/components/SolderProtectionExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect } from 'react';

const SOLDER_PARTS_CONFIG = [
  {
    id: 'sol_coat',
    name: 'CONFORMAL COATING',
    code: 'SIL-CC-TR-01',
    spec: 'Silicone-based moisture and fungus-resistant conformal coating',
    role: 'ENVIRONMENTAL SEAL',
    w: 240,
    h: 300,
    assembled: { x: 480, y: 150 },
    exploded: { x: 120, y: 150 },
    start: 0.15,
    end: 0.65,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 480, y2: 300 }
  },
  {
    id: 'sol_fill',
    name: 'EPOXY UNDERFILL',
    code: 'EPX-UF-BGA-99',
    spec: 'Capillary underfill epoxy protecting BGA and QFN solder joints from thermal fatigue',
    role: 'VIBRATION RESISTANCE',
    w: 160,
    h: 220,
    assembled: { x: 520, y: 190 },
    exploded: { x: 520, y: 190 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'sol_base',
    name: 'PCB REINFORCEMENT',
    code: 'FR4-RIGID-3.2MM',
    spec: 'Thickened 3.2mm FR4 substrate minimizing board flex during high-G acceleration',
    role: 'MECHANICAL SUPPORT',
    w: 280,
    h: 340,
    assembled: { x: 460, y: 130 },
    exploded: { x: 840, y: 130 },
    start: 0.15,
    end: 0.65,
    step: 3,
    line: { x1: 460, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function SolderProtectionExplodedView({ scrollProgress = 0 }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  
  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    SOLDER_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="solder-view-container"
      style={{
        position: 'relative', width: '100%', maxWidth: '680px', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none'
      }}
    >
      <div
        style={{
          position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box'
        }}
      >
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' /* removed filter for perf */ }}>
          <defs>
            <marker id="sol-marker-cyan" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#58d6ff" />
            </marker>
            <linearGradient id="coat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(88, 214, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(20, 100, 120, 0.6)" />
            </linearGradient>
            <linearGradient id="pcb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d2b1f" />
              <stop offset="100%" stopColor="#061a12" />
            </linearGradient>
          </defs>

          {/* Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {SOLDER_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#58d6ff" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#sol-marker-cyan)" markerEnd="url(#sol-marker-cyan)" />
                </g>
              );
            })}
          </g>

          {/* Parts */}
          {SOLDER_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            return (
              <g 
                key={part.id} 
                onMouseEnter={() => setHoveredPart(part.id)} 
                onMouseLeave={() => setHoveredPart(null)} 
                ref={(el) => { partGroupRefs.current[part.id] = el; }}
                transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
                style={{ 
                  cursor: 'pointer', 
                  willChange: 'transform', 
                  filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', 
                  transition: 'filter 0.15s ease-out' 
                }}
              >
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#58d6ff" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                
                {part.id === 'sol_coat' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="8" fill="url(#coat-grad)" stroke="#7de4ff" strokeWidth="1" />
                    <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.05)" />
                    <circle cx="150" cy="200" r="60" fill="rgba(255,255,255,0.05)" />
                  </g>
                )}
                {part.id === 'sol_fill' && (
                  <g>
                    {/* BGA chip */}
                    <rect x="30" y="30" width="100" height="100" rx="4" fill="#111" stroke="#333" strokeWidth="2" />
                    {/* Epoxy blobs */}
                    <path d="M 25,25 Q 80,10 135,25 Q 150,80 135,135 Q 80,150 25,135 Q 10,80 25,25 Z" fill="#080808" stroke="#1c1c1c" strokeWidth="3" opacity="0.8" />
                    <circle cx="80" cy="80" r="10" fill="#222" />
                  </g>
                )}
                {part.id === 'sol_base' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="4" fill="url(#pcb-grad)" stroke="#1a543b" strokeWidth="2" />
                    <line x1="20" y1="20" x2="20" y2={part.h - 20} stroke="#133d2b" strokeWidth="4" />
                    <line x1={part.w - 20} y1="20" x2={part.w - 20} y2={part.h - 20} stroke="#133d2b" strokeWidth="4" />
                    {Array.from({length: 10}).map((_, i) => (
                      <circle key={i} cx="40" cy={30 + i * 30} r="2" fill="#d4af37" />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Telemetry Footer */}
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#58d6ff' : '#ecf0ea' }}>
              {hoveredPart ? SOLDER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'SOLDER JOINT PROTECTION · 3 DISCRETE LAYERS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? SOLDER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'ENVIRONMENTAL SEAL & VIBRATION DAMPENING'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#58d6ff', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px' }}>
            {hoveredPart ? SOLDER_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/StructureExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Aluminium Structure physical discrete parts
// Coordinates in 1200 x 600 artboard
const STRUCTURE_PARTS_CONFIG = [
  {
    id: 'str_top',
    name: 'AEROSPACE-GRADE FACE PLATE',
    code: 'AL-PLATE-6061-T6-TOP',
    spec: '3mm thick 6061-T6 aluminum alloy face plate with countersunk hex bolt holes',
    role: 'STRUCTURAL INTEGRITY & SHIELDING',
    w: 260,
    h: 60,
    assembled: { x: 470, y: 180 },
    exploded: { x: 470, y: 50 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 600, y1: 'bottom', x2: 600, y2: 180 }
  },
  {
    id: 'str_core',
    name: 'EXTRUDED CORE CHASSIS',
    code: 'EXT-AL-PROFILE-2020',
    spec: 'Custom extruded aluminum structural rails with integrated T-slots for modular component mounting',
    role: 'PRIMARY LOAD-BEARING FRAME',
    w: 240,
    h: 120,
    assembled: { x: 480, y: 220 },
    exploded: { x: 480, y: 220 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'str_base',
    name: 'MOUNTING PLANE & BOTTOM PLATE',
    code: 'AL-PLATE-6061-T6-BTM',
    spec: 'Rigid base plate providing unified ground plane and payload attachment points',
    role: 'FOUNDATIONAL SUPPORT',
    w: 280,
    h: 40,
    assembled: { x: 460, y: 320 },
    exploded: { x: 460, y: 440 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 600, y1: 320, x2: 600, y2: 'top' }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function StructureExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    STRUCTURE_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="structure-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="str-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="str-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="al-plate-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bdc4cc" />
              <stop offset="100%" stopColor="#798694" />
            </linearGradient>

            <linearGradient id="al-ext-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4c5661" />
              <stop offset="50%" stopColor="#8d97a3" />
              <stop offset="100%" stopColor="#353e47" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {STRUCTURE_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (y1 === 'bottom') y1 = currentY + part.h;
              if (y1 === 'top') y1 = currentY;
              if (y2 === 'bottom') y2 = currentY + part.h;
              if (y2 === 'top') y2 = currentY;

              const isOrange = part.id === 'str_top';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#str-marker-orange)' : 'url(#str-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {STRUCTURE_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: TOP FACE PLATE */}
                  {part.id === 'str_top' && (
                    <g>
                      {/* Main plate body */}
                      <path d={`M 0,10 L ${part.w},10 L ${part.w - 10},${part.h} L 10,${part.h} Z`} fill="url(#al-plate-grad)" stroke="#49525c" strokeWidth="2" />
                      {/* Top thickness edge */}
                      <path d={`M 0,10 L 0,0 L ${part.w},0 L ${part.w},10 Z`} fill="#d3dae0" />
                      
                      {/* Countersunk Hex Bolts */}
                      <circle cx="30" cy="30" r="6" fill="#4c5661" stroke="#333" strokeWidth="1" />
                      <polygon points="30,26 33.5,28 33.5,32 30,34 26.5,32 26.5,28" fill="#111" />
                      
                      <circle cx={part.w - 30} cy="30" r="6" fill="#4c5661" stroke="#333" strokeWidth="1" />
                      <polygon points={`${part.w - 30},26 ${part.w - 26.5},28 ${part.w - 26.5},32 ${part.w - 30},34 ${part.w - 33.5},32 ${part.w - 33.5},28`} fill="#111" />
                      
                      <circle cx="130" cy="40" r="6" fill="#4c5661" stroke="#333" strokeWidth="1" />
                      <polygon points="130,36 133.5,38 133.5,42 130,44 126.5,42 126.5,38" fill="#111" />
                      
                      {/* Laser Etched Logo / Identification */}
                      <text x="130" y="25" fill="#49525c" fontFamily="'DM Mono', monospace" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="2">AERO-6061</text>
                    </g>
                  )}

                  {/* PART 2: EXTRUDED CORE */}
                  {part.id === 'str_core' && (
                    <g>
                      {/* Central rails forming a robust square/rectangular frame */}
                      {/* Back rail */}
                      <rect x="10" y="10" width={part.w - 20} height="20" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      {/* Left rail */}
                      <rect x="10" y="30" width="20" height="80" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      {/* Right rail */}
                      <rect x={part.w - 30} y="30" width="20" height="80" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      {/* Front rail */}
                      <rect x="10" y="90" width={part.w - 20} height="20" fill="url(#al-ext-grad)" stroke="#1f262e" strokeWidth="1" />
                      
                      {/* T-Slot details */}
                      <rect x="20" y="30" width="4" height="60" fill="#111" />
                      <rect x={part.w - 24} y="30" width="4" height="60" fill="#111" />
                      <rect x="30" y="18" width={part.w - 60} height="4" fill="#111" />
                      <rect x="30" y="98" width={part.w - 60} height="4" fill="#111" />
                      
                      {/* Corner braces */}
                      <path d="M 30,30 L 50,30 L 30,50 Z" fill="#798694" stroke="#333" />
                      <path d={`M ${part.w - 30},30 L ${part.w - 50},30 L ${part.w - 30},50 Z`} fill="#798694" stroke="#333" />
                      <path d="M 30,90 L 50,90 L 30,70 Z" fill="#798694" stroke="#333" />
                      <path d={`M ${part.w - 30},90 L ${part.w - 50},90 L ${part.w - 30},70 Z`} fill="#798694" stroke="#333" />
                    </g>
                  )}

                  {/* PART 3: BOTTOM MOUNTING PLANE */}
                  {part.id === 'str_base' && (
                    <g>
                      {/* Bottom plate thickness */}
                      <path d={`M 10,0 L ${part.w - 10},0 L ${part.w},10 L 0,10 Z`} fill="#9ea9b5" />
                      {/* Main plate body */}
                      <path d={`M 0,10 L ${part.w},10 L ${part.w},${part.h} L 0,${part.h} Z`} fill="url(#al-plate-grad)" stroke="#49525c" strokeWidth="2" />
                      
                      {/* Attachment points / screw holes */}
                      {[20, 80, 140, 200, 260].map(x => (
                        <g key={`hole-${x}`}>
                          <circle cx={x} cy="25" r="4" fill="#111" />
                          <circle cx={x} cy="25" r="5" fill="none" stroke="#49525c" strokeWidth="1" />
                        </g>
                      ))}
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? STRUCTURE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'ALUMINIUM MECHANICAL STRUCTURE · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? STRUCTURE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG VERTICAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? STRUCTURE_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/TempSensorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Temperature Sensor physical discrete parts + MAX31865 RTD Converter
const TEMPSENSOR_PARTS_CONFIG = [
  {
    id: 'ts_face',
    name: 'POLYMER ENCAPSULATION',
    code: 'TO-92-PLASTIC',
    spec: 'Molded polymer casing providing mechanical protection and moderate thermal coupling to the environment',
    role: 'ENVIRONMENTAL HOUSING',
    w: 80, h: 80,
    assembled: { x: 560, y: 160 },
    exploded: { x: 300, y: 160 },
    start: 0.15, end: 0.55, step: 1,
    line: { x1: 'right', y1: 200, x2: 560, y2: 200 }
  },
  {
    id: 'ts_die',
    name: 'DIGITAL THERMOMETER DIE',
    code: 'DS-IC-DIE',
    spec: 'Silicon die containing a bandgap temperature sensor and 9-to-12 bit analog-to-digital converter (ADC)',
    role: 'THERMAL MEASUREMENT & DIGITIZATION',
    w: 40, h: 40,
    assembled: { x: 580, y: 180 },
    exploded: { x: 580, y: 180 },
    start: 0, end: 0, step: 2
  },
  {
    id: 'ts_leads',
    name: 'COPPER-ALLOY LEADFRAME',
    code: 'LEADFRAME-3P-TO92',
    spec: '3-pin tinned copper leadframe for VDD, GND, and 1-Wire digital data (DQ) connection',
    role: 'POWER & DATA I/O',
    w: 60, h: 220,
    assembled: { x: 570, y: 150 },
    exploded: { x: 840, y: 150 },
    start: 0.15, end: 0.55, step: 3,
    line: { x1: 570, y1: 200, x2: 'left', y2: 200 }
  },
  {
    id: 'ts_max31865',
    name: 'MAX31865 RTD-TO-DIGITAL',
    code: 'MAX31865AAP+',
    spec: 'Precision 15-bit RTD-to-Digital converter with SPI interface for PT100/PT1000 temperature sensors',
    role: '[IC SUB-ASSEMBLY] PRECISION ADC',
    isSubComponent: true,
    w: 90, h: 90,
    assembled: { x: 555, y: 280 },
    exploded: { x: 970, y: 280 },
    start: 0.22, end: 0.62, step: 4,
    line: { x1: 555, y1: 325, x2: 'left', y2: 325 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function TempSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    TEMPSENSOR_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  return (
    <div className="tempsensor-horizontal-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <marker id="ts-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#c9e87b" /></marker>
            <marker id="ts-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2.5" fill="#ff8158" /></marker>
            <linearGradient id="polymer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1c1e" /><stop offset="50%" stopColor="#25282b" /><stop offset="100%" stopColor="#0f1112" />
            </linearGradient>
            <linearGradient id="si-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#294031" /><stop offset="100%" stopColor="#121f17" />
            </linearGradient>
            <linearGradient id="lead-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9da7b3" /><stop offset="50%" stopColor="#c5d0db" /><stop offset="100%" stopColor="#7e868f" />
            </linearGradient>
          </defs>

          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {TEMPSENSOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const isSub = part.isSubComponent;
              const color = isSub ? '#ff8158' : (part.id === 'ts_face' ? '#ff8158' : '#c9e87b');
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke={color} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '6 5'} strokeOpacity={0.75} markerStart={isSub ? 'url(#ts-marker-orange)' : `url(#ts-marker-${part.id === 'ts_face' ? 'orange' : 'lime'})`} markerEnd={isSub ? 'url(#ts-marker-orange)' : `url(#ts-marker-${part.id === 'ts_face' ? 'orange' : 'lime'})`} />
                </g>
              );
            })}
          </g>

          {TEMPSENSOR_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const isSub = part.isSubComponent;
            return (
              <g key={part.id} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke={isSub ? '#ff8158' : '#c9e87b'} strokeWidth={isSub ? '1.5' : '2.5'} strokeDasharray={isSub ? '3 3' : '5 5'} rx={isSub ? 2 : 6} />}

                {part.id === 'ts_face' && (
                  <g>
                    <path d="M 0,25 C 0,0 80,0 80,25 L 80,60 L 0,60 Z" fill="url(#polymer-grad)" stroke="#111" strokeWidth="1" />
                    <rect x="0" y="60" width="80" height="20" fill="#15171a" stroke="#000" strokeWidth="1" />
                    <text x="40" y="35" fill="#5b6066" fontFamily="'DM Mono', monospace" fontSize="11" fontWeight="bold" textAnchor="middle">DS18B20</text>
                    <text x="40" y="50" fill="#44484d" fontFamily="'DM Mono', monospace" fontSize="9" textAnchor="middle">DALLAS</text>
                    <text x="40" y="65" fill="#3a3d42" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">2135C4</text>
                  </g>
                )}

                {part.id === 'ts_die' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} fill="url(#si-die-grad)" stroke="#1a2e21" strokeWidth="1.5" />
                    <rect x="5" y="5" width="15" height="15" fill="none" stroke="#486e55" strokeWidth="0.5" strokeDasharray="1 1" />
                    <rect x="20" y="5" width="15" height="15" fill="none" stroke="#486e55" strokeWidth="0.5" strokeDasharray="1 1" />
                    <rect x="5" y="25" width="30" height="10" fill="#1f3325" stroke="#2c4a36" strokeWidth="0.5" />
                    <rect x="4" y="35" width="8" height="4" fill="#d4af37" />
                    <rect x="16" y="35" width="8" height="4" fill="#d4af37" />
                    <rect x="28" y="35" width="8" height="4" fill="#d4af37" />
                    <path d="M 8,37 Q 8,50 -2,60" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                    <path d="M 20,37 Q 20,50 15,60" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                    <path d="M 32,37 Q 32,50 42,60" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
                  </g>
                )}

                {part.id === 'ts_leads' && (
                  <g>
                    <rect x="0" y="0" width="60" height="30" fill="url(#lead-grad)" stroke="#5f6770" strokeWidth="1" />
                    <rect x="10" y="5" width="40" height="20" fill="#8c97a3" />
                    <path d="M 5,30 L 15,40 L 15,220" fill="none" stroke="url(#lead-grad)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M 5,30 L 15,40 L 15,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                    <path d="M 27,30 L 30,40 L 30,220" fill="none" stroke="url(#lead-grad)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M 27,30 L 30,40 L 30,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                    <path d="M 55,30 L 45,40 L 45,220" fill="none" stroke="url(#lead-grad)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M 55,30 L 45,40 L 45,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
                    <text x="15" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">GND</text>
                    <text x="30" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">DQ</text>
                    <text x="45" y="235" fill="#444" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="bold" textAnchor="middle">VDD</text>
                  </g>
                )}

                {/* SUB-COMPONENT: MAX31865 */}
                {part.id === 'ts_max31865' && (
                  <g>
                    <rect x="0" y="0" width={part.w} height={part.h} rx="3" fill="#111215" stroke="#ff8158" strokeWidth="1.5" strokeDasharray="4 2" />
                    <rect x={part.w / 2 - 20} y="15" width="40" height="30" rx="2" fill="#0a0a0a" stroke="#555" strokeWidth="1" />
                    <circle cx={part.w / 2 - 14} cy="22" r="2.5" fill="#888" />
                    {Array.from({ length: 10 }).map((_, i) => (<rect key={`p-${i}`} x={part.w / 2 - 24} y={17 + i * 3} width="4" height="1.5" fill="#d4af37" />))}
                    {Array.from({ length: 10 }).map((_, i) => (<rect key={`q-${i}`} x={part.w / 2 + 20} y={17 + i * 3} width="4" height="1.5" fill="#d4af37" />))}
                    <text x={part.w / 2} y="32" fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="800" textAnchor="middle">MAX31865</text>
                    <text x={part.w / 2} y="42" fill="#aaa" fontFamily="'DM Mono', monospace" fontSize="5" textAnchor="middle">15-BIT RTD ADC</text>
                    <rect x="2" y={part.h - 14} width={part.w - 4} height="12" rx="2" fill="rgba(255,129,88,0.15)" />
                    <text x={part.w / 2} y={part.h - 5} fill="#ff8158" fontFamily="'DM Mono', monospace" fontSize="5" fontWeight="700" textAnchor="middle">IC SUB-ASSEMBLY</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#c9e87b' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? TEMPSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'DIGITAL TEMPERATURE SENSOR · 4 COMPONENTS'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? TEMPSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'INCLUDES MAX31865 RTD TO DIGITAL CONVERTER'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#ff8158', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? TEMPSENSOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/ThermistorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Thermistor physical discrete parts
// Coordinates in 1200 x 600 artboard
const THERMISTOR_PARTS_CONFIG = [
  {
    id: 'thm_glass',
    name: 'GLASS ENCAPSULATION BEAD',
    code: 'NTC-GLASS-BEAD-10K',
    spec: 'Hermetically sealed glass envelope for high-temperature stability up to 300°C',
    role: 'ENVIRONMENTAL & THERMAL SEAL',
    w: 60,
    h: 100,
    assembled: { x: 570, y: 150 },
    exploded: { x: 300, y: 150 },
    start: 0.15,
    end: 0.55,
    step: 1,
    line: { x1: 'right', y1: 200, x2: 570, y2: 200 }
  },
  {
    id: 'thm_core',
    name: 'NTC CERAMIC SEMICONDUCTOR DIE',
    code: 'NTC-DIE-10K-3950',
    spec: 'Negative Temperature Coefficient (NTC) metal-oxide ceramic sensing element, 10kΩ @ 25°C, B-value 3950K',
    role: 'THERMAL MEASUREMENT SENSOR',
    w: 40,
    h: 60,
    assembled: { x: 580, y: 170 },
    exploded: { x: 580, y: 170 },
    start: 0,
    end: 0,
    step: 2
  },
  {
    id: 'thm_leads',
    name: 'DUMET RADIAL LEADS',
    code: 'LEAD-DUMET-AWG24',
    spec: 'Copper-clad nickel-iron alloy (Dumet) wire leads for matched thermal expansion with glass',
    role: 'ELECTRICAL & THERMAL PATH',
    w: 80,
    h: 220,
    assembled: { x: 560, y: 200 },
    exploded: { x: 800, y: 200 },
    start: 0.15,
    end: 0.55,
    step: 3,
    line: { x1: 600, y1: 200, x2: 'left', y2: 200 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function ThermistorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  // Refs for direct DOM mutation (bypass React render cycle)
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);

  const progress = Math.max(0, Math.min(1, scrollProgress));

  // Direct DOM mutation for transforms (bypass React render cycle)
  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }

    THERMISTOR_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

      const partEl = partGroupRefs.current[part.id];
      if (partEl) {
        partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      }

      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) {
          lineEl.setAttribute('opacity', '0');
        } else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1;
            let x2 = part.line.x2;
            const y1 = part.line.y1;
            const y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1);
            lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2);
            lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);


  return (
    <div
      className="thermistor-horizontal-view-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Main Visual Stage Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(62vh, 480px)',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(222, 232, 224, 0.14)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Optical Engineering Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201, 232, 123, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 232, 123, 0.035) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222, 232, 224, 0.07)' }} />

          {/* Reticle brackets */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderLeft: '2px solid rgba(201,232,123,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(201,232,123,0.6)', borderRight: '2px solid rgba(201,232,123,0.6)' }} />
        </div>

        {/* SVG Artboard: 1200 x 600 */}
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            /* filter removed for perf */
          }}
        >
          <defs>
            <marker id="thm-marker-lime" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#c9e87b" />
            </marker>
            <marker id="thm-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ff8158" />
            </marker>

            <linearGradient id="glass-bead-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff3d9" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#d69728" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#875103" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="ceramic-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2c30" />
              <stop offset="50%" stopColor="#15171a" />
              <stop offset="100%" stopColor="#0b0c0d" />
            </linearGradient>

            <linearGradient id="dumet-wire-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3a76f" />
              <stop offset="30%" stopColor="#ffcca1" />
              <stop offset="70%" stopColor="#c7803e" />
              <stop offset="100%" stopColor="#8a4d13" />
            </linearGradient>
          </defs>

          {/* Dynamic Laser Projection Lines */}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {THERMISTOR_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              const subP = smoothSubProgress(progress, part.start, part.end);
              if (subP <= 0.02) return null;

              const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
              const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;

              let x1 = part.line.x1;
              let x2 = part.line.x2;
              let y1 = part.line.y1;
              let y2 = part.line.y2;

              if (x1 === 'right') x1 = currentX + part.w;
              if (x1 === 'left') x1 = currentX;
              if (x2 === 'right') x2 = currentX + part.w;
              if (x2 === 'left') x2 = currentX;

              const isOrange = part.id === 'thm_glass';
              const color = isOrange ? '#ff8158' : '#c9e87b';
              const marker = isOrange ? 'url(#thm-marker-orange)' : 'url(#thm-marker-lime)';

              return (
                <g ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0" key={`line-${part.id}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeOpacity={0.75}
                    markerStart={marker}
                    markerEnd={marker}
                  />
                </g>
              );
            })}
          </g>

          {/* Physical Discrete Parts */}
          {THERMISTOR_PARTS_CONFIG.map((part) => {
            const subP = smoothSubProgress(progress, part.start, part.end);
            const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
            const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
            const isHovered = hoveredPart === part.id;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}
                ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`}
              >
                {/* Hover Outline */}
                {isHovered && (
                  <rect
                    x={-6}
                    y={-6}
                    width={part.w + 12}
                    height={part.h + 12}
                    fill="none"
                    stroke="#c9e87b"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    rx="6"
                  />
                )}

                <g>
                  {/* PART 1: GLASS ENCAPSULATION */}
                  {part.id === 'thm_glass' && (
                    <g>
                      <path d="M 15,100 C 15,100 0,60 0,30 C 0,0 60,0 60,30 C 60,60 45,100 45,100 Z" fill="url(#glass-bead-grad)" stroke="#d9a543" strokeWidth="1.5" />
                      {/* Glass highlight */}
                      <path d="M 15,30 C 15,15 30,10 40,15" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                    </g>
                  )}

                  {/* PART 2: CERAMIC DIE */}
                  {part.id === 'thm_core' && (
                    <g>
                      <rect x="5" y="10" width="30" height="35" rx="3" fill="url(#ceramic-die-grad)" stroke="#444" strokeWidth="1" />
                      {/* Sensing surface texture */}
                      {[15, 20, 25, 30, 35].map((y) => (
                        <line key={y} x1="8" y1={y} x2="32" y2={y} stroke="#333" strokeWidth="1" />
                      ))}
                      {/* Silver top/bottom contacts */}
                      <rect x="5" y="10" width="30" height="6" fill="#c0c5cc" />
                      <rect x="5" y="39" width="30" height="6" fill="#c0c5cc" />
                    </g>
                  )}

                  {/* PART 3: DUMET LEADS */}
                  {part.id === 'thm_leads' && (
                    <g>
                      {/* Left wire */}
                      <path d="M 20,0 C 20,40 10,70 10,220" fill="none" stroke="url(#dumet-wire-grad)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 20,0 C 20,40 10,70 10,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                      {/* Right wire */}
                      <path d="M 60,0 C 60,40 70,70 70,220" fill="none" stroke="url(#dumet-wire-grad)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 60,0 C 60,40 70,70 70,220" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Telemetry Footer Strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            background: 'rgba(10, 14, 14, 0.94)',
            border: '1px solid rgba(222, 232, 224, 0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            zIndex: 6
          }}
        >
          <div>
            <div
              style={{
                font: '700 11px "DM Mono", monospace',
                color: hoveredPart ? '#c9e87b' : '#ecf0ea',
                letterSpacing: '0.6px'
              }}
            >
              {hoveredPart
                ? THERMISTOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name
                : 'THERMISTOR SYSTEM · 3 DISCRETE PHYSICAL LAYERS'}
            </div>
            <div
              style={{
                font: '400 9px "DM Mono", monospace',
                color: '#8d9890',
                marginTop: '2px'
              }}
            >
              {hoveredPart
                ? THERMISTOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec
                : 'PARTS SEPARATE ALONG HORIZONTAL PROJECTION AXES AS YOU SCROLL'}
            </div>
          </div>

          <div
            style={{
              font: '600 9px "DM Mono", monospace',
              color: '#ff8158',
              borderLeft: '1px solid rgba(222,232,224,0.2)',
              paddingLeft: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {hoveredPart
              ? THERMISTOR_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role
              : '3 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/components/VibrationSensorExplodedView.jsx

``jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Vibration & Solder-Fatigue Sensor Array — physical discrete parts
const VIBRATION_PARTS_CONFIG = [
  {
    id: 'vib_piezo',
    name: 'MURATA 7BB-20-6L0 PIEZOELECTRIC DISC',
    code: 'PZT-7BB-20-6L0',
    spec: '20mm brass-backed PZT ceramic disc for wideband acoustic emission and solder-fatigue crack detection',
    role: 'ACOUSTIC EMISSION SENSOR',
    w: 140,
    h: 140,
    assembled: { x: 530, y: 230 },
    exploded: { x: 100, y: 230 },
    start: 0.05,
    end: 0.45,
    step: 1,
    line: { x1: 'right', y1: 300, x2: 530, y2: 300 }
  },
  {
    id: 'vib_adxl',
    name: 'ANALOG DEVICES ADXL355 ACCELEROMETER',
    code: 'ADXL355-BCCZ',
    spec: 'Low-noise 3-axis MEMS accelerometer, ±2g/±4g/±8g range, 4kHz bandwidth, 25μg/√Hz noise density',
    role: 'VIBRATION FREQUENCY ANALYSIS',
    w: 120,
    h: 160,
    assembled: { x: 540, y: 220 },
    exploded: { x: 310, y: 220 },
    start: 0.12,
    end: 0.55,
    step: 2,
    line: { x1: 'right', y1: 300, x2: 540, y2: 300 }
  },
  {
    id: 'vib_carrier',
    name: 'SENSOR CARRIER PCB',
    code: 'PCB-VIB-CARRIER-4L',
    spec: '4-layer FR-4 carrier with analog front-end, SPI interface, and EMI shielding ground plane',
    role: 'SIGNAL CONDITIONING',
    w: 180,
    h: 200,
    assembled: { x: 510, y: 200 },
    exploded: { x: 510, y: 200 },
    start: 0,
    end: 0,
    step: 3
  },
  {
    id: 'vib_mount',
    name: 'STAINLESS STEEL MOUNTING BRACKET',
    code: 'BRK-SS304-VIB-MNT',
    spec: '304 stainless steel L-bracket with M3 threaded inserts for rigid coupling to monitored structure',
    role: 'MECHANICAL COUPLING',
    w: 160,
    h: 180,
    assembled: { x: 520, y: 210 },
    exploded: { x: 870, y: 210 },
    start: 0.05,
    end: 0.45,
    step: 4,
    line: { x1: 520, y1: 300, x2: 'left', y2: 300 }
  }
];

function smoothSubProgress(overallProgress, start, end) {
  if (start === end) return overallProgress >= start ? 1 : 0;
  if (overallProgress <= start) return 0;
  if (overallProgress >= end) return 1;
  const t = (overallProgress - start) / (end - start);
  return t * t * (3 - 2 * t);
}

// ——— STATIC SVG PART DRAWINGS ————————————————
const PiezoDisc = React.memo(({ w, h }) => (
  <g>
    {/* Brass backing disc */}
    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="url(#brass-gradient)" stroke="#b8860b" strokeWidth="2" />
    {/* PZT ceramic centre */}
    <ellipse cx={w / 2} cy={h / 2} rx={w / 4} ry={h / 4} fill="#d4d4d4" stroke="#999" strokeWidth="1.5" />
    {/* Solder pads */}
    <circle cx={w / 2 - 15} cy={h / 2 + 30} r="4" fill="#d4af37" stroke="#fff" strokeWidth="0.5" />
    <circle cx={w / 2 + 15} cy={h / 2 + 30} r="4" fill="#d4af37" stroke="#fff" strokeWidth="0.5" />
    {/* Lead wires */}
    <line x1={w / 2 - 15} y1={h / 2 + 34} x2={w / 2 - 15} y2={h - 4} stroke="#d82b2b" strokeWidth="2" strokeLinecap="round" />
    <line x1={w / 2 + 15} y1={h / 2 + 34} x2={w / 2 + 15} y2={h - 4} stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    <text x={w / 2} y="18" fill="#8B7355" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">7BB-20-6L0</text>
  </g>
));

const AdxlAccel = React.memo(({ w, h }) => (
  <g>
    {/* QFN Package */}
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#111215" stroke="#3a3d42" strokeWidth="1.5" />
    {/* Die pad */}
    <rect x={w / 2 - 22} y={h / 2 - 22} width="44" height="44" rx="2" fill="#1a1d22" stroke="#555" strokeWidth="1" />
    {/* MEMS sensing element */}
    <rect x={w / 2 - 14} y={h / 2 - 14} width="28" height="28" rx="1" fill="#2a2d35" stroke="#666" strokeWidth="0.8" />
    {/* Axis indicators */}
    <line x1={w / 2} y1={h / 2 - 10} x2={w / 2} y2={h / 2 + 10} stroke="#58d6ff" strokeWidth="1.5" opacity="0.7" />
    <line x1={w / 2 - 10} y1={h / 2} x2={w / 2 + 10} y2={h / 2} stroke="#ff8158" strokeWidth="1.5" opacity="0.7" />
    {/* QFN pads */}
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={`l-${i}`} x="0" y={24 + i * 22} width="6" height="10" rx="0.5" fill="#d4af37" />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={`r-${i}`} x={w - 6} y={24 + i * 22} width="6" height="10" rx="0.5" fill="#d4af37" />
    ))}
    <text x={w / 2} y="16" fill="#7ac4e8" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="800" textAnchor="middle">ADXL355</text>
    <text x={w / 2} y={h - 8} fill="#556874" fontFamily="'DM Mono', monospace" fontSize="6" textAnchor="middle">3-AXIS MEMS</text>
  </g>
));

const CarrierPcb = React.memo(({ w, h }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} rx="4" fill="#14261a" stroke="#2b9951" strokeWidth="2" />
    {/* Traces */}
    <path d="M 20,40 L 80,40 L 80,80 L 160,80" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    <path d="M 20,120 L 60,120 L 60,160 L 160,160" fill="none" stroke="#3d8c5a" strokeWidth="1.5" />
    {/* SPI header */}
    <rect x={w - 30} y="20" width="20" height="80" rx="2" fill="#1a1c1e" stroke="#444" strokeWidth="1" />
    {Array.from({ length: 6 }).map((_, i) => (
      <circle key={i} cx={w - 20} cy={30 + i * 12} r="3" fill="#d4af37" stroke="#fff" strokeWidth="0.5" />
    ))}
    {/* Ground plane indicator */}
    <rect x="10" y={h - 30} width={w - 20} height="16" rx="2" fill="none" stroke="#2b6b3f" strokeWidth="1" strokeDasharray="3 3" />
    <text x={w / 2} y={h - 18} fill="#3d8c5a" fontFamily="'DM Mono', monospace" fontSize="7" textAnchor="middle">GND PLANE</text>
    <text x={w / 2} y="16" fill="#2b9951" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" textAnchor="middle">CARRIER PCB</text>
  </g>
));

const MountingBracket = React.memo(({ w, h }) => (
  <g>
    {/* L-bracket body */}
    <path d={`M 0,0 L ${w},0 L ${w},${h * 0.3} L ${w * 0.3},${h * 0.3} L ${w * 0.3},${h} L 0,${h} Z`}
      fill="url(#steel-gradient)" stroke="#8e96a1" strokeWidth="2" />
    {/* M3 threaded inserts */}
    <circle cx="20" cy="20" r="6" fill="#555" stroke="#888" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="2.5" fill="#333" />
    <circle cx={w - 20} cy="20" r="6" fill="#555" stroke="#888" strokeWidth="1.5" />
    <circle cx={w - 20} cy="20" r="2.5" fill="#333" />
    <circle cx="20" cy={h - 20} r="6" fill="#555" stroke="#888" strokeWidth="1.5" />
    <circle cx="20" cy={h - 20} r="2.5" fill="#333" />
    {/* Surface texture */}
    {[1, 2, 3].map(i => (
      <line key={i} x1="10" y1={h * 0.35 + i * 30} x2={w * 0.25} y2={h * 0.35 + i * 30} stroke="#6e7680" strokeWidth="0.8" opacity="0.5" />
    ))}
    <text x={w * 0.15} y={h / 2 + 10} fill="#6e7680" fontFamily="'DM Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle" transform={`rotate(-90, ${w * 0.15}, ${h / 2 + 10})`}>SS304</text>
  </g>
));

const PART_RENDERERS = {
  vib_piezo: PiezoDisc,
  vib_adxl: AdxlAccel,
  vib_carrier: CarrierPcb,
  vib_mount: MountingBracket,
};

export default function VibrationSensorExplodedView({ scrollProgress = 0, isSceneActive = false }) {
  const [hoveredPart, setHoveredPart] = useState(null);
  const partGroupRefs = useRef({});
  const lineGroupRefs = useRef({});
  const linesContainerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const progress = Math.max(0, Math.min(1, scrollProgress));

  useEffect(() => {
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;
    if (linesContainerRef.current) {
      linesContainerRef.current.setAttribute('opacity', progress > 0.04 ? '1' : '0');
    }
    VIBRATION_PARTS_CONFIG.forEach((part) => {
      const subP = smoothSubProgress(progress, part.start, part.end);
      const currentX = part.assembled.x + (part.exploded.x - part.assembled.x) * subP;
      const currentY = part.assembled.y + (part.exploded.y - part.assembled.y) * subP;
      const partEl = partGroupRefs.current[part.id];
      if (partEl) partEl.setAttribute('transform', `translate(${currentX}, ${currentY})`);
      const lineEl = lineGroupRefs.current[part.id];
      if (lineEl && part.line) {
        if (subP <= 0.02) { lineEl.setAttribute('opacity', '0'); }
        else {
          lineEl.setAttribute('opacity', '1');
          const lineChild = lineEl.querySelector('line');
          if (lineChild) {
            let x1 = part.line.x1, x2 = part.line.x2;
            const y1 = part.line.y1, y2 = part.line.y2;
            if (x1 === 'right') x1 = currentX + part.w;
            if (x1 === 'left') x1 = currentX;
            if (x2 === 'right') x2 = currentX + part.w;
            if (x2 === 'left') x2 = currentX;
            lineChild.setAttribute('x1', x1); lineChild.setAttribute('y1', y1);
            lineChild.setAttribute('x2', x2); lineChild.setAttribute('y2', y2);
          }
        }
      }
    });
  }, [progress]);

  const handleMouseEnter = useCallback((id) => setHoveredPart(id), []);
  const handleMouseLeave = useCallback(() => setHoveredPart(null), []);

  const svgDefs = useMemo(() => (
    <defs>
      <marker id="vib-marker-green" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2.5" fill="#7be88a" />
      </marker>
      <linearGradient id="brass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4a849" />
        <stop offset="50%" stopColor="#c4942a" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
      <linearGradient id="steel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8e96a1" />
        <stop offset="50%" stopColor="#a8b2be" />
        <stop offset="100%" stopColor="#6e7680" />
      </linearGradient>
    </defs>
  ), []);

  return (
    <div className="vibration-view-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(62vh, 480px)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(222, 232, 224, 0.14)', background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 26, 25, 0.92) 0%, rgba(10, 13, 13, 0.98) 100%)', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(123, 232, 138, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 232, 138, 0.035) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(222,232,224,0.07)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(123,232,138,0.6)', borderLeft: '2px solid rgba(123,232,138,0.6)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(123,232,138,0.6)', borderRight: '2px solid rgba(123,232,138,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(123,232,138,0.6)', borderLeft: '2px solid rgba(123,232,138,0.6)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(123,232,138,0.6)', borderRight: '2px solid rgba(123,232,138,0.6)' }} />
        </div>
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {svgDefs}
          <g ref={linesContainerRef} opacity="0" style={{ transition: 'opacity 0.25s' }}>
            {VIBRATION_PARTS_CONFIG.map((part) => {
              if (!part.line) return null;
              return (
                <g key={`line-${part.id}`} ref={(el) => { lineGroupRefs.current[part.id] = el; }} opacity="0">
                  <line x1={part.assembled.x} y1={part.line.y1} x2={part.assembled.x} y2={part.line.y2} stroke="#7be88a" strokeWidth="2.5" strokeDasharray="6 5" strokeOpacity={0.75} markerStart="url(#vib-marker-green)" markerEnd="url(#vib-marker-green)" />
                </g>
              );
            })}
          </g>
          {VIBRATION_PARTS_CONFIG.map((part) => {
            const isHovered = hoveredPart === part.id;
            const PartRenderer = PART_RENDERERS[part.id];
            return (
              <g key={part.id} ref={(el) => { partGroupRefs.current[part.id] = el; }} transform={`translate(${part.assembled.x}, ${part.assembled.y})`} onMouseEnter={() => handleMouseEnter(part.id)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer', willChange: 'transform', filter: isHovered ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.5)) brightness(1.15)' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))', transition: 'filter 0.15s ease-out' }}>
                {isHovered && <rect x={-6} y={-6} width={part.w + 12} height={part.h + 12} fill="none" stroke="#7be88a" strokeWidth="2.5" strokeDasharray="5 5" rx="6" />}
                {PartRenderer && <PartRenderer w={part.w} h={part.h} />}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', background: 'rgba(10, 14, 14, 0.94)', border: '1px solid rgba(222, 232, 224, 0.2)', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 6 }}>
          <div>
            <div style={{ font: '700 11px "DM Mono", monospace', color: hoveredPart ? '#7be88a' : '#ecf0ea', letterSpacing: '0.6px' }}>
              {hoveredPart ? VIBRATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.name : 'VIBRATION SENSOR ARRAY · 4 DISCRETE SUB-ASSEMBLIES'}
            </div>
            <div style={{ font: '400 9px "DM Mono", monospace', color: '#8d9890', marginTop: '2px' }}>
              {hoveredPart ? VIBRATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.spec : 'ADXL355 MEMS + PIEZOELECTRIC ACOUSTIC EMISSION DETECTION'}
            </div>
          </div>
          <div style={{ font: '600 9px "DM Mono", monospace', color: '#7be88a', borderLeft: '1px solid rgba(222,232,224,0.2)', paddingLeft: '10px', whiteSpace: 'nowrap' }}>
            {hoveredPart ? VIBRATION_PARTS_CONFIG.find((p) => p.id === hoveredPart)?.role : '4 COMPONENTS'}
          </div>
        </div>
      </div>
    </div>
  );
}

``

## src/data/hardware.js

``jsx
export const components=[
['esp32','01','ESP32','CONTROL','MAIN CONTROLLER','esp32.png',[50,48],[50,23],155],['microsd','02','MICROSD','DATA','LOCAL DATA STORAGE','microsd.jpg',[52,49],[78,35],110],['display','03','ILI9341 DISPLAY','DATA','VISUAL OUTPUT','Display.jpg',[50,50],[22,35],130],['regulator','04','VOLTAGE REGULATOR','POWER','POWER CONDITIONING','Voltage regulator.jpg',[48,52],[50,73],135],['thermistor','05','THERMISTOR','SENSOR','TEMPERATURE MONITORING','Thermistor.jpg',[44,49],[20,25],105],['battery-sensor','06','BATTERY VOLTAGE','SENSOR','BATTERY CONDITION','Battery voltage sensor.jpg',[45,53],[20,49],118],['rf-sensor','07','RF SENSOR','SENSOR','RF ACTIVITY','RF sensor.jpg',[55,47],[22,74],125],['vibration-sensor','08','VIBRATION SENSOR','SENSOR','VIBRATION & FATIGUE','Vibration sensor.jpg',[50,50],[78,25],120],['env-sensor','09','ENV SENSOR','SENSOR','ENVIRONMENT MONITORING','Env sensor.jpg',[50,50],[78,49],115],['battery','10','BATTERY PACK','POWER','PRIMARY ENERGY SOURCE','Battery pack.jpg',[50,56],[50,87],175],['mosfet','11','MOSFET ARRAY','POWER','CONTROLLED SELF-HEATING','MOSFET.jpg',[47,57],[77,66],122],['temp-sensor','12','TEMPERATURE SENSOR','POWER','PACK MONITORING','Temperature sensor.jpg',[53,55],[78,83],112],['converter','13','BI-DIRECTIONAL DC-DC','POWER','POWER FLOW','DC-DC converter.jpg',[54,58],[50,62],140],['energy-harvesting','14','ENERGY HARVESTING','POWER','THERMAL ENERGY RECOVERY','Energy harvesting.jpg',[50,50],[22,62],130],['heat-pipe','15','HEAT PIPE','THERMAL','THERMAL TRANSFER','Heat pipe.jpg',[48,45],[70,15],165],['radiator','16','RADIATOR','THERMAL','HEAT REJECTION','Radiator.jpg',[51,43],[84,18],155],['structure','17','ALUMINIUM STRUCTURE','THERMAL','THERMAL FRAME','Aluminium structure.jpg',[50,50],[50,50],270],['prototype-board','18','PROTOTYPE BOARD','STRUCTURE','INTEGRATION PLATFORM','Prototype board.jpg',[50,50],[50,50],200],['lora','19','LORA MODULE','COMMUNICATION','LONG RANGE LINK','LoRa module.jpg',[55,52],[82,55],135],['antenna','20','ANTENNA','COMMUNICATION','RF INTERFACE','Antenna.jpg',[54,42],[50,5],145]
].map(([id,code,name,category,role,image,assembled,exploded,size])=>({id,code,name,category,role,image:`/components/${image}`,assembled,exploded,size}));
export const phases=[
['COMPLETE SYSTEM','ENGINEERED\nTO SURVIVE.','A complete hardware architecture engineered, monitored and protected as one system.','structure'],['01 / CONTROL','ESP32','The central control unit responsible for processing sensor information and coordinating system operations.','esp32'],['02 / DATA','MICROSD','Local storage for telemetry, diagnostics and historical system data.','microsd','SENSORS  →  ESP32  →  MICROSD'],['03 / DATA','ILI9341\nDISPLAY','2.8" SPI TFT display for local status output, diagnostics and real-time telemetry visualization.','display','ESP32  →  SPI  →  DISPLAY'],['04 / POWER','VOLTAGE\nREGULATOR','A stable power rail connects stored energy to the system electronics.','regulator','BATTERY  ↓  REGULATOR  ↓  ELECTRONICS'],['05–09 / SENSORS','SENSOR\nARRAY','Thermistor, battery-voltage, RF, vibration and environmental sensors provide the live system picture.','thermistor'],['10–14 / POWER','POWER\nSYSTEM','Battery energy, controlled self-heating, bidirectional conversion and thermal harvesting work as one monitored loop.','battery','BATTERY  ⇄  DC-DC CONVERTER'],['15–17 / THERMAL','THERMAL\nARCHITECTURE','A passive route moves heat through the heat pipe and radiator into the environment.','heat-pipe','HEAT SOURCE  ↓  HEAT PIPE  ↓  RADIATOR'],['18 / STRUCTURE','PROTOTYPE\nBOARD','MB-102 breadboard and custom FR-4 PCB form the physical integration platform.','prototype-board'],['PROTECTION LAYERS','PROTECTION\nBY DESIGN.','High-voltage insulation and solder-joint protection safeguard system integrity.','placeholder'],['SYSTEM RESILIENCE','RADIATION\nRESILIENCE.','Physical protection safeguards electronics; watchdogs, error checking and checksums support recovery and data integrity.','resilience'],['19–20 / COMMUNICATION','COMMUNICATION','LoRa, antenna hardware and extenders maintain a low-power link to the remote system.','lora','SYSTEM  ↓  LORA  ↓  ANTENNA  ↓  REMOTE NODE'],['FULL ASSEMBLY','EVERY COMPONENT\nHAS A ROLE.','The complete exploded architecture, visible as one connected physical system.','all'],['FINAL SYSTEM','ONE SYSTEM.\nMANY LAYERS.','Control, power, thermal, communication, data and protection return to one integrated assembly.','structure']
].map(([label,title,body,active,flow])=>({label,title,body,active,flow}));

``

## src/data/scenes.js

``jsx
import { components } from './hardware';

const byId = Object.fromEntries(components.map(component => [component.id, component]));
const withComponent = (id, extra = {}) => ({ ...byId[id], ...extra, kind: 'component' });

export const scenes = [
  withComponent('esp32', { index: '01', category: 'CONTROL', title: 'ESP32', role: 'MAIN CONTROLLER', description: 'The central processing unit responsible for monitoring sensors and coordinating system operations.', explodedImage: '/components/esp32-exploded.png', layers: ['RF MODULE', 'PIN HEADERS', 'MAIN PCB', 'USB / BASE INTERFACE'] }),
  withComponent('microsd', { index: '02', category: 'DATA', title: 'MICROSD', role: 'LOCAL DATA STORAGE', description: 'Local storage for telemetry, diagnostics and historical system data.', layers: ['CARD FACE', 'CONTACT ARRAY', 'STORAGE BODY'] }),
  withComponent('display', { index: '03', category: 'DATA', title: 'ILI9341\nDISPLAY', role: 'VISUAL OUTPUT INTERFACE', description: '2.8" SPI TFT display module for local status output, diagnostics overlay, and real-time telemetry visualization.', layers: ['FRONT BEZEL', 'TFT LCD PANEL', 'BACKLIGHT DIFFUSER', 'FPC RIBBON', 'DRIVER PCB'] }),
  withComponent('regulator', { index: '04', category: 'POWER', title: 'VOLTAGE REGULATOR', role: 'POWER REGULATION', description: 'Conditions supply power before it reaches the system electronics.', layers: ['UPPER ASSEMBLY', 'REGULATOR BODY', 'LOWER INTERFACE'] }),
  withComponent('thermistor', { index: '05', category: 'SENSOR', title: 'THERMISTOR', role: 'TEMPERATURE MONITORING', description: 'Measures temperature at the sensing interface.', layers: ['SENSOR TIP', 'SENSING BODY', 'CONNECTION LEAD'] }),
  withComponent('battery-sensor', { index: '06', category: 'SENSOR', title: 'BATTERY VOLTAGE SENSOR', role: 'BATTERY CONDITION MONITORING', description: 'Reports battery condition to the control system.', layers: ['SENSOR FACE', 'MEASUREMENT BODY', 'POWER INTERFACE'] }),
  withComponent('rf-sensor', { index: '07', category: 'SENSOR', title: 'RF SENSOR', role: 'RF ACTIVITY MONITORING', description: 'Detects RF activity around the system.', layers: ['RF SURFACE', 'SENSOR BODY', 'CONNECTION INTERFACE'], effect: 'rf' }),
  withComponent('vibration-sensor', { index: '08', category: 'SENSOR', title: 'VIBRATION\nSENSOR', role: 'VIBRATION & SOLDER-FATIGUE MONITORING', description: 'ADXL355 accelerometer and Murata piezoelectric disc for wideband vibration analysis and acoustic emission crack detection.', layers: ['PIEZO DISC', 'ADXL355 ACCEL', 'CARRIER PCB', 'MOUNTING BRACKET'] }),
  withComponent('env-sensor', { index: '09', category: 'SENSOR', title: 'ENVIRONMENTAL\nSENSOR', role: 'ENVIRONMENT MONITORING', description: 'Sensirion SHT41 humidity/temperature and Bosch BMP390 barometric pressure sensing for ambient environmental awareness.', layers: ['PTFE GRILL', 'SHT41 SENSOR', 'BMP390 SENSOR', 'CARRIER PCB', 'EMI SHIELD'] }),
  withComponent('battery', { index: '10', category: 'POWER', title: 'BATTERY PACK', role: 'PRIMARY ENERGY SOURCE', description: 'The system energy store, monitored and managed by the surrounding power electronics.', layers: ['UPPER ENCLOSURE', 'ENERGY PACK', 'CONNECTOR INTERFACE'] }),
  withComponent('mosfet', { index: '11', category: 'POWER', title: 'MOSFETS', role: 'CONTROLLED BATTERY SELF-HEATING', description: 'Controls self-heating within the battery system.', layers: ['CONTROL FACE', 'MOSFET BODY', 'THERMAL INTERFACE'] }),
  withComponent('temp-sensor', { index: '12', category: 'SENSOR', title: 'TEMPERATURE SENSOR', role: 'THERMAL MONITORING', description: 'Tracks thermal conditions in the battery system.', layers: ['SENSOR FACE', 'SENSOR BODY', 'LEAD INTERFACE'] }),
  withComponent('converter', { index: '13', category: 'POWER', title: 'BI-DIRECTIONAL DC-DC', role: 'POWER CONVERSION', description: 'Manages power transfer between connected energy domains.', layers: ['CONVERSION STAGE', 'POWER BODY', 'INPUT / OUTPUT'], effect: 'power' }),
  withComponent('energy-harvesting', { index: '14', category: 'POWER', title: 'ENERGY\nHARVESTING', role: 'THERMAL ENERGY RECOVERY', description: 'Thermoelectric generator and LTC3108 ultra-low voltage harvester converting waste heat into supplemental system power.', layers: ['HOT-SIDE PAD', 'TEG ARRAY', 'LTC3108 IC', 'TRANSFORMER', 'COLD-SIDE SINK'], effect: 'heat' }),
  withComponent('heat-pipe', { index: '15', category: 'THERMAL', title: 'HEAT PIPE', role: 'THERMAL TRANSFER', description: 'Moves excess heat away from concentrated electronics.', layers: ['THERMAL END', 'HEAT TRANSFER CORE', 'THERMAL END'], effect: 'heat' }),
  withComponent('radiator', { index: '16', category: 'THERMAL', title: 'RADIATOR', role: 'HEAT DISSIPATION', description: 'Rejects thermal energy into the surrounding environment.', layers: ['FIN ARRAY', 'RADIATOR BODY', 'MOUNTING INTERFACE'] }),
  withComponent('structure', { index: '17', category: 'STRUCTURE', title: 'ALUMINIUM STRUCTURE', role: 'MECHANICAL SUPPORT', description: 'Supports and connects the system thermal architecture.', layers: ['STRUCTURAL FACE', 'ALUMINIUM FRAME', 'MOUNTING PLANE'] }),
  withComponent('prototype-board', { index: '18', category: 'STRUCTURE', title: 'PROTOTYPE\nBOARD', role: 'INTEGRATION PLATFORM', description: 'MB-102 solderless breadboard and custom FR-4 PCB serving as the physical prototyping and final integration base.', layers: ['POWER RAILS', 'BREADBOARD GRID', 'PROTO PCB', 'STANDOFF KIT'] }),
  { id: 'insulation', kind: 'component', index: '19', category: 'PROTECTION', title: 'HIGH-VOLTAGE\nINSULATION', role: 'PROTECTION LAYER', description: 'Dielectric encapsulation layer designed to prevent arc faults across high-potential traces.', layers: ['TOP DIELECTRIC', 'ISOLATION MATRIX', 'BOTTOM DIELECTRIC'] },
  { id: 'solder-protection', kind: 'component', index: '20', category: 'PROTECTION', title: 'SOLDER JOINT\nPROTECTION', role: 'MECHANICAL / ENVIRONMENTAL PROTECTION', description: 'Conformal coating and epoxy underfill for extreme vibration and moisture resistance.', layers: ['CONFORMAL COAT', 'EPOXY UNDERFILL', 'JOINT REINFORCEMENT'] },
  { id: 'radiation-shield', kind: 'component', index: '21', category: 'RESILIENCE', title: 'RADIATION\nPROTECTION', role: 'SYSTEM RESILIENCE', description: 'Physical shielding layers to protect sensitive silicon from ionizing radiation and single-event upsets.', layers: ['TUNGSTEN LAYER', 'ALUMINUM ABSORBER', 'KAPTON ISOLATOR'] },
  withComponent('lora', { index: '22', category: 'COMMUNICATION', title: 'LORA', role: 'LONG-RANGE COMMUNICATION', description: 'The low-power radio link to the remote system.', layers: ['RF SURFACE', 'RADIO BODY', 'CONNECTION INTERFACE'], effect: 'rf' }),
  withComponent('antenna', { index: '23', category: 'COMMUNICATION', title: 'ANTENNA', role: 'WIRELESS TRANSMISSION / RECEPTION', description: 'The physical RF interface for the radio path.', layers: ['ANTENNA ELEMENT', 'RF BODY', 'MOUNTING INTERFACE'], effect: 'rf' }),
];

``


