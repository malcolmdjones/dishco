
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChefHat, ChevronDown, ChevronUp, Plus, Trash2, X, Camera, Image, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoggedMeal } from '@/types/food';
import { Recipe } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  text: string;
}

const LogMealCustomRecipePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSource, setImageSource] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    mealType: string;
    servings: number;
    prepTimeMinutes: number;
    ingredients: Ingredient[];
    steps: Step[];
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>({
    id: uuidv4(),
    name: '',
    mealType: 'dinner',
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [{ name: '', amount: '', unit: 'g' }],
    steps: [{ text: '' }],
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showIngredients, setShowIngredients] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showNutrition, setShowNutrition] = useState<boolean>(true);
  
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];
  
  const servingUnits = [
    'g', 'ml', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'slice', 'piece'
  ];

  const handleGoBack = () => {
    navigate('/log-meal');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'servings' || name === 'prepTimeMinutes') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else if (name === 'calories' || name === 'protein' || name === 'carbs' || name === 'fat') {
      setFormData(prev => ({
        ...prev,
        macros: {
          ...prev.macros,
          [name]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };
  
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: 'g' }]
    }));
  };
  
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = [...formData.ingredients];
      newIngredients.splice(index, 1);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };
  
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { text: value };
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };
  
  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { text: '' }]
    }));
  };
  
  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = [...formData.steps];
      newSteps.splice(index, 1);
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSource(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  };
  
  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = () => {
    setImageSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const increment = (field: 'calories' | 'protein' | 'carbs' | 'fat') => {
    setFormData(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [field]: (prev.macros[field] || 0) + (field === 'calories' ? 10 : 1)
      }
    }));
  };
  
  const decrement = (field: 'calories' | 'protein' | 'carbs' | 'fat') => {
    setFormData(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [field]: Math.max((prev.macros[field] || 0) - (field === 'calories' ? 10 : 1), 0)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for this recipe",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.ingredients.some(ing => !ing.name.trim())) {
      toast({
        title: "Invalid Ingredients",
        description: "All ingredients must have a name",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    const ingredientsStrings = formData.ingredients.map(ing => 
      `${ing.amount} ${ing.unit} ${ing.name}`.trim()
    );
    
    const recipe: Recipe = {
      id: formData.id,
      name: formData.name,
      type: formData.mealType,
      description: '',
      macros: {
        calories: formData.macros.calories,
        protein: formData.macros.protein,
        carbs: formData.macros.carbs,
        fat: formData.macros.fat
      },
      servings: formData.servings,
      prepTime: formData.prepTimeMinutes,
      cookTime: 0,
      ingredients: ingredientsStrings,
      instructions: formData.steps.map(step => step.text),
      imageSrc: imageSource || '',
      requiresBlender: false,
      requiresCooking: true,
      externalSource: false,
      externalId: undefined
    };
    
    const existingCustomRecipes = JSON.parse(localStorage.getItem('customRecipes') || '[]');
    const updatedCustomRecipes = [recipe, ...existingCustomRecipes];
    localStorage.setItem('customRecipes', JSON.stringify(updatedCustomRecipes));
    
    const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const newMeal: LoggedMeal = {
      id: `${formData.id}-${Date.now()}`,
      name: formData.name,
      type: formData.mealType,
      recipe: recipe,
      consumed: true,
      loggedAt: new Date().toISOString(),
      loggedFromScreen: 'custom-recipe',
      calories: formData.macros.calories,
      servingInfo: `1 of ${formData.servings} servings`,
      source: 'Custom Recipe',
      imageSrc: imageSource
    };
    
    const updatedLoggedMeals = [newMeal, ...existingLoggedMeals];
    localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Recipe Created",
        description: `${formData.name} has been added to your recipes and logged.`
      });
      navigate('/log-meal');
    }, 600);
  };

  return (
    <div className="h-full bg-white pb-24">
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <button 
          className="p-2"
          onClick={handleGoBack}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Create Recipe</h1>
        <div className="w-10"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-2"
        >
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <ChefHat size={32} className="text-purple-600" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium">Recipe Name*</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Homemade Granola"
            className="border-gray-300 mt-1"
            required
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="text-sm font-medium">Image (optional)</label>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {imageSource ? (
            <div className="relative mt-2">
              <img 
                src={imageSource} 
                alt="Recipe" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center h-12"
                onClick={handleCameraCapture}
              >
                <Camera size={18} className="mr-2" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center h-12"
                onClick={handleGallerySelect}
              >
                <Image size={18} className="mr-2" />
                Upload Image
              </Button>
            </div>
          )}
        </motion.div>
        
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <label className="text-sm font-medium">Meal Type</label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md h-10 px-3 mt-1"
            >
              {mealTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1"
          >
            <label className="text-sm font-medium">Servings</label>
            <Input
              name="servings"
              type="number"
              value={formData.servings}
              onChange={handleInputChange}
              min="1"
              className="border-gray-300 mt-1"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-1"
          >
            <label className="text-sm font-medium">Prep Time (min)</label>
            <Input
              name="prepTimeMinutes"
              type="number"
              value={formData.prepTimeMinutes}
              onChange={handleInputChange}
              min="1"
              className="border-gray-300 mt-1"
            />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center justify-between py-2">
            <h3 className="text-base font-semibold">Nutrition</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowNutrition(!showNutrition)}
            >
              {showNutrition ? 
                <ChevronUp size={20} /> : 
                <ChevronDown size={20} />
              }
            </Button>
          </div>
          
          {showNutrition && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="calories">Calories</Label>
                <div className="flex mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => decrement('calories')}
                    className="rounded-r-none"
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    min="0"
                    step="10"
                    value={formData.macros.calories}
                    onChange={handleInputChange}
                    className="rounded-none text-center w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => increment('calories')}
                    className="rounded-l-none"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <div className="flex mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => decrement('protein')}
                      className="rounded-r-none"
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      id="protein"
                      name="protein"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.macros.protein}
                      onChange={handleInputChange}
                      className="rounded-none text-center w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => increment('protein')}
                      className="rounded-l-none"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <div className="flex mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => decrement('carbs')}
                      className="rounded-r-none"
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      id="carbs"
                      name="carbs"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.macros.carbs}
                      onChange={handleInputChange}
                      className="rounded-none text-center w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => increment('carbs')}
                      className="rounded-l-none"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <div className="flex mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => decrement('fat')}
                      className="rounded-r-none"
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      id="fat"
                      name="fat"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.macros.fat}
                      onChange={handleInputChange}
                      className="rounded-none text-center w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => increment('fat')}
                      className="rounded-l-none"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between py-2">
            <h3 className="text-base font-semibold">Ingredients</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowIngredients(!showIngredients)}
            >
              {showIngredients ? 
                <ChevronUp size={20} /> : 
                <ChevronDown size={20} />
              }
            </Button>
          </div>
          
          {showIngredients && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {formData.ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Input
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    className="flex-grow border-gray-300"
                  />
                  <Input
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                    placeholder="Amt"
                    className="w-16 border-gray-300"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="w-16 border border-gray-300 rounded-md h-10"
                  >
                    {servingUnits.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(idx)}
                    className={cn(
                      "h-10 w-10 p-0 text-gray-500",
                      formData.ingredients.length <= 1 && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={formData.ingredients.length <= 1}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full mt-2"
              >
                <Plus size={16} className="mr-1" />
                Add Ingredient
              </Button>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between py-2">
            <h3 className="text-base font-semibold">Instructions</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? 
                <ChevronUp size={20} /> : 
                <ChevronDown size={20} />
              }
            </Button>
          </div>
          
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {formData.steps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium">
                    {idx + 1}
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder="Describe this step..."
                    className="flex-grow border-gray-300 rounded-md p-2 min-h-[60px] resize-y"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(idx)}
                    className={cn(
                      "h-10 w-10 p-0 text-gray-500",
                      formData.steps.length <= 1 && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={formData.steps.length <= 1}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addStep}
                className="w-full mt-2"
              >
                <Plus size={16} className="mr-1" />
                Add Step
              </Button>
            </motion.div>
          )}
        </motion.div>
        
        <div className="h-16"></div>
        
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
          <Button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <span className="animate-pulse">Creating recipe...</span>
              </div>
            ) : (
              <>
                <ChefHat size={18} className="mr-2" />
                Create & Add to Log
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogMealCustomRecipePage;
