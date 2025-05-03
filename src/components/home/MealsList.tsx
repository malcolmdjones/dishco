
import React from 'react';
import { ChevronsRight, Circle, Plus } from 'lucide-react';
import { Recipe } from '@/types/Recipe';

interface MealsListProps {
  todaysMeals: Array<{
    id: string;
    recipe: Recipe | Recipe[];
    type: string;
    consumed: boolean;
  }>;
  navigate: (path: string) => void;
  handleOpenRecipe: (recipe: Recipe) => void;
  handleToggleConsumed: (mealId: string, consumed: boolean) => void;
  formatMealType: (type: string) => string;
}

const MealsList: React.FC<MealsListProps> = ({ 
  todaysMeals, 
  navigate, 
  handleOpenRecipe, 
  handleToggleConsumed,
  formatMealType
}) => {
  // Group by meal type
  const mealsByType: Record<string, any[]> = {};
  
  todaysMeals.forEach(meal => {
    const type = meal.type;
    if (!mealsByType[type]) {
      mealsByType[type] = [];
    }
    mealsByType[type].push(meal);
  });
  
  // Sort meal types in logical order
  const mealTypes = Object.keys(mealsByType).sort((a, b) => {
    const order = { breakfast: 1, lunch: 2, dinner: 3 };
    // @ts-ignore
    return (order[a] || 99) - (order[b] || 99);
  });
  
  if (todaysMeals.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl text-center space-y-3">
        <p className="text-gray-500">No meals logged for today</p>
        <button
          className="text-blue-500 text-sm flex items-center justify-center mx-auto"
          onClick={() => navigate('/log-meal')}
        >
          <Plus size={16} className="mr-1" /> Add a meal
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {mealTypes.map(type => (
        <div key={type} className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-medium">{formatMealType(type)}</h3>
          </div>
          
          <div className="divide-y">
            {mealsByType[type].map(meal => {
              // Extract the recipe (handle both single recipe and array)
              const recipe = Array.isArray(meal.recipe) ? meal.recipe[0] : meal.recipe;
              if (!recipe) return null;
              
              return (
                <div key={meal.id} className="flex items-center p-3">
                  <button
                    className={`rounded-full w-6 h-6 flex-shrink-0 ${
                      meal.consumed
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-gray-300'
                    } flex items-center justify-center`}
                    onClick={() => handleToggleConsumed(meal.id, !meal.consumed)}
                  >
                    {meal.consumed && <Circle size={10} fill="currentColor" />}
                  </button>
                  
                  <div 
                    className="flex-1 ml-3 cursor-pointer"
                    onClick={() => handleOpenRecipe(recipe)}
                  >
                    <h4 className={`font-medium ${meal.consumed ? 'text-gray-400' : ''}`}>
                      {recipe.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {recipe.macros?.calories || 0} calories
                    </p>
                  </div>
                  
                  <button
                    className="p-2 text-gray-400"
                    onClick={() => handleOpenRecipe(recipe)}
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              );
            })}
          </div>
          
          <button
            className="w-full py-2 text-sm text-blue-500 flex items-center justify-center border-t"
            onClick={() => navigate('/log-meal')}
          >
            <Plus size={15} className="mr-1" />
            Add {formatMealType(type).toLowerCase()}
          </button>
        </div>
      ))}
      
      <div>
        <button
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 flex items-center justify-center"
          onClick={() => navigate('/log-meal')}
        >
          <Plus size={16} className="mr-1" /> Add another meal
        </button>
      </div>
    </div>
  );
};

export default MealsList;
