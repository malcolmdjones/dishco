
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { QuickAddFood } from '@/types/food';

const QuickAddPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('Quick Add');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [mealType, setMealType] = useState('snack');

  const handleSave = () => {
    if (!calories) {
      toast({
        title: "Calories Required",
        description: "Please enter at least the calories for this food.",
        variant: "destructive"
      });
      return;
    }

    try {
      const calNumber = parseInt(calories);
      if (isNaN(calNumber) || calNumber <= 0) {
        toast({
          title: "Invalid Calories",
          description: "Please enter a positive number for calories.",
          variant: "destructive"
        });
        return;
      }
      
      // Create quick add food object
      const quickAddFood: QuickAddFood = {
        id: uuidv4(),
        name: name || 'Quick Add',
        macros: {
          calories: calNumber,
          protein: protein ? parseFloat(protein) : undefined,
          carbs: carbs ? parseFloat(carbs) : undefined,
          fat: fat ? parseFloat(fat) : undefined
        },
        mealType,
        createdAt: new Date().toISOString()
      };
      
      // Save to logged meals
      const existingLoggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
      
      const loggedMeal = {
        id: quickAddFood.id,
        name: quickAddFood.name,
        type: quickAddFood.mealType,
        recipe: quickAddFood,
        consumed: true,
        loggedAt: new Date().toISOString(),
        loggedFromScreen: 'quick-add',
        calories: quickAddFood.macros.calories,
        protein: quickAddFood.macros.protein ? `${quickAddFood.macros.protein}g protein` : undefined,
        servingInfo: '1 serving'
      };
      
      localStorage.setItem('loggedMeals', JSON.stringify([loggedMeal, ...existingLoggedMeals]));
      
      // Update daily nutrition
      const currentNutrition = JSON.parse(localStorage.getItem('dailyNutrition') || '{}');
      const updatedNutrition = {
        calories: (currentNutrition.calories || 0) + quickAddFood.macros.calories,
        protein: (currentNutrition.protein || 0) + (quickAddFood.macros.protein || 0),
        carbs: (currentNutrition.carbs || 0) + (quickAddFood.macros.carbs || 0),
        fat: (currentNutrition.fat || 0) + (quickAddFood.macros.fat || 0)
      };
      
      localStorage.setItem('dailyNutrition', JSON.stringify(updatedNutrition));
      
      toast({
        title: "Food Logged",
        description: `Added ${quickAddFood.name} to your food log.`
      });
      
      navigate(-1);
    } catch (error) {
      console.error("Error saving quick add food:", error);
      toast({
        title: "Error",
        description: "There was a problem saving this item.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold">Quick Add</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="invisible"
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
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Quick Add"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-blue-600 font-medium">Calories (Required)</Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="text-lg font-medium"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                placeholder="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mealType">Meal Type</Label>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger id="mealType">
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-4">
          <motion.div
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              onClick={handleSave}
            >
              Log Food
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickAddPage;
