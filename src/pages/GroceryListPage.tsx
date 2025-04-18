import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, RotateCcw, Search, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { generateGroceryList } from '../data/mockData';
import type { GroceryItem } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

// Generate initial grocery list
const initialGroceryItems = generateGroceryList();

// Helper function to normalize ingredient names for comparison
const normalizeIngredientName = (name: string): string => {
  // Convert to lowercase, trim spaces
  let normalized = name.toLowerCase().trim();
  
  // Remove pluralization
  if (normalized.endsWith('s') && normalized.length > 2) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
};

// Helper function to deduplicate grocery items
const deduplicateGroceryItems = (items: GroceryItem[]): GroceryItem[] => {
  const uniqueItems = new Map<string, GroceryItem>();
  
  items.forEach(item => {
    const normalizedName = normalizeIngredientName(item.name);
    
    if (uniqueItems.has(normalizedName)) {
      // Combine quantities if this item already exists
      const existingItem = uniqueItems.get(normalizedName)!;
      
      // Try to parse quantities as numbers when possible
      let existingQty = parseFloat(existingItem.quantity) || 0;
      let newQty = parseFloat(item.quantity) || 0;
      
      // If either parsing failed, just keep the existing item
      if (isNaN(existingQty) || isNaN(newQty)) {
        // Keep the existing item, don't modify it
        return;
      }
      
      // Add quantities
      existingItem.quantity = String(existingQty + newQty);
    } else {
      // Add new item
      uniqueItems.set(normalizedName, {...item});
    }
  });
  
  return Array.from(uniqueItems.values());
};

