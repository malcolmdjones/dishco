
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { NutritionGoals } from '@/data/mockData';

interface DailyNutritionCardProps {
  dayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  userGoals: NutritionGoals;
  exceedsGoals: {
    any: boolean;
    exceeds: {
      calories: boolean;
      protein: boolean;
      carbs: boolean;
      fat: boolean;
    }
  };
  aiReasoning?: string; // Make this prop optional
}

const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({
  dayTotals,
  userGoals,
  exceedsGoals,
  aiReasoning = "" // Provide a default empty string
}) => {
  const { any: exceedsAny, exceeds } = exceedsGoals;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-2">Daily Nutrition</h2>
      
      {exceedsAny && (
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md mb-3 text-red-600 text-sm">
          <AlertTriangle size={16} />
          <span>This plan exceeds your daily goals</span>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {/* Calories */}
        <div className="flex flex-col">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-semibold">{dayTotals.calories}</span>
            <span className="text-xs text-gray-500">/ {userGoals.calories}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${exceeds.calories ? 'bg-red-400' : 'bg-yellow-400'}`} 
              style={{ width: `${Math.min(100, (dayTotals.calories / userGoals.calories) * 100)}%` }}
            ></div>
          </div>
          <span className="text-xs mt-1">Calories</span>
        </div>
        
        {/* Protein */}
        <div className="flex flex-col">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-semibold">{dayTotals.protein}g</span>
            <span className="text-xs text-gray-500">/ {userGoals.protein}g</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${exceeds.protein ? 'bg-red-400' : 'bg-blue-400'}`}
              style={{ width: `${Math.min(100, (dayTotals.protein / userGoals.protein) * 100)}%` }}
            ></div>
          </div>
          <span className="text-xs mt-1">Protein</span>
        </div>
        
        {/* Carbs */}
        <div className="flex flex-col">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-semibold">{dayTotals.carbs}g</span>
            <span className="text-xs text-gray-500">/ {userGoals.carbs}g</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${exceeds.carbs ? 'bg-red-400' : 'bg-yellow-200'}`}
              style={{ width: `${Math.min(100, (dayTotals.carbs / userGoals.carbs) * 100)}%` }}
            ></div>
          </div>
          <span className="text-xs mt-1">Carbs</span>
        </div>
        
        {/* Fat */}
        <div className="flex flex-col">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-semibold">{dayTotals.fat}g</span>
            <span className="text-xs text-gray-500">/ {userGoals.fat}g</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${exceeds.fat ? 'bg-red-400' : 'bg-purple-300'}`}
              style={{ width: `${Math.min(100, (dayTotals.fat / userGoals.fat) * 100)}%` }}
            ></div>
          </div>
          <span className="text-xs mt-1">Fat</span>
        </div>
      </div>
      
      {/* AI Reasoning - only show if provided */}
      {aiReasoning && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
          <p className="font-medium mb-1">AI Reasoning:</p>
          <p>{aiReasoning}</p>
        </div>
      )}
    </div>
  );
};

export default DailyNutritionCard;
