
import { useState, useEffect } from 'react';
import { format, addDays, subDays, isToday, isEqual, parseISO, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Recipe, defaultGoals } from '@/data/mockData';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';

interface Meal {
  id: string;
  name: string;
  type: string;
  recipe: Recipe;
  consumed: boolean;
  loggedAt?: string;
  planned?: boolean;
}

export const useHomePageUtils = () => {
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
    const loadMealsForSelectedDate = () => {
      const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
      
      const selectedDateStart = startOfDay(selectedDate);
      const filteredMeals = storedMeals.filter((meal: Meal) => {
        if (!meal.loggedAt) return false;
        const mealDate = startOfDay(parseISO(meal.loggedAt));
        return isEqual(mealDate, selectedDateStart);
      });
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('HomePage - Loading meals for date:', formattedDate);
      
      const planMeals = getMealsForDate(formattedDate);
      console.log('HomePage - Plan meals retrieved:', planMeals);
      
      const plannedMealArray: Meal[] = [];
      
      if (planMeals) {
        if (planMeals.breakfast) {
          const breakfastRecipe = Array.isArray(planMeals.breakfast) 
            ? planMeals.breakfast[0] 
            : planMeals.breakfast;
            
          if (breakfastRecipe) {
            plannedMealArray.push({
              id: `breakfast-planned-${formattedDate}`,
              name: breakfastRecipe.name || 'Breakfast',
              type: 'breakfast',
              recipe: breakfastRecipe,
              consumed: false,
              loggedAt: formattedDate,
              planned: true
            });
          }
        }
        
        if (planMeals.lunch) {
          const lunchRecipe = Array.isArray(planMeals.lunch) 
            ? planMeals.lunch[0] 
            : planMeals.lunch;
            
          if (lunchRecipe) {
            plannedMealArray.push({
              id: `lunch-planned-${formattedDate}`,
              name: lunchRecipe.name || 'Lunch',
              type: 'lunch',
              recipe: lunchRecipe,
              consumed: false,
              loggedAt: formattedDate,
              planned: true
            });
          }
        }
        
        if (planMeals.dinner) {
          const dinnerRecipe = Array.isArray(planMeals.dinner) 
            ? planMeals.dinner[0] 
            : planMeals.dinner;
            
          if (dinnerRecipe) {
            plannedMealArray.push({
              id: `dinner-planned-${formattedDate}`,
              name: dinnerRecipe.name || 'Dinner',
              type: 'dinner',
              recipe: dinnerRecipe,
              consumed: false,
              loggedAt: formattedDate,
              planned: true
            });
          }
        }
        
        if (planMeals.snacks && Array.isArray(planMeals.snacks) && planMeals.snacks.length > 0) {
          planMeals.snacks.forEach((snack, index) => {
            if (snack) {
              plannedMealArray.push({
                id: `snack-planned-${index}-${formattedDate}`,
                name: snack.name || `Snack ${index + 1}`,
                type: 'snack',
                recipe: snack,
                consumed: false,
                loggedAt: formattedDate,
                planned: true
              });
            }
          });
        }
      }
      
      const updatedPlannedMeals = plannedMealArray.map(plannedMeal => {
        const matchingLoggedMeal = filteredMeals.find((loggedMeal: Meal) => 
          loggedMeal.recipe?.id === plannedMeal.recipe?.id && 
          loggedMeal.type === plannedMeal.type
        );
        
        return matchingLoggedMeal ? { ...plannedMeal, consumed: true } : plannedMeal;
      });
      
      const uniqueLoggedMeals = filteredMeals.filter((loggedMeal: Meal) => 
        !updatedPlannedMeals.some(plannedMeal => 
          plannedMeal.recipe?.id === loggedMeal.recipe?.id && 
          plannedMeal.type === loggedMeal.type
        )
      );
      
      console.log('HomePage - Setting today\'s meals:', [...uniqueLoggedMeals, ...updatedPlannedMeals]);
      setTodaysMeals([...uniqueLoggedMeals, ...updatedPlannedMeals]);
      
      calculateNutritionForDate([...uniqueLoggedMeals, ...updatedPlannedMeals.filter(meal => meal.consumed)]);
    };
    
    loadMealsForSelectedDate();
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
      if (meal.recipe && meal.recipe.macros) {
        calculatedNutrition.calories += meal.recipe.macros.calories || 0;
        calculatedNutrition.protein += meal.recipe.macros.protein || 0;
        calculatedNutrition.carbs += meal.recipe.macros.carbs || 0;
        calculatedNutrition.fat += meal.recipe.macros.fat || 0;
      }
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

  const handleOpenRecipe = (recipe: Recipe) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeViewerOpen(true);
    } else {
      console.error("Attempted to open undefined recipe");
      toast({
        title: "Error",
        description: "Recipe details couldn't be loaded.",
        variant: "destructive"
      });
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
    
    calculateNutritionForDate(updatedTodaysMeals.filter(m => m.consumed));
    
    if (!meal.consumed) {
      toast({
        title: "Meal logged",
        description: `${meal.name} has been marked as consumed.`
      });
    } else {
      toast({
        title: "Meal unlogged",
        description: `${meal.name} has been unmarked as consumed.`
      });
    }
  };

  const handleRecipeConsumed = (recipe: Recipe, isConsumed: boolean) => {
    const mealWithRecipe = todaysMeals.find(meal => 
      meal.recipe?.id === recipe.id || 
      (Array.isArray(meal.recipe) && meal.recipe.some(r => r.id === recipe.id))
    );
    
    if (mealWithRecipe) {
      handleToggleConsumed(mealWithRecipe);
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

  const formatMealType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return {
    selectedDate,
    selectedRecipe,
    isRecipeViewerOpen,
    isSaved,
    dailyNutrition,
    todaysMeals,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    handleOpenRecipe,
    handleToggleSave,
    handleToggleConsumed,
    handleRecipeConsumed,
    getMacroStatus,
    formatMealType,
    setIsRecipeViewerOpen,
    setSelectedRecipe
  };
};
