
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash, Search, Loader2, ArrowLeft, Eye, Edit, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RecipeViewer from '@/components/RecipeViewer';
import { Recipe } from '@/data/mockData';

const AddExternalRecipePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  
  useEffect(() => {
    fetchCustomRecipes();
  }, []);

  useEffect(() => {
    // Filter recipes based on search query
    if (searchQuery.trim() === '') {
      setFilteredRecipes(customRecipes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRecipes(
        customRecipes.filter(recipe => 
          recipe.name.toLowerCase().includes(query) || 
          recipe.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, customRecipes]);

  const fetchCustomRecipes = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from local storage first (for demonstration)
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      
      // Convert to Recipe format
      const formattedRecipes: Recipe[] = savedRecipes.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        description: recipe.description,
        type: 'other',
        ingredients: recipe.ingredients.map((ing: any) => ing.name),
        instructions: recipe.instructions,
        prepTime: 0,
        cookTime: parseInt(recipe.cookingTime) || 0,
        servings: parseInt(recipe.servings) || 1,
        macros: {
          calories: parseInt(recipe.nutrition.calories) || 0,
          protein: parseInt(recipe.nutrition.protein) || 0,
          carbs: parseInt(recipe.nutrition.carbs) || 0,
          fat: parseInt(recipe.nutrition.fat) || 0
        },
        imageSrc: recipe.imageUrl || '/placeholder.svg',
        cuisineType: 'other',
        priceRange: '$',
        isHighProtein: false,
        equipment: [],
        requiresBlender: false,
        requiresCooking: true
      }));
      
      setCustomRecipes(formattedRecipes);
      setFilteredRecipes(formattedRecipes);
    } catch (error: any) {
      toast({
        title: 'Error fetching custom recipes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      const updatedRecipes = savedRecipes.filter((recipe: any) => recipe.id !== recipeId);
      localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
      
      setCustomRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      toast({
        title: 'Recipe deleted',
        description: 'Custom recipe has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting recipe',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
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
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Custom Recipes</h1>
            <p className="text-dishco-text-light">View and manage your personal recipe collection</p>
          </div>
        </div>
        <Button onClick={() => navigate('/custom-recipe/new')}>
          <Plus size={16} className="mr-2" /> Add New
        </Button>
      </header>

      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search custom recipes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No custom recipes found</p>
          <Button 
            onClick={() => navigate('/custom-recipe/new')} 
            variant="secondary"
          >
            <Plus size={16} className="mr-2" /> Add your first custom recipe
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map(recipe => (
            <Card key={recipe.id} className="overflow-hidden">
              {recipe.imageSrc && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1">{recipe.name}</h3>
                {recipe.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.macros.calories > 0 && (
                    <span className="text-xs px-2 py-1 bg-amber-100 rounded-md">
                      {recipe.macros.calories} cal
                    </span>
                  )}
                  {recipe.macros.protein > 0 && (
                    <span className="text-xs px-2 py-1 bg-blue-100 rounded-md">
                      {recipe.macros.protein}g protein
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between mt-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewRecipe(recipe)}
                      className="flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => navigate(`/custom-recipe/new?edit=${recipe.id}`)}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 flex items-center"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <Trash size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recipe Viewer Dialog */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default AddExternalRecipePage;
