import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronDown, Cpu, Layers3 } from 'lucide-react';
import { scenes } from './data/scenes';
import ExplodedComponentSection from './components/ExplodedComponentSection';
import MasterDroneExploder from './components/MasterDroneExploder';
import './styles.css';

function App() {
  return (
    <main>
      <header>
        <a href="#top">PRANA</a>
        <span>ENGINEERING INSPECTION / 01</span>
        <span className="nominal">SYSTEM STATUS / NOMINAL</span>
      </header>
      
      {/* Jaw-dropping drone scroll animation at the very top */}
      <MasterDroneExploder />

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-copy">
          <p>COMPLETE HARDWARE ARCHITECTURE</p>
          <h1>ENGINEERED<br/>TO <em>SURVIVE.</em></h1>
          <span>A component-by-component engineering inspection of the complete hardware system.</span>
        </div>
        <div className="hero-object">
          <Layers3 size={62}/><i/><Cpu size={112}/><i/>
          <b>CONTROL · POWER · SENSORS<br/>THERMAL · DATA · PROTECTION</b>
        </div>
        <footer>SCROLL TO INSPECT <ChevronDown size={17}/></footer>
      </section>

      <nav aria-label="Component progression">
        <i/>
        {scenes.map(scene => (
          <a key={scene.index} href={`#scene-${scene.index}`}>{scene.index}</a>
        ))}
      </nav>

      {scenes.map(scene => (
        <div id={`scene-${scene.index}`} key={scene.index}>
          <ExplodedComponentSection scene={scene}/>
        </div>
      ))}

      <section className="complete">
        <p>20 / COMPLETE SYSTEM</p>
        <h2>ONE SYSTEM.<br/>MANY LAYERS<br/>OF PROTECTION.</h2>
        <div>
          {['CONTROL','POWER','SENSORS','THERMAL','COMMUNICATION','PROTECTION','DATA'].map(item => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
