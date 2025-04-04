
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@/lib/utils';

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
  // Helper function to determine if a macro target is met (within thresholds)
  const getMacroStatus = (type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const value = dayTotals[type];
    const target = userGoals[type];
    
    // Define thresholds based on macro type
    const thresholds = {
      calories: { lower: 10, upper: 60 },
      protein: { lower: 5, upper: 5 },
      carbs: { lower: 10, upper: 10 },
      fat: { lower: 5, upper: 5 }
    };
    
    // Check if value is within target range (inclusive of thresholds)
    if (value >= target - thresholds[type].lower && value <= target + thresholds[type].upper) {
      return 'target-met';
    } else if (value > target + thresholds[type].upper) {
      return 'too-high';
    } else {
      return 'too-low';
    }
  };

  // Get status for each macro
  const caloriesStatus = getMacroStatus('calories');
  const proteinStatus = getMacroStatus('protein');
  const carbsStatus = getMacroStatus('carbs');
  const fatStatus = getMacroStatus('fat');

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Daily Nutrition</h2>
        
        <div className="flex justify-between items-center">
          {/* Calories */}
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-20 h-20 relative",
              caloriesStatus === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dayTotals.calories} 
                maxValue={userGoals.calories} 
                text={`${dayTotals.calories}`}
                styles={{
                  path: { 
                    stroke: caloriesStatus === 'too-high' ? "#FF4B4B" : "#FFF4D7"
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              caloriesStatus === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dayTotals.calories} / {userGoals.calories} Cal
            </span>
          </div>
          
          {/* Protein */}
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-20 h-20 relative",
              proteinStatus === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dayTotals.protein} 
                maxValue={userGoals.protein} 
                text={`${dayTotals.protein}g`}
                styles={{
                  path: { 
                    stroke: proteinStatus === 'too-high' ? "#FF4B4B" : "#DBE9FE"
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              proteinStatus === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dayTotals.protein}g / {userGoals.protein}g
            </span>
          </div>
          
          {/* Carbs */}
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-20 h-20 relative",
              carbsStatus === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dayTotals.carbs} 
                maxValue={userGoals.carbs} 
                text={`${dayTotals.carbs}g`}
                styles={{
                  path: { 
                    stroke: carbsStatus === 'too-high' ? "#FF4B4B" : "#FEF9C3"
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              carbsStatus === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dayTotals.carbs}g / {userGoals.carbs}g
            </span>
          </div>
          
          {/* Fat */}
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-20 h-20 relative",
              fatStatus === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dayTotals.fat} 
                maxValue={userGoals.fat} 
                text={`${dayTotals.fat}g`}
                styles={{
                  path: { 
                    stroke: fatStatus === 'too-high' ? "#FF4B4B" : "#F3E8FF" 
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              fatStatus === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
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
