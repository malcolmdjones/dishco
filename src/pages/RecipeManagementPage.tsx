
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Loader2, Edit, Trash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import RecipeScraperForm from '@/components/RecipeScraperForm';
import RecipeViewer from '@/components/RecipeViewer';
import EditRecipeDialog from '@/components/EditRecipeDialog';
import { Recipe } from '@/data/mockData';

const RecipeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('my-recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecipes();
    }
  }, [user]);

  useEffect(() => {
    // Filter recipes based on search query
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRecipes(
        recipes.filter(recipe => 
          recipe.name.toLowerCase().includes(query) || 
          recipe.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, recipes]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(*),
          recipe_instructions(*),
          recipe_equipment(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching recipes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      
      if (error) {
        throw error;
      }
      
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      toast({
        title: 'Recipe deleted',
        description: 'Recipe has been removed from the database',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting recipe',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRecipeScraped = (newRecipe: any) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setActiveTab('my-recipes');
    toast({
      title: 'Recipe added',
      description: `${newRecipe.name} has been added to your recipes`,
    });
  };

  const handleViewRecipe = (recipe: any) => {
    // Convert the database recipe to the Recipe format expected by RecipeViewer
    const viewerRecipe: Recipe = {
      id: recipe.id,
      name: recipe.name,
      type: recipe.meal_type?.toLowerCase() || 'other',
      description: recipe.description || '',
      ingredients: recipe.recipe_ingredients?.map((ing: any) => ing.name) || [],
      instructions: recipe.recipe_instructions?.map((inst: any) => inst.instruction) || [],
      prepTime: recipe.prep_time || 0,
      cookTime: recipe.cook_time || 0,
      servings: recipe.servings || 1,
      macros: {
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        carbs: recipe.carbs || 0,
        fat: recipe.fat || 0
      },
      imageSrc: recipe.image_url || '/placeholder.svg',
      cuisineType: recipe.cuisine_type || 'other',
      priceRange: recipe.price_range || '$',
      isHighProtein: recipe.is_high_protein || false,
      equipment: recipe.recipe_equipment?.map((eq: any) => eq.name) || [],
      requiresBlender: recipe.requires_blender || false,
      requiresCooking: recipe.requires_cooking || true
    };
    
    setSelectedRecipe(viewerRecipe);
    setIsRecipeViewerOpen(true);
  };

  const handleEditRecipe = (recipeId: string) => {
    setEditRecipeId(recipeId);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchRecipes();
  };

  return (
    <div className="container mx-auto max-w-4xl pb-20 pt-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')} 
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Recipe Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="my-recipes" className="flex-1">My Recipes</TabsTrigger>
          <TabsTrigger value="add-recipe" className="flex-1">Add Recipe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-recipes">
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search recipes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setActiveTab('add-recipe')} 
              className="ml-2"
            >
              <Plus size={16} className="mr-2" /> New Recipe
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No recipes found</p>
              <Button 
                onClick={() => setActiveTab('add-recipe')} 
                variant="secondary"
              >
                <Plus size={16} className="mr-2" /> Add your first recipe
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map(recipe => (
                <Card key={recipe.id} className="overflow-hidden">
                  {recipe.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle>{recipe.name}</CardTitle>
                    {recipe.description && (
                      <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {recipe.calories && (
                        <span className="text-xs px-2 py-1 bg-amber-100 rounded-md">
                          {recipe.calories} cal
                        </span>
                      )}
                      {recipe.protein && (
                        <span className="text-xs px-2 py-1 bg-blue-100 rounded-md">
                          {recipe.protein}g protein
                        </span>
                      )}
                      {recipe.meal_type && (
                        <span className="text-xs px-2 py-1 bg-green-100 rounded-md">
                          {recipe.meal_type}
                        </span>
                      )}
                      {recipe.cuisine_type && recipe.cuisine_type !== 'other' && (
                        <span className="text-xs px-2 py-1 bg-purple-100 rounded-md">
                          {recipe.cuisine_type}
                        </span>
                      )}
                      {recipe.is_high_protein && (
                        <span className="text-xs px-2 py-1 bg-blue-200 rounded-md">
                          High Protein
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {recipe.recipe_ingredients?.length || 0} ingredients • 
                      {recipe.recipe_instructions?.length || 0} steps
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewRecipe(recipe)}
                        className="flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRecipe(recipe.id)}
                        className="flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex items-center"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      <Trash size={16} className="mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add-recipe">
          <RecipeScraperForm onRecipeAdded={handleRecipeScraped} />
        </TabsContent>
      </Tabs>

      {/* Recipe Viewer Dialog */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
        />
      )}

      {/* Edit Recipe Dialog */}
      {editRecipeId && (
        <EditRecipeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          recipeId={editRecipeId}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default RecipeManagementPage;
