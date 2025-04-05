
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeDetail from './RecipeDetail';
import { calculateDailyMacros } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { MealPlan } from '@/hooks/useSavedMealPlans';

interface MealPlanDetailViewProps {
  plan: MealPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

const MealPlanDetailView: React.FC<MealPlanDetailViewProps> = ({ plan, isOpen, onClose }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

  // Early return if no plan or no days
  if (!plan || !plan.plan_data || !plan.plan_data.days || !Array.isArray(plan.plan_data.days) || plan.plan_data.days.length === 0) {
    return null;
  }

  const days = plan.plan_data.days;
  const currentDay = days[activeDay] || { meals: {} };
  const dailyMacros = calculateDailyMacros(currentDay.meals || {});
  
  const averageCalories = Math.round(
    days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day?.meals || {});
      return sum + (dayMacros.calories || 0);
    }, 0) / Math.max(days.length, 1)
  );
  
  const totalMacros = {
    protein: Math.round(days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day?.meals || {});
      return sum + (dayMacros.protein || 0);
    }, 0) / Math.max(days.length, 1)),
    carbs: Math.round(days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day?.meals || {});
      return sum + (dayMacros.carbs || 0);
    }, 0) / Math.max(days.length, 1)),
    fat: Math.round(days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day?.meals || {});
      return sum + (dayMacros.fat || 0);
    }, 0) / Math.max(days.length, 1)),
  };
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const handleOpenRecipe = (recipe: any) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeDetailOpen(true);
    }
  };

  // Safely render a meal item or show a placeholder
  const renderMealItem = (meal: any, mealType: string) => {
    if (!meal) {
      return (
        <p className="text-sm text-dishco-text-light">No {mealType} scheduled</p>
      );
    }
    
    return (
      <div 
        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => handleOpenRecipe(meal)}
      >
        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
          <img 
            src={meal.imageSrc || "/placeholder.svg"} 
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{meal.name}</p>
          <p className="text-xs text-dishco-text-light">{meal.macros?.calories || 0} cal</p>
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
                    <span className="font-medium">{averageCalories}</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Protein</span>
                    <span className="font-medium">{totalMacros.protein}g</span>
                  </div>
                  <Progress value={75} indicatorClassName="bg-amber-400" className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Carbs</span>
                    <span className="font-medium">{totalMacros.carbs}g</span>
                  </div>
                  <Progress value={60} indicatorClassName="bg-blue-400" className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Fat</span>
                    <span className="font-medium">{totalMacros.fat}g</span>
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
                    {renderMealItem(currentDay.meals?.breakfast, "breakfast")}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Lunch</h4>
                    {renderMealItem(currentDay.meals?.lunch, "lunch")}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dinner</h4>
                    {renderMealItem(currentDay.meals?.dinner, "dinner")}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Snacks</h4>
                    {currentDay.meals?.snacks && Array.isArray(currentDay.meals.snacks) && currentDay.meals.snacks.length > 0 ? (
                      <div className="space-y-2">
                        {currentDay.meals.snacks.map((snack: any, index: number) => (
                          snack && (
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
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{snack.name}</p>
                                <p className="text-xs text-dishco-text-light">{snack.macros?.calories || 0} cal</p>
                              </div>
                            </div>
                          )
                        ))}
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
