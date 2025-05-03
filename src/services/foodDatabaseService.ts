
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/Recipe';
import { FoodDatabaseItem, LoggedMeal } from '@/types/food';

// In-memory storage for recent foods
let recentFoods: FoodDatabaseItem[] = [];

// Search food database
export const searchFoods = async (query: string): Promise<FoodDatabaseItem[]> => {
  try {
    // Real implementation would call an API
    console.log(`Searching for: ${query}`);
    
    // Fetch from Supabase recipehub table with a search
    const { data, error } = await supabase
      .from('recipehub')
      .select('*')
      .or(`title.ilike.%${query}%, short_description.ilike.%${query}%`)
      .limit(10);
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id || `temp-${Date.now()}`,
      name: item.title || 'Unknown Food',
      brand: '',
      servingSize: item.nutrition_serving || '1 serving',
      servingUnit: 'serving',
      isCommon: true,
      imageSrc: item.image_url || null,
      macros: {
        calories: item.nutrition_calories || 0,
        protein: item.nutrition_protein || 0,
        carbs: item.nutrition_carbs || 0,
        fat: item.nutrition_fat || 0,
        fiber: item.nutrition_fiber || 0
      }
    }));
  } catch (error) {
    console.error("Error searching foods:", error);
    return [];
  }
};

// Convert a food item to a recipe format
export const foodItemToRecipe = (food: FoodDatabaseItem, quantity: number = 1): Recipe => {
  return {
    id: food.id,
    name: food.name,
    description: food.brand ? `${food.brand} - ${food.servingSize || ''}` : (food.servingSize || ''),
    type: 'food',
    imageSrc: food.imageSrc,
    macros: {
      calories: Math.round(food.macros.calories * quantity),
      protein: Math.round(food.macros.protein * quantity),
      carbs: Math.round(food.macros.carbs * quantity),
      fat: Math.round(food.macros.fat * quantity),
      fiber: food.macros.fiber ? Math.round(food.macros.fiber * quantity) : 0
    },
    storeBought: true
  };
};

// Add to recent foods
export const addToRecentFoods = (food: FoodDatabaseItem): void => {
  // Remove if already exists (to avoid duplicates)
  recentFoods = recentFoods.filter(item => item.id !== food.id);
  
  // Add to beginning of array
  recentFoods.unshift(food);
  
  // Limit to 10 items
  recentFoods = recentFoods.slice(0, 10);
};

// Get recent foods
export const getRecentFoods = (): FoodDatabaseItem[] => {
  return [...recentFoods];
};

// Mock barcode scanning functionality
export const scanBarcode = async (barcode: string): Promise<FoodDatabaseItem | null> => {
  try {
    // In a real app, this would call an actual barcode API
    console.log(`Scanning barcode: ${barcode}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a dummy food item based on barcode
    return {
      id: `barcode-${barcode}`,
      name: `Food Item (Barcode: ${barcode.substring(0, 4)})`,
      brand: 'Generic Brand',
      servingSize: '1 serving',
      servingUnit: 'serving',
      isCommon: false,
      imageSrc: null,
      macros: {
        calories: 200,
        protein: 10,
        carbs: 25,
        fat: 8,
        fiber: 2
      }
    };
  } catch (error) {
    console.error("Error scanning barcode:", error);
    return null;
  }
};
