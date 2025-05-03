import { MealPlanDay } from '@/types/MealPlanTypes';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';

interface MealGenerationProps {
  mealPlan: MealPlanDay[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlanDay[]>>;
  currentDay: number;
  lockedMeals: {[key: string]: boolean};
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setAiReasoning: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Hook to handle meal plan generation functionality
 */
export const useMealGeneration = ({
  mealPlan,
  setMealPlan,
  currentDay,
  lockedMeals,
  setIsGenerating,
  setAiReasoning
}: MealGenerationProps) => {
  const { toast } = useToast();
  const { recipes, getRecipesByType } = useRecipes();

  // Function to regenerate meals for the current day
  const regenerateMeals = async () => {
    if (!mealPlan || mealPlan.length === 0 || !mealPlan[currentDay]) {
      toast({
        title: "Error",
        description: "Cannot regenerate: Invalid meal plan data",
        variant: "destructive"
      });
      return;
    }
    
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
      setIsGenerating(false);
    }
  };
  
  // Fallback method for meal generation
  const fallbackMealGeneration = () => {
    setTimeout(() => {
      setMealPlan(prevPlan => {
        // Safety check for valid plan
        if (!prevPlan || prevPlan.length === 0 || currentDay >= prevPlan.length) {
          console.error("Invalid meal plan state during regeneration");
          return prevPlan;
        }
        
        const newPlan = [...prevPlan];
        const currentPlanDay = { ...newPlan[currentDay] };
        
        // Filter recipes by meal type
        const breakfastRecipes = getRecipesByType('breakfast');
        const lunchRecipes = getRecipesByType('lunch');
        const dinnerRecipes = getRecipesByType('dinner');
        const snackRecipes = getRecipesByType('snack');
        
        // Only replace meals that aren't locked
        const newMeals = { ...currentPlanDay.meals };
        
        // Initialize meal arrays if they don't exist yet
        if (!newMeals.breakfast) newMeals.breakfast = [];
        if (!newMeals.lunch) newMeals.lunch = [];
        if (!newMeals.dinner) newMeals.dinner = [];
        if (!newMeals.snacks) newMeals.snacks = [];

        // Handle breakfast meals
        if (Array.isArray(newMeals.breakfast)) {
          if (newMeals.breakfast.length === 0 || !newMeals.breakfast.some(item => item !== null)) {
            // If empty or only contains null values, add a random breakfast
            if (breakfastRecipes.length > 0) {
              const randomBreakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)];
              if (randomBreakfast) {
                newMeals.breakfast = [randomBreakfast];
              }
            }
          } else {
            // Keep only locked breakfast items
            let updatedBreakfast = [...newMeals.breakfast];
            updatedBreakfast = updatedBreakfast.filter((meal, index) => 
              lockedMeals[`${currentDay}-breakfast-${index}`]
            );
            
            // Add a random breakfast if empty (all were unlocked)
            if (updatedBreakfast.length === 0 && breakfastRecipes.length > 0) {
              const randomBreakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)];
              if (randomBreakfast) {
                updatedBreakfast.push(randomBreakfast);
              }
            }
            
            newMeals.breakfast = updatedBreakfast;
          }
        }
        
        // Handle lunch meals
        if (Array.isArray(newMeals.lunch)) {
          if (newMeals.lunch.length === 0 || !newMeals.lunch.some(item => item !== null)) {
            // If empty or only contains null values, add a random lunch
            if (lunchRecipes.length > 0) {
              const randomLunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)];
              if (randomLunch) {
                newMeals.lunch = [randomLunch];
              }
            }
          } else {
            // Keep only locked lunch items
            let updatedLunch = [...newMeals.lunch];
            updatedLunch = updatedLunch.filter((meal, index) => 
              lockedMeals[`${currentDay}-lunch-${index}`]
            );
            
            // Add a random lunch if empty (all were unlocked)
            if (updatedLunch.length === 0 && lunchRecipes.length > 0) {
              const randomLunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)];
              if (randomLunch) {
                updatedLunch.push(randomLunch);
              }
            }
            
            newMeals.lunch = updatedLunch;
          }
        }
        
        // Handle dinner meals
        if (Array.isArray(newMeals.dinner)) {
          if (newMeals.dinner.length === 0 || !newMeals.dinner.some(item => item !== null)) {
            // If empty or only contains null values, add a random dinner
            if (dinnerRecipes.length > 0) {
              const randomDinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
              if (randomDinner) {
                newMeals.dinner = [randomDinner];
              }
            }
          } else {
            // Keep only locked dinner items
            let updatedDinner = [...newMeals.dinner];
            updatedDinner = updatedDinner.filter((meal, index) => 
              lockedMeals[`${currentDay}-dinner-${index}`]
            );
            
            // Add a random dinner if empty (all were unlocked)
            if (updatedDinner.length === 0 && dinnerRecipes.length > 0) {
              const randomDinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
              if (randomDinner) {
                updatedDinner.push(randomDinner);
              }
            }
            
            newMeals.dinner = updatedDinner;
          }
        }
        
        // Handle snacks
        if (Array.isArray(newMeals.snacks)) {
          if (newMeals.snacks.length === 0 || !newMeals.snacks.some(item => item !== null)) {
            // If empty or only contains null values, add a random snack
            if (snackRecipes.length > 0) {
              const randomSnack = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
              if (randomSnack) {
                newMeals.snacks = [randomSnack];
              }
            }
          } else {
            // Keep only locked snack items
            let updatedSnacks = [...newMeals.snacks];
            updatedSnacks = updatedSnacks.filter((meal, index) => 
              lockedMeals[`${currentDay}-snacks-${index}`]
            );
            
            // Add a random snack if empty (all were unlocked)
            if (updatedSnacks.length === 0 && snackRecipes.length > 0) {
              const randomSnack = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
              if (randomSnack) {
                updatedSnacks.push(randomSnack);
              }
            }
            
            newMeals.snacks = updatedSnacks;
          }
        }
        
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

  return {
    regenerateMeals
  };
};
