
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays } from 'date-fns';
import { MealPlan } from '@/types/MealPlan';
import { getMealData } from '@/hooks/utils';

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
          <Link to="/planning">
            <Button variant="outline" size="sm" className="mt-3">Create a meal plan</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the start date of the active plan
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - activePlan.startDay);
  
  // Show max 5 days in the overview
  const daysToShow = Math.min(5, activePlan.plan.plan_data.days?.length || 0);

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
          const day = activePlan.plan.plan_data.days?.[index];
          if (!day) return null;
          
          const dayDate = addDays(startDate, index);
          const formattedDate = format(dayDate, 'EEE, MMM d');
          const isToday = format(dayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          const meals = day.meals;
          const totalCalories = [
            meals.breakfast, 
            meals.lunch, 
            meals.dinner, 
            ...(meals.snacks || [])
          ]
            .filter(Boolean)
            .reduce((sum, meal) => {
              const mealData = getMealData(meal);
              return sum + (mealData?.macros?.calories || 0);
            }, 0);

          return (
            <Card key={index} className={`${isToday ? 'border-green-300 bg-green-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-green-700' : ''}`}>
                      {formattedDate}
                    </span>
                    {isToday && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                    {totalCalories} cal
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {meals.breakfast && (
                    <div className="flex items-center">
                      <span className="bg-blue-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{getMealData(meals.breakfast)?.name || 'Breakfast'}</span>
                    </div>
                  )}
                  {meals.lunch && (
                    <div className="flex items-center">
                      <span className="bg-green-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{getMealData(meals.lunch)?.name || 'Lunch'}</span>
                    </div>
                  )}
                  {meals.dinner && (
                    <div className="flex items-center">
                      <span className="bg-purple-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{getMealData(meals.dinner)?.name || 'Dinner'}</span>
                    </div>
                  )}
                  {meals.snacks && meals.snacks.length > 0 && (
                    <div className="flex items-center">
                      <span className="bg-yellow-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{meals.snacks.length} snack(s)</span>
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
