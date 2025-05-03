
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X, Plus } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { searchFoods, foodItemToRecipe, addToRecentFoods } from '@/services/foodDatabaseService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FoodDatabaseItem } from '@/types/food';
import { Recipe } from '@/types/Recipe';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (foodItem: Recipe) => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onSelectFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('snack');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      console.log(`Searching for: ${searchQuery}`);
      const results = await searchFoods(searchQuery);
      console.log(`Search results:`, results);
      setSearchResults(results);
      if (results.length === 0) {
        console.log('No results found for query:', searchQuery);
      }
    } catch (error) {
      console.error("Error searching foods:", error);
      setError("Failed to search for foods. Please try again later.");
      toast({
        title: "Search Error",
        description: "Could not retrieve food database results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectFood = (food: FoodDatabaseItem) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      const recipe = foodItemToRecipe(selectedFood, selectedQuantity);
      recipe.type = selectedMealType;
      
      // Add to recent foods
      addToRecentFoods(selectedFood);
      
      onSelectFood(recipe);
      toast({
        title: "Food Added",
        description: `${recipe.name} added to your food log.`
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Automatically search when the search query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] sm:max-w-lg p-0 rounded-xl">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-xl text-blue-600 text-center">Food Search</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="relative flex items-center bg-gray-100 rounded-full">
            <Search className="absolute left-3 text-blue-600" size={20} />
            <Input
              placeholder="Search for a food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              ref={searchInputRef}
              className="pl-10 pr-10 py-2 border-0 bg-gray-100 rounded-full focus:ring-0 focus-visible:ring-0"
            />
            {searchQuery && (
              <button 
                className="absolute right-3"
                onClick={handleClearSearch}
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {isSearching && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-500 mt-2">Searching for foods...</p>
            </div>
          )}
          
          {!isSearching && searchResults.length > 0 && !selectedFood && (
            <ScrollArea className="h-[300px] pr-3">
              <p className="text-sm text-gray-500 mb-3">Search results ({searchResults.length})</p>
              <div className="space-y-2">
                {searchResults.map((food) => (
                  <div 
                    key={food.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="flex items-center flex-1">
                      {food.imageSrc ? (
                        <img 
                          src={food.imageSrc} 
                          alt={food.name} 
                          className="w-12 h-12 rounded object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-xs text-gray-500">{food.id.startsWith('fs-') ? 'FS' : 'No img'}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-500">
                          {food.brand ? `${food.brand} • ` : ''}
                          <span className="font-medium">{food.macros.calories} cal</span>
                          {food.macros.protein ? `, ${food.macros.protein}g protein` : ''}
                          {food.servingSize ? `, ${food.servingSize}` : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full shrink-0"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {selectedFood && (
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                {selectedFood.imageSrc ? (
                  <img 
                    src={selectedFood.imageSrc} 
                    alt={selectedFood.name} 
                    className="w-16 h-16 rounded object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 mr-4 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{selectedFood.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedFood.brand || 'Generic'} • 
                    <span className="font-medium"> {selectedFood.macros.calories} cal</span>
                    {selectedFood.macros.protein ? `, ${selectedFood.macros.protein}g protein` : ''}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || 1)}
                    className="border-gray-300"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meal Type</label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Nutrition (with selected quantity)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <p>Calories: <span className="font-medium">{Math.round(selectedFood.macros.calories * selectedQuantity)}</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <p>Protein: <span className="font-medium">{Math.round((selectedFood.macros.protein || 0) * selectedQuantity)}g</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <p>Carbs: <span className="font-medium">{Math.round((selectedFood.macros.carbs || 0) * selectedQuantity)}g</span></p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <p>Fat: <span className="font-medium">{Math.round((selectedFood.macros.fat || 0) * selectedQuantity)}g</span></p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedFood(null)}>
                  Back to Search
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddFood}>
                  Add to Food Log
                </Button>
              </div>
            </div>
          )}
          
          {!isSearching && searchResults.length === 0 && !selectedFood && (
            <div>
              {searchQuery ? (
                <div className="space-y-4">
                  <p className="text-center text-gray-500 py-4">
                    No results found. Try another search term.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-gray-500">
                    Search for foods in our database
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchModal;
