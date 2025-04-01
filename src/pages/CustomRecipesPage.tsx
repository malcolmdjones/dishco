
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CustomRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  servings: number;
  createdAt: string;
}

const CustomRecipesPage = () => {
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomRecipes();
  }, []);

  const fetchCustomRecipes = () => {
    setIsLoading(true);
    try {
      // Load from localStorage for now
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('Error loading custom recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load your custom recipes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-lg font-medium mb-2">No custom recipes yet</h2>
          <p className="text-gray-500 mb-4">Start adding your own recipes to build your collection.</p>
          <Button 
            onClick={() => navigate('/add-recipe')}
            className="mx-auto"
          >
            <Plus size={18} className="mr-2" />
            Add First Recipe
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative h-48 bg-gray-200">
                {recipe.imageUrl && recipe.imageUrl !== '/placeholder.svg' ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {recipe.description || "No description provided"}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-3">{recipe.cookingTime || 0} mins</span>
                    <span>{recipe.servings || 1} servings</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                  >
                    View & Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomRecipesPage;
