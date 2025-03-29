
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  type: 'recipe' | 'store-bought';
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  macros: Macros;
  ingredients: string[];
  instructions?: string[];
  imageSrc: string;
  preparationTime?: number; // in minutes
  favorite: boolean;
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Default user goals
export const defaultGoals: UserGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

// Mock recipes data
export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Greek Yogurt Bowl',
    description: 'Creamy Greek yogurt with berries, nuts, and honey',
    type: 'recipe',
    category: 'breakfast',
    macros: {
      calories: 320,
      protein: 22,
      carbs: 30,
      fat: 14,
    },
    ingredients: ['Greek yogurt', 'Mixed berries', 'Almonds', 'Honey'],
    instructions: [
      'Add Greek yogurt to a bowl',
      'Top with mixed berries, sliced almonds, and drizzle with honey',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-4.0.3',
    preparationTime: 5,
    favorite: false,
  },
  {
    id: '2',
    name: 'Avocado Toast',
    description: 'Whole grain toast with mashed avocado and a fried egg',
    type: 'recipe',
    category: 'breakfast',
    macros: {
      calories: 380,
      protein: 15,
      carbs: 35,
      fat: 22,
    },
    ingredients: ['Whole grain bread', 'Avocado', 'Egg', 'Salt', 'Pepper', 'Red pepper flakes'],
    instructions: [
      'Toast bread until golden brown',
      'Mash avocado and spread on toast',
      'Fry egg to desired doneness',
      'Place egg on top of avocado',
      'Season with salt, pepper, and red pepper flakes',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3',
    preparationTime: 10,
    favorite: true,
  },
  {
    id: '3',
    name: 'Protein Smoothie',
    description: 'Banana and berry protein smoothie with almond milk',
    type: 'recipe',
    category: 'breakfast',
    macros: {
      calories: 280,
      protein: 25,
      carbs: 28,
      fat: 8,
    },
    ingredients: ['Protein powder', 'Banana', 'Mixed berries', 'Almond milk', 'Ice'],
    instructions: [
      'Add all ingredients to blender',
      'Blend until smooth',
      'Pour into glass and enjoy',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1553530666-ba11a90a0868?ixlib=rb-4.0.3',
    preparationTime: 5,
    favorite: false,
  },
  {
    id: '4',
    name: 'Chicken Salad',
    description: 'Grilled chicken breast with mixed greens and vinaigrette',
    type: 'recipe',
    category: 'lunch',
    macros: {
      calories: 410,
      protein: 40,
      carbs: 15,
      fat: 22,
    },
    ingredients: [
      'Chicken breast',
      'Mixed greens',
      'Cherry tomatoes',
      'Cucumber',
      'Olive oil',
      'Balsamic vinegar',
    ],
    instructions: [
      'Grill chicken breast until cooked through',
      'Slice chicken and set aside',
      'Combine mixed greens, tomatoes, and cucumber in a bowl',
      'Add sliced chicken on top',
      'Drizzle with olive oil and balsamic vinegar',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3',
    preparationTime: 20,
    favorite: true,
  },
  {
    id: '5',
    name: 'Turkey Wrap',
    description: 'Whole wheat wrap with turkey, vegetables and hummus',
    type: 'recipe',
    category: 'lunch',
    macros: {
      calories: 350,
      protein: 28,
      carbs: 40,
      fat: 10,
    },
    ingredients: [
      'Whole wheat wrap',
      'Turkey breast',
      'Hummus',
      'Spinach',
      'Bell pepper',
      'Cucumber',
    ],
    instructions: [
      'Spread hummus on the wrap',
      'Add turkey slices, spinach, and sliced vegetables',
      'Roll tightly and cut in half',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?ixlib=rb-4.0.3',
    preparationTime: 10,
    favorite: false,
  },
  {
    id: '6',
    name: 'Quinoa Bowl',
    description: 'Protein-packed quinoa with roasted vegetables and tofu',
    type: 'recipe',
    category: 'lunch',
    macros: {
      calories: 420,
      protein: 18,
      carbs: 58,
      fat: 15,
    },
    ingredients: [
      'Quinoa',
      'Tofu',
      'Broccoli',
      'Bell pepper',
      'Carrot',
      'Olive oil',
      'Soy sauce',
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Roast vegetables in olive oil',
      'Sauté tofu until golden',
      'Combine all ingredients in a bowl',
      'Drizzle with soy sauce',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-4.0.3',
    preparationTime: 30,
    favorite: true,
  },
  {
    id: '7',
    name: 'Salmon with Asparagus',
    description: 'Baked salmon fillet with roasted asparagus and lemon',
    type: 'recipe',
    category: 'dinner',
    macros: {
      calories: 450,
      protein: 38,
      carbs: 12,
      fat: 28,
    },
    ingredients: ['Salmon fillet', 'Asparagus', 'Lemon', 'Olive oil', 'Garlic', 'Salt', 'Pepper'],
    instructions: [
      'Preheat oven to 400°F',
      'Place salmon and asparagus on a baking sheet',
      'Drizzle with olive oil, salt, pepper, and minced garlic',
      'Squeeze lemon juice over the top',
      'Bake for 15-20 minutes until salmon is cooked through',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3',
    preparationTime: 25,
    favorite: true,
  },
  {
    id: '8',
    name: 'Turkey Meatballs',
    description: 'Lean turkey meatballs with zucchini noodles and marinara',
    type: 'recipe',
    category: 'dinner',
    macros: {
      calories: 380,
      protein: 35,
      carbs: 20,
      fat: 18,
    },
    ingredients: [
      'Ground turkey',
      'Zucchini',
      'Marinara sauce',
      'Eggs',
      'Breadcrumbs',
      'Italian seasoning',
    ],
    instructions: [
      'Mix ground turkey, egg, breadcrumbs, and seasonings',
      'Form into meatballs',
      'Bake at 375°F for 20 minutes',
      'Spiralize zucchini into noodles',
      'Heat marinara sauce',
      'Serve meatballs over zucchini noodles with sauce',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3',
    preparationTime: 40,
    favorite: false,
  },
  {
    id: '9',
    name: 'Stir-Fry Chicken',
    description: 'Asian-inspired chicken stir-fry with vegetables and brown rice',
    type: 'recipe',
    category: 'dinner',
    macros: {
      calories: 420,
      protein: 30,
      carbs: 45,
      fat: 14,
    },
    ingredients: [
      'Chicken breast',
      'Bell pepper',
      'Broccoli',
      'Carrot',
      'Snow peas',
      'Brown rice',
      'Soy sauce',
      'Ginger',
      'Garlic',
    ],
    instructions: [
      'Cook brown rice according to package instructions',
      'Stir-fry chicken until cooked through',
      'Add vegetables and stir-fry until tender-crisp',
      'Add soy sauce, ginger, and garlic',
      'Serve over brown rice',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?ixlib=rb-4.0.3',
    preparationTime: 30,
    favorite: true,
  },
  {
    id: '10',
    name: 'Protein Bar',
    description: 'Store-bought protein bar with chocolate and nuts',
    type: 'store-bought',
    category: 'snack',
    macros: {
      calories: 210,
      protein: 20,
      carbs: 15,
      fat: 8,
    },
    ingredients: ['Protein blend', 'Nuts', 'Chocolate coating', 'Natural flavors'],
    imageSrc: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?ixlib=rb-4.0.3',
    favorite: false,
  },
  {
    id: '11',
    name: 'Greek Yogurt Cup',
    description: 'Single-serving Greek yogurt with fruit on the bottom',
    type: 'store-bought',
    category: 'snack',
    macros: {
      calories: 130,
      protein: 15,
      carbs: 12,
      fat: 3,
    },
    ingredients: ['Greek yogurt', 'Fruit', 'Natural sweeteners'],
    imageSrc: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3',
    favorite: true,
  },
  {
    id: '12',
    name: 'Rice Krispy Treat',
    description: 'Classic marshmallow and cereal snack bar',
    type: 'store-bought',
    category: 'snack',
    macros: {
      calories: 180,
      protein: 2,
      carbs: 35,
      fat: 4,
    },
    ingredients: ['Rice cereal', 'Marshmallow', 'Butter'],
    imageSrc: 'https://images.unsplash.com/photo-1518119570819-33c8918d91c5?ixlib=rb-4.0.3',
    favorite: false,
  },
  {
    id: '13',
    name: 'Trail Mix',
    description: 'Mixed nuts, seeds, and dried fruit for on-the-go energy',
    type: 'store-bought',
    category: 'snack',
    macros: {
      calories: 170,
      protein: 6,
      carbs: 14,
      fat: 12,
    },
    ingredients: ['Almonds', 'Walnuts', 'Dried cranberries', 'Pumpkin seeds', 'Dark chocolate chips'],
    imageSrc: 'https://images.unsplash.com/photo-1518426247914-20086336f804?ixlib=rb-4.0.3',
    favorite: true,
  },
  {
    id: '14',
    name: 'Overnight Oats',
    description: 'Rolled oats soaked overnight with milk and toppings',
    type: 'recipe',
    category: 'breakfast',
    macros: {
      calories: 340,
      protein: 14,
      carbs: 50,
      fat: 10,
    },
    ingredients: ['Rolled oats', 'Milk', 'Chia seeds', 'Maple syrup', 'Berries', 'Nut butter'],
    instructions: [
      'Mix oats, milk, chia seeds, and maple syrup in a jar',
      'Refrigerate overnight',
      'Top with berries and nut butter before serving',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1502481851512-e93e25e4a8a5?ixlib=rb-4.0.3',
    preparationTime: 10,
    favorite: false,
  },
  {
    id: '15',
    name: 'Vegetable Soup',
    description: 'Hearty vegetable soup with lentils and barley',
    type: 'recipe',
    category: 'lunch',
    macros: {
      calories: 250,
      protein: 12,
      carbs: 40,
      fat: 5,
    },
    ingredients: [
      'Vegetable broth',
      'Lentils',
      'Barley',
      'Carrot',
      'Celery',
      'Onion',
      'Garlic',
      'Tomatoes',
      'Kale',
    ],
    instructions: [
      'Sauté onion, carrot, celery, and garlic',
      'Add broth, lentils, barley, and tomatoes',
      'Simmer until lentils and barley are tender',
      'Add kale at the end and cook until wilted',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3',
    preparationTime: 40,
    favorite: false,
  },
  {
    id: '16',
    name: 'Chicken Burrito Bowl',
    description: 'Meal-prep friendly chicken burrito bowl with rice and beans',
    type: 'recipe',
    category: 'lunch',
    macros: {
      calories: 480,
      protein: 35,
      carbs: 50,
      fat: 16,
    },
    ingredients: [
      'Chicken breast',
      'Brown rice',
      'Black beans',
      'Corn',
      'Bell pepper',
      'Onion',
      'Salsa',
      'Avocado',
      'Lime',
      'Cilantro',
    ],
    instructions: [
      'Cook rice according to package instructions',
      'Season and cook chicken',
      'Sauté vegetables',
      'Assemble bowl with rice, beans, chicken, and vegetables',
      'Top with salsa, avocado, lime juice, and cilantro',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1543340713-1bf56d3d1b68?ixlib=rb-4.0.3',
    preparationTime: 35,
    favorite: true,
  },
  {
    id: '17',
    name: 'Beef Stew',
    description: 'Slow-cooked beef stew with vegetables and potatoes',
    type: 'recipe',
    category: 'dinner',
    macros: {
      calories: 490,
      protein: 32,
      carbs: 35,
      fat: 24,
    },
    ingredients: [
      'Beef chuck',
      'Potatoes',
      'Carrots',
      'Onion',
      'Celery',
      'Beef broth',
      'Tomato paste',
      'Worcestershire sauce',
      'Herbs',
    ],
    instructions: [
      'Brown beef in a large pot',
      'Add vegetables and cook for a few minutes',
      'Add broth, tomato paste, and seasonings',
      'Simmer for 2-3 hours until beef is tender',
    ],
    imageSrc: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?ixlib=rb-4.0.3',
    preparationTime: 180,
    favorite: false,
  },
  {
    id: '18',
    name: 'Fruit and Cheese Box',
    description: 'Pre-packaged box with cheese, crackers, and fruit',
    type: 'store-bought',
    category: 'snack',
    macros: {
      calories: 220,
      protein: 8,
      carbs: 25,
      fat: 10,
    },
    ingredients: ['Cheddar cheese', 'Crackers', 'Apple slices', 'Grapes'],
    imageSrc: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3',
    favorite: true,
  },
  {
    id: '19',
    name: 'Veggie Sticks with Hummus',
    description: 'Fresh vegetable sticks with individual hummus cup',
    type: 'store-bought',
    category: 'snack',
    macros: {
      calories: 150,
      protein: 5,
      carbs: 15,
      fat: 8,
    },
    ingredients: ['Carrot sticks', 'Celery sticks', 'Bell pepper strips', 'Hummus'],
    imageSrc: 'https://images.unsplash.com/photo-1641055869467-f29c4a20f68c?ixlib=rb-4.0.3',
    favorite: false,
  },
  {
    id: '20',
    name: 'Frozen Burrito',
    description: 'Microwavable bean and cheese burrito',
    type: 'store-bought',
    category: 'lunch',
    macros: {
      calories: 340,
      protein: 14,
      carbs: 48,
      fat: 12,
    },
    ingredients: ['Flour tortilla', 'Refried beans', 'Cheese', 'Rice', 'Spices'],
    imageSrc: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?ixlib=rb-4.0.3',
    favorite: false,
  },
];

// Generate a mock weekly meal plan
export const generateMockMealPlan = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealPlan = days.map((day) => {
    return {
      day,
      meals: {
        breakfast: recipes.filter((recipe) => recipe.category === 'breakfast')[
          Math.floor(Math.random() * 4)
        ],
        lunch: recipes.filter((recipe) => recipe.category === 'lunch')[
          Math.floor(Math.random() * 6)
        ],
        dinner: recipes.filter((recipe) => recipe.category === 'dinner')[
          Math.floor(Math.random() * 5)
        ],
        snacks: [
          recipes.filter((recipe) => recipe.category === 'snack')[
            Math.floor(Math.random() * 5)
          ],
          recipes.filter((recipe) => recipe.category === 'snack')[
            Math.floor(Math.random() * 5) + 5
          ],
        ],
      },
    };
  });

  return mealPlan;
};

// Calculate daily macros from a set of meals
export const calculateDailyMacros = (dayMeals: any) => {
  const { breakfast, lunch, dinner, snacks } = dayMeals;
  
  const meals = [breakfast, lunch, dinner, ...(snacks || [])].filter(Boolean);
  
  return meals.reduce(
    (acc, meal) => {
      if (!meal || !meal.macros) return acc;
      
      return {
        calories: acc.calories + meal.macros.calories,
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fat: acc.fat + meal.macros.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

// Generate a grocery list from recipes
export const generateGroceryList = (recipes: Recipe[]) => {
  const groceryItems: { [key: string]: number } = {};
  
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      groceryItems[ingredient] = (groceryItems[ingredient] || 0) + 1;
    });
  });
  
  return Object.entries(groceryItems).map(([name, count]) => ({
    name,
    count,
    checked: false,
  }));
};
