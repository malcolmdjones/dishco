
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Heart, Filter, Info } from 'lucide-react';
import { recipes } from '../data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SavedRecipesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // In a real app, this would come from a database or API
  const [savedRecipeIds] = useState(['1', '3', '5', '7', '9', '11']);

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
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
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
              <div className="px-3 pb-3 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                >
                  Add to Plan
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedRecipesPage;
