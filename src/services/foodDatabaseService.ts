import { supabase } from "@/integrations/supabase/client";
import { ExternalFood, FoodDatabaseItem, OpenFoodFactsProduct, BarcodeResponse } from "@/types/food";
import { Recipe } from "@/data/mockData";

// Convert OpenFoodFacts API food item to our app's Recipe format
export const convertToMealFormat = (foodItem: any, quantity: number = 1): Recipe => {
  // Calculate macros based on quantity
  const calories = Math.round((foodItem.nutrients.ENERC_KCAL || 0) * quantity);
  const protein = Math.round((foodItem.nutrients.PROCNT || 0) * quantity);
  const carbs = Math.round((foodItem.nutrients.CHOCDF || 0) * quantity);
  const fat = Math.round((foodItem.nutrients.FAT || 0) * quantity);

  return {
    id: `fs-${foodItem.foodId}`, // Changed prefix from off- to fs- for FatSecret
    name: foodItem.label,
    type: 'snack', // Default type, can be changed by user
    description: foodItem.servingSize ? `${foodItem.servingSize}` : '',
    imageSrc: foodItem.image || '',
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
    externalId: foodItem.foodId,
  };
};

// Convert external food to FoodDatabaseItem
export const convertExternalToLocalFood = (externalFood: ExternalFood): FoodDatabaseItem => {
  return {
    id: externalFood.id,
    name: externalFood.name,
    brand: externalFood.brand,
    macros: externalFood.macros,
    servingSize: externalFood.servingSize,
    servingUnit: externalFood.servingUnit,
    imageSrc: externalFood.imageSrc,
    type: externalFood.type || 'snack',
    isCommon: false
  };
};

// Mock local database for common foods
const commonFoods: FoodDatabaseItem[] = [
  {
    id: 'common-1',
    name: 'Apple',
    macros: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    servingSize: '1',
    servingUnit: 'medium',
    imageSrc: 'https://www.fda.gov/files/food/published/fruits-and-vegetables-723x406-72-dpi.jpg',
    isCommon: true,
    type: 'snack'
  },
  {
    id: 'common-2',
    name: 'Chicken Breast',
    macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    servingSize: '100',
    servingUnit: 'g',
    imageSrc: 'https://cdn.britannica.com/16/234216-050-C66F8665/bevy-of-bluebirds-feast-on-birdseed.jpg',
    isCommon: true,
    type: 'protein'
  },
  {
    id: 'common-3',
    name: 'Brown Rice',
    macros: { calories: 215, protein: 5, carbs: 45, fat: 1.8 },
    servingSize: '1',
    servingUnit: 'cup cooked',
    imageSrc: 'https://www.healthyeating.org/images/default-source/home-0.0/nutrition-topics-2.0/general-nutrition-wellness/2-2-2-2foodgroups_vegetables_detailfeature.jpg?sfvrsn=226f1bc7_6',
    isCommon: true,
    type: 'carb'
  },
  {
    id: 'common-4',
    name: 'Egg',
    macros: { calories: 70, protein: 6, carbs: 0.6, fat: 5 },
    servingSize: '1',
    servingUnit: 'large',
    imageSrc: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/dairy-shutterstock_311353164.jpg',
    isCommon: true,
    type: 'protein'
  },
  {
    id: 'common-5',
    name: 'Greek Yogurt',
    brand: 'Generic',
    macros: { calories: 100, protein: 17, carbs: 6, fat: 0.5 },
    servingSize: '170',
    servingUnit: 'g',
    imageSrc: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/dairy-shutterstock_311353164.jpg',
    isCommon: true,
    type: 'dairy'
  }
];

// Get recently used foods from local storage
export const getRecentFoods = (): FoodDatabaseItem[] => {
  try {
    const recentFoodsJSON = localStorage.getItem('recentFoods') || '[]';
    return JSON.parse(recentFoodsJSON);
  } catch (error) {
    console.error("Error getting recent foods:", error);
    return [];
  }
};

// Add food to recent foods
export const addToRecentFoods = (food: FoodDatabaseItem) => {
  try {
    const recentFoods = getRecentFoods();
    // Remove if already exists
    const filteredFoods = recentFoods.filter(item => item.id !== food.id);
    // Add to beginning of array
    const updatedFoods = [food, ...filteredFoods].slice(0, 20); // Keep only last 20
    localStorage.setItem('recentFoods', JSON.stringify(updatedFoods));
  } catch (error) {
    console.error("Error adding to recent foods:", error);
  }
};

