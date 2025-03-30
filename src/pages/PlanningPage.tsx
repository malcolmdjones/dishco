
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Book, BookOpen, Calendar, CheckCircle, CookingPot, Info, Lock, Maximize2, RefreshCw, Save, Unlock, Zap } from 'lucide-react';
import { calculateDailyMacros, defaultGoals, generateMockMealPlan, recipes } from '../data/mockData';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { format, addDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PlanningPage = () => {
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState(generateMockMealPlan());
  const [activeDay, setActiveDay] = useState(0);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayPlan = mealPlan[activeDay];
  const dailyMacros = calculateDailyMacros(currentDayPlan.meals);
  const goals = defaultGoals;

  const percentages = {
    calories: Math.min(100, (dailyMacros.calories / goals.calories) * 100),
    protein: Math.min(100, (dailyMacros.protein / goals.protein) * 100),
    carbs: Math.min(100, (dailyMacros.carbs / goals.carbs) * 100),
    fat: Math.min(100, (dailyMacros.fat / goals.fat) * 100),
  };
  
  // Calculate the differences for circular progress displays
  const differences = {
    calories: dailyMacros.calories - goals.calories,
    protein: dailyMacros.protein - goals.protein,
    carbs: dailyMacros.carbs - goals.carbs,
    fat: dailyMacros.fat - goals.fat
  };

  const calendarDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleLockMeal = (mealType: string, mealId: string) => {
    const key = `${mealType}-${mealId}`;
    setLockedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: lockedMeals[key] ? "Meal unlocked" : "Meal locked",
      description: "Your meal plan will preserve this selection.",
    });
  };

  const handleRegeneratePlan = () => {
    const newPlan = generateMockMealPlan();
    
    const updatedPlan = mealPlan.map((day, index) => {
      const newDay = newPlan[index];
      const updatedMeals = { ...newDay.meals };
      
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        const mealKey = `${mealType}-${day.meals[mealType]?.id}`;
        if (lockedMeals[mealKey]) {
          updatedMeals[mealType] = day.meals[mealType];
        }
      });
      
      if (day.meals.snacks) {
        updatedMeals.snacks = day.meals.snacks.map((snack, snackIndex) => {
          const snackKey = `snacks-${snack?.id}-${snackIndex}`;
          return lockedMeals[snackKey] ? snack : newDay.meals.snacks[snackIndex];
        });
      }
      
      return {
        ...newDay,
        meals: updatedMeals
      };
    });
    
    setMealPlan(updatedPlan);
    
    toast({
      title: "Plan Regenerated",
      description: "Your meal plan has been refreshed while preserving locked meals.",
    });
  };

  const handleSavePlan = () => {
    toast({
      title: "Plan Saved",
      description: "Your meal plan has been saved successfully.",
      variant: "default",
    });
  };

  const navigateDay = (direction: number) => {
    const newDay = activeDay + direction;
    if (newDay >= 0 && newDay < days.length) {
      setActiveDay(newDay);
    }
  };
  
  const handleOpenRecipeDetails = (meal: any) => {
    setSelectedMeal(meal);
    setIsRecipeDrawerOpen(true);
  };
  
  const handleAddFromVault = (recipe: any) => {
    const updatedMealPlan = [...mealPlan];
    const currentDay = { ...updatedMealPlan[activeDay] };
    
    if (!currentDay.meals.breakfast) {
      currentDay.meals.breakfast = recipe;
    } else if (!currentDay.meals.lunch) {
      currentDay.meals.lunch = recipe;
    } else if (!currentDay.meals.dinner) {
      currentDay.meals.dinner = recipe;
    } else {
      if (!currentDay.meals.snacks) {
        currentDay.meals.snacks = [];
      }
      currentDay.meals.snacks.push(recipe);
    }
    
    updatedMealPlan[activeDay] = currentDay;
    setMealPlan(updatedMealPlan);
    
    toast({
      title: "Recipe Added",
      description: `${recipe.name} added to your meal plan.`,
    });
    setIsVaultOpen(false);
  };

  const handleNavigateToDay = (dayIndex: number) => {
    setActiveDay(dayIndex);
    setIsWeekOverviewOpen(false);
  };

  const handleWeeklyOverview = () => {
    const safeWeeklyPlan = mealPlan.map(day => {
      const safeMeals = {
        breakfast: day.meals.breakfast || null,
        lunch: day.meals.lunch || null,
        dinner: day.meals.dinner || null,
        snacks: day.meals.snacks || []
      };
      
      return {
        ...day,
        meals: safeMeals
      };
    });
    
    setMealPlan(safeWeeklyPlan);
    setIsWeekOverviewOpen(true);
  };

  const [draggedMeal, setDraggedMeal] = useState<{type: string, meal: any, index?: number} | null>(null);
  
  const handleDragStart = (mealType: string, meal: any, index?: number) => {
    setDraggedMeal({ type: mealType, meal, index });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetType: string, targetIndex?: number) => {
    if (!draggedMeal) return;
    
    if (draggedMeal.type === targetType && draggedMeal.index === targetIndex) {
      setDraggedMeal(null);
      return;
    }
    
    const updatedMealPlan = [...mealPlan];
    const currentDay = { ...updatedMealPlan[activeDay] };
    const updatedMeals = { ...currentDay.meals };
    
    if (draggedMeal.type === 'snacks') {
      if (updatedMeals.snacks && draggedMeal.index !== undefined) {
        updatedMeals.snacks = updatedMeals.snacks.filter((_, i) => i !== draggedMeal.index);
      }
    } else {
      updatedMeals[draggedMeal.type] = null;
    }
    
    if (targetType === 'snacks') {
      if (!updatedMeals.snacks) {
        updatedMeals.snacks = [];
      }
      updatedMeals.snacks.push(draggedMeal.meal);
    } else {
      updatedMeals[targetType] = draggedMeal.meal;
    }
    
    currentDay.meals = updatedMeals;
    updatedMealPlan[activeDay] = currentDay;
    
    setMealPlan(updatedMealPlan);
    setDraggedMeal(null);
    
    toast({
      title: "Meal Moved",
      description: `${draggedMeal.meal.name} moved to ${targetType === 'snacks' ? 'snacks' : targetType}.`,
    });
  };

  return (
    <div className="animate-fade-in pb-4">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
          <p className="text-dishco-text-light">Plan and customize your meals</p>
        </div>
        
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsWeekOverviewOpen(true)}
                className="flex-shrink-0"
              >
                <Calendar size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>7-Day Overview</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsVaultOpen(true)}
                className="flex-shrink-0"
              >
                <BookOpen size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recipe Vault</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateDay(-1)} 
          disabled={activeDay === 0}
          className={`p-2 rounded-full ${activeDay === 0 ? 'text-gray-300' : 'text-dishco-text'}`}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center">
          <Calendar size={18} className="mr-2 text-dishco-primary" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">{days[activeDay]}</h2>
            <p className="text-xs text-dishco-text-light">{format(calendarDates[activeDay], 'MMM d, yyyy')}</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigateDay(1)} 
          disabled={activeDay === days.length - 1}
          className={`p-2 rounded-full ${activeDay === days.length - 1 ? 'text-gray-300' : 'text-dishco-text'}`}
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-slide-up">
        <h2 className="text-lg font-semibold mb-4">Daily Nutrition</h2>
        <div className="flex justify-between items-end">
          <div className="flex-1 flex flex-col items-center">
            <Progress 
              type="circular" 
              size="md"
              value={percentages.calories}
              max={100}
              showValue={true}
              valuePrefix={differences.calories >= 0 ? "+" : ""}
              valueSuffix=""
              label="Calories"
              status={percentages.calories > 90 ? "warning" : "default"}
              className="mb-1"
            />
            <span className="text-xs text-center mt-1">
              {dailyMacros.calories} / {goals.calories}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <Progress 
              type="circular" 
              size="md"
              value={percentages.protein}
              max={100}
              showValue={true}
              valuePrefix={differences.protein >= 0 ? "+" : ""}
              valueSuffix="g"
              label="Protein"
              status={percentages.protein > 90 ? "warning" : "default"}
              indicatorClassName="text-amber-500"
              className="mb-1"
            />
            <span className="text-xs text-center mt-1 text-amber-600">
              {dailyMacros.protein}g / {goals.protein}g
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <Progress 
              type="circular" 
              size="md"
              value={percentages.carbs}
              max={100}
              showValue={true}
              valuePrefix={differences.carbs >= 0 ? "+" : ""}
              valueSuffix="g"
              label="Carbs"
              status={percentages.carbs > 90 ? "warning" : "default"}
              indicatorClassName="text-primary"
              className="mb-1"
            />
            <span className="text-xs text-center mt-1">
              {dailyMacros.carbs}g / {goals.carbs}g
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <Progress 
              type="circular" 
              size="md"
              value={percentages.fat}
              max={100}
              showValue={true}
              valuePrefix={differences.fat >= 0 ? "+" : ""}
              valueSuffix="g"
              label="Fat"
              status={percentages.fat > 90 ? "warning" : "default"}
              indicatorClassName="text-green-500"
              className="mb-1"
            />
            <span className="text-xs text-center mt-1 text-green-600">
              {dailyMacros.fat}g / {goals.fat}g
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <h3 className="font-medium mb-2">Breakfast</h3>
          <div 
            className="drop-target"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('breakfast')}
          >
            {currentDayPlan.meals.breakfast ? (
              <MealCard 
                meal={currentDayPlan.meals.breakfast}
                isLocked={lockedMeals[`breakfast-${currentDayPlan.meals.breakfast?.id}`]}
                onLockToggle={() => handleLockMeal('breakfast', currentDayPlan.meals.breakfast?.id)}
                onViewRecipe={() => handleOpenRecipeDetails(currentDayPlan.meals.breakfast)}
                onDragStart={() => handleDragStart('breakfast', currentDayPlan.meals.breakfast)}
                draggable={true}
              />
            ) : (
              <EmptyMealCard title="Breakfast" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Lunch</h3>
          <div 
            className="drop-target"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('lunch')}
          >
            {currentDayPlan.meals.lunch ? (
              <MealCard 
                meal={currentDayPlan.meals.lunch}
                isLocked={lockedMeals[`lunch-${currentDayPlan.meals.lunch?.id}`]}
                onLockToggle={() => handleLockMeal('lunch', currentDayPlan.meals.lunch?.id)}
                onViewRecipe={() => handleOpenRecipeDetails(currentDayPlan.meals.lunch)}
                onDragStart={() => handleDragStart('lunch', currentDayPlan.meals.lunch)}
                draggable={true}
              />
            ) : (
              <EmptyMealCard title="Lunch" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Dinner</h3>
          <div 
            className="drop-target"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('dinner')}
          >
            {currentDayPlan.meals.dinner ? (
              <MealCard 
                meal={currentDayPlan.meals.dinner}
                isLocked={lockedMeals[`dinner-${currentDayPlan.meals.dinner?.id}`]}
                onLockToggle={() => handleLockMeal('dinner', currentDayPlan.meals.dinner?.id)}
                onViewRecipe={() => handleOpenRecipeDetails(currentDayPlan.meals.dinner)}
                onDragStart={() => handleDragStart('dinner', currentDayPlan.meals.dinner)}
                draggable={true}
              />
            ) : (
              <EmptyMealCard title="Dinner" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Snacks</h3>
          <div 
            className="space-y-3 drop-target"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('snacks')}
          >
            {currentDayPlan.meals.snacks?.map((snack, index) => (
              snack && (
                <MealCard 
                  key={index}
                  meal={snack}
                  isLocked={lockedMeals[`snacks-${snack?.id}-${index}`]}
                  onLockToggle={() => handleLockMeal(`snacks-${snack?.id}`, index.toString())}
                  onViewRecipe={() => handleOpenRecipeDetails(snack)}
                  onDragStart={() => handleDragStart('snacks', snack, index)}
                  draggable={true}
                  isSnack={true}
                />
              )
            ))}
            {(!currentDayPlan.meals.snacks || currentDayPlan.meals.snacks.length === 0) && (
              <EmptyMealCard title="Snack" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={handleRegeneratePlan} 
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          <span>Regenerate</span>
        </Button>
        
        <Button 
          onClick={handleSavePlan} 
          variant="default"
          className="flex items-center justify-center gap-2"
        >
          <Save size={18} />
          <span>Save Plan</span>
        </Button>
      </div>

      <Drawer open={isRecipeDrawerOpen} onOpenChange={setIsRecipeDrawerOpen}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <div className="relative h-48 w-full">
                <img 
                  src={selectedMeal.imageSrc} 
                  alt={selectedMeal.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-white text-lg font-bold">{selectedMeal.name}</h2>
                </div>
              </div>
              <DrawerHeader>
                <div className="flex items-center mt-2 space-x-2">
                  {selectedMeal.requiresBlender && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 bg-dishco-secondary/20 rounded-full">
                          <Zap size={16} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quick to prepare</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {selectedMeal.requiresCooking && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 bg-dishco-secondary/20 rounded-full">
                          <CookingPot size={16} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Requires cooking</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <DrawerDescription>
                  {selectedMeal.description}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-6">
                <div className="flex justify-between mb-4 bg-dishco-secondary/10 p-3 rounded-md">
                  <div className="text-center">
                    <p className="text-xs text-dishco-text-light">Calories</p>
                    <p className="font-semibold">{selectedMeal.macros.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-dishco-text-light">Protein</p>
                    <p className="font-semibold">{selectedMeal.macros.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-dishco-text-light">Carbs</p>
                    <p className="font-semibold">{selectedMeal.macros.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-dishco-text-light">Fat</p>
                    <p className="font-semibold">{selectedMeal.macros.fat}g</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Ingredients</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {selectedMeal.ingredients ? (
                      selectedMeal.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))
                    ) : (
                      <li>Ingredients not available</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    {selectedMeal.instructions ? (
                      selectedMeal.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))
                    ) : (
                      <li>Instructions not available</li>
                    )}
                  </ol>
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Dialog open={isWeekOverviewOpen} onOpenChange={setIsWeekOverviewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={18} className="text-dishco-primary" />
              Weekly Meal Plan Overview
            </DialogTitle>
            <DialogDescription>
              {format(calendarDates[0], 'MMM d')} - {format(calendarDates[6], 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-2">
            {mealPlan.map((day, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-3 cursor-pointer hover:border-dishco-primary transition-colors"
                onClick={() => handleNavigateToDay(index)}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">{days[index]}</h3>
                  <span className="text-sm text-dishco-text-light">
                    {format(calendarDates[index], 'MMM d')}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start text-sm">
                    <span className="w-24 font-medium flex-shrink-0">Breakfast:</span>
                    <span className="line-clamp-1">{day.meals.breakfast?.name || "None scheduled"}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="w-24 font-medium flex-shrink-0">Lunch:</span>
                    <span className="line-clamp-1">{day.meals.lunch?.name || "None scheduled"}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="w-24 font-medium flex-shrink-0">Dinner:</span>
                    <span className="line-clamp-1">{day.meals.dinner?.name || "None scheduled"}</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="flex">
                      <span className="w-24 font-medium flex-shrink-0">Snacks:</span>
                      <div className="flex-1">
                        {day.meals.snacks && day.meals.snacks.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {day.meals.snacks.map((snack, snackIndex) => (
                              <li key={snackIndex} className="line-clamp-1 ml-0">
                                {snack ? snack.name : "Unknown snack"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>None scheduled</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isVaultOpen} onOpenChange={setIsVaultOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen size={18} className="text-dishco-primary" />
              Recipe Vault
            </SheetTitle>
            <SheetDescription>
              Select a saved recipe to add to your meal plan
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 grid gap-4">
            {recipes.slice(0, 5).map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden">
                <div className="h-24 w-full overflow-hidden">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{recipe.name}</CardTitle>
                </CardHeader>
                <CardFooter className="flex justify-between pt-0">
                  <div className="text-xs text-dishco-text-light">
                    {recipe.macros.calories} cal · {recipe.macros.protein}g protein
                  </div>
                  <Button size="sm" onClick={() => handleAddFromVault(recipe)}>
                    Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface MealCardProps {
  meal: any;
  isLocked: boolean;
  onLockToggle: () => void;
  onViewRecipe: () => void;
  onDragStart: () => void;
  draggable: boolean;
  isSnack?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ 
  meal, isLocked, onLockToggle, onViewRecipe, onDragStart, draggable, isSnack = false 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden ${!isSnack ? 'animate-bounce-in' : 'animate-scale-in'}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="relative">
        <img 
          src={meal.imageSrc} 
          alt={meal.name} 
          className="w-full h-32 object-cover"
        />
        
        <div className="absolute top-2 right-2 flex space-x-1">
          <button 
            onClick={onLockToggle}
            className="p-1 bg-white bg-opacity-80 rounded-full shadow-sm"
          >
            {isLocked ? (
              <Lock size={18} className="text-dishco-primary" />
            ) : (
              <Unlock size={18} className="text-dishco-text-light" />
            )}
          </button>
          
          <button 
            onClick={onViewRecipe}
            className="p-1 bg-white bg-opacity-80 rounded-full shadow-sm"
          >
            <Info size={18} className="text-dishco-text-light" />
          </button>
        </div>
        
        <div className="absolute bottom-2 left-2 flex space-x-1">
          {meal.requiresBlender && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 bg-white bg-opacity-80 rounded-full shadow-sm">
                  <Zap size={14} className="text-dishco-accent" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick to prepare</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {meal.requiresCooking && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 bg-white bg-opacity-80 rounded-full shadow-sm">
                  <CookingPot size={14} className="text-dishco-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Requires cooking</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      
      <div className="p-3">        
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{meal.name}</p>
          </div>
          <div className="bg-dishco-secondary bg-opacity-20 rounded-full px-2 py-0.5">
            <span className="text-xs font-medium">{meal.macros.calories} kcal</span>
          </div>
        </div>
        
        <p className="text-sm text-dishco-text-light line-clamp-2 mt-1">{meal.description}</p>
        
        <div className="flex mt-3 space-x-2">
          <span className="macro-pill macro-pill-protein">P: {meal.macros.protein}g</span>
          <span className="macro-pill macro-pill-carbs">C: {meal.macros.carbs}g</span>
          <span className="macro-pill macro-pill-fat">F: {meal.macros.fat}g</span>
        </div>
      </div>
    </div>
  );
};

interface EmptyMealCardProps {
  title: string;
}

const EmptyMealCard: React.FC<EmptyMealCardProps> = ({ title }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-dashed border-gray-300 flex justify-center items-center h-40">
      <button className="flex flex-col items-center text-dishco-primary">
        <div className="w-12 h-12 rounded-full bg-dishco-primary bg-opacity-10 flex items-center justify-center mb-2">
          <Plus size={24} className="text-dishco-primary" />
        </div>
        <span>Add {title}</span>
      </button>
    </div>
  );
};

const Plus = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default PlanningPage;
