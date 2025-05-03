
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/data/mockData';

interface Meal {
  id: string;
  name: string;
  type: string;
  recipe: Recipe;
  consumed: boolean;
  loggedAt?: string;
  planned?: boolean;
}

interface MealsListProps {
  todaysMeals: Meal[];
  navigate: (path: string) => void;
  handleOpenRecipe: (recipe: Recipe) => void;
  handleToggleConsumed: (meal: Meal) => void;
  formatMealType: (type: string) => string;
}

const MealsList: React.FC<MealsListProps> = ({ 
  todaysMeals, 
  navigate, 
  handleOpenRecipe, 
  handleToggleConsumed,
  formatMealType
}) => {
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Today's Meals</h2>
        <Link to="/log-meal">
          <Button variant="outline" size="sm" className="text-xs">
            Log More Food
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {todaysMeals.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-gray-500">No meals logged today.</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => navigate('/log-meal')}
            >
              Log your first meal
            </Button>
          </div>
        ) : (
          todaysMeals.map((meal) => {
            const mealRecipe = Array.isArray(meal.recipe) ? meal.recipe[0] : meal.recipe;
            
            return (
              <div key={meal.id} className={`bg-white rounded-xl p-4 shadow-sm ${meal.planned && !meal.consumed ? 'border-l-4 border-green-400' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">{formatMealType(meal.type)}</span>
                    {meal.planned && !meal.consumed && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Planned
                      </span>
                    )}
                  </div>
                  <span className="text-sm bg-amber-50 text-amber-800 px-2 py-1 rounded-full">
                    {mealRecipe?.macros?.calories || 0} kcal
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <div 
                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => mealRecipe && handleOpenRecipe(mealRecipe)}
                  >
                    <img 
                      src={mealRecipe?.imageSrc || imageUrl} 
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 
                      className="font-semibold mb-2 cursor-pointer"
                      onClick={() => mealRecipe && handleOpenRecipe(mealRecipe)}
                    >
                      {meal.name}
                    </h3>
                    
                    <Button
                      variant={meal.consumed ? "outline" : "outline"}
                      size="sm"
                      className={`w-full ${meal.consumed ? 'text-green-600 border-green-600' : ''}`}
                      onClick={() => handleToggleConsumed(meal)}
                    >
                      {meal.consumed ? 'Consumed ✓' : 'Mark as consumed'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 bg-blue-100 rounded-full text-xs">
                    P: {mealRecipe?.macros?.protein || 0}g
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 rounded-full text-xs">
                    C: {mealRecipe?.macros?.carbs || 0}g
                  </span>
                  <span className="px-3 py-1 bg-purple-100 rounded-full text-xs">
                    F: {mealRecipe?.macros?.fat || 0}g
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MealsList;
