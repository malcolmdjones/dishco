
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
        <h2 className="text-lg font-semibold mb-4">Daily Nutrition</h2>
        
        <div className="grid grid-cols-4 gap-4">
          {/* Calories */}
          <div>
            <div className="flex flex-col mb-1">
              <span className="text-sm text-gray-700">Calories</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold">{dayTotals.calories}</span>
                <span className="text-xs text-gray-500">/ {userGoals.calories}</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${exceedsGoals.exceeds.calories ? 'bg-red-500' : 'bg-yellow-400'}`}
                style={{ width: `${Math.min(100, (dayTotals.calories / userGoals.calories) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Protein */}
          <div>
            <div className="flex flex-col mb-1">
              <span className="text-sm text-gray-700">Protein</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold">{dayTotals.protein}g</span>
                <span className="text-xs text-gray-500">/ {userGoals.protein}g</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${exceedsGoals.exceeds.protein ? 'bg-red-500' : 'bg-blue-400'}`}
                style={{ width: `${Math.min(100, (dayTotals.protein / userGoals.protein) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Carbs */}
          <div>
            <div className="flex flex-col mb-1">
              <span className="text-sm text-gray-700">Carbs</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold">{dayTotals.carbs}g</span>
                <span className="text-xs text-gray-500">/ {userGoals.carbs}g</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${exceedsGoals.exceeds.carbs ? 'bg-red-500' : 'bg-yellow-400'}`}
                style={{ width: `${Math.min(100, (dayTotals.carbs / userGoals.carbs) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Fat */}
          <div>
            <div className="flex flex-col mb-1">
              <span className="text-sm text-gray-700">Fat</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold">{dayTotals.fat}g</span>
                <span className="text-xs text-gray-500">/ {userGoals.fat}g</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${exceedsGoals.exceeds.fat ? 'bg-red-500' : 'bg-purple-400'}`}
                style={{ width: `${Math.min(100, (dayTotals.fat / userGoals.fat) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyNutritionCard;
