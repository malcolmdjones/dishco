import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, BarChart2, PieChart } from 'lucide-react';
import { useStreakData } from '@/hooks/useStreakData';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCaloricBalance } from '@/hooks/useCaloricBalance';
import { format } from 'date-fns';

const TopNavigation = () => {
  const { streak, todayLogged } = useStreakData();
  const today = new Date();
  const { averageCalories } = useCaloricBalance(today);

  return (
    <div className="bg-white shadow-sm mb-4">
      <div className="max-w-md mx-auto flex justify-between items-center py-2 px-4">
        <div className="text-xl font-bold">dishco</div>
        
        <div className="flex items-center space-x-4">
          {/* Streak Counter */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/nutrition-goals" className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center"
                  >
                    <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="ml-1 font-medium">{streak}</span>
                  </motion.div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{streak} day streak{streak !== 1 ? 's' : ''}</p>
                <p className="text-xs">{todayLogged ? 'Today logged' : 'Log today to continue your streak'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Progress Overview */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/progress" className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  <BarChart2 className="h-5 w-5 text-red-400" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Progress overview</p>
                <p className="text-xs">View your nutrition progress</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Daily Calories */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/nutrition" className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  <PieChart className="h-5 w-5 text-blue-400" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Average daily calories</p>
                <p className="text-xs">{Math.round(averageCalories)} cal/day</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
