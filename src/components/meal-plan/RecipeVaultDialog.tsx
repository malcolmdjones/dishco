
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search, Plus } from 'lucide-react';
import { recipes, Recipe } from '@/data/mockData';

interface RecipeVaultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe, mealType: string, index?: number) => void;
  targetMealType: string;
  targetMealIndex?: number;
}

const RecipeVaultDialog: React.FC<RecipeVaultDialogProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  targetMealType,
  targetMealIndex
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  
  // Filter recipes based on search term and selected type
  useEffect(() => {
    let filtered = [...recipes];
    
    // Filter by meal type if selected
    if (selectedType) {
      filtered = filtered.filter(recipe => recipe.type === selectedType);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(term) ||
        (recipe.description && recipe.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredRecipes(filtered);
  }, [searchTerm, selectedType]);

  // Clear filters when dialog is opened
  useEffect(() => {
    if (isOpen) {
      const mealTypeMapping: {[key: string]: string} = {
        'breakfast': 'breakfast',
        'lunch': 'lunch',
        'dinner': 'dinner',
        'snack': 'snack'
      };
      
      // If we have a target meal type, pre-select that filter
      if (targetMealType && mealTypeMapping[targetMealType]) {
        setSelectedType(mealTypeMapping[targetMealType]);
      } else {
        setSelectedType(null);
      }
      
      setSearchTerm('');
    }
  }, [isOpen, targetMealType]);

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe, targetMealType, targetMealIndex);
    onClose();
  };

  const recipeTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Recipe Vault</span>
          </DialogTitle>
          <button 
            className="absolute top-4 right-4 p-2"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </DialogHeader>

        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2 pb-1">
            <Button
              size="sm"
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => setSelectedType(null)}
              className="text-xs"
            >
              All
            </Button>
            {recipeTypes.map(type => (
              <Button
                key={type.value}
                size="sm"
                variant={selectedType === type.value ? "default" : "outline"}
                onClick={() => setSelectedType(type.value)}
                className="text-xs"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id}
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectRecipe(recipe)}
              >
                <div className="h-28 overflow-hidden">
                  <img 
                    src={recipe.imageSrc || '/placeholder.svg'} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="font-medium text-sm line-clamp-1">{recipe.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600">{recipe.macros.calories} cal</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm capitalize">
                      {recipe.type}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500">No recipes found. Try a different search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeVaultDialog;
