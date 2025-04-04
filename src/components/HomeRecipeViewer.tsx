
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { recipes } from '@/data/mockData';
import RecipeViewer from './RecipeViewer';

interface HomeRecipeViewerProps {
  className?: string;
}

const HomeRecipeViewer: React.FC<HomeRecipeViewerProps> = ({ className }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const { toast } = useToast();
  // Fixed image URL to avoid 404s
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  React.useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id');
      
      if (error) {
        console.error('Error fetching saved recipes:', error);
        return;
      }
      
      if (data) {
        setSavedRecipeIds(data.map(item => item.recipe_id));
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    }
  };

  const handleToggleSave = async (recipeId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', recipeId);
        
        if (error) {
          console.error('Error removing recipe from saved:', error);
          return;
        }
        
        setSavedRecipeIds(savedRecipeIds.filter(id => id !== recipeId));
        
        toast({
          title: "Recipe Removed",
          description: "Recipe removed from your saved recipes.",
        });
      } else {
        const { error } = await supabase
          .from('saved_recipes')
          .insert([{ recipe_id: recipeId }]);
        
        if (error) {
          console.error('Error saving recipe:', error);
          return;
        }
        
        setSavedRecipeIds([...savedRecipeIds, recipeId]);
        
        toast({
          title: "Recipe Saved",
          description: "Recipe added to your saved recipes.",
        });
      }
    } catch (error) {
      console.error('Error toggling recipe save state:', error);
    }
  };

  const handleViewRecipe = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeDrawerOpen(true);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {recipes.slice(0, 4).map((recipe) => (
          <div 
            key={recipe.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
            onClick={() => handleViewRecipe(recipe.id)}
          >
            <div className="h-20 w-full">
              <img 
                src={imageUrl} 
                alt={recipe.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <h3 className="font-medium text-sm truncate">{recipe.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-dishco-text-light">{recipe.macros.calories} cal</div>
                <div className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded">
                  {recipe.type || 'Recipe'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeDrawerOpen}
          onClose={() => setIsRecipeDrawerOpen(false)}
          isSaved={savedRecipeIds.includes(selectedRecipe.id)}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
};

export default HomeRecipeViewer;
