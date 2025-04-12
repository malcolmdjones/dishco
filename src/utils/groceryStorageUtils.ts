
import { Ingredient } from '@/types/groceryTypes';

// Function to add ingredients to grocery list
export const addToGroceryList = (ingredients: Ingredient[], onSuccess?: () => void, onError?: (error: any) => void) => {
  try {
    if (!ingredients || ingredients.length === 0) {
      console.warn('No ingredients to add to grocery list');
      if (onError) onError(new Error('No ingredients found to add to grocery list'));
      return;
    }
    
    console.log('Adding ingredients to grocery list:', ingredients);
    
    // Get existing grocery items
    const existingItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
    
    // Create a map of existing items by name for quick lookup
    const existingItemsMap = new Map();
    existingItems.forEach((item: any) => {
      if (item && item.name) {
        existingItemsMap.set(item.name.toLowerCase().trim(), item);
      }
    });
    
    // Add new ingredients, combining with existing items if needed
    const newItems = [...existingItems];
    
    ingredients.forEach(ingredient => {
      if (!ingredient || !ingredient.name) return;
      
      const normalizedName = ingredient.name.toLowerCase().trim();
      
      if (existingItemsMap.has(normalizedName)) {
        // Update existing item quantity
        const existingItem = existingItemsMap.get(normalizedName);
        try {
          const newQty = parseInt(existingItem.quantity) + parseInt(ingredient.quantity || "1");
          existingItem.quantity = newQty.toString();
        } catch (e) {
          console.warn('Error updating quantity, incrementing by 1:', e);
          existingItem.quantity = (parseInt(existingItem.quantity) + 1).toString();
        }
      } else {
        // Add as new item
        newItems.push({
          id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          category: ingredient.category || 'Other',
          quantity: ingredient.quantity || "1",
          unit: ingredient.unit || 'item(s)',
          checked: false
        });
      }
    });
    
    // Save back to localStorage
    localStorage.setItem('groceryItems', JSON.stringify(newItems));
    
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error adding ingredients to grocery list:', error);
    if (onError) onError(error);
  }
};
