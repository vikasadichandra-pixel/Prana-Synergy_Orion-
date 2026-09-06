import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './Preloader.css';

// ──────────────────────────────────────────────────────────────────────────────
// SPRING PHYSICS COUNTER
// ──────────────────────────────────────────────────────────────────────────────
const useSpringCounter = (target, { stiffness = 180, damping = 18, mass = 1 } = {}) => {
    const [value, setValue] = useState(0);
    const velocityRef = useRef(0);
    const valueRef = useRef(0);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(performance.now());

    useEffect(() => {
        const tick = (now) => {
            const dt = Math.min((now - lastTimeRef.current) / 1000, 1 / 30);
            lastTimeRef.current = now;

            const dx = target - valueRef.current;
            const force = stiffness * dx;
            const acc = (force - damping * velocityRef.current) / mass;
            const newVelocity = velocityRef.current + acc * dt;
            const newValue = valueRef.current + newVelocity * dt;

            velocityRef.current = newVelocity;
            valueRef.current = newValue;
            setValue(newValue);

            if (Math.abs(dx) > 0.05 || Math.abs(newVelocity) > 0.05) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setValue(target);
                valueRef.current = target;
                velocityRef.current = 0;
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, stiffness, damping, mass]);

    return value;
};

// ──────────────────────────────────────────────────────────────────────────────
// WEBGL 3D PARTICLE FIELD (The "Premium" Background)
// ──────────────────────────────────────────────────────────────────────────────
const ParticleField = ({ phase }) => {
    const ref = useRef();
    
    // Generate a massive, cinematic point cloud once
    const [positions, colors] = useMemo(() => {
        const count = 4000;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const color1 = new THREE.Color('#c9e87b'); // Lime
        const color2 = new THREE.Color('#58d3ff'); // Cyan

        for (let i = 0; i < count; i++) {
            // Distribute in a spherical volume
            const r = 25 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            // Interpolate colors based on y-position (creating neon bands)
            const mixRatio = Math.sin(pos[i * 3 + 1] * 0.5) * 0.5 + 0.5;
            const mixedColor = color1.clone().lerp(color2, mixRatio);
            
            col[i * 3] = mixedColor.r;
            col[i * 3 + 1] = mixedColor.g;
            col[i * 3 + 2] = mixedColor.b;
        }
        return [pos, col];
    }, []);

    useFrame((state, delta) => {
        if (!ref.current) return;

        // Cinematic idle rotation
        ref.current.rotation.y += delta * 0.15;
        ref.current.rotation.x += delta * 0.05;

        // Hyperspace zoom trigger
        if (phase === 'revealing') {
            ref.current.position.z += delta * 60; // Huge acceleration forward
            ref.current.rotation.y += delta * 1.5;
            
            // Fade out particles natively via WebGL
            if (ref.current.material.opacity > 0) {
                ref.current.material.opacity -= delta * 1.2;
            }
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute 
                    attach="attributes-position" 
                    count={positions.length / 3} 
                    array={positions} 
                    itemSize={3} 
                />
                <bufferAttribute 
                    attach="attributes-color" 
                    count={colors.length / 3} 
                    array={colors} 
                    itemSize={3} 
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.06} 
                vertexColors 
                transparent 
                opacity={0.8} 
                sizeAttenuation={true} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
            />
        </points>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// PRELOADER COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export default function Preloader({ onComplete }) {
    const [phase, setPhase] = useState('counting'); // 'counting' | 'revealing' | 'done'
    const [progress, setProgress] = useState(0);

    // Spring physics drive the displayed counter to chase the raw progress
    const displayProgress = useSpringCounter(progress, { stiffness: 220, damping: 20 });

    useEffect(() => {
        const duration = 2800; // Total cinematic duration in ms
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // Ease-out-expo for aggressive sprint then buttery deceleration
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            setProgress(eased * 100);

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                setPhase('revealing');
            }
        };
        requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (phase !== 'revealing') return;

        // Matches the CSS cubic-bezier duration (1.4s)
        const timer = setTimeout(() => {
            setPhase('done');
            onComplete?.();
        }, 1400); 

        return () => clearTimeout(timer);
    }, [phase, onComplete]);

    // Lock body scroll during load
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = phase !== 'done' ? 'hidden' : originalStyle;
        return () => { document.body.style.overflow = originalStyle; };
    }, [phase]);

    if (phase === 'done') return null;

    // Pad with leading zeros (000 → 100)
    const formatted = Math.floor(displayProgress).toString().padStart(3, '0');

    return (
        <div className={`preloader ${phase === 'revealing' ? 'preloader--revealing' : ''}`} role="status" aria-label="Loading PRĀŅA">
            
            {/* SOLID SPLIT CURTAINS (Sit behind Canvas) */}
            <div className="preloader__curtains" aria-hidden="true">
                <div className="preloader__curtain preloader__curtain--top" />
                <div className="preloader__curtain preloader__curtain--bottom" />
            </div>

            {/* 3D WEBGL BACKGROUND */}
            <div className="preloader__canvas">
                <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                    <ambientLight intensity={0.5} />
                    <ParticleField phase={phase} />
                </Canvas>
            </div>

            {/* UI LAYER */}
            <div className="preloader__ui" aria-hidden="true">
                <div className="preloader__content">
                    <div className="preloader__telemetry">
                        <span className="preloader__badge">PRĀŅA SYSTEMS</span>
                        <span className="preloader__sep">◆</span>
                        <span className="preloader__badge">WEBGL DIAGNOSTICS</span>
                    </div>

                    <div className="preloader__text-loader">
                        {/* The Base: Glowing Light */}
                        <div className="preloader__text-base">PRĀŅA</div>
                        {/* The Fill: Dark Stealth mode wiping left to right */}
                        <div 
                            className="preloader__text-fill" 
                            style={{ clipPath: `inset(0 ${100 - displayProgress}% 0 0)` }}
                        >
                            PRĀŅA
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
