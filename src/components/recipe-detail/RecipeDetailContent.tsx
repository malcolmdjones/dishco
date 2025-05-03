
import React from 'react';
import { isStoreBought } from '@/utils/recipeUtils';
import { Recipe } from '@/data/mockData';

interface RecipeDetailContentProps {
  recipe: Recipe;
}

const RecipeDetailContent: React.FC<RecipeDetailContentProps> = ({ recipe }) => {
  const { 
    name, 
    description, 
    macros, 
    ingredients, 
    instructions, 
    prepTime, 
    cookTime, 
    servings 
  } = recipe;

  const isStoreItem = isStoreBought(recipe);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {!isStoreItem && prepTime !== undefined && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              <div className="font-medium">Prep</div>
              <div>{prepTime} min</div>
            </div>
          )}
          
          {!isStoreItem && cookTime !== undefined && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              <div className="font-medium">Cook</div>
              <div>{cookTime} min</div>
            </div>
          )}
          
          {servings !== undefined && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              <div className="font-medium">Servings</div>
              <div>{servings}</div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Nutrition</h3>
        <div className="grid grid-cols-4 divide-x bg-gray-50 p-3 rounded-lg text-center">
          <div>
            <div className="text-xs text-gray-500">Calories</div>
            <div className="font-medium">{macros?.calories || 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Protein</div>
            <div className="font-medium">{macros?.protein || 0}g</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Carbs</div>
            <div className="font-medium">{macros?.carbs || 0}g</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Fat</div>
            <div className="font-medium">{macros?.fat || 0}g</div>
          </div>
        </div>
      </div>
      
      {!isStoreItem && ingredients && ingredients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
          <ul className="list-disc pl-5 space-y-1">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">
                {typeof ingredient === 'string' 
                  ? ingredient 
                  : ingredient && typeof ingredient === 'object' && 'name' in ingredient 
                    ? ingredient.name 
                    : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isStoreItem && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Store Bought Item</h3>
          <p className="text-sm text-blue-700 mt-1">
            This is a pre-packaged item available for purchase at most grocery stores.
          </p>
        </div>
      )}
      
      {!isStoreItem && instructions && instructions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal pl-5 space-y-3">
            {instructions.map((instruction, index) => (
              <li key={index} className="text-gray-700">
                {typeof instruction === 'string' 
                  ? instruction 
                  : instruction && typeof instruction === 'object' && 'text' in instruction 
                    ? instruction.text 
                    : ''}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailContent;
