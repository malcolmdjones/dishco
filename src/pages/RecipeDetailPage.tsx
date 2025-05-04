
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeDetail from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, getRecipeById } = useRecipes();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/explore-recipes');
      return;
    }

    const loadRecipe = async () => {
      setLoading(true);
      try {
        const recipeData = getRecipeById(id);
        
        if (!recipeData) {
          // Recipe not found
          navigate('/explore-recipes');
          return;
        }
        
        setRecipe(recipeData);
      } catch (error) {
        console.error('Error loading recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, getRecipeById, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        <div className="text-center py-8">
          <h2 className="text-xl font-bold mb-2">Recipe Not Found</h2>
          <p className="text-dishco-text-light">The recipe you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RecipeDetail
        recipeId={recipe.id}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default RecipeDetailPage;
