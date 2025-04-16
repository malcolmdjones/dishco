
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyNutrition } from '@/hooks/useWeeklyNutrition';
import { Flame } from 'lucide-react';

interface WeeklyTargetsProps {
  selectedDate: Date;
}

const WeeklyTargets: React.FC<WeeklyTargetsProps> = ({ selectedDate }) => {
  const { weeklyNutrition, userGoals } = useWeeklyNutrition(selectedDate);
  
  // Day labels at the bottom (single letters)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Color classes for different macros - using lighter pastel colors
  const macroColors = {
    calories: 'bg-blue-300',
    protein: 'bg-orange-200',
    fat: 'bg-yellow-300',
    carbs: 'bg-green-300'
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
      return baseColor;
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
        <h3 className="text-lg font-medium mb-6">Weekly Targets</h3>
        
        <div className="space-y-8">
          {/* Calories */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none flex items-center">
              <div className="text-2xl font-bold">1220</div>
              <Flame className="ml-1 text-[#ea384c]" size={18} />
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative h-16">
              {/* Horizontal lines */}
              <div className="absolute w-full h-[1px] bg-gray-200" style={{ bottom: '70%' }}></div>
              
              {weeklyNutrition.calories.map((day, index) => (
                <div 
                  key={`cal-${index}`} 
                  className="w-full relative flex justify-center"
                >
                  <div className="h-16 flex items-end w-12">
                    <div 
                      className={`${macroColors.calories} w-8 rounded-t-md mx-auto`}
                      style={{ height: `${getBarHeight(day, userGoals.calories)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Protein */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none">
              <div className="text-2xl font-bold">95P</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative h-16">
              {/* Horizontal lines */}
              <div className="absolute w-full h-[1px] bg-gray-200" style={{ bottom: '70%' }}></div>
              
              {weeklyNutrition.protein.map((day, index) => (
                <div 
                  key={`prot-${index}`} 
                  className="w-full relative flex justify-center"
                >
                  <div className="h-16 flex items-end w-12">
                    <div 
                      className={`${macroColors.protein} w-8 rounded-t-md mx-auto`}
                      style={{ height: `${getBarHeight(day, userGoals.protein)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fat */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none">
              <div className="text-2xl font-bold">58F</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative h-16">
              {/* Horizontal lines */}
              <div className="absolute w-full h-[1px] bg-gray-200" style={{ bottom: '70%' }}></div>
              
              {weeklyNutrition.fat.map((day, index) => (
                <div 
                  key={`fat-${index}`} 
                  className="w-full relative flex justify-center"
                >
                  <div className="h-16 flex items-end w-12">
                    <div 
                      className={`${macroColors.fat} w-8 rounded-t-md mx-auto`}
                      style={{ height: `${getBarHeight(day, userGoals.fat)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carbs */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none">
              <div className="text-2xl font-bold">87C</div>
            </div>
            
            <div className="flex-1 flex items-end space-x-1 px-1 relative h-16">
              {/* Horizontal lines */}
              <div className="absolute w-full h-[1px] bg-gray-200" style={{ bottom: '70%' }}></div>
              
              {weeklyNutrition.carbs.map((day, index) => (
                <div 
                  key={`carb-${index}`} 
                  className="w-full relative flex justify-center"
                >
                  <div className="h-16 flex items-end w-12">
                    <div 
                      className={`${macroColors.carbs} w-8 rounded-t-md mx-auto`}
                      style={{ height: `${getBarHeight(day, userGoals.carbs)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Day labels */}
        <div className="flex mt-2 px-20 justify-between">
          {dayLabels.map((day, index) => (
            <div 
              key={`day-${index}`}
              className={`text-center text-sm ${index === todayIndex ? 'text-gray-500 font-medium' : 'text-gray-400'}`}
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
