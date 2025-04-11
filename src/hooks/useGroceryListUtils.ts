import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Define types for our ingredients and meal plan structure
export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  checked?: boolean;
}

interface Recipe {
  name: string;
  ingredients?: Ingredient[];
  // Add other properties as needed
}

interface MealPlan {
  name?: string;
  plan_data: {
    days: Array<{
      date: string;
      meals: {
        breakfast?: Recipe;
        lunch?: Recipe;
        dinner?: Recipe;
        snacks?: Recipe[];
      };
    }>;
  };
}

export const useGroceryListUtils = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);

  // Function to extract all ingredients from a meal plan
  const extractIngredientsFromMealPlan = (mealPlan: MealPlan): Ingredient[] => {
    const allIngredients: Ingredient[] = [];
    const ingredientMap = new Map<string, Ingredient>();
    
    mealPlan.plan_data.days.forEach(day => {
      // Process breakfast
      if (day.meals.breakfast?.ingredients) {
        processIngredients(day.meals.breakfast.ingredients, ingredientMap);
      }
      
      // Process lunch
      if (day.meals.lunch?.ingredients) {
        processIngredients(day.meals.lunch.ingredients, ingredientMap);
      }
      
      // Process dinner
      if (day.meals.dinner?.ingredients) {
        processIngredients(day.meals.dinner.ingredients, ingredientMap);
      }
      
      // Process snacks
      if (day.meals.snacks) {
        day.meals.snacks.forEach(snack => {
          if (snack.ingredients) {
            processIngredients(snack.ingredients, ingredientMap);
          }
        });
      }
    });
    
    // Convert map values to array
    ingredientMap.forEach((value) => {
      allIngredients.push(value);
    });
    
    return allIngredients;
  };
  
  // Helper function to process ingredients and combine duplicates
  const processIngredients = (ingredients: Ingredient[], map: Map<string, Ingredient>) => {
    ingredients.forEach(ingredient => {
      const normalizedName = ingredient.name.toLowerCase().trim();
      
      if (map.has(normalizedName)) {
        // If ingredient already exists, try to combine quantities
        const existingIngredient = map.get(normalizedName)!;
        
        // For now, we'll just keep track that we have this ingredient multiple times
        // A more sophisticated version would attempt to add quantities
        const newQty = parseInt(existingIngredient.quantity) + parseInt(ingredient.quantity || "1");
        existingIngredient.quantity = newQty.toString();
      } else {
        // Add new ingredient to map
        map.set(normalizedName, {
          ...ingredient,
          checked: false,
          // Ensure quantity is a string
          quantity: ingredient.quantity || "1"
        });
      }
    });
  };
  
  // Function to add ingredients to grocery list
  const addToGroceryList = (ingredients: Ingredient[]) => {
    try {
      // Get existing grocery items
      const existingItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      
      // Create a map of existing items by name for quick lookup
      const existingItemsMap = new Map();
      existingItems.forEach((item: any) => {
        existingItemsMap.set(item.name.toLowerCase().trim(), item);
      });
      
      // Add new ingredients, combining with existing items if needed
      const newItems = [...existingItems];
      
      ingredients.forEach(ingredient => {
        const normalizedName = ingredient.name.toLowerCase().trim();
        
        if (existingItemsMap.has(normalizedName)) {
          // Update existing item quantity
          const existingItem = existingItemsMap.get(normalizedName);
          const newQty = parseInt(existingItem.quantity) + parseInt(ingredient.quantity || "1");
          existingItem.quantity = newQty.toString();
        } else {
          // Add as new item
          newItems.push({
            id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: ingredient.name,
            category: ingredient.category || 'Other',
            quantity: ingredient.quantity || "1",
            unit: ingredient.unit || 'item(s)',
            checked: false
          });
        }
      });
      
      // Save back to localStorage
      localStorage.setItem('groceryItems', JSON.stringify(newItems));
      
      toast({
        title: "Grocery List Updated",
        description: `${ingredients.length} items added to your grocery list.`,
      });
      
      // Navigate to grocery list page
      navigate('/grocery');
    } catch (error) {
      console.error('Error adding ingredients to grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to add ingredients to your grocery list.",
        variant: "destructive"
      });
    }
  };
  
  // Main function to show confirmation and process meal plan
  const processMealPlanForGroceries = (mealPlan: MealPlan) => {
    setCurrentMealPlan(mealPlan);
    setShowConfirmation(true);
  };
  
  // Handler for confirmation dialog
  const handleConfirmGroceryAddition = () => {
    if (currentMealPlan) {
      const ingredients = extractIngredientsFromMealPlan(currentMealPlan);
      addToGroceryList(ingredients);
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
