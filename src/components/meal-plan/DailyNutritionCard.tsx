import React from 'react';

interface DailyNutritionCardProps {
  dayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    goals?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  userGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  exceedsGoals: {
    calories: boolean;
    protein: boolean;
    carbs: boolean;
    fat: boolean;
  };
}

const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({ 
  dayTotals, 
  userGoals,
  exceedsGoals 
}) => {
  // Use either the goals from dayTotals, the directly provided userGoals, or fallback to defaults
  const goals = dayTotals.goals || userGoals || {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  };
  
  // Calculate percentages of goals
  const caloriePercent = Math.min(100, Math.round((dayTotals.calories / goals.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((dayTotals.protein / goals.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((dayTotals.carbs / goals.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((dayTotals.fat / goals.fat) * 100));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Calories */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Calories</span>
            <span className={`text-sm ${exceedsGoals.calories ? 'text-red-500' : 'text-gray-600'}`}>
              {dayTotals.calories} / {goals.calories}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-dishco-primary h-2.5 rounded-full" 
              style={{ width: `${caloriePercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Protein */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Protein</span>
            <span className={`text-sm ${exceedsGoals.protein ? 'text-red-500' : 'text-gray-600'}`}>
              {dayTotals.protein} / {goals.protein}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${proteinPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Carbs */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Carbs</span>
            <span className={`text-sm ${exceedsGoals.carbs ? 'text-red-500' : 'text-gray-600'}`}>
              {dayTotals.carbs} / {goals.carbs}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${carbsPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Fat */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Fat</span>
            <span className={`text-sm ${exceedsGoals.fat ? 'text-red-500' : 'text-gray-600'}`}>
              {dayTotals.fat} / {goals.fat}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-yellow-500 h-2.5 rounded-full" 
              style={{ width: `${fatPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyNutritionCard;
