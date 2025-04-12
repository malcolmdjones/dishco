import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, addDays, parseISO } from 'date-fns';
import { CalendarIcon, ChevronRight, AlertTriangle } from 'lucide-react';
import { MealPlan } from '@/hooks/useSavedMealPlans';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PlanStartDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  plan: MealPlan | null;
  activeDates: {[key: string]: string};
  onOverlap?: (date: Date) => void;
}

const PlanStartDateDialog: React.FC<PlanStartDateDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  plan,
  activeDates = {},
  onOverlap
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [hasOverlap, setHasOverlap] = useState<boolean>(false);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setCurrentMonth(new Date());
      checkForOverlap(new Date());
    }
  }, [isOpen, activeDates]);
  
  if (!plan) return null;
  
  const checkForOverlap = (date: Date): boolean => {
    if (!plan) return false;
    
    const planDuration = plan.plan_data?.days?.length || 7;
    let hasConflict = false;
    
    for (let i = 0; i < planDuration; i++) {
      const checkDate = addDays(date, i);
      const dateKey = format(checkDate, 'yyyy-MM-dd');
      
      if (activeDates[dateKey]) {
        hasConflict = true;
        break;
      }
    }
    
    setHasOverlap(hasConflict);
    return hasConflict;
  };
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    checkForOverlap(date);
  };
  
  const handleConfirm = () => {
    if (hasOverlap && onOverlap) {
      onOverlap(selectedDate);
    } else {
      onConfirm(selectedDate);
    }
  };
  
  const planDuration = plan.plan_data?.days?.length || 7;
  
  const generateCalendar = (month: Date) => {
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    let firstDayOfWeek = firstDayOfMonth.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysFromPreviousMonth = firstDayOfWeek;
    
    const totalDaysInGrid = 6 * 7;
    const daysFromNextMonth = totalDaysInGrid - daysFromPreviousMonth - lastDayOfMonth.getDate();
    
    const calendarDays: Date[] = [];
    
    const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const daysInPreviousMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
    
    for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
      calendarDays.push(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), i));
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      calendarDays.push(new Date(month.getFullYear(), month.getMonth(), i));
    }
    
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    for (let i = 1; i <= daysFromNextMonth; i++) {
      calendarDays.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i));
    }
    
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return weeks;
  };
  
  const weeks = generateCalendar(currentMonth);
  
  const isDateInPlanRange = (date: Date) => {
    if (!selectedDate) return false;
    
    const planEndDate = addDays(selectedDate, planDuration - 1);
    return date >= selectedDate && date <= planEndDate;
  };
  
  const hasActivePlan = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return !!activeDates[dateKey];
  };
  
  const getActivePlanName = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return activeDates[dateKey] || '';
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };
  
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
          
          {hasOverlap && (
            <Alert variant="destructive" className="mb-4 border-amber-600 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-600">Date Overlap Detected</AlertTitle>
              <AlertDescription className="text-amber-700 text-sm">
                Some dates in your selected range already have active meal plans.
                Activating this plan will replace existing plans on those dates.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={goToPreviousMonth}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 transform rotate-180" />
              </button>
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
                    const hasExistingPlan = hasActivePlan(day);
                    const activePlanName = getActivePlanName(day);
                    
                    return (
                      <div key={`day-${dayIndex}`} className="relative">
                        <button
                          className={`h-10 w-10 mx-auto flex items-center justify-center text-sm rounded-full relative
                            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                            ${isSelected ? 'bg-blue-500 text-white' : ''}
                            ${inPlanRange && !isSelected ? 'bg-blue-200' : ''}
                            ${hasExistingPlan && !isSelected && !inPlanRange ? 'bg-amber-100' : ''}
                            ${hasExistingPlan && inPlanRange && !isSelected ? 'bg-amber-200' : ''}
                            ${!isSelected && !inPlanRange ? 'hover:bg-gray-100' : ''}
                          `}
                          onClick={() => handleDateChange(day)}
                          disabled={!isCurrentMonth}
                        >
                          {formatDay(day)}
                        </button>
                        {hasExistingPlan && isCurrentMonth && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" 
                            title={`Active plan: ${activePlanName}`}
                          />
                        )}
                      </div>
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
            {hasOverlap ? "Continue with Overlaps" : "Confirm & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanStartDateDialog;
