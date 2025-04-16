
import React from 'react';

interface DayLabelsProps {
  todayIndex: number;
}

const DayLabels: React.FC<DayLabelsProps> = ({ todayIndex }) => {
  // Day labels (Monday to Sunday)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="flex justify-between w-full">
      {dayLabels.map((day, index) => (
        <div 
          key={`day-label-${index}`}
          className={`text-sm flex-1 text-center ${index === todayIndex ? 'text-gray-600 font-medium' : 'text-gray-400'}`}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayLabels;
