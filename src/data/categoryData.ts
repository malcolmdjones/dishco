
interface CategoryData {
  title: string;
  image: string;
  gradientColors: string;
  description?: string;
}

export const categoryData: Record<string, CategoryData> = {
  mealPrep: {
    title: "Meal Prep MVPs",
    image: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&q=80&w=735&ixlib=rb-4.0.1",
    gradientColors: "from-purple-500 to-blue-500",
    description: "Prep your week in advance"
  },
  budgetBites: {
    title: "Budget Bites",
    image: "https://images.unsplash.com/photo-1607877742570-4ce93c312b96?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.1",
    gradientColors: "from-green-500 to-teal-500",
    description: "Affordable, delicious recipes"
  },
  smoothieStation: {
    title: "Smoothie Station",
    image: "https://images.unsplash.com/photo-1502741126161-b048400d085d?auto=format&fit=crop&q=80&w=1469&ixlib=rb-4.0.1",
    gradientColors: "from-pink-500 to-red-500",
    description: "Refreshing blended drinks"
  },
  breakfastClub: {
    title: "5 Min Breakfast Club",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.1",
    gradientColors: "from-yellow-400 to-orange-500",
    description: "Quick morning meals"
  },
  proteinBakery: {
    title: "Protein Bakery",
    image: "https://images.unsplash.com/photo-1623246123320-0d6636755796?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.1",
    gradientColors: "from-blue-500 to-indigo-500",
    description: "Protein-packed baked goods"
  },
  brunchVibes: {
    title: "Brunch Vibes",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.1",
    gradientColors: "from-orange-500 to-red-500",
    description: "Weekend treats to impress"
  },
  snackSavvy: {
    title: "Snack Savvy",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.1", 
    gradientColors: "from-teal-400 to-cyan-500",
    description: "Smart snacking options"
  }
};
