
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { QuickAddData, LoggedMeal } from '@/types/food';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const LogMealQuickAddPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialName = searchParams.get('name') || '';
  
  const [formData, setFormData] = useState<QuickAddData>({
    name: initialName,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealType: 'snack'
  });
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: initialName
    }));
  }, [initialName]);
  
  const handleGoBack = () => {
    navigate('/log-meal');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberFields = ['calories', 'protein', 'carbs', 'fat'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      mealType: value
    }));
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
        title: "Missing Information",
        description: "Please provide a name for this food",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.calories <= 0) {
      toast({
        title: "Invalid Calories",
        description: "Calories must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    // Create a recipe object from the form data
    const recipe = {
      id: `quick-add-${Date.now()}`,
      name: formData.name,
      macros: {
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat
      },
      type: formData.mealType,
      servings: 1,
      ingredients: [],
      prep_time_minutes: 0,
      externalSource: false,
      instructions: [],
      imageSrc: imageSource
    };
    
    // Log the meal
    const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const newMeal: LoggedMeal = {
      id: recipe.id,
      name: formData.name,
      type: formData.mealType,
      recipe: recipe,
      consumed: true,
      loggedAt: new Date().toISOString(),
      loggedFromScreen: 'quick-add',
      calories: formData.calories,
      protein: formData.protein > 0 ? `${formData.protein}g protein` : '',
      servingInfo: '1 serving',
      source: 'Quick Add',
      imageSrc: imageSource
    };
    
    const updatedLoggedMeals = [newMeal, ...existingLoggedMeals];
    localStorage.setItem('loggedMeals', JSON.stringify(updatedLoggedMeals));
    
    // Update daily nutrition
    const currentNutrition = JSON.parse(localStorage.getItem('dailyNutrition') || '{}');
    const updatedNutrition = {
      calories: (currentNutrition.calories || 0) + formData.calories,
      protein: (currentNutrition.protein || 0) + formData.protein,
      carbs: (currentNutrition.carbs || 0) + formData.carbs,
      fat: (currentNutrition.fat || 0) + formData.fat
    };
    
    localStorage.setItem('dailyNutrition', JSON.stringify(updatedNutrition));
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Food Logged",
        description: `${formData.name} has been added to your log.`
      });
      navigate('/log-meal');
    }, 600);
  };

  return (
    <div className="h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <button 
          className="p-2"
          onClick={handleGoBack}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Quick Add</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium">Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Protein Bar"
            className="border-gray-300"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium">Image (optional)</label>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {imageSource ? (
            <div className="relative">
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
            <div className="grid grid-cols-2 gap-3">
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium">Calories</label>
          <Input
            name="calories"
            type="number"
            value={formData.calories || ''}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
            className="border-gray-300"
            required
          />
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium">Protein (g)</label>
            <Input
              name="protein"
              type="number"
              value={formData.protein || ''}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              placeholder="0"
              className="border-gray-300"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium">Carbs (g)</label>
            <Input
              name="carbs"
              type="number"
              value={formData.carbs || ''}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              placeholder="0"
              className="border-gray-300"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium">Fat (g)</label>
            <Input
              name="fat"
              type="number"
              value={formData.fat || ''}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              placeholder="0"
              className="border-gray-300"
            />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium">Meal Type</label>
          <Select 
            value={formData.mealType} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
        
        <Button 
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 transition-all"
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="flex items-center">
              <span className="animate-pulse">Logging food...</span>
            </div>
          ) : (
            <>
              <Check size={18} className="mr-2" /> 
              Add to Food Log
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default LogMealQuickAddPage;
