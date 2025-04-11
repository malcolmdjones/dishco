
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CakeSlice, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/recipe-discovery/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';

const ExploreDesserts = () => {
  const navigate = useNavigate();
  const { recipes, loading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDesserts, setFilteredDesserts] = useState([]);

  // Filter for dessert recipes
  useEffect(() => {
    const filtered = recipes
      .filter(recipe => 
        recipe.type === 'dessert' && 
        (searchQuery === '' || 
         recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    setFilteredDesserts(filtered);
  }, [recipes, searchQuery]);

  return (
    <div className="pb-16">
      <div className="sticky top-0 bg-background z-10 pb-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-0 mr-2"
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <CakeSlice className="mr-2 text-purple-500" />
            Desserts
          </h1>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Search for desserts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading desserts...</p>
        </div>
      ) : filteredDesserts.length === 0 ? (
        <div className="text-center py-10">
          <CakeSlice className="mx-auto text-gray-300" size={48} />
          <h3 className="font-medium text-lg mt-4">No desserts found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery ? "Try adjusting your search" : "We don't have any dessert recipes yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredDesserts.map(dessert => (
            <RecipeCard
              key={dessert.id}
              recipe={dessert}
              onToggleSave={(id, saved) => toggleSaveRecipe(id)}
              isSaved={isRecipeSaved(dessert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreDesserts;
