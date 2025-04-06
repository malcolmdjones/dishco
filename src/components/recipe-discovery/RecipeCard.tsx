
import React from 'react';
import { Recipe } from '@/data/mockData';
import { CookingPot, Heart, Clock, Users } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-80">
        <img 
          src={recipe.imageSrc || "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h3 className="text-2xl font-bold">{recipe.name}</h3>
          <p className="line-clamp-2 text-white/80">{recipe.description}</p>
        </div>
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
