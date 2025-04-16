
import React from 'react';
import { Separator } from '@/components/ui/separator';
import MacroBarChart from './MacroBarChart';
import { LucideIcon } from 'lucide-react';

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
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 flex-none text-left">
        <div className="flex items-center">
          <span className="text-2xl font-bold">{label}</span>
          {icon}
        </div>
      </div>
      
      <div className="flex-1">
        {/* Horizontal goal line */}
        <div className="relative h-16 w-full">
          <div className="absolute top-[50%] w-full h-[1px] bg-gray-300"></div>
          
          {/* Bars container */}
          <div className="absolute bottom-0 w-full flex justify-between">
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
        
        {/* Bottom separator - only if not the last row */}
        {!isLastRow && <Separator className="mt-1" />}
      </div>
    </div>
  );
};

export default MacroRow;
