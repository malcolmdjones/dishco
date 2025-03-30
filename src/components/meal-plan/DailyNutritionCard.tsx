
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ExceedsGoals {
  any: boolean;
  exceeds: {
    calories: boolean;
    protein: boolean;
    carbs: boolean;
    fat: boolean;
  };
}

interface DailyNutritionCardProps {
  dayTotals: NutritionGoals;
  userGoals: NutritionGoals;
  exceedsGoals: ExceedsGoals;
  aiReasoning?: string;
}

const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({
  dayTotals,
  userGoals,
  exceedsGoals,
  aiReasoning
}) => {
  // Calculate percentage of goals
  const calculatePercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };
  
  const calories = calculatePercentage(dayTotals.calories, userGoals.calories);
  const protein = calculatePercentage(dayTotals.protein, userGoals.protein);
  const carbs = calculatePercentage(dayTotals.carbs, userGoals.carbs);
  const fat = calculatePercentage(dayTotals.fat, userGoals.fat);
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Calories</span>
              <span className={`${exceedsGoals.exceeds.calories ? 'text-red-500' : ''}`}>
                {dayTotals.calories} / {userGoals.calories} kcal
              </span>
            </div>
            <Progress 
              value={calories} 
              className="h-2" 
              indicatorClassName={`${exceedsGoals.exceeds.calories ? 'bg-red-500' : 'bg-green-500'}`}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Protein</span>
              <span className={`${exceedsGoals.exceeds.protein ? 'text-red-500' : ''}`}>
                {dayTotals.protein} / {userGoals.protein}g
              </span>
            </div>
            <Progress 
              value={protein} 
              className="h-2" 
              indicatorClassName={`${exceedsGoals.exceeds.protein ? 'bg-red-500' : 'bg-blue-500'}`}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Carbs</span>
              <span className={`${exceedsGoals.exceeds.carbs ? 'text-red-500' : ''}`}>
                {dayTotals.carbs} / {userGoals.carbs}g
              </span>
            </div>
            <Progress 
              value={carbs} 
              className="h-2" 
              indicatorClassName={`${exceedsGoals.exceeds.carbs ? 'bg-red-500' : 'bg-yellow-500'}`}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Fat</span>
              <span className={`${exceedsGoals.exceeds.fat ? 'text-red-500' : ''}`}>
                {dayTotals.fat} / {userGoals.fat}g
              </span>
            </div>
            <Progress 
              value={fat} 
              className="h-2" 
              indicatorClassName={`${exceedsGoals.exceeds.fat ? 'bg-red-500' : 'bg-purple-500'}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutritionCard;
