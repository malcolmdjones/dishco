
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
        
        <div className="flex justify-between items-center">
          {/* Calories */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-20 h-20">
              <CircularProgressbar 
                value={dayTotals.calories} 
                maxValue={userGoals.calories} 
                text={`${dayTotals.calories}`}
                styles={{
                  path: { stroke: "#FFF4D7" },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className="text-xs text-center mt-1">
              {dayTotals.calories} / {userGoals.calories} Cal
            </span>
          </div>
          
          {/* Protein */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-20 h-20">
              <CircularProgressbar 
                value={dayTotals.protein} 
                maxValue={userGoals.protein} 
                text={`${dayTotals.protein}g`}
                styles={{
                  path: { stroke: "#DBE9FE" },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className="text-xs text-center mt-1 text-amber-600">
              {dayTotals.protein}g / {userGoals.protein}g
            </span>
          </div>
          
          {/* Carbs */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-20 h-20">
              <CircularProgressbar 
                value={dayTotals.carbs} 
                maxValue={userGoals.carbs} 
                text={`${dayTotals.carbs}g`}
                styles={{
                  path: { stroke: "#FEF9C3" },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className="text-xs text-center mt-1">
              {dayTotals.carbs}g / {userGoals.carbs}g
            </span>
          </div>
          
          {/* Fat */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-20 h-20">
              <CircularProgressbar 
                value={dayTotals.fat} 
                maxValue={userGoals.fat} 
                text={`${dayTotals.fat}g`}
                styles={{
                  path: { stroke: "#F3E8FF" },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className="text-xs text-center mt-1 text-green-600">
              {dayTotals.fat}g / {userGoals.fat}g
            </span>
          </div>
        </div>
        
        {aiReasoning && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">AI Analysis:</p>
            <p>{aiReasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyNutritionCard;
