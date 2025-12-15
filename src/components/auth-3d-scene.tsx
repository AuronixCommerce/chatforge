
'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const NUM_SHAPES = 20;

const Shape = () => {
    const duration = 20 + Math.random() * 20;
    const delay = Math.random() * -duration;
    const size = Math.floor(20 + Math.random() * 80);
    const initialY = Math.random() * 100;
    const initialX = Math.random() * 100;
    const rotate = Math.random() * 360;

    return (
        <motion.div
            className="absolute bg-white/5"
            style={{
                width: size,
                height: size,
                top: `${initialY}vh`,
                left: `${initialX}vw`,
                rotate: `${rotate}deg`,
                borderRadius: Math.random() > 0.5 ? '50%' : '10%',
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
            {Array.from({ length: NUM_SHAPES }).map((_, i) => (
                <Shape key={i} />
            ))}
        </div>
    )
}
