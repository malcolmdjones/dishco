
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
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [null, null]
        }
      };
    });
    
    setMealPlan(newPlan);
    regenerateMeals();
  };

  // Function to regenerate meals for the current day
  const regenerateMeals = async () => {
    setIsGenerating(true);
    setAiReasoning("");
    
    try {
      // Use only the fallback method for meal generation
      fallbackMealGeneration();
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error Generating Meal Plan",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Fallback method for meal generation
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
        
        // Initialize meal arrays if they don't exist yet
        if (!newMeals.breakfast) newMeals.breakfast = [];
        if (!newMeals.lunch) newMeals.lunch = [];
        if (!newMeals.dinner) newMeals.dinner = [];
        if (!newMeals.snacks) newMeals.snacks = [];

        // Handle breakfast meals
        if (Array.isArray(newMeals.breakfast)) {
          let updatedBreakfast = [...newMeals.breakfast];
          
          // Keep only locked breakfast items
          updatedBreakfast = updatedBreakfast.filter((meal, index) => 
            lockedMeals[`${currentDay}-breakfast-${index}`]
          );
          
          // Add a random breakfast if empty (all were unlocked)
          if (updatedBreakfast.length === 0) {
            const randomBreakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)];
            updatedBreakfast.push(randomBreakfast);
          }
          
          newMeals.breakfast = updatedBreakfast;
        }
        
        // Handle lunch meals
        if (Array.isArray(newMeals.lunch)) {
          let updatedLunch = [...newMeals.lunch];
          
          // Keep only locked lunch items
          updatedLunch = updatedLunch.filter((meal, index) => 
            lockedMeals[`${currentDay}-lunch-${index}`]
          );
          
          // Add a random lunch if empty (all were unlocked)
          if (updatedLunch.length === 0) {
            const randomLunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)];
            updatedLunch.push(randomLunch);
          }
          
          newMeals.lunch = updatedLunch;
        }
        
        // Handle dinner meals
        if (Array.isArray(newMeals.dinner)) {
          let updatedDinner = [...newMeals.dinner];
          
          // Keep only locked dinner items
          updatedDinner = updatedDinner.filter((meal, index) => 
            lockedMeals[`${currentDay}-dinner-${index}`]
          );
          
          // Add a random dinner if empty (all were unlocked)
          if (updatedDinner.length === 0) {
            const randomDinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
            updatedDinner.push(randomDinner);
          }
          
          newMeals.dinner = updatedDinner;
        }
        
        // Handle snacks
        const newSnacks = [...(newMeals.snacks || [null, null])];
        
        // Only replace snack 0 if not locked
        if (!lockedMeals[`${currentDay}-snack-0`]) {
          newSnacks[0] = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
        }
        
        // Only replace snack 1 if not locked
        if (!lockedMeals[`${currentDay}-snack-1`]) {
          newSnacks[1] = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
        }
        
        // Ensure we have at least 2 snack slots
        while (newSnacks.length < 2) {
          newSnacks.push(null);
        }
        
        newMeals.snacks = newSnacks;
        currentPlanDay.meals = newMeals;
        newPlan[currentDay] = currentPlanDay;
        
        return newPlan;
      });
      
      toast({
        title: "Meal Plan Updated",
        description: "Your meals have been regenerated.",
      });
      
      setIsGenerating(false);
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

  // Update a specific meal in the meal plan
  const updateMeal = (mealType: string, recipe: Recipe | null, index?: number) => {
    setMealPlan(prevPlan => {
      const newPlan = [...prevPlan];
      const currentPlanDay = { ...newPlan[currentDay] };
      const currentMeals = { ...currentPlanDay.meals };

      // Special case: index of -1 means clear the entire meal type
      if (index === -1) {
        if (mealType === 'breakfast') {
          currentMeals.breakfast = [];
          currentPlanDay.meals = currentMeals;
          newPlan[currentDay] = currentPlanDay;
          return newPlan;
        }
        if (mealType === 'lunch') {
          currentMeals.lunch = [];
          currentPlanDay.meals = currentMeals;
          newPlan[currentDay] = currentPlanDay;
          return newPlan;
        }
        if (mealType === 'dinner') {
          currentMeals.dinner = [];
          currentPlanDay.meals = currentMeals;
          newPlan[currentDay] = currentPlanDay;
          return newPlan;
        }
        if (mealType === 'snack') {
          currentMeals.snacks = [null, null];
          currentPlanDay.meals = currentMeals;
          newPlan[currentDay] = currentPlanDay;
          return newPlan;
        }
      }

      if (!recipe && index === undefined) {
        return prevPlan; // Don't update if recipe is null and no index provided
      }

      const MAX_MEALS_PER_TYPE = 10; // Increased from 5 to 10

      if (mealType === 'breakfast') {
        // Initialize the breakfast array if it doesn't exist
        if (!currentMeals.breakfast) {
          currentMeals.breakfast = [];
        } else if (!Array.isArray(currentMeals.breakfast)) {
          // Convert single recipe to array
          currentMeals.breakfast = [currentMeals.breakfast];
        }
        
        // If index is provided, insert at that position, otherwise add to the beginning
        const breakfastArray = [...currentMeals.breakfast];
        if (typeof index === 'number' && breakfastArray.length > index) {
          // Replace or remove specific meal
          if (recipe) {
            breakfastArray[index] = recipe;
          } else {
            breakfastArray.splice(index, 1);
          }
        } else if (recipe) {
          // Add to the beginning of the array, limit to MAX_MEALS_PER_TYPE meals
          if (breakfastArray.length < MAX_MEALS_PER_TYPE) {
            breakfastArray.unshift(recipe);
          } else {
            toast({
              title: "Maximum Reached",
              description: `You can have up to ${MAX_MEALS_PER_TYPE} breakfast items.`,
              variant: "destructive"
            });
          }
        }
        currentMeals.breakfast = breakfastArray;
      } 
      else if (mealType === 'lunch') {
        // Initialize the lunch array if it doesn't exist
        if (!currentMeals.lunch) {
          currentMeals.lunch = [];
        } else if (!Array.isArray(currentMeals.lunch)) {
          // Convert single recipe to array
          currentMeals.lunch = [currentMeals.lunch];
        }
        
        // If index is provided, insert at that position, otherwise add to the beginning
        const lunchArray = [...currentMeals.lunch];
        if (typeof index === 'number' && lunchArray.length > index) {
          // Replace or remove specific meal
          if (recipe) {
            lunchArray[index] = recipe;
          } else {
            lunchArray.splice(index, 1);
          }
        } else if (recipe) {
          // Add to the beginning of the array, limit to MAX_MEALS_PER_TYPE meals
          if (lunchArray.length < MAX_MEALS_PER_TYPE) {
            lunchArray.unshift(recipe);
          } else {
            toast({
              title: "Maximum Reached",
              description: `You can have up to ${MAX_MEALS_PER_TYPE} lunch items.`,
              variant: "destructive"
            });
          }
        }
        currentMeals.lunch = lunchArray;
      } 
      else if (mealType === 'dinner') {
        // Initialize the dinner array if it doesn't exist
        if (!currentMeals.dinner) {
          currentMeals.dinner = [];
        } else if (!Array.isArray(currentMeals.dinner)) {
          // Convert single recipe to array
          currentMeals.dinner = [currentMeals.dinner];
        }
        
        // If index is provided, insert at that position, otherwise add to the beginning
        const dinnerArray = [...currentMeals.dinner];
        if (typeof index === 'number' && dinnerArray.length > index) {
          // Replace or remove specific meal
          if (recipe) {
            dinnerArray[index] = recipe;
          } else {
            dinnerArray.splice(index, 1);
          }
        } else if (recipe) {
          // Add to the beginning of the array, limit to MAX_MEALS_PER_TYPE meals
          if (dinnerArray.length < MAX_MEALS_PER_TYPE) {
            dinnerArray.unshift(recipe);
          } else {
            toast({
              title: "Maximum Reached",
              description: `You can have up to ${MAX_MEALS_PER_TYPE} dinner items.`,
              variant: "destructive"
            });
          }
        }
        currentMeals.dinner = dinnerArray;
      } 
      else if (mealType === 'snack') {
        // Handle snacks with special case - these are limited to a fixed array
        const MAX_SNACKS = 10; // Increased from default
        const newSnacks = [...(currentMeals.snacks || [])];
        
        if (typeof index !== 'undefined') {
          // If index provided, update at that position
          if (recipe) {
            // Ensure the array is long enough
            while (newSnacks.length <= index) {
              newSnacks.push(null);
            }
            newSnacks[index] = recipe;
          } else if (index < newSnacks.length) {
            // Remove specific snack
            newSnacks.splice(index, 1);
            newSnacks.push(null); // Keep array length
          }
        } else if (recipe) {
          // Add new snack at first empty position or at end
          const emptyIndex = newSnacks.findIndex(s => s === null);
          if (emptyIndex >= 0) {
            newSnacks[emptyIndex] = recipe;
          } else if (newSnacks.length < MAX_SNACKS) {
            newSnacks.push(recipe);
          } else {
            toast({
              title: "Maximum Reached",
              description: `You can have up to ${MAX_SNACKS} snacks.`,
              variant: "destructive"
            });
          }
        }
        
        // Ensure minimum length
        while (newSnacks.length < 2) {
          newSnacks.push(null);
        }
        
        currentMeals.snacks = newSnacks;
      }

      currentPlanDay.meals = currentMeals;
      newPlan[currentDay] = currentPlanDay;
      return newPlan;
    });

    if (recipe) {
      toast({
        title: "Meal Updated",
        description: `Added ${recipe.name} to ${mealType}.`,
      });
    }
  };

  // Calculate current day's nutrition totals
  const calculateDayTotals = () => {
    if (!mealPlan[currentDay]) return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
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
    updateMeal,
    calculateDayTotals,
    checkExceedsGoals
  };
};
