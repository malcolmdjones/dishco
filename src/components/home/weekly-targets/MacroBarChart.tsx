
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
      className={`flex flex-col items-center justify-end relative flex-1 h-full ${dayIndex === todayIndex ? 'bg-[#F1F1F1]' : ''}`}
    >
      <div 
        className={`${color} w-10 rounded-full transition-all duration-300 ease-in-out`}
        style={{ 
          height: value > 0 ? `${Math.max(percentage, 5)}%` : '4px',
          maxHeight: '85%'
        }}
      />
    </div>
  );
};

export default MacroBarChart;
