
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

  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigateDay('prev')} 
        disabled={currentDay === 0}
      >
        <ArrowLeft size={18} />
      </Button>
      
      <div className="flex space-x-2 overflow-x-auto">
        {mealPlan.map((day, idx) => (
          <button 
            key={idx} 
            className={`flex flex-col items-center justify-center size-10 rounded-full ${
              idx === currentDay 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setCurrentDay(idx)}
          >
            <span className="text-xs uppercase">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
            </span>
            <span className="text-sm font-medium">{getDayNumber(day.date)}</span>
          </button>
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigateDay('next')}
        disabled={currentDay === 6}
      >
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};

export default DailyNavigationCalendar;
