
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isToday, parseISO } from 'date-fns';
import { ActiveMealPlan } from '@/hooks/useSavedMealPlans';

interface WeeklyOverviewProps {
  activePlans: ActiveMealPlan[] | null;
  getMealsForDate: (dateString: string) => any;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ activePlans, getMealsForDate }) => {
  // Create a 7-day window starting from today
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  
  // No active plan
  if (!activePlans || activePlans.length === 0) {
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

  // Load meals for each of the next 7 days
  const daysToShow = next7Days.map(date => {
    // Format date to yyyy-MM-dd for consistent lookup
    const formattedDate = format(date, 'yyyy-MM-dd');
    const planMeals = getMealsForDate(formattedDate);
    
    return {
      date,
      formattedDate,
      planData: planMeals ? { meals: planMeals } : null
    };
  });

  // Find which plan is active for a specific date
  const getActivePlanForDate = (date: Date): ActiveMealPlan | null => {
    if (!activePlans) return null;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    for (const plan of activePlans) {
      const startDate = parseISO(plan.startDate);
      const endDate = parseISO(plan.endDate);
      
      // Use normalized date comparison for accuracy
      if (date >= startDate && date <= endDate) {
        return plan;
      }
    }
    
    return null;
  };

  // Helper function to safely extract meal name
  const getMealName = (meal: any): string | null => {
    if (!meal) return null;
    
    if (Array.isArray(meal) && meal.length > 0) {
      return meal[0]?.name || null;
    }
    
    return meal.name || null;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Weekly Overview</h2>
          {activePlans && activePlans.length > 0 && (
            <p className="text-xs text-green-600 font-medium">Active Plans: {activePlans.length}</p>
          )}
        </div>
        <Link to="/saved-plans">
          <Button variant="ghost" size="sm" className="text-xs">View Saved Plans</Button>
        </Link>
      </div>
      
      <div className="space-y-2 mt-4">
        {daysToShow.map((dayInfo, index) => {
          const formattedDate = format(dayInfo.date, 'EEE, MMM d');
          const isTodayDate = isToday(dayInfo.date);
          const activePlan = getActivePlanForDate(dayInfo.date);
          
          if (!dayInfo.planData) {
            // Show empty day card if no plan data for this day
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
                    {activePlan && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {activePlan.plan.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">No meals planned</p>
                    <Link to="/saved-plans">
                      <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto">
                        <CalendarPlus className="h-3 w-3 mr-1" />
                        Add a meal plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          // Safely access meals with null checks
          const meals = dayInfo.planData.meals || { breakfast: null, lunch: null, dinner: null, snacks: [] };
          
          // Get actual recipe names with improved safety checks
          const breakfastName = getMealName(meals.breakfast);
          const lunchName = getMealName(meals.lunch);
          const dinnerName = getMealName(meals.dinner);
          const snacks = Array.isArray(meals.snacks) ? meals.snacks : [];
          const snacksCount = snacks.length;

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
                  {activePlan && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {activePlan.plan.name}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {breakfastName && (
                    <div className="flex items-center">
                      <span className="bg-blue-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{breakfastName}</span>
                    </div>
                  )}
                  
                  {lunchName && (
                    <div className="flex items-center">
                      <span className="bg-green-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{lunchName}</span>
                    </div>
                  )}
                  
                  {dinnerName && (
                    <div className="flex items-center">
                      <span className="bg-purple-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">{dinnerName}</span>
                    </div>
                  )}
                  
                  {snacksCount > 0 && (
                    <div className="flex items-center">
                      <span className="bg-yellow-100 w-2 h-2 rounded-full mr-1"></span>
                      <span className="truncate">
                        {snacksCount === 1 && snacks[0]?.name 
                          ? snacks[0].name 
                          : `${snacksCount} snack(s)`}
                      </span>
                    </div>
                  )}

                  {!breakfastName && !lunchName && !dinnerName && snacksCount === 0 && (
                    <p className="text-gray-400 col-span-2">No meals planned</p>
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
