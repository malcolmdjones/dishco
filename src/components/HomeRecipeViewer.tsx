
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RecipeViewer from './RecipeViewer';
import { Recipe } from '@/data/mockData';

interface HomeRecipeViewerProps {
  className?: string;
}

const HomeRecipeViewer: React.FC<HomeRecipeViewerProps> = ({ className }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchSavedRecipes();
    fetchFeaturedRecipes();
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

  const fetchFeaturedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(*),
          recipe_instructions(*),
          recipe_equipment(*)
        `)
        .limit(4);
      
      if (error) {
        console.error('Error fetching featured recipes:', error);
        return;
      }
      
      if (data) {
        const formattedRecipes: Recipe[] = data.map(dbRecipe => ({
          id: dbRecipe.id,
          name: dbRecipe.name,
          type: dbRecipe.meal_type?.toLowerCase() || 'other',
          description: dbRecipe.description || '',
          ingredients: dbRecipe.recipe_ingredients?.map(ing => ing.name) || [],
          instructions: dbRecipe.recipe_instructions?.map(inst => inst.instruction) || [],
          prepTime: dbRecipe.prep_time || 0,
          cookTime: dbRecipe.cook_time || 0,
          servings: dbRecipe.servings || 1,
          macros: {
            calories: dbRecipe.calories || 0,
            protein: dbRecipe.protein || 0,
            carbs: dbRecipe.carbs || 0,
            fat: dbRecipe.fat || 0
          },
          imageSrc: dbRecipe.image_url || '/placeholder.svg',
          requiresBlender: false,
          requiresCooking: true
        }));
        
        setFeaturedRecipes(formattedRecipes);
      }
    } catch (error) {
      console.error('Error fetching featured recipes:', error);
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

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeDrawerOpen(true);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {featuredRecipes.slice(0, 4).map((recipe) => (
          <div 
            key={recipe.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
            onClick={() => handleViewRecipe(recipe)}
          >
            <div className="h-20 w-full">
              <img 
                src={recipe.imageSrc || '/placeholder.svg'} 
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
