
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar, Trophy, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

interface StreakCounterProps {
  streak: number;
  todayLogged: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak, todayLogged }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when streak changes or today is logged
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [streak, todayLogged]);

  const flameVariants = {
    idle: { scale: 1 },
    animate: { 
      scale: [1, 1.2, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5, repeat: 1 }
    }
  };

  const numberVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    exit: { opacity: 0, y: 20 }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (streak >= 7) return <Flame className="h-5 w-5 text-red-500" />;
    return <Calendar className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <motion.div
            variants={flameVariants}
            animate={isAnimating ? "animate" : "idle"}
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            {getStreakEmoji(streak)}
          </motion.div>
          <div>
            <div className="text-sm font-medium opacity-90">Logging streak</div>
            <div className="flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={streak}
                  variants={numberVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-2xl font-bold"
                >
                  {streak}
                </motion.div>
              </AnimatePresence>
              <span className="ml-1 text-sm opacity-80">days</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium opacity-90">Today</div>
          {todayLogged ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center text-green-300"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">Logged</span>
            </motion.div>
          ) : (
            <span className="text-sm opacity-80">Not logged yet</span>
          )}
        </div>
      </div>

      {streak >= 3 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/10 px-4 py-2 text-xs font-medium"
        >
          {streak >= 7 ? (
            <>🔥 On fire! Keep that streak going!</>
          ) : (
            <>✨ Nice work! Your {streak} day streak is building healthy habits.</>
          )}
        </motion.div>
      )}
    </Card>
  );
};

export default StreakCounter;
