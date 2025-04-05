
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomRecipes, CustomRecipe } from '@/hooks/useCustomRecipes';
import { getRecipeImage } from '@/utils/recipeUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditCustomRecipePage = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<CustomRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recipes, deleteRecipe } = useCustomRecipes();

  useEffect(() => {
    if (recipeId && recipes.length > 0) {
      const foundRecipe = recipes.find(r => r.id === recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        toast({
          title: "Recipe Not Found",
          description: "The recipe you are looking for could not be found",
          variant: "destructive"
        });
        navigate('/custom-recipes');
      }
      setIsLoading(false);
    }
  }, [recipeId, recipes, navigate, toast]);

  const handleDelete = async () => {
    if (!recipeId) return;
    
    try {
      await deleteRecipe(recipeId);
      navigate('/custom-recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete the recipe",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex justify-center py-10">
        <p>Recipe not found</p>
      </div>
    );
  }

  const imageUrl = getRecipeImage(recipe.imageUrl);

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/custom-recipes')} 
            className="mr-2"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">View Recipe</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash size={16} className="mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this recipe? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <img 
            src={imageUrl} 
            alt={recipe.title} 
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
          <p className="text-gray-600 mb-4">{recipe.description || "No description provided"}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Cooking Time</p>
              <p className="font-medium">{recipe.cookingTime || 0} mins</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Servings</p>
              <p className="font-medium">{recipe.servings || 1}</p>
            </div>
          </div>

          {recipe.sourceUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Source URL</p>
              <a 
                href={recipe.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {recipe.sourceUrl}
              </a>
            </div>
          )}
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-12 text-sm font-medium">{ingredient.quantity} {ingredient.unit}</span>
                  <span>{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-3">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <div className="mr-3 flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <p>{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {recipe.nutrition && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-3">Nutrition (per serving)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Calories</p>
                <p className="font-medium">{recipe.nutrition.calories || 0} kcal</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Protein</p>
                <p className="font-medium">{recipe.nutrition.protein || 0}g</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Carbs</p>
                <p className="font-medium">{recipe.nutrition.carbs || 0}g</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Fat</p>
                <p className="font-medium">{recipe.nutrition.fat || 0}g</p>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate(`/add-recipe?edit=${recipeId}`)}
          className="w-full"
        >
          Edit Recipe
        </Button>
      </div>
    </div>
  );
};

export default EditCustomRecipePage;
