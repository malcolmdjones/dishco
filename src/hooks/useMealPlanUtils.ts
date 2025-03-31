import { useState, useEffect, useCallback } from 'react';
import { calculateDailyMacros, defaultGoals, fetchNutritionGoals, recipes as mockRecipes, Recipe, NutritionGoals, MealPlanDay } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useMealPlanUtils = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [userGoals, setUserGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});
  const [aiReasoning, setAiReasoning] = useState<string>("");
  const [dbRecipes, setDbRecipes] = useState<Recipe[]>([]);

  // Fetch user's nutrition goals from Supabase
  const fetchNutritionGoals = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching nutrition goals:', error);
        return;
      }

      if (data) {
        console.info('Using database nutrition goals:', data);
        setUserGoals({
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat
        });
      }
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
    }
  }, [user]);

  // When user changes, fetch nutrition goals
  useEffect(() => {
    if (user) {
      fetchNutritionGoals();
    }
  }, [user, fetchNutritionGoals]);

  // Fetch recipes from the database
  const fetchDbRecipes = useCallback(async () => {
    try {
      // First try to fetch user's recipes
      let { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(*),
          recipe_instructions(*),
          recipe_equipment(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Convert database recipes to the Recipe format
      const formattedRecipes = data.map(dbRecipe => {
        const recipeType = dbRecipe.meal_type?.toLowerCase() || 'other';
        
        // Map database recipe to Recipe format
        const recipe: Recipe = {
          id: dbRecipe.id,
          name: dbRecipe.name,
          type: recipeType === 'breakfast' ? 'breakfast' : 
                recipeType === 'lunch' ? 'lunch' : 
                recipeType === 'dinner' ? 'dinner' : 
                recipeType === 'snack' ? 'snack' : 'other',
          description: dbRecipe.description || '',
          ingredients: dbRecipe.recipe_ingredients?.map(ing => ing.name) || [],
          instructions: dbRecipe.recipe_instructions?.map(inst => inst.instruction) || [],
          prepTime: dbRecipe.prep_time || 0,
          cookTime: dbRecipe.cook_time || 0,
          servings: dbRecipe.servings || 1,
          macros: {
            calories: dbRecipe.calories || 0,
            protein: dbRecipe.protein || 0,
            carbs: dbRecipe.carbs || 0,
            fat: dbRecipe.fat || 0
          },
          imageSrc: dbRecipe.image_url || '/placeholder.svg'
        };

        return recipe;
      });

      // Set the recipes in state
      if (formattedRecipes.length > 0) {
        setDbRecipes(formattedRecipes);
        console.log('Using database recipes:', formattedRecipes.length);
      } else {
        // Fallback to mock recipes if no database recipes are available
        setDbRecipes([]);
        toast({
          title: "No Recipes Found",
          description: "Please add recipes in the Recipe Management page.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      // Fallback to empty recipes in case of error
      setDbRecipes([]);
      toast({
        title: "Error Loading Recipes",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Check for a plan to copy from session storage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem('planToCopy');
    const storedLockedMeals = sessionStorage.getItem('lockedMeals');
    
    if (storedPlan && storedLockedMeals) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        const parsedLockedMeals = JSON.parse(storedLockedMeals);
        
        if (parsedPlan.days && Array.isArray(parsedPlan.days)) {
          setMealPlan(parsedPlan.days.map((day: any) => ({
            date: day.date || new Date().toISOString(),
            meals: day.meals || {
              breakfast: null,
              lunch: null,
              dinner: null,
              snacks: [null, null]
            }
          })));
          
          setLockedMeals(parsedLockedMeals);
        }
      } catch (error) {
        console.error('Error parsing copied plan data:', error);
        generateFullMealPlan(); // Fallback
      }
    } else if (mealPlan.length === 0) {
      // Initialize if no copied plan and no meal plan yet
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
      // Make sure we have recipes
      if (dbRecipes.length === 0) {
        await fetchDbRecipes();
      }
      
      // Check if we have recipes to work with
      if (dbRecipes.length === 0) {
        toast({
          title: "No Recipes Available",
          description: "Only admin can add recipes to the recipe vault.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
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
          availableRecipes: dbRecipes,
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
    if (dbRecipes.length === 0) {
      toast({
        title: "No Recipes Available",
        description: "Only admin can add recipes to the recipe vault.",
        variant: "destructive"
      });
      return;
    }
    
    setTimeout(() => {
      setMealPlan(prevPlan => {
        const newPlan = [...prevPlan];
        const currentPlanDay = { ...newPlan[currentDay] };
        
        const availableRecipes = dbRecipes;
        
        // Filter recipes by meal type
        const breakfastRecipes = availableRecipes.filter(r => r.type === 'breakfast');
        const lunchRecipes = availableRecipes.filter(r => r.type === 'lunch');
        const dinnerRecipes = availableRecipes.filter(r => r.type === 'dinner');
        const snackRecipes = availableRecipes.filter(r => r.type === 'snack');
        
        // Only replace meals that aren't locked
        const newMeals = { ...currentPlanDay.meals };
        
        if (!lockedMeals[`${currentDay}-breakfast`]) {
          newMeals.breakfast = breakfastRecipes.length > 0 ? 
            breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)] :
            availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-lunch`]) {
          newMeals.lunch = lunchRecipes.length > 0 ? 
            lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)] :
            availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-dinner`]) {
          newMeals.dinner = dinnerRecipes.length > 0 ? 
            dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)] :
            availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        }
        
        // Handle snacks
        const newSnacks = [...(newMeals.snacks || [])];
        if (!lockedMeals[`${currentDay}-snack-0`] || !newSnacks[0]) {
          newSnacks[0] = snackRecipes.length > 0 ? 
            snackRecipes[Math.floor(Math.random() * snackRecipes.length)] :
            availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-snack-1`] || !newSnacks[1]) {
          newSnacks[1] = snackRecipes.length > 0 ? 
            snackRecipes[Math.floor(Math.random() * snackRecipes.length)] :
            availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
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
    const totals = calculateDailyMacros(dayMeals);
    
    // Return the user's goals along with the day totals
    return {
      ...totals,
      goals: userGoals
    };
  };

  // Check if current meals exceed user goals
  const checkExceedsGoals = () => {
    const totals = calculateDayTotals();
    const exceeds = {
      calories: totals.calories > userGoals.calories,
      protein: totals.protein > userGoals.protein,
      carbs: totals.carbs > userGoals.carbs,
      fat: totals.fat > userGoals.fat
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
    dbRecipes,
    generateFullMealPlan,
    regenerateMeals,
    toggleLockMeal,
    calculateDayTotals,
    checkExceedsGoals,
    fetchDbRecipes,
    fetchNutritionGoals
  };
};
