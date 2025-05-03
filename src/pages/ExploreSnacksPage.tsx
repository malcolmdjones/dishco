
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import RecipeViewer from '@/components/RecipeViewer';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';

// Define filter types
type PriceRange = '$' | '$$' | '$$$';
type FlavorProfile = 'sweet' | 'savory' | 'spicy' | 'salty' | 'sour';
type SnackType = 'protein-bars' | 'granola' | 'nuts-seeds' | 'crackers' | 'trail-mix' | 'chips' | 'cookies' | 'candy' | 'chocolate' | 'meat';
type DietaryPreference = 'keto' | 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'low-sugar' | 'paleo' | 'high-protein' | 'high-fiber' | 'organic';
type CalorieRange = '0-100' | '100-200' | '200-300' | '300-400' | '400+';

// Define filter state interface
interface Filters {
  price: PriceRange[];
  flavorProfile: FlavorProfile[];
  snackType: SnackType[];
  dietary: DietaryPreference[];
  calories: CalorieRange[];
}

const ExploreSnacksPage = () => {
  const navigate = useNavigate();
  const { recipes, loading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleSnacks, setVisibleSnacks] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const snacksPerPage = 8;
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    price: [],
    flavorProfile: [],
    snackType: [],
    dietary: [],
    calories: []
  });
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Filter snacks to only include items that would be considered snacks
  const snackRecipes = recipes.filter(recipe => 
    recipe.type === 'snack' || 
    recipe.macros.calories < 400 ||
    recipe.name.toLowerCase().includes('snack') ||
    (recipe.description && recipe.description.toLowerCase().includes('snack'))
  );
  
  // Effect to load initial snacks
  useEffect(() => {
    if (recipes.length > 0) {
      loadMoreSnacks(true);
    }
  }, [recipes]);
  
  // Effect to detect filter changes
  useEffect(() => {
    // Count active filters
    let count = 0;
    count += filters.price.length;
    count += filters.flavorProfile.length;
    count += filters.snackType.length;
    count += filters.dietary.length;
    count += filters.calories.length;
    
    setActiveFilterCount(count);
  }, [filters]);
  
  // Load more snacks with pagination
  const loadMoreSnacks = (reset = false) => {
    setLoadingMore(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const startIndex = reset ? 0 : (page - 1) * snacksPerPage;
      const endIndex = startIndex + snacksPerPage;
      
      // Filter snacks based on current filters and search query
      const filteredSnacks = snackRecipes.filter(snack => {
        // Search query filter
        if (searchQuery && !snack.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !snack.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Apply other filters if they are selected
        if (filters.calories.length > 0) {
          // Simple calorie filtering example
          const calories = snack.macros.calories;
          const inRange = filters.calories.some(range => {
            if (range === '0-100') return calories >= 0 && calories <= 100;
            if (range === '100-200') return calories > 100 && calories <= 200;
            if (range === '200-300') return calories > 200 && calories <= 300;
            if (range === '300-400') return calories > 300 && calories <= 400;
            if (range === '400+') return calories > 400;
            return false;
          });
          
          if (!inRange) return false;
        }
        
        // Other filters would be implemented similarly
        // This is a simplified implementation
        
        return true;
      });
      
      const newSnacks = filteredSnacks.slice(startIndex, endIndex);
      
      if (reset) {
        setVisibleSnacks(newSnacks);
        setPage(1);
      } else {
        setVisibleSnacks(prev => [...prev, ...newSnacks]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(endIndex < filteredSnacks.length);
      setLoadingMore(false);
    }, 500);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Apply search filter
  const handleSearch = () => {
    loadMoreSnacks(true);
  };
  
  // Handle snack selection
  const handleSnackClick = (snack: Recipe) => {
    setSelectedRecipe(snack);
    setIsRecipeViewerOpen(true);
  };
  
  // Apply all filters
  const applyFilters = () => {
    setFiltersApplied(true);
    loadMoreSnacks(true);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      price: [],
      flavorProfile: [],
      snackType: [],
      dietary: [],
      calories: []
    });
    setFiltersApplied(false);
    loadMoreSnacks(true);
  };
  
  // Toggle filter item
  const toggleFilter = <T extends keyof Filters>(
    category: T, 
    value: Filters[T] extends (infer U)[] ? U : never
  ) => {
    setFilters(prev => {
      const current = prev[category] as any[];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
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
        <h1 className="text-xl font-bold">Explore Snacks</h1>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search snacks..." 
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter size={18} className="mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Snacks</SheetTitle>
              <SheetDescription>
                Find the perfect snack for your lifestyle
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              {/* Price Range Filter */}
              <div>
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex gap-4">
                  {['$', '$$', '$$$'].map((price) => (
                    <div key={price} className="flex items-center gap-2">
                      <Checkbox 
                        id={`price-${price}`} 
                        checked={filters.price.includes(price as PriceRange)}
                        onCheckedChange={() => toggleFilter('price', price as PriceRange)}
                      />
                      <Label htmlFor={`price-${price}`}>{price}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Flavor Profile Filter */}
              <div>
                <h3 className="font-medium mb-2">Flavor Profile</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['sweet', 'savory', 'spicy', 'salty', 'sour'].map((flavor) => (
                    <div key={flavor} className="flex items-center gap-2">
                      <Checkbox 
                        id={`flavor-${flavor}`} 
                        checked={filters.flavorProfile.includes(flavor as FlavorProfile)}
                        onCheckedChange={() => toggleFilter('flavorProfile', flavor as FlavorProfile)}
                      />
                      <Label htmlFor={`flavor-${flavor}`}>{flavor.charAt(0).toUpperCase() + flavor.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Snack Type Filter */}
              <div>
                <h3 className="font-medium mb-2">Snack Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'protein-bars', 'granola', 'nuts-seeds', 'crackers', 'trail-mix', 
                    'chips', 'cookies', 'candy', 'chocolate', 'meat'
                  ].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={filters.snackType.includes(type as SnackType)}
                        onCheckedChange={() => toggleFilter('snackType', type as SnackType)}
                      />
                      <Label htmlFor={`type-${type}`}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Dietary Preferences Filter */}
              <div>
                <h3 className="font-medium mb-2">Dietary Preferences</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'keto', 'vegan', 'vegetarian', 'gluten-free', 'dairy-free', 
                    'low-carb', 'low-sugar', 'paleo', 'high-protein', 'high-fiber', 'organic'
                  ].map((diet) => (
                    <div key={diet} className="flex items-center gap-2">
                      <Checkbox 
                        id={`diet-${diet}`} 
                        checked={filters.dietary.includes(diet as DietaryPreference)}
                        onCheckedChange={() => toggleFilter('dietary', diet as DietaryPreference)}
                      />
                      <Label htmlFor={`diet-${diet}`}>
                        {diet.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Calorie Range Filter */}
              <div>
                <h3 className="font-medium mb-2">Calories</h3>
                <div className="grid grid-cols-1 gap-2">
                  {['0-100', '100-200', '200-300', '300-400', '400+'].map((range) => (
                    <div key={range} className="flex items-center gap-2">
                      <Checkbox 
                        id={`calories-${range}`} 
                        checked={filters.calories.includes(range as CalorieRange)}
                        onCheckedChange={() => toggleFilter('calories', range as CalorieRange)}
                      />
                      <Label htmlFor={`calories-${range}`}>{range} cal</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <SheetFooter className="flex gap-2 mt-4">
              <Button variant="outline" onClick={resetFilters} className="flex-1">
                Reset
              </Button>
              <SheetClose asChild>
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.price.map(price => (
            <Button 
              key={`filter-price-${price}`}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-gray-100"
              onClick={() => toggleFilter('price', price)}
            >
              {price} <X size={14} className="ml-1" />
            </Button>
          ))}
          
          {filters.flavorProfile.map(flavor => (
            <Button 
              key={`filter-flavor-${flavor}`}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-gray-100"
              onClick={() => toggleFilter('flavorProfile', flavor)}
            >
              {flavor.charAt(0).toUpperCase() + flavor.slice(1)} <X size={14} className="ml-1" />
            </Button>
          ))}
          
          {activeFilterCount > 3 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gray-100">
                  +{activeFilterCount - 3} more
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid gap-1">
                  {/* Display remaining filters */}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500"
            onClick={resetFilters}
          >
            Clear All
          </Button>
        </div>
      )}
      
      {/* Loading state */}
      {loading && !loadingMore && (
        <div className="text-center py-10">
          <p>Loading snacks...</p>
        </div>
      )}
      
      {/* Snack Grid */}
      <div className="grid grid-cols-2 gap-4">
        {visibleSnacks.map(snack => (
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
                    Snack
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded">
                  {snack.type === 'snack' ? 'Healthy Snack' : snack.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => loadMoreSnacks()} 
            disabled={loadingMore}
            className="w-full"
          >
            {loadingMore ? 'Loading...' : 'Load More Snacks'}
          </Button>
        </div>
      )}
      
      {/* No Results Message */}
      {visibleSnacks.length === 0 && !loading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No snacks found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={resetFilters}
            className="mt-2"
          >
            Clear filters and try again
          </Button>
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

export default ExploreSnacksPage;
