
import { Ingredient, Recipe, GroceryMealPlan } from '@/types/groceryTypes';

// Function to extract all ingredients from a meal plan
export const extractIngredientsFromMealPlan = (mealPlan: GroceryMealPlan): Ingredient[] => {
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
export const processMealForIngredients = (meal: any, map: Map<string, Ingredient>) => {
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
export const processIngredient = (ingredient: any, map: Map<string, Ingredient>) => {
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
