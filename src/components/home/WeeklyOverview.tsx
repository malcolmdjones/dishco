
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isToday, parseISO } from 'date-fns';
import { MealPlan } from '@/hooks/useSavedMealPlans';

interface WeeklyOverviewProps {
  activePlan: {plan: MealPlan, startDay: number} | null;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ activePlan }) => {
  // No active plan
  if (!activePlan) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Weekly Overview</h2>
          <Link to="/saved-plans">
            <Button variant="ghost" size="sm" className="text-xs">View Saved Plans</Button>
          </Link>
        </div>
        <p className="text-sm text-dishco-text-light">
          Activate a meal plan to see your meals for the week.
        </p>
        <div className="mt-4 text-center">
          <Calendar size={48} className="mx-auto text-gray-300" />
          <p className="text-gray-400 mt-2">No active meal plan</p>
          <Link to="/saved-plans">
            <Button variant="outline" size="sm" className="mt-3">Add a saved meal plan</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the start date for the active plan
  const today = new Date();
  const startDate = new Date();
  
  // Apply the startDay offset to the start date
  if (activePlan.startDay > 0) {
    startDate.setDate(startDate.getDate() - activePlan.startDay);
  } else if (activePlan.startDay < 0) {
    startDate.setDate(startDate.getDate() + Math.abs(activePlan.startDay));
  }
  
  console.log('Weekly overview - Start date:', format(startDate, 'yyyy-MM-dd'));
  console.log('Weekly overview - Active plan days:', activePlan.plan.plan_data.days.length);
  
  // Show max 5 days in the overview
  const daysToShow = Math.min(5, activePlan.plan.plan_data.days.length);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Weekly Overview</h2>
          <p className="text-xs text-green-600 font-medium">Active Plan: {activePlan.plan.name}</p>
        </div>
        <Link to="/saved-plans">
          <Button variant="ghost" size="sm" className="text-xs">View Saved Plans</Button>
        </Link>
      </div>
      
      <div className="space-y-2 mt-4">
        {Array.from({ length: daysToShow }).map((_, index) => {
          if (index >= activePlan.plan.plan_data.days.length) return null;
          
          const day = activePlan.plan.plan_data.days[index];
          const dayDate = addDays(startDate, index);
          const formattedDate = format(dayDate, 'EEE, MMM d');
          const isTodayDate = isToday(dayDate);
          
          // Safely access meals with null checks
          const meals = day.meals || { breakfast: null, lunch: null, dinner: null, snacks: [] };
          
          // Get actual recipe names
          const breakfastName = meals.breakfast?.name;
          const lunchName = meals.lunch?.name;
          const dinnerName = meals.dinner?.name;
          const snacksCount = Array.isArray(meals.snacks) ? meals.snacks.length : 0;

          return (
            <Card key={index} className={`${isTodayDate ? 'border-green-300 bg-green-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isTodayDate ? 'text-green-700' : ''}`}>
                      {formattedDate}
                    </span>
                    {isTodayDate && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {breakfastName ? (
                    <div className="flex items-center">
                      <span className="bg-blue-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{breakfastName}</span>
                    </div>
                  ) : null}
                  
                  {lunchName ? (
                    <div className="flex items-center">
                      <span className="bg-green-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{lunchName}</span>
                    </div>
                  ) : null}
                  
                  {dinnerName ? (
                    <div className="flex items-center">
                      <span className="bg-purple-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{dinnerName}</span>
                    </div>
                  ) : null}
                  
                  {snacksCount > 0 && (
                    <div className="flex items-center">
                      <span className="bg-yellow-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">
                        {snacksCount === 1 
                          ? meals.snacks[0].name 
                          : `${snacksCount} snack(s)`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Link to="/planning" className="flex items-center justify-center text-blue-600 text-sm mt-4">
        View full meal plan <ChevronRight size={16} />
      </Link>
    </div>
  );
};

export default WeeklyOverview;
