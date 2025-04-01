
import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomRecipe } from '@/hooks/useCustomRecipes';

interface RecipeCardProps {
  recipe: CustomRecipe;
  onViewEdit: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onViewEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48 bg-gray-200">
        {recipe.imageUrl && recipe.imageUrl !== '/placeholder.svg' ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {recipe.description || "No description provided"}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-3">{recipe.cookingTime || 0} mins</span>
            <span>{recipe.servings || 1} servings</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewEdit}
          >
            View & Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
