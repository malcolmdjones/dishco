
import React, { useState } from 'react';
import { Check, ChevronRight, Plus, Search } from 'lucide-react';
import { calculateDailyMacros, MealPlanDay } from '@/types/MealPlanTypes';
import { Recipe } from '@/types/Recipe';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  recipe?: string;
}

const GroceryListPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
    // Sample grocery items
    { id: '1', name: 'Apples', category: 'Fruits', checked: false, recipe: 'Apple Smoothie' },
    { id: '2', name: 'Bananas', category: 'Fruits', checked: false, recipe: 'Banana Bread' },
    { id: '3', name: 'Chicken Breast', category: 'Meat', checked: false, recipe: 'Grilled Chicken' },
    { id: '4', name: 'Broccoli', category: 'Vegetables', checked: false, recipe: 'Roasted Vegetables' },
    { id: '5', name: 'Olive Oil', category: 'Pantry', checked: false },
    { id: '6', name: 'Greek Yogurt', category: 'Dairy', checked: false, recipe: 'Yogurt Parfait' },
    { id: '7', name: 'Eggs', category: 'Dairy', checked: false, recipe: 'Breakfast Scramble' },
    { id: '8', name: 'Whole Wheat Bread', category: 'Bakery', checked: false },
    { id: '9', name: 'Spinach', category: 'Vegetables', checked: false, recipe: 'Spinach Salad' },
    { id: '10', name: 'Salmon', category: 'Seafood', checked: false, recipe: 'Baked Salmon' },
  ]);

  const toggleItem = (id: string) => {
    setGroceryItems(items => 
      items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addCustomItem = () => {
    if (!searchQuery.trim()) return;
    
    const newItem = {
      id: `custom-${Date.now()}`,
      name: searchQuery,
      category: 'Custom',
      checked: false
    };
    
    setGroceryItems([...groceryItems, newItem]);
    setSearchQuery('');
    
    toast({
      title: "Item Added",
      description: `${searchQuery} added to your grocery list.`
    });
  };

  const clearCheckedItems = () => {
    setGroceryItems(items => items.filter(item => !item.checked));
    toast({
      title: "Cleared",
      description: "Checked items have been removed from your list."
    });
  };

  const filteredItems = searchQuery 
    ? groceryItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groceryItems;

  // Group items by category
  const groupedItems: Record<string, GroceryItem[]> = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Check if all items are checked
  const allChecked = groceryItems.length > 0 && groceryItems.every(item => item.checked);
  const someChecked = groceryItems.some(item => item.checked);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Grocery List</h1>
      
      {/* Search and Add */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text"
            placeholder="Add or search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustomItem();
            }}
          />
        </div>
        <Button 
          className="shrink-0"
          onClick={addCustomItem}
          disabled={!searchQuery.trim()}
        >
          <Plus size={18} className="mr-1" /> Add
        </Button>
      </div>
      
      {/* Actions bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {groceryItems.filter(item => item.checked).length}/{groceryItems.length} items checked
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearCheckedItems}
          disabled={!someChecked}
        >
          <Check size={16} className="mr-1" /> Clear checked
        </Button>
      </div>

      {/* Grocery List */}
      <div className="space-y-4">
        {Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{category}</h3>
              <div className="bg-white rounded-lg overflow-hidden shadow">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <div 
                      className={`flex items-center p-3 ${item.checked ? 'bg-gray-50' : ''}`}
                    >
                      <Checkbox 
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        id={item.id}
                      />
                      <label 
                        htmlFor={item.id}
                        className={`ml-3 flex-1 ${item.checked ? 'line-through text-gray-400' : ''}`}
                      >
                        {item.name}
                      </label>
                      {item.recipe && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {item.recipe}
                        </span>
                      )}
                    </div>
                    {index < items.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No matching items found" : "Your grocery list is empty"}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryListPage;
