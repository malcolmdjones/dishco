
import React from 'react';
import { Recipe } from '@/data/mockData';
import { CookingPot, Heart, Clock, Users } from 'lucide-react';
import { getRecipeImage } from '@/utils/recipeUtils';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleSave?: (id: string, saved: boolean) => void;
  isSaved?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleSave, isSaved = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-80">
        <img 
          src={getRecipeImage(recipe.imageSrc)} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h3 className="text-2xl font-bold">{recipe.name}</h3>
          <p className="line-clamp-2 text-white/80">{recipe.description}</p>
        </div>
        
        {onToggleSave && (
          <button 
            className={`absolute top-4 right-4 p-2 rounded-full ${isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(recipe.id, !isSaved);
            }}
          >
            <Heart size={20} className={isSaved ? 'fill-current' : ''} />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            {recipe.requiresCooking && (
              <div className="flex items-center mr-3 text-sm text-gray-500">
                <CookingPot size={18} className="mr-1" />
                <span>Cooking Required</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          {recipe.cookTime > 0 && (
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{recipe.cookTime} min</span>
            </div>
          )}
          {recipe.servings > 0 && (
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              {recipe.macros.calories} kcal
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {recipe.macros.protein}g protein
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
