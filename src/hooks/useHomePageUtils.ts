
import { useState, useEffect } from 'react';
import { startOfDay, format, addDays, subDays, isPast, isSameDay } from 'date-fns';
import { Recipe } from '@/types/Recipe';
import { supabase } from '@/integrations/supabase/client';
import { LoggedMeal } from '@/types/food';
import { useSavedMealPlans } from './useSavedMealPlans';

export const useHomePageUtils = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [todaysMeals, setTodaysMeals] = useState<LoggedMeal[]>([]);
  const { mealPlans } = useSavedMealPlans();
  
  // Mock data for development - replace with actual API calls
  const dailyNutrition = {
    calories: { target: 2000, current: 1650 },
    protein: { target: 120, current: 95 },
    carbs: { target: 200, current: 180 },
    fat: { target: 65, current: 55 }
  };
  
  // Fetch meals for the selected date
  useEffect(() => {
    // This would normally be an API call to get meals for the selected date
    const fetchMealsForDate = async () => {
      // In a real app, this would fetch from API based on selectedDate
      // For now, generate some mock meals
      const mockMeals: LoggedMeal[] = [
        {
          id: '1',
          name: 'Breakfast Bowl',
          recipe: {
            id: '101',
            name: 'Breakfast Bowl',
            description: 'Nutritious breakfast bowl',
            imageSrc: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
            macros: { calories: 350, protein: 20, carbs: 40, fat: 10 }
          },
          calories: 350,
          protein: '20g',
          servingInfo: '1 bowl',
          type: 'breakfast',
          date: format(selectedDate, 'yyyy-MM-dd'),
          consumed: true
        },
        {
          id: '2',
          name: 'Grilled Chicken Salad',
          recipe: {
            id: '102',
            name: 'Grilled Chicken Salad',
            description: 'Fresh salad with grilled chicken',
            imageSrc: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
            macros: { calories: 420, protein: 35, carbs: 15, fat: 20 }
          },
          calories: 420,
          protein: '35g',
          servingInfo: '1 plate',
          type: 'lunch',
          date: format(selectedDate, 'yyyy-MM-dd'),
          consumed: isPast(selectedDate) && !isSameDay(selectedDate, new Date())
        },
        {
          id: '3',
          name: 'Salmon with Vegetables',
          recipe: {
            id: '103',
            name: 'Salmon with Vegetables',
            description: 'Baked salmon with roasted vegetables',
            imageSrc: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
            macros: { calories: 550, protein: 40, carbs: 20, fat: 25 }
          },
          calories: 550,
          protein: '40g',
          servingInfo: '1 fillet',
          type: 'dinner',
          date: format(selectedDate, 'yyyy-MM-dd'),
          consumed: false
        },
        {
          id: '4',
          name: 'Greek Yogurt',
          recipe: {
            id: '104',
            name: 'Greek Yogurt',
            description: 'Plain Greek yogurt with honey',
            imageSrc: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
            macros: { calories: 180, protein: 15, carbs: 10, fat: 5 }
          },
          calories: 180,
          protein: '15g',
          servingInfo: '1 cup',
          type: 'snack',
          date: format(selectedDate, 'yyyy-MM-dd'),
          consumed: false
        }
      ];
      
      // Filter based on date - in a real app, this would be done by API
      const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
      const filteredMeals = mockMeals.filter(meal => meal.date === formattedSelectedDate);
      
      setTodaysMeals(filteredMeals);
    };
    
    fetchMealsForDate();
  }, [selectedDate]);
  
  // Navigation functions
  const goToPreviousDay = () => setSelectedDate(prevDate => subDays(prevDate, 1));
  const goToNextDay = () => setSelectedDate(prevDate => addDays(prevDate, 1));
  const goToToday = () => setSelectedDate(new Date());
  
  // Recipe handling functions
  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
    setIsSaved(false); // This would be determined by API in real app
  };
  
  const handleToggleSave = async (recipeId: string, isSavedNow: boolean) => {
    setIsSaved(isSavedNow);
    // In real app, would call API to save/unsave recipe
  };
  
  const handleToggleConsumed = (mealId: string, consumed: boolean) => {
    setTodaysMeals(prevMeals =>
      prevMeals.map(meal =>
        meal.id === mealId ? { ...meal, consumed } : meal
      )
    );
    // In real app, would call API to update meal consumed status
  };

  // Handle recipe consumed toggle from recipe viewer
  const handleRecipeConsumed = (mealId: string, consumed: boolean) => {
    handleToggleConsumed(mealId, consumed);
  };
  
  // Helper functions
  const getMacroStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 70) return 'under';
    if (percentage > 110) return 'over';
    return 'good';
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
