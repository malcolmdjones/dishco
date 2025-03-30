
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { recipes as allRecipes, Recipe } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import RecipeViewer from '@/components/RecipeViewer';

// Filter definitions
interface FilterOption {
  id: string;
  name: string;
  options?: {
    id: string;
    name: string;
  }[];
}

const ExploreRecipesPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleRecipes, setVisibleRecipes] = useState(12); // For lazy loading
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState<{[key: string]: string[]}>({
    priceRange: [],
    cookTime: [],
    mealType: [],
    cuisineType: [],
    equipment: [],
    calorieRange: [],
    dietaryNeeds: [],
  });

  // Filter options
  const filterCategories: FilterOption[] = [
    {
      id: 'priceRange',
      name: 'Price Range',
      options: [
        { id: 'low', name: '$' },
        { id: 'medium', name: '$$' },
        { id: 'high', name: '$$$' },
      ]
    },
    {
      id: 'cookTime',
      name: 'Cook Time',
      options: [
        { id: 'quick', name: 'Under 15 min' },
        { id: 'medium', name: '15-30 min' },
        { id: 'long', name: 'Over 30 min' },
      ]
    },
    {
      id: 'mealType',
      name: 'Meal Type',
      options: [
        { id: 'breakfast', name: 'Breakfast' },
        { id: 'lunch', name: 'Lunch' },
        { id: 'dinner', name: 'Dinner' },
        { id: 'snack', name: 'Snack' },
      ]
    },
    {
      id: 'cuisineType',
      name: 'Cuisine',
      options: [
        { id: 'indian', name: 'Indian' },
        { id: 'mexican', name: 'Mexican' },
        { id: 'american', name: 'American' },
        { id: 'italian', name: 'Italian' },
        { id: 'asian', name: 'Asian' },
      ]
    },
    {
      id: 'equipment',
      name: 'Equipment',
      options: [
        { id: 'oven', name: 'Oven' },
        { id: 'stove', name: 'Stovetop' },
        { id: 'airfryer', name: 'Air Fryer' },
        { id: 'blender', name: 'Blender' },
      ]
    },
    {
      id: 'calorieRange',
      name: 'Calories',
      options: [
        { id: '0-200', name: '0-200 cal' },
        { id: '200-400', name: '200-400 cal' },
        { id: '400-600', name: '400-600 cal' },
        { id: '600+', name: '600+ cal' },
      ]
    },
    {
      id: 'dietaryNeeds',
      name: 'Dietary Needs',
      options: [
        { id: 'highProtein', name: 'High Protein' },
        { id: 'keto', name: 'Keto' },
        { id: 'vegan', name: 'Vegan' },
        { id: 'vegetarian', name: 'Vegetarian' },
        { id: 'pescatarian', name: 'Pescatarian' },
      ]
    },
  ];

  // Load recipes with delay to simulate API call
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setRecipes(allRecipes);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter recipes based on search and filters
  const filteredRecipes = recipes.filter(recipe => {
    // Search filter
    const matchesSearch = 
      searchQuery === '' || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if any filters are active
    const hasActiveFilters = Object.values(activeFilters).some(filters => filters.length > 0);
    
    // If no filters active and matches search, include it
    if (!hasActiveFilters) {
      return matchesSearch;
    }
    
    // Helper function to check if recipe matches a specific filter category
    const matchesFilterCategory = (category: string): boolean => {
      // If no filters in this category are selected, it passes
      if (activeFilters[category].length === 0) {
        return true;
      }
      
      // Check specific filter logic based on category
      switch (category) {
        case 'mealType':
          return activeFilters.mealType.includes(recipe.type || '');
        
        case 'cookTime': {
          const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
          if (activeFilters.cookTime.includes('quick') && totalTime < 15) return true;
          if (activeFilters.cookTime.includes('medium') && totalTime >= 15 && totalTime <= 30) return true;
          if (activeFilters.cookTime.includes('long') && totalTime > 30) return true;
          return false;
        }
        
        case 'calorieRange': {
          const calories = recipe.macros.calories;
          if (activeFilters.calorieRange.includes('0-200') && calories <= 200) return true;
          if (activeFilters.calorieRange.includes('200-400') && calories > 200 && calories <= 400) return true;
          if (activeFilters.calorieRange.includes('400-600') && calories > 400 && calories <= 600) return true;
          if (activeFilters.calorieRange.includes('600+') && calories > 600) return true;
          return false;
        }
        
        case 'equipment':
          if (activeFilters.equipment.includes('blender') && recipe.requiresBlender) return true;
          // Additional equipment checks would go here with expanded recipe data
          return false;
          
        // Add more categories as needed
        default:
          return true;
      }
    };
    
    // Check if recipe matches all filter categories AND search
    return matchesSearch && 
           Object.keys(activeFilters).every(matchesFilterCategory);
  });

  // Handle loading more recipes on scroll
  const loadMoreRecipes = () => {
    setVisibleRecipes(prev => prev + 12);
  };

  // Toggle a filter
  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const currentFilters = [...(prev[category] || [])];
      const index = currentFilters.indexOf(value);
      
      if (index >= 0) {
        // Remove filter
        currentFilters.splice(index, 1);
      } else {
        // Add filter
        currentFilters.push(value);
      }
      
      return {
        ...prev,
        [category]: currentFilters
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      priceRange: [],
      cookTime: [],
      mealType: [],
      cuisineType: [],
      equipment: [],
      calorieRange: [],
      dietaryNeeds: [],
    });
    setSearchQuery('');
  };

  // Get count of active filters
  const activeFilterCount = Object.values(activeFilters).reduce(
    (count, filters) => count + filters.length, 
    0
  );

  // Handle recipe selection
  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };
  
  // Handle toggle save recipe
  const handleToggleSave = async (recipeId: string, currentlySaved: boolean) => {
    setIsSaved(!currentlySaved);
    toast({
      title: currentlySaved ? "Recipe removed" : "Recipe saved",
      description: currentlySaved 
        ? "Recipe removed from your saved collection"
        : "Recipe added to your saved collection"
    });
    return Promise.resolve();
  };

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Explore Recipes</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-dishco-primary text-white rounded-full text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
        <p className="text-dishco-text-light">Discover new meal ideas</p>
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
        {searchQuery && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setSearchQuery('')}
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Filters</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
          
          <div className="space-y-4">
            {filterCategories.map(category => (
              <div key={category.id} className="border-b pb-3 last:border-0">
                <h3 className="font-medium mb-2">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.options?.map(option => (
                    <button
                      key={option.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        activeFilters[category.id]?.includes(option.id)
                          ? 'bg-dishco-primary text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => toggleFilter(category.id, option.id)}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-medium mb-2">No recipes found</p>
              <p className="text-dishco-text-light mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredRecipes.slice(0, visibleRecipes).map(recipe => (
                <div 
                  key={recipe.id} 
                  className="cursor-pointer"
                  onClick={() => handleOpenRecipe(recipe)}
                >
                  <div className="bg-gray-100 rounded-lg aspect-square mb-2 overflow-hidden">
                    <img
                      src={recipe.imageSrc}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{recipe.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">{recipe.macros.calories} cal</span>
                    <span className="text-xs text-blue-600">{recipe.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredRecipes.length > visibleRecipes && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={loadMoreRecipes}
              >
                Load more recipes
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Recipe Viewer */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
};

export default ExploreRecipesPage;
