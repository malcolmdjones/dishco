
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, RefreshCw, Lock, Unlock, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { calculateDailyMacros, defaultGoals, fetchNutritionGoals, recipes, Recipe, NutritionGoals, MealPlanDay } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import SavePlanDialog from '@/components/SavePlanDialog';

const CreateMealPlanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [userGoals, setUserGoals] = useState<NutritionGoals>(defaultGoals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSavePlanDialogOpen, setIsSavePlanDialogOpen] = useState(false);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});

  // Get user's nutrition goals
  useEffect(() => {
    const getUserGoals = async () => {
      try {
        const goals = await fetchNutritionGoals();
        setUserGoals(goals);
      } catch (error) {
        console.error('Error fetching nutrition goals:', error);
      }
    };
    getUserGoals();
  }, []);

  // Initialize or generate meal plan
  useEffect(() => {
    if (mealPlan.length === 0) {
      generateFullMealPlan();
    }
  }, [userGoals]);

  // Function to generate a meal plan for the entire week
  const generateFullMealPlan = () => {
    setIsGenerating(true);
    // Create a 7-day meal plan
    const newPlan: MealPlanDay[] = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i - currentDay); // Adjust to keep current day in sync
      
      return {
        date: date.toISOString(),
        meals: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snacks: [null, null]
        }
      };
    });
    
    setMealPlan(newPlan);
    regenerateMeals();
  };

  // Function to regenerate meals for the current day
  const regenerateMeals = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      setMealPlan(prevPlan => {
        const newPlan = [...prevPlan];
        const currentPlanDay = { ...newPlan[currentDay] };
        
        // Filter recipes by meal type
        const breakfastRecipes = recipes.filter(r => r.type === 'breakfast');
        const lunchRecipes = recipes.filter(r => r.type === 'lunch');
        const dinnerRecipes = recipes.filter(r => r.type === 'dinner');
        const snackRecipes = recipes.filter(r => r.type === 'snack');
        
        // Only replace meals that aren't locked
        const newMeals = { ...currentPlanDay.meals };
        
        if (!lockedMeals[`${currentDay}-breakfast`]) {
          newMeals.breakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-lunch`]) {
          newMeals.lunch = lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-dinner`]) {
          newMeals.dinner = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
        }
        
        // Handle snacks
        const newSnacks = [...(newMeals.snacks || [])];
        if (!lockedMeals[`${currentDay}-snack-0`] || !newSnacks[0]) {
          newSnacks[0] = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
        }
        
        if (!lockedMeals[`${currentDay}-snack-1`] || !newSnacks[1]) {
          newSnacks[1] = snackRecipes[Math.floor(Math.random() * snackRecipes.length)];
        }
        
        newMeals.snacks = newSnacks;
        currentPlanDay.meals = newMeals;
        newPlan[currentDay] = currentPlanDay;
        
        return newPlan;
      });
      
      setIsGenerating(false);
      
      toast({
        title: "Meal Plan Updated",
        description: "Your meals have been regenerated based on your nutrition goals.",
      });
    }, 1500);
  };

  // Handle day navigation
  const navigateDay = (direction: 'prev' | 'next') => {
    let newDay = direction === 'prev' ? currentDay - 1 : currentDay + 1;
    
    // Ensure we stay within the bounds of our week
    if (newDay < 0) newDay = 0;
    if (newDay > 6) newDay = 6;
    
    setCurrentDay(newDay);
  };

  // Toggle meal lock status
  const toggleLockMeal = (mealType: string, index?: number) => {
    const key = index !== undefined ? `${currentDay}-${mealType}-${index}` : `${currentDay}-${mealType}`;
    
    setLockedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: lockedMeals[key] ? "Meal Unlocked" : "Meal Locked",
      description: lockedMeals[key] 
        ? "This meal can now be changed when regenerating." 
        : "This meal will stay the same when regenerating.",
    });
  };

  // Handle recipe selection to view details
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  // Save the current meal plan
  const handleSavePlan = () => {
    setIsSavePlanDialogOpen(true);
  };

  // Calculate current day's nutrition totals
  const calculateDayTotals = () => {
    if (!mealPlan[currentDay]) return userGoals;
    
    const dayMeals = mealPlan[currentDay].meals;
    return calculateDailyMacros(dayMeals);
  };

  // Check if current meals exceed user goals
  const checkExceedsGoals = () => {
    const totals = calculateDayTotals();
    const exceeds = {
      calories: totals.calories > userGoals.calories + 75,
      protein: totals.protein > userGoals.protein + 2,
      carbs: totals.carbs > userGoals.carbs + 5,
      fat: totals.fat > userGoals.fat + 5
    };
    
    return {
      any: exceeds.calories || exceeds.protein || exceeds.carbs || exceeds.fat,
      exceeds
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'numeric', 
      day: 'numeric'
    });
  };

  // Get day number for the calendar display
  const getDayNumber = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  // Get current day's data
  const currentDayData = mealPlan[currentDay];
  const dayTotals = calculateDayTotals();
  const { any: exceedsGoals, exceeds } = checkExceedsGoals();

  return (
    <div className="pb-20 animate-fade-in">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/planning')} 
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">New Meal Plan</h1>
      </div>
      <p className="text-dishco-text-light mb-4">Plan and customize your meals</p>

      {/* Weekly Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateDay('prev')} 
          disabled={currentDay === 0}
        >
          <ArrowLeft size={18} />
        </Button>
        
        <div className="flex space-x-2 overflow-x-auto">
          {mealPlan.map((day, idx) => (
            <button 
              key={idx} 
              className={`flex flex-col items-center justify-center size-10 rounded-full ${
                idx === currentDay 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setCurrentDay(idx)}
            >
              <span className="text-xs uppercase">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </span>
              <span className="text-sm font-medium">{getDayNumber(day.date)}</span>
            </button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigateDay('next')}
          disabled={currentDay === 6}
        >
          <ArrowRight size={18} />
        </Button>
      </div>

      {/* Daily Nutrition Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-2">Daily Nutrition</h2>
        
        {exceedsGoals && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md mb-3 text-red-600 text-sm">
            <AlertTriangle size={16} />
            <span>This plan exceeds your daily goals</span>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-4">
          {/* Calories */}
          <div className="flex flex-col">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-semibold">{dayTotals.calories}</span>
              <span className="text-xs text-gray-500">/ {userGoals.calories}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${exceeds.calories ? 'bg-red-400' : 'bg-yellow-400'}`} 
                style={{ width: `${Math.min(100, (dayTotals.calories / userGoals.calories) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1">Calories</span>
          </div>
          
          {/* Protein */}
          <div className="flex flex-col">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-semibold">{dayTotals.protein}g</span>
              <span className="text-xs text-gray-500">/ {userGoals.protein}g</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${exceeds.protein ? 'bg-red-400' : 'bg-blue-400'}`}
                style={{ width: `${Math.min(100, (dayTotals.protein / userGoals.protein) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1">Protein</span>
          </div>
          
          {/* Carbs */}
          <div className="flex flex-col">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-semibold">{dayTotals.carbs}g</span>
              <span className="text-xs text-gray-500">/ {userGoals.carbs}g</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${exceeds.carbs ? 'bg-red-400' : 'bg-yellow-200'}`}
                style={{ width: `${Math.min(100, (dayTotals.carbs / userGoals.carbs) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1">Carbs</span>
          </div>
          
          {/* Fat */}
          <div className="flex flex-col">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-semibold">{dayTotals.fat}g</span>
              <span className="text-xs text-gray-500">/ {userGoals.fat}g</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${exceeds.fat ? 'bg-red-400' : 'bg-purple-300'}`}
                style={{ width: `${Math.min(100, (dayTotals.fat / userGoals.fat) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1">Fat</span>
          </div>
        </div>
      </div>

      {/* Meal Sections */}
      {currentDayData && (
        <div className="space-y-6">
          {/* Breakfast */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Breakfast</h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toggleLockMeal('breakfast')}
                >
                  {lockedMeals[`${currentDay}-breakfast`] ? <Lock size={16} /> : <Unlock size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {/* Add from vault logic */}}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {currentDayData.meals.breakfast ? (
              <div 
                className="cursor-pointer" 
                onClick={() => handleRecipeClick(currentDayData.meals.breakfast!)}
              >
                <h4 className="font-medium">{currentDayData.meals.breakfast.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{currentDayData.meals.breakfast.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {currentDayData.meals.breakfast.macros.calories} kcal
                  </span>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      P: {currentDayData.meals.breakfast.macros.protein}g
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      C: {currentDayData.meals.breakfast.macros.carbs}g
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      F: {currentDayData.meals.breakfast.macros.fat}g
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-400 text-sm">No breakfast selected</p>
              </div>
            )}
          </div>
          
          {/* Lunch */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Lunch</h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toggleLockMeal('lunch')}
                >
                  {lockedMeals[`${currentDay}-lunch`] ? <Lock size={16} /> : <Unlock size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {/* Add from vault logic */}}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {currentDayData.meals.lunch ? (
              <div 
                className="cursor-pointer" 
                onClick={() => handleRecipeClick(currentDayData.meals.lunch!)}
              >
                <h4 className="font-medium">{currentDayData.meals.lunch.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{currentDayData.meals.lunch.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {currentDayData.meals.lunch.macros.calories} kcal
                  </span>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      P: {currentDayData.meals.lunch.macros.protein}g
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      C: {currentDayData.meals.lunch.macros.carbs}g
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      F: {currentDayData.meals.lunch.macros.fat}g
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-400 text-sm">No lunch selected</p>
              </div>
            )}
          </div>
          
          {/* Dinner */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Dinner</h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toggleLockMeal('dinner')}
                >
                  {lockedMeals[`${currentDay}-dinner`] ? <Lock size={16} /> : <Unlock size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {/* Add from vault logic */}}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {currentDayData.meals.dinner ? (
              <div 
                className="cursor-pointer" 
                onClick={() => handleRecipeClick(currentDayData.meals.dinner!)}
              >
                <h4 className="font-medium">{currentDayData.meals.dinner.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{currentDayData.meals.dinner.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {currentDayData.meals.dinner.macros.calories} kcal
                  </span>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      P: {currentDayData.meals.dinner.macros.protein}g
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      C: {currentDayData.meals.dinner.macros.carbs}g
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      F: {currentDayData.meals.dinner.macros.fat}g
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-400 text-sm">No dinner selected</p>
              </div>
            )}
          </div>
          
          {/* Snacks */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-medium mb-4">Snacks</h3>
            
            <div className="space-y-4">
              {currentDayData.meals.snacks && currentDayData.meals.snacks.map((snack, idx) => (
                <div key={idx} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm text-gray-600">Snack {idx + 1}</h4>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => toggleLockMeal('snack', idx)}
                      >
                        {lockedMeals[`${currentDay}-snack-${idx}`] ? <Lock size={16} /> : <Unlock size={16} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {/* Add from vault logic */}}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {snack ? (
                    <div 
                      className="cursor-pointer" 
                      onClick={() => handleRecipeClick(snack)}
                    >
                      <h4 className="font-medium">{snack.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{snack.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          {snack.macros.calories} kcal
                        </span>
                        <div className="flex gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            P: {snack.macros.protein}g
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            C: {snack.macros.carbs}g
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            F: {snack.macros.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 bg-gray-50 rounded flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No snack selected</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-white border-t flex justify-between">
        <Button 
          variant="outline" 
          onClick={regenerateMeals} 
          disabled={isGenerating}
          className="w-[48%] bg-amber-50 border-amber-200 text-amber-800"
        >
          <RefreshCw size={16} className="mr-2" />
          {isGenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
        
        <Button 
          onClick={handleSavePlan} 
          disabled={isGenerating}
          className="w-[48%] bg-green-600 hover:bg-green-700"
        >
          <Save size={16} className="mr-2" />
          Save Plan
        </Button>
      </div>

      {/* Recipe Viewer Dialog */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
        />
      )}

      {/* Save Plan Dialog */}
      <SavePlanDialog
        isOpen={isSavePlanDialogOpen}
        onClose={() => setIsSavePlanDialogOpen(false)}
        mealPlan={mealPlan}
      />
    </div>
  );
};

export default CreateMealPlanPage;
