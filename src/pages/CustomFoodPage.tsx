
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronsUpDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { CustomFood } from '@/types/food';

const servingSizes = [
  'g', 'ml', 'oz', 'tbsp', 'tsp', 'cup', 'slice', 'piece', 'serving'
];

const CustomFoodPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [foodName, setFoodName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  
  // Basic nutrition
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  
  // Detailed nutrition
  const [saturatedFat, setSaturatedFat] = useState('');
  const [transFat, setTransFat] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [sodium, setSodium] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  
  const handleSave = () => {
    if (!foodName || !calories) {
      toast({
        title: "Required Fields Missing",
        description: "Food name and calories are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create custom food object
      const customFood: CustomFood = {
        id: uuidv4(),
        name: foodName,
        brand: brand || undefined,
        barcode: barcode || undefined,
        macros: {
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          saturatedFat: saturatedFat ? parseFloat(saturatedFat) : undefined,
          transFat: transFat ? parseFloat(transFat) : undefined,
          cholesterol: cholesterol ? parseFloat(cholesterol) : undefined,
          sodium: sodium ? parseFloat(sodium) : undefined,
          fiber: fiber ? parseFloat(fiber) : undefined,
          sugar: sugar ? parseFloat(sugar) : undefined
        },
        servingSize,
        servingUnit,
        isUserCreated: true,
        createdAt: new Date().toISOString()
      };
      
      // Save to custom foods
      const existingCustomFoods = JSON.parse(localStorage.getItem('customFoods') || '[]');
      localStorage.setItem('customFoods', JSON.stringify([customFood, ...existingCustomFoods]));
      
      toast({
        title: "Food Created",
        description: `${foodName} has been added to your custom foods.`
      });
      
      navigate(-1);
    } catch (error) {
      console.error("Error saving custom food:", error);
      toast({
        title: "Error",
        description: "There was a problem saving this food.",
        variant: "destructive"
      });
    }
  };

  // Create an array of common foods for the suggestions
  const suggestServingSize = (food: string) => {
    const foodLower = food.toLowerCase();
    if (foodLower.includes('milk') || foodLower.includes('juice') || foodLower.includes('drink')) {
      setServingSize('240');
      setServingUnit('ml');
    } else if (foodLower.includes('yogurt') || foodLower.includes('yoghurt')) {
      setServingSize('170');
      setServingUnit('g');
    } else if (foodLower.includes('bread') || foodLower.includes('toast')) {
      setServingSize('1');
      setServingUnit('slice');
    } else if (foodLower.includes('egg')) {
      setServingSize('1');
      setServingUnit('piece');
    } else if (foodLower.includes('banana') || foodLower.includes('apple')) {
      setServingSize('1');
      setServingUnit('piece');
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
          <h1 className="text-xl font-semibold">Create Food</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-blue-600"
            onClick={handleSave}
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
            <Label htmlFor="foodName" className="text-blue-600">Food Name *</Label>
            <Input
              id="foodName"
              placeholder="e.g. Greek Yogurt"
              value={foodName}
              onChange={(e) => {
                setFoodName(e.target.value);
                suggestServingSize(e.target.value);
              }}
              className="text-lg"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brand">Brand (Optional)</Label>
            <Input
              id="brand"
              placeholder="e.g. Chobani"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="servingSize">Serving Size</Label>
              <Input
                id="servingSize"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servingUnit">Unit</Label>
              <Select value={servingUnit} onValueChange={setServingUnit}>
                <SelectTrigger id="servingUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {servingSizes.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input
              id="barcode"
              placeholder="e.g. 1234567890"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="basic">Basic Nutrition</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Nutrition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-blue-600">Calories *</Label>
                <Input
                  id="calories"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  type="number"
                  className="text-lg"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    placeholder="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="detailed" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saturatedFat">Saturated Fat (g)</Label>
                  <Input
                    id="saturatedFat"
                    placeholder="0"
                    value={saturatedFat}
                    onChange={(e) => setSaturatedFat(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transFat">Trans Fat (g)</Label>
                  <Input
                    id="transFat"
                    placeholder="0"
                    value={transFat}
                    onChange={(e) => setTransFat(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cholesterol">Cholesterol (mg)</Label>
                  <Input
                    id="cholesterol"
                    placeholder="0"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sodium">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    placeholder="0"
                    value={sodium}
                    onChange={(e) => setSodium(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    placeholder="0"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sugar">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    placeholder="0"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="pt-4">
          <motion.div
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              onClick={handleSave}
            >
              Save Food
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomFoodPage;
