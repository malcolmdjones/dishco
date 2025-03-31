
import React from 'react';
import { InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyNutritionCardProps {
  dayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  userGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  exceedsGoals: {
    any: boolean;
    exceeds: {
      calories: boolean;
      protein: boolean;
      carbs: boolean;
      fat: boolean;
    };
  };
}

const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({
  dayTotals,
  userGoals,
  exceedsGoals
}) => {
  const { toast } = useToast();

  const handleInfoClick = () => {
    toast({
      title: "Nutrition Information",
      description: "These values show your daily nutrition totals compared to your goals.",
    });
  };

  // Calculate percentages for progress bars
  const getPercentage = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Get color based on percentage and if it exceeds goals
  const getColorClass = (nutrient: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (exceedsGoals.exceeds[nutrient]) return "bg-red-500";
    
    const percentage = getPercentage(dayTotals[nutrient], userGoals[nutrient]);
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-green-400";
    return "bg-gray-300";
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium">Daily Nutrition</h2>
        <button onClick={handleInfoClick} className="text-gray-400">
          <InfoIcon size={16} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Calories */}
        <div className="text-center">
          <div className="mb-1">
            <span className="text-lg font-semibold">{dayTotals.calories}</span>
            <span className="text-xs text-gray-500 ml-1">/ {userGoals.calories}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-1 w-full">
            <div 
              className={`h-full rounded-full ${getColorClass('calories')}`}
              style={{ width: `${getPercentage(dayTotals.calories, userGoals.calories)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Calories</p>
        </div>

        {/* Protein */}
        <div className="text-center">
          <div className="mb-1">
            <span className="text-lg font-semibold">{dayTotals.protein}g</span>
            <span className="text-xs text-gray-500 ml-1">/ {userGoals.protein}g</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-1 w-full">
            <div 
              className={`h-full rounded-full ${getColorClass('protein')}`}
              style={{ width: `${getPercentage(dayTotals.protein, userGoals.protein)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Protein</p>
        </div>

        {/* Carbs */}
        <div className="text-center">
          <div className="mb-1">
            <span className="text-lg font-semibold">{dayTotals.carbs}g</span>
            <span className="text-xs text-gray-500 ml-1">/ {userGoals.carbs}g</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-1 w-full">
            <div 
              className={`h-full rounded-full ${getColorClass('carbs')}`}
              style={{ width: `${getPercentage(dayTotals.carbs, userGoals.carbs)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Carbs</p>
        </div>

        {/* Fat */}
        <div className="text-center">
          <div className="mb-1">
            <span className="text-lg font-semibold">{dayTotals.fat}g</span>
            <span className="text-xs text-gray-500 ml-1">/ {userGoals.fat}g</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-1 w-full">
            <div 
              className={`h-full rounded-full ${getColorClass('fat')}`}
              style={{ width: `${getPercentage(dayTotals.fat, userGoals.fat)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Fat</p>
        </div>
      </div>
    </div>
  );
};

export default DailyNutritionCard;
