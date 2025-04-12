
import { supabase } from "@/integrations/supabase/client";
import { ExternalFood } from "@/types/food";
import { Recipe } from "@/data/mockData";

// Convert USDA API food item to our app's Recipe format
export const convertToMealFormat = (foodItem: any, quantity: number = 1): Recipe => {
  // Calculate macros based on quantity
  const calories = Math.round((foodItem.nutrients.ENERC_KCAL || 0) * quantity);
  const protein = Math.round((foodItem.nutrients.PROCNT || 0) * quantity);
  const carbs = Math.round((foodItem.nutrients.CHOCDF || 0) * quantity);
  const fat = Math.round((foodItem.nutrients.FAT || 0) * quantity);

  return {
    id: `usda-${foodItem.foodId}`,
    name: foodItem.label,
    type: 'snack', // Default type, can be changed by user
    description: foodItem.brand ? `${foodItem.brand}` : '',
    imageSrc: foodItem.image || '',
    brand: foodItem.brand || '',
    macros: {
      calories,
      protein,
      carbs,
      fat
    },
    // Required Recipe properties
    requiresBlender: false,
    requiresCooking: false,
    cookTime: 0,
    prepTime: 0,
    servings: 1,
    ingredients: [],
    instructions: [],
    externalSource: true,
    externalId: foodItem.foodId
  };
};

// Search for foods in the USDA database
export const searchFoods = async (query: string): Promise<any[]> => {
  try {
    console.log(`Searching for foods with query: ${query}`);
    
    // We'll use a Supabase Edge Function to proxy our API calls
    const { data, error } = await supabase.functions.invoke("search-foods", {
      body: { query }
    });

    if (error) {
      console.error("Error searching foods:", error);
      throw error;
    }

    // Process and return the data
    if (data && Array.isArray(data)) {
      console.log(`Found ${data.length} food items`);
      
      // Make sure each item has brand and correct nutrient values
      const processedData = data.map(item => {
        return {
          ...item,
          brand: item.brand || '',
          nutrients: {
            ENERC_KCAL: item.nutrients.ENERC_KCAL || 0,
            PROCNT: item.nutrients.PROCNT || 0,
            CHOCDF: item.nutrients.CHOCDF || 0, 
            FAT: item.nutrients.FAT || 0
          }
        };
      });
      
      return processedData;
    }

    return [];
  } catch (error) {
    console.error("Error in searchFoods:", error);
    throw error;
  }
};
