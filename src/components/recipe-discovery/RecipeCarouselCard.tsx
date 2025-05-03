
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Recipe } from '@/types/Recipe';
import { useNavigate } from 'react-router-dom';
import { Clock, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecipeCarouselCardProps {
  recipe: Recipe;
  onOpenRecipe?: (recipe: Recipe) => void;
  size?: 'large' | 'medium' | 'small';
}

const RecipeCarouselCard = ({ recipe, onOpenRecipe, size = 'medium' }: RecipeCarouselCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onOpenRecipe) {
      onOpenRecipe(recipe);
    }
  };
  
  const sizeClasses = {
    large: 'w-[300px] sm:w-[350px]',
    medium: 'w-[220px] sm:w-[250px]',
    small: 'w-[160px] sm:w-[180px]'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] bg-white`}
      onClick={handleClick}
    >
      <div className="relative">
        <AspectRatio ratio={4/3}>
          <img 
            src={recipe.imageSrc || '/placeholder.svg'} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        
        {recipe.type && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-black">
              {recipe.type}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-lg truncate">{recipe.name}</h3>
        
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          {recipe.cookTime ? (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{recipe.cookTime} min</span>
            </div>
          ) : (
            <div />
          )}
          
          {recipe.requiresCooking && (
            <div className="flex items-center gap-1">
              <ChefHat size={14} />
              <span>Cooking</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-sm">
          <span className="font-medium">{recipe.macros.calories} cal</span>
          <span className="text-gray-500"> • </span>
          <span>{recipe.macros.protein}g protein</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCarouselCard;
