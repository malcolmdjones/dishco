
import { supabase } from "@/integrations/supabase/client";

// Types for the Edamam Food Database API responses
export interface FoodItem {
  foodId: string;
  label: string;
  brand?: string;
  category?: string;
  categoryLabel?: string;
  servingsPerContainer?: number;
  nutrients: {
    ENERC_KCAL: number; // calories
    PROCNT: number; // protein
    FAT: number; // fat
    CHOCDF: number; // carbs
    FIBTG?: number; // fiber
  };
  image?: string;
  servingSizes?: Array<{
    uri: string;
    label: string;
    quantity: number;
  }>;
  source?: string;
}

export interface SearchFoodResponse {
  text: string;
  parsed: Array<{ food: FoodItem }>;
  hints: Array<{
    food: FoodItem;
    measures: Array<{
      uri: string;
      label: string;
      weight: number;
    }>;
  }>;
}

// Convert Edamam API food item to our app's format
export const convertToMealFormat = (foodItem: FoodItem, quantity: number = 1) => {
  return {
    id: `edamam-${foodItem.foodId}`,
    name: foodItem.label,
    type: 'snack', // Default type, can be changed by user
    description: foodItem.brand ? `${foodItem.brand} - ${foodItem.categoryLabel || ''}` : foodItem.categoryLabel || '',
    imageSrc: foodItem.image,
    macros: {
      calories: Math.round(foodItem.nutrients.ENERC_KCAL * quantity),
      protein: Math.round(foodItem.nutrients.PROCNT * quantity),
      carbs: Math.round(foodItem.nutrients.CHOCDF * quantity),
      fat: Math.round(foodItem.nutrients.FAT * quantity)
    },
    source: 'edamam',
    quantity: quantity,
    externalId: foodItem.foodId
  };
};

// Search for foods in the Edamam database
export const searchFoods = async (query: string): Promise<any[]> => {
  try {
    // We'll use a Supabase Edge Function to proxy our API calls
    // to avoid exposing API keys in the frontend
    const { data, error } = await supabase.functions.invoke("search-foods", {
      body: { query }
    });

    if (error) {
      console.error("Error searching foods:", error);
      return [];
    }

    // Process and return the data
    if (data && Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        // Ensure we have all required fields
        macros: {
          calories: item.nutrients?.ENERC_KCAL || 0,
          protein: item.nutrients?.PROCNT || 0,
          carbs: item.nutrients?.CHOCDF || 0,
          fat: item.nutrients?.FAT || 0
        },
        imageSrc: item.image
      }));
    }

    return [];
  } catch (error) {
    console.error("Error in searchFoods:", error);
    return [];
  }
};
