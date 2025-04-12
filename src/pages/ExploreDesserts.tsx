import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CakeSlice, ArrowLeft, Search, Filter, X } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { getRecipeImage } from '@/utils/recipeUtils';
import { Card, CardContent } from '@/components/ui/card';

// Define filter types
type FlavorProfile = 'sweet' | 'tangy' | 'rich' | 'fruity' | 'chocolatey';
type DessertType = 'cake' | 'cookie' | 'ice-cream' | 'pastry' | 'pudding' | 'pie' | 'chocolate' | 'fruit-based';
type DietaryPreference = 'vegan' | 'gluten-free' | 'dairy-free' | 'low-sugar' | 'keto' | 'paleo' | 'nut-free';
type CalorieRange = '0-100' | '100-200' | '200-300' | '300-400' | '400+';

// Define filter state interface
interface Filters {
  flavorProfile: FlavorProfile[];
  dessertType: DessertType[];
  dietary: DietaryPreference[];
  calories: CalorieRange[];
}

const ExploreDesserts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recipes, loading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filteredDesserts, setFilteredDesserts] = useState<Recipe[]>([]);
  const [visibleDesserts, setVisibleDesserts] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dessertsPerPage = 8;
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    flavorProfile: [],
    dessertType: [],
    dietary: [],
    calories: []
  });
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Filter desserts to only include items that are desserts
  useEffect(() => {
    const dessertRecipes = recipes.filter(recipe => 
      recipe.type?.toLowerCase() === 'dessert' || 
      recipe.name.toLowerCase().includes('dessert') ||
      (recipe.description && recipe.description.toLowerCase().includes('dessert'))
    );
    
    setFilteredDesserts(dessertRecipes);
    
    console.log('Total recipes:', recipes.length);
    console.log('Dessert recipes found:', dessertRecipes.length);
    console.log('Recipe types available:', [...new Set(recipes.map(r => r.type))]);
  }, [recipes]);
  
  // Effect to load initial desserts
  useEffect(() => {
    if (filteredDesserts.length > 0) {
      loadMoreDesserts(true);
    }
  }, [filteredDesserts]);
  
  // Effect to detect filter changes
  useEffect(() => {
    // Count active filters
    let count = 0;
    count += filters.flavorProfile.length;
    count += filters.dessertType.length;
    count += filters.dietary.length;
    count += filters.calories.length;
    
    setActiveFilterCount(count);
  }, [filters]);
  
  // Load more desserts with pagination
  const loadMoreDesserts = (reset = false) => {
    setLoadingMore(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const startIndex = reset ? 0 : (page - 1) * dessertsPerPage;
      const endIndex = startIndex + dessertsPerPage;
      
      // Filter desserts based on current filters and search query
      const desserts = filteredDesserts.filter(dessert => {
        // Search query filter
        if (searchQuery && !dessert.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !dessert.description?.toLowerCase()?.includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Apply other filters if they are selected
        if (filters.calories.length > 0) {
          // Simple calorie filtering example
          const calories = dessert.macros.calories;
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
        
        // Note: Other filters would be implemented similarly
        // This is a simplified implementation since we don't have the actual data properties
        
        return true;
      });
      
      const newDesserts = desserts.slice(startIndex, endIndex);
      
      if (reset) {
        setVisibleDesserts(newDesserts);
        setPage(1);
      } else {
        setVisibleDesserts(prev => [...prev, ...newDesserts]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(endIndex < desserts.length);
      setLoadingMore(false);
    }, 500);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Apply search filter
  const handleSearch = () => {
    loadMoreDesserts(true);
  };
  
  // Handle dessert selection
  const handleDessertClick = (dessert: Recipe) => {
    setSelectedRecipe(dessert);
    setIsRecipeViewerOpen(true);
  };
  
  // Apply all filters
  const applyFilters = () => {
    setFiltersApplied(true);
    loadMoreDesserts(true);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      flavorProfile: [],
      dessertType: [],
      dietary: [],
      calories: []
    });
    setFiltersApplied(false);
    loadMoreDesserts(true);
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
        <h1 className="text-xl font-bold flex items-center">
          <CakeSlice className="mr-2 text-purple-500" />
          Explore Desserts
        </h1>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search desserts..." 
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
              <SheetTitle>Filter Desserts</SheetTitle>
              <SheetDescription>
                Find the perfect dessert for your sweet tooth
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              {/* Flavor Profile Filter */}
              <div>
                <h3 className="font-medium mb-2">Flavor Profile</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['sweet', 'tangy', 'rich', 'fruity', 'chocolatey'].map((flavor) => (
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
              
              {/* Dessert Type Filter */}
              <div>
                <h3 className="font-medium mb-2">Dessert Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'cake', 'cookie', 'ice-cream', 'pastry', 'pudding', 
                    'pie', 'chocolate', 'fruit-based'
                  ].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={filters.dessertType.includes(type as DessertType)}
                        onCheckedChange={() => toggleFilter('dessertType', type as DessertType)}
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
                    'vegan', 'gluten-free', 'dairy-free', 'low-sugar', 'keto', 
                    'paleo', 'nut-free'
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
          
          {filters.dessertType.map(type => (
            <Button 
              key={`filter-type-${type}`}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-gray-100"
              onClick={() => toggleFilter('dessertType', type)}
            >
              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              <X size={14} className="ml-1" />
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
                  {filters.dietary.map(diet => (
                    <Button 
                      key={`filter-diet-${diet}`}
                      variant="outline" 
                      size="sm" 
                      className="flex items-center justify-between gap-1 bg-gray-100"
                      onClick={() => toggleFilter('dietary', diet)}
                    >
                      {diet.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      <X size={14} />
                    </Button>
                  ))}
                  {filters.calories.map(range => (
                    <Button 
                      key={`filter-calories-${range}`}
                      variant="outline" 
                      size="sm" 
                      className="flex items-center justify-between gap-1 bg-gray-100"
                      onClick={() => toggleFilter('calories', range)}
                    >
                      {range} calories
                      <X size={14} />
                    </Button>
                  ))}
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
          <p>Loading desserts...</p>
        </div>
      )}
      
      {/* Dessert Grid */}
      <div className="grid grid-cols-2 gap-4">
        {visibleDesserts.map(dessert => (
          <div 
            key={dessert.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer"
            onClick={() => handleDessertClick(dessert)}
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img 
                src={getRecipeImage(dessert.imageSrc)} 
                alt={dessert.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{dessert.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">{dessert.macros.calories} cal</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                    Dessert
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {dessert.type && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded">
                    {dessert.type}
                  </span>
                )}
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
            onClick={() => loadMoreDesserts()} 
            disabled={loadingMore}
            className="w-full"
          >
            {loadingMore ? 'Loading...' : 'Load More Desserts'}
          </Button>
        </div>
      )}
      
      {/* No Results Message */}
      {visibleDesserts.length === 0 && !loading && (
        <div className="text-center py-10">
          <CakeSlice className="mx-auto text-gray-300" size={48} />
          <h3 className="font-medium text-lg mt-4">No desserts found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery || activeFilterCount > 0 ? 
              "Try adjusting your search or filters" : 
              "We don't have any dessert recipes matching your criteria yet"}
          </p>
          {(searchQuery || activeFilterCount > 0) && (
            <Button 
              variant="link" 
              onClick={resetFilters}
              className="mt-2"
            >
              Clear filters and try again
            </Button>
          )}
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

export default ExploreDesserts;
