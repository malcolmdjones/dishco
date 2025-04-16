
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
  // Calculate percentage based on goal value (max at 150%)
  const percentage = Math.min((value / goalValue) * 100, 150);
  
  return (
    <div className="flex-1 flex items-end justify-center h-full relative">
      {/* Goal line - black line at 100% goal */}
      <div className="absolute w-full h-[1px] bg-black bottom-[66.7%] left-0" />
      
      {/* Bar */}
      {value > 0 && (
        <div 
          className={`${color} rounded-t-full w-5 transition-all duration-300 ease-in-out relative`}
          style={{ 
            height: `${Math.max((percentage * 2/3), 4)}%`, 
            maxHeight: '100%'
          }}
        />
      )}
      {value === 0 && (
        <div className={`${color} w-5 h-1 rounded-full`} />
      )}
    </div>
  );
};

export default MacroBarChart;
