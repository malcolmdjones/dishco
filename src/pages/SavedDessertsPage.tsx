
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, Plus } from 'lucide-react';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipe/RecipeCard';
import EmptySnacksState from '@/components/saved-snacks/EmptySnacksState';
import { useToast } from '@/hooks/use-toast';

const SavedDessertsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { savedRecipes, isLoading, toggleSaved } = useSavedRecipes();
  const [desserts, setDesserts] = useState([]);

  useEffect(() => {
    // Filter only dessert items
    if (savedRecipes && savedRecipes.length > 0) {
      const filteredDesserts = savedRecipes.filter(
        recipe => recipe.type === 'dessert'
      );
      setDesserts(filteredDesserts);
    }
  }, [savedRecipes]);

  const handleToggleSave = async (recipeId) => {
    try {
      await toggleSaved(recipeId);
      toast({
        title: "Recipe Updated",
        description: "The dessert has been removed from your saved collection.",
      });
    } catch (error) {
      console.error('Error updating saved status:', error);
      toast({
        title: "Error",
        description: "Failed to update the recipe's saved status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Saved Desserts</h1>
        <p className="text-dishco-text-light">Your sweet treats collection</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : desserts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {desserts.map((dessert) => (
            <RecipeCard
              key={dessert.id}
              recipe={dessert}
              isSaved={true}
              onToggleSave={() => handleToggleSave(dessert.id)}
              onClick={() => navigate(`/recipe/${dessert.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptySnacksState
          title="No Saved Desserts"
          description="When you save desserts, they will appear here."
          icon={<Cookie size={48} className="text-purple-500 opacity-80" />}
        >
          <Button onClick={() => navigate('/explore-desserts')} className="mt-4">
            <Plus size={16} className="mr-1" />
            Find Desserts
          </Button>
        </EmptySnacksState>
      )}
    </div>
  );
};

export default SavedDessertsPage;
