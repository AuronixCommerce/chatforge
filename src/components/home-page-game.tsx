
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface HomePageGameProps {
  children: (props: { isGameActive: boolean; startGame: () => void; isGameOver: boolean }) => React.ReactNode;
}

const GAME_DURATION = 20;

export default function HomePageGame({ children }: HomePageGameProps) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const router = useRouter();

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
    setIsGameActive(true);
    setTimeLeft(GAME_DURATION);
    document.body.style.cursor = 'text';
  };

  const progressWidth = (timeLeft / GAME_DURATION) * 100;

  return (
    <>
      {children({ isGameActive, startGame, isGameOver })}
      <AnimatePresence>
        {isGameActive && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[100] p-4 bg-background/80 backdrop-blur-sm"
            initial={{ y: '-100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm md:text-base font-semibold text-foreground">You have {timeLeft} seconds to edit any text on this page!</p>
                <div className="w-full bg-muted rounded-full h-2.5 mt-1 overflow-hidden">
                    <motion.div
                        className="bg-primary h-2.5 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${progressWidth}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    ></motion.div>
                </div>
              </div>
              <Button onClick={stopGame} variant="secondary" size="sm">Skip</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
