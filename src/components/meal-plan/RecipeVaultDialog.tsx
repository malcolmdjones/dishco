
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2, Heart } from 'lucide-react';
import { Recipe } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';

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
  const { dbRecipes, fetchDbRecipes } = useMealPlanUtils();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterCustom, setFilterCustom] = useState(false);
  
  // Fetch recipes when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchDbRecipes().then(() => setLoading(false));
      fetchSavedRecipes();
    }
  }, [isOpen, fetchDbRecipes]);
  
  // Fetch saved recipes ids
  const fetchSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id');
      
      if (error) {
        console.error('Error fetching saved recipes:', error);
        return;
      }
      
      if (data) {
        setSavedRecipes(data.map(item => item.recipe_id));
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    }
  };
  
  // Filter recipes based on search term and selected type
  useEffect(() => {
    let filtered = [...dbRecipes];
    
    // Filter by meal type if selected
    if (selectedType) {
      filtered = filtered.filter(recipe => recipe.type === selectedType);
    }
    
    // Filter by favorites if selected
    if (filterFavorites) {
      filtered = filtered.filter(recipe => savedRecipes.includes(recipe.id));
    }
    
    // Filter by custom recipes if selected
    if (filterCustom) {
      filtered = filtered.filter(recipe => recipe.id.startsWith('external-'));
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
  }, [searchTerm, selectedType, dbRecipes, filterFavorites, filterCustom, savedRecipes]);

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
      setFilterFavorites(false);
      setFilterCustom(false);
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
              variant={selectedType === null && !filterFavorites && !filterCustom ? "default" : "outline"}
              onClick={() => {
                setSelectedType(null);
                setFilterFavorites(false);
                setFilterCustom(false);
              }}
              className="text-xs"
            >
              All
            </Button>
            {recipeTypes.map(type => (
              <Button
                key={type.value}
                size="sm"
                variant={selectedType === type.value && !filterFavorites && !filterCustom ? "default" : "outline"}
                onClick={() => {
                  setSelectedType(type.value);
                  setFilterFavorites(false);
                  setFilterCustom(false);
                }}
                className="text-xs"
              >
                {type.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant={filterFavorites ? "default" : "outline"}
              onClick={() => {
                setFilterFavorites(!filterFavorites);
                if (!filterFavorites) {
                  setSelectedType(null);
                  setFilterCustom(false);
                }
              }}
              className="text-xs flex items-center gap-1"
            >
              <Heart size={12} className={filterFavorites ? "fill-current" : ""} /> Favorites
            </Button>
            <Button
              size="sm"
              variant={filterCustom ? "default" : "outline"}
              onClick={() => {
                setFilterCustom(!filterCustom);
                if (!filterCustom) {
                  setSelectedType(null);
                  setFilterFavorites(false);
                }
              }}
              className="text-xs"
            >
              Custom
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id}
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectRecipe(recipe)}
              >
                <div className="h-28 overflow-hidden relative">
                  <img 
                    src={recipe.imageSrc || '/placeholder.svg'} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                  {savedRecipes.includes(recipe.id) && (
                    <div className="absolute top-2 right-2">
                      <Heart size={16} className="fill-red-500 text-red-500" />
                    </div>
                  )}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recipes found. Try a different search.</p>
            {dbRecipes.length === 0 && (
              <p className="mt-4 text-gray-600">
                No recipes available. Only admin can add recipes to the vault.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeVaultDialog;
