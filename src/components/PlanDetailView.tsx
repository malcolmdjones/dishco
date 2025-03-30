
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeDetail from './RecipeDetail';
import { calculateDailyMacros } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';

interface PlanDetailViewProps {
  plan: any;
  isOpen: boolean;
  onClose: () => void;
}

const PlanDetailView: React.FC<PlanDetailViewProps> = ({ plan, isOpen, onClose }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

  if (!plan) return null;

  const dailyMacros = calculateDailyMacros(plan.days[activeDay].meals);
  
  const averageCalories = Math.round(
    plan.days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.calories;
    }, 0) / plan.days.length
  );
  
  const totalMacros = {
    protein: Math.round(plan.days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.protein;
    }, 0) / plan.days.length),
    carbs: Math.round(plan.days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.carbs;
    }, 0) / plan.days.length),
    fat: Math.round(plan.days.reduce((sum: number, day: any) => {
      const dayMacros = calculateDailyMacros(day.meals);
      return sum + dayMacros.fat;
    }, 0) / plan.days.length),
  };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const handleOpenRecipe = (recipe: any) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsRecipeDetailOpen(true);
    }
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
            <p className="text-dishco-text-light">{plan.description}</p>
            
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Average Daily Nutrition</h3>
              
              <div className="grid grid-cols-3 gap-4">
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
                {plan.days.map((day: any, index: number) => (
                  <Button
                    key={index}
                    variant={activeDay === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveDay(index)}
                    className="flex-shrink-0"
                  >
                    {days[index % 7]}
                  </Button>
                ))}
              </div>
              
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Day {activeDay + 1}: {days[activeDay % 7]}</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Breakfast</h4>
                    {plan.days[activeDay].meals.breakfast ? (
                      <div 
                        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleOpenRecipe(plan.days[activeDay].meals.breakfast)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={plan.days[activeDay].meals.breakfast.imageSrc} 
                            alt={plan.days[activeDay].meals.breakfast.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{plan.days[activeDay].meals.breakfast.name}</p>
                          <p className="text-xs text-dishco-text-light">{plan.days[activeDay].meals.breakfast.macros.calories} cal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No breakfast scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Lunch</h4>
                    {plan.days[activeDay].meals.lunch ? (
                      <div 
                        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleOpenRecipe(plan.days[activeDay].meals.lunch)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={plan.days[activeDay].meals.lunch.imageSrc} 
                            alt={plan.days[activeDay].meals.lunch.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{plan.days[activeDay].meals.lunch.name}</p>
                          <p className="text-xs text-dishco-text-light">{plan.days[activeDay].meals.lunch.macros.calories} cal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No lunch scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dinner</h4>
                    {plan.days[activeDay].meals.dinner ? (
                      <div 
                        className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleOpenRecipe(plan.days[activeDay].meals.dinner)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={plan.days[activeDay].meals.dinner.imageSrc} 
                            alt={plan.days[activeDay].meals.dinner.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{plan.days[activeDay].meals.dinner.name}</p>
                          <p className="text-xs text-dishco-text-light">{plan.days[activeDay].meals.dinner.macros.calories} cal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-dishco-text-light">No dinner scheduled</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Snacks</h4>
                    {plan.days[activeDay].meals.snacks && plan.days[activeDay].meals.snacks.length > 0 ? (
                      <div className="space-y-2">
                        {plan.days[activeDay].meals.snacks.map((snack: any, index: number) => (
                          snack && (
                            <div 
                              key={index}
                              className="p-3 bg-muted/20 rounded-md flex items-center cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => handleOpenRecipe(snack)}
                            >
                              <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                <img 
                                  src={snack.imageSrc} 
                                  alt={snack.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{snack.name}</p>
                                <p className="text-xs text-dishco-text-light">{snack.macros.calories} cal</p>
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
