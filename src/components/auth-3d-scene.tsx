
'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const NUM_SHAPES = 20;

type ShapeData = {
    id: number;
    duration: number;
    delay: number;
    size: number;
    initialY: number;
    initialX: number;
    rotate: number;
    borderRadius: string;
}

const Shape = ({ data }: { data: ShapeData }) => {
    const { size, initialY, initialX, rotate, borderRadius, duration, delay } = data;

    return (
        <motion.div
            className="absolute bg-white/5"
            style={{
                width: size,
                height: size,
                top: `${initialY}vh`,
                left: `${initialX}vw`,
                rotate: `${rotate}deg`,
                borderRadius: borderRadius,
            }}
            animate={{
                y: ['0vh', '-120vh', '0vh'],
                x: ['0vw', '10vw', '-10vw', '0vw'],
                rotate: [rotate, rotate + 180, rotate + 360],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'linear',
            }}
        />
    )
}

export default function Auth3DScene() {
    const [shapes, setShapes] = useState<ShapeData[]>([]);

    useEffect(() => {
        const generateShapes = () => {
            return Array.from({ length: NUM_SHAPES }).map((_, i) => {
                const duration = 20 + Math.random() * 20;
                return {
                    id: i,
                    duration,
                    delay: Math.random() * -duration,
                    size: Math.floor(20 + Math.random() * 80),
                    initialY: Math.random() * 100,
                    initialX: Math.random() * 100,
                    rotate: Math.random() * 360,
                    borderRadius: Math.random() > 0.5 ? '50%' : '10%',
                }
            });
        };
        setShapes(generateShapes());
    }, []);


    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-indigo-900/50">
             <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10"
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            {shapes.map((shapeData) => (
                <Shape key={shapeData.id} data={shapeData} />
            ))}
        </div>
    )
}
