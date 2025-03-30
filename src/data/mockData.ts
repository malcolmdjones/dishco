
export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  instructions: string[];
  requiresBlender?: boolean;
  requiresCooking?: boolean;
}

export interface DayPlan {
  day: string;
  meals: {
    breakfast: Recipe | null;
    lunch: Recipe | null;
    dinner: Recipe | null;
    snacks: Recipe[];
  };
}

export type WeeklyMealPlan = DayPlan[];

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export const defaultGoals: UserGoals = {
  calories: 2200,
  protein: 150,
  carbs: 200,
  fat: 80,
};

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Omelette with veggies',
    description: 'Fluffy omelette filled with colorful vegetables and cheese.',
    imageSrc: '/images/omelette.jpg',
    type: 'breakfast',
    macros: { calories: 350, protein: 25, carbs: 10, fat: 23 },
    ingredients: ['2 eggs', 'Spinach', 'Mushrooms', 'Cheddar cheese'],
    instructions: ['Whisk eggs', 'Add veggies', 'Cook until set'],
    requiresCooking: true
  },
  {
    id: '2',
    name: 'Avocado Toast',
    description: 'Simple and healthy avocado toast with a sprinkle of red pepper flakes.',
    imageSrc: '/images/avocado-toast.jpg',
    type: 'breakfast',
    macros: { calories: 280, protein: 8, carbs: 25, fat: 18 },
    ingredients: ['Toast', 'Avocado', 'Red pepper flakes'],
    instructions: ['Toast bread', 'Mash avocado', 'Spread on toast'],
    requiresCooking: true
  },
  {
    id: '3',
    name: 'Overnight Oats',
    description: 'Easy and nutritious overnight oats with berries and nuts.',
    imageSrc: '/images/overnight-oats.jpg',
    type: 'breakfast',
    macros: { calories: 320, protein: 12, carbs: 45, fat: 12 },
    ingredients: ['Oats', 'Milk', 'Berries', 'Nuts'],
    instructions: ['Mix ingredients', 'Refrigerate overnight', 'Enjoy cold'],
    requiresBlender: true
  },
  {
    id: '4',
    name: 'Chicken Salad',
    description: 'Classic chicken salad sandwich with lettuce and tomato.',
    imageSrc: '/images/chicken-salad.jpg',
    type: 'lunch',
    macros: { calories: 400, protein: 30, carbs: 30, fat: 20 },
    ingredients: ['Chicken', 'Mayonnaise', 'Lettuce', 'Tomato'],
    instructions: ['Mix chicken with mayo', 'Add lettuce and tomato', 'Serve on bread'],
    requiresCooking: true
  },
  {
    id: '5',
    name: 'Quinoa Bowl',
    description: 'Healthy quinoa bowl with black beans, corn, and avocado.',
    imageSrc: '/images/quinoa-bowl.jpg',
    type: 'lunch',
    macros: { calories: 380, protein: 15, carbs: 50, fat: 15 },
    ingredients: ['Quinoa', 'Black beans', 'Corn', 'Avocado'],
    instructions: ['Cook quinoa', 'Mix with beans and corn', 'Top with avocado'],
    requiresCooking: true
  },
  {
    id: '6',
    name: 'Lentil Soup',
    description: 'Hearty lentil soup with carrots and celery.',
    imageSrc: '/images/lentil-soup.jpg',
    type: 'lunch',
    macros: { calories: 320, protein: 20, carbs: 40, fat: 8 },
    ingredients: ['Lentils', 'Carrots', 'Celery', 'Vegetable broth'],
    instructions: ['Sauté veggies', 'Add lentils and broth', 'Simmer until lentils are tender'],
    requiresCooking: true
  },
  {
    id: '7',
    name: 'Salmon with Asparagus',
    description: 'Baked salmon with roasted asparagus and lemon.',
    imageSrc: '/images/salmon-asparagus.jpg',
    type: 'dinner',
    macros: { calories: 450, protein: 40, carbs: 10, fat: 30 },
    ingredients: ['Salmon', 'Asparagus', 'Lemon', 'Olive oil'],
    instructions: ['Season salmon', 'Roast asparagus', 'Bake salmon with lemon'],
    requiresCooking: true
  },
  {
    id: '8',
    name: 'Chicken Stir-Fry',
    description: 'Quick and easy chicken stir-fry with mixed vegetables.',
    imageSrc: '/images/chicken-stir-fry.jpg',
    type: 'dinner',
    macros: { calories: 420, protein: 35, carbs: 25, fat: 20 },
    ingredients: ['Chicken', 'Broccoli', 'Peppers', 'Soy sauce'],
    instructions: ['Stir-fry chicken', 'Add veggies', 'Season with soy sauce'],
    requiresCooking: true
  },
  {
    id: '9',
    name: 'Beef Tacos',
    description: 'Savory beef tacos with salsa and guacamole.',
    imageSrc: '/images/beef-tacos.jpg',
    type: 'dinner',
    macros: { calories: 480, protein: 32, carbs: 30, fat: 26 },
    ingredients: ['Beef', 'Taco shells', 'Salsa', 'Guacamole'],
    instructions: ['Cook beef', 'Fill taco shells', 'Top with salsa and guacamole'],
    requiresCooking: true
  },
  {
    id: '10',
    name: 'Banana with Peanut Butter',
    description: 'Simple and satisfying banana with peanut butter.',
    imageSrc: '/images/banana-peanut-butter.jpg',
    type: 'snack',
    macros: { calories: 200, protein: 7, carbs: 25, fat: 10 },
    ingredients: ['Banana', 'Peanut butter'],
    instructions: ['Slice banana', 'Spread peanut butter', 'Enjoy'],
    requiresBlender: false
  },
  {
    id: '11',
    name: 'Greek Yogurt Cup',
    description: 'Healthy Greek yogurt cup with honey and granola.',
    imageSrc: '/images/greek-yogurt.jpg',
    type: 'snack',
    macros: { calories: 150, protein: 15, carbs: 10, fat: 5 },
    ingredients: ['Greek yogurt', 'Honey', 'Granola'],
    instructions: ['Mix yogurt with honey', 'Top with granola', 'Enjoy'],
    requiresBlender: true
  },
  {
    id: '12',
    name: 'Apple Slices with Almond Butter',
    description: 'Crisp apple slices with creamy almond butter.',
    imageSrc: '/images/apple-almond-butter.jpg',
    type: 'snack',
    macros: { calories: 180, protein: 5, carbs: 20, fat: 10 },
    ingredients: ['Apple', 'Almond butter'],
    instructions: ['Slice apple', 'Spread almond butter', 'Enjoy'],
    requiresBlender: false
  },
  {
    id: '13',
    name: 'Trail Mix',
    description: 'Energy-boosting trail mix with nuts, seeds, and dried fruit.',
    imageSrc: '/images/trail-mix.jpg',
    type: 'snack',
    macros: { calories: 220, protein: 6, carbs: 20, fat: 14 },
    ingredients: ['Nuts', 'Seeds', 'Dried fruit'],
    instructions: ['Mix ingredients', 'Enjoy'],
    requiresBlender: false
  },
];

