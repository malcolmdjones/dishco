
// Types
export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageSrc: string;
  type?: string;
  requiresBlender?: boolean;
  requiresCooking?: boolean;
  mealType?: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlanDay {
  date: string;
  meals: {
    breakfast: Recipe[] | Recipe | null;
    lunch: Recipe[] | Recipe | null;
    dinner: Recipe[] | Recipe | null;
    snacks: (Recipe | null)[];
  };
}

// Default goals
export const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 200,
  fat: 65,
};

// Function to fetch nutrition goals (mock API call)
export const fetchNutritionGoals = async (): Promise<NutritionGoals> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return defaultGoals;
};

// Stock images for different meal types
const stockImages = {
  breakfast: [
    "https://images.unsplash.com/photo-1533089860892-a71c4c8219ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594003543508-2c11d13a0c95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  ],
  lunch: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1547496502-affa22d38842?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  ],
  dinner: [
    "https://images.unsplash.com/photo-1564834733143-6701a4b8fec9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  ],
  snack: [
    "https://images.unsplash.com/photo-1599642080669-0db91ed448fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1624712656107-1108e7de24b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621797739778-8f1bce0d49d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1613728913901-bc5b7d1c1337?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  ]
};

// Helper function to get a stock image based on recipe type
const getStockImage = (type: string) => {
  const images = stockImages[type as keyof typeof stockImages] || stockImages.snack;
  return images[Math.floor(Math.random() * images.length)];
};

// Mock recipes data
export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Overnight Oats with Berries',
    description: 'A simple, nutritious breakfast that you can prepare the night before.',
    ingredients: [
      '1/2 cup rolled oats', 
      '1/2 cup almond milk', 
      '1 tbsp chia seeds', 
      '1 tbsp honey', 
      '1/4 cup mixed berries'
    ],
    instructions: [
      'Mix oats, almond milk, chia seeds, and honey in a jar',
      'Seal and refrigerate overnight',
      'Top with fresh berries before serving'
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 350,
      protein: 12,
      carbs: 55,
      fat: 8
    },
    imageSrc: getStockImage('breakfast'),
    type: 'breakfast',
    requiresBlender: false,
    requiresCooking: false,
    mealType: 'homemade'
  },
  {
    id: '2',
    name: 'Avocado Toast with Egg',
    description: 'Creamy avocado spread on whole grain toast topped with a perfectly fried egg.',
    ingredients: [
      '1 slice whole grain bread', 
      '1/2 ripe avocado', 
      '1 egg', 
      'Salt and pepper to taste', 
      'Red pepper flakes (optional)'
    ],
    instructions: [
      'Toast the bread to desired crispness',
      'Mash avocado and spread on toast',
      'Fry egg in a non-stick pan',
      'Place egg on top of avocado',
      'Season with salt, pepper, and red pepper flakes'
    ],
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    macros: {
      calories: 280,
      protein: 15,
      carbs: 20,
      fat: 18
    },
    imageSrc: getStockImage('breakfast'),
    type: 'breakfast',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'homemade'
  },
  {
    id: '3',
    name: 'Greek Yogurt Bowl',
    description: 'High-protein yogurt bowl with honey, nuts, and fresh fruit.',
    ingredients: [
      '1 cup Greek yogurt', 
      '1 tbsp honey', 
      '1/4 cup mixed berries', 
      '1 tbsp chopped almonds', 
      '1 tsp chia seeds'
    ],
    instructions: [
      'Add Greek yogurt to a bowl',
      'Drizzle with honey',
      'Top with berries, almonds, and chia seeds'
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 240,
      protein: 22,
      carbs: 25,
      fat: 8
    },
    imageSrc: getStockImage('breakfast'),
    type: 'breakfast',
    requiresBlender: false,
    requiresCooking: false,
    mealType: 'store-bought'
  },
  {
    id: '4',
    name: 'Grilled Chicken Salad',
    description: 'Fresh mixed greens topped with grilled chicken, veggies, and balsamic vinaigrette.',
    ingredients: [
      '4 oz grilled chicken breast', 
      '2 cups mixed greens', 
      '1/4 cup cherry tomatoes', 
      '1/4 cucumber, sliced', 
      '2 tbsp balsamic vinaigrette'
    ],
    instructions: [
      'Combine greens, tomatoes, and cucumber in a bowl',
      'Slice grilled chicken and place on top',
      'Drizzle with balsamic vinaigrette',
      'Toss gently before serving'
    ],
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    macros: {
      calories: 320,
      protein: 35,
      carbs: 15,
      fat: 12
    },
    imageSrc: getStockImage('lunch'),
    type: 'lunch',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'homemade'
  },
  {
    id: '5',
    name: 'Quinoa & Black Bean Bowl',
    description: 'Protein-packed bowl with quinoa, black beans, avocado, and salsa.',
    ingredients: [
      '1/2 cup cooked quinoa', 
      '1/2 cup black beans', 
      '1/4 avocado, sliced', 
      '2 tbsp salsa', 
      '1 tbsp Greek yogurt'
    ],
    instructions: [
      'Add quinoa to the bottom of a bowl',
      'Top with black beans',
      'Add sliced avocado',
      'Finish with salsa and a dollop of Greek yogurt'
    ],
    prepTime: 5,
    cookTime: 15,
    servings: 1,
    macros: {
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 12
    },
    imageSrc: getStockImage('lunch'),
    type: 'lunch',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'takeout'
  },
  {
    id: '6',
    name: 'Turkey & Hummus Wrap',
    description: 'Whole grain wrap filled with lean turkey, hummus, and fresh vegetables.',
    ingredients: [
      '1 whole grain wrap', 
      '3 oz sliced turkey breast', 
      '2 tbsp hummus', 
      'Handful of spinach', 
      '4 slices cucumber'
    ],
    instructions: [
      'Spread hummus on the wrap',
      'Layer with turkey, spinach, and cucumber',
      'Roll up tightly',
      'Cut in half diagonally'
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 8
    },
    imageSrc: getStockImage('lunch'),
    type: 'lunch',
    requiresBlender: false,
    requiresCooking: false,
    mealType: 'store-bought'
  },
  {
    id: '7',
    name: 'Baked Salmon with Asparagus',
    description: 'Perfectly baked salmon fillet with roasted asparagus and lemon.',
    ingredients: [
      '5 oz salmon fillet', 
      '8 asparagus spears', 
      '1 tsp olive oil', 
      '1 lemon wedge', 
      'Salt and pepper to taste'
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Place salmon and asparagus on a baking sheet',
      'Drizzle with olive oil and season',
      'Bake for 12-15 minutes',
      'Serve with lemon wedge'
    ],
    prepTime: 5,
    cookTime: 15,
    servings: 1,
    macros: {
      calories: 320,
      protein: 35,
      carbs: 5,
      fat: 18
    },
    imageSrc: getStockImage('dinner'),
    type: 'dinner',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'homemade'
  },
  {
    id: '8',
    name: 'Stir-Fry Tofu with Vegetables',
    description: 'Plant-based protein stir-fried with colorful vegetables and served over brown rice.',
    ingredients: [
      '4 oz firm tofu, cubed', 
      '1 cup mixed vegetables', 
      '1/2 cup cooked brown rice', 
      '1 tbsp low-sodium soy sauce', 
      '1 tsp sesame oil'
    ],
    instructions: [
      'Press tofu to remove excess water',
      'Stir-fry tofu until golden',
      'Add vegetables and cook until tender-crisp',
      'Season with soy sauce and sesame oil',
      'Serve over brown rice'
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    macros: {
      calories: 350,
      protein: 20,
      carbs: 35,
      fat: 15
    },
    imageSrc: getStockImage('dinner'),
    type: 'dinner',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'homemade'
  },
  {
    id: '9',
    name: 'Turkey Chili',
    description: 'Hearty turkey chili with beans, vegetables, and warm spices.',
    ingredients: [
      '4 oz ground turkey', 
      '1/2 cup kidney beans', 
      '1/4 cup diced tomatoes', 
      '1/4 onion, diced', 
      'Chili spices to taste'
    ],
    instructions: [
      'Brown turkey in a pot',
      'Add onion and cook until translucent',
      'Add beans, tomatoes, and spices',
      'Simmer for 15 minutes',
      'Serve hot with optional toppings'
    ],
    prepTime: 10,
    cookTime: 20,
    servings: 1,
    macros: {
      calories: 330,
      protein: 30,
      carbs: 25,
      fat: 12
    },
    imageSrc: getStockImage('dinner'),
    type: 'dinner',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'homemade'
  },
  {
    id: '10',
    name: 'Apple with Almond Butter',
    description: 'Simple, satisfying snack pairing crisp apple with creamy almond butter.',
    ingredients: [
      '1 medium apple', 
      '1 tbsp almond butter'
    ],
    instructions: [
      'Slice apple into wedges',
      'Serve with almond butter for dipping'
    ],
    prepTime: 2,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 160,
      protein: 4,
      carbs: 20,
      fat: 8
    },
    imageSrc: getStockImage('snack'),
    type: 'snack',
    requiresBlender: false,
    requiresCooking: false,
    mealType: 'store-bought'
  },
  {
    id: '11',
    name: 'Greek Yogurt with Honey',
    description: 'Protein-rich Greek yogurt sweetened with a touch of honey.',
    ingredients: [
      '1/2 cup Greek yogurt', 
      '1 tsp honey'
    ],
    instructions: [
      'Add honey to Greek yogurt',
      'Stir well before eating'
    ],
    prepTime: 1,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 90,
      protein: 12,
      carbs: 10,
      fat: 0
    },
    imageSrc: getStockImage('snack'),
    type: 'snack',
    requiresBlender: false,
    requiresCooking: false,
    mealType: 'store-bought'
  },
  {
    id: '12',
    name: 'Protein Smoothie',
    description: 'Quick, refreshing protein shake with fruit and almond milk.',
    ingredients: [
      '1 scoop protein powder', 
      '1 cup almond milk', 
      '1/2 banana', 
      '5 ice cubes'
    ],
    instructions: [
      'Add all ingredients to a blender',
      'Blend until smooth',
      'Pour into a glass and enjoy'
    ],
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 180,
      protein: 20,
      carbs: 15,
      fat: 3
    },
    imageSrc: getStockImage('snack'),
    type: 'snack',
    requiresBlender: true,
    requiresCooking: false,
    mealType: 'homemade'
  },
  {
    id: '13',
    name: 'Trail Mix',
    description: 'Energy-boosting mix of nuts, seeds, and dried fruit.',
    ingredients: [
      '1 tbsp almonds', 
      '1 tbsp walnuts', 
      '1 tsp pumpkin seeds', 
      '1 tsp dried cranberries'
    ],
    instructions: [
      'Mix all ingredients in a small container',
      'Store in an airtight container if not consuming immediately'
    ],
    prepTime: 1,
    cookTime: 0,
    servings: 1,
    macros: {
      calories: 120,
      protein: 5,
      carbs: 8,
      fat: 9
    },
    imageSrc: getStockImage('snack'),
    type: 'snack',
    requiresBlender: false,
    requiresCooking: false,
    mealType: 'store-bought'
  },
  {
    id: '14',
    name: 'Vegetable Soup',
    description: 'Light, nutritious soup packed with seasonal vegetables.',
    ingredients: [
      '1 cup vegetable broth', 
      '1/2 cup mixed vegetables', 
      '1/4 cup diced tomatoes', 
      'Herbs and spices to taste'
    ],
    instructions: [
      'Bring broth to a simmer',
      'Add vegetables and herbs',
      'Cook until vegetables are tender',
      'Serve hot'
    ],
    prepTime: 5,
    cookTime: 15,
    servings: 1,
    macros: {
      calories: 80,
      protein: 2,
      carbs: 15,
      fat: 0
    },
    imageSrc: getStockImage('snack'),
    type: 'snack',
    requiresBlender: false,
    requiresCooking: true,
    mealType: 'homemade'
  },
  {
    id: '15',
    name: 'Protein Pancakes',
    description: 'Fluffy pancakes enriched with protein powder for a satisfying breakfast.',
    ingredients: [
      '1 scoop protein powder', 
      '1 banana', 
      '2 eggs', 
      '1/4 cup oats', 
      '1 tsp cinnamon'
    ],
    instructions: [
      'Blend all ingredients until smooth',
      'Heat a non-stick pan over medium heat',
      'Pour batter to form pancakes',
      'Cook until bubbles form, then flip',
      'Serve with optional toppings'
    ],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    macros: {
      calories: 340,
      protein: 30,
      carbs: 32,
      fat: 10
    },
    imageSrc: getStockImage('breakfast'),
    type: 'breakfast',
    requiresBlender: true,
    requiresCooking: true,
    mealType: 'homemade'
  }
];

