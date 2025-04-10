
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';
import RecipeViewer from '@/components/RecipeViewer';

const categoryDisplayNames: {[key: string]: string} = {
  'brunch': 'Brunch',
  'game-day': 'Game Day',
  'halloween': 'Halloween',
  'snacks': 'Snacks',
  'ice-cream': 'Ice Cream',
  'drinks': 'Drinks'
};

const SnackCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const { recipes, loading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSnacks, setFilteredSnacks] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  
  const displayName = category && categoryDisplayNames[category] ? categoryDisplayNames[category] : 'Category';
  
  useEffect(() => {
    if (recipes.length > 0) {
      filterSnacks();
    }
  }, [recipes, category, searchQuery]);

  const filterSnacks = () => {
    let filtered = recipes.filter(recipe => 
      recipe.type === 'snack' || 
      recipe.macros.calories < 400 ||
      recipe.name.toLowerCase().includes('snack') ||
      (recipe.description && recipe.description.toLowerCase().includes('snack'))
    );

    // Apply category filter
    if (category) {
      filtered = filtered.filter(snack => {
        // This is a simple filtering logic, you might want to enhance it
        // with real tags or categories in your recipe data
        switch(category) {
          case 'brunch':
            return snack.name.toLowerCase().includes('breakfast') || 
                   snack.name.toLowerCase().includes('brunch') ||
                   (snack.description && snack.description.toLowerCase().includes('brunch'));
          case 'game-day':
            return snack.name.toLowerCase().includes('chip') || 
                   snack.name.toLowerCase().includes('dip') ||
                   (snack.description && snack.description.toLowerCase().includes('party'));
          case 'halloween':
            return snack.name.toLowerCase().includes('candy') || 
                   snack.name.toLowerCase().includes('treat') ||
                   (snack.description && snack.description.toLowerCase().includes('sweet'));
          case 'snacks':
            return snack.type === 'snack';
          case 'ice-cream':
            return snack.name.toLowerCase().includes('ice cream') || 
                   snack.name.toLowerCase().includes('frozen') ||
                   (snack.description && snack.description.toLowerCase().includes('dessert'));
          case 'drinks':
            return snack.name.toLowerCase().includes('drink') || 
                   snack.name.toLowerCase().includes('smoothie') ||
                   snack.name.toLowerCase().includes('juice') ||
                   (snack.description && snack.description.toLowerCase().includes('beverage'));
          default:
            return true;
        }
      });
    }

    // Apply search query if any
    if (searchQuery) {
      filtered = filtered.filter(snack => 
        snack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (snack.description && snack.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredSnacks(filtered);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSnackClick = (snack: Recipe) => {
    setSelectedRecipe(snack);
    setIsRecipeViewerOpen(true);
  };

  return (
    <div className="pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/planning')} 
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">{displayName}</h1>
      </div>
      
      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder={`Search ${displayName.toLowerCase()}...`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-10">
          <p>Loading {displayName.toLowerCase()}...</p>
        </div>
      )}
      
      {/* Snack Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredSnacks.map(snack => (
          <div 
            key={snack.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer"
            onClick={() => handleSnackClick(snack)}
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img 
                src={getRecipeImage(snack.imageSrc)} 
                alt={snack.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{snack.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">{snack.macros.calories} cal</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                    {category?.charAt(0).toUpperCase() + category?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* No Results Message */}
      {filteredSnacks.length === 0 && !loading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No {displayName.toLowerCase()} found.</p>
        </div>
      )}
      
      {/* Recipe Viewer Dialog */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
          onToggleSave={async (recipeId, isSaved) => {
            await toggleSaveRecipe(recipeId);
          }}
          isSaved={selectedRecipe ? isRecipeSaved(selectedRecipe.id) : false}
        />
      )}
    </div>
  );
};

export default SnackCategoryPage;
