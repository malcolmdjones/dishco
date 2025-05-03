
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MealPlanDay, NutritionGoals, defaultGoals, fetchNutritionGoals } from '@/types/MealPlanTypes';
import { Recipe } from '@/types/Recipe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';

/**
 * Hook to manage the basic state of the meal plan
 */
export const useMealPlanState = () => {
  const { toast } = useToast();
  const { recipes, getRecipesByType } = useRecipes();
  const location = useLocation();
  const preferences = location.state?.preferences || {
    days: 7,
    mealMood: [],
    proteinFocus: [],
    cravings: [],
    cuisineVibes: []
  };
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [userGoals, setUserGoals] = useState<NutritionGoals>(defaultGoals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});
  const [aiReasoning, setAiReasoning] = useState<string>("");

  // Get user's nutrition goals from Supabase
  useEffect(() => {
    const fetchUserNutritionGoals = async () => {
      try {
        // Try to fetch user's goals from Supabase
        const { data, error } = await supabase
          .from('nutrition_goals')
          .select('*')
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching nutrition goals:', error);
          // Fall back to local goals if error
          const localGoals = await fetchNutritionGoals();
          setUserGoals(localGoals);
          return;
        }
        
        if (data) {
          // Use Supabase nutrition goals
          setUserGoals({
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat
          });
        } else {
          // Fall back to local goals if no data
          const localGoals = await fetchNutritionGoals();
          setUserGoals(localGoals);
        }
      } catch (error) {
        console.error('Error fetching nutrition goals:', error);
        // Fall back to local goals on catch
        const localGoals = await fetchNutritionGoals();
        setUserGoals(localGoals);
      }
    };
    
    fetchUserNutritionGoals();
  }, []);

  // Initialize or generate meal plan
  useEffect(() => {
    if (mealPlan.length === 0) {
      generateFullMealPlan();
    }
  }, [userGoals]);

  // Filter recipes by meal type
  const getRandomRecipeByType = (type: string) => {
    const filteredRecipes = getRecipesByType(type);
    if (filteredRecipes.length > 0) {
      return filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
    }
    return null;
  };

  // Function to generate a meal plan for the entire week
  const generateFullMealPlan = () => {
    setIsGenerating(true);
    // Create a meal plan with the number of days from preferences (default 7)
    const days = preferences.days || 7;
    
    const newPlan: MealPlanDay[] = Array.from({ length: days }).map((_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i - currentDay); // Adjust to keep current day in sync
      
      // Generate initial recipes for each meal type
      const breakfastRecipe = getRandomRecipeByType('breakfast');
      const lunchRecipe = getRandomRecipeByType('lunch');
      const dinnerRecipe = getRandomRecipeByType('dinner');
      const snackRecipe = getRandomRecipeByType('snack');

      return {
        date: date.toISOString(),
        meals: {
          breakfast: breakfastRecipe ? [breakfastRecipe] : [],
          lunch: lunchRecipe ? [lunchRecipe] : [],
          dinner: dinnerRecipe ? [dinnerRecipe] : [],
          snacks: snackRecipe ? [snackRecipe] : []
        }
      };
    });
    
    setMealPlan(newPlan);
    setIsGenerating(false);
    
    // Apply preferences here when you integrate with an actual meal generation algorithm
    console.log('Generating meal plan with preferences:', preferences);
    
    // For development, you might want to see the preferences in a toast
    if (Object.keys(preferences).length > 1) {
      toast({
        title: `Created a ${days}-day meal plan`,
        description: `Based on your selected preferences`
      });
    }
  };

  return {
    currentDate,
    setCurrentDate,
    currentDay,
    setCurrentDay,
    mealPlan,
    setMealPlan,
    userGoals,
    isGenerating,
    setIsGenerating,
    lockedMeals,
    setLockedMeals,
    aiReasoning,
    setAiReasoning,
    generateFullMealPlan,
    preferences
  };
};
