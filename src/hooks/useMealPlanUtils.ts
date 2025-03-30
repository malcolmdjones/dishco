
import { useState, useEffect } from 'react';
import { calculateDailyMacros, defaultGoals, fetchNutritionGoals, recipes, Recipe, NutritionGoals, MealPlanDay } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMealPlanUtils = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [userGoals, setUserGoals] = useState<NutritionGoals>(defaultGoals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});
  const [aiReasoning, setAiReasoning] = useState<string>("");

  // Get user's nutrition goals
  useEffect(() => {
    const getUserGoals = async () => {
      try {
        const goals = await fetchNutritionGoals();
        setUserGoals(goals);
      } catch (error) {
        console.error('Error fetching nutrition goals:', error);
      }
    };
    getUserGoals();
  }, []);

  // Initialize or generate meal plan
  useEffect(() => {
    if (mealPlan.length === 0) {
      generateFullMealPlan();
    }
  }, [userGoals]);

  // Function to generate a meal plan for the entire week
  const generateFullMealPlan = () => {
    setIsGenerating(true);
    // Create a 7-day meal plan
    const newPlan: MealPlanDay[] = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i - currentDay); // Adjust to keep current day in sync
      
      return {
        date: date.toISOString(),
        meals: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snacks: [null, null]
        }
      };
    });
    
    setMealPlan(newPlan);
    regenerateMeals();
  };

  // Function to regenerate meals for the current day using AI
  const regenerateMeals = async () => {
    setIsGenerating(true);
    setAiReasoning("");
    
    try {
      // Prepare locked meals data
      const currentLockedMeals: {[key: string]: any} = {};
      if (mealPlan[currentDay]) {
        const currentMeals = mealPlan[currentDay].meals;
        
        if (lockedMeals[`${currentDay}-breakfast`] && currentMeals.breakfast) {
          currentLockedMeals.breakfast = currentMeals.breakfast;
        }
        
        if (lockedMeals[`${currentDay}-lunch`] && currentMeals.lunch) {
          currentLockedMeals.lunch = currentMeals.lunch;
        }
        
        if (lockedMeals[`${currentDay}-dinner`] && currentMeals.dinner) {
          currentLockedMeals.dinner = currentMeals.dinner;
        }
        
        if (lockedMeals[`${currentDay}-snack-0`] && currentMeals.snacks?.[0]) {
          currentLockedMeals['snack-0'] = currentMeals.snacks[0];
        }
        
        if (lockedMeals[`${currentDay}-snack-1`] && currentMeals.snacks?.[1]) {
          currentLockedMeals['snack-1'] = currentMeals.snacks[1];
        }
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('meal-plan-ai', {
        body: {
          userGoals,
          lockedMeals: currentLockedMeals,
          availableRecipes: recipes,
          currentDay,
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Apply the AI-generated meal plan to the current day
      if (data && data.mealPlan) {
        setMealPlan(prevPlan => {
          const newPlan = [...prevPlan];
          const currentPlanDay = { ...newPlan[currentDay] };
          
          currentPlanDay.meals = {
            breakfast: data.mealPlan.breakfast,
            lunch: data.mealPlan.lunch,
            dinner: data.mealPlan.dinner,
            snacks: data.mealPlan.snacks
          };
          
          newPlan[currentDay] = currentPlanDay;
          return newPlan;
        });
        
        // Store AI reasoning if provided
        if (data.reasoning) {
          setAiReasoning(data.reasoning);
        }
        
        toast({
          title: "Meal Plan Updated",
          description: "Your meals have been generated based on your nutrition goals.",
        });
      } else {
        throw new Error("Received invalid data from AI service");
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error Generating Meal Plan",
        description: error.message || "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to the original method if AI fails
      fallbackMealGeneration();
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fallback method if AI fails
  const fallbackMealGeneration = () => {
    setTimeout(() => {
      setMealPlan(prevPlan => {
        const newPlan = [...prevPlan];
        const currentPlanDay = { ...newPlan[currentDay] };
        
        // Filter recipes by meal type
        const breakfastRecipes = recipes.filter(r => r.type === 'breakfast');
        const lunchRecipes = recipes.filter(r => r.type === 'lunch');
        const dinnerRecipes = recipes.filter(r => r.type === 'dinner');
        const snackRecipes = recipes.filter(r => r.type === 'snack');
        
        // Only replace meals that aren't locked
        const newMeals = { ...currentPlanDay.meals };
        
        if (!lockedMeals[`${currentDay}-breakfast`]) {
          newMeals.breakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-lunch`]) {
          newMeals.lunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-dinner`]) {
          newMeals.dinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
        }
        
        // Handle snacks
        const newSnacks = [...(newMeals.snacks || [])];
        if (!lockedMeals[`${currentDay}-snack-0`] || !newSnacks[0]) {
          newSnacks[0] = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-snack-1`] || !newSnacks[1]) {
          newSnacks[1] = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
        }
        
        newMeals.snacks = newSnacks;
        currentPlanDay.meals = newMeals;
        newPlan[currentDay] = currentPlanDay;
        
        return newPlan;
      });
      
      toast({
        title: "Meal Plan Updated (Fallback Mode)",
        description: "Your meals have been regenerated using our basic algorithm.",
      });
    }, 1000);
  };

  // Toggle meal lock status
  const toggleLockMeal = (mealType: string, index?: number) => {
    const key = index !== undefined ? `${currentDay}-${mealType}-${index}` : `${currentDay}-${mealType}`;
    
    setLockedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: lockedMeals[key] ? "Meal Unlocked" : "Meal Locked",
      description: lockedMeals[key] 
        ? "This meal can now be changed when regenerating." 
        : "This meal will stay the same when regenerating.",
    });
  };

  // Calculate current day's nutrition totals
  const calculateDayTotals = () => {
    if (!mealPlan[currentDay]) return userGoals;
    
    const dayMeals = mealPlan[currentDay].meals;
    return calculateDailyMacros(dayMeals);
  };

  // Check if current meals exceed user goals
  const checkExceedsGoals = () => {
    const totals = calculateDayTotals();
    const exceeds = {
      calories: totals.calories > userGoals.calories + 75,
      protein: totals.protein > userGoals.protein + 2,
      carbs: totals.carbs > userGoals.carbs + 5,
      fat: totals.fat > userGoals.fat + 5
    };
    
    return {
      any: exceeds.calories || exceeds.protein || exceeds.carbs || exceeds.fat,
      exceeds
    };
  };

  return {
    currentDate,
    currentDay,
    setCurrentDay,
    mealPlan,
    userGoals,
    isGenerating,
    lockedMeals,
    aiReasoning,
    generateFullMealPlan,
    regenerateMeals,
    toggleLockMeal,
    calculateDayTotals,
    checkExceedsGoals
  };
};