export const calculateDailyMacros = (meals: {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
  snacks: (Recipe | null)[];
}) => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  if (meals.breakfast) {
    calories += meals.breakfast.macros.calories;
    protein += meals.breakfast.macros.protein;
    carbs += meals.breakfast.macros.carbs;
    fat += meals.breakfast.macros.fat;
  }
  if (meals.lunch) {
    calories += meals.lunch.macros.calories;
    protein += meals.lunch.macros.protein;
    carbs += meals.lunch.macros.carbs;
    fat += meals.lunch.macros.fat;
  }
  if (meals.dinner) {
    calories += meals.dinner.macros.calories;
    protein += meals.dinner.macros.protein;
    carbs += meals.dinner.macros.carbs;
    fat += meals.dinner.macros.fat;
  }
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

  return { calories, protein, carbs, fat };
};

// Function to generate a mock meal plan for the week
export const generateMockMealPlan = (): WeeklyMealPlan => {
  const breakfastOptions = recipes.filter(recipe => recipe.type === 'breakfast');
  const lunchOptions = recipes.filter(recipe => recipe.type === 'lunch');
  const dinnerOptions = recipes.filter(recipe => recipe.type === 'dinner');
  const snackOptions = recipes.filter(recipe => recipe.type === 'snack');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map(day => {
    return {
      day,
      meals: {
        breakfast: breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)],
        lunch: lunchOptions[Math.floor(Math.random() * lunchOptions.length)],
        dinner: dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)],
        snacks: [
          snackOptions[Math.floor(Math.random() * snackOptions.length)],
          Math.random() > 0.5 ? snackOptions[Math.floor(Math.random() * snackOptions.length)] : null
        ].filter(Boolean) as Recipe[]
      }
    };
  });
};

// Generate a grocery list based on a meal plan
export const generateGroceryList = (mealPlan: WeeklyMealPlan): GroceryItem[] => {
  // Simulate a grocery list based on the meal plan ingredients
  const allIngredients: string[] = [];
  
  mealPlan.forEach(day => {
    // Add breakfast ingredients - check for null
    if (day.meals.breakfast) {
      allIngredients.push(...day.meals.breakfast.ingredients);
    }
    
    // Add lunch ingredients - check for null
    if (day.meals.lunch) {
      allIngredients.push(...day.meals.lunch.ingredients);
    }
    
    // Add dinner ingredients - check for null
    if (day.meals.dinner) {
      allIngredients.push(...day.meals.dinner.ingredients);
    }
    
    // Add snack ingredients - make sure snacks array exists
    if (day.meals.snacks && day.meals.snacks.length > 0) {
      day.meals.snacks.forEach(snack => {
        if (snack) {
          allIngredients.push(...snack.ingredients);
        }
      });
    }
  });
  
  // Count occurrences of each ingredient
  const ingredientCount = allIngredients.reduce((acc, ingredient) => {
    const simpleIngredient = ingredient.split(' ').slice(1).join(' '); // Remove quantity
    acc[simpleIngredient] = (acc[simpleIngredient] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Create grocery items from ingredients
  const groceryItems: GroceryItem[] = Object.entries(ingredientCount).map(([name, count], index) => {
    // Assign a category based on the ingredient name (simplified)
    let category = 'Other';
    if (/milk|cheese|yogurt|cream/.test(name.toLowerCase())) {
      category = 'Dairy';
    } else if (/apple|banana|berry|fruit|orange/.test(name.toLowerCase())) {
      category = 'Fruits';
    } else if (/spinach|lettuce|carrot|vegetable|broccoli|pepper/.test(name.toLowerCase())) {
      category = 'Vegetables';
    } else if (/chicken|beef|salmon|fish|meat/.test(name.toLowerCase())) {
      category = 'Meat & Seafood';
    } else if (/bread|oat|rice|pasta|quinoa/.test(name.toLowerCase())) {
      category = 'Grains';
    } else if (/oil|sauce|salt|pepper|spice/.test(name.toLowerCase())) {
      category = 'Condiments';
    }
    
    return {
      id: `item-${index}`,
      name,
      category,
      quantity: count,
      unit: 'item(s)',
      checked: false,
    };
  });
  
  // Sort by category
  return groceryItems.sort((a, b) => a.category.localeCompare(b.category));
};
