
import React from 'react';
import MacroBarChart from './MacroBarChart';

interface MacroRowProps {
  label: string;
  icon?: React.ReactNode;
  values: number[];
  goalValue: number;
  color: string;
  todayIndex: number;
  isLastRow?: boolean;
}

const MacroRow: React.FC<MacroRowProps> = ({ 
  label, 
  icon, 
  values, 
  goalValue, 
  color,
  todayIndex,
  isLastRow = false
}) => {
  // Calculate if any day has exceeded the goal
  const hasExceededGoal = values.some(value => value > goalValue);
  
  return (
    <div className="flex flex-col mb-4">
      {/* Label */}
      <div className="flex items-center mb-1">
        <span className="text-xl font-bold text-gray-900">{label}</span>
        {icon && <span className="ml-2">{icon}</span>}
      </div>
      
      {/* Chart container */}
      <div className="relative h-12 w-full">
        {/* Bars container */}
        <div className="absolute bottom-0 w-full h-full flex z-10">
          {values.map((value, index) => (
            <MacroBarChart 
              key={`${label}-${index}`}
              value={value}
              goalValue={goalValue}
              color={color}
              dayIndex={index}
              todayIndex={todayIndex}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom separator line */}
      <div className="w-full border-t border-gray-200 mt-1"></div>
    </div>
  );
};

export default MacroRow;
