
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X, Search, Plus, Mic, Barcode, ArrowDown, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import RecentMealHistory from '@/components/food-database/RecentMealHistory';
import { cn } from '@/lib/utils';
import { searchFoods, foodItemToRecipe, addToRecentFoods } from '@/services/foodDatabaseService';
import { FoodDatabaseItem, LoggedMeal } from '@/types/food';

const LogMealPage = () => {
  const { toast } = useToast();
  const { recipes } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [recentMeals, setRecentMeals] = useState<LoggedMeal[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get only meals logged from this screen
  useEffect(() => {
    const allLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    // Only include meals explicitly logged from this screen
    const loggedFromThisScreen = allLoggedMeals.filter((meal: LoggedMeal) => 
      meal.loggedFromScreen === 'log-meal'
    );
    setRecentMeals(loggedFromThisScreen.slice(0, 10).reverse());
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Always search external API
      const results = await searchFoods(searchQuery, true);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching foods:", error);
      toast({
        title: "Search Error",
        description: "Could not search the food database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
    // Automatically search when focusing if there's a query
    if (searchQuery) {
      handleSearch();
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery ? 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
      
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'meals' && ['breakfast', 'lunch', 'dinner'].includes(recipe.type)) ||
      (selectedTab === 'recipes' && recipe.ingredients?.length > 0) ||
      (selectedTab === 'myFoods' && recipe.type === 'snack');
      
    return matchesSearch && matchesTab;
  });

  const handleLogMeal = (recipe: Recipe) => {
    const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const uniqueId = `${recipe.id}-${Date.now()}`;
    
    // Calculate protein display value
    const proteinDisplay = recipe.macros?.protein ? `${recipe.macros.protein}g protein` : '';
    
    const newMeal: LoggedMeal = {
      id: uniqueId,
      name: recipe.name,
      type: recipe.type || 'snack',
      recipe: recipe,
      consumed: true,
      loggedAt: new Date().toISOString(),
      loggedFromScreen: 'log-meal', // Mark as logged from this screen
      calories: recipe.macros.calories,
      protein: proteinDisplay,
      brand: (recipe as any).brandName || '',
      servingInfo: recipe.servings === 1 ? '1 serving' : `${recipe.servings} servings`,
      source: recipe.externalSource ? 'External' : 'Custom'
    };
    
    const updatedLoggedMeals = [newMeal, ...existingLoggedMeals];
    localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
    
    // Update the recent meals for display
    setRecentMeals([newMeal, ...recentMeals].slice(0, 10));
    
    const currentNutrition = JSON.parse(localStorage.getItem('dailyNutrition') || '{}');
    const updatedNutrition = {
      calories: (currentNutrition.calories || 0) + recipe.macros.calories,
      protein: (currentNutrition.protein || 0) + (recipe.macros.protein || 0),
      carbs: (currentNutrition.carbs || 0) + (recipe.macros.carbs || 0),
      fat: (currentNutrition.fat || 0) + (recipe.macros.fat || 0)
    };
    
    localStorage.setItem('dailyNutrition', JSON.stringify(updatedNutrition));
    
    toast({
      title: "Meal Logged",
      description: `${recipe.name} has been added to your daily log.`,
    });
  };

  const handleLogDatabaseFood = (foodItem: FoodDatabaseItem) => {
    const recipe = foodItemToRecipe(foodItem);
    handleLogMeal(recipe);
    
    // Add to recent foods
    addToRecentFoods(foodItem);
  };

  const suggestedSearches = [
    'chicken breast',
    'yogurt',
    'salad',
    'protein shake',
    'banana'
  ];

  return (
    <div className="animate-fade-in pb-16">
      <div className="flex justify-center items-center py-3 border-b sticky top-0 bg-white z-10">
        <button className="absolute left-4" onClick={() => window.history.back()}>
          <X size={24} />
        </button>
        <h1 className="text-xl font-semibold text-blue-600">
          Select a Meal <ArrowDown size={16} className="inline" />
        </h1>
      </div>

      <div className="px-4 py-3 sticky top-14 bg-white z-10">
        <div className="relative flex items-center bg-gray-100 rounded-full">
          <Search className="absolute left-3 text-blue-600" size={20} />
          <Input
            placeholder="Search for a food"
            className="pl-10 pr-10 py-2 border-0 bg-gray-100 rounded-full focus:ring-0 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery && (
            <button 
              className="absolute right-3"
              onClick={handleClearSearch}
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full justify-start px-2 bg-white border-b overflow-x-auto flex-nowrap whitespace-nowrap no-scrollbar sticky top-[7.5rem] z-10">
          <TabsTrigger 
            value="all" 
            className={cn(
              "px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none data-[state=active]:shadow-none",
              "data-[state=active]:bg-transparent text-base font-medium"
            )}
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="meals" 
            className={cn(
              "px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none data-[state=active]:shadow-none",
              "data-[state=active]:bg-transparent text-base font-medium"
            )}
          >
            My Meals
          </TabsTrigger>
          <TabsTrigger 
            value="recipes" 
            className={cn(
              "px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none data-[state=active]:shadow-none",
              "data-[state=active]:bg-transparent text-base font-medium"
            )}
          >
            My Recipes
          </TabsTrigger>
          <TabsTrigger 
            value="myFoods" 
            className={cn(
              "px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none data-[state=active]:shadow-none",
              "data-[state=active]:bg-transparent text-base font-medium"
            )}
          >
            My Foods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {!searchQuery && (
            <div className="bg-blue-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => toast({ title: "Coming Soon", description: "Voice logging will be available in a future update" })} 
                     className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-2">
                    <Mic className="text-blue-600" size={24} />
                  </div>
                  <span className="text-blue-600 font-medium">Voice Log</span>
                  <span className="bg-blue-100 text-xs text-blue-800 px-2 py-0.5 rounded mt-1">NEW</span>
                </div>
                <div onClick={() => toast({ title: "Coming Soon", description: "Barcode scanning will be available in a future update" })}
                     className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-2">
                    <Barcode className="text-blue-600" size={24} />
                  </div>
                  <span className="text-blue-600 font-medium">Scan a Barcode</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex justify-between items-center mb-0">
              <h2 className="text-xl font-bold">History</h2>
              <div className="flex items-center border rounded-full px-3 py-1 text-sm">
                <span>Most Recent</span>
                <ArrowDown size={14} className="ml-1" />
              </div>
            </div>

            <RecentMealHistory 
              recentMeals={recentMeals} 
              onAddMeal={handleLogMeal}
            />

            {searchQuery && (
              <div className="mt-4">
                {isSearching ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-500 mt-2">Searching OpenFoodFacts...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map(food => (
                        <div 
                          key={food.id} 
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center flex-1">
                            {food.imageSrc ? (
                              <img 
                                src={food.imageSrc} 
                                alt={food.name} 
                                className="w-12 h-12 rounded object-cover mr-3"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-200 mr-3 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{food.name}</p>
                              <p className="text-sm text-gray-500">
                                {food.brand && <span>{food.brand} • </span>}
                                <span className="font-medium">{food.macros.calories} cal</span>
                                {food.macros.protein > 0 && <span>, {food.macros.protein}g protein</span>}
                                {food.servingSize && <span>, {food.servingSize}</span>}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleLogDatabaseFood(food)}
                            className="h-10 w-10 rounded-full bg-gray-200 ml-2 shrink-0"
                          >
                            <Plus size={20} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">Suggested Searches</h3>
                    <div className="space-y-2">
                      {suggestedSearches.map((term, index) => (
                        <button
                          key={index}
                          className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg"
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearch();
                          }}
                        >
                          <Search size={18} className="mr-2 text-gray-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {searchQuery && filteredRecipes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">My Recipes</h3>
                <div className="space-y-2">
                  {filteredRecipes.map(recipe => (
                    <div key={recipe.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{recipe.name}</p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">{recipe.macros.calories} cal</span>, 
                          {recipe.servings === 1 ? '1 serving' : `${recipe.servings} servings`}
                          {recipe.macros.protein ? `, ${recipe.macros.protein}g protein` : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLogMeal(recipe)}
                        className="h-10 w-10 rounded-full bg-gray-200"
                      >
                        <Plus size={20} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meals" className="mt-0">
          <div className="p-4">
            <p>Your saved meals will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="mt-0">
          <div className="p-4">
            <p>Your saved recipes will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="myFoods" className="mt-0">
          <div className="p-4">
            <p>Your custom foods will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>

      <style jsx global>
        {`
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
        `}
      </style>
    </div>
  );
};

export default LogMealPage;
