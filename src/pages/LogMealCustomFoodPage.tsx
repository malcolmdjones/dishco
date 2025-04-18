
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Camera, X, Check, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CustomFood, LoggedMeal, NutritionLabelData } from '@/types/food';
import { v4 as uuidv4 } from 'uuid';

const LogMealCustomFoodPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const defaultFormData: CustomFood = {
    id: uuidv4(),
    name: '',
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    servingSize: 1,
    servingUnit: 'serving',
    createdAt: new Date().toISOString()
  };
  
  const [formData, setFormData] = useState<CustomFood>(defaultFormData);
  
  // Get nutrition data from location state if it exists (from label scan)
  const nutritionFromScan = location.state?.nutritionData as NutritionLabelData | undefined;
  
  useEffect(() => {
    if (nutritionFromScan) {
      // Parse serving size if available
      let servingSize = 1;
      let servingUnit = 'serving';
      
      if (nutritionFromScan.servingSize) {
        // Try to parse something like "2/3 cup (56g)"
        const match = nutritionFromScan.servingSize.match(/([0-9./]+)\s*([a-zA-Z]+)/);
        if (match) {
          // Handle fractions like 2/3
          const sizeStr = match[1];
          if (sizeStr.includes('/')) {
            const [numerator, denominator] = sizeStr.split('/');
            servingSize = parseInt(numerator) / parseInt(denominator);
          } else {
            servingSize = parseFloat(sizeStr);
          }
          
          // Get unit
          servingUnit = match[2].toLowerCase();
        }
      }
      
      setFormData({
        ...formData,
        macros: {
          calories: nutritionFromScan.calories || 0,
          protein: nutritionFromScan.protein || 0,
          carbs: nutritionFromScan.carbs || 0,
          fat: nutritionFromScan.fat || 0
        },
        servingSize: servingSize,
        servingUnit: servingUnit
      });
    }
  }, [nutritionFromScan]);

  const handleGoBack = () => {
    navigate('/log-meal');
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (
      name === 'calories' || 
      name === 'protein' || 
      name === 'carbs' || 
      name === 'fat'
    ) {
      setFormData({
        ...formData,
        macros: {
          ...formData.macros,
          [name]: value === "" ? 0 : parseFloat(value) || 0
        }
      });
    } else if (name === 'servingSize') {
      // Allow decimal inputs for serving size
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleServingUnitChange = (value: string) => {
    setFormData({
      ...formData,
      servingUnit: value
    });
  };
  
  const increment = (field: 'calories' | 'protein' | 'carbs' | 'fat' | 'servingSize') => {
    if (field === 'servingSize') {
      const increment = formData.servingSize < 1 ? 0.1 : 1;
      setFormData({
        ...formData,
        servingSize: Math.round((formData.servingSize + increment) * 10) / 10
      });
    } else {
      setFormData({
        ...formData,
        macros: {
          ...formData.macros,
          [field]: (formData.macros[field] || 0) + (field === 'calories' ? 10 : 1)
        }
      });
    }
  };
  
  const decrement = (field: 'calories' | 'protein' | 'carbs' | 'fat' | 'servingSize') => {
    if (field === 'servingSize') {
      const decrement = formData.servingSize <= 1 ? 0.1 : 1;
      const newValue = Math.max((formData.servingSize || 0) - decrement, 0.1);
      setFormData({
        ...formData,
        servingSize: Math.round(newValue * 10) / 10
      });
    } else {
      setFormData({
        ...formData,
        macros: {
          ...formData.macros,
          [field]: Math.max((formData.macros[field] || 0) - (field === 'calories' ? 10 : 1), 0)
        }
      });
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Missing Name",
        description: "Please provide a name for this food item",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Save to custom foods
      const customFoodToSave = {
        ...formData,
        imageSrc: imageSource,
        servingSize: formData.servingSize || 1 // Ensure we have a valid servingSize
      };
      
      const existingCustomFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
      localStorage.setItem('customFoods', JSON.stringify([customFoodToSave, ...existingCustomFoods]));
      
      // Log the meal
      const newMeal: LoggedMeal = {
        id: `${formData.id}-${Date.now()}`,
        name: formData.name,
        type: 'custom',
        recipe: {
          id: formData.id,
          name: formData.name,
          macros: formData.macros,
          servings: 1,
          type: 'custom'
        },
        consumed: true,
        loggedAt: new Date().toISOString(),
        loggedFromScreen: 'custom-food',
        calories: formData.macros.calories,
        servingInfo: `${formData.servingSize} ${formData.servingUnit}`,
        source: 'Custom Food',
        imageSrc: imageSource
      };
      
      const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
      localStorage.setItem('loggedMeals', JSON.stringify([newMeal, ...existingLoggedMeals]));
      
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "Food Added",
          description: `${formData.name} has been added to your log.`
        });
        navigate('/');
      }, 600);
    } catch (error) {
      console.error("Error saving custom food:", error);
      setIsSaving(false);
      toast({
        title: "Error",
        description: "Failed to save food. Please try again.",
        variant: "destructive"
      });
    }
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
        <h1 className="text-lg font-semibold">Create Food</h1>
        <div className="w-10"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="food-name">Food Name*</Label>
            <Input
              id="food-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Greek Yogurt"
              className="mt-1"
              required
            />
          </div>
          
          <div>
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
                  alt="Food" 
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serving-size">Serving Size</Label>
              <div className="flex mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => decrement('servingSize')}
                  className="rounded-r-none"
                >
                  <Minus size={16} />
                </Button>
                <Input
                  id="serving-size"
                  name="servingSize"
                  type="text"
                  inputMode="decimal"
                  value={formData.servingSize === 0 ? "" : formData.servingSize}
                  onChange={handleInputChange}
                  className="rounded-none text-center w-full"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => increment('servingSize')}
                  className="rounded-l-none"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="serving-unit">Unit</Label>
              <Select value={formData.servingUnit} onValueChange={handleServingUnitChange}>
                <SelectTrigger id="serving-unit" className="mt-1">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serving">serving</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="cup">cup</SelectItem>
                  <SelectItem value="tbsp">tbsp</SelectItem>
                  <SelectItem value="tsp">tsp</SelectItem>
                  <SelectItem value="piece">piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold border-b pb-2">Nutrition (per serving)</h2>
          
          <div className="space-y-4">
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
                  type="text"
                  inputMode="numeric"
                  value={formData.macros.calories === 0 ? "" : formData.macros.calories}
                  onChange={handleInputChange}
                  className="rounded-none text-center w-full"
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
                    type="text"
                    inputMode="numeric"
                    value={formData.macros.protein === 0 ? "" : formData.macros.protein}
                    onChange={handleInputChange}
                    className="rounded-none text-center w-full"
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
                    type="text"
                    inputMode="numeric"
                    value={formData.macros.carbs === 0 ? "" : formData.macros.carbs}
                    onChange={handleInputChange}
                    className="rounded-none text-center w-full"
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
                    type="text"
                    inputMode="numeric"
                    value={formData.macros.fat === 0 ? "" : formData.macros.fat}
                    onChange={handleInputChange}
                    className="rounded-none text-center w-full"
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
          </div>
        </motion.div>
        
        <div className="h-16"></div>
        
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <span className="animate-pulse">Adding to log...</span>
              </div>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                Save & Add to Log
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogMealCustomFoodPage;
