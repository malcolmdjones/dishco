
import React from 'react';
import { Recipe } from '@/data/mockData';
import NutritionInfo from './NutritionInfo';

interface RecipeContentProps {
  recipe: Recipe;
}

const RecipeContent: React.FC<RecipeContentProps> = ({ recipe }) => {
  return (
    <div className="px-4">
      {/* Nutrition Information */}
      <NutritionInfo macros={recipe.macros} />

      {/* Ingredients */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {recipe.ingredients.map((ingredient: string, index: number) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No ingredients listed for this recipe.</p>
        )}
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Instructions</h3>
        {recipe.instructions && recipe.instructions.length > 0 ? (
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.instructions.map((instruction: string, index: number) => (
              <li key={index} className="pl-1">{instruction}</li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500">No instructions provided for this recipe.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeContent;
