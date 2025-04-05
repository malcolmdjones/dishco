
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomRecipes } from '@/hooks/useCustomRecipes';
import RecipeCard from '@/components/recipe/RecipeCard';
import EmptyRecipeState from '@/components/recipe/EmptyRecipeState';

const CustomRecipesPage = () => {
  const navigate = useNavigate();
  const { recipes, isLoading } = useCustomRecipes();

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/more')} 
            className="mr-2"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Custom Recipes</h1>
        </div>
        <Button
          onClick={() => navigate('/add-recipe')}
          size="sm"
          className="flex items-center"
          aria-label="Add new recipe"
        >
          <Plus size={18} className="mr-1" />
          Add New
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading your recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <EmptyRecipeState onAddRecipe={() => navigate('/add-recipe')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={{
                id: recipe.id,
                name: recipe.title,
                description: recipe.description,
                imageSrc: recipe.imageUrl,
                type: 'custom',
                servings: recipe.servings,
                cookTime: recipe.cookingTime,
                macros: { calories: 0, protein: 0, carbs: 0, fat: 0 }
              }}
              onViewEdit={() => navigate(`/edit-recipe/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomRecipesPage;
