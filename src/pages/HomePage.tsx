import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isEqual, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateDailyMacros, defaultGoals } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@/lib/utils';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';
import { Recipe } from '@/types/MealPlan';
import { getMealData } from '@/hooks/utils';
import { convertToMockDataRecipe } from '@/utils/typeUtils';

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
  const { activePlan, getMealsForDate } = useSavedMealPlans();
  
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
  
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const selectedDateStart = startOfDay(selectedDate);
    const filteredMeals = storedMeals.filter((meal: Meal) => {
      if (!meal.loggedAt) return false;
      const mealDate = startOfDay(parseISO(meal.loggedAt));
      return isEqual(mealDate, selectedDateStart);
    });
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    const planMeals = getMealsForDate(formattedDate);
    
    const plannedMealArray: Meal[] = [];
    
    if (planMeals) {
      if (planMeals.breakfast) {
        const breakfastData = getMealData(planMeals.breakfast);
        if (breakfastData) {
          const convertedRecipe = convertToMockDataRecipe(breakfastData);
          plannedMealArray.push({
            id: `breakfast-planned-${formattedDate}`,
            name: convertedRecipe.name,
            type: 'breakfast',
            recipe: convertedRecipe,
            consumed: false,
            loggedAt: formattedDate
          });
        }
      }
      
      if (planMeals.lunch) {
        const lunchData = getMealData(planMeals.lunch);
        if (lunchData) {
          const convertedRecipe = convertToMockDataRecipe(lunchData);
          plannedMealArray.push({
            id: `lunch-planned-${formattedDate}`,
            name: convertedRecipe.name,
            type: 'lunch',
            recipe: convertedRecipe,
            consumed: false,
            loggedAt: formattedDate
          });
        }
      }
      
      if (planMeals.dinner) {
        const dinnerData = getMealData(planMeals.dinner);
        if (dinnerData) {
          const convertedRecipe = convertToMockDataRecipe(dinnerData);
          plannedMealArray.push({
            id: `dinner-planned-${formattedDate}`,
            name: convertedRecipe.name,
            type: 'dinner',
            recipe: convertedRecipe,
            consumed: false,
            loggedAt: formattedDate
          });
        }
      }
      
      if (planMeals.snacks && planMeals.snacks.length > 0) {
        planMeals.snacks.forEach((snack, index) => {
          const convertedRecipe = convertToMockDataRecipe(snack);
          plannedMealArray.push({
            id: `snack-planned-${index}-${formattedDate}`,
            name: convertedRecipe.name,
            type: 'snack',
            recipe: convertedRecipe,
            consumed: false,
            loggedAt: formattedDate
          });
        });
      }
    }
    
    if (filteredMeals.length > 0) {
      const loggedMealIds = new Set(filteredMeals.map((meal: Meal) => meal.name));
      const unloggedPlannedMeals = plannedMealArray.filter(meal => !loggedMealIds.has(meal.name));
      
      setTodaysMeals([...filteredMeals, ...unloggedPlannedMeals]);
    } else if (plannedMealArray.length > 0) {
      setTodaysMeals(plannedMealArray);
    } else {
      setTodaysMeals([]);
    }
    
    calculateNutritionForDate(filteredMeals);
  }, [selectedDate, getMealsForDate, activePlan]);

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

  useEffect(() => {
    const lastResetDate = localStorage.getItem('lastNutritionResetDate');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      localStorage.setItem('lastNutritionResetDate', today);
    }
    
    const checkForNewDay = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours === 0 && minutes === 0) {
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

  const handleOpenRecipe = (recipe: Recipe | Recipe[]) => {
    const recipeData = getMealData(recipe);
    if (recipeData) {
      const convertedRecipe = convertToMockDataRecipe(recipeData);
      setSelectedRecipe(convertedRecipe);
      setIsRecipeViewerOpen(true);
    }
  };

  const handleToggleSave = async (recipeId: string, currentlySaved: boolean) => {
    setIsSaved(!currentlySaved);
    return Promise.resolve();
  };

  const handleToggleConsumed = (meal: Meal) => {
    const updatedTodaysMeals = todaysMeals.map(m => 
      m.id === meal.id ? { ...m, consumed: !m.consumed } : m
    );
    setTodaysMeals(updatedTodaysMeals);
    
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const mealExists = storedMeals.some((m: Meal) => m.id === meal.id);
    
    let updatedStoredMeals;
    if (mealExists) {
      updatedStoredMeals = storedMeals.map((m: Meal) => 
        m.id === meal.id ? { ...m, consumed: !m.consumed } : m
      );
    } else {
      updatedStoredMeals = [...storedMeals, { ...meal, consumed: true }];
    }
    
    localStorage.setItem('loggedMeals', JSON.stringify(updatedStoredMeals));
    
    if (!meal.consumed) {
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

  const getMacroStatus = (type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const value = dailyNutrition[type];
    const target = dailyNutrition[`total${type.charAt(0).toUpperCase() + type.slice(1)}`];
    
    const thresholds = {
      calories: { lower: 10, upper: 60 },
      protein: { lower: 5, upper: 5 },
      carbs: { lower: 10, upper: 10 },
      fat: { lower: 5, upper: 5 }
    };
    
    if (value >= target - thresholds[type].lower && value <= target + thresholds[type].upper) {
      return 'target-met';
    } else if (value > target + thresholds[type].upper) {
      return 'too-high';
    } else {
      return 'too-low';
    }
  };

  const isSelectedDateToday = isToday(selectedDate);

  const formatMealType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const macroColors = {
    calories: "#FFF4D7",
    protein: "#DBE9FE",
    carbs: "#FEF9C3",
    fat: "#F3E8FF"
  };

  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

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
        
        <div className="flex justify-between items-center">
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-16 h-16 relative",
              getMacroStatus('calories') === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dailyNutrition.calories} 
                maxValue={dailyNutrition.totalCalories} 
                text={`${dailyNutrition.calories}`}
                styles={{
                  path: { 
                    stroke: getMacroStatus('calories') === 'too-high' ? "#FF4B4B" : macroColors.calories
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              getMacroStatus('calories') === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dailyNutrition.calories} / {dailyNutrition.totalCalories} Cal
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-16 h-16 relative",
              getMacroStatus('protein') === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dailyNutrition.protein} 
                maxValue={dailyNutrition.totalProtein} 
                text={`${dailyNutrition.protein}g`}
                styles={{
                  path: { 
                    stroke: getMacroStatus('protein') === 'too-high' ? "#FF4B4B" : macroColors.protein
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              getMacroStatus('protein') === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dailyNutrition.protein}g / {dailyNutrition.totalProtein}g
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-16 h-16 relative",
              getMacroStatus('carbs') === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dailyNutrition.carbs} 
                maxValue={dailyNutrition.totalCarbs} 
                text={`${dailyNutrition.carbs}g`}
                styles={{
                  path: { 
                    stroke: getMacroStatus('carbs') === 'too-high' ? "#FF4B4B" : macroColors.carbs
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              getMacroStatus('carbs') === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dailyNutrition.carbs}g / {dailyNutrition.totalCarbs}g
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className={cn(
              "w-16 h-16 relative",
              getMacroStatus('fat') === 'too-high' && "animate-pulse-light"
            )}>
              <CircularProgressbar 
                value={dailyNutrition.fat} 
                maxValue={dailyNutrition.totalFat} 
                text={`${dailyNutrition.fat}g`}
                styles={{
                  path: { 
                    stroke: getMacroStatus('fat') === 'too-high' ? "#FF4B4B" : macroColors.fat
                  },
                  text: { fill: '#3c3c3c', fontSize: '30px' },
                  trail: { stroke: '#f9f9f9' }
                }}
              />
            </div>
            <span className={cn(
              "text-xs text-center mt-1",
              getMacroStatus('fat') === 'target-met' ? "text-green-600" : "text-gray-700"
            )}>
              {dailyNutrition.fat}g / {dailyNutrition.totalFat}g
            </span>
          </div>
        </div>
      </div>
      
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
                    {meal.recipe.macros?.calories || 0} kcal
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <div 
                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleOpenRecipe(meal.recipe)}
                  >
                    <img 
                      src={meal.recipe.imageSrc || imageUrl} 
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
            ))
          )}
        </div>
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
