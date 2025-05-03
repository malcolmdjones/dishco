
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Unlock, Info } from 'lucide-react';
import { Recipe } from '@/types/Recipe';
import { getRecipeImage } from '@/utils/recipeUtils';

interface MealCardProps {
  title: string;
  meal: Recipe | null;
  isLocked: boolean;
  toggleLock: () => void;
  onAddFromVault: () => void;
  onMealClick: (recipe: Recipe) => void;
  isDraggable?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({
  title,
  meal,
  isLocked,
  toggleLock,
  onAddFromVault,
  onMealClick,
  isDraggable = false
}) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${isLocked ? 'border-2 border-green-500' : ''}`}>
        {meal ? (
          <div className={`cursor-pointer ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`} onClick={() => onMealClick(meal)}>
            {/* Image Section - Using dynamic image from recipe */}
            <div className="relative h-48 bg-gray-100">
              <img 
                src={getRecipeImage(meal.imageSrc)} 
                alt={meal.name} 
                className="w-full h-full object-cover"
              />
              
              {/* Calorie Badge */}
              <div className="absolute bottom-3 right-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {meal.macros.calories} kcal
              </div>
              
              {/* Lock/Unlock and Add Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className={`h-8 w-8 rounded-full bg-white shadow-md ${isLocked ? 'text-green-500' : 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock();
                  }}
                >
                  {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white shadow-md text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFromVault();
                  }}
                >
                  <Info size={14} />
                </Button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4">
              <h4 className="font-medium text-lg mb-1">{meal.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{meal.description}</p>
              
              {/* Macros */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  P: {meal.macros.protein}g
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  C: {meal.macros.carbs}g
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  F: {meal.macros.fat}g
                </span>
              </div>
              {isDraggable && !isLocked && (
                <div className="mt-2 text-xs text-gray-400">
                  Drag to move
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gray-50 flex flex-col items-center justify-center p-4">
            <Button 
              variant="outline" 
              className="mb-2"
              onClick={onAddFromVault}
            >
              <Plus size={18} className="mr-2" />
              Add {title.toLowerCase()}
            </Button>
            <p className="text-gray-400 text-sm">No {title.toLowerCase()} selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard;
