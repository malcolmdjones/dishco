
import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Search, ShoppingBag } from 'lucide-react';
import { generateGroceryList, recipes } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';

// Generate initial grocery list from our mock recipes
const initialGroceryItems = generateGroceryList(
  recipes.filter((_, index) => index < 5) // Only use first 5 recipes for demo
);

const GroceryListPage = () => {
  const { toast } = useToast();
  const [groceryItems, setGroceryItems] = useState(initialGroceryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Group items by first letter
  const groupedItems = groceryItems
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((groups, item) => {
      const firstLetter = item.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(item);
      return groups;
    }, {});

  const sortedGroups = Object.keys(groupedItems).sort();

  const handleToggleItem = (itemName: string) => {
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.name === itemName ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      setGroceryItems(prev => [
        ...prev,
        { name: newItem.trim(), count: 1, checked: false }
      ]);
      setNewItem('');
      toast({
        title: "Item Added",
        description: `${newItem} has been added to your grocery list.`,
      });
    }
  };

  const completedCount = groceryItems.filter(item => item.checked).length;
  const completionPercentage = Math.round((completedCount / groceryItems.length) * 100) || 0;

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <p className="text-dishco-text-light">Items needed for your meal plan</p>
      </header>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center">
        <div className="w-14 h-14 rounded-full bg-dishco-primary bg-opacity-10 flex items-center justify-center mr-4">
          <ShoppingBag size={24} className="text-dishco-primary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold">Shopping Progress</h2>
            <span className="text-sm font-medium">
              {completedCount} of {groceryItems.length} items
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-dishco-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Search and Add Form */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dishco-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <form onSubmit={handleAddItem} className="flex space-x-2">
          <input
            type="text"
            placeholder="Add new item..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dishco-primary"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button
            type="submit"
            className="bg-dishco-primary text-white p-3 rounded-xl"
            disabled={!newItem.trim()}
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      {/* Grocery Items */}
      <div>
        {sortedGroups.length > 0 ? (
          sortedGroups.map(letter => (
            <div key={letter} className="mb-4">
              <div className="sticky top-0 bg-dishco-background py-2 font-semibold text-dishco-primary">
                {letter}
              </div>
              <div className="space-y-2">
                {groupedItems[letter].map((item, index) => (
                  <GroceryItem
                    key={`${item.name}-${index}`}
                    item={item}
                    onToggle={() => handleToggleItem(item.name)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-dishco-text-light">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface GroceryItemProps {
  item: { name: string; count: number; checked: boolean };
  onToggle: () => void;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ item, onToggle }) => {
  return (
    <div 
      className={`bg-white rounded-lg p-3 flex items-center transition-all duration-200 animate-scale-in ${
        item.checked ? 'bg-opacity-70' : 'shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
          item.checked 
            ? 'bg-dishco-primary text-white' 
            : 'border-2 border-gray-300'
        }`}
      >
        {item.checked && <Check size={16} className="stroke-2" />}
      </button>
      
      <div className="flex-1">
        <p className={`${item.checked ? 'line-through text-gray-500' : 'text-dishco-text'}`}>
          {item.name}
        </p>
      </div>
      
      {item.count > 1 && (
        <div className="bg-gray-100 rounded-full px-2 py-0.5">
          <span className="text-xs font-medium">x{item.count}</span>
        </div>
      )}
    </div>
  );
};

export default GroceryListPage;
