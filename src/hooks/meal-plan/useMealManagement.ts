import { MealPlanDay, Recipe } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface MealManagementProps {
  mealPlan: MealPlanDay[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlanDay[]>>;
  currentDay: number;
  lockedMeals: {[key: string]: boolean};
  setLockedMeals: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
}

/**
 * Hook to manage meal operations like locking, updating, etc
 */
export const useMealManagement = ({
  mealPlan,
  setMealPlan,
  currentDay,
  lockedMeals,
  setLockedMeals
}: MealManagementProps) => {
  const { toast } = useToast();
  const MAX_MEALS_PER_TYPE = 10;

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
          currentMeals.snacks = [null]; // Changed to only have one null item
          currentPlanDay.meals = currentMeals;
          newPlan[currentDay] = currentPlanDay;
          return newPlan;
        }
      }

      if (!recipe && index === undefined) {
        return prevPlan; // Don't update if recipe is null and no index provided
      }

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
        // Modified to only handle a single snack
        currentMeals.snacks = recipe ? [recipe] : [null];
        
        currentPlanDay.meals = currentMeals;
        newPlan[currentDay] = currentPlanDay;
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

  return {
    toggleLockMeal,
    updateMeal
  };
};
