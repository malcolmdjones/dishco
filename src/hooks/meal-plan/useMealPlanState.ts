
import { useState, useEffect } from 'react';
import { addDays, format, startOfDay } from 'date-fns';
import { Recipe } from '@/types/Recipe';
import { MealPlanDay } from '@/types/MealPlanTypes';

export const useMealPlanState = (initialDays = 7) => {
  // Initialize meal plan with specified number of days
  const initializeMealPlan = (days: number): MealPlanDay[] => {
    const currentDate = startOfDay(new Date());
    
    return Array.from({ length: days }).map((_, index) => ({
      date: format(addDays(currentDate, index), 'yyyy-MM-dd'),
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: []
      }
    }));
  };

  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(initializeMealPlan(initialDays));
  const [currentDay, setCurrentDay] = useState(0);
  
  // Locked meals state (to prevent regeneration)
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({
    breakfast: false,
    lunch: false,
    dinner: false
  });
  
  const [lockedSnacks, setLockedSnacks] = useState<boolean[]>([]);

  // Initialize locked snacks array when meal plan changes
  useEffect(() => {
    if (mealPlan && mealPlan[currentDay] && mealPlan[currentDay].meals.snacks) {
      const snacks = Array.isArray(mealPlan[currentDay].meals.snacks) ? 
        mealPlan[currentDay].meals.snacks : 
        [mealPlan[currentDay].meals.snacks];
      
      // Initialize with false values for each snack
      setLockedSnacks(Array(snacks.length).fill(false));
    }
  }, [mealPlan, currentDay]);

  // Methods for locking/unlocking meals
  const toggleLockMeal = (mealType: string, index?: number) => {
    if (mealType === 'snacks' && typeof index === 'number') {
      setLockedSnacks(prev => {
        const newLocks = [...prev];
        newLocks[index] = !newLocks[index];
        return newLocks;
      });
    } else {
      setLockedMeals(prev => ({
        ...prev,
        [mealType]: !prev[mealType]
      }));
    }
  };

  // Update a specific meal in the plan
  const updateMeal = (mealType: string, recipe: Recipe | null, index?: number) => {
    setMealPlan(prevPlan => {
      const newPlan = [...prevPlan];
      const currentDayMeals = { ...newPlan[currentDay].meals };

      if (mealType === 'snacks' && typeof index === 'number') {
        // Handle snacks array
        let snacks = Array.isArray(currentDayMeals.snacks) ? 
          [...currentDayMeals.snacks as Recipe[]] : 
          currentDayMeals.snacks ? [currentDayMeals.snacks as Recipe] : [];
        
        if (index >= 0) {
          // Replace specific snack
          snacks = snacks.map((snack, i) => (i === index ? recipe : snack));
        } else {
          // Add new snack
          snacks.push(recipe as Recipe);
        }
        
        currentDayMeals.snacks = snacks.filter(Boolean);
      } else {
        // Handle other meal types
        currentDayMeals[mealType as keyof typeof currentDayMeals] = recipe;
      }

      newPlan[currentDay] = {
        ...newPlan[currentDay],
        meals: currentDayMeals
      };
      
      return newPlan;
    });
  };

  return {
    mealPlan,
    setMealPlan,
    currentDay,
    setCurrentDay,
    lockedMeals,
    lockedSnacks,
    toggleLockMeal,
    updateMeal
  };
};
