
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Badge from './Badge';

interface RecipeViewerProps {
  recipe: any;
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

  // Color definitions for macros
  const macroColors = {
    calories: '#FFF4D7',
    protein: '#DBE9FE',
    carbs: '#FEF9C3',
    fat: '#F3E8FF'
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <div className="h-48 w-full overflow-hidden relative">
          <img 
            src={recipe.imageSrc || '/placeholder.svg'} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
          <button 
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
            onClick={onClose}
          >
            <X size={18} />
          </button>
          {recipe.type && (
            <div className="absolute top-3 left-3">
              <Badge 
                text={recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1)} 
                variant={recipe.type as any}
              />
            </div>
          )}
        </div>

        <DrawerHeader>
          <div className="flex justify-between items-start">
            <DrawerTitle className="text-2xl">{recipe.name}</DrawerTitle>
            {onToggleSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleSave(recipe.id, isSaved)}
                className="mt-1"
              >
                <Heart 
                  size={20} 
                  className={isSaved ? "text-red-500 fill-current" : "text-red-500"} 
                />
              </Button>
            )}
          </div>
          <DrawerDescription>{recipe.description}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4">
          {/* Nutrition Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Nutrition Information</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2">
                  <CircularProgressbar
                    value={75}
                    text={`${recipe.macros.calories}`}
                    styles={buildStyles({
                      textSize: '28px',
                      pathColor: macroColors.calories,
                      textColor: '#3C3C3C',
                      trailColor: '#F9F9F9',
                    })}
                  />
                </div>
                <span className="text-xs text-center">Calories</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2">
                  <CircularProgressbar
                    value={65}
                    text={`${recipe.macros.protein}g`}
                    styles={buildStyles({
                      textSize: '28px',
                      pathColor: macroColors.protein,
                      textColor: '#3C3C3C',
                      trailColor: '#F9F9F9',
                    })}
                  />
                </div>
                <span className="text-xs text-center">Protein</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2">
                  <CircularProgressbar
                    value={80}
                    text={`${recipe.macros.carbs}g`}
                    styles={buildStyles({
                      textSize: '28px',
                      pathColor: macroColors.carbs,
                      textColor: '#3C3C3C',
                      trailColor: '#F9F9F9',
                    })}
                  />
                </div>
                <span className="text-xs text-center">Carbs</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2">
                  <CircularProgressbar
                    value={60}
                    text={`${recipe.macros.fat}g`}
                    styles={buildStyles({
                      textSize: '28px',
                      pathColor: macroColors.fat,
                      textColor: '#3C3C3C',
                      trailColor: '#F9F9F9',
                    })}
                  />
                </div>
                <span className="text-xs text-center">Fat</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients?.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-4">
              {recipe.instructions?.map((instruction: string, index: number) => (
                <li key={index} className="pl-1">{instruction}</li>
              ))}
            </ol>
          </div>

          {/* Additional Notes */}
          {recipe.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <p className="text-dishco-text-light">{recipe.notes}</p>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            {onToggleSave && (
              <Button 
                variant="outline" 
                onClick={() => onToggleSave(recipe.id, isSaved)}
                className="gap-2"
              >
                <Heart 
                  size={16} 
                  className={isSaved ? "text-red-500 fill-current" : "text-red-500"} 
                />
                {isSaved ? "Saved" : "Save"}
              </Button>
            )}
            <Button variant="default" onClick={onClose}>Close</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RecipeViewer;
