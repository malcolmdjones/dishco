import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/Recipe';
import { FoodDatabaseItem, SearchResult, LoggedMeal } from '@/types/food';

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
export const foodItemToRecipe = (foodItem: FoodDatabaseItem | SearchResult): Recipe => {
  return {
    id: foodItem.id,
    name: foodItem.name,
    type: 'food',
    description: `${foodItem.brand || 'Common food'} - ${foodItem.servingSize || '1'} ${foodItem.servingUnit || 'serving'}`,
    imageSrc: foodItem.imageSrc || null,
    macros: foodItem.macros,
    externalSource: true,
    storeBought: true
  };
};

// Add to recent foods
export const addToRecentFoods = (food: FoodDatabaseItem) => {
  try {
    const recentFoods = getRecentFoods();
    // Check if this food is already in the recent foods
    const existingIndex = recentFoods.findIndex(item => item.id === food.id);
    if (existingIndex !== -1) {
      // Remove it from its current position
      recentFoods.splice(existingIndex, 1);
    }
    // Add it to the beginning
    recentFoods.unshift(food);
    // Keep only the most recent 10 items
    const trimmedList = recentFoods.slice(0, 10);
    localStorage.setItem('recentFoods', JSON.stringify(trimmedList));
  } catch (error) {
    console.error('Error adding to recent foods:', error);
  }
};

// Get recent foods
export const getRecentFoods = (): FoodDatabaseItem[] => {
  return [...recentFoods];
};

// Mock barcode scanning functionality
export const scanBarcode = async (code: string): Promise<FoodDatabaseItem | null> => {
  try {
    // In a real app, we'd call an API to get product info from the barcode
    // For now, return mock data
    console.log(`Scanning barcode: ${code}`);
    return {
      id: `barcode-${code}`,
      name: `Product ${code}`,
      brand: 'Unknown Brand',
      servingSize: '100',
      servingUnit: 'g',
      isCommon: false,
      imageSrc: null,
      macros: {
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 5
      }
    };
  } catch (error) {
    console.error('Error scanning barcode:', error);
    return null;
  }
};
