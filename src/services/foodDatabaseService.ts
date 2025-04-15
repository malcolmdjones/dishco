
import { supabase } from "@/integrations/supabase/client";
import { ExternalFood, FoodDatabaseItem, BarcodeResponse } from "@/types/food";
import { Recipe } from "@/data/mockData";

// Convert FatSecret API food item to our app's Recipe format
export const convertToMealFormat = (foodItem: any, quantity: number = 1): Recipe => {
  // Calculate macros based on quantity
  const calories = Math.round((foodItem.nutrients.ENERC_KCAL || 0) * quantity);
  const protein = Math.round((foodItem.nutrients.PROCNT || 0) * quantity);
  const carbs = Math.round((foodItem.nutrients.CHOCDF || 0) * quantity);
  const fat = Math.round((foodItem.nutrients.FAT || 0) * quantity);

  return {
    id: `fs-${foodItem.foodId}`,
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

// Search foods using FatSecret API
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
            fat: Math.round(item.nutrients.FAT || 0),
            fiber: item.nutrients.FIBTG || undefined,
            sugar: item.nutrients.SUGAR || undefined,
            sodium: item.nutrients.NA || undefined,
            cholesterol: item.nutrients.CHOLE || undefined,
            saturatedFat: item.nutrients.FASAT || undefined,
            transFat: item.nutrients.FATRN || undefined
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

// Scan barcode using FatSecret API
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
    
    // Extract product data from FatSecret response
    const product = data.product;
    
    // Log more details about what we found
    console.log(`Found product: ${product.food_name || 'Unknown'}`);
    console.log(`Brand: ${product.brand_name || 'Unknown'}`);
    
    // Get serving and nutrition info
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;
    let sugar = 0;
    let sodium = 0;
    let cholesterol = 0;
    let saturatedFat = 0;
    let transFat = 0;
    let servingSize = "1 serving";
    
    // Parse nutrition info from servings
    if (product.servings && product.servings.serving) {
      // FatSecret can return either an array of servings or a single serving object
      const servings = Array.isArray(product.servings.serving) 
        ? product.servings.serving 
        : [product.servings.serving];
      
      // Use the first serving (usually the default)
      if (servings.length > 0) {
        const serving = servings[0];
        calories = parseFloat(serving.calories) || 0;
        protein = parseFloat(serving.protein) || 0;
        carbs = parseFloat(serving.carbohydrate) || 0;
        fat = parseFloat(serving.fat) || 0;
        fiber = parseFloat(serving.fiber) || 0;
        sugar = parseFloat(serving.sugar) || 0;
        sodium = parseFloat(serving.sodium) || 0;
        cholesterol = parseFloat(serving.cholesterol) || 0;
        saturatedFat = parseFloat(serving.saturated_fat) || 0;
        transFat = parseFloat(serving.trans_fat) || 0;
        servingSize = serving.serving_description || "1 serving";
      }
    }
    
    // Create FoodDatabaseItem from product
    const foodItem: FoodDatabaseItem = {
      id: `fs-barcode-${product.food_id}`,
      name: product.food_name || `Product ${barcode}`,
      brand: product.brand_name || '',
      macros: {
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        fiber: Math.round(fiber),
        sugar: Math.round(sugar),
        sodium: Math.round(sodium),
        cholesterol: Math.round(cholesterol),
        saturatedFat: Math.round(saturatedFat),
        transFat: Math.round(transFat)
      },
      servingSize: servingSize,
      servingUnit: '',
      imageSrc: product.food_image || '',
      isCommon: false,
      type: 'snack'
    };
    
    // Add to recent foods
    addToRecentFoods(foodItem);
    
    return foodItem;
  } catch (error) {
    console.error("Error scanning barcode:", error);
    return null;
  }
};
