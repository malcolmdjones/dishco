import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeDetail from './RecipeDetail';
import { Progress } from '@/components/ui/progress';
import { MealPlan } from '@/hooks/useSavedMealPlans';
import { Recipe } from '@/data/mockData';

interface MealPlanDetailViewProps {
  plan: MealPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to safely calculate daily macros
const safeCalculateDailyMacros = (meals: any = {}) => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  
  // Safely add macros from each meal type
  const processMeal = (meal: any) => {
    if (!meal) return;
    
    if (Array.isArray(meal)) {
      meal.forEach(item => {
        if (item?.macros) {
          calories += item.macros.calories || 0;
          protein += item.macros.protein || 0;
          carbs += item.macros.carbs || 0;
          fat += item.macros.fat || 0;
        }
      });
    } else if (meal?.macros) {
      calories += meal.macros.calories || 0;
      protein += meal.macros.protein || 0;
      carbs += meal.macros.carbs || 0;
      fat += meal.macros.fat || 0;
    }
  };
  
  // Process each meal type
  processMeal(meals.breakfast);
  processMeal(meals.lunch);
  processMeal(meals.dinner);
  
  // Process snacks
  if (meals.snacks && Array.isArray(meals.snacks)) {
    meals.snacks.forEach((snack: any) => processMeal(snack));
  }
  
  return { calories, protein, carbs, fat };
};

const MealPlanDetailView: React.FC<MealPlanDetailViewProps> = ({ plan, isOpen, onClose }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

  // Early return if no plan or no days
  if (!plan || !plan.plan_data || !plan.plan_data.days || !Array.isArray(plan.plan_data.days) || plan.plan_data.days.length === 0) {
    return null;
  }

  const days = plan.plan_data.days;
  const currentDay = days[activeDay] || { date: '', meals: {} };
  // Initialize with empty object if meals is undefined
  const currentMeals = currentDay.meals || {};
  
  const dailyMacros = safeCalculateDailyMacros(currentMeals);
  
  // Calculate average macros across all days
  const calculateAverageMacros = () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    let validDaysCount = 0;
    
    days.forEach((day: any) => {
      if (day && day.meals) {
        const dayMacros = safeCalculateDailyMacros(day.meals);
        totals.calories += dayMacros.calories;
        totals.protein += dayMacros.protein;
        totals.carbs += dayMacros.carbs;
        totals.fat += dayMacros.fat;
        validDaysCount++;
      }
    });
    
    // Prevent division by zero
    const count = Math.max(validDaysCount, 1);
    
    return {
      calories: Math.round(totals.calories / count),
      protein: Math.round(totals.protein / count),
      carbs: Math.round(totals.carbs / count),
      fat: Math.round(totals.fat / count)
    };
  };
  
  const averageMacros = calculateAverageMacros();
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const handleOpenRecipe = (recipe: any) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeDetailOpen(true);
    }
  };

  // Get the actual meal data, handling both array and single object formats
  const getMealData = (mealData: any) => {
    if (!mealData) return null;
    
    // If it's an array with items, return the first one
    if (Array.isArray(mealData) && mealData.length > 0) {
      return mealData[0]; 
    }
    
    // Otherwise return the meal data as is (it's likely an object)
    return mealData;
  };

  // Safely render a meal item or show a placeholder
  const renderMealItem = (meal: any, mealType: string) => {
    const mealData = getMealData(meal);
    
    if (!mealData || !mealData.name) {
      return (
        <p className="text-sm text-dishco-text-light">No {mealType} scheduled</p>
      );
    }
    
    // Default values for missing properties
    const calories = mealData.macros?.calories || 0;
    const imageSrc = mealData.imageSrc || "/placeholder.svg";
    
    return (
      <div 
        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => handleOpenRecipe(mealData)}
      >
        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
          <img 
            src={imageSrc} 
            alt={mealData.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{mealData.name}</p>
          <p className="text-xs text-dishco-text-light">{calories} cal</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">{plan.name}</DialogTitle>
            <button 
              className="absolute top-4 right-4 p-2"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-dishco-text-light">
              {plan.plan_data.description || "Custom meal plan"}
            </p>
            
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Average Daily Nutrition</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Calories</span>
                    <span className="font-medium">{averageMacros.calories}</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Protein</span>
                    <span className="font-medium">{averageMacros.protein}g</span>
                  </div>
                  <Progress value={75} indicatorClassName="bg-amber-400" className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Carbs</span>
                    <span className="font-medium">{averageMacros.carbs}g</span>
                  </div>
                  <Progress value={60} indicatorClassName="bg-blue-400" className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Fat</span>
                    <span className="font-medium">{averageMacros.fat}g</span>
                  </div>
                  <Progress value={50} indicatorClassName="bg-green-400" className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex overflow-x-auto pb-2 space-x-2">
                {days.map((day: any, index: number) => (
                  <Button
                    key={index}
                    variant={activeDay === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveDay(index)}
                    className="flex-shrink-0"
                  >
                    {dayNames[index % 7]}
                  </Button>
                ))}
              </div>
              
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Day {activeDay + 1}: {dayNames[activeDay % 7]}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Breakfast</h4>
                    {renderMealItem(currentMeals.breakfast, "breakfast")}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Lunch</h4>
                    {renderMealItem(currentMeals.lunch, "lunch")}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dinner</h4>
                    {renderMealItem(currentMeals.dinner, "dinner")}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Snacks</h4>
                    {currentMeals.snacks && Array.isArray(currentMeals.snacks) && currentMeals.snacks.length > 0 ? (
                      <div className="space-y-2">
                        {currentMeals.snacks.map((snack: any, index: number) => {
                          if (!snack || !snack.name) return null;
                          
                          return (
                            <div 
                              key={index}
                              className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => handleOpenRecipe(snack)}
                            >
                              <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                <img 
                                  src={snack.imageSrc || "/placeholder.svg"} 
                                  alt={snack.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{snack.name}</p>
                                <p className="text-xs text-dishco-text-light">{snack.macros?.calories || 0} cal</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No snacks scheduled</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {selectedRecipe && (
        <RecipeDetail
          recipeId={selectedRecipe.id}
          onClose={() => setIsRecipeDetailOpen(false)}
          isOpen={isRecipeDetailOpen}
        />
      )}
    </>
  );
};

export default MealPlanDetailView;
