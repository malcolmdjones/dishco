import { supabase } from "@/integrations/supabase/client";

// Add type field to recipes
export const recipes = [
  {
    id: "1",
    name: "Avocado Toast with Poached Eggs",
    description: "Whole grain toast topped with mashed avocado, poached eggs, and a sprinkle of red pepper flakes.",
    imageSrc: "/lovable-uploads/48defee8-9dc2-486a-902e-44ca19ef6a29.png",
    type: "homemade",
    macros: {
      calories: 420,
      protein: 18,
      carbs: 30,
      fat: 28
    },
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "1 tsp vinegar (for poaching)",
      "Salt and pepper to taste",
      "Red pepper flakes",
      "1 tbsp olive oil"
    ],
    instructions: [
      "Toast the bread until golden brown.",
      "Cut the avocado in half, remove the pit, and scoop the flesh into a bowl.",
      "Mash the avocado with a fork, add salt, pepper, and olive oil.",
      "Bring a pot of water to a gentle simmer, add vinegar.",
      "Crack eggs into the simmering water and poach for 3-4 minutes.",
      "Spread mashed avocado on toast and top with poached eggs.",
      "Sprinkle with red pepper flakes and serve immediately."
    ],
    requiresCooking: true
  },
  {
    id: "2",
    name: "Greek Yogurt Parfait",
    description: "Layers of protein-rich Greek yogurt, fresh berries, honey, and crunchy granola.",
    imageSrc: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    type: "homemade",
    macros: {
      calories: 320,
      protein: 20,
      carbs: 40,
      fat: 10
    },
    ingredients: [
      "1 cup plain Greek yogurt",
      "1/4 cup granola",
      "1/2 cup mixed berries (strawberries, blueberries, raspberries)",
      "1 tbsp honey",
      "1 tsp chia seeds (optional)"
    ],
    instructions: [
      "In a glass or bowl, add a layer of Greek yogurt.",
      "Add a layer of mixed berries.",
      "Sprinkle with granola.",
      "Repeat layers until all ingredients are used.",
      "Drizzle honey on top and sprinkle with chia seeds if using.",
      "Serve immediately or refrigerate for up to 1 hour."
    ]
  },
  {
    id: "3",
    name: "Quinoa Vegetable Bowl",
    description: "Nutrient-packed bowl with quinoa, roasted vegetables, and a tahini dressing.",
    imageSrc: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
    type: "homemade",
    macros: {
      calories: 380,
      protein: 12,
      carbs: 45,
      fat: 18
    },
    ingredients: [
      "1 cup cooked quinoa",
      "1 cup mixed roasted vegetables (bell peppers, zucchini, broccoli)",
      "1/4 cup chickpeas, drained and rinsed",
      "1 tbsp olive oil",
      "1 tbsp tahini",
      "1 tsp lemon juice",
      "Salt and pepper to taste",
      "Fresh herbs for garnish"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Toss vegetables in olive oil, salt, and pepper, then roast for 20-25 minutes.",
      "In a small bowl, mix tahini, lemon juice, and a splash of water to make the dressing.",
      "Place cooked quinoa in a bowl, top with roasted vegetables and chickpeas.",
      "Drizzle with tahini dressing and garnish with fresh herbs."
    ],
    requiresCooking: true
  },
  {
    id: "4",
    name: "Grilled Chicken Salad",
    description: "Fresh mixed greens with grilled chicken breast, cherry tomatoes, cucumber, and balsamic vinaigrette.",
    imageSrc: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
    type: "homemade",
    macros: {
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 18
    },
    ingredients: [
      "4 oz grilled chicken breast",
      "2 cups mixed greens",
      "1/2 cup cherry tomatoes, halved",
      "1/2 cucumber, sliced",
      "1/4 red onion, thinly sliced",
      "2 tbsp balsamic vinaigrette",
      "1 tbsp olive oil",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Season chicken breast with salt and pepper.",
      "Grill chicken for 6-7 minutes per side until fully cooked.",
      "Let chicken rest for 5 minutes, then slice.",
      "In a large bowl, combine mixed greens, tomatoes, cucumber, and red onion.",
      "Top with sliced grilled chicken.",
      "Drizzle with balsamic vinaigrette and olive oil.",
      "Toss gently and serve immediately."
    ],
    requiresCooking: true
  },
  {
    id: "5",
    name: "Berry Protein Smoothie",
    description: "A refreshing smoothie packed with mixed berries, protein powder, and almond milk.",
    imageSrc: "https://images.unsplash.com/photo-1508223926076-0ab5eac5d0ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
    type: "homemade",
    macros: {
      calories: 280,
      protein: 20,
      carbs: 30,
      fat: 8
    },
    ingredients: [
      "1 cup mixed berries (fresh or frozen)",
      "1 scoop protein powder",
      "1 cup unsweetened almond milk",
      "1 tbsp chia seeds",
      "1/2 banana (optional)",
      "Ice cubes"
    ],
    instructions: [
      "Add all ingredients to a blender.",
      "Blend on high until smooth and creamy.",
      "Add more almond milk if needed to reach desired consistency.",
      "Pour into a glass and serve immediately."
    ],
    requiresBlender: true
  },
  {
    id: "6",
    name: "Salmon Poke Bowl",
    description: "Hawaiian-inspired bowl with fresh salmon, rice, avocado, and soy-sesame dressing.",
    imageSrc: "https://images.unsplash.com/photo-1546069901-d5aeb1ee2aaed5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    type: "takeout",
    macros: {
      calories: 450,
      protein: 28,
      carbs: 40,
      fat: 22
    },
    ingredients: [
      "4 oz sushi-grade salmon, cubed",
      "1 cup cooked sushi rice",
      "1/2 avocado, sliced",
      "1/4 cucumber, thinly sliced",
      "2 tbsp edamame",
      "1 tbsp soy sauce",
      "1 tsp sesame oil",
      "1 tsp rice vinegar",
      "Sesame seeds for garnish",
      "Sliced green onions for garnish"
    ],
    instructions: [
      "Cook sushi rice according to package instructions, let cool.",
      "In a small bowl, mix soy sauce, sesame oil, and rice vinegar.",
      "Toss salmon cubes in half of the soy-sesame mixture.",
      "Place cooked rice in a bowl, arrange salmon, avocado, cucumber, and edamame on top.",
      "Drizzle with remaining sauce.",
      "Garnish with sesame seeds and sliced green onions."
    ]
  },
  {
    id: "7",
    name: "Mediterranean Chickpea Salad",
    description: "A refreshing salad with chickpeas, cucumbers, tomatoes, feta cheese, and herbs.",
    imageSrc: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    type: "homemade",
    macros: {
      calories: 320,
      protein: 15,
      carbs: 35,
      fat: 16
    },
    ingredients: [
      "1 can (15 oz) chickpeas, drained and rinsed",
      "1 cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/4 red onion, finely chopped",
      "1/4 cup feta cheese, crumbled",
      "2 tbsp olive oil",
      "1 tbsp red wine vinegar",
      "1 tsp dried oregano",
      "Salt and pepper to taste",
      "Fresh parsley, chopped, for garnish"
    ],
    instructions: [
      "In a large bowl, combine chickpeas, cucumber, tomatoes, and red onion.",
      "In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.",
      "Pour dressing over the salad and toss to combine.",
      "Gently fold in crumbled feta cheese.",
      "Garnish with fresh parsley before serving.",
      "Chill for at least 30 minutes before serving for best flavor."
    ]
  },
  {
    id: "8",
    name: "Turkey and Avocado Wrap",
    description: "Whole grain wrap filled with lean turkey, avocado, greens, and light mayo.",
    imageSrc: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    type: "store-bought",
    macros: {
      calories: 380,
      protein: 25,
      carbs: 30,
      fat: 18
    },
    ingredients: [
      "1 whole grain wrap",
      "3 oz sliced turkey breast",
      "1/2 avocado, sliced",
      "1 cup mixed greens",
      "2 slices tomato",
      "1 tbsp light mayo or Greek yogurt",
      "1 tsp Dijon mustard",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Lay wrap flat and spread with mayo or Greek yogurt and mustard.",
      "Layer turkey slices, avocado, greens, and tomato in the center of the wrap.",
      "Season with salt and pepper.",
      "Fold in the sides of the wrap, then roll tightly from bottom to top.",
      "Cut in half diagonally and serve."
    ]
  },
  {
    id: "9",
    name: "Southwest Black Bean Bowl",
    description: "Protein-rich bowl with black beans, corn, brown rice, and avocado.",
    imageSrc: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    type: "store-bought",
    macros: {
      calories: 400,
      protein: 15,
      carbs: 60,
      fat: 12
    },
    ingredients: [
      "1 cup cooked brown rice",
      "1/2 cup black beans, drained and rinsed",
      "1/4 cup corn kernels",
      "1/4 cup diced red bell pepper",
      "1/4 avocado, diced",
      "2 tbsp salsa",
      "1 tbsp lime juice",
      "1/4 tsp cumin",
      "1/4 tsp chili powder",
      "Salt to taste",
      "Fresh cilantro for garnish"
    ],
    instructions: [
      "In a bowl, combine brown rice, black beans, corn, and red bell pepper.",
      "Season with cumin, chili powder, and salt.",
      "Add lime juice and toss to combine.",
      "Top with diced avocado and salsa.",
      "Garnish with fresh cilantro before serving."
    ]
  },
  {
    id: "10",
    name: "Veggie Omelette",
    description: "Fluffy omelette filled with bell peppers, spinach, mushrooms, and feta cheese.",
    imageSrc: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    type: "homemade",
    macros: {
      calories: 300,
      protein: 20,
      carbs: 10,
      fat: 20
    },
    ingredients: [
      "3 large eggs",
      "1 tbsp milk",
      "1/4 cup diced bell peppers",
      "1/4 cup spinach, chopped",
      "1/4 cup mushrooms, sliced",
      "2 tbsp feta cheese, crumbled",
      "1 tsp olive oil",
      "Salt and pepper to taste",
      "Fresh herbs for garnish (optional)"
    ],
    instructions: [
      "Beat eggs and milk in a bowl, season with salt and pepper.",
      "Heat olive oil in a non-stick pan over medium heat.",
      "Sauté bell peppers and mushrooms for 2-3 minutes until softened.",
      "Add spinach and cook until wilted.",
      "Pour egg mixture over vegetables and cook until edges start to set.",
      "Sprinkle feta cheese over one half of the omelette.",
      "When eggs are mostly set, fold omelette in half over the cheese.",
      "Cook for another minute, then serve with fresh herbs if desired."
    ],
    requiresCooking: true
  }
];