const GroceryListPage = () => {
  const { toast } = useToast();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    const savedItems = localStorage.getItem('groceryItems');
    const items = savedItems ? JSON.parse(savedItems) : initialGroceryItems;
    // Deduplicate items when loading from localStorage
    return deduplicateGroceryItems(items);
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [itemBeingAnimated, setItemBeingAnimated] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
  }, [groceryItems]);

  const activeItems = groceryItems.filter(item => !item.checked);
  const completedItems = groceryItems.filter(item => item.checked);

  const groupItems = (items: GroceryItem[]) => {
    return items
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .reduce((groups, item) => {
        const firstLetter = item.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(item);
        return groups;
      }, {});
  };

  const groupedActiveItems = groupItems(activeItems);
  const groupedCompletedItems = groupItems(completedItems);

  const sortedActiveGroups = Object.keys(groupedActiveItems).sort();
  const sortedCompletedGroups = Object.keys(groupedCompletedItems).sort();

  const handleToggleItem = (itemName: string) => {
    setItemBeingAnimated(itemName);
    setTimeout(() => {
      setGroceryItems(prevItems =>
        prevItems.map(item =>
          item.name === itemName ? { ...item, checked: !item.checked } : item
        )
      );
      setItemBeingAnimated(null);
    }, 300);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      // Check if the item already exists (case insensitive)
      const normalizedNewItem = normalizeIngredientName(newItem);
      const existingItem = groceryItems.find(item => 
        normalizeIngredientName(item.name) === normalizedNewItem
      );
      
      if (existingItem) {
        // Update existing item quantity
        setGroceryItems(prev => 
          prev.map(item => 
            normalizeIngredientName(item.name) === normalizedNewItem
              ? { 
                  ...item, 
                  quantity: String(
                    (parseFloat(item.quantity) || 1) + 1
                  )
                }
              : item
          )
        );
        
        toast({
          title: "Item Updated",
          description: `The quantity of ${newItem} has been updated in your grocery list.`,
        });
      } else {
        // Add new item
        setGroceryItems(prev => [
          ...prev,
          { 
            id: `item-${Date.now()}`,
            name: newItem.trim(), 
            category: 'Other',
            quantity: "1",
            unit: 'item(s)',
            checked: false 
          }
        ]);
        
        toast({
          title: "Item Added",
          description: `${newItem} has been added to your grocery list.`,
        });
      }
      
      setNewItem('');
    }
  };

  const handleClearCompleted = () => {
    setGroceryItems(prev => prev.filter(item => !item.checked));
    toast({
      title: "Completed Items Cleared",
      description: "All completed items have been removed from your list.",
    });
  };

  const handleUndoItem = (itemName: string) => {
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.name === itemName ? { ...item, checked: false } : item
      )
    );
    toast({
      title: "Item Restored",
      description: `${itemName} has been moved back to your active list.`,
    });
  };

  const activeItemsCount = activeItems.length;
  const completedItemsCount = completedItems.length;
  const completionPercentage = Math.round((completedItemsCount / (activeItemsCount + completedItemsCount)) * 100) || 0;

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Grocery List</h1>
        </div>
        <p className="text-dishco-text-light">Items needed for your meal plan</p>
      </header>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center">
        <div className="w-14 h-14 rounded-full bg-dishco-primary bg-opacity-10 flex items-center justify-center mr-4">
          <ShoppingBag size={24} className="text-dishco-primary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold">Shopping Progress</h2>
            <span className="text-sm font-medium">
              {completedItemsCount} of {activeItemsCount + completedItemsCount} items
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

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active" className="flex items-center justify-center">
            Active
            {activeItemsCount > 0 && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {activeItemsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center justify-center">
            Completed
            {completedItemsCount > 0 && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {completedItemsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {sortedActiveGroups.length > 0 ? (
            sortedActiveGroups.map(letter => (
              <div key={letter} className="mb-4">
                <div className="sticky top-0 bg-dishco-background py-2 font-semibold text-dishco-primary">
                  {letter}
                </div>
                <div className="space-y-2">
                  {groupedActiveItems[letter].map((item, index) => (
                    <GroceryItem
                      key={`${item.name}-${index}`}
                      item={item}
                      onToggle={() => handleToggleItem(item.name)}
                      showUndoButton={false}
                      isBeingAnimated={itemBeingAnimated === item.name}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-dishco-text-light">No active items</p>
              {completedItemsCount > 0 && (
                <p className="text-sm text-dishco-text-light mt-2">
                  Check the completed tab to see checked off items
                </p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {completedItemsCount > 0 ? (
            <div>
              <div className="flex justify-end mb-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center text-xs">
                      <Trash2 size={14} className="mr-1" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear completed items?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all checked off items from your grocery list. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearCompleted}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              {sortedCompletedGroups.map(letter => (
                <div key={letter} className="mb-4">
                  <div className="sticky top-0 bg-dishco-background py-2 font-semibold text-gray-400">
                    {letter}
                  </div>
                  <div className="space-y-2">
                    {groupedCompletedItems[letter].map((item, index) => (
                      <GroceryItem
                        key={`${item.name}-${index}`}
                        item={item}
                        onToggle={() => handleToggleItem(item.name)}
                        showUndoButton={true}
                        onUndo={() => handleUndoItem(item.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-dishco-text-light">No completed items</p>
              <p className="text-sm text-dishco-text-light mt-2">
                Items you check off will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface GroceryItemProps {
  item: GroceryItem;
  onToggle: () => void;
  showUndoButton: boolean;
  onUndo?: () => void;
  isBeingAnimated?: boolean;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ 
  item, 
  onToggle, 
  showUndoButton, 
  onUndo,
  isBeingAnimated = false 
}) => {
  const formatQuantityWithUnit = () => {
    if (!item.quantity && !item.unit) return '';
    
    let displayQuantity = item.quantity || '';
    const displayUnit = item.unit || '';
    
    return `${displayQuantity} ${displayUnit}`.trim();
  };
  
  const quantityDisplay = formatQuantityWithUnit();
  
  return (
    <div 
      className={`bg-white rounded-lg p-3 flex items-center transition-all duration-300 ${
        item.checked ? 'bg-opacity-70' : 'shadow-sm'
      } ${isBeingAnimated ? 'animate-scale-in scale-105 bg-green-50' : ''}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center transition-all duration-300 ${
          item.checked 
            ? 'bg-dishco-primary text-white' 
            : 'border-2 border-gray-300 hover:border-dishco-primary'
        }`}
      >
        {item.checked && <Check size={16} className="stroke-2" />}
      </button>
      
      <div className="flex-1">
        <p className={`transition-all duration-300 ${item.checked ? 'line-through text-gray-500' : 'text-dishco-text'}`}>
          {item.name}
        </p>
      </div>
      
      {quantityDisplay && (
        <div className="bg-gray-100 rounded-full px-2 py-0.5 mr-2">
          <span className="text-xs font-medium">{quantityDisplay}</span>
        </div>
      )}
      
      {showUndoButton && onUndo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUndo();
          }}
          className="p-1.5 text-gray-500 hover:text-dishco-primary rounded-full hover:bg-gray-100 transition-colors"
          title="Restore item"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
};

export default GroceryListPage;
