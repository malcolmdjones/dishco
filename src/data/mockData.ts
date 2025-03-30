
// Add these exported functions to fix the GroceryListPage errors

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

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
