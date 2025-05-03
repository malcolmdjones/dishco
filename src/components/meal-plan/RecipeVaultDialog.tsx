
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CookingPot, Zap, Blend, Search, Plus } from 'lucide-react';
import { Recipe } from '@/types/Recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { getRecipeImage } from '@/utils/recipeUtils';

interface RecipeVaultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  mealType: string;
  targetMealIndex?: number;
}

const RecipeVaultDialog: React.FC<RecipeVaultDialogProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  mealType,
  targetMealIndex
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const { recipes, loading } = useRecipes();

  // Set initial filter based on target meal type
  useEffect(() => {
    if (mealType && isOpen) {
      // Convert mealType to recipe type format
      let type = mealType.toLowerCase();
      // Handle plural form of 'snacks' to singular 'snack' for filtering
      if (type === 'snacks') type = 'snack';
      // Handle 'desserts' to 'dessert' for filtering
      if (type === 'desserts') type = 'dessert';
      setSelectedType(type);
    }
  }, [mealType, isOpen]);

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
        (recipe.description && recipe.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredRecipes(filtered);
  }, [searchTerm, selectedType, recipes]);

  // Get unique recipe types
  const recipeTypes = [...new Set(recipes.map(recipe => recipe.type).filter(Boolean))];

  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recipe Vault</DialogTitle>
          <DialogDescription>Browse and select recipes from your collection</DialogDescription>
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
            <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-nowrap">
              <Button 
                variant={selectedType === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                All
              </Button>
              {recipeTypes.map(type => type && (
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
          
          {/* Loading state */}
          {loading ? (
            <div className="text-center py-6">
              <p>Loading recipes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{recipe.name}</h3>
                      <div className="flex gap-1">
                        {recipe.requiresBlender && (
                          <span className="text-gray-500" title="Requires blender">
                            <Blend size={14} />
                          </span>
                        )}
                        {recipe.requiresCooking && (
                          <span className="text-gray-500" title="Requires cooking">
                            <CookingPot size={14} />
                          </span>
                        )}
                        {recipe.cookTime && recipe.cookTime <= 15 && (
                          <span className="text-amber-500" title="Quick to prepare">
                            <Zap size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 h-20 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={getRecipeImage(recipe.imageSrc)} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2 mb-2">{recipe.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                        {recipe.type && recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1)}
                      </span>
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                        {recipe.macros.calories} kcal
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 col-span-3">
                  <p className="text-gray-500">No recipes found. Try adjusting your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeVaultDialog;
