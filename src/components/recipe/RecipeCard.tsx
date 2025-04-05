
import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomRecipe } from '@/hooks/useCustomRecipes';
import { Clock, Users } from 'lucide-react';
import { getRecipeImage } from '@/utils/recipeUtils';

interface RecipeCardProps {
  recipe: CustomRecipe;
  onViewEdit: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onViewEdit }) => {
  const imageUrl = getRecipeImage(recipe.imageUrl);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {recipe.description || "No description provided"}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500 gap-3">
            {recipe.cookingTime && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>{recipe.cookingTime} mins</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
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
