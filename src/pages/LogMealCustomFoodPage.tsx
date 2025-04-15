
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CustomFood, LoggedMeal } from '@/types/food';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const LogMealCustomFoodPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CustomFood>({
    id: uuidv4(),
    name: '',
    brand: '',
    barcode: '',
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    servingSize: 1,
    servingUnit: 'g',
    createdAt: new Date().toISOString()
  });
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showAdvancedNutrition, setShowAdvancedNutrition] = useState<boolean>(false);
  
  const servingUnits = [
    { value: 'g', label: 'grams (g)' },
    { value: 'ml', label: 'milliliters (ml)' },
    { value: 'oz', label: 'ounces (oz)' },
    { value: 'cup', label: 'cup' },
    { value: 'tbsp', label: 'tablespoon' },
    { value: 'tsp', label: 'teaspoon' },
    { value: 'slice', label: 'slice' },
    { value: 'piece', label: 'piece' },
    { value: 'serving', label: 'serving' }
  ];

  const handleGoBack = () => {
    navigate('/log-meal');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('macros.')) {
      const macroName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        macros: {
          ...prev.macros,
          [macroName]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'servingSize' ? (parseFloat(value) || 0) : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for this food",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.macros.calories <= 0) {
      toast({
        title: "Invalid Calories",
        description: "Calories must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    // Save the custom food
    const existingCustomFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
    const updatedCustomFoods = [formData, ...existingCustomFoods];
    localStorage.setItem('customFoods', JSON.stringify(updatedCustomFoods));
    
    // Create a recipe object from the form data
    const recipe = {
      id: formData.id,
      name: formData.name,
      macros: formData.macros,
      type: 'snack',
      servings: 1,
      ingredients: [],
      prep_time_minutes: 0,
      externalSource: false,
      instructions: []
    };
    
    // Log the meal
    const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const newMeal: LoggedMeal = {
      id: `${formData.id}-${Date.now()}`,
      name: formData.name,
      type: 'snack',
      recipe: recipe,
      consumed: true,
      loggedAt: new Date().toISOString(),
      loggedFromScreen: 'custom-food',
      calories: formData.macros.calories,
      protein: formData.macros.protein > 0 ? `${formData.macros.protein}g protein` : '',
      brand: formData.brand || '',
      servingInfo: `${formData.servingSize} ${formData.servingUnit}`,
      source: 'Custom'
    };
    
    const updatedLoggedMeals = [newMeal, ...existingLoggedMeals];
    localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
    
    // Update daily nutrition
    const currentNutrition = JSON.parse(localStorage.getItem('dailyNutrition') || '{}');
    const updatedNutrition = {
      calories: (currentNutrition.calories || 0) + formData.macros.calories,
      protein: (currentNutrition.protein || 0) + formData.macros.protein,
      carbs: (currentNutrition.carbs || 0) + formData.macros.carbs,
      fat: (currentNutrition.fat || 0) + formData.macros.fat
    };
    
    localStorage.setItem('dailyNutrition', JSON.stringify(updatedNutrition));
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Custom Food Created",
        description: `${formData.name} has been added to your foods and logged.`
      });
      navigate('/log-meal');
    }, 600);
  };

  return (
    <div className="h-full bg-white pb-16">
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <button 
          className="p-2"
          onClick={handleGoBack}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Create Custom Food</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="text-sm font-medium">Food Name*</label>
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
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm font-medium">Brand (optional)</label>
          <Input
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g., Homemade"
            className="border-gray-300 mt-1"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-sm font-medium">Barcode (optional)</label>
          <Input
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
            placeholder="e.g., 123456789012"
            className="border-gray-300 mt-1"
          />
        </motion.div>

        <div className="flex space-x-4 items-end">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            <label className="text-sm font-medium">Serving Size*</label>
            <Input
              name="servingSize"
              type="number"
              value={formData.servingSize || ''}
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              className="border-gray-300 mt-1"
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            <label className="text-sm font-medium">Unit</label>
            <select
              name="servingUnit"
              value={formData.servingUnit}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md h-10 px-3 mt-1"
            >
              {servingUnits.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-t border-b py-4 -mx-4 px-4"
        >
          <h3 className="text-base font-semibold mb-3">Nutrition Facts (per serving)</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Calories*</label>
              <Input
                name="macros.calories"
                type="number"
                value={formData.macros.calories || ''}
                onChange={handleInputChange}
                min="0"
                className="border-gray-300"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Protein (g)</label>
              <Input
                name="macros.protein"
                type="number"
                value={formData.macros.protein || ''}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Carbs (g)</label>
              <Input
                name="macros.carbs"
                type="number"
                value={formData.macros.carbs || ''}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="border-gray-300"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Fat (g)</label>
              <Input
                name="macros.fat"
                type="number"
                value={formData.macros.fat || ''}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="border-gray-300"
              />
            </div>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            className="flex w-full justify-center items-center text-blue-600"
            onClick={() => setShowAdvancedNutrition(!showAdvancedNutrition)}
          >
            {showAdvancedNutrition ? 'Hide' : 'Show'} Advanced Nutrition
            <ChevronDown 
              size={16} 
              className={cn(
                "ml-1 transition-transform",
                showAdvancedNutrition ? "transform rotate-180" : ""
              )}
            />
          </Button>
          
          {showAdvancedNutrition && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-4 mt-4"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium">Fiber (g)</label>
                <Input
                  name="macros.fiber"
                  type="number"
                  value={formData.macros.fiber || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Sugar (g)</label>
                <Input
                  name="macros.sugar"
                  type="number"
                  value={formData.macros.sugar || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Saturated Fat (g)</label>
                <Input
                  name="macros.saturatedFat"
                  type="number"
                  value={formData.macros.saturatedFat || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Trans Fat (g)</label>
                <Input
                  name="macros.transFat"
                  type="number"
                  value={formData.macros.transFat || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Sodium (mg)</label>
                <Input
                  name="macros.sodium"
                  type="number"
                  value={formData.macros.sodium || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="border-gray-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Cholesterol (mg)</label>
                <Input
                  name="macros.cholesterol"
                  type="number"
                  value={formData.macros.cholesterol || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="border-gray-300"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <span className="animate-pulse">Saving food...</span>
              </div>
            ) : (
              <>
                <Plus size={18} className="mr-2" />
                Create & Add to Log
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogMealCustomFoodPage;
