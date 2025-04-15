
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FoodDatabaseItem, LoggedMeal } from '@/types/food';
import { searchFoods, foodItemToRecipe, addToRecentFoods } from '@/services/foodDatabaseService';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const LogMealSearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedMealType, setSelectedMealType] = useState<string>('snack');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentMeals, setRecentMeals] = useState<LoggedMeal[]>([]);

  // Load recent searches and meals on component mount
  useEffect(() => {
    // Load recent searches
    const savedRecentSearches = localStorage.getItem('recentSearches');
    if (savedRecentSearches) {
      setRecentSearches(JSON.parse(savedRecentSearches).slice(0, 5));
    }

    // Load recent meals
    const allLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const loggedFromSearchScreen = allLoggedMeals.filter((meal: LoggedMeal) => 
      meal.loggedFromScreen === 'log-meal-search'
    );
    setRecentMeals(loggedFromSearchScreen.slice(0, 10).reverse());
    
    // Autofocus search input
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    
    // If there's an initial query, search for it
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleGoBack = () => {
    if (selectedFood) {
      setSelectedFood(null);
    } else {
      navigate('/log-meal');
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchFoods(query, true);
      setSearchResults(results);
      
      // Save to recent searches
      if (!recentSearches.includes(query)) {
        const updatedSearches = [query, ...recentSearches].slice(0, 10);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
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

  const handleSelectFood = (food: FoodDatabaseItem) => {
    setSelectedFood(food);
  };

  const handleLogFood = () => {
    if (!selectedFood) return;

    const recipe = foodItemToRecipe(selectedFood, selectedQuantity);
    recipe.type = selectedMealType;
    
    const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const uniqueId = `${recipe.id}-${Date.now()}`;
    
    const proteinDisplay = recipe.macros?.protein ? `${recipe.macros.protein}g protein` : '';
    
    const newMeal: LoggedMeal = {
      id: uniqueId,
      name: recipe.name,
      type: selectedMealType,
      recipe: recipe,
      consumed: true,
      loggedAt: new Date().toISOString(),
      loggedFromScreen: 'log-meal-search',
      calories: recipe.macros.calories,
      protein: proteinDisplay,
      brand: selectedFood.brand || '',
      servingInfo: selectedFood.servingSize || '1 serving',
      source: 'Database'
    };
    
    const updatedLoggedMeals = [newMeal, ...existingLoggedMeals];
    localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
    
    setRecentMeals([newMeal, ...recentMeals].slice(0, 10));
    
    // Update daily nutrition
    const currentNutrition = JSON.parse(localStorage.getItem('dailyNutrition') || '{}');
    const updatedNutrition = {
      calories: (currentNutrition.calories || 0) + recipe.macros.calories,
      protein: (currentNutrition.protein || 0) + (recipe.macros.protein || 0),
      carbs: (currentNutrition.carbs || 0) + (recipe.macros.carbs || 0),
      fat: (currentNutrition.fat || 0) + (recipe.macros.fat || 0)
    };
    
    localStorage.setItem('dailyNutrition', JSON.stringify(updatedNutrition));
    
    // Add to recent foods
    addToRecentFoods(selectedFood);
    
    toast({
      title: "Food Added",
      description: `${recipe.name} has been logged successfully.`
    });
    
    // Go back to log meal page
    navigate('/log-meal');
  };

  return (
    <div className="h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <button 
          className="p-2"
          onClick={handleGoBack}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">
          {selectedFood ? 'Add Food' : 'Search Foods'}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <AnimatePresence mode="wait">
        {selectedFood ? (
          <motion.div
            key="food-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4"
          >
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
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
              onClick={handleLogFood}
            >
              <Check size={18} className="mr-2" /> Add to Food Log
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-16"
          >
            <div className="px-4 py-3 sticky top-[57px] bg-white z-10 border-b">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400" size={20} />
                <Input
                  ref={searchInputRef}
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-100 pl-10 pr-10 py-2 border-0 rounded-full"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-gray-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 py-2">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-gray-500 mt-4">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((food, index) => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      onClick={() => handleSelectFood(food)}
                    >
                      <div className="flex items-center flex-1 cursor-pointer">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFood(food);
                        }}
                        className="h-10 w-10 rounded-full bg-gray-200 ml-2 shrink-0"
                      >
                        <Plus size={18} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/log-meal/quick-add')}
                  >
                    <Plus size={16} className="mr-2" /> Quick Add Instead
                  </Button>
                </div>
              ) : (
                <>
                  {recentMeals.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">RECENTLY LOGGED</h3>
                      <div className="space-y-2">
                        {recentMeals.slice(0, 5).map((meal, index) => (
                          <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{meal.name}</p>
                              <p className="text-sm text-gray-500">
                                {meal.brand && <span>{meal.brand} • </span>}
                                <span className="font-medium">{meal.calories} cal</span>
                                {meal.protein && <span>, {meal.protein}</span>}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-full bg-gray-200"
                            >
                              <Plus size={18} />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">RECENT SEARCHES</h3>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-gray-100 border-gray-200"
                            onClick={() => {
                              setSearchQuery(term);
                              handleSearch(term);
                            }}
                          >
                            {term}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogMealSearchPage;