// Function to generate grocery list
export const generateGroceryList = (): GroceryItem[] => {
  return [
    {
      id: "1",
      name: "Chicken Breast",
      category: "Proteins",
      quantity: "2 lbs",
      checked: false,
    },
    {
      id: "2",
      name: "Brown Rice",
      category: "Grains",
      quantity: "1 bag",
      checked: false,
    },
    {
      id: "3",
      name: "Broccoli",
      category: "Vegetables",
      quantity: "1 bunch",
      checked: false,
    },
    {
      id: "4",
      name: "Olive Oil",
      category: "Oils & Condiments",
      quantity: "1 bottle",
      checked: true,
    },
    {
      id: "5",
      name: "Sweet Potatoes",
      category: "Vegetables",
      quantity: "4 medium",
      checked: false,
    },
    {
      id: "6",
      name: "Greek Yogurt",
      category: "Dairy",
      quantity: "32 oz container",
      checked: false,
    },
    {
      id: "7",
      name: "Eggs",
      category: "Proteins",
      quantity: "1 dozen",
      checked: false,
    },
    {
      id: "8",
      name: "Spinach",
      category: "Vegetables",
      quantity: "1 bag",
      checked: false,
    },
    {
      id: "9",
      name: "Bananas",
      category: "Fruits",
      quantity: "6",
      checked: false,
    },
    {
      id: "10",
      name: "Almonds",
      category: "Nuts & Seeds",
      quantity: "1 bag",
      checked: false,
    },
    {
      id: "11",
      name: "Oats",
      category: "Grains",
      quantity: "1 container",
      checked: false,
    },
    {
      id: "12",
      name: "Quinoa",
      category: "Grains",
      quantity: "1 bag",
      checked: true,
    },
    {
      id: "13",
      name: "Bell Peppers",
      category: "Vegetables",
      quantity: "3",
      checked: false,
    },
    {
      id: "14",
      name: "Salmon",
      category: "Proteins",
      quantity: "1 lb",
      checked: false,
    },
    {
      id: "15",
      name: "Avocados",
      category: "Fruits",
      quantity: "3",
      checked: false,
    },
  ];
};

