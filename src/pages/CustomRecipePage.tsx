
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Plus, Trash2, ChevronRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Recipe } from '@/data/mockData';

// Mock custom recipe ingredients for demonstration
interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const unitOptions = ['g', 'ml', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'piece', 'serving'];

const CustomRecipePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState<string>('1');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState('');
  const [recipeType, setRecipeType] = useState('breakfast');
  
  // For new ingredient form
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('g');
  const [newIngredientCalories, setNewIngredientCalories] = useState('');
  const [newIngredientProtein, setNewIngredientProtein] = useState('');
  const [newIngredientCarbs, setNewIngredientCarbs] = useState('');
  const [newIngredientFat, setNewIngredientFat] = useState('');
  
  const handleAddIngredient = () => {
    if (!newIngredientName || !newIngredientAmount) {
      toast({
        title: "Required Fields Missing",
        description: "Ingredient name and amount are required.",
        variant: "destructive"
      });
      return;
    }
    
    const newIngredient: Ingredient = {
      id: uuidv4(),
      name: newIngredientName,
      amount: newIngredientAmount,
      unit: newIngredientUnit,
      calories: parseFloat(newIngredientCalories) || 0,
      protein: parseFloat(newIngredientProtein) || 0,
      carbs: parseFloat(newIngredientCarbs) || 0,
      fat: parseFloat(newIngredientFat) || 0
    };
    
    setIngredients([...ingredients, newIngredient]);
    
    // Reset form
    setNewIngredientName('');
    setNewIngredientAmount('');
    setNewIngredientCalories('');
    setNewIngredientProtein('');
    setNewIngredientCarbs('');
    setNewIngredientFat('');
  };
  
  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };
  
  const handleNavigateToAddIngredient = () => {
    toast({
      title: "Coming Soon",
      description: "Search ingredients feature will be available soon!"
    });
  };
  
  const calculateTotalNutrition = () => {
    const totalCalories = ingredients.reduce((sum, ing) => sum + ing.calories, 0);
    const totalProtein = ingredients.reduce((sum, ing) => sum + ing.protein, 0);
    const totalCarbs = ingredients.reduce((sum, ing) => sum + ing.carbs, 0);
    const totalFat = ingredients.reduce((sum, ing) => sum + ing.fat, 0);
    
    // Adjust for servings
    const servingsNum = parseFloat(servings) || 1;
    return {
      caloriesPerServing: Math.round(totalCalories / servingsNum),
      proteinPerServing: Math.round(totalProtein / servingsNum),
      carbsPerServing: Math.round(totalCarbs / servingsNum),
      fatPerServing: Math.round(totalFat / servingsNum),
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  };
  
  const handleSaveRecipe = () => {
    if (!recipeName) {
      toast({
        title: "Recipe Name Required",
        description: "Please enter a name for your recipe.",
        variant: "destructive"
      });
      return;
    }
    
    if (ingredients.length === 0) {
      toast({
        title: "Ingredients Required",
        description: "Please add at least one ingredient to your recipe.",
        variant: "destructive"
      });
      return;
    }
    
    const nutrition = calculateTotalNutrition();
    
    try {
      const newRecipe: Recipe = {
        id: uuidv4(),
        name: recipeName,
        description: description,
        image: "",
        type: recipeType,
        servings: parseInt(servings) || 1,
        prepTime: 0,
        cookTime: 0,
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit
        })),
        instructions: instructions.split('\n').filter(line => line.trim()),
        macros: {
          calories: nutrition.caloriesPerServing,
          protein: nutrition.proteinPerServing,
          carbs: nutrition.carbsPerServing,
          fat: nutrition.fatPerServing
        },
        author: "Custom",
        cuisineType: "",
        mealType: recipeType,
        ratings: 0,
        difficulty: "easy",
        isCustom: true
      };
      
      // Save to recipes
      const existingRecipes = JSON.parse(localStorage.getItem('customRecipes') || '[]');
      localStorage.setItem('customRecipes', JSON.stringify([newRecipe, ...existingRecipes]));
      
      toast({
        title: "Recipe Created",
        description: `${recipeName} has been saved to your recipes.`
      });
      
      navigate(-1);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your recipe.",
        variant: "destructive"
      });
    }
  };
  
  const nutrition = calculateTotalNutrition();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold">Create Recipe</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-blue-600"
            onClick={handleSaveRecipe}
          >
            <Check size={24} />
          </Button>
        </div>
      </div>
      
      <motion.div 
        className="max-w-lg mx-auto px-4 py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipeName" className="text-blue-600">Recipe Name *</Label>
            <Input
              id="recipeName"
              placeholder="e.g. Grilled Chicken Salad"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="text-lg"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Short description of your recipe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipeType">Recipe Type</Label>
              <Select value={recipeType} onValueChange={setRecipeType}>
                <SelectTrigger id="recipeType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Ingredients</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600"
              onClick={handleNavigateToAddIngredient}
            >
              <Plus size={16} className="mr-1" />
              Search Foods
            </Button>
          </div>
          
          <div className="space-y-4 border rounded-lg p-4 bg-white">
            {ingredients.length > 0 ? (
              <div className="space-y-3">
                {ingredients.map(ingredient => (
                  <motion.div 
                    key={ingredient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {ingredient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ingredient.amount} {ingredient.unit} • {ingredient.calories} cal
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No ingredients added yet.
              </p>
            )}
            
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-medium text-sm text-gray-600">Add New Ingredient</h3>
              
              <div className="space-y-2">
                <Label htmlFor="ingredientName">Name</Label>
                <Input
                  id="ingredientName"
                  placeholder="e.g. Chicken breast"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="ingredientAmount">Amount</Label>
                  <Input
                    id="ingredientAmount"
                    placeholder="e.g. 100"
                    value={newIngredientAmount}
                    onChange={(e) => setNewIngredientAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredientUnit">Unit</Label>
                  <Select value={newIngredientUnit} onValueChange={setNewIngredientUnit}>
                    <SelectTrigger id="ingredientUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="ingredientCalories">Calories</Label>
                  <Input
                    id="ingredientCalories"
                    placeholder="e.g. 150"
                    value={newIngredientCalories}
                    onChange={(e) => setNewIngredientCalories(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredientProtein">Protein (g)</Label>
                  <Input
                    id="ingredientProtein"
                    placeholder="e.g. 25"
                    value={newIngredientProtein}
                    onChange={(e) => setNewIngredientProtein(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredientCarbs">Carbs (g)</Label>
                  <Input
                    id="ingredientCarbs"
                    placeholder="e.g. 5"
                    value={newIngredientCarbs}
                    onChange={(e) => setNewIngredientCarbs(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredientFat">Fat (g)</Label>
                  <Input
                    id="ingredientFat"
                    placeholder="e.g. 3"
                    value={newIngredientFat}
                    onChange={(e) => setNewIngredientFat(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
              
              <Button
                className="w-full mt-2"
                onClick={handleAddIngredient}
              >
                <Plus size={16} className="mr-2" />
                Add Ingredient
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Enter step-by-step instructions (one step per line)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Nutrition (Per Serving)</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Calculator size={16} className="mr-1" />
              <span>Auto-calculated</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-xl font-bold">{nutrition.caloriesPerServing}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Protein</p>
              <p className="font-bold">{nutrition.proteinPerServing}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Carbs</p>
              <p className="font-bold">{nutrition.carbsPerServing}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fat</p>
              <p className="font-bold">{nutrition.fatPerServing}g</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <motion.div
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              onClick={handleSaveRecipe}
            >
              Save Recipe
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomRecipePage;
