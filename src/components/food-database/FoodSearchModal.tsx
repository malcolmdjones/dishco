
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { searchFoods, convertToMealFormat } from '@/services/foodDatabaseService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const results = await searchFoods(searchQuery);
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

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      const formattedFood = convertToMealFormat(selectedFood, selectedQuantity);
      formattedFood.type = selectedMealType;
      onSelectFood(formattedFood);
      toast({
        title: "Food Added",
        description: `${formattedFood.name} added to your food log.`
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const suggestedSearches = [
    'chicken',
    'rice',
    'eggs',
    'milk',
    'apple'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-xl text-blue-600 text-center">External Food Search</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="relative flex items-center bg-gray-100 rounded-full">
            <Search className="absolute left-3 text-blue-600" size={20} />
            <Input
              placeholder="Search for a food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
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
                    key={food.foodId}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="flex items-center">
                      {food.image ? (
                        <img 
                          src={food.image} 
                          alt={food.label} 
                          className="w-12 h-12 rounded object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{food.label}</p>
                        <p className="text-sm text-gray-500">
                          {food.brand ? `${food.brand} • ` : ''}
                          {food.nutrients?.ENERC_KCAL ? Math.round(food.nutrients.ENERC_KCAL) : 0} kcal
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full"
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
                {selectedFood.image ? (
                  <img 
                    src={selectedFood.image} 
                    alt={selectedFood.label} 
                    className="w-16 h-16 rounded object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 mr-4 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{selectedFood.label}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedFood.brand || 'Generic'} • {Math.round(selectedFood.nutrients.ENERC_KCAL)} kcal per serving
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
                    <p>Calories: {Math.round(selectedFood.nutrients.ENERC_KCAL * selectedQuantity)} kcal</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <p>Protein: {Math.round(selectedFood.nutrients.PROCNT * selectedQuantity)}g</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <p>Carbs: {Math.round(selectedFood.nutrients.CHOCDF * selectedQuantity)}g</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <p>Fat: {Math.round(selectedFood.nutrients.FAT * selectedQuantity)}g</p>
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
                <p className="text-center text-gray-500 py-4">
                  No results found. Try another search term.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-gray-500">
                    Search for foods in our external database
                  </p>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Suggested searches:</p>
                    <div className="space-y-2">
                      {suggestedSearches.map((term, index) => (
                        <button
                          key={index}
                          className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg"
                          onClick={() => setSearchQuery(term)}
                        >
                          <Search size={18} className="mr-2 text-gray-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