// Search foods using FatSecret API (replacing OpenFoodFacts)
export const searchFoods = async (query: string, searchExternal: boolean = true): Promise<FoodDatabaseItem[]> => {
  if (!query.trim()) return [];
  
  try {
    console.log(`Searching for foods with query: ${query}`);
    
    // First, search in common foods
    const localResults = commonFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Then, search in recent foods
    const recentFoods = getRecentFoods();
    const recentResults = recentFoods.filter(food => 
      !localResults.some(local => local.id === food.id) && 
      (food.name.toLowerCase().includes(query.toLowerCase()) ||
       (food.brand && food.brand.toLowerCase().includes(query.toLowerCase())))
    );
    
    const combinedResults = [...localResults, ...recentResults];
    
    // If we have enough local results or user doesn't want external search, return them
    if (combinedResults.length >= 5 || !searchExternal) {
      return combinedResults;
    }
    
    // Search using FatSecret API through our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("search-fatsecret", {
      body: { query }
    });

    if (error) {
      console.error("Error searching foods:", error);
      return combinedResults;
    }

    // Process and return the data
    if (data && Array.isArray(data)) {
      console.log(`Found ${data.length} external food items from FatSecret`);
      
      const processedData = data.map(item => {
        const externalItem: FoodDatabaseItem = {
          id: `fs-${item.foodId}`,  // Using fs- prefix for FatSecret foods
          name: item.label,
          brand: item.brand || '',
          macros: {
            calories: Math.round(item.nutrients.ENERC_KCAL || 0),
            protein: Math.round(item.nutrients.PROCNT || 0),
            carbs: Math.round(item.nutrients.CHOCDF || 0),
            fat: Math.round(item.nutrients.FAT || 0)
          },
          servingSize: item.servingSize || '',
          servingUnit: '',
          imageSrc: item.image || '',
          isCommon: false,
          type: 'snack'
        };
        return externalItem;
      });
      
      return [...combinedResults, ...processedData];
    }

    return combinedResults;
  } catch (error) {
    console.error("Error in searchFoods:", error);
    return [...commonFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(query.toLowerCase()))
    ), ...getRecentFoods().filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(query.toLowerCase()))
    )];
  }
};

// Convert FoodDatabaseItem to Recipe for the meal log
export const foodItemToRecipe = (foodItem: FoodDatabaseItem, quantity: number = 1): Recipe => {
  const calories = Math.round(foodItem.macros.calories * quantity);
  const protein = Math.round(foodItem.macros.protein * quantity);
  const carbs = Math.round(foodItem.macros.carbs * quantity);
  const fat = Math.round(foodItem.macros.fat * quantity);

  return {
    id: foodItem.id,
    name: foodItem.name,
    type: foodItem.type || 'snack',
    description: foodItem.servingSize ? `${foodItem.servingSize} ${foodItem.servingUnit || ''}` : '',
    imageSrc: foodItem.imageSrc || '',
    macros: {
      calories,
      protein,
      carbs,
      fat
    },
    requiresBlender: false,
    requiresCooking: false,
    cookTime: 0,
    prepTime: 0,
    servings: 1,
    ingredients: [],
    instructions: [],
    externalSource: !foodItem.isCommon,
    externalId: foodItem.id
  };
};

// Scan barcode using OpenFoodFacts API
export const scanBarcode = async (barcode: string): Promise<FoodDatabaseItem | null> => {
  try {
    console.log(`Looking up barcode: ${barcode}`);
    
    // Call our Supabase Edge Function for the lookup
    const { data, error } = await supabase.functions.invoke("lookup-barcode", {
      body: { barcode }
    });
    
    if (error) {
      console.error(`Error calling lookup-barcode function: ${error.message}`);
      return null;
    }
    
    if (!data || data.error || !data.product) {
      console.log(`Product not found for barcode ${barcode}`);
      return null;
    }
    
    // Extract product data
    const product = data.product;
    
    // Log more details about what we found
    console.log(`Found product: ${product.product_name || 'Unknown'}`);
    console.log(`Brand: ${product.brands || 'Unknown'}`);
    console.log(`Nutrition data:`, product.nutriments);
    
    // Create FoodDatabaseItem from product
    const foodItem: FoodDatabaseItem = {
      id: `off-barcode-${product.code}`,
      name: product.product_name || `Product ${product.code}`,
      brand: product.brands || '',
      macros: {
        calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
        protein: Math.round(product.nutriments?.proteins_100g || 0),
        carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
        fat: Math.round(product.nutriments?.fat_100g || 0)
      },
      servingSize: product.serving_size || product.quantity || '100g',
      servingUnit: '',
      imageSrc: product.image_url || '',
      isCommon: false,
      type: 'snack'
    };
    
    // Check if we have valid nutrition data before returning
    if (foodItem.macros.calories === 0 && foodItem.macros.protein === 0 && 
        foodItem.macros.carbs === 0 && foodItem.macros.fat === 0) {
      console.log('Product found but has no nutrition data');
      
      // Try alternative nutrition field formats in OpenFoodFacts
      if (product.nutriments) {
        // Try alternative calorie fields
        if (product.nutriments['energy-kcal']) foodItem.macros.calories = Math.round(product.nutriments['energy-kcal']);
        else if (product.nutriments['energy']) {
          // Convert kJ to kcal if that's all we have
          const kj = product.nutriments['energy'];
          if (kj) foodItem.macros.calories = Math.round(kj / 4.184); // Convert kJ to kcal
        }
        
        // Sometimes values are per serving rather than per 100g
        if (product.nutriments['proteins_serving']) foodItem.macros.protein = Math.round(product.nutriments['proteins_serving']);
        if (product.nutriments['carbohydrates_serving']) foodItem.macros.carbs = Math.round(product.nutriments['carbohydrates_serving']);
        if (product.nutriments['fat_serving']) foodItem.macros.fat = Math.round(product.nutriments['fat_serving']);
      }
      
      // If we still have no data, use estimated values based on food category
      if (foodItem.macros.calories === 0) {
        // Set reasonable defaults based on product category
        const category = product.categories_tags ? product.categories_tags[0] : '';
        if (category.includes('beverage') || category.includes('drink')) {
          foodItem.macros = { calories: 50, protein: 0, carbs: 12, fat: 0 };
        } else {
          foodItem.macros = { calories: 200, protein: 5, carbs: 25, fat: 10 };
        }
        foodItem.name += ' (est. nutrition)';
      }
    }
    
    // Add to recent foods
    addToRecentFoods(foodItem);
    
    return foodItem;
  } catch (error) {
    console.error("Error scanning barcode:", error);
    return null;
  }
};
