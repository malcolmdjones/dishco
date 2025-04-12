import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { searchFoods, convertToMealFormat, FoodItem } from '@/services/foodDatabaseService';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (foodItem: any) => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onSelectFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('snack');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      const formattedFood = convertToMealFormat(selectedFood, selectedQuantity);
      formattedFood.type = selectedMealType;
      onSelectFood(formattedFood);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search External Food Database</DialogTitle>
          <DialogDescription>
            Find foods, restaurant meals, and packaged products to add to your log
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for a food or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {isSearching && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Searching for foods...</p>
            </div>
          )}
          
          {!isSearching && searchResults.length > 0 && !selectedFood && (
            <div className="max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-500 mb-2">Search results ({searchResults.length})</p>
              {searchResults.map((food) => (
                <div 
                  key={food.foodId}
                  className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => handleSelectFood(food)}
                >
                  {food.image ? (
                    <img 
                      src={food.image} 
                      alt={food.label} 
                      className="w-10 h-10 rounded-md object-cover mr-2"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-200 mr-2 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No img</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{food.label}</p>
                    <p className="text-xs text-gray-500">
                      {food.brand || food.categoryLabel || 'Food item'} • {Math.round(food.nutrients.ENERC_KCAL)} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedFood && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center">
                {selectedFood.image ? (
                  <img 
                    src={selectedFood.image} 
                    alt={selectedFood.label} 
                    className="w-16 h-16 rounded-md object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-gray-200 mr-4 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{selectedFood.label}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedFood.brand || ''} {selectedFood.categoryLabel || ''}
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
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meal Type</label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
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
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p>Calories: {Math.round(selectedFood.nutrients.ENERC_KCAL * selectedQuantity)} kcal</p>
                  <p>Protein: {Math.round(selectedFood.nutrients.PROCNT * selectedQuantity)}g</p>
                </div>
                <div>
                  <p>Carbs: {Math.round(selectedFood.nutrients.CHOCDF * selectedQuantity)}g</p>
                  <p>Fat: {Math.round(selectedFood.nutrients.FAT * selectedQuantity)}g</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedFood(null)}>
                  Back to Search
                </Button>
                <Button onClick={handleAddFood}>
                  Add to Food Log
                </Button>
              </div>
            </div>
          )}
          
          {!isSearching && searchResults.length === 0 && searchQuery && (
            <p className="text-center text-gray-500 py-4">
              No results found. Try another search term.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchModal;
