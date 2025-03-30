
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Heart, Eye, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { recipes } from '../data/mockData';
import { supabase } from '@/integrations/supabase/client';
import RecipeDetail from '@/components/RecipeDetail';

const SavedRecipesPage = () => {
  const { toast } = useToast();
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id');
      
      if (error) {
        console.error('Error fetching saved recipes:', error);
        return;
      }
      
      if (data) {
        setSavedRecipeIds(data.map(item => item.recipe_id));
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('recipe_id', recipeId);
      
      if (error) {
        console.error('Error removing recipe from saved:', error);
        return;
      }
      
      setSavedRecipeIds(savedRecipeIds.filter(id => id !== recipeId));
      toast({
        title: "Recipe Removed",
        description: "Recipe removed from your saved recipes.",
      });
    } catch (error) {
      console.error('Error removing recipe from saved:', error);
    }
  };

  const handleViewDetails = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
  };

  const handleCloseDetails = () => {
    setSelectedRecipeId(null);
  };

  const handleToggleSave = (recipeId: string, isSaved: boolean) => {
    if (!isSaved) {
      setSavedRecipeIds(savedRecipeIds.filter(id => id !== recipeId));
    } else {
      if (!savedRecipeIds.includes(recipeId)) {
        setSavedRecipeIds([...savedRecipeIds, recipeId]);
      }
    }
  };

  const filteredRecipes = recipes.filter(recipe => 
    savedRecipeIds.includes(recipe.id) && 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Saved Recipes</h1>
          <p className="text-dishco-text-light">Your favorite recipes collection</p>
        </div>
      </header>

      <div className="relative mb-6">
        <Input
          placeholder="Search saved recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        {searchTerm && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            onClick={() => setSearchTerm('')}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p>Loading saved recipes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Heart size={30} className="text-gray-400" />
          </div>
          {searchTerm ? (
            <>
              <h2 className="text-xl font-semibold mb-2">No recipes found</h2>
              <p className="text-dishco-text-light text-center mb-4">
                We couldn't find any saved recipes matching "{searchTerm}"
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">No saved recipes yet</h2>
              <p className="text-dishco-text-light text-center mb-4">
                Heart your favorite recipes to save them here
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in"
            >
              <div className="h-40 relative">
                <img 
                  src={recipe.imageSrc} 
                  alt={recipe.name} 
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                  onClick={() => handleUnsave(recipe.id)}
                >
                  <Heart size={18} className="text-red-500 fill-current" />
                </button>
                
                {recipe.type && (
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={recipe.type === 'homemade' ? 'default' : 
                              recipe.type === 'takeout' ? 'secondary' : 'outline'}
                      className={recipe.type === 'homemade' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                                recipe.type === 'takeout' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 
                                'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                    >
                      {recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1)}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-medium mb-1">{recipe.name}</h3>
                <p className="text-sm text-dishco-text-light mb-3 line-clamp-2">
                  {recipe.description}
                </p>
                
                <div className="flex space-x-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {recipe.macros.calories} cal
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {recipe.macros.protein}g protein
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUnsave(recipe.id)}
                    className="text-xs"
                  >
                    <Heart size={14} className="text-red-500 fill-current mr-1" />
                    Unsave
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleViewDetails(recipe.id)}
                    className="text-xs"
                  >
                    <Eye size={14} className="mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipeId && (
        <RecipeDetail 
          recipeId={selectedRecipeId} 
          onClose={handleCloseDetails} 
          onToggleSave={handleToggleSave}
          isSaved={true}
        />
      )}
    </div>
  );
};

export default SavedRecipesPage;
