
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyNutrition } from '@/hooks/useWeeklyNutrition';
import { Flame } from 'lucide-react';

interface WeeklyTargetsProps {
  selectedDate: Date;
}

const WeeklyTargets: React.FC<WeeklyTargetsProps> = ({ selectedDate }) => {
  const { weeklyNutrition, userGoals } = useWeeklyNutrition(selectedDate);
  
  // Day labels at the bottom
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Color classes for different macros - using pastel colors
  const macroColors = {
    calories: 'bg-blue-200',
    protein: 'bg-orange-200',
    fat: 'bg-yellow-200',
    carbs: 'bg-green-200'
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
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-8">Weekly Targets</h3>
        
        <div className="space-y-8">
          {/* Separator line */}
          <div className="border-t border-gray-200"></div>
          
          {/* Calories */}
          <div className="flex items-center">
            <div className="flex-1 relative">
              {/* Goal line */}
              <div className="absolute w-full h-[1px] top-1/2 bg-gray-200"></div>
              
              {/* Bars */}
              <div className="flex justify-between items-end gap-1">
                {weeklyNutrition.calories.map((day, index) => (
                  <div key={`cal-${index}`} className="flex-1 flex justify-center">
                    <div 
                      className={`${macroColors.calories} w-8 rounded-t-lg`}
                      style={{ 
                        height: day > 0 ? `${Math.max(Math.min((day / userGoals.calories) * 100, 100), 4)}%` : '4px',
                        maxHeight: '40px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ml-6 flex items-center">
              <span className="text-2xl font-bold">1220</span>
              <Flame className="ml-1 text-black" size={20} />
            </div>
          </div>
          
          {/* Separator line */}
          <div className="border-t border-gray-200"></div>
          
          {/* Protein */}
          <div className="flex items-center">
            <div className="flex-1 relative">
              {/* Goal line */}
              <div className="absolute w-full h-[1px] top-1/2 bg-gray-200"></div>
              
              {/* Bars */}
              <div className="flex justify-between items-end gap-1">
                {weeklyNutrition.protein.map((day, index) => (
                  <div key={`prot-${index}`} className="flex-1 flex justify-center">
                    <div 
                      className={`${macroColors.protein} w-8 rounded-t-lg`}
                      style={{ 
                        height: day > 0 ? `${Math.max(Math.min((day / userGoals.protein) * 100, 100), 4)}%` : '4px',
                        maxHeight: '40px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ml-6">
              <span className="text-2xl font-bold">95P</span>
            </div>
          </div>
          
          {/* Separator line */}
          <div className="border-t border-gray-200"></div>
          
          {/* Fat */}
          <div className="flex items-center">
            <div className="flex-1 relative">
              {/* Goal line */}
              <div className="absolute w-full h-[1px] top-1/2 bg-gray-200"></div>
              
              {/* Bars */}
              <div className="flex justify-between items-end gap-1">
                {weeklyNutrition.fat.map((day, index) => (
                  <div key={`fat-${index}`} className="flex-1 flex justify-center">
                    <div 
                      className={`${macroColors.fat} w-8 rounded-t-lg`}
                      style={{ 
                        height: day > 0 ? `${Math.max(Math.min((day / userGoals.fat) * 100, 100), 4)}%` : '4px',
                        maxHeight: '40px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ml-6">
              <span className="text-2xl font-bold">58F</span>
            </div>
          </div>
          
          {/* Separator line */}
          <div className="border-t border-gray-200"></div>
          
          {/* Carbs */}
          <div className="flex items-center">
            <div className="flex-1 relative">
              {/* Goal line */}
              <div className="absolute w-full h-[1px] top-1/2 bg-gray-200"></div>
              
              {/* Bars */}
              <div className="flex justify-between items-end gap-1">
                {weeklyNutrition.carbs.map((day, index) => (
                  <div key={`carb-${index}`} className="flex-1 flex justify-center">
                    <div 
                      className={`${macroColors.carbs} w-8 rounded-t-lg`}
                      style={{ 
                        height: day > 0 ? `${Math.max(Math.min((day / userGoals.carbs) * 100, 100), 4)}%` : '4px',
                        maxHeight: '40px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ml-6">
              <span className="text-2xl font-bold">87C</span>
            </div>
          </div>
          
          {/* Separator line */}
          <div className="border-t border-gray-200"></div>
          
          {/* Day labels */}
          <div className="flex justify-between px-1 pt-4">
            {dayLabels.map((day, index) => (
              <div 
                key={`day-${index}`}
                className={`flex-1 text-center text-base ${index === todayIndex ? 'text-gray-800' : 'text-gray-500'}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyTargets;
