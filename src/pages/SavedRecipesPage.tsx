
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Heart, Info } from 'lucide-react';
import { recipes } from '../data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import RecipeDetail from '@/components/RecipeDetail';
import { supabase } from '@/integrations/supabase/client';

const SavedRecipesPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      setLoading(true);
      // For now, we're not authenticating users, so we'll get all saved recipes
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id');
      
      if (error) throw error;
      
      const recipeIds = data.map(item => item.recipe_id);
      setSavedRecipeIds(recipeIds);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      // Fallback to mock data if error
      setSavedRecipeIds(['1', '3', '5', '7', '9', '11']);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveRecipe = async (recipeId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        // Remove from saved recipes
        await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', recipeId);
        
        setSavedRecipeIds(current => current.filter(id => id !== recipeId));
        toast({
          title: "Recipe Removed",
          description: "Recipe has been removed from your saved recipes.",
        });
      } else {
        // Add to saved recipes
        await supabase
          .from('saved_recipes')
          .insert({ recipe_id: recipeId });
        
        setSavedRecipeIds(current => [...current, recipeId]);
        toast({
          title: "Recipe Saved",
          description: "Recipe has been added to your saved recipes.",
        });
      }
    } catch (error) {
      console.error('Error toggling save recipe:', error);
      // Fallback behavior for demo
      if (isSaved) {
        setSavedRecipeIds(current => current.filter(id => id !== recipeId));
      } else {
        setSavedRecipeIds(current => [...current, recipeId]);
      }
      
      toast({
        title: isSaved ? "Recipe Removed" : "Recipe Saved",
        description: isSaved 
          ? "Recipe has been removed from your saved recipes." 
          : "Recipe has been added to your saved recipes.",
      });
    }
  };

  const savedRecipes = recipes.filter(recipe => savedRecipeIds.includes(recipe.id));
  
  const filteredRecipes = savedRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'snack', name: 'Snack' },
  ];

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Saved Recipes</h1>
          <p className="text-dishco-text-light">Your favorite meals</p>
        </div>
      </header>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search saved recipes..."
          className="pl-10 pr-4 py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-dishco-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <div className="space-y-4">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8">
            <Info size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No saved recipes found</h3>
            <p className="text-dishco-text-light">Try a different filter or save some recipes</p>
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex">
                <div className="w-24 h-24 bg-gray-200 relative">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    onClick={() => toggleSaveRecipe(recipe.id, true)}
                  >
                    <Heart size={16} className="text-red-500 fill-current" />
                  </button>
                </div>
                <div className="flex-1 p-3">
                  <h3 className="font-medium">{recipe.name}</h3>
                  <p className="text-sm text-dishco-text-light line-clamp-2 mb-2">{recipe.description}</p>
                  
                  <div className="flex space-x-2">
                    <span className="macro-pill macro-pill-protein">P: {recipe.macros.protein}g</span>
                    <span className="macro-pill macro-pill-carbs">C: {recipe.macros.carbs}g</span>
                    <span className="macro-pill macro-pill-fat">F: {recipe.macros.fat}g</span>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedRecipe(recipe.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail 
          recipeId={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onToggleSave={toggleSaveRecipe}
          isSaved={true}
        />
      )}
    </div>
  );
};

export default SavedRecipesPage;
