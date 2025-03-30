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
  
  // Ensure we have valid meal plan data
  const ensureValidMealPlan = () => {
    const safeWeeklyPlan = mealPlan.map(day => {
      return {
        ...day,
        meals: {
          breakfast: Array.isArray(day.meals.breakfast) ? day.meals.breakfast : 
                    day.meals.breakfast ? [day.meals.breakfast] : [],
          lunch: Array.isArray(day.meals.lunch) ? day.meals.lunch : 
                 day.meals.lunch ? [day.meals.lunch] : [],
          dinner: Array.isArray(day.meals.dinner) ? day.meals.dinner : 
                 day.meals.dinner ? [day.meals.dinner] : [],
          snacks: Array.isArray(day.meals.snacks) ? day.meals.snacks.filter(snack => snack !== null && snack !== undefined) : []
        }
      };
    });
    
    return safeWeeklyPlan;
  };
  
  const safeMealPlan = ensureValidMealPlan();
  const currentDayPlan = safeMealPlan[activeDay];
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

  const handleLockMeal = (mealType: string, mealId: string, index?: number) => {
    const key = index !== undefined ? `${mealType}-${mealId}-${index}` : `${mealType}-${mealId}`;
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
      
      // Convert meals to arrays if they aren't already
      const breakfastArray = Array.isArray(day.meals.breakfast) ? day.meals.breakfast : day.meals.breakfast ? [day.meals.breakfast] : [];
      const lunchArray = Array.isArray(day.meals.lunch) ? day.meals.lunch : day.meals.lunch ? [day.meals.lunch] : [];
      const dinnerArray = Array.isArray(day.meals.dinner) ? day.meals.dinner : day.meals.dinner ? [day.meals.dinner] : [];
      const snacksArray = Array.isArray(day.meals.snacks) ? day.meals.snacks : [];
      
      // Keep locked breakfast meals
      updatedMeals.breakfast = breakfastArray.filter((meal, mealIndex) => {
        const mealKey = `breakfast-${meal?.id}-${mealIndex}`;
        return lockedMeals[mealKey];
      });
      
      // Keep locked lunch meals
      updatedMeals.lunch = lunchArray.filter((meal, mealIndex) => {
        const mealKey = `lunch-${meal?.id}-${mealIndex}`;
        return lockedMeals[mealKey];
      });
      
      // Keep locked dinner meals
      updatedMeals.dinner = dinnerArray.filter((meal, mealIndex) => {
        const mealKey = `dinner-${meal?.id}-${mealIndex}`;
        return lockedMeals[mealKey];
      });
      
      // Keep locked snacks
      if (snacksArray.length > 0) {
        updatedMeals.snacks = snacksArray.filter((snack, snackIndex) => {
          const snackKey = `snacks-${snack?.id}-${snackIndex}`;
          return lockedMeals[snackKey];
        });
      }
      
      // Add in new meals from the newly generated plan if needed
      if (Array.isArray(newDay.meals.breakfast) && newDay.meals.breakfast.length > 0 && updatedMeals.breakfast.length === 0) {
        updatedMeals.breakfast = [newDay.meals.breakfast[0]];
      } else if (newDay.meals.breakfast && updatedMeals.breakfast.length === 0) {
        updatedMeals.breakfast = [newDay.meals.breakfast];
      }
      
      if (Array.isArray(newDay.meals.lunch) && newDay.meals.lunch.length > 0 && updatedMeals.lunch.length === 0) {
        updatedMeals.lunch = [newDay.meals.lunch[0]];
      } else if (newDay.meals.lunch && updatedMeals.lunch.length === 0) {
        updatedMeals.lunch = [newDay.meals.lunch];
      }
      
      if (Array.isArray(newDay.meals.dinner) && newDay.meals.dinner.length > 0 && updatedMeals.dinner.length === 0) {
        updatedMeals.dinner = [newDay.meals.dinner[0]];
      } else if (newDay.meals.dinner && updatedMeals.dinner.length === 0) {
        updatedMeals.dinner = [newDay.meals.dinner];
      }
      
      if (!updatedMeals.snacks || updatedMeals.snacks.length === 0) {
        updatedMeals.snacks = newDay.meals.snacks;
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
    
    // Convert single items to arrays if needed
    if (!Array.isArray(currentDay.meals.breakfast)) {
      currentDay.meals.breakfast = currentDay.meals.breakfast ? [currentDay.meals.breakfast] : [];
    }
    if (!Array.isArray(currentDay.meals.lunch)) {
      currentDay.meals.lunch = currentDay.meals.lunch ? [currentDay.meals.lunch] : [];
    }
    if (!Array.isArray(currentDay.meals.dinner)) {
      currentDay.meals.dinner = currentDay.meals.dinner ? [currentDay.meals.dinner] : [];
    }
    if (!Array.isArray(currentDay.meals.snacks)) {
      currentDay.meals.snacks = [];
    }
    
    // Add to breakfast if it's empty
    if (currentDay.meals.breakfast.length === 0) {
      currentDay.meals.breakfast.push(recipe);
    } 
    // Add to lunch if it's empty
    else if (currentDay.meals.lunch.length === 0) {
      currentDay.meals.lunch.push(recipe);
    } 
    // Add to dinner if it's empty
    else if (currentDay.meals.dinner.length === 0) {
      currentDay.meals.dinner.push(recipe);
    } 
    // Otherwise add to snacks
    else {
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
    
    const updatedMealPlan = [...mealPlan];
    const currentDay = { ...updatedMealPlan[activeDay] };
    const updatedMeals = { ...currentDay.meals };
    
    // Convert single items to arrays if needed
    if (!Array.isArray(updatedMeals.breakfast)) {
      updatedMeals.breakfast = updatedMeals.breakfast ? [updatedMeals.breakfast] : [];
    }
    if (!Array.isArray(updatedMeals.lunch)) {
      updatedMeals.lunch = updatedMeals.lunch ? [updatedMeals.lunch] : [];
    }
    if (!Array.isArray(updatedMeals.dinner)) {
      updatedMeals.dinner = updatedMeals.dinner ? [updatedMeals.dinner] : [];
    }
    if (!Array.isArray(updatedMeals.snacks)) {
      updatedMeals.snacks = [];
    }
    
    // Only remove the meal from its original location
    if (draggedMeal.type === 'snacks') {
      if (updatedMeals.snacks && draggedMeal.index !== undefined) {
        const updatedSnacks = [...updatedMeals.snacks];
        updatedSnacks.splice(draggedMeal.index, 1);
        updatedMeals.snacks = updatedSnacks;
      }
    } else {
      // For main meals, remove only the specific item by index
      if (draggedMeal.index !== undefined) {
        const sourceArray = [...updatedMeals[draggedMeal.type]];
        sourceArray.splice(draggedMeal.index, 1);
        updatedMeals[draggedMeal.type] = sourceArray;
      }
    }
    
    // Add the meal to the target location
    if (targetType === 'snacks') {
      updatedMeals.snacks.push(draggedMeal.meal);
    } else {
      // Add to the target array
      updatedMeals[targetType].push(draggedMeal.meal);
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
        <div className="flex justify-between items-center">
          <div className="flex-1 flex flex-col items-center">
            <Progress 
              type="circular" 
              size="md"
              value={dailyMacros.calories}
              max={goals.calories}
              showValue={true}
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
              value={dailyMacros.protein}
              max={goals.protein}
              showValue={true}
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
              value={dailyMacros.carbs}
              max={goals.carbs}
              showValue={true}
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
              value={dailyMacros.fat}
              max={goals.fat}
              showValue={false}
              difference={differences.fat}
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
            className="drop-target space-y-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('breakfast')}
          >
            {Array.isArray(currentDayPlan.meals.breakfast) && currentDayPlan.meals.breakfast.length > 0 ? (
              currentDayPlan.meals.breakfast.map((meal, index) => (
                meal && (
                  <MealCard 
                    key={`breakfast-${index}-${meal.id}`}
                    meal={meal}
                    isLocked={lockedMeals[`breakfast-${meal.id}-${index}`]}
                    onLockToggle={() => handleLockMeal('breakfast', meal.id, index)}
                    onViewRecipe={() => handleOpenRecipeDetails(meal)}
                    onDragStart={() => handleDragStart('breakfast', meal, index)}
                    draggable={true}
                  />
                )
              ))
            ) : (
              <EmptyMealCard title="Breakfast" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Lunch</h3>
          <div 
            className="drop-target space-y-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('lunch')}
          >
            {Array.isArray(currentDayPlan.meals.lunch) && currentDayPlan.meals.lunch.length > 0 ? (
              currentDayPlan.meals.lunch.map((meal, index) => (
                meal && (
                  <MealCard 
                    key={`lunch-${index}-${meal.id}`}
                    meal={meal}
                    isLocked={lockedMeals[`lunch-${meal.id}-${index}`]}
                    onLockToggle={() => handleLockMeal('lunch', meal.id, index)}
                    onViewRecipe={() => handleOpenRecipeDetails(meal)}
                    onDragStart={() => handleDragStart('lunch', meal, index)}
                    draggable={true}
                  />
                )
              ))
            ) : (
              <EmptyMealCard title="Lunch" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Dinner</h3>
          <div 
            className="drop-target space-y-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('dinner')}
          >
            {Array.isArray(currentDayPlan.meals.dinner) && currentDayPlan.meals.dinner.length > 0 ? (
              currentDayPlan.meals.dinner.map((meal, index) => (
                meal && (
                  <MealCard 
                    key={`dinner-${index}-${meal.id}`}
                    meal={meal}
                    isLocked={lockedMeals[`dinner-${meal.id}-${index}`]}
                    onLockToggle={() => handleLockMeal('dinner', meal.id, index)}
                    onViewRecipe={() => handleOpenRecipeDetails(meal)}
                    onDragStart={() => handleDragStart('dinner', meal, index)}
                    draggable={true}
                  />
                )
              ))
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
                  key={`snacks-${index}-${snack.id}`}
                  meal={snack}
                  isLocked={lockedMeals[`snacks-${snack.id}-${index}`]}
                  onLockToggle={() => handleLockMeal('snacks', snack.id, index)}
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
        <DrawerContent className="max-h-[85vh] overflow-y-auto">
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
              <DrawerHeader className="py-3">
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
              <div className="px-4">
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
                
                <div className="mb-4">
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
                
                <div className="mb-4">
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
              <DrawerFooter className="mt-0 pt-0">
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
            {safeMealPlan.map((day, index) => (
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
                    <span className="flex-1">
                      {Array.isArray(day.meals.breakfast) && day.meals.breakfast.length > 0 ? (
                        <ul className="list-none pl-0 space-y-1">
                          {day.meals.breakfast.map((meal, mealIndex) => (
                            meal && (
                              <li key={mealIndex} className="line-clamp-1">
                                {meal.name}
                              </li>
                            )
                          ))}
                        </ul>
                      ) : (
                        "None scheduled"
                      )}
                    </span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="w-24 font-medium flex-shrink-0">Lunch:</span>
                    <span className="flex-1">
                      {Array.isArray(day.meals.lunch) && day.meals.lunch.length > 0 ? (
                        <ul className="list-none pl-0 space-y-1">
                          {day.meals.lunch.map((meal, mealIndex) => (
                            meal && (
                              <li key={mealIndex} className="line-clamp-1">
                                {meal.name}
                              </li>
                            )
                          ))}
                        </ul>
                      ) : (
                        "None scheduled"
                      )}
                    </span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="w-24 font-medium flex-shrink-0">Dinner:</span>
                    <span className="flex-1">
                      {Array.isArray(day.meals.dinner) && day.meals.dinner.length > 0 ? (
                        <ul className="list-none pl-0 space-y-1">
                          {day.meals.dinner.map((meal, mealIndex) => (
                            meal && (
                              <li key={mealIndex} className="line-clamp-1">
                                {meal.name}
                              </li>
                            )
                          ))}
                        </ul>
                      ) : (
                        "None scheduled"
                      )}
                    </span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="w-24 font-medium flex-shrink-0 align-top">Snacks:</span>
                    <div className="flex-1">
                      {day.meals.snacks && day.meals.snacks.length > 0 ? (
                        <ul className="list-none pl-0 space-y-1">
                          {day.meals.snacks.map((snack, snackIndex) => (
                            snack && (
                              <li key={snackIndex} className="line-clamp-1">
                                {snack.name}
                              </li>
                            )
                          ))}
                        </ul>
                      ) : (
                        <span>None scheduled</span>
                      )}
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
