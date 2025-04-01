
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
        
        <div className="space-y-6">
          {/* Calories */}
          <div>
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-2xl font-semibold">{dayTotals.calories}</span>
                <span className="text-gray-500 text-sm ml-1">/ {userGoals.calories}</span>
              </div>
              <span className="text-lg">Calories</span>
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
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-2xl font-semibold">{dayTotals.protein}g</span>
                <span className="text-gray-500 text-sm ml-1">/ {userGoals.protein}g</span>
              </div>
              <span className="text-lg">Protein</span>
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
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-2xl font-semibold">{dayTotals.carbs}g</span>
                <span className="text-gray-500 text-sm ml-1">/ {userGoals.carbs}g</span>
              </div>
              <span className="text-lg">Carbs</span>
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
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-2xl font-semibold">{dayTotals.fat}g</span>
                <span className="text-gray-500 text-sm ml-1">/ {userGoals.fat}g</span>
              </div>
              <span className="text-lg">Fat</span>
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
