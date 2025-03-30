import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ChevronDown, X, Loader2 } from 'lucide-react';
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
import { Recipe } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Define filter types
type PriceRange = '$' | '$$' | '$$$';
type CookTime = 'quick' | 'medium' | 'long';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type CuisineType = 'american' | 'italian' | 'mexican' | 'indian' | 'chinese' | 'other';
type Equipment = 'oven' | 'stovetop' | 'air-fryer' | 'blender' | 'grill' | 'slow-cooker';
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
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleRecipes, setVisibleRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [isSelectedRecipeSaved, setIsSelectedRecipeSaved] = useState(false);
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
  
  // Fetch recipes from Supabase
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(*),
          recipe_instructions(*),
          recipe_equipment(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Format recipes to match Recipe type
      const formattedRecipes: Recipe[] = data.map(dbRecipe => ({
        id: dbRecipe.id,
        name: dbRecipe.name,
        type: dbRecipe.meal_type?.toLowerCase() || 'other',
        description: dbRecipe.description || '',
        ingredients: dbRecipe.recipe_ingredients?.map(ing => ing.name) || [],
        instructions: dbRecipe.recipe_instructions?.map(inst => inst.instruction) || [],
        prepTime: dbRecipe.prep_time || 0,
        cookTime: dbRecipe.cook_time || 0,
        servings: dbRecipe.servings || 1,
        macros: {
          calories: dbRecipe.calories || 0,
          protein: dbRecipe.protein || 0,
          carbs: dbRecipe.carbs || 0,
          fat: dbRecipe.fat || 0
        },
        imageSrc: dbRecipe.image_url || '/placeholder.svg',
        cuisineType: dbRecipe.meal_type || 'other',
        priceRange: '$',
        isHighProtein: dbRecipe.protein > 20,
        equipment: dbRecipe.recipe_equipment?.map(eq => eq.name) || [],
        requiresBlender: false,
        requiresCooking: true
      }));
      
      setAllRecipes(formattedRecipes);
      applyFiltersAndSearch(formattedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch recipes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved recipes for the current user
  const fetchSavedRecipes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSavedRecipes(data.map(item => item.recipe_id));
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    }
  };
  
  // Effect to load initial recipes
  useEffect(() => {
    fetchRecipes();
    fetchSavedRecipes();
  }, [user]);
  
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
  
  // Toggle recipe saved status
  const handleToggleSave = async (recipeId: string, isSaved: boolean) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save recipes',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (isSaved) {
        // Remove from saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
          
        if (error) throw error;
        
        setSavedRecipes(prev => prev.filter(id => id !== recipeId));
        setIsSelectedRecipeSaved(false);
        
        toast({
          title: 'Recipe Unsaved',
          description: 'Recipe removed from your saved recipes'
        });
      } else {
        // Add to saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .insert({
            user_id: user.id,
            recipe_id: recipeId
          });
          
        if (error) throw error;
        
        setSavedRecipes(prev => [...prev, recipeId]);
        setIsSelectedRecipeSaved(true);
        
        toast({
          title: 'Recipe Saved',
          description: 'Recipe added to your saved recipes'
        });
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved status',
        variant: 'destructive'
      });
    }
  };
  
  // Apply filters and search to recipes
  const applyFiltersAndSearch = (recipes = allRecipes) => {
    // Filter recipes based on current filters and search query
    const filteredRecipes = recipes.filter(recipe => {
      // Search query filter
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Meal type filter
      if (filters.mealType.length > 0 && !filters.mealType.includes(recipe.type as MealType)) {
        return false;
      }
      
      // Cuisine type filter
      if (filters.cuisine.length > 0 && recipe.cuisineType && 
          !filters.cuisine.includes(recipe.cuisineType as CuisineType)) {
        return false;
      }
      
      // Price range filter
      if (filters.price.length > 0 && recipe.priceRange &&
          !filters.price.includes(recipe.priceRange as PriceRange)) {
        return false;
      }
      
      // Calorie range filter
      if (filters.calories.length > 0) {
        const calories = recipe.macros.calories;
        const matchesCalorieRange = filters.calories.some(range => {
          if (range === '0-200') return calories >= 0 && calories <= 200;
          if (range === '200-400') return calories > 200 && calories <= 400;
          if (range === '400-600') return calories > 400 && calories <= 600;
          if (range === '600-800') return calories > 600 && calories <= 800;
          if (range === '800+') return calories > 800;
          return false;
        });
        if (!matchesCalorieRange) return false;
      }
      
      // High protein filter
      if (filters.highProtein && !recipe.isHighProtein) {
        return false;
      }
      
      // Cook time filter
      if (filters.cookTime.length > 0) {
        const cookTime = recipe.cookTime;
        const matchesCookTime = filters.cookTime.some(timeRange => {
          if (timeRange === 'quick') return cookTime <= 15;
          if (timeRange === 'medium') return cookTime > 15 && cookTime <= 30;
          if (timeRange === 'long') return cookTime > 30;
          return false;
        });
        if (!matchesCookTime) return false;
      }
      
      // Equipment filter
      if (filters.equipment.length > 0) {
        // Some recipes might not have equipment array
        if (!recipe.equipment || recipe.equipment.length === 0) return false;
        
        // Check if recipe has any of the selected equipment
        const hasSelectedEquipment = filters.equipment.some(equipment => 
          recipe.equipment?.some(e => e.replace(' ', '-') === equipment)
        );
        
        if (!hasSelectedEquipment) return false;
      }
      
      // Dietary needs filter (to be implemented with recipe tags)
      // This would require querying recipe tags from the database
      
      return true;
    });
    
    // Paginate the filtered recipes
    const startIndex = 0;
    const endIndex = recipesPerPage;
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
    
    setVisibleRecipes(paginatedRecipes);
    setPage(1);
    setHasMore(endIndex < filteredRecipes.length);
  };
  
  // Load more recipes with pagination
  const loadMoreRecipes = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Filter recipes based on current filters and search query
      const filteredRecipes = allRecipes.filter(recipe => {
        // Apply the same filters as in applyFiltersAndSearch
        // Search query filter
        if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Meal type filter
        if (filters.mealType.length > 0 && !filters.mealType.includes(recipe.type as MealType)) {
          return false;
        }
        
        // Cuisine type filter
        if (filters.cuisine.length > 0 && recipe.cuisineType && 
            !filters.cuisine.includes(recipe.cuisineType as CuisineType)) {
          return false;
        }
        
        // Price range filter
        if (filters.price.length > 0 && recipe.priceRange &&
            !filters.price.includes(recipe.priceRange as PriceRange)) {
          return false;
        }
        
        // Calorie range filter
        if (filters.calories.length > 0) {
          const calories = recipe.macros.calories;
          const matchesCalorieRange = filters.calories.some(range => {
            if (range === '0-200') return calories >= 0 && calories <= 200;
            if (range === '200-400') return calories > 200 && calories <= 400;
            if (range === '400-600') return calories > 400 && calories <= 600;
            if (range === '600-800') return calories > 600 && calories <= 800;
            if (range === '800+') return calories > 800;
            return false;
          });
          if (!matchesCalorieRange) return false;
        }
        
        // High protein filter
        if (filters.highProtein && !recipe.isHighProtein) {
          return false;
        }
        
        // Cook time filter
        if (filters.cookTime.length > 0) {
          const cookTime = recipe.cookTime;
          const matchesCookTime = filters.cookTime.some(timeRange => {
            if (timeRange === 'quick') return cookTime <= 15;
            if (timeRange === 'medium') return cookTime > 15 && cookTime <= 30;
            if (timeRange === 'long') return cookTime > 30;
            return false;
          });
          if (!matchesCookTime) return false;
        }
        
        // Equipment filter
        if (filters.equipment.length > 0) {
          // Some recipes might not have equipment array
          if (!recipe.equipment || recipe.equipment.length === 0) return false;
          
          // Check if recipe has any of the selected equipment
          const hasSelectedEquipment = filters.equipment.some(equipment => 
            recipe.equipment?.some(e => e.replace(' ', '-') === equipment)
          );
          
          if (!hasSelectedEquipment) return false;
        }
        
        return true;
      });
      
      const startIndex = page * recipesPerPage;
      const endIndex = startIndex + recipesPerPage;
      const newRecipes = filteredRecipes.slice(startIndex, endIndex);
      
      setVisibleRecipes(prev => [...prev, ...newRecipes]);
      setPage(prev => prev + 1);
      setHasMore(endIndex < filteredRecipes.length);
      setLoading(false);
    }, 300);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Apply search filter
  const handleSearch = () => {
    applyFiltersAndSearch();
  };
  
  // Handle recipe selection
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsSelectedRecipeSaved(savedRecipes.includes(recipe.id));
    setIsRecipeViewerOpen(true);
  };
  
  // Apply all filters
  const applyFilters = () => {
    setFiltersApplied(true);
    applyFiltersAndSearch();
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
    setSearchQuery('');
    // Reset and re-fetch recipes
    fetchRecipes();
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
                  {['oven', 'stovetop', 'air-fryer', 'blender', 'grill', 'slow-cooker'].map((equipment) => (
                    <div key={equipment} className="flex items-center gap-2">
                      <Checkbox 
                        id={`equipment-${equipment}`} 
                        checked={filters.equipment.includes(equipment as Equipment)}
                        onCheckedChange={() => toggleFilter('equipment', equipment as Equipment)}
                      />
                      <Label htmlFor={`equipment-${equipment}`}>
                        {equipment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
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
          
          {filters.cuisine.map(cuisine => (
            <Button 
              key={`filter-cuisine-${cuisine}`}
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-gray-100"
              onClick={() => toggleFilter('cuisine', cuisine)}
            >
              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} <X size={14} className="ml-1" />
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
      
      {/* Loading state */}
      {loading && visibleRecipes.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading recipes...</p>
        </div>
      )}
      
      {/* Recipe Grid */}
      {!loading && visibleRecipes.length > 0 && (
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
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded">
                    {recipe.type}
                  </span>
                  {recipe.cuisineType && (
                    <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                      {recipe.cuisineType}
                    </span>
                  )}
                  {recipe.isHighProtein && (
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                      high protein
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Results Message */}
      {!loading && visibleRecipes.length === 0 && (
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
      
      {/* Load More Button */}
      {!loading && hasMore && visibleRecipes.length > 0 && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={loadMoreRecipes} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Load More Recipes'}
          </Button>
        </div>
      )}
      
      {/* Recipe Viewer Dialog */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
          isSaved={isSelectedRecipeSaved}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
};

export default ExploreRecipesPage;
