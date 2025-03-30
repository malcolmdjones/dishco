
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CookingPot, Zap, Blend, Search, Filter, Plus } from 'lucide-react';
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
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Set initial filter based on target meal type
  useEffect(() => {
    if (targetMealType && isOpen) {
      // Convert targetMealType to recipe type format
      let type = targetMealType.toLowerCase();
      if (type === 'snack') type = 'snack';
      setSelectedType(type);
    }
  }, [targetMealType, isOpen]);

  // Filter recipes based on search term and selected type
  useEffect(() => {
    let filtered = [...recipes];
    
    // Filter by meal type if selected
    if (selectedType) {
      filtered = filtered.filter(recipe => recipe.type === selectedType);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(term) || 
        recipe.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredRecipes(filtered);
  }, [searchTerm, selectedType]);

  // Get unique recipe types
  const recipeTypes = [...new Set(recipes.map(recipe => recipe.type))];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recipe Vault</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <Input
                placeholder="Search recipes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant={selectedType === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                All
              </Button>
              {recipeTypes.map(type => (
                <Button 
                  key={type} 
                  variant={selectedType === type ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Recipe list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelectRecipe(recipe, targetMealType, targetMealIndex);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{recipe.name}</h3>
                  <div className="flex gap-1">
                    {recipe.equipment?.includes('blender') && (
                      <span className="text-gray-500" title="Requires blender">
                        <Blend size={14} />
                      </span>
                    )}
                    {recipe.equipment?.includes('stove') && (
                      <span className="text-gray-500" title="Requires cooking">
                        <CookingPot size={14} />
                      </span>
                    )}
                    {recipe.cookingTime && recipe.cookingTime <= 15 && (
                      <span className="text-amber-500" title="Quick to prepare">
                        <Zap size={14} />
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{recipe.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                    {recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1)}
                  </span>
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                    {recipe.macros.calories} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredRecipes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recipes found. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeVaultDialog;
