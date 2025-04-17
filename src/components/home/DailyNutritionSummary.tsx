
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@/lib/utils';

interface DailyNutritionSummaryProps {
  dailyNutrition: {
    calories: number;
    totalCalories: number;
    protein: number;
    totalProtein: number;
    carbs: number;
    totalCarbs: number;
    fat: number;
    totalFat: number;
  };
  getMacroStatus: (type: 'calories' | 'protein' | 'carbs' | 'fat') => 'target-met' | 'too-high' | 'too-low';
  showAdjustGoalsButton?: boolean;
}

const DailyNutritionSummary: React.FC<DailyNutritionSummaryProps> = ({ 
  dailyNutrition, 
  getMacroStatus,
  showAdjustGoalsButton = true
}) => {
  const macroColors = {
    calories: "#FFF4D7",
    protein: "#DBE9FE",
    carbs: "#FEF9C3",
    fat: "#F3E8FF"
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today's Nutrition</h2>
        {showAdjustGoalsButton && (
          <Link to="/nutrition-goals">
            <Button variant="ghost" size="sm" className="text-xs">Adjust Goals</Button>
          </Link>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 flex flex-col items-center">
          <div className={cn(
            "w-16 h-16 relative",
            getMacroStatus('calories') === 'too-high' && "animate-pulse-light"
          )}>
            <CircularProgressbar 
              value={dailyNutrition.calories} 
              maxValue={dailyNutrition.totalCalories} 
              text={`${dailyNutrition.calories}`}
              styles={{
                path: { 
                  stroke: getMacroStatus('calories') === 'too-high' ? "#FF4B4B" : macroColors.calories
                },
                text: { fill: '#3c3c3c', fontSize: '30px' },
                trail: { stroke: '#f9f9f9' }
              }}
            />
          </div>
          <span className={cn(
            "text-xs text-center mt-1",
            getMacroStatus('calories') === 'target-met' ? "text-green-600" : "text-gray-700"
          )}>
            {dailyNutrition.calories} / {dailyNutrition.totalCalories} Cal
          </span>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          <div className={cn(
            "w-16 h-16 relative",
            getMacroStatus('protein') === 'too-high' && "animate-pulse-light"
          )}>
            <CircularProgressbar 
              value={dailyNutrition.protein} 
              maxValue={dailyNutrition.totalProtein} 
              text={`${dailyNutrition.protein}g`}
              styles={{
                path: { 
                  stroke: getMacroStatus('protein') === 'too-high' ? "#FF4B4B" : macroColors.protein
                },
                text: { fill: '#3c3c3c', fontSize: '30px' },
                trail: { stroke: '#f9f9f9' }
              }}
            />
          </div>
          <span className={cn(
            "text-xs text-center mt-1",
            getMacroStatus('protein') === 'target-met' ? "text-green-600" : "text-gray-700"
          )}>
            {dailyNutrition.protein}g / {dailyNutrition.totalProtein}g
          </span>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          <div className={cn(
            "w-16 h-16 relative",
            getMacroStatus('carbs') === 'too-high' && "animate-pulse-light"
          )}>
            <CircularProgressbar 
              value={dailyNutrition.carbs} 
              maxValue={dailyNutrition.totalCarbs} 
              text={`${dailyNutrition.carbs}g`}
              styles={{
                path: { 
                  stroke: getMacroStatus('carbs') === 'too-high' ? "#FF4B4B" : macroColors.carbs
                },
                text: { fill: '#3c3c3c', fontSize: '30px' },
                trail: { stroke: '#f9f9f9' }
              }}
            />
          </div>
          <span className={cn(
            "text-xs text-center mt-1",
            getMacroStatus('carbs') === 'target-met' ? "text-green-600" : "text-gray-700"
          )}>
            {dailyNutrition.carbs}g / {dailyNutrition.totalCarbs}g
          </span>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          <div className={cn(
            "w-16 h-16 relative",
            getMacroStatus('fat') === 'too-high' && "animate-pulse-light"
          )}>
            <CircularProgressbar 
              value={dailyNutrition.fat} 
              maxValue={dailyNutrition.totalFat} 
              text={`${dailyNutrition.fat}g`}
              styles={{
                path: { 
                  stroke: getMacroStatus('fat') === 'too-high' ? "#FF4B4B" : macroColors.fat
                },
                text: { fill: '#3c3c3c', fontSize: '30px' },
                trail: { stroke: '#f9f9f9' }
              }}
            />
          </div>
          <span className={cn(
            "text-xs text-center mt-1",
            getMacroStatus('fat') === 'target-met' ? "text-green-600" : "text-gray-700"
          )}>
            {dailyNutrition.fat}g / {dailyNutrition.totalFat}g
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyNutritionSummary;
