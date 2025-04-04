
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
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-6">Daily Nutrition</h2>
        
        <div className="grid grid-cols-4 gap-6">
          {/* Calories */}
          <div className="flex flex-col items-center">
            <Progress 
              type="circular"
              size="lg"
              value={dayTotals.calories} 
              max={userGoals.calories}
              showValue={true}
              indicatorClassName={exceedsGoals.exceeds.calories ? "text-red-500" : "text-yellow-400"}
            />
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-500">{dayTotals.calories} / {userGoals.calories}</span>
              <p className="text-sm text-gray-700">Calories</p>
            </div>
          </div>
          
          {/* Protein */}
          <div className="flex flex-col items-center">
            <Progress 
              type="circular"
              size="lg"
              value={dayTotals.protein} 
              max={userGoals.protein}
              showValue={true}
              valueSuffix="g"
              indicatorClassName={exceedsGoals.exceeds.protein ? "text-red-500" : "text-blue-400"}
            />
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-500">{dayTotals.protein}g / {userGoals.protein}g</span>
              <p className="text-sm text-gray-700">Protein</p>
            </div>
          </div>
          
          {/* Carbs */}
          <div className="flex flex-col items-center">
            <Progress 
              type="circular"
              size="lg"
              value={dayTotals.carbs} 
              max={userGoals.carbs}
              showValue={true}
              valueSuffix="g"
              indicatorClassName={exceedsGoals.exceeds.carbs ? "text-red-500" : "text-yellow-400"}
            />
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-500">{dayTotals.carbs}g / {userGoals.carbs}g</span>
              <p className="text-sm text-gray-700">Carbs</p>
            </div>
          </div>
          
          {/* Fat */}
          <div className="flex flex-col items-center">
            <Progress 
              type="circular"
              size="lg"
              value={dayTotals.fat} 
              max={userGoals.fat}
              showValue={true}
              valueSuffix="g"
              indicatorClassName={exceedsGoals.exceeds.fat ? "text-red-500" : "text-purple-400"}
            />
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-500">{dayTotals.fat}g / {userGoals.fat}g</span>
              <p className="text-sm text-gray-700">Fat</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutritionCard;
