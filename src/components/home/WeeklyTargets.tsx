
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyNutrition } from '@/hooks/useWeeklyNutrition';

interface WeeklyTargetsProps {
  selectedDate: Date;
}

const WeeklyTargets: React.FC<WeeklyTargetsProps> = ({ selectedDate }) => {
  const { weeklyNutrition, userGoals } = useWeeklyNutrition(selectedDate);
  
  // Day labels at the bottom
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Color classes for different macros
  const macroColors = {
    calories: 'bg-blue-400',
    protein: 'bg-orange-400',
    fat: 'bg-yellow-400',
    carbs: 'bg-green-400'
  };
  
  // Helper to get bar height as percentage
  const getBarHeight = (value: number, target: number): number => {
    if (target === 0) return 0;
    const percentage = Math.min((value / target) * 100, 100);
    return Math.max(percentage, 4); // At least 4% to be visible
  };
  
  // Helper to get bar color based on value vs target
  const getBarColor = (value: number, target: number, baseColor: string): string => {
    if (value >= target * 0.9 && value <= target * 1.1) {
      // Within 10% of target - perfect
      return baseColor;
    } else if (value > target * 1.1) {
      // Over target by more than 10%
      return 'bg-red-400';
    } else {
      // Under target by more than 10%
      return baseColor + ' opacity-70';
    }
  };
  
  // Get day index (0-6) from date
  const getTodayIndex = (): number => {
    const today = new Date();
    const index = today.getDay() - 1; // Monday is 0
    return index < 0 ? 6 : index; // Sunday becomes 6
  };
  
  const todayIndex = getTodayIndex();
  
  return (
    <Card className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Weekly Targets</h3>
        
        <div className="space-y-6">
          {/* Calories */}
          <div className="flex items-center gap-4">
            <div className="w-24 flex-none">
              <div className="text-xl font-bold">{weeklyNutrition.totalCalories}</div>
              <div className="text-xs text-gray-500">{userGoals.calories * 7}</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative">
              {/* Goal line for calories */}
              <div className="absolute w-full h-[1px] bg-gray-300 z-10" style={{ bottom: `${100}%` }}></div>
              
              {weeklyNutrition.calories.map((day, index) => (
                <div 
                  key={`cal-${index}`} 
                  className={`w-full relative ${index === todayIndex ? 'bg-gray-100 rounded-sm' : ''}`}
                >
                  <div className="h-16 flex items-end">
                    <div 
                      className={`${getBarColor(day, userGoals.calories, macroColors.calories)} w-full rounded-t-sm`}
                      style={{ height: `${getBarHeight(day, userGoals.calories)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Protein */}
          <div className="flex items-center gap-4">
            <div className="w-24 flex-none">
              <div className="text-xl font-bold">{weeklyNutrition.totalProtein}P</div>
              <div className="text-xs text-gray-500">{userGoals.protein * 7}</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative">
              {/* Goal line for protein */}
              <div className="absolute w-full h-[1px] bg-gray-300 z-10" style={{ bottom: `${100}%` }}></div>
              
              {weeklyNutrition.protein.map((day, index) => (
                <div 
                  key={`prot-${index}`} 
                  className={`w-full relative ${index === todayIndex ? 'bg-gray-100 rounded-sm' : ''}`}
                >
                  <div className="h-16 flex items-end">
                    <div 
                      className={`${getBarColor(day, userGoals.protein, macroColors.protein)} w-full rounded-t-sm`}
                      style={{ height: `${getBarHeight(day, userGoals.protein)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fat */}
          <div className="flex items-center gap-4">
            <div className="w-24 flex-none">
              <div className="text-xl font-bold">{weeklyNutrition.totalFat}F</div>
              <div className="text-xs text-gray-500">{userGoals.fat * 7}</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative">
              {/* Goal line for fat */}
              <div className="absolute w-full h-[1px] bg-gray-300 z-10" style={{ bottom: `${100}%` }}></div>
              
              {weeklyNutrition.fat.map((day, index) => (
                <div 
                  key={`fat-${index}`} 
                  className={`w-full relative ${index === todayIndex ? 'bg-gray-100 rounded-sm' : ''}`}
                >
                  <div className="h-16 flex items-end">
                    <div 
                      className={`${getBarColor(day, userGoals.fat, macroColors.fat)} w-full rounded-t-sm`}
                      style={{ height: `${getBarHeight(day, userGoals.fat)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carbs */}
          <div className="flex items-center gap-4">
            <div className="w-24 flex-none">
              <div className="text-xl font-bold">{weeklyNutrition.totalCarbs}C</div>
              <div className="text-xs text-gray-500">{userGoals.carbs * 7}</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative">
              {/* Goal line for carbs */}
              <div className="absolute w-full h-[1px] bg-gray-300 z-10" style={{ bottom: `${100}%` }}></div>
              
              {weeklyNutrition.carbs.map((day, index) => (
                <div 
                  key={`carb-${index}`} 
                  className={`w-full relative ${index === todayIndex ? 'bg-gray-100 rounded-sm' : ''}`}
                >
                  <div className="h-16 flex items-end">
                    <div 
                      className={`${getBarColor(day, userGoals.carbs, macroColors.carbs)} w-full rounded-t-sm`}
                      style={{ height: `${getBarHeight(day, userGoals.carbs)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Day labels */}
        <div className="flex mt-2 px-24">
          {dayLabels.map((day, index) => (
            <div 
              key={`day-${index}`}
              className={`flex-1 text-center text-sm ${index === todayIndex ? 'text-black font-medium' : 'text-gray-400'}`}
            >
              {day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyTargets;
