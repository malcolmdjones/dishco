
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ChevronLeft, ChevronRight, Home, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateDailyMacros, defaultGoals, Recipe } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import { supabase } from '@/integrations/supabase/client';
import HomeRecipeViewer from '@/components/HomeRecipeViewer';

interface Meal {
  id: string;
  name: string;
  type: string;
  recipe: Recipe;
  consumed: boolean;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeMealPlan, setActiveMealPlan] = useState<any>(null);
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  
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
  
  // Load meal plan for the selected date
  useEffect(() => {
    fetchMealPlanForDate(selectedDate);
  }, [selectedDate]);

  // Fetch meal plan for the selected date
  const fetchMealPlanForDate = async (date: Date) => {
    try {
      // Try to fetch from local storage first (for demonstration)
      const savedMealPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '[]');
      
      // Filter meal plans to find one active for the selected date
      const activePlan = savedMealPlans.find((plan: any) => {
        const planData = plan.plan_data;
        if (!planData || !planData.days) return false;
        
        // Check if the plan has a day entry for the selected date
        return planData.days.some((day: any) => {
          const dayDate = new Date(day.date);
          return isSameDay(dayDate, date);
        });
      });
      
      setActiveMealPlan(activePlan || null);
      
      if (activePlan) {
        // Find the specific day in the plan
        const planData = activePlan.plan_data;
        const activeDay = planData.days.find((day: any) => {
          const dayDate = new Date(day.date);
          return isSameDay(dayDate, date);
        });
        
        if (activeDay) {
          // Convert to our Meal format
          const meals: Meal[] = [];
          
          // Add breakfast
          if (activeDay.breakfast) {
            meals.push({
              id: `breakfast-${activeDay.breakfast.id}`,
              name: activeDay.breakfast.name,
              type: 'breakfast',
              recipe: activeDay.breakfast,
              consumed: false
            });
          }
          
          // Add lunch
          if (activeDay.lunch) {
            meals.push({
              id: `lunch-${activeDay.lunch.id}`,
              name: activeDay.lunch.name,
              type: 'lunch',
              recipe: activeDay.lunch,
              consumed: false
            });
          }
          
          // Add dinner
          if (activeDay.dinner) {
            meals.push({
              id: `dinner-${activeDay.dinner.id}`,
              name: activeDay.dinner.name,
              type: 'dinner',
              recipe: activeDay.dinner,
              consumed: false
            });
          }
          
          // Add snacks
          if (activeDay.snacks && activeDay.snacks.length > 0) {
            activeDay.snacks.forEach((snack: any, index: number) => {
              meals.push({
                id: `snack-${index}-${snack.id}`,
                name: snack.name,
                type: 'snack',
                recipe: snack,
                consumed: false
              });
            });
          }
          
          setTodaysMeals(meals);
        } else {
          setTodaysMeals([]);
        }
      } else {
        setTodaysMeals([]);
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setTodaysMeals([]);
    }
  };

  // Reset nutrition at midnight
  useEffect(() => {
    // First, check if we should reset based on stored date
    const lastResetDate = localStorage.getItem('lastNutritionResetDate');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      // Reset nutrition
      setDailyNutrition(prev => ({
        ...prev,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }));
      
      // Reset consumed status
      setTodaysMeals(meals => 
        meals.map(meal => ({ ...meal, consumed: false }))
      );
      
      // Store current date
      localStorage.setItem('lastNutritionResetDate', today);
    }
    
    // Set up the next day reset
    const checkForNewDay = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours === 0 && minutes === 0) {
        // Reset nutrition at midnight
        setDailyNutrition(prev => ({
          ...prev,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }));
        
        // Reset consumed status
        setTodaysMeals(meals => 
          meals.map(meal => ({ ...meal, consumed: false }))
        );
        
        // Store current date
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
    // Update the meal
    const updatedMeals = todaysMeals.map(m => 
      m.id === meal.id ? { ...m, consumed: !m.consumed } : m
    );
    setTodaysMeals(updatedMeals);
    
    // Update nutrition based on whether meal was consumed or unconsumed
    if (!meal.consumed) {
      // Add nutrition values
      setDailyNutrition(prev => ({
        ...prev,
        calories: prev.calories + meal.recipe.macros.calories,
        protein: prev.protein + meal.recipe.macros.protein,
        carbs: prev.carbs + meal.recipe.macros.carbs,
        fat: prev.fat + meal.recipe.macros.fat
      }));
      
      toast({
        title: "Meal logged",
        description: `${meal.name} has been marked as consumed.`
      });
    } else {
      // Subtract nutrition values
      setDailyNutrition(prev => ({
        ...prev,
        calories: Math.max(0, prev.calories - meal.recipe.macros.calories),
        protein: Math.max(0, prev.protein - meal.recipe.macros.protein),
        carbs: Math.max(0, prev.carbs - meal.recipe.macros.carbs),
        fat: Math.max(0, prev.fat - meal.recipe.macros.fat)
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
        
        <div className="grid grid-cols-4 gap-3">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-2">
              <CircularProgressbar
                value={(dailyNutrition.calories / dailyNutrition.totalCalories) * 100}
                text={`${dailyNutrition.calories}`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: macroColors.calories,
                  textColor: '#3C3C3C',
                  trailColor: '#F9F9F9',
                })}
              />
            </div>
            <span className="text-xs text-center">
              Calories
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-2">
              <CircularProgressbar
                value={(dailyNutrition.protein / dailyNutrition.totalProtein) * 100}
                text={`${dailyNutrition.protein}g`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: macroColors.protein,
                  textColor: '#3C3C3C',
                  trailColor: '#F9F9F9',
                })}
              />
            </div>
            <span className="text-xs text-center">
              Protein
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-2">
              <CircularProgressbar
                value={(dailyNutrition.carbs / dailyNutrition.totalCarbs) * 100}
                text={`${dailyNutrition.carbs}g`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: macroColors.carbs,
                  textColor: '#3C3C3C',
                  trailColor: '#F9F9F9',
                })}
              />
            </div>
            <span className="text-xs text-center">
              Carbs
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-2">
              <CircularProgressbar
                value={(dailyNutrition.fat / dailyNutrition.totalFat) * 100}
                text={`${dailyNutrition.fat}g`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: macroColors.fat,
                  textColor: '#3C3C3C',
                  trailColor: '#F9F9F9',
                })}
              />
            </div>
            <span className="text-xs text-center">
              Fat
            </span>
          </div>
        </div>
      </div>
      
      {/* Today's Meals */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Today's Meals</h2>
          {!activeMealPlan && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/create-meal-plan')}
              className="text-xs"
            >
              <Plus size={16} className="mr-1" />
              Create Meal Plan
            </Button>
          )}
        </div>
        
        {todaysMeals.length > 0 ? (
          <div className="space-y-4">
            {todaysMeals.map((meal) => {
              // Add null check to ensure meal and recipe exist
              if (!meal || !meal.recipe) {
                return null;
              }
              
              return (
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
                        src={meal.recipe.imageSrc} 
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
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-gray-500 mb-4">No meal plan active for this date</p>
            <Button
              onClick={() => navigate('/create-meal-plan')}
              variant="outline"
            >
              Create a Meal Plan
            </Button>
          </div>
        )}
      </div>
      
      {/* Featured Recipes Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recipes You Might Like</h2>
          <Link to="/explore-recipes" className="text-sm text-blue-600">See All</Link>
        </div>
        <HomeRecipeViewer className="animate-fade-in" />
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
