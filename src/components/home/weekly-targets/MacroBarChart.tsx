
import React from 'react';

interface MacroBarChartProps {
  value: number;
  goalValue: number;
  color: string;
  dayIndex: number;
  todayIndex: number;
}

const MacroBarChart: React.FC<MacroBarChartProps> = ({ 
  value, 
  goalValue, 
  color, 
  dayIndex, 
  todayIndex 
}) => {
  // Calculate percentage based on goal value (max at 150% to show exceeded goals)
  const percentage = Math.min((value / goalValue) * 100, 150);
  
  // Determine if the value exceeds the goal
  const exceedsGoal = value > goalValue;
  
  return (
    <div className="flex-1 flex items-end justify-center h-full">
      {value > 0 && (
        <div 
          className={`${color} rounded-t-full w-8 transition-all duration-300 ease-in-out relative`}
          style={{ 
            height: `${Math.max(percentage, 4)}%`, 
            maxHeight: '100%'
          }}
        >
          {/* Add indicator when exceeding goal */}
          {exceedsGoal && (
            <div className="absolute -top-1 left-0 right-0 h-1 bg-red-400 rounded-full" />
          )}
        </div>
      )}
      {value === 0 && (
        <div className={`${color} w-8 h-1 rounded-full`} />
      )}
    </div>
  );
};

export default MacroBarChart;
