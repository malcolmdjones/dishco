
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
  // Calculate percentage based on goal value (max at 100%)
  const percentage = Math.min((value / goalValue) * 100, 100);
  
  return (
    <div 
      className={`flex flex-col items-center relative ${dayIndex === todayIndex ? 'bg-[#F1F1F1]' : ''}`}
      style={{ width: '14%', height: '100%' }}
    >
      <div 
        className={`${color} w-4 rounded-t-md mt-auto transition-all duration-300 ease-in-out`}
        style={{ 
          height: value > 0 ? `${Math.max(percentage, 5)}%` : '4px' 
        }}
      />
    </div>
  );
};

export default MacroBarChart;
