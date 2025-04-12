
import React from 'react';
import { Recipe } from '@/data/mockData';

interface NutritionInfoProps {
  macros: Recipe['macros'];
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({ macros }) => {
  // Add null check to ensure macros exists
  if (!macros) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Nutrition Information</h3>
        <p className="text-gray-500">Nutrition information not available</p>
      </div>
    );
  }

  // Extract values with fallbacks to 0
  const calories = macros.calories || 0;
  const protein = macros.protein || 0;
  const carbs = macros.carbs || 0;
  const fat = macros.fat || 0;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Nutrition Information</h3>
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-amber-50 p-2 rounded-md text-center">
          <div className="text-sm font-medium mb-1">Calories</div>
          <div className="font-bold">{calories}</div>
          <div className="text-xs">kcal</div>
        </div>
        <div className="bg-blue-50 p-2 rounded-md text-center">
          <div className="text-sm font-medium mb-1">Protein</div>
          <div className="font-bold">{protein}</div>
          <div className="text-xs">g</div>
        </div>
        <div className="bg-yellow-50 p-2 rounded-md text-center">
          <div className="text-sm font-medium mb-1">Carbs</div>
          <div className="font-bold">{carbs}</div>
          <div className="text-xs">g</div>
        </div>
        <div className="bg-purple-50 p-2 rounded-md text-center">
          <div className="text-sm font-medium mb-1">Fat</div>
          <div className="font-bold">{fat}</div>
          <div className="text-xs">g</div>
        </div>
      </div>
    </div>
  );
};

export default NutritionInfo;
