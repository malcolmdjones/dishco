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

  useEffect(() => {
    fetchMealPlanForDate(selectedDate);
  }, [selectedDate]);

  const fetchMealPlanForDate = async (date: Date) => {
    try {
      const activePlanJson = localStorage.getItem('activePlan');
      
      if (!activePlanJson) {
        const savedMealPlansJson = localStorage.getItem('savedMealPlans');
        if (savedMealPlansJson) {
          const savedMealPlans = JSON.parse(savedMealPlansJson);
          if (savedMealPlans && savedMealPlans.length > 0) {
            const firstPlan = savedMealPlans[0];
            setActiveMealPlan(firstPlan);
            localStorage.setItem('activePlan', JSON.stringify(firstPlan.plan_data));
            processMealsForDate(firstPlan.plan_data, date);
            return;
          }
        }
        
        setActiveMealPlan(null);
        setTodaysMeals([]);
        return;
      }
      
      const activePlan = JSON.parse(activePlanJson);
      console.log("Active plan loaded for HomePage:", activePlan);
      
      setActiveMealPlan({
        id: activePlan.id || 'active-plan',
        name: activePlan.name || 'Active Plan',
        created_at: new Date().toISOString(),
        plan_data: activePlan
      });
      
      processMealsForDate(activePlan, date);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setTodaysMeals([]);
    }
  };

  const processMealsForDate = (planData: any, date: Date) => {
    if (!planData || !planData.days) {
      setTodaysMeals([]);
      return;
    }
    
    const activeDay = planData.days.find((day: any) => {
      if (!day || !day.date) return false;
      const dayDate = new Date(day.date);
      return isSameDay(dayDate, date);
    });
    
    if (!activeDay) {
      console.log("No plan found for this date:", date);
      setTodaysMeals([]);
      return;
    }
    
    const meals: Meal[] = [];
    
    if (activeDay.meals?.breakfast) {
      meals.push({
        id: `breakfast-${activeDay.meals.breakfast.id || Date.now()}`,
        name: activeDay.meals.breakfast.name,
        type: 'breakfast',
        recipe: activeDay.meals.breakfast,
        consumed: false
      });
    }
    
    if (activeDay.meals?.lunch) {
      meals.push({
        id: `lunch-${activeDay.meals.lunch.id || Date.now()}`,
        name: activeDay.meals.lunch.name,
        type: 'lunch',
        recipe: activeDay.meals.lunch,
        consumed: false
      });
    }
    
    if (activeDay.meals?.dinner) {
      meals.push({
        id: `dinner-${activeDay.meals.dinner.id || Date.now()}`,
        name: activeDay.meals.dinner.name,
        type: 'dinner',
        recipe: activeDay.meals.dinner,
        consumed: false
      });
    }
    
    if (activeDay.meals?.snacks && activeDay.meals.snacks.length > 0) {
      activeDay.meals.snacks.forEach((snack: any, index: number) => {
        if (snack) {
          meals.push({
            id: `snack-${index}-${snack.id || Date.now()}`,
            name: snack.name,
            type: 'snack',
            recipe: snack,
            consumed: false
          });
        }
      });
    }
    
    console.log("Processed meals for today:", meals);
    setTodaysMeals(meals);
  };

  useEffect(() => {
    const lastResetDate = localStorage.getItem('lastNutritionResetDate');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      setDailyNutrition(prev => ({
        ...prev,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }));
      
      setTodaysMeals(meals => 
        meals.map(meal => ({ ...meal, consumed: false }))
      );
      
      localStorage.setItem('lastNutritionResetDate', today);
    }
    
    const checkForNewDay = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours === 0 && minutes === 0) {
        setDailyNutrition(prev => ({
          ...prev,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }));
        
        setTodaysMeals(meals => 
          meals.map(meal => ({ ...meal, consumed: false }))
        );
        
        localStorage.setItem('lastNutritionResetDate', now.toDateString());
      }
    };
    
    const interval = setInterval(checkForNewDay, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  const handleToggleSave = async (recipeId: string, currentlySaved: boolean) => {
    setIsSaved(!currentlySaved);
    return Promise.resolve();
  };

  const handleToggleConsumed = (meal: Meal) => {
    const updatedMeals = todaysMeals.map(m => 
      m.id === meal.id ? { ...m, consumed: !m.consumed } : m
    );
    setTodaysMeals(updatedMeals);
    
    if (!meal.consumed) {
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

  const macroColors = {
    calories: '#FFF4D7',
    protein: '#DBE9FE',
    carbs: '#FEF9C3',
    fat: '#F3E8FF'
  };

  const isSelectedDateToday = isToday(selectedDate);

  const formatMealType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Hi there 👋</h1>
        <p className="text-dishco-text-light">Track your meals and plan for the week</p>
      </header>
      
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
              if (!meal || !meal.recipe) {
                return null;
              }
              
              return (
                <div key={meal.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{formatMealType(meal.type)}</span>
                    <span className="text-sm bg-amber-50 text-amber-800 px-2 py-1 rounded-full">
                      {meal.recipe.macros?.calories || 0} kcal
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <div 
                      className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handleOpenRecipe(meal.recipe)}
                    >
                      <img 
                        src={meal.recipe.imageSrc || '/placeholder.svg'} 
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
                      P: {meal.recipe.macros?.protein || 0}g
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 rounded-full text-xs">
                      C: {meal.recipe.macros?.carbs || 0}g
                    </span>
                    <span className="px-3 py-1 bg-purple-100 rounded-full text-xs">
                      F: {meal.recipe.macros?.fat || 0}g
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
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recipes You Might Like</h2>
          <Link to="/explore-recipes" className="text-sm text-blue-600">See All</Link>
        </div>
        <HomeRecipeViewer className="animate-fade-in" />
      </div>
      
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
