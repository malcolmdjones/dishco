
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cookie, Plus, ArrowLeft } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipe/RecipeCard';
import EmptySnacksState from '@/components/saved-snacks/EmptySnacksState';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const SavedDessertsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { recipes, loading, savedRecipeIds, toggleSaveRecipe } = useRecipes();
  const [desserts, setDesserts] = useState([]);

  useEffect(() => {
    // Filter only dessert items
    if (recipes && recipes.length > 0) {
      const filteredDesserts = recipes.filter(
        recipe => recipe.type === 'dessert' && savedRecipeIds.includes(recipe.id)
      );
      setDesserts(filteredDesserts);
    }
  }, [recipes, savedRecipeIds]);

  const handleToggleSave = async (recipeId) => {
    try {
      await toggleSaveRecipe(recipeId);
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
        <div className="flex items-center gap-2 mb-2">
          <Link to="/saved-recipes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Saved Desserts</h1>
        </div>
        <p className="text-dishco-text-light">Your sweet treats collection</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="space-y-4 w-full">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      ) : desserts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {desserts.map((dessert) => (
            <RecipeCard
              key={dessert.id}
              recipe={dessert}
              onViewEdit={() => navigate(`/recipe/${dessert.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <EmptySnacksState />
          <Button onClick={() => navigate('/explore-desserts')} className="mt-4">
            <Plus size={16} className="mr-1" />
            Find Desserts
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedDessertsPage;
