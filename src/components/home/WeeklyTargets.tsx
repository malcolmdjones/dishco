
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyNutrition } from '@/hooks/useWeeklyNutrition';
import { Flame } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface WeeklyTargetsProps {
  selectedDate: Date;
}

const WeeklyTargets: React.FC<WeeklyTargetsProps> = ({ selectedDate }) => {
  const { weeklyNutrition, userGoals } = useWeeklyNutrition(selectedDate);
  
  // Day labels at the bottom (single letters)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Color classes for different macros - using pastel colors
  const macroColors = {
    calories: 'bg-blue-300',
    protein: 'bg-orange-200',
    fat: 'bg-yellow-300',
    carbs: 'bg-green-300'
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
        <h3 className="text-lg font-medium mb-8">Weekly Targets</h3>
        
        <div className="space-y-8">
          {/* Calories */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none text-right">
              <div className="flex items-center justify-end">
                <span className="text-2xl font-bold">1220</span>
                <Flame className="ml-1 text-[#000000]" size={20} />
              </div>
            </div>
            
            <div className="flex-1">
              {/* Horizontal goal line */}
              <div className="relative h-16 w-full">
                <div className="absolute top-[30%] w-full h-[1px] bg-gray-300"></div>
                
                {/* Bars container */}
                <div className="absolute bottom-0 w-full flex justify-between">
                  {weeklyNutrition.calories.map((day, index) => (
                    <div key={`cal-${index}`} className="flex flex-col items-center">
                      <div 
                        className={`${macroColors.calories} w-4 rounded-t-md`}
                        style={{ 
                          height: day > 0 ? `${Math.max(Math.min((day / userGoals.calories) * 100, 100), 5)}%` : '4px' 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom separator */}
              <Separator className="mt-1" />
            </div>
          </div>
          
          {/* Protein */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none text-right">
              <div className="text-2xl font-bold">95P</div>
            </div>
            
            <div className="flex-1">
              {/* Horizontal goal line */}
              <div className="relative h-16 w-full">
                <div className="absolute top-[30%] w-full h-[1px] bg-gray-300"></div>
                
                {/* Bars container */}
                <div className="absolute bottom-0 w-full flex justify-between">
                  {weeklyNutrition.protein.map((day, index) => (
                    <div key={`prot-${index}`} className="flex flex-col items-center">
                      <div 
                        className={`${macroColors.protein} w-4 rounded-t-md`}
                        style={{ 
                          height: day > 0 ? `${Math.max(Math.min((day / userGoals.protein) * 100, 100), 5)}%` : '4px' 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom separator */}
              <Separator className="mt-1" />
            </div>
          </div>
          
          {/* Fat */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none text-right">
              <div className="text-2xl font-bold">58F</div>
            </div>
            
            <div className="flex-1">
              {/* Horizontal goal line */}
              <div className="relative h-16 w-full">
                <div className="absolute top-[30%] w-full h-[1px] bg-gray-300"></div>
                
                {/* Bars container */}
                <div className="absolute bottom-0 w-full flex justify-between">
                  {weeklyNutrition.fat.map((day, index) => (
                    <div key={`fat-${index}`} className="flex flex-col items-center">
                      <div 
                        className={`${macroColors.fat} w-4 rounded-t-md`}
                        style={{ 
                          height: day > 0 ? `${Math.max(Math.min((day / userGoals.fat) * 100, 100), 5)}%` : '4px' 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom separator */}
              <Separator className="mt-1" />
            </div>
          </div>
          
          {/* Carbs */}
          <div className="flex items-center gap-4">
            <div className="w-20 flex-none text-right">
              <div className="text-2xl font-bold">87C</div>
            </div>
            
            <div className="flex-1">
              {/* Horizontal goal line */}
              <div className="relative h-16 w-full">
                <div className="absolute top-[30%] w-full h-[1px] bg-gray-300"></div>
                
                {/* Bars container */}
                <div className="absolute bottom-0 w-full flex justify-between">
                  {weeklyNutrition.carbs.map((day, index) => (
                    <div key={`carb-${index}`} className="flex flex-col items-center">
                      <div 
                        className={`${macroColors.carbs} w-4 rounded-t-md`}
                        style={{ 
                          height: day > 0 ? `${Math.max(Math.min((day / userGoals.carbs) * 100, 100), 5)}%` : '4px' 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom separator */}
              <Separator className="mt-1" />
            </div>
          </div>
        </div>
        
        {/* Day labels */}
        <div className="flex mt-2 justify-between">
          {dayLabels.map((day, index) => (
            <div 
              key={`day-${index}`}
              className={`text-center text-sm w-4 ${index === todayIndex ? 'text-gray-500 font-medium' : 'text-gray-400'}`}
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

