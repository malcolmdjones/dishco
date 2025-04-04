
import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomRecipe } from '@/hooks/useCustomRecipes';
import { Clock, Users } from 'lucide-react';

interface RecipeCardProps {
  recipe: CustomRecipe;
  onViewEdit: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onViewEdit }) => {
  // Always use the provided Unsplash image instead of possibly broken imageUrl
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

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
