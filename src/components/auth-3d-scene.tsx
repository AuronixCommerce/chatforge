
'use client';

import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Trail, Float, Line, Sphere, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Rig({ v = new THREE.Vector3() }) {
  return useFrame((state) => {
    state.camera.position.lerp(v.set(state.mouse.x / 2, state.mouse.y / 2, 10), 0.05);
  });
}

function Atom(props: any) {
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), []);
  return (
    <group {...props}>
      <Line worldUnits points={points} color="hsl(var(--primary))" lineWidth={0.1} />
      <Line worldUnits points={points} color="hsl(var(--primary))" lineWidth={0.1} rotation={[0, 0, 1]} />
      <Line worldUnits points={points} color="hsl(var(--primary))" lineWidth={0.1} rotation={[0, 0, -1]} />
      <Sphere args={[0.55, 64, 64]}>
        <meshBasicMaterial color="hsl(var(--primary))" toneMapped={false} />
      </Sphere>
    </group>
  );
}

function Bg() {
    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                 <Atom position={[-4, -2, -10]} scale={2}/>
                 <Atom position={[4, 2, -12]} scale={2} />
            </Float>
        </group>
    )
}

function MainSphere() {
  const ref = useRef<any>();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = 2 - Math.sin(clock.getElapsedTime() * 0.2) * 5;
      ref.current.position.y = -2 + Math.cos(clock.getElapsedTime() * 0.3) * 4;
      ref.current.position.z = -10 + Math.sin(clock.getElapsedTime() * 0.1) * 3;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]}>
        <meshBasicMaterial color="hsl(var(--accent))" toneMapped={false}/>
        <Trail width={2} color={"hsl(var(--accent))"} length={4} decay={1} />
    </Sphere>
  );
}

export default function Auth3DScene() {
    return (
        <Canvas
            camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
            className="absolute inset-0 z-0"
        >
            <ambientLight intensity={0.5} />
            <Bg />
            <MainSphere />
            <Rig />
            <EffectComposer>
                <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
            </EffectComposer>
        </Canvas>
    )
}
