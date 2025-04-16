
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
    <div className="flex-1 flex items-end justify-center h-full relative">
      {/* Goal line now at exactly 66.7% */}
      <div className="absolute w-full h-[1px] bg-gray-200 bottom-[66.7%] left-0" />
      
      {/* Bar */}
      {value > 0 && (
        <div 
          className={`${color} rounded-t-full w-5 transition-all duration-300 ease-in-out relative`}
          style={{ 
            height: `${Math.max((percentage * 2/3), 4)}%`, 
            maxHeight: '100%'
          }}
        >
          {/* Show goal indicator when exceeding goal */}
          {exceedsGoal && (
            <div className="absolute top-[66.7%] left-0 right-0 h-0.5 bg-gray-500 z-10" />
          )}
        </div>
      )}
      {value === 0 && (
        <div className={`${color} w-5 h-1 rounded-full`} />
      )}
    </div>
  );
};

export default MacroBarChart;
