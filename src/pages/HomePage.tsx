import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isEqual, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateDailyMacros, recipes, defaultGoals, Recipe } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';

interface Meal {
  id: string;
  name: string;
  type: string;
  recipe: Recipe;
  consumed: boolean;
  loggedAt?: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // State for daily nutrition
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    totalCalories: defaultGoals.calories,
    protein: 0,
    totalProtein: defaultGoals.protein,
    carbs: 0,
    totalCarbs: defaultGoals.carbs,
    fat: 0,
    totalFat: defaultGoals.fat
  });
  
  // State for today's meals
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);

  // Load and filter meals based on selected date
  useEffect(() => {
    // Get logged meals from localStorage
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    // Filter meals for the selected date
    const selectedDateStart = startOfDay(selectedDate);
    const filteredMeals = storedMeals.filter((meal: Meal) => {
      if (!meal.loggedAt) return false;
      const mealDate = startOfDay(parseISO(meal.loggedAt));
      return isEqual(mealDate, selectedDateStart);
    });
    
    if (filteredMeals.length > 0) {
      setTodaysMeals(filteredMeals);
    } else if (isToday(selectedDate)) {
      // Fallback to default meals only if it's today and no meals are logged
      setTodaysMeals([
        {
          id: '1',
          name: 'Avocado Toast with Egg',
          type: 'breakfast',
          recipe: recipes.find(recipe => recipe.id === '2') || recipes[0],
          consumed: false
        },
        {
          id: '2',
          name: 'Grilled Chicken Salad',
          type: 'lunch',
          recipe: recipes.find(recipe => recipe.id === '4') || recipes[0],
          consumed: false
        },
        {
          id: '3',
          name: 'Baked Salmon with Asparagus',
          type: 'dinner',
          recipe: recipes.find(recipe => recipe.id === '7') || recipes[0],
          consumed: false
        }
      ]);
    } else {
      // Empty array for past dates with no logged meals
      setTodaysMeals([]);
    }
    
    // Calculate nutrition for the selected date
    calculateNutritionForDate(filteredMeals);
  }, [selectedDate]);

  // Calculate nutrition values based on consumed meals for the selected date
  const calculateNutritionForDate = (meals: Meal[]) => {
    const consumedMeals = meals.filter(meal => meal.consumed);
    
    const calculatedNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    consumedMeals.forEach(meal => {
      calculatedNutrition.calories += meal.recipe.macros.calories;
      calculatedNutrition.protein += meal.recipe.macros.protein;
      calculatedNutrition.carbs += meal.recipe.macros.carbs;
      calculatedNutrition.fat += meal.recipe.macros.fat;
    });
    
    setDailyNutrition(prev => ({
      ...prev,
      calories: calculatedNutrition.calories,
      protein: calculatedNutrition.protein,
      carbs: calculatedNutrition.carbs,
      fat: calculatedNutrition.fat
    }));
  };

  // Reset nutrition at midnight
  useEffect(() => {
    // First, check if we should reset based on stored date
    const lastResetDate = localStorage.getItem('lastNutritionResetDate');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      // No need to reset the display values as they're now calculated per selected date
      // We just need to update the reset date
      localStorage.setItem('lastNutritionResetDate', today);
    }
    
    // Set up the next day reset
    const checkForNewDay = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours === 0 && minutes === 0) {
        // Store current date as reset date
        localStorage.setItem('lastNutritionResetDate', now.toDateString());
      }
    };
    
    // Check every minute
    const interval = setInterval(checkForNewDay, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to go to previous day
  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };
  
  // Function to go to next day
  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };
  
  // Function to reset to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Open recipe viewer
  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };
  
  // Handle toggle save recipe (placeholder)
  const handleToggleSave = async (recipeId: string, currentlySaved: boolean) => {
    setIsSaved(!currentlySaved);
    return Promise.resolve();
  };
  
  // Function to toggle meal consumption
  const handleToggleConsumed = (meal: Meal) => {
    // Update the meal in the current view
    const updatedTodaysMeals = todaysMeals.map(m => 
      m.id === meal.id ? { ...m, consumed: !m.consumed } : m
    );
    setTodaysMeals(updatedTodaysMeals);
    
    // Update the meal in localStorage
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const updatedStoredMeals = storedMeals.map((m: Meal) => 
      m.id === meal.id ? { ...m, consumed: !m.consumed } : m
    );
    localStorage.setItem('loggedMeals', JSON.stringify(updatedStoredMeals));
    
    // Update nutrition based on whether meal was consumed or unconsumed
    if (!meal.consumed) {
      // Add nutrition values
      const updatedNutrition = {
        calories: dailyNutrition.calories + meal.recipe.macros.calories,
        protein: dailyNutrition.protein + meal.recipe.macros.protein,
        carbs: dailyNutrition.carbs + meal.recipe.macros.carbs,
        fat: dailyNutrition.fat + meal.recipe.macros.fat
      };
      
      setDailyNutrition(prev => ({
        ...prev,
        ...updatedNutrition
      }));
      
      toast({
        title: "Meal logged",
        description: `${meal.name} has been marked as consumed.`
      });
    } else {
      // Subtract nutrition values
      const updatedNutrition = {
        calories: Math.max(0, dailyNutrition.calories - meal.recipe.macros.calories),
        protein: Math.max(0, dailyNutrition.protein - meal.recipe.macros.protein),
        carbs: Math.max(0, dailyNutrition.carbs - meal.recipe.macros.carbs),
        fat: Math.max(0, dailyNutrition.fat - meal.recipe.macros.fat)
      };
      
      setDailyNutrition(prev => ({
        ...prev,
        ...updatedNutrition
      }));
      
      toast({
        title: "Meal unlogged",
        description: `${meal.name} has been unmarked as consumed.`
      });
    }
  };
  
  // Color definitions for macros
  const macroColors = {
    calories: '#FFF4D7',
    protein: '#DBE9FE',
    carbs: '#FEF9C3',
    fat: '#F3E8FF'
  };

  // Check if selected date is today
  const isSelectedDateToday = isToday(selectedDate);

  // Format meal type
  const formatMealType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to determine if a macro target is met (within thresholds)
  const getMacroStatus = (type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const value = dailyNutrition[type];
    const target = dailyNutrition[`total${type.charAt(0).toUpperCase() + type.slice(1)}`];
    
    // Define thresholds based on macro type
    const thresholds = {
      calories: { lower: 10, upper: 60 },
      protein: { lower: 5, upper: 5 },
      carbs: { lower: 10, upper: 10 },
      fat: { lower: 5, upper: 5 }
    };
    
    // Check if value is within target range (inclusive of thresholds)
    if (value >= target - thresholds[type].lower && value <= target + thresholds[type].upper) {
      return 'target-met';
    } else if (value > target + thresholds[type].upper) {
      return 'too-high';
    } else {
      return 'too-low';
    }
  };

  // Always use the provided Unsplash image instead of possibly broken imageUrl
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Hi there 👋</h1>
        <p className="text-dishco-text-light">Track your meals and plan for the week</p>
      </header>
      
      {/* Date selector */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={goToPreviousDay} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={18} />
          </button>
          
          <div className="text-center">
            <button 
              onClick={goToToday}
              className={`text-lg font-medium ${isSelectedDateToday ? 'text-green-500' : ''}`}
            >
              {format(selectedDate, 'EEEE, MMMM d')}
              {!isSelectedDateToday && (
                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                  Tap to return to today
                </span>
              )}
            </button>
            <p className="text-xs text-dishco-text-light">
              {isSelectedDateToday ? 'Today' : 
                format(selectedDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd') ? 'Tomorrow' : 
                format(selectedDate, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'Yesterday' : 
                format(selectedDate, 'MMM d, yyyy')}
            </p>
          </div>
          
          <button onClick={goToNextDay} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      {/* Today's Nutrition */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Nutrition</h2>
          <Link to="/nutrition-goals">
            <Button variant="ghost" size="sm" className="text-xs">Adjust Goals</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Calories</span>
              <span className={`text-sm ${getMacroStatus('calories') === 'target-met' ? 'text-green-600' : 'text-gray-600'}`}>
                {dailyNutrition.calories} / {dailyNutrition.totalCalories} kcal
              </span>
            </div>
            <Progress 
              value={Math.min(100, (dailyNutrition.calories / dailyNutrition.totalCalories) * 100)} 
              max={100}
              indicatorClassName={getMacroStatus('calories') === 'too-high' ? "bg-red-500" : ""}
              className="h-2"
              style={{ 
                backgroundColor: "#F9F9F9", 
                "--progress-background": macroColors.calories
              } as React.CSSProperties}
            />
          </div>
          
          {/* Protein */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Protein</span>
              <span className={`text-sm ${getMacroStatus('protein') === 'target-met' ? 'text-green-600' : 'text-gray-600'}`}>
                {dailyNutrition.protein} / {dailyNutrition.totalProtein} g
              </span>
            </div>
            <Progress 
              value={Math.min(100, (dailyNutrition.protein / dailyNutrition.totalProtein) * 100)} 
              max={100}
              indicatorClassName={getMacroStatus('protein') === 'too-high' ? "bg-red-500" : ""}
              className="h-2"
              style={{ 
                backgroundColor: "#F9F9F9", 
                "--progress-background": macroColors.protein
              } as React.CSSProperties}
            />
          </div>
          
          {/* Carbs */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Carbs</span>
              <span className={`text-sm ${getMacroStatus('carbs') === 'target-met' ? 'text-green-600' : 'text-gray-600'}`}>
                {dailyNutrition.carbs} / {dailyNutrition.totalCarbs} g
              </span>
            </div>
            <Progress 
              value={Math.min(100, (dailyNutrition.carbs / dailyNutrition.totalCarbs) * 100)} 
              max={100}
              indicatorClassName={getMacroStatus('carbs') === 'too-high' ? "bg-red-500" : ""}
              className="h-2"
              style={{ 
                backgroundColor: "#F9F9F9", 
                "--progress-background": macroColors.carbs
              } as React.CSSProperties}
            />
          </div>
          
          {/* Fat */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Fat</span>
              <span className={`text-sm ${getMacroStatus('fat') === 'target-met' ? 'text-green-600' : 'text-gray-600'}`}>
                {dailyNutrition.fat} / {dailyNutrition.totalFat} g
              </span>
            </div>
            <Progress 
              value={Math.min(100, (dailyNutrition.fat / dailyNutrition.totalFat) * 100)} 
              max={100} 
              indicatorClassName={getMacroStatus('fat') === 'too-high' ? "bg-red-500" : ""}
              className="h-2"
              style={{ 
                backgroundColor: "#F9F9F9", 
                "--progress-background": macroColors.fat
              } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
      
      {/* Today's Meals */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Today's Meals</h2>
          <Link to="/log-meal">
            <Button variant="outline" size="sm" className="text-xs">
              Log More Food
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {todaysMeals.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-gray-500">No meals logged today.</p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => navigate('/log-meal')}
              >
                Log your first meal
              </Button>
            </div>
          ) : (
            todaysMeals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{formatMealType(meal.type)}</span>
                  <span className="text-sm bg-amber-50 text-amber-800 px-2 py-1 rounded-full">
                    {meal.recipe.macros.calories} kcal
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <div 
                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleOpenRecipe(meal.recipe)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 
                      className="font-semibold mb-2 cursor-pointer"
                      onClick={() => handleOpenRecipe(meal.recipe)}
                    >
                      {meal.name}
                    </h3>
                    
                    <Button
                      variant={meal.consumed ? "outline" : "outline"}
                      size="sm"
                      className={`w-full ${meal.consumed ? 'text-green-600 border-green-600' : ''}`}
                      onClick={() => handleToggleConsumed(meal)}
                    >
                      {meal.consumed ? 'Consumed ✓' : 'Mark as consumed'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 bg-blue-100 rounded-full text-xs">
                    P: {meal.recipe.macros.protein}g
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 rounded-full text-xs">
                    C: {meal.recipe.macros.carbs}g
                  </span>
                  <span className="px-3 py-1 bg-purple-100 rounded-full text-xs">
                    F: {meal.recipe.macros.fat}g
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
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

export default HomePage;
