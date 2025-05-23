
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Upload, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface IngredientInput {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface NutritionInput {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

const AddExternalRecipePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editRecipeId = queryParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { id: '1', name: '', quantity: '', unit: '' }
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [nutrition, setNutrition] = useState<NutritionInput>({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editRecipeId) {
      setIsEditMode(true);
      loadRecipeData(editRecipeId);
    }
  }, [editRecipeId]);

  const loadRecipeData = (recipeId: string) => {
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      const recipe = savedRecipes.find((r: any) => r.id === recipeId);
      
      if (recipe) {
        setTitle(recipe.title || '');
        setDescription(recipe.description || '');
        setSourceUrl(recipe.sourceUrl || '');
        setCookingTime(recipe.cookingTime?.toString() || '');
        setServings(recipe.servings?.toString() || '');
        
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setIngredients(recipe.ingredients.map((ing: any, index: number) => ({
            id: index.toString(),
            name: ing.name || '',
            quantity: ing.quantity || '',
            unit: ing.unit || ''
          })));
        }
        
        if (recipe.instructions && recipe.instructions.length > 0) {
          setInstructions(recipe.instructions);
        }
        
        if (recipe.nutrition) {
          setNutrition({
            calories: recipe.nutrition.calories?.toString() || '',
            protein: recipe.nutrition.protein?.toString() || '',
            carbs: recipe.nutrition.carbs?.toString() || '',
            fat: recipe.nutrition.fat?.toString() || ''
          });
        }
        
        if (recipe.imageUrl && recipe.imageUrl !== '/placeholder.svg') {
          setImagePreview(recipe.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading recipe data:', error);
      toast({
        title: "Error",
        description: "Failed to load recipe data for editing",
        variant: "destructive"
      });
    }
  };

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

  const handleIngredientChange = (id: string, field: keyof IngredientInput, value: string) => {
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
      // Generate a unique ID for the recipe if not editing
      const recipeId = isEditMode ? editRecipeId! : `external-${Date.now()}`;
      
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
        createdAt: isEditMode ? undefined : new Date().toISOString()
      };
      
      // Save to local storage
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      
      if (isEditMode) {
        // Update existing recipe
        const updatedRecipes = savedRecipes.map((r: any) => 
          r.id === recipeId ? {...r, ...recipeData} : r
        );
        localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
      } else {
        // Add new recipe
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
      }
      
      toast({
        title: isEditMode ? "Recipe Updated" : "Recipe Added",
        description: isEditMode 
          ? "Your recipe has been updated successfully." 
          : "Your recipe has been saved and added to your collection.",
      });
      
      // Navigate to custom recipes
      navigate('/custom-recipes');
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
    <div className="animate-fade-in pb-20">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/custom-recipes')} 
          className="mr-2"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Recipe' : 'Add Custom Recipe'}</h1>
      </header>

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
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the recipe"
              className="resize-none"
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
              <Textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="flex-grow resize-none"
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
    </div>
  );
};

export default AddExternalRecipePage;
