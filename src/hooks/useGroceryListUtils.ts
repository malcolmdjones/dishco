
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MealPlan } from '@/types/MealPlan';

export const useGroceryListUtils = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [groceryItems, setGroceryItems] = useState<string[]>([]);

  const processMealPlanForGroceries = (plan: MealPlan) => {
    if (!plan || !plan.plan_data || !plan.plan_data.days) {
      toast({
        title: "Error",
        description: "This meal plan doesn't contain any items for a grocery list.",
        variant: "destructive"
      });
      return;
    }

    setCurrentMealPlan(plan);
    
    // Extract grocery items from the meal plan
    const items: string[] = [];
    plan.plan_data.days.forEach(day => {
      if (!day || !day.meals) return;
      
      // Process breakfast
      const breakfast = day.meals.breakfast;
      if (breakfast) {
        const breakfastItems = Array.isArray(breakfast) ? breakfast : [breakfast];
        breakfastItems.forEach(item => {
          if (item.ingredients) {
            items.push(...item.ingredients);
          }
        });
      }
      
      // Process lunch
      const lunch = day.meals.lunch;
      if (lunch) {
        const lunchItems = Array.isArray(lunch) ? lunch : [lunch];
        lunchItems.forEach(item => {
          if (item.ingredients) {
            items.push(...item.ingredients);
          }
        });
      }
      
      // Process dinner
      const dinner = day.meals.dinner;
      if (dinner) {
        const dinnerItems = Array.isArray(dinner) ? dinner : [dinner];
        dinnerItems.forEach(item => {
          if (item.ingredients) {
            items.push(...item.ingredients);
          }
        });
      }
      
      // Process snacks
      const snacks = day.meals.snacks;
      if (Array.isArray(snacks)) {
        snacks.forEach(snack => {
          if (snack && snack.ingredients) {
            items.push(...snack.ingredients);
          }
        });
      }
    });
    
    // Remove duplicates and set the grocery items
    setGroceryItems([...new Set(items)]);
    
    // Show confirmation dialog if there are items
    if (items.length > 0) {
      setShowConfirmation(true);
    } else {
      toast({
        title: "No grocery items",
        description: "This meal plan doesn't have any ingredients to add to your grocery list.",
      });
    }
  };

  const handleConfirmGroceryAddition = () => {
    if (!currentMealPlan || groceryItems.length === 0) return;
    
    // Get current grocery list from localStorage
    const existingItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
    
    // Add new items from the meal plan
    const updatedItems = [...existingItems];
    
    groceryItems.forEach(ingredient => {
      // Check if item already exists
      const existingItem = existingItems.find((item: any) => item.name.toLowerCase() === ingredient.toLowerCase());
      
      if (!existingItem) {
        // Add new item
        updatedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: ingredient,
          category: 'Other',
          quantity: "1",
          unit: 'item(s)',
          checked: false
        });
      }
    });
    
    // Save updated list to localStorage
    localStorage.setItem('groceryItems', JSON.stringify(updatedItems));
    
    toast({
      title: "Grocery List Updated",
      description: `${groceryItems.length} items were added to your grocery list.`,
    });
    
    setShowConfirmation(false);
    navigate('/grocery');
  };

  return {
    showConfirmation,
    setShowConfirmation,
    currentMealPlan,
    processMealPlanForGroceries,
    handleConfirmGroceryAddition,
    groceryItems
  };
};
