
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { CalendarIcon, ChevronRight } from 'lucide-react';
import { MealPlan } from '@/hooks/useSavedMealPlans';

interface PlanStartDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  plan: MealPlan | null;
}

const PlanStartDateDialog: React.FC<PlanStartDateDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  plan
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Reset selected date when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setCurrentMonth(new Date());
    }
  }, [isOpen]);
  
  if (!plan) return null;
  
  const handleConfirm = () => {
    onConfirm(selectedDate);
  };
  
  // Get plan duration (number of days)
  const planDuration = plan.plan_data?.days?.length || 7;
  
  // Generate calendar data
  const generateCalendar = (month: Date) => {
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Adjust to make Monday the first day (0 = Monday, ... 6 = Sunday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Calculate days from previous month to display
    const daysFromPreviousMonth = firstDayOfWeek;
    
    // Calculate days from next month to display (to complete the grid)
    const totalDaysInGrid = 6 * 7; // 6 rows of 7 days
    const daysFromNextMonth = totalDaysInGrid - daysFromPreviousMonth - lastDayOfMonth.getDate();
    
    // Generate array of dates
    const calendarDays: Date[] = [];
    
    // Add days from previous month
    const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const daysInPreviousMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
    
    for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
      calendarDays.push(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), i));
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      calendarDays.push(new Date(month.getFullYear(), month.getMonth(), i));
    }
    
    // Add days from next month
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    for (let i = 1; i <= daysFromNextMonth; i++) {
      calendarDays.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i));
    }
    
    // Group the dates into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return weeks;
  };
  
  const weeks = generateCalendar(currentMonth);
  
  // Function to check if a date is in the plan range
  const isDateInPlanRange = (date: Date) => {
    if (!selectedDate) return false;
    
    const planEndDate = addDays(selectedDate, planDuration - 1);
    return date >= selectedDate && date <= planEndDate;
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Format day for display
  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };
  
  // Check if date is the same month as current view
  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>When should this plan start?</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="flex items-center mb-4">
            <CalendarIcon className="mr-2 text-green-500" />
            <span>Plan: <strong>{plan.name}</strong></span>
            <span className="ml-2 text-sm text-muted-foreground">({planDuration} days)</span>
          </div>
          
          <div className="w-full max-w-xs">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button 
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Calendar Days */}
            <div className="mb-2">
              <div className="grid grid-cols-7 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {weeks.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-cols-7">
                  {week.map((day, dayIndex) => {
                    const isSelected = day.toDateString() === selectedDate?.toDateString();
                    const inPlanRange = isDateInPlanRange(day);
                    const isCurrentMonth = isSameMonth(day);
                    
                    return (
                      <button
                        key={`day-${dayIndex}`}
                        className={`h-10 w-10 mx-auto flex items-center justify-center text-sm rounded-full relative
                          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                          ${isSelected ? 'bg-blue-500 text-white' : ''}
                          ${inPlanRange && !isSelected ? 'bg-blue-200' : ''}
                          ${!isSelected && !inPlanRange ? 'hover:bg-gray-100' : ''}
                        `}
                        onClick={() => setSelectedDate(day)}
                        disabled={!isCurrentMonth}
                      >
                        {formatDay(day)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Starting date: <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
          </p>
          
          {planDuration > 1 && (
            <p className="text-center text-sm text-green-600">
              Will run until: <strong>{format(addDays(selectedDate, planDuration - 1), 'MMMM d, yyyy')}</strong>
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanStartDateDialog;
