
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, MousePointer2 } from 'lucide-react';

interface HomePageGameProps {
  children: (props: { isGameActive: boolean; startGame: () => void; isGameOver: boolean; startButtonRef: React.RefObject<HTMLButtonElement> }) => React.ReactNode;
}

const GAME_DURATION = 20;

export default function HomePageGame({ children }: HomePageGameProps) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFlyingArrow, setShowFlyingArrow] = useState(false);
  const [arrowPos, setArrowPos] = useState({ x: 0, y: 0 });
  
  const router = useRouter();
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const stopGame = useCallback(() => {
    setIsGameActive(false);
    setIsGameOver(true);
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isGameActive && timeLeft === 0) {
      stopGame();
      router.push('/auth');
    }
    return () => clearTimeout(timer);
  }, [isGameActive, timeLeft, stopGame, router]);

  const startGame = () => {
    if (isGameActive || isGameOver) return;
    
    if (startButtonRef.current) {
        const rect = startButtonRef.current.getBoundingClientRect();
        setArrowPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    setShowFlyingArrow(true);
    
    // Transition from arrow animation to actual game state
    setTimeout(() => {
        setIsGameActive(true);
        setTimeLeft(GAME_DURATION);
        document.body.style.cursor = 'text';
        setShowFlyingArrow(false);
    }, 1000);
  };

  const progressWidth = (timeLeft / GAME_DURATION) * 100;

  return (
    <>
      {children({ isGameActive, startGame, isGameOver, startButtonRef })}
      
      <AnimatePresence>
        {showFlyingArrow && (
            <motion.div
                className="fixed z-[110] text-primary pointer-events-none"
                initial={{ x: arrowPos.x, y: arrowPos.y, scale: 1, rotate: 0 }}
                animate={{ 
                    x: [arrowPos.x, arrowPos.x - 50, 100], 
                    y: [arrowPos.y, arrowPos.y - 200, 100],
                    scale: [1, 2, 0.8],
                    rotate: [0, -45, -90]
                }}
                transition={{ duration: 1, ease: "circOut" }}
            >
                <div className="relative">
                    <ArrowRight className="w-10 h-10" />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-4 -right-4 text-accent"
                    >
                        <MousePointer2 className="w-6 h-6 fill-current" />
                    </motion.div>
                </div>
            </motion.div>
        )}

        {isGameActive && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[100] p-4 bg-background/90 backdrop-blur-md border-b shadow-2xl"
            initial={{ y: '-100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <motion.div 
                        animate={{ opacity: [1, 0, 1] }} 
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_red]" 
                    />
                    <p className="text-sm md:text-base font-bold text-foreground">
                        Game Active: You have {timeLeft} seconds to edit every text on this page!
                    </p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden border">
                    <motion.div
                        className="bg-primary h-full rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${progressWidth}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    ></motion.div>
                </div>
              </div>
              <Button onClick={stopGame} variant="secondary" size="sm">Skip Game</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
