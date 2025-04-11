
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
  ingredients?: Ingredient[] | string[] | Record<string, any>[];
  // Add other properties as needed
}

interface MealPlan {
  name?: string;
  id?: string;
  plan_data: {
    days: Array<{
      date: string;
      meals: {
        breakfast?: Recipe | Recipe[];
        lunch?: Recipe | Recipe[];
        dinner?: Recipe | Recipe[];
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
    
    // Log the meal plan for debugging
    console.log('Processing meal plan for ingredients:', mealPlan);
    
    mealPlan.plan_data.days.forEach(day => {
      if (!day.meals) return;
      
      // Process breakfast
      processMealForIngredients(day.meals.breakfast, ingredientMap);
      
      // Process lunch
      processMealForIngredients(day.meals.lunch, ingredientMap);
      
      // Process dinner
      processMealForIngredients(day.meals.dinner, ingredientMap);
      
      // Process snacks
      if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
        day.meals.snacks.forEach(snack => {
          processMealForIngredients(snack, ingredientMap);
        });
      }
    });
    
    // Convert map values to array
    ingredientMap.forEach((value) => {
      allIngredients.push(value);
    });
    
    // Log extracted ingredients for debugging
    console.log('Extracted ingredients:', allIngredients);
    
    return allIngredients;
  };
  
  // Helper function to process ingredients from a meal
  const processMealForIngredients = (meal: any, map: Map<string, Ingredient>) => {
    if (!meal) return;
    
    // Handle both single meal and array of meals
    const mealsToProcess = Array.isArray(meal) ? meal : [meal];
    
    mealsToProcess.forEach(mealItem => {
      if (!mealItem) return;
      
      // Process ingredients depending on their format
      if (mealItem.ingredients) {
        const ingredients = mealItem.ingredients;
        
        // Check if ingredients is an array
        if (Array.isArray(ingredients)) {
          ingredients.forEach(ingredient => {
            processIngredient(ingredient, map);
          });
        }
      }
    });
  };
  
  // Helper function to process a single ingredient
  const processIngredient = (ingredient: any, map: Map<string, Ingredient>) => {
    // Handle different ingredient formats
    let name, quantity, unit;
    
    if (typeof ingredient === 'string') {
      // Parse string format like "1 cup flour"
      const parts = ingredient.trim().split(/\s+/);
      if (parts.length >= 2) {
        quantity = parts[0];
        name = parts.slice(1).join(' ');
        
        // Try to extract unit if present
        if (parts.length >= 3) {
          const commonUnits = ['cup', 'cups', 'tbsp', 'tsp', 'oz', 'g', 'kg', 'lb', 'ml', 'l'];
          if (commonUnits.includes(parts[1].toLowerCase())) {
            quantity = parts[0];
            unit = parts[1];
            name = parts.slice(2).join(' ');
          }
        }
      } else {
        name = ingredient;
        quantity = "1";
      }
    } else if (typeof ingredient === 'object' && ingredient !== null) {
      // Handle object format
      if ('name' in ingredient) {
        name = ingredient.name;
        quantity = ingredient.quantity || "1";
        unit = ingredient.unit;
      } else if ('ingredient' in ingredient) {
        name = ingredient.ingredient;
        quantity = ingredient.quantity || "1";
      }
    }
    
    // Skip if we couldn't determine a name
    if (!name) return;
    
    const normalizedName = name.toLowerCase().trim();
    
    if (map.has(normalizedName)) {
      // If ingredient already exists, try to combine quantities
      const existingIngredient = map.get(normalizedName)!;
      
      let newQty = 1;
      // Handle both numeric quantities and string quantities
      try {
        const existingQty = parseInt(existingIngredient.quantity || "1");
        const ingredientQty = parseInt(quantity || "1");
        newQty = existingQty + ingredientQty;
      } catch (e) {
        console.warn('Error parsing quantities, defaulting to incremental:', e);
        newQty = parseInt(existingIngredient.quantity || "1") + 1;
      }
      
      existingIngredient.quantity = newQty.toString();
    } else {
      // Add new ingredient to map
      map.set(normalizedName, {
        name,
        checked: false,
        // Ensure quantity is a string
        quantity: quantity || "1",
        unit: unit
      });
    }
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
