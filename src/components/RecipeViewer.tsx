
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Heart, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/data/mockData';
import { useRecipes } from '@/hooks/useRecipes';
import { getRecipeImage } from '@/utils/recipeUtils';

// Import the components
import RecipeHeader from './recipe-viewer/RecipeHeader';
import RecipeContent from './recipe-viewer/RecipeContent';
import RecipeFooter from './recipe-viewer/RecipeFooter';

interface RecipeViewerProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (recipeId: string, isSaved: boolean) => Promise<void>;
  isConsumed?: boolean;
  onToggleConsumed?: (recipe: Recipe, isConsumed: boolean) => void;
}

const RecipeViewer: React.FC<RecipeViewerProps> = ({ 
  recipe, 
  isOpen, 
  onClose, 
  isSaved: propIsSaved,
  onToggleSave,
  isConsumed: propIsConsumed,
  onToggleConsumed
}) => {
  const { toast } = useToast();
  const { isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [saving, setSaving] = useState(false);
  const [recipeSaved, setRecipeSaved] = useState(false);
  const [consumed, setConsumed] = useState(false);
  
  useEffect(() => {
    // Use provided value or check from our hook
    if (propIsSaved !== undefined) {
      setRecipeSaved(propIsSaved);
    } else if (recipe?.id) {
      setRecipeSaved(isRecipeSaved(recipe.id));
    }
    
    // Set consumed state from props
    if (propIsConsumed !== undefined) {
      setConsumed(propIsConsumed);
    }
  }, [recipe, propIsSaved, isRecipeSaved, propIsConsumed]);
  
  // Don't render the component if recipe is not available
  if (!recipe) {
    return null;
  }
  
  // Make sure recipe has the required properties
  const validRecipe = recipe.macros ? recipe : {
    ...recipe,
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ...(recipe.macros || {})
    }
  };
  
  const handleSaveRecipe = async () => {
    if (!validRecipe.id) return;
    
    setSaving(true);
    try {
      await toggleSaveRecipe(validRecipe.id);
      setRecipeSaved(!recipeSaved);
      
      // Call parent handler if exists
      if (onToggleSave) {
        await onToggleSave(validRecipe.id, !recipeSaved);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleConsumed = () => {
    if (onToggleConsumed) {
      const newConsumedState = !consumed;
      setConsumed(newConsumedState);
      onToggleConsumed(validRecipe, newConsumedState);
    }
  };

  // Use consistent image handling
  const imageUrl = getRecipeImage(validRecipe.imageSrc);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh] overflow-hidden">
        <RecipeHeader 
          imageUrl={imageUrl}
          recipeName={validRecipe.name}
          recipeType={validRecipe.type}
          onClose={onClose}
        />

        <DrawerHeader>
          <div className="flex justify-between items-start">
            <DrawerTitle className="text-2xl">{validRecipe.name}</DrawerTitle>
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleSaveRecipe}
              disabled={saving}
            >
              <Heart 
                size={20} 
                className={recipeSaved ? "text-red-500 fill-current" : "text-red-500"} 
              />
            </button>
          </div>
          <DrawerDescription>{validRecipe.description}</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <RecipeContent recipe={validRecipe} />
        </div>

        <DrawerFooter>
          <RecipeFooter 
            isSaved={recipeSaved}
            saving={saving}
            onSave={handleSaveRecipe}
            onClose={onClose}
            isConsumed={consumed}
            onToggleConsumed={onToggleConsumed ? handleToggleConsumed : undefined}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RecipeViewer;
