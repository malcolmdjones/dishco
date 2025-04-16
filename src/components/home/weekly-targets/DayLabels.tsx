
import React from 'react';

interface DayLabelsProps {
  todayIndex: number;
}

const DayLabels: React.FC<DayLabelsProps> = ({ todayIndex }) => {
  // Day labels (Monday to Sunday)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="flex justify-between px-24">
      {dayLabels.map((day, index) => (
        <div 
          key={`day-label-${index}`}
          className={`text-sm ${index === todayIndex ? 'text-gray-600 font-medium' : 'text-gray-400'}`}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DayLabels;
