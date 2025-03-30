
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Unlock, CookingPot, Zap, Blend } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface MealCardProps {
  title: string;
  meal: Recipe | null;
  isLocked: boolean;
  toggleLock: () => void;
  onAddFromVault: () => void;
  onMealClick: (recipe: Recipe) => void;
}

const MealCard: React.FC<MealCardProps> = ({
  title,
  meal,
  isLocked,
  toggleLock,
  onAddFromVault,
  onMealClick
}) => {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${isLocked ? 'border-2 border-green-500 animate-pulse' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${isLocked ? 'text-green-500' : ''}`}
            onClick={toggleLock}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onAddFromVault}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
      
      {meal ? (
        <div 
          className="cursor-pointer" 
          onClick={() => onMealClick(meal)}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{meal.name}</h4>
            <div className="flex gap-1">
              {meal.requiresBlender && (
                <span className="text-gray-500" title="Requires blender">
                  <Blend size={14} />
                </span>
              )}
              {meal.requiresCooking && (
                <span className="text-gray-500" title="Requires cooking">
                  <CookingPot size={14} />
                </span>
              )}
              {meal.cookTime && meal.cookTime <= 15 && (
                <span className="text-amber-500" title="Quick to prepare">
                  <Zap size={14} />
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{meal.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              {meal.macros.calories} kcal
            </span>
            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                P: {meal.macros.protein}g
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                C: {meal.macros.carbs}g
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                F: {meal.macros.fat}g
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
          <p className="text-gray-400 text-sm">No {title.toLowerCase()} selected</p>
        </div>
      )}
    </div>
  );
};

export default MealCard;
