
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
  id?: string;
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
    
    if (!mealPlan.plan_data || !mealPlan.plan_data.days) {
      console.error('Invalid meal plan structure', mealPlan);
      return allIngredients;
    }
    
    mealPlan.plan_data.days.forEach(day => {
      if (!day.meals) return;
      
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
          if (snack && snack.ingredients) {
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
      // Guard against undefined or null ingredient names
      if (!ingredient || !ingredient.name) {
        console.warn('Skipping invalid ingredient:', ingredient);
        return;
      }
      
      const normalizedName = ingredient.name.toLowerCase().trim();
      
      if (map.has(normalizedName)) {
        // If ingredient already exists, try to combine quantities
        const existingIngredient = map.get(normalizedName)!;
        
        let newQty = 1;
        // Handle both numeric quantities and string quantities
        try {
          const existingQty = parseInt(existingIngredient.quantity || "1");
          const ingredientQty = parseInt(ingredient.quantity || "1");
          newQty = existingQty + ingredientQty;
        } catch (e) {
          console.warn('Error parsing quantities, defaulting to incremental:', e);
          newQty = parseInt(existingIngredient.quantity || "1") + 1;
        }
        
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
      if (!ingredients || ingredients.length === 0) {
        console.warn('No ingredients to add to grocery list');
        toast({
          title: "No Ingredients",
          description: "No ingredients found to add to your grocery list.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Adding ingredients to grocery list:', ingredients);
      
      // Get existing grocery items
      const existingItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      
      // Create a map of existing items by name for quick lookup
      const existingItemsMap = new Map();
      existingItems.forEach((item: any) => {
        if (item && item.name) {
          existingItemsMap.set(item.name.toLowerCase().trim(), item);
        }
      });
      
      // Add new ingredients, combining with existing items if needed
      const newItems = [...existingItems];
      
      ingredients.forEach(ingredient => {
        if (!ingredient || !ingredient.name) return;
        
        const normalizedName = ingredient.name.toLowerCase().trim();
        
        if (existingItemsMap.has(normalizedName)) {
          // Update existing item quantity
          const existingItem = existingItemsMap.get(normalizedName);
          try {
            const newQty = parseInt(existingItem.quantity) + parseInt(ingredient.quantity || "1");
            existingItem.quantity = newQty.toString();
          } catch (e) {
            console.warn('Error updating quantity, incrementing by 1:', e);
            existingItem.quantity = (parseInt(existingItem.quantity) + 1).toString();
          }
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
      addToGroceryList(ingredients);
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
