
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { X, BookOpen, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeDetail from './RecipeDetail';
import { calculateDailyMacros } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface PlanDetailViewProps {
  plan: any;
  isOpen: boolean;
  onClose: () => void;
}

const PlanDetailView: React.FC<PlanDetailViewProps> = ({ plan, isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeDay, setActiveDay] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

  // Early return if plan is not available
  if (!plan || !plan.plan_data) {
    return null;
  }

  // Extract days from plan data
  const days = plan.plan_data && plan.plan_data.days ? plan.plan_data.days : [];
  
  // Early return if no days data
  if (!Array.isArray(days) || days.length === 0) {
    return null;
  }

  // Ensure activeDay is within valid range
  const validActiveDay = Math.min(activeDay, days.length - 1);
  
  // Get daily macros safely
  const dailyMacros = days && days[validActiveDay] && days[validActiveDay].meals
    ? calculateDailyMacros(days[validActiveDay].meals)
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  // Calculate average calories safely
  const averageCalories = Math.round(
    days.reduce((sum: number, day: any) => {
      if (!day || !day.meals) return sum;
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.calories;
    }, 0) / (days.length || 1) // Avoid division by zero
  );
  
  // Calculate total macros safely
  const totalMacros = {
    protein: Math.round(days.reduce((sum: number, day: any) => {
      if (!day || !day.meals) return sum;
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.protein;
    }, 0) / (days.length || 1)),
    carbs: Math.round(days.reduce((sum: number, day: any) => {
      if (!day || !day.meals) return sum;
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.carbs;
    }, 0) / (days.length || 1)),
    fat: Math.round(days.reduce((sum: number, day: any) => {
      if (!day || !day.meals) return sum;
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.fat;
    }, 0) / (days.length || 1)),
  };
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const handleOpenRecipe = (recipe: any) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeDetailOpen(true);
    }
  };

  // Ensure we have meals for the active day
  const currentDayMeals = days && days[validActiveDay] && days[validActiveDay].meals 
    ? days[validActiveDay].meals 
    : {
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: []
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
            <p className="text-dishco-text-light">{plan.plan_data?.description || "No description available"}</p>
            
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Average Daily Nutrition</h3>
              
              <div className="grid grid-cols-4 gap-4">
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
                    variant={validActiveDay === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveDay(index)}
                    className="flex-shrink-0"
                  >
                    {dayNames[index % 7]}
                  </Button>
                ))}
              </div>
              
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Day {validActiveDay + 1}: {dayNames[validActiveDay % 7]}</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Breakfast</h4>
                    {currentDayMeals.breakfast ? (
                      <div 
                        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleOpenRecipe(currentDayMeals.breakfast)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={currentDayMeals.breakfast.imageSrc || '/placeholder.svg'} 
                            alt={currentDayMeals.breakfast.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{currentDayMeals.breakfast.name}</p>
                          <p className="text-xs text-dishco-text-light">{currentDayMeals.breakfast.macros?.calories || 0} cal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No breakfast scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Lunch</h4>
                    {currentDayMeals.lunch ? (
                      <div 
                        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleOpenRecipe(currentDayMeals.lunch)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={currentDayMeals.lunch.imageSrc || '/placeholder.svg'} 
                            alt={currentDayMeals.lunch.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{currentDayMeals.lunch.name}</p>
                          <p className="text-xs text-dishco-text-light">{currentDayMeals.lunch.macros?.calories || 0} cal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No lunch scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dinner</h4>
                    {currentDayMeals.dinner ? (
                      <div 
                        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleOpenRecipe(currentDayMeals.dinner)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={currentDayMeals.dinner.imageSrc || '/placeholder.svg'} 
                            alt={currentDayMeals.dinner.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{currentDayMeals.dinner.name}</p>
                          <p className="text-xs text-dishco-text-light">{currentDayMeals.dinner.macros?.calories || 0} cal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No dinner scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Snacks</h4>
                    {currentDayMeals.snacks && Array.isArray(currentDayMeals.snacks) && currentDayMeals.snacks.length > 0 ? (
                      <div className="space-y-2">
                        {currentDayMeals.snacks.map((snack: any, index: number) => (
                          snack && (
                            <div 
                              key={index}
                              className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => handleOpenRecipe(snack)}
                            >
                              <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                <img 
                                  src={snack.imageSrc || '/placeholder.svg'} 
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
          className={isRecipeDetailOpen ? "block" : "hidden"}
        />
      )}
    </>
  );
};

export default PlanDetailView;
