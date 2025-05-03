
import React, { useState, useEffect } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/types/Recipe';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, ChevronsRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RecipeViewer from '@/components/RecipeViewer';
import { getRecipeImage } from '@/utils/recipeUtils';

const RecipeTinderPage = () => {
  const { recipes, loading, toggleSaveRecipe, isRecipeSaved } = useRecipes();
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [remainingRecipes, setRemainingRecipes] = useState<Recipe[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const { toast } = useToast();

  // Initialize with recipes when they load
  useEffect(() => {
    if (recipes.length > 0 && remainingRecipes.length === 0) {
      // Shuffle the recipes
      const shuffled = [...recipes].sort(() => 0.5 - Math.random());
      setRemainingRecipes(shuffled.slice(1));
      setCurrentRecipe(shuffled[0]);
    }
  }, [recipes]);

  const handleLike = async () => {
    if (!currentRecipe) return;
    
    setIsSwiping(true);
    
    try {
      // Like animation
      setTimeout(() => {
        // Save the recipe
        toggleSaveRecipe(currentRecipe.id);
        
        toast({
          title: "Recipe saved!",
          description: `${currentRecipe.name} has been added to your saved recipes.`
        });
        
        // Move to next recipe
        nextRecipe();
      }, 300);
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleDislike = () => {
    if (!currentRecipe) return;
    
    setIsSwiping(true);
    
    // Dislike animation
    setTimeout(() => {
      nextRecipe();
    }, 300);
  };

  const nextRecipe = () => {
    if (remainingRecipes.length === 0) {
      setCurrentRecipe(null);
      return;
    }
    
    setCurrentRecipe(remainingRecipes[0]);
    setRemainingRecipes(remainingRecipes.slice(1));
    setIsSwiping(false);
  };

  const handleSkip = () => {
    nextRecipe();
  };

  const handleOpenRecipe = () => {
    if (currentRecipe) {
      setIsViewerOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Recipe Finder</h1>
      
      {currentRecipe ? (
        <div className={`transition-transform duration-300 ${isSwiping ? 'translate-x-full opacity-0' : ''}`}>
          <Card className="overflow-hidden relative h-[500px] shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${getRecipeImage(currentRecipe.imageSrc)})` }}
              onClick={handleOpenRecipe}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
            
            <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{currentRecipe.name}</h2>
              <p className="line-clamp-2 text-sm text-white/90 mb-2">{currentRecipe.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-yellow-500/80 text-white rounded-full text-xs">
                  {currentRecipe.macros.calories} kcal
                </span>
                <span className="px-2 py-1 bg-green-500/80 text-white rounded-full text-xs">
                  {currentRecipe.macros.protein}g protein
                </span>
                {currentRecipe.cookTime && (
                  <span className="px-2 py-1 bg-blue-500/80 text-white rounded-full text-xs">
                    {currentRecipe.cookTime} min
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="destructive"
                  className="rounded-full h-14 w-14 shadow-lg"
                  onClick={handleDislike}
                >
                  <X size={24} />
                </Button>
                
                <Button 
                  variant="secondary"
                  className="rounded-full h-10 w-10 shadow-lg"
                  onClick={handleSkip}
                >
                  <ChevronsRight size={20} />
                </Button>
                
                <Button 
                  className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg"
                  onClick={handleLike}
                >
                  <Heart size={24} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            {remainingRecipes.length} more recipes to discover
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-medium text-gray-600 mb-4">You've seen all recipes!</h2>
          <Button 
            onClick={() => {
              const shuffled = [...recipes].sort(() => 0.5 - Math.random());
              setRemainingRecipes(shuffled.slice(1));
              setCurrentRecipe(shuffled[0]);
            }}
          >
            Start Over
          </Button>
        </div>
      )}
      
      {currentRecipe && (
        <RecipeViewer
          recipe={currentRecipe}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          isSaved={isRecipeSaved(currentRecipe.id)}
          onToggleSave={async (id, saved) => {
            await toggleSaveRecipe(id);
            return Promise.resolve();
          }}
        />
      )}
    </div>
  );
};

export default RecipeTinderPage;
