
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { GroceryMealPlan } from '@/types/groceryTypes';
import { extractIngredientsFromMealPlan } from '@/utils/ingredientExtractorUtils';
import { addToGroceryList } from '@/utils/groceryStorageUtils';

export const useGroceryListUtils = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<GroceryMealPlan | null>(null);
  
  // Main function to show confirmation and process meal plan
  const processMealPlanForGroceries = (mealPlan: GroceryMealPlan) => {
    console.log('Processing meal plan for groceries:', mealPlan);
    setCurrentMealPlan(mealPlan);
    setShowConfirmation(true);
  };
  
  // Handler for confirmation dialog
  const handleConfirmGroceryAddition = () => {
    if (currentMealPlan) {
      console.log('Confirming grocery addition for meal plan:', currentMealPlan);
      const ingredients = extractIngredientsFromMealPlan(currentMealPlan);
      console.log('Extracted ingredients:', ingredients);
      
      addToGroceryList(
        ingredients,
        () => {
          toast({
            title: "Grocery List Updated",
            description: `${ingredients.length} items added to your grocery list.`,
          });
          navigate('/grocery');
        },
        (error) => {
          toast({
            title: "Error",
            description: "Failed to add ingredients to your grocery list.",
            variant: "destructive"
          });
        }
      );
    } else {
      console.error('No current meal plan available');
      toast({
        title: "Error",
        description: "No meal plan selected for grocery list addition.",
        variant: "destructive"
      });
    }
    setShowConfirmation(false);
  };
  
  return {
    showConfirmation,
    setShowConfirmation,
    processMealPlanForGroceries,
    handleConfirmGroceryAddition,
    currentMealPlan
  };
};

// Re-export the individual types for backward compatibility
export type { Ingredient } from '@/types/groceryTypes';
