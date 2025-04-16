
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
  
  // Parse a quantity string to a number if possible
  const parseQuantity = (quantityStr: string): number => {
    // Try to parse the quantity - handle fractions, decimals, etc.
    if (!quantityStr) return 1;
    
    // Handle common fractions
    if (quantityStr.includes('/')) {
      const parts = quantityStr.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
    }
    
    // Handle mixed numbers (like "1 1/2")
    const mixedMatch = quantityStr.match(/(\d+)\s+(\d+)\/(\d+)/);
    if (mixedMatch) {
      const whole = parseFloat(mixedMatch[1]);
      const numerator = parseFloat(mixedMatch[2]);
      const denominator = parseFloat(mixedMatch[3]);
      if (!isNaN(whole) && !isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return whole + (numerator / denominator);
      }
    }
    
    // Try simple number parsing
    const parsed = parseFloat(quantityStr);
    return isNaN(parsed) ? 1 : parsed;
  };
  
  // Format quantity for display
  const formatQuantity = (quantity: number): string => {
    // If it's a whole number, display as integer
    if (Number.isInteger(quantity)) {
      return quantity.toString();
    }
    
    // Check if it's a simple fraction
    const fractions: Record<number, string> = {
      0.25: '1/4',
      0.5: '1/2',
      0.75: '3/4',
      0.33: '1/3',
      0.67: '2/3',
      0.2: '1/5',
      0.4: '2/5',
      0.6: '3/5',
      0.8: '4/5'
    };
    
    // Try to match with common fractions
    for (const [decimal, fraction] of Object.entries(fractions)) {
      if (Math.abs(quantity - parseFloat(decimal)) < 0.01) {
        return fraction;
      }
    }
    
    // For mixed numbers
    if (quantity > 1) {
      const whole = Math.floor(quantity);
      const decimal = quantity - whole;
      
      // Try to match the decimal part with common fractions
      for (const [dec, fraction] of Object.entries(fractions)) {
        if (Math.abs(decimal - parseFloat(dec)) < 0.01) {
          return `${whole} ${fraction}`;
        }
      }
    }
    
    // Default to 1 decimal place
    return quantity.toFixed(1);
  };

  // Normalize ingredient name for comparison
  const normalizeIngredientName = (name: string): string => {
    // Convert to lowercase, trim spaces
    let normalized = name.toLowerCase().trim();
    
    // Remove pluralization
    if (normalized.endsWith('s') && normalized.length > 2) {
      normalized = normalized.slice(0, -1);
    }
    
    // Handle common synonyms
    const synonymMap: Record<string, string> = {
      'banana': 'banana',
      'bananas': 'banana',
      'bell pepper': 'bell pepper',
      'bell peppers': 'bell pepper',
      // Add more synonym mappings as needed
    };
    
    return synonymMap[normalized] || normalized;
  };
  
  // Helper function to process a single ingredient
  const processIngredient = (ingredient: any, map: Map<string, Ingredient>) => {
    // Handle different ingredient formats
    let name, quantityStr, unit;
    
    if (typeof ingredient === 'string') {
      // Parse string format like "1 cup flour"
      const parts = ingredient.trim().split(/\s+/);
      if (parts.length >= 2) {
        quantityStr = parts[0];
        name = parts.slice(1).join(' ');
        
        // Try to extract unit if present
        if (parts.length >= 3) {
          const commonUnits = ['cup', 'cups', 'tbsp', 'tsp', 'oz', 'g', 'kg', 'lb', 'ml', 'l'];
          if (commonUnits.includes(parts[1].toLowerCase())) {
            quantityStr = parts[0];
            unit = parts[1];
            name = parts.slice(2).join(' ');
          }
        }
      } else {
        name = ingredient;
        quantityStr = "1";
      }
    } else if (typeof ingredient === 'object' && ingredient !== null) {
      // Handle object format
      if ('name' in ingredient) {
        name = ingredient.name;
        quantityStr = ingredient.quantity || "1";
        unit = ingredient.unit;
      } else if ('ingredient' in ingredient) {
        name = ingredient.ingredient;
        quantityStr = ingredient.quantity || "1";
        unit = ingredient.unit;
      }
    }
    
    // Skip if we couldn't determine a name
    if (!name) return;
    
    const normalizedName = normalizeIngredientName(name);
    const quantity = parseQuantity(quantityStr || "1");
    
    if (map.has(normalizedName)) {
      // If ingredient already exists, combine quantities
      const existingIngredient = map.get(normalizedName)!;
      
      // Parse existing quantity
      const existingQuantity = parseQuantity(existingIngredient.quantity);
      
      // Add the quantities
      const newQuantity = existingQuantity + quantity;
      
      // Update with the combined quantity and keep the unit if available
      existingIngredient.quantity = formatQuantity(newQuantity);
      if (!existingIngredient.unit && unit) {
        existingIngredient.unit = unit;
      }
    } else {
      // Add new ingredient to map
      map.set(normalizedName, {
        name,
        checked: false,
        quantity: formatQuantity(quantity),
        unit: unit || ''
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
      
      // Create a map of existing items by normalized name for quick lookup
      const existingItemsMap = new Map();
      existingItems.forEach((item: any) => {
        if (item && item.name) {
          existingItemsMap.set(normalizeIngredientName(item.name), item);
        }
      });
      
      // Add new ingredients, combining with existing items if needed
      const newItems = [...existingItems];
      const processedItems = new Set<string>();
      
      ingredients.forEach(ingredient => {
        if (!ingredient || !ingredient.name) return;
        
        const normalizedName = normalizeIngredientName(ingredient.name);
        
        // Skip if we've already processed an ingredient with this normalized name
        if (processedItems.has(normalizedName)) return;
        
        if (existingItemsMap.has(normalizedName)) {
          // Update existing item quantity
          const existingItem = existingItemsMap.get(normalizedName);
          const existingQuantity = parseQuantity(existingItem.quantity);
          const ingredientQuantity = parseQuantity(ingredient.quantity);
          const newQuantity = existingQuantity + ingredientQuantity;
          
          existingItem.quantity = formatQuantity(newQuantity);
          // Keep the unit if it exists
          if (!existingItem.unit && ingredient.unit) {
            existingItem.unit = ingredient.unit;
          }
        } else {
          // Add as new item
          newItems.push({
            id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: ingredient.name,
            category: ingredient.category || 'Other',
            quantity: ingredient.quantity,
            unit: ingredient.unit || '',
            checked: false
          });
        }
        
        processedItems.add(normalizedName);
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
