
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash, Search, Loader2, ArrowLeft, Eye, Edit, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import RecipeViewer from '@/components/RecipeViewer';
import { Recipe } from '@/data/mockData';

const AddExternalRecipePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  
  useEffect(() => {
    fetchCustomRecipes();
  }, []);

  useEffect(() => {
    // Filter recipes based on search query
    if (searchQuery.trim() === '') {
      setFilteredRecipes(customRecipes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRecipes(
        customRecipes.filter(recipe => 
          recipe.name.toLowerCase().includes(query) || 
          recipe.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, customRecipes]);

  const fetchCustomRecipes = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from local storage first (for demonstration)
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      
      // Convert to Recipe format
      const formattedRecipes: Recipe[] = savedRecipes.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        description: recipe.description,
        type: 'other',
        ingredients: recipe.ingredients.map((ing: any) => ing.name),
        instructions: recipe.instructions,
        prepTime: 0,
        cookTime: parseInt(recipe.cookingTime) || 0,
        servings: parseInt(recipe.servings) || 1,
        macros: {
          calories: parseInt(recipe.nutrition.calories) || 0,
          protein: parseInt(recipe.nutrition.protein) || 0,
          carbs: parseInt(recipe.nutrition.carbs) || 0,
          fat: parseInt(recipe.nutrition.fat) || 0
        },
        imageSrc: recipe.imageUrl || '/placeholder.svg',
        cuisineType: 'other',
        priceRange: '$',
        isHighProtein: false,
        equipment: [],
        requiresBlender: false,
        requiresCooking: true
      }));
      
      setCustomRecipes(formattedRecipes);
      setFilteredRecipes(formattedRecipes);
    } catch (error: any) {
      toast({
        title: 'Error fetching custom recipes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      const updatedRecipes = savedRecipes.filter((recipe: any) => recipe.id !== recipeId);
      localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
      
      setCustomRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      toast({
        title: 'Recipe deleted',
        description: 'Custom recipe has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting recipe',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  const AddRecipeForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState<any[]>([
      { id: '1', name: '', quantity: '', unit: '' }
    ]);
    const [instructions, setInstructions] = useState<string[]>(['']);
    const [nutrition, setNutrition] = useState({
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
  
    const handleAddIngredient = () => {
      setIngredients([
        ...ingredients,
        { id: Date.now().toString(), name: '', quantity: '', unit: '' }
      ]);
    };
  
    const handleRemoveIngredient = (id: string) => {
      if (ingredients.length > 1) {
        setIngredients(ingredients.filter(ing => ing.id !== id));
      }
    };
  
    const handleIngredientChange = (id: string, field: string, value: string) => {
      setIngredients(ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      ));
    };
  
    const handleAddInstruction = () => {
      setInstructions([...instructions, '']);
    };
  
    const handleRemoveInstruction = (index: number) => {
      if (instructions.length > 1) {
        setInstructions(instructions.filter((_, i) => i !== index));
      }
    };
  
    const handleInstructionChange = (index: number, value: string) => {
      setInstructions(instructions.map((inst, i) => 
        i === index ? value : inst
      ));
    };
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic validation
      if (!title) {
        toast({
          title: "Missing Information",
          description: "Please provide a recipe title",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // Generate a unique ID for the recipe
        const recipeId = `external-${Date.now()}`;
        
        // Prepare recipe data
        const recipeData = {
          id: recipeId,
          title,
          description,
          source: 'external',
          sourceUrl,
          imageUrl: imagePreview || '/placeholder.svg',
          cookingTime: parseInt(cookingTime) || 0,
          servings: parseInt(servings) || 1,
          ingredients: ingredients.filter(ing => ing.name.trim() !== '').map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit
          })),
          instructions: instructions.filter(inst => inst.trim() !== ''),
          nutrition: {
            calories: parseInt(nutrition.calories) || 0,
            protein: parseInt(nutrition.protein) || 0,
            carbs: parseInt(nutrition.carbs) || 0,
            fat: parseInt(nutrition.fat) || 0
          },
          createdAt: new Date().toISOString()
        };
        
        // Save to local storage for now as we don't have a backend
        const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
        localStorage.setItem('externalRecipes', JSON.stringify([...savedRecipes, recipeData]));
        
        // Add to saved recipes
        try {
          // Save to Supabase if available
          await supabase.from('saved_recipes').insert({
            recipe_id: recipeId,
            // In a real app, the user_id would come from authentication
          });
        } catch (error) {
          console.error('Error saving to database:', error);
          // Fall back to local storage if Supabase fails
          const savedRecipeIds = JSON.parse(localStorage.getItem('savedRecipeIds') || '[]');
          localStorage.setItem('savedRecipeIds', JSON.stringify([...savedRecipeIds, recipeId]));
        }
        
        toast({
          title: "Recipe Added",
          description: "Your recipe has been saved and added to your collection.",
        });
        
        // Navigate to saved recipes
        navigate('/saved-recipes');
      } catch (error) {
        console.error('Error saving recipe:', error);
        toast({
          title: "Error",
          description: "Failed to save your recipe. Please try again.",
          variant: "destructive"
        });
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-center w-full">
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Recipe preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  <Trash size={16} />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload recipe image</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>
  
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-lg">Recipe Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title*
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Homemade Pasta Sauce"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the recipe"
              className="resize-none block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source URL
            </label>
            <Input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/recipe"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cooking Time (mins)
              </label>
              <Input
                type="number"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servings
              </label>
              <Input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>
        </div>
  
        {/* Ingredients */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-lg">Ingredients</h2>
          
          {ingredients.map((ingredient, index) => (
            <div key={ingredient.id} className="flex items-center space-x-2">
              <Input
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-grow"
              />
              <Input
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(ingredient.id, 'quantity', e.target.value)}
                placeholder="Qty"
                className="w-20"
              />
              <Input
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(ingredient.id, 'unit', e.target.value)}
                placeholder="Unit"
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveIngredient(ingredient.id)}
                disabled={ingredients.length <= 1}
              >
                <Trash size={16} className="text-gray-500" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddIngredient}
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Add Ingredient
          </Button>
        </div>
  
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-lg">Instructions</h2>
          
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mt-2">
                <span className="text-xs font-medium">{index + 1}</span>
              </div>
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="resize-none block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveInstruction(index)}
                disabled={instructions.length <= 1}
                className="mt-1"
              >
                <Trash size={16} className="text-gray-500" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddInstruction}
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Add Step
          </Button>
        </div>
  
        {/* Nutrition Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-lg">Nutrition Information (per serving)</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories
              </label>
              <Input
                type="number"
                value={nutrition.calories}
                onChange={(e) => setNutrition({...nutrition, calories: e.target.value})}
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <Input
                type="number"
                value={nutrition.protein}
                onChange={(e) => setNutrition({...nutrition, protein: e.target.value})}
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <Input
                type="number"
                value={nutrition.carbs}
                onChange={(e) => setNutrition({...nutrition, carbs: e.target.value})}
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fat (g)
              </label>
              <Input
                type="number"
                value={nutrition.fat}
                onChange={(e) => setNutrition({...nutrition, fat: e.target.value})}
                placeholder="20"
              />
            </div>
          </div>
        </div>
  
        <Button type="submit" className="w-full">
          Save Recipe
        </Button>
      </form>
    );
  };

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/more')} 
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Custom Recipes</h1>
            <p className="text-dishco-text-light">View and manage your personal recipe collection</p>
          </div>
        </div>
        <Button onClick={() => setIsAddRecipeOpen(true)}>
          <Plus size={16} className="mr-2" /> Add New
        </Button>
      </header>

      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search custom recipes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No custom recipes found</p>
          <Button 
            onClick={() => setIsAddRecipeOpen(true)} 
            variant="secondary"
          >
            <Plus size={16} className="mr-2" /> Add your first custom recipe
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map(recipe => (
            <Card key={recipe.id} className="overflow-hidden">
              {recipe.imageSrc && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1">{recipe.name}</h3>
                {recipe.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.macros.calories > 0 && (
                    <span className="text-xs px-2 py-1 bg-amber-100 rounded-md">
                      {recipe.macros.calories} cal
                    </span>
                  )}
                  {recipe.macros.protein > 0 && (
                    <span className="text-xs px-2 py-1 bg-blue-100 rounded-md">
                      {recipe.macros.protein}g protein
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between mt-2">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddRecipeForm />

      {/* Recipe Viewer Dialog */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default AddExternalRecipePage;
