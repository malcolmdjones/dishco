
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
    <div className="flex items-center gap-4 mb-2">
      <div className="w-24 flex-none text-left">
        <div className="flex items-center">
          <span className="text-3xl font-bold">{label}</span>
          {icon}
        </div>
      </div>
      
      <div className="flex-1">
        {/* Separator above the charts */}
        <Separator className="mb-4" />
        
        {/* Horizontal goal line */}
        <div className="relative h-16 w-full mb-2">
          {/* Bars container */}
          <div className="absolute bottom-0 w-full h-full flex">
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
      </div>
    </div>
  );
};

export default MacroRow;
