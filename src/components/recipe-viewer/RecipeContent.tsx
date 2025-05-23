
import React from 'react';
import { Recipe } from '@/data/mockData';
import NutritionInfo from './NutritionInfo';

interface RecipeContentProps {
  recipe: Recipe;
}

const RecipeContent: React.FC<RecipeContentProps> = ({ recipe }) => {
  // Add null check for recipe
  if (!recipe) {
    return <div>Recipe information not available</div>;
  }

  return (
    <div>
      {/* Nutrition Information - ensure macros exists */}
      {recipe.macros && <NutritionInfo macros={recipe.macros} />}

      {/* Ingredients */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {recipe.ingredients.map((ingredient, index) => {
              // Handle both string ingredients and object ingredients
              if (typeof ingredient === 'string') {
                return <li key={index}>{ingredient}</li>;
              } else if (typeof ingredient === 'object' && ingredient !== null) {
                // Handle structured ingredient objects
                if ('quantity' in ingredient && 'name' in ingredient) {
                  const { quantity, unit, name } = ingredient as { quantity: string, unit?: string, name: string };
                  return <li key={index}>{quantity} {unit || ''} {name}</li>;
                } else if ('quantity' in ingredient && 'ingredient' in ingredient) {
                  const { quantity, ingredient: ingredientName } = ingredient as { quantity: string, ingredient: string };
                  return <li key={index}>{quantity} {ingredientName}</li>;
                }
              }
              // Fallback for any other format
              return <li key={index}>{String(ingredient)}</li>;
            })}
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
            {recipe.instructions.map((instruction, index) => {
              // Handle both string instructions and potential object instructions
              if (typeof instruction === 'string') {
                return <li key={index} className="pl-1">{instruction}</li>;
              } else if (typeof instruction === 'object' && instruction !== null) {
                // Handle structured instruction objects
                if ('step' in instruction) {
                  return <li key={index} className="pl-1">{(instruction as {step: string}).step}</li>;
                }
              }
              // Fallback for any other format
              return <li key={index} className="pl-1">{String(instruction)}</li>;
            })}
          </ol>
        ) : (
          <p className="text-gray-500">No instructions provided for this recipe.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeContent;
