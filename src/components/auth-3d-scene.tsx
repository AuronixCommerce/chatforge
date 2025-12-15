
'use client'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { useRef, useState } from 'react'

function Stars(props: any) {
  const ref: any = useRef()
  const [sphere] = useState(() => {
    // Generate random points in a sphere
    const numPoints = 5000;
    const points = new Float32Array(numPoints * 3);
    for (let i = 0; i < numPoints; i++) {
        const r = Math.random() * 2 + 0.5; // radius
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
  })
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffa0e0" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  )
}

export default function Auth3DScene() {
    return (
        <Canvas camera={{ position: [0, 0, 1] }}>
            <Stars />
        </Canvas>
    )
}
