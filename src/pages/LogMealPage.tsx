import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X, Search, Plus, Mic, Barcode, ArrowDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RecentMealHistory from '@/components/food-database/RecentMealHistory';
import { cn } from '@/lib/utils';
import { searchFoods, foodItemToRecipe, addToRecentFoods } from '@/services/foodDatabaseService';
import { FoodDatabaseItem, LoggedMeal } from '@/types/food';
import BarcodeScanner from '@/components/food-database/BarcodeScanner';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const LogMealPage = () => {
  const { toast } = useToast();
  const { recipes } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [recentMeals, setRecentMeals] = useState<LoggedMeal[]>([]);
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openCommandDialog, setOpenCommandDialog] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState('snack');

  useEffect(() => {
    const allLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const loggedFromThisScreen = allLoggedMeals.filter((meal: LoggedMeal) => 
      meal.loggedFromScreen === 'log-meal'
    );
    setRecentMeals(loggedFromThisScreen.slice(0, 10).reverse());
    
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const defaultSuggestions = [
        'chicken breast',
        'greek yogurt',
        'apple',
        'banana',
        'oatmeal'
      ];
      
      let filteredSuggestions = defaultSuggestions.filter(
        suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredSuggestions.length < 3) {
        filteredSuggestions = [
          ...filteredSuggestions,
          `${searchQuery} salad`,
          `${searchQuery} protein`,
          `${searchQuery} smoothie`,
          `organic ${searchQuery}`
        ].slice(0, 5);
      }
      
      setSearchSuggestions(filteredSuggestions);
    } else {
      setSearchSuggestions([
        'chicken breast',
        'yogurt',
        'salad',
        'protein shake',
        'banana'
      ]);
    }
  }, [searchQuery]);

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
      console.log("Searching for:", searchQuery);
      const results = await searchFoods(searchQuery, true);
      console.log("Search results:", results);
      setSearchResults(results);
      setOpenCommandDialog(false);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
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
    
    const proteinDisplay = recipe.macros?.protein ? `${recipe.macros.protein}g protein` : '';
    
    const newMeal: LoggedMeal = {
      id: uniqueId,
      name: recipe.name,
      type: recipe.type || 'snack',
      recipe: recipe,
      consumed: true,
      loggedAt: new Date().toISOString(),
      loggedFromScreen: 'log-meal',
      calories: recipe.macros.calories,
      protein: proteinDisplay,
      brand: (recipe as any).brandName || '',
      servingInfo: recipe.servings === 1 ? '1 serving' : `${recipe.servings} servings`,
      source: recipe.externalSource ? 'External' : 'Custom'
    };
    
    const updatedLoggedMeals = [newMeal, ...existingLoggedMeals];
    localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
    
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
    
    setSelectedFood(null);
  };

  const handleLogDatabaseFood = (foodItem: FoodDatabaseItem) => {
    const recipe = foodItemToRecipe(foodItem, selectedQuantity);
    recipe.type = selectedMealType;
    handleLogMeal(recipe);
    addToRecentFoods(foodItem);
  };

  const handleSelectFood = (food: FoodDatabaseItem) => {
    setSelectedFood(food);
  };

  const handleOpenBarcodeScanner = () => {
    setShowBarcodeScanner(true);
  };

  const handleCloseBarcodeScanner = () => {
    setShowBarcodeScanner(false);
  };

  const handleBarcodeResult = (foodItem: FoodDatabaseItem) => {
    handleLogDatabaseFood(foodItem);
    toast({
      title: "Product Found",
      description: `${foodItem.name} has been added to your log.`
    });
  };

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
            ref={searchInputRef}
            placeholder="Search for a food"
            className="pl-10 pr-10 py-2 border-0 bg-gray-100 rounded-full focus:ring-0 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setOpenCommandDialog(true)}
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

      <CommandDialog open={openCommandDialog && searchQuery.length > 0} onOpenChange={setOpenCommandDialog}>
        <CommandInput 
          placeholder="Search for foods..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggested Searches">
            <CommandItem
              onSelect={() => handleSearch()}
              className="flex items-center gap-2 py-3 cursor-pointer"
            >
              <Search className="h-5 w-5 text-blue-500" />
              <span>Search all foods for: "{searchQuery}"</span>
            </CommandItem>
            
            {searchSuggestions.map((suggestion, index) => (
              <CommandItem 
                key={index}
                onSelect={() => handleSelectSuggestion(suggestion)}
                className="py-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

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
                <div onClick={handleOpenBarcodeScanner}
                     className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center cursor-pointer">
                  <div className="bg-blue-100 rounded-full p-3 mb-2">
                    <Barcode className="text-blue-600" size={24} />
                  </div>
                  <span className="text-blue-600 font-medium">Scan a Barcode</span>
                </div>
              </div>
            </div>
          )}

          {selectedFood && (
            <div className="p-4 space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                {selectedFood.imageSrc ? (
                  <img 
                    src={selectedFood.imageSrc} 
                    alt={selectedFood.name} 
                    className="w-16 h-16 rounded object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 mr-4 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{selectedFood.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedFood.brand || 'Generic'} • 
                    <span className="font-medium"> {selectedFood.macros.calories} cal</span>
                    {selectedFood.macros.protein ? `, ${selectedFood.macros.protein}g protein` : ''}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || 1)}
                    className="border-gray-300"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meal Type</label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Nutrition (with selected quantity)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <p>Calories: <span className="font-medium">{Math.round(selectedFood.macros.calories * selectedQuantity)}</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <p>Protein: <span className="font-medium">{Math.round(selectedFood.macros.protein * selectedQuantity)}g</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <p>Carbs: <span className="font-medium">{Math.round(selectedFood.macros.carbs * selectedQuantity)}g</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <p>Fat: <span className="font-medium">{Math.round(selectedFood.macros.fat * selectedQuantity)}g</span></p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedFood(null)}>
                  Back to Search
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleLogDatabaseFood(selectedFood)}>
                  Add to Food Log
                </Button>
              </div>
            </div>
          )}

          {!selectedFood && (
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
                      <p className="text-sm text-gray-500 mt-2">Searching...</p>
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
                            <div className="flex items-center flex-1 cursor-pointer" onClick={() => handleSelectFood(food)}>
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
                              onClick={() => handleSelectFood(food)}
                              className="h-10 w-10 rounded-full bg-gray-200 ml-2 shrink-0"
                            >
                              <Plus size={20} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">No results found</h3>
                      <p className="text-sm text-gray-500">Try another search term or one of the suggestions below.</p>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Try searching for:</h4>
                        <div className="space-y-2">
                          {searchSuggestions.map((term, index) => (
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
                      </div>
                    </div>
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
          )}
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

      <style>
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
      
      {showBarcodeScanner && (
        <BarcodeScanner 
          isOpen={showBarcodeScanner}
          onClose={handleCloseBarcodeScanner}
          onFoodFound={handleBarcodeResult}
        />
      )}
    </div>
  );
};

export default LogMealPage;
