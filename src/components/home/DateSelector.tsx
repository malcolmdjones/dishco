
import React from 'react';
import { format, isToday, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ 
  selectedDate, 
  goToPreviousDay, 
  goToNextDay, 
  goToToday 
}) => {
  const isSelectedDateToday = isToday(selectedDate);

  return (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <button onClick={goToPreviousDay} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={18} />
        </button>
        
        <div className="text-center">
          <button 
            onClick={goToToday}
            className={`text-lg font-medium ${isSelectedDateToday ? 'text-green-500' : ''}`}
          >
            {format(selectedDate, 'EEEE, MMMM d')}
            {!isSelectedDateToday && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                Tap to return to today
              </span>
            )}
          </button>
          <p className="text-xs text-dishco-text-light">
            {isSelectedDateToday ? 'Today' : 
              format(selectedDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd') ? 'Tomorrow' : 
              format(selectedDate, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'Yesterday' : 
              format(selectedDate, 'MMM d, yyyy')}
          </p>
        </div>
        
        <button onClick={goToNextDay} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DateSelector;
