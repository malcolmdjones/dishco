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
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
