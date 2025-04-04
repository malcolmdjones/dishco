
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/data/mockData';
import { useRecipes } from '@/hooks/useRecipes';

// Import the new components
import RecipeHeader from './recipe-viewer/RecipeHeader';
import RecipeContent from './recipe-viewer/RecipeContent';
import RecipeFooter from './recipe-viewer/RecipeFooter';

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
  isSaved: propIsSaved,
  onToggleSave
}) => {
  const { toast } = useToast();
  const { isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [saving, setSaving] = useState(false);
  const [recipeSaved, setRecipeSaved] = useState(false);
  
  useEffect(() => {
    // Use provided value or check from our hook
    if (propIsSaved !== undefined) {
      setRecipeSaved(propIsSaved);
    } else if (recipe?.id) {
      setRecipeSaved(isRecipeSaved(recipe.id));
    }
  }, [recipe, propIsSaved, isRecipeSaved]);
  
  if (!recipe) return null;
  
  const handleSaveRecipe = async () => {
    if (!recipe.id) return;
    
    setSaving(true);
    try {
      await toggleSaveRecipe(recipe.id);
      setRecipeSaved(!recipeSaved);
      
      // Call parent handler if exists
      if (onToggleSave) {
        await onToggleSave(recipe.id, !recipeSaved);
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

  // Use a consistent image
  const imageUrl = recipe.imageSrc || "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <RecipeHeader 
          imageUrl={imageUrl}
          recipeName={recipe.name}
          recipeType={recipe.type}
          onClose={onClose}
        />

        <DrawerHeader>
          <div className="flex justify-between items-start">
            <DrawerTitle className="text-2xl">{recipe.name}</DrawerTitle>
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
          <DrawerDescription>{recipe.description}</DrawerDescription>
        </DrawerHeader>

        <RecipeContent recipe={recipe} />

        <DrawerFooter>
          <RecipeFooter 
            isSaved={recipeSaved}
            saving={saving}
            onSave={handleSaveRecipe}
            onClose={onClose}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RecipeViewer;
