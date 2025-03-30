
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; 
import { Heart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [recipeSaved, setRecipeSaved] = useState(isSaved);
  
  if (!recipe) return null;

  // Color definitions for macros
  const macroColors = {
    calories: '#FFF4D7',
    protein: '#DBE9FE',
    carbs: '#FEF9C3',
    fat: '#F3E8FF'
  };
  
  const handleSaveRecipe = async () => {
    if (!recipe.id) return;
    
    setSaving(true);
    try {
      if (recipeSaved) {
        // Remove from saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', recipe.id);
          
        if (error) throw error;
        
        toast({
          title: "Recipe removed",
          description: "Recipe removed from your saved recipes",
        });
        
        setRecipeSaved(false);
      } else {
        // Add to saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .insert([{ recipe_id: recipe.id }]);
          
        if (error) throw error;
        
        toast({
          title: "Recipe saved",
          description: "Recipe added to your saved recipes",
        });
        
        setRecipeSaved(true);
      }
      
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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <div className="h-48 w-full overflow-hidden relative">
          {recipe.imageSrc ? (
            <img 
              src={recipe.imageSrc || '/placeholder.svg'} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveRecipe}
              disabled={saving}
              className="mt-1"
            >
              <Heart 
                size={20} 
                className={recipeSaved ? "text-red-500 fill-current" : "text-red-500"} 
              />
            </Button>
          </div>
          <DrawerDescription>{recipe.description}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4">
          {/* Nutrition Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Nutrition Information</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-amber-50 p-2 rounded-md text-center">
                <div className="text-sm font-medium mb-1">Calories</div>
                <div className="font-bold">{recipe.macros.calories}</div>
                <div className="text-xs">kcal</div>
              </div>
              <div className="bg-blue-50 p-2 rounded-md text-center">
                <div className="text-sm font-medium mb-1">Protein</div>
                <div className="font-bold">{recipe.macros.protein}</div>
                <div className="text-xs">g</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-md text-center">
                <div className="text-sm font-medium mb-1">Carbs</div>
                <div className="font-bold">{recipe.macros.carbs}</div>
                <div className="text-xs">g</div>
              </div>
              <div className="bg-purple-50 p-2 rounded-md text-center">
                <div className="text-sm font-medium mb-1">Fat</div>
                <div className="font-bold">{recipe.macros.fat}</div>
                <div className="text-xs">g</div>
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
            <ol className="list-decimal pl-5 space-y-2">
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
            <Button 
              variant="outline" 
              onClick={handleSaveRecipe}
              disabled={saving}
              className="gap-2"
            >
              <Heart 
                size={16} 
                className={recipeSaved ? "text-red-500 fill-current" : "text-red-500"} 
              />
              {recipeSaved ? "Saved" : "Save"}
            </Button>
            <Button variant="default" onClick={onClose}>Close</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RecipeViewer;
