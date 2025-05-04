
import { useState, useEffect, useCallback } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useFetchRecipes } from '@/hooks/useFetchRecipes';
import { useAuth } from '@/hooks/useAuth';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';

export const useHomePageUtils = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { recipes, loading: loadingRecipes, fetchRecipes } = useFetchRecipes();
  const { isAuthenticated, user } = useAuth();
  const { savedRecipeIds, isRecipeSaved, toggleSaveRecipe, getSavedRecipes } = useSavedRecipes(recipes, isAuthenticated);
  const [todayMeals, setTodayMeals] = useState<any[] | null>(null);
  const [todayNutrition, setTodayNutrition] = useState<any | null>(null);
  
  // Get meal plans
  const mealPlansHook = useSavedMealPlans();
  
  // Load meals for selected date
  const loadMealsForSelectedDate = useCallback(() => {
    if (!mealPlansHook || !mealPlansHook.activePlans) {
      setTodayMeals(null);
      return;
    }
    
    // Use the current date to get meals
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // This is a temporary workaround until we have a proper implementation
    // of getMealsForDate in the useSavedMealPlans hook
    let meals;
    try {
      meals = mealPlansHook.getMealsForDate ? mealPlansHook.getMealsForDate(formattedDate) : null;
    } catch (error) {
      console.error("Error getting meals for date:", error);
      meals = null;
    }
    
    if (!meals) {
      setTodayMeals(null);
      return;
    }
    
    // Format meals for display
    const mealsArray = [];
    
    // Add breakfast if available
    if (meals.breakfast && meals.breakfast.length > 0) {
      mealsArray.push({
        id: 'breakfast',
        time: '8:00 AM',
        name: 'Breakfast',
        recipes: Array.isArray(meals.breakfast) ? meals.breakfast : [meals.breakfast]
      });
    }
    
    // Add lunch if available
    if (meals.lunch && meals.lunch.length > 0) {
      mealsArray.push({
        id: 'lunch',
        time: '12:30 PM',
        name: 'Lunch',
        recipes: Array.isArray(meals.lunch) ? meals.lunch : [meals.lunch]
      });
    }
    
    // Add dinner if available
    if (meals.dinner && meals.dinner.length > 0) {
      mealsArray.push({
        id: 'dinner',
        time: '7:00 PM',
        name: 'Dinner',
        recipes: Array.isArray(meals.dinner) ? meals.dinner : [meals.dinner]
      });
    }
    
    // Add snacks if available
    if (meals.snacks && meals.snacks.length > 0) {
      meals.snacks.forEach((snack: any, index: number) => {
        mealsArray.push({
          id: `snack-${index}`,
          time: `${2 + index}:00 PM`,
          name: `Snack ${index + 1}`,
          recipes: [snack]
        });
      });
    }
    
    setTodayMeals(mealsArray);
    
    // Calculate nutrition totals
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    
    mealsArray.forEach(meal => {
      meal.recipes.forEach((recipe: any) => {
        if (recipe && recipe.macros) {
          calories += recipe.macros.calories || 0;
          protein += recipe.macros.protein || 0;
          carbs += recipe.macros.carbs || 0;
          fat += recipe.macros.fat || 0;
        }
      });
    });
    
    setTodayNutrition({
      calories,
      protein,
      carbs,
      fat
    });
    
  }, [selectedDate, mealPlansHook]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadMealsForSelectedDate();
  }, [loadMealsForSelectedDate, selectedDate]);
  
  return {
    selectedDate,
    setSelectedDate,
    recipes,
    loadingRecipes,
    isAuthenticated,
    user,
    savedRecipeIds,
    isRecipeSaved,
    toggleSaveRecipe,
    getSavedRecipes,
    todayMeals,
    todayNutrition,
    mealPlansHook
  };
};
