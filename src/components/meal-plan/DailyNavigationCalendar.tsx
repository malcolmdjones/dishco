
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
    if (newDay > (mealPlan.length - 1)) newDay = mealPlan.length - 1;
    
    setCurrentDay(newDay);
  };

  // Get day number for the calendar display
  const getDayNumber = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  // Get day of week
  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigateDay('prev')} 
        disabled={currentDay === 0}
        className="text-gray-400"
      >
        <ArrowLeft size={24} />
      </Button>
      
      <div className={`grid grid-cols-${mealPlan.length} gap-1 flex-1 justify-center`}>
        {mealPlan.map((day, idx) => {
          const isCurrentDay = idx === currentDay;
          const dayNumber = getDayNumber(day.date);
          const dayOfWeek = getDayOfWeek(day.date);
          const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
          
          return (
            <button 
              key={idx} 
              className={`flex flex-col items-center justify-center ${isWeekend ? 'text-gray-400' : ''}`}
              onClick={() => setCurrentDay(idx)}
            >
              <span className="text-xs uppercase mb-1">
                {dayOfWeek}
              </span>
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCurrentDay 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700'
                }`}
              >
                <span className={`text-lg ${isCurrentDay ? 'font-medium' : ''}`}>{dayNumber}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigateDay('next')}
        disabled={currentDay === mealPlan.length - 1}
        className="text-gray-400"
      >
        <ArrowRight size={24} />
      </Button>
    </div>
  );
};

export default DailyNavigationCalendar;
