
import React from 'react';
import { Recipe } from '@/data/mockData';

interface RecipeDetailContentProps {
  recipe: Recipe;
}

const RecipeDetailContent: React.FC<RecipeDetailContentProps> = ({ recipe }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{recipe.name}</h2>
      <p className="text-dishco-text-light mb-4">{recipe.description}</p>
      
      <div className="flex space-x-2 mb-4">
        <span className="px-2 py-1 bg-dishco-primary bg-opacity-10 rounded-md text-xs font-medium text-dishco-primary">
          {recipe.macros.calories} kcal
        </span>
        <span className="px-2 py-1 bg-amber-100 rounded-md text-xs font-medium text-amber-700">
          {recipe.macros.protein}g protein
        </span>
        <span className="px-2 py-1 bg-blue-100 rounded-md text-xs font-medium text-blue-700">
          {recipe.macros.carbs}g carbs
        </span>
        <span className="px-2 py-1 bg-green-100 rounded-md text-xs font-medium text-green-700">
          {recipe.macros.fat}g fat
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Ingredients</h3>
        <ul className="list-disc pl-5 space-y-1">
          {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
            <li key={idx} className="text-sm">{ingredient}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal pl-5 space-y-2">
          {recipe.instructions && recipe.instructions.map((step, idx) => (
            <li key={idx} className="text-sm">{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDetailContent;
