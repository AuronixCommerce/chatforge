
'use client'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'

function Stars(props: any) {
  const ref: any = useRef()
  const [sphere] = useState(() => {
    // Generate random points in a sphere
    const numPoints = 5000;
    const points = new Float32Array(numPoints * 3);
    for (let i = 0; i < numPoints; i++) {
        const r = 4.5 + Math.random() * 2; // radius
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        points[i * 3 + 2] = r * Math.cos(phi);
    }
    return points;
  });

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10
    ref.current.rotation.y -= delta / 15
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.pointer.x * 2, 0.05)
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, state.pointer.y * 2, 0.05)
  })
  
  return (
    <points ref={ref} {...props}>
        <bufferGeometry attach="geometry">
            <bufferAttribute
                attach="attributes-position"
                count={sphere.length / 3}
                array={sphere}
                itemSize={3}
            />
        </bufferGeometry>
        <pointsMaterial
            size={0.015}
            color="#ffa0e0"
            sizeAttenuation
            transparent={false}
            alphaTest={0.5}
            opacity={1.0}
        />
    </points>
  )
}

export default function Auth3DScene() {
    return (
        <Canvas camera={{ position: [0, 0, 10] }}>
            <Stars />
        </Canvas>
    )
}
