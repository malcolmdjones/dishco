
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Clock, Utensils, Users, Heart } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface RecipeViewerProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (recipeId: string, isSaved: boolean) => Promise<void>;
}

const RecipeViewer: React.FC<RecipeViewerProps> = ({ 
  recipe, 
  isOpen, 
  onClose, 
  isSaved = false,
  onToggleSave
}) => {
  if (!recipe) return null;

  const handleToggleSave = async () => {
    if (onToggleSave) {
      await onToggleSave(recipe.id, isSaved);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto overflow-x-hidden p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={recipe.imageSrc || '/placeholder.svg'} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
          <button 
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          
          {onToggleSave && (
            <button 
              className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-full"
              onClick={handleToggleSave}
            >
              <Heart 
                size={20} 
                className={isSaved ? "fill-red-500 text-red-500" : "text-gray-700"}
              />
            </button>
          )}
        </div>
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
          <p className="text-gray-600 text-sm mt-1">{recipe.description}</p>
        </DialogHeader>
        
        <div className="px-6">
          {/* Recipe Stats */}
          <div className="flex justify-between items-center py-3 border-y border-gray-100">
            <div className="flex items-center">
              <Clock size={16} className="text-gray-400 mr-1.5" />
              <span className="text-sm">
                <strong>{(recipe.prepTime || 0) + (recipe.cookTime || 0)}</strong> min total
              </span>
            </div>
            
            <div className="flex items-center">
              <Utensils size={16} className="text-gray-400 mr-1.5" />
              <span className="text-sm">
                <strong>{recipe.type}</strong>
              </span>
            </div>
            
            <div className="flex items-center">
              <Users size={16} className="text-gray-400 mr-1.5" />
              <span className="text-sm">
                <strong>{recipe.servings || 1}</strong> servings
              </span>
            </div>
          </div>
          
          {/* Macros */}
          <div className="grid grid-cols-4 py-3 border-b border-gray-100">
            <div className="text-center">
              <p className="text-lg font-semibold">{recipe.macros.calories}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{recipe.macros.protein}g</p>
              <p className="text-xs text-gray-500">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{recipe.macros.carbs}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{recipe.macros.fat}g</p>
              <p className="text-xs text-gray-500">Fat</p>
            </div>
          </div>
          
          {/* Ingredients */}
          <div className="py-4">
            <h3 className="font-semibold mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          {/* Instructions */}
          <div className="py-4">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-sm">{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
        
        <div className="p-6 pt-2">
          <Button 
            className="w-full" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeViewer;
