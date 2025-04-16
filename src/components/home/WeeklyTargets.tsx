
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
    calories: 'bg-blue-200',
    protein: 'bg-orange-100',
    fat: 'bg-yellow-200',
    carbs: 'bg-green-200'
  };
  
  return (
    <Card className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-8">Weekly Targets</h3>
        
        {/* Calories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Empty div for spacing on the left */}
            <div className="w-24"></div>
            
            {/* Bar chart container */}
            <div className="flex-1 px-2">
              <div className="flex justify-between items-end h-10">
                {weeklyNutrition.calories.map((day, index) => (
                  <div key={`cal-${index}`} className="flex justify-center w-full">
                    <div 
                      className={`${macroColors.calories} w-6 rounded-2xl`}
                      style={{ 
                        height: day > 0 ? `${Math.min((day / userGoals.calories) * 80, 100)}%` : '4px' 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target value on the right */}
            <div className="flex items-center w-24 justify-end text-right">
              <span className="text-2xl font-bold">1220</span>
              <Flame className="ml-1" size={20} />
            </div>
          </div>
          
          {/* Separator */}
          <div className="h-px bg-gray-200 mt-3 mb-8"></div>
        </div>
        
        {/* Protein Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Empty div for spacing on the left */}
            <div className="w-24"></div>
            
            {/* Bar chart container */}
            <div className="flex-1 px-2">
              <div className="flex justify-between items-end h-10">
                {weeklyNutrition.protein.map((day, index) => (
                  <div key={`prot-${index}`} className="flex justify-center w-full">
                    <div 
                      className={`${macroColors.protein} w-6 rounded-2xl`}
                      style={{ 
                        height: day > 0 ? `${Math.min((day / userGoals.protein) * 80, 100)}%` : '4px' 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target value on the right */}
            <div className="w-24 justify-end text-right">
              <span className="text-2xl font-bold">95P</span>
            </div>
          </div>
          
          {/* Separator */}
          <div className="h-px bg-gray-200 mt-3 mb-8"></div>
        </div>
        
        {/* Fat Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Empty div for spacing on the left */}
            <div className="w-24"></div>
            
            {/* Bar chart container */}
            <div className="flex-1 px-2">
              <div className="flex justify-between items-end h-10">
                {weeklyNutrition.fat.map((day, index) => (
                  <div key={`fat-${index}`} className="flex justify-center w-full">
                    <div 
                      className={`${macroColors.fat} w-6 rounded-2xl`}
                      style={{ 
                        height: day > 0 ? `${Math.min((day / userGoals.fat) * 80, 100)}%` : '4px' 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target value on the right */}
            <div className="w-24 justify-end text-right">
              <span className="text-2xl font-bold">58F</span>
            </div>
          </div>
          
          {/* Separator */}
          <div className="h-px bg-gray-200 mt-3 mb-8"></div>
        </div>
        
        {/* Carbs Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {/* Empty div for spacing on the left */}
            <div className="w-24"></div>
            
            {/* Bar chart container */}
            <div className="flex-1 px-2">
              <div className="flex justify-between items-end h-10">
                {weeklyNutrition.carbs.map((day, index) => (
                  <div key={`carb-${index}`} className="flex justify-center w-full">
                    <div 
                      className={`${macroColors.carbs} w-6 rounded-2xl`}
                      style={{ 
                        height: day > 0 ? `${Math.min((day / userGoals.carbs) * 80, 100)}%` : '4px' 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target value on the right */}
            <div className="w-24 justify-end text-right">
              <span className="text-2xl font-bold">87C</span>
            </div>
          </div>
          
          {/* Separator */}
          <div className="h-px bg-gray-200 mt-3 mb-4"></div>
        </div>
        
        {/* Day labels */}
        <div className="flex justify-between px-6 mt-2">
          {dayLabels.map((day, index) => (
            <div 
              key={`day-${index}`}
              className="text-center text-sm text-gray-400"
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