// Function to calculate daily macros from meals
export const calculateDailyMacros = (meals: any) => {
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
    meals.snacks.forEach((snack: any) => {
      calories += snack.macros.calories;
      protein += snack.macros.protein;
      carbs += snack.macros.carbs;
      fat += snack.macros.fat;
    });
  }

  return { calories, protein, carbs, fat };
};

// Default goals, but let's make them dynamic by fetching from Supabase
export let defaultGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65
};

// Function to fetch nutrition goals from Supabase
export const fetchNutritionGoals = async () => {
  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching nutrition goals:', error);
      return defaultGoals;
    }
    
    if (data) {
      defaultGoals = {
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      };
    }
    
    return defaultGoals;
  } catch (error) {
    console.error('Error fetching nutrition goals:', error);
    return defaultGoals;
  }
};

// Generate a mock meal plan for the week
export const generateMockMealPlan = () => {
  const mockMealPlan = [];
  for (let i = 0; i < 7; i++) {
    mockMealPlan.push({
      day: i,
      meals: {
        breakfast: recipes[Math.floor(Math.random() * recipes.length)],
        lunch: recipes[Math.floor(Math.random() * recipes.length)],
        dinner: recipes[Math.floor(Math.random() * recipes.length)],
        snacks: [
          recipes[Math.floor(Math.random() * recipes.length)],
          recipes[Math.floor(Math.random() * recipes.length)],
        ],
      },
    });
  }
  return mockMealPlan;
};
