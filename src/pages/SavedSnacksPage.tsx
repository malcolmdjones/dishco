
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import SnackCard from '@/components/saved-snacks/SnackCard';
import EmptySnacksState from '@/components/saved-snacks/EmptySnacksState';
import RecipeViewer from '@/components/RecipeViewer';
import { Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';

const SavedSnacksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { recipes, loading, savedRecipeIds, toggleSaveRecipe, isRecipeSaved } = useRecipes();
  
  // For viewing recipe details
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  
  // Filter recipes that are snacks and saved
  const savedSnacks = recipes
    .filter(recipe => recipe.type === 'snack' && savedRecipeIds.includes(recipe.id));
  
  const filteredSnacks = savedSnacks.filter(snack => 
    snack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveFavorite = async (id: string) => {
    await toggleSaveRecipe(id);
    toast({
      title: "Snack removed",
      description: "The snack has been removed from your favorites.",
    });
  };

  const handleSnackClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/more')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Saved Snacks</h1>
          <p className="text-dishco-text-light">Your favorite snacks collection</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search saved snacks..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-4 focus:border-dishco-primary focus:outline-none focus:ring-2 focus:ring-dishco-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading saved snacks...</p>
        </div>
      ) : (
        <>
          {/* Snacks Grid */}
          {filteredSnacks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredSnacks.map((snack) => (
                <div key={snack.id} onClick={() => handleSnackClick(snack)}>
                  <SnackCard 
                    id={snack.id}
                    name={snack.name}
                    imageSrc={getRecipeImage(snack.imageSrc)}
                    calories={snack.macros.calories}
                    onRemove={(id) => {
                      // Don't propagate the click to the parent when removing
                      handleRemoveFavorite(id);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptySnacksState />
          )}
        </>
      )}
      
      {/* Recipe Viewer */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
          onToggleSave={async (recipeId, isSaved) => {
            await toggleSaveRecipe(recipeId);
          }}
          isSaved={selectedRecipe ? isRecipeSaved(selectedRecipe.id) : false}
        />
      )}
    </div>
  );
};

export default SavedSnacksPage;
