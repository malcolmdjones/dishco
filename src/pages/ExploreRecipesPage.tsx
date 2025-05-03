import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ChevronDown, X } from 'lucide-react';
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
import { useRecipes } from '@/hooks/useRecipes';
import RecipeViewer from '@/components/RecipeViewer';
import { Recipe } from '@/types/Recipe';

// Define filter types
type PriceRange = '$' | '$$' | '$$$';
type CookTime = 'quick' | 'medium' | 'long';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type CuisineType = 'american' | 'italian' | 'mexican' | 'indian' | 'chinese' | 'other';
type Equipment = 'oven' | 'stovetop' | 'air fryer' | 'blender' | 'grill' | 'slow cooker';
type CalorieRange = '0-200' | '200-400' | '400-600' | '600-800' | '800+';
type DietaryNeeds = 'keto' | 'vegan' | 'vegetarian' | 'paleo' | 'gluten-free' | 'dairy-free';

// Define filter state interface
interface Filters {
  price: PriceRange[];
  cookTime: CookTime[];
  mealType: MealType[];
  cuisine: CuisineType[];
  equipment: Equipment[];
  calories: CalorieRange[];
  highProtein: boolean;
  dietary: DietaryNeeds[];
}

const ExploreRecipesPage = () => {
  const navigate = useNavigate();
  const { recipes, loading: recipesLoading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleRecipes, setVisibleRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const recipesPerPage = 8;
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    price: [],
    cookTime: [],
    mealType: [],
    cuisine: [],
    equipment: [],
    calories: [],
    highProtein: false,
    dietary: []
  });
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Effect to load initial recipes
  useEffect(() => {
    if (recipes.length > 0) {
      loadMoreRecipes(true);
    }
  }, [recipes]);
  
  // Effect to detect filter changes
  useEffect(() => {
    // Count active filters
    let count = 0;
    count += filters.price.length;
    count += filters.cookTime.length;
    count += filters.mealType.length;
    count += filters.cuisine.length;
    count += filters.equipment.length;
    count += filters.calories.length;
    count += filters.highProtein ? 1 : 0;
    count += filters.dietary.length;
    
    setActiveFilterCount(count);
  }, [filters]);
  
  // Load more recipes with pagination
  const loadMoreRecipes = (reset = false) => {
    setLoading(true);
    
    // Filter recipes based on current filters and search query
    const filteredRecipes = recipes.filter(recipe => {
      // Search query filter
      if (searchQuery && 
          !recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Cook time filter
      if (filters.cookTime.length > 0) {
        const cookTime = recipe.cookTime || 0;
        const isQuick = filters.cookTime.includes('quick') && cookTime <= 15;
        const isMedium = filters.cookTime.includes('medium') && cookTime > 15 && cookTime <= 30;
        const isLong = filters.cookTime.includes('long') && cookTime > 30;
        
        if (!(isQuick || isMedium || isLong)) {
          return false;
        }
      }
      
      // Meal type filter
      if (filters.mealType.length > 0 && 
          recipe.type && 
          !filters.mealType.includes(recipe.type.toLowerCase() as MealType)) {
        return false;
      }
      
      // High protein filter
      if (filters.highProtein && (!recipe.macros || recipe.macros.protein < 20)) {
        return false;
      }
      
      // Other filters would be implemented here for a complete solution
      
      return true;
    });
    
    const startIndex = reset ? 0 : (page - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    const newRecipes = filteredRecipes.slice(startIndex, endIndex);
    
    if (reset) {
      setVisibleRecipes(newRecipes);
      setPage(1);
    } else {
      setVisibleRecipes(prev => [...prev, ...newRecipes]);
      setPage(prev => prev + 1);
    }
    
    setHasMore(endIndex < filteredRecipes.length);
    setLoading(false);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Apply search filter
  const handleSearch = () => {
    loadMoreRecipes(true);
  };
  
  // Handle recipe selection
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };
  
  // Apply all filters
  const applyFilters = () => {
    setFiltersApplied(true);
    loadMoreRecipes(true);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      price: [],
      cookTime: [],
      mealType: [],
      cuisine: [],
      equipment: [],
      calories: [],
      highProtein: false,
      dietary: []
    });
    setFiltersApplied(false);
    loadMoreRecipes(true);
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
  
  // Toggle boolean filter
  const toggleBooleanFilter = (filter: 'highProtein') => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
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
        <h1 className="text-xl font-bold">Explore Recipes</h1>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search recipes..." 
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
              <SheetTitle>Filter Recipes</SheetTitle>
              <SheetDescription>
                Customize your recipe search with these filters
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
              
              {/* Cook Time Filter */}
              <div>
                <h3 className="font-medium mb-2">Cook Time</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="time-quick" 
                      checked={filters.cookTime.includes('quick')}
                      onCheckedChange={() => toggleFilter('cookTime', 'quick')}
                    />
                    <Label htmlFor="time-quick">Quick (Under 15 min)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="time-medium" 
                      checked={filters.cookTime.includes('medium')}
                      onCheckedChange={() => toggleFilter('cookTime', 'medium')}
                    />
                    <Label htmlFor="time-medium">Medium (15-30 min)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="time-long" 
                      checked={filters.cookTime.includes('long')}
                      onCheckedChange={() => toggleFilter('cookTime', 'long')}
                    />
                    <Label htmlFor="time-long">Long (Over 30 min)</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Meal Type Filter */}
              <div>
                <h3 className="font-medium mb-2">Meal Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={filters.mealType.includes(type as MealType)}
                        onCheckedChange={() => toggleFilter('mealType', type as MealType)}
                      />
                      <Label htmlFor={`type-${type}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Cuisine Type Filter */}
              <div>
                <h3 className="font-medium mb-2">Cuisine</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['american', 'italian', 'mexican', 'indian', 'chinese', 'other'].map((cuisine) => (
                    <div key={cuisine} className="flex items-center gap-2">
                      <Checkbox 
                        id={`cuisine-${cuisine}`} 
                        checked={filters.cuisine.includes(cuisine as CuisineType)}
                        onCheckedChange={() => toggleFilter('cuisine', cuisine as CuisineType)}
                      />
                      <Label htmlFor={`cuisine-${cuisine}`}>{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Equipment Filter */}
              <div>
                <h3 className="font-medium mb-2">Equipment Needed</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['oven', 'stovetop', 'air fryer', 'blender', 'grill', 'slow cooker'].map((equipment) => (
                    <div key={equipment} className="flex items-center gap-2">
                      <Checkbox 
                        id={`equipment-${equipment}`} 
                        checked={filters.equipment.includes(equipment.replace(' ', '-') as Equipment)}
                        onCheckedChange={() => toggleFilter('equipment', equipment.replace(' ', '-') as Equipment)}
                      />
                      <Label htmlFor={`equipment-${equipment}`}>{equipment.charAt(0).toUpperCase() + equipment.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Calorie Range Filter */}
              <div>
                <h3 className="font-medium mb-2">Calories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['0-200', '200-400', '400-600', '600-800', '800+'].map((range) => (
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
              
              <Separator />
              
              {/* High Protein Filter */}
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="high-protein" 
                    checked={filters.highProtein}
                    onCheckedChange={() => toggleBooleanFilter('highProtein')}
                  />
                  <Label htmlFor="high-protein">High Protein (20g+ per serving)</Label>
                </div>
              </div>
              
              <Separator />
              
              {/* Dietary Needs Filter */}
              <div>
                <h3 className="font-medium mb-2">Dietary Needs</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['keto', 'vegan', 'vegetarian', 'paleo', 'gluten-free', 'dairy-free'].map((diet) => (
                    <div key={diet} className="flex items-center gap-2">
                      <Checkbox 
                        id={`diet-${diet}`} 
                        checked={filters.dietary.includes(diet as DietaryNeeds)}
                        onCheckedChange={() => toggleFilter('dietary', diet as DietaryNeeds)}
                      />
                      <Label htmlFor={`diet-${diet}`}>{diet.charAt(0).toUpperCase() + diet.slice(1)}</Label>
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
          
          {filters.mealType.map(type => (
            <Button 
              key={`filter-type-${type}`}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-gray-100"
              onClick={() => toggleFilter('mealType', type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} <X size={14} className="ml-1" />
            </Button>
          ))}
          
          {/* Add more active filter displays here */}
          
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
      
      {/* Loading State */}
      {recipesLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading recipes...</p>
        </div>
      )}
      
      {/* Recipe Grid */}
      <div className="grid grid-cols-2 gap-4">
        {visibleRecipes.map(recipe => (
          <div 
            key={recipe.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer"
            onClick={() => handleRecipeClick(recipe)}
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img 
                src={recipe.imageSrc} 
                alt={recipe.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{recipe.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">{recipe.macros.calories} cal</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                    {recipe.macros.protein}g protein
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {recipe.type && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded">
                    {recipe.type}
                  </span>
                )}
                {/* Additional tags would go here */}
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
            onClick={() => loadMoreRecipes()} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Load More Recipes'}
          </Button>
        </div>
      )}
      
      {/* No Results Message */}
      {visibleRecipes.length === 0 && !recipesLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No recipes found matching your criteria.</p>
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
          isSaved={isRecipeSaved(selectedRecipe.id)}
          onToggleSave={() => toggleSaveRecipe(selectedRecipe.id)}
          isConsumed={false}
          onToggleConsumed={() => {}}
        />
      )}
    </div>
  );
};

export default ExploreRecipesPage;