// Generate a meal plan for a week
export const generateMockMealPlan = (): MealPlanDay[] => {
  const today = new Date();
  
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Get random recipes for each meal type
    const getRandomRecipe = (type: string): Recipe => {
      const typeRecipes = recipes.filter(r => r.type === type);
      return typeRecipes[Math.floor(Math.random() * typeRecipes.length)];
    };
    
    // Get random snacks (1-2)
    const snacks = Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map(() => {
      return getRandomRecipe('snack');
    });
    
    return {
      date: date.toISOString(),
      meals: {
        breakfast: getRandomRecipe('breakfast'),
        lunch: getRandomRecipe('lunch'),
        dinner: getRandomRecipe('dinner'),
        snacks: snacks
      }
    };
  });
};

// Calculate daily macros based on meals
export const calculateDailyMacros = (meals: {
  breakfast: Recipe[] | Recipe | null;
  lunch: Recipe[] | Recipe | null;
  dinner: Recipe[] | Recipe | null;
  snacks: (Recipe | null)[];
}): NutritionGoals => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  
  // Add macros from breakfast
  if (meals.breakfast) {
    if (Array.isArray(meals.breakfast)) {
      meals.breakfast.forEach(recipe => {
        calories += recipe.macros.calories;
        protein += recipe.macros.protein;
        carbs += recipe.macros.carbs;
        fat += recipe.macros.fat;
      });
    } else {
      calories += meals.breakfast.macros.calories;
      protein += meals.breakfast.macros.protein;
      carbs += meals.breakfast.macros.carbs;
      fat += meals.breakfast.macros.fat;
    }
  }
  
  // Add macros from lunch
  if (meals.lunch) {
    if (Array.isArray(meals.lunch)) {
      meals.lunch.forEach(recipe => {
        calories += recipe.macros.calories;
        protein += recipe.macros.protein;
        carbs += recipe.macros.carbs;
        fat += recipe.macros.fat;
      });
    } else {
      calories += meals.lunch.macros.calories;
      protein += meals.lunch.macros.protein;
      carbs += meals.lunch.macros.carbs;
      fat += meals.lunch.macros.fat;
    }
  }
  
  // Add macros from dinner
  if (meals.dinner) {
    if (Array.isArray(meals.dinner)) {
      meals.dinner.forEach(recipe => {
        calories += recipe.macros.calories;
        protein += recipe.macros.protein;
        carbs += recipe.macros.carbs;
        fat += recipe.macros.fat;
      });
    } else {
      calories += meals.dinner.macros.calories;
      protein += meals.dinner.macros.protein;
      carbs += meals.dinner.macros.carbs;
      fat += meals.dinner.macros.fat;
    }
  }
  
  // Add macros from snacks
  if (meals.snacks) {
    meals.snacks.forEach(snack => {
      if (snack) {
        calories += snack.macros.calories;
        protein += snack.macros.protein;
        carbs += snack.macros.carbs;
        fat += snack.macros.fat;
      }
    });
  }
  
  return {
    calories,
    protein,
    carbs,
    fat
  };
};
