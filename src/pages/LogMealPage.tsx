
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Search, Plus, Info } from 'lucide-react';
import { recipes } from '../data/mockData';
import { Input } from '@/components/ui/input';

const LogMealPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogMeal = (recipe: any) => {
    toast({
      title: "Meal Logged",
      description: `${recipe.name} has been added to your daily log.`,
    });
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'snack', name: 'Snack' },
  ];

  return (
    <div className="animate-fade-in pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Log a Meal</h1>
        <p className="text-dishco-text-light">Track what you've eaten today</p>
      </header>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search recipes..."
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

      {/* Custom meal button */}
      <Button 
        variant="outline" 
        className="w-full mb-6 border-dashed justify-start"
        onClick={() => toast({
          title: "Coming Soon",
          description: "Custom meal logging will be available in the next update."
        })}
      >
        <Plus size={18} className="mr-2 text-dishco-primary" />
        Log custom meal (manual entry)
      </Button>

      {/* Recipe list */}
      <div className="space-y-4">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8">
            <Info size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No recipes found</h3>
            <p className="text-dishco-text-light">Try a different search term</p>
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex">
                <div className="w-20 h-20 bg-gray-200">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{recipe.name}</h3>
                      <p className="text-sm text-dishco-text-light line-clamp-1">{recipe.description}</p>
                    </div>
                    <div className="bg-dishco-secondary bg-opacity-20 rounded-full px-2 py-0.5 h-fit">
                      <span className="text-xs font-medium">{recipe.macros.calories} kcal</span>
                    </div>
                  </div>
                  
                  <div className="flex mt-2 space-x-2">
                    <span className="macro-pill macro-pill-protein">P: {recipe.macros.protein}g</span>
                    <span className="macro-pill macro-pill-carbs">C: {recipe.macros.carbs}g</span>
                    <span className="macro-pill macro-pill-fat">F: {recipe.macros.fat}g</span>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleLogMeal(recipe)}
                >
                  Log this meal
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogMealPage;
