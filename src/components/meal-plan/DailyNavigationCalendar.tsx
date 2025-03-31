
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DailyNavigationCalendarProps {
  mealPlan: any[];
  currentDay: number;
  setCurrentDay: (day: number) => void;
}

const DailyNavigationCalendar: React.FC<DailyNavigationCalendarProps> = ({
  mealPlan,
  currentDay,
  setCurrentDay
}) => {
  
  // Handle day navigation
  const navigateDay = (direction: 'prev' | 'next') => {
    let newDay = direction === 'prev' ? currentDay - 1 : currentDay + 1;
    
    // Ensure we stay within the bounds of our week
    if (newDay < 0) newDay = 0;
    if (newDay > 6) newDay = 6;
    
    setCurrentDay(newDay);
  };

  // Get day number for the calendar display
  const getDayNumber = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  // Get short day name from the date
  const getDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigateDay('prev')} 
        disabled={currentDay === 0}
        className="text-gray-500"
      >
        <ArrowLeft size={24} />
      </Button>
      
      <div className="flex space-x-2 overflow-x-auto">
        {mealPlan.map((day, idx) => {
          const dayNumber = getDayNumber(day.date);
          const dayName = getDayName(day.date);
          const isActive = idx === currentDay;
          
          return (
            <button 
              key={idx} 
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${
                isActive 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setCurrentDay(idx)}
            >
              <span className="text-xs uppercase font-medium">
                {dayName}
              </span>
              <span className="text-lg font-bold">{dayNumber}</span>
            </button>
          );
        })}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigateDay('next')}
        disabled={currentDay === 6}
        className="text-gray-500"
      >
        <ArrowRight size={24} />
      </Button>
    </div>
  );
};

export default DailyNavigationCalendar;
