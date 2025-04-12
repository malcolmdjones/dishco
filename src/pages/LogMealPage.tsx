
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Search, Plus, Info, Globe, UtensilsCrossed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/data/mockData';
import FoodSearchModal from '@/components/food-database/FoodSearchModal';

const LogMealPage = () => {
  const { toast } = useToast();
  const { recipes, loading } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isExternalSearchOpen, setIsExternalSearchOpen] = useState(false);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogMeal = (recipe: Recipe) => {
    // Get current logged meals from localStorage or initialize empty array
    const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    // Create a unique ID that includes the current timestamp
    const uniqueId = `${recipe.id}-${Date.now()}`;
    
    // Check if this exact meal was already logged today (using the unique ID)
    const isDuplicate = existingLoggedMeals.some((meal: any) => meal.id === uniqueId);
    
    if (!isDuplicate) {
      // Add new meal with timestamp and consumed status
      const newMeal = {
        id: uniqueId,
        name: recipe.name,
        type: recipe.type || 'snack', // Default to snack if no type
        recipe: recipe,
        consumed: true,
        loggedAt: new Date().toISOString() // Store the current date/time
      };
      
      // Add to logged meals
      const updatedLoggedMeals = [...existingLoggedMeals, newMeal];
      localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
      
      // Get current nutrition totals or initialize
      const currentNutrition = JSON.parse(localStorage.getItem('dailyNutrition') || '{}');
      const updatedNutrition = {
        calories: (currentNutrition.calories || 0) + recipe.macros.calories,
        protein: (currentNutrition.protein || 0) + recipe.macros.protein,
        carbs: (currentNutrition.carbs || 0) + recipe.macros.carbs,
        fat: (currentNutrition.fat || 0) + recipe.macros.fat
      };
      
      localStorage.setItem('dailyNutrition', JSON.stringify(updatedNutrition));
      
      toast({
        title: "Meal Logged",
        description: `${recipe.name} has been added to your daily log.`,
      });
    } else {
      toast({
        title: "Already Logged",
        description: "This meal has already been logged today.",
        variant: "destructive",
      });
    }
  };

  const handleLogExternalFood = (foodItem: any) => {
    // Cast the external food to match the Recipe type
    const externalRecipe: Recipe = {
      id: foodItem.id || `external-${Date.now()}`,
      name: foodItem.name,
      description: foodItem.description || '',
      type: foodItem.type || 'snack',
      imageSrc: foodItem.imageSrc || '',
      requiresBlender: false,
      requiresCooking: false,
      cookTime: 0,
      prepTime: 0,
      servings: 1,
      macros: {
        calories: foodItem.macros?.calories || 0,
        protein: foodItem.macros?.protein || 0,
        carbs: foodItem.macros?.carbs || 0,
        fat: foodItem.macros?.fat || 0
      },
      ingredients: [],
      instructions: [],
      externalSource: true,
      externalId: foodItem.externalId
    };

    // Use the existing log meal function with the properly formatted recipe
    handleLogMeal(externalRecipe);
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'snack', name: 'Snack' },
  ];

  // Always use the provided Unsplash image instead of possibly broken imageUrl
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

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

      {/* External food search button */}
      <Button 
        variant="outline" 
        className="w-full mb-4 border-dashed justify-start"
        onClick={() => setIsExternalSearchOpen(true)}
      >
        <Globe size={18} className="mr-2 text-dishco-primary" />
        Search food database (restaurant & store items)
      </Button>

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
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
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
                    src={recipe.imageSrc || imageUrl} 
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

        {/* No recipes state with external search suggestion */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center mt-4 p-4 border border-dashed rounded-lg">
            <UtensilsCrossed size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium">Can't find what you're looking for?</p>
            <Button 
              variant="outline" 
              className="mt-3" 
              onClick={() => setIsExternalSearchOpen(true)}
            >
              <Globe size={16} className="mr-2" />
              Search external food database
            </Button>
          </div>
        )}
      </div>

      {/* External food search modal */}
      <FoodSearchModal
        isOpen={isExternalSearchOpen}
        onClose={() => setIsExternalSearchOpen(false)}
        onSelectFood={handleLogExternalFood}
      />
    </div>
  );
};

export default LogMealPage;
