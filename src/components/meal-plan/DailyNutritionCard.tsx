
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

interface DailyNutritionCardProps {
  dayTotals: any;
  userGoals: any;
  exceedsGoals: any;
}

const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({
  dayTotals,
  userGoals,
  exceedsGoals
}) => {
  // Calculate percentage of goal reached for each macro
  const caloriePercent = Math.min(Math.round((dayTotals.calories / userGoals.calories) * 100), 100);
  const proteinPercent = Math.min(Math.round((dayTotals.protein / userGoals.protein) * 100), 100);
  const carbsPercent = Math.min(Math.round((dayTotals.carbs / userGoals.carbs) * 100), 100);
  const fatPercent = Math.min(Math.round((dayTotals.fat / userGoals.fat) * 100), 100);
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-lg">Daily Nutrition</h3>
          {exceedsGoals.any && (
            <div className="flex items-center text-amber-500 text-sm">
              <AlertTriangle size={16} className="mr-1" />
              <span>Exceeds daily goals</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-3xl font-semibold">{dayTotals.calories}</div>
              <div className="text-gray-400 text-sm">/ {userGoals.calories}</div>
            </div>
            <Progress 
              value={caloriePercent} 
              className="h-2 bg-gray-100"
              indicatorClassName={exceedsGoals.exceeds.calories ? "bg-amber-500" : "bg-yellow-400"}
            />
            <div className="text-sm text-center mt-1">Calories</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-3xl font-semibold">{dayTotals.protein}g</div>
              <div className="text-gray-400 text-sm">/ {userGoals.protein}g</div>
            </div>
            <Progress 
              value={proteinPercent} 
              className="h-2 bg-gray-100"
              indicatorClassName={exceedsGoals.exceeds.protein ? "bg-amber-500" : "bg-blue-400"}
            />
            <div className="text-sm text-center mt-1">Protein</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-3xl font-semibold">{dayTotals.carbs}g</div>
              <div className="text-gray-400 text-sm">/ {userGoals.carbs}g</div>
            </div>
            <Progress 
              value={carbsPercent} 
              className="h-2 bg-gray-100"
              indicatorClassName={exceedsGoals.exceeds.carbs ? "bg-amber-500" : "bg-yellow-400"}
            />
            <div className="text-sm text-center mt-1">Carbs</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-3xl font-semibold">{dayTotals.fat}g</div>
              <div className="text-gray-400 text-sm">/ {userGoals.fat}g</div>
            </div>
            <Progress 
              value={fatPercent} 
              className="h-2 bg-gray-100"
              indicatorClassName={exceedsGoals.exceeds.fat ? "bg-amber-500" : "bg-purple-400"}
            />
            <div className="text-sm text-center mt-1">Fat</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutritionCard;
