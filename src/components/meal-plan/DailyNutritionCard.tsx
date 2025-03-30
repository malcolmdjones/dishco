
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
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Daily Nutrition</h3>
          {exceedsGoals.any && (
            <div className="flex items-center text-amber-500 text-sm">
              <AlertTriangle size={16} className="mr-1" />
              <span>Exceeds daily goals</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span>Calories</span>
              <span className={`font-medium ${exceedsGoals.exceeds.calories ? 'text-amber-500' : ''}`}>
                {dayTotals.calories} / {userGoals.calories}
              </span>
            </div>
            <Progress 
              value={caloriePercent} 
              className="h-2"
              indicatorClassName={exceedsGoals.exceeds.calories ? "bg-amber-500" : undefined}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span>Protein</span>
              <span className={`font-medium ${exceedsGoals.exceeds.protein ? 'text-amber-500' : ''}`}>
                {dayTotals.protein}g / {userGoals.protein}g
              </span>
            </div>
            <Progress 
              value={proteinPercent} 
              className="h-2"
              indicatorClassName={`${exceedsGoals.exceeds.protein ? 'bg-amber-500' : 'bg-amber-400'}`}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span>Carbs</span>
              <span className={`font-medium ${exceedsGoals.exceeds.carbs ? 'text-amber-500' : ''}`}>
                {dayTotals.carbs}g / {userGoals.carbs}g
              </span>
            </div>
            <Progress 
              value={carbsPercent} 
              className="h-2"
              indicatorClassName={`${exceedsGoals.exceeds.carbs ? 'bg-amber-500' : 'bg-blue-400'}`}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span>Fat</span>
              <span className={`font-medium ${exceedsGoals.exceeds.fat ? 'text-amber-500' : ''}`}>
                {dayTotals.fat}g / {userGoals.fat}g
              </span>
            </div>
            <Progress 
              value={fatPercent} 
              className="h-2"
              indicatorClassName={`${exceedsGoals.exceeds.fat ? 'bg-amber-500' : 'bg-green-400'}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutritionCard;
