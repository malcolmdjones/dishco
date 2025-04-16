
import React from 'react';

interface DayLabelsProps {
  todayIndex: number;
}

const DayLabels: React.FC<DayLabelsProps> = ({ todayIndex }) => {
  // Day labels (Monday to Sunday)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="flex w-full mt-4">
      {dayLabels.map((day, index) => (
        <div 
          key={`day-label-${index}`}
          className={`flex-1 text-center text-sm ${index === todayIndex ? 'text-gray-800 font-bold' : 'text-gray-400'}`}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayLabels;
