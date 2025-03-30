
import React, { useState } from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import { Recipe } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import SavePlanDialog from '@/components/SavePlanDialog';
import PageHeader from '@/components/meal-plan/PageHeader';
import DailyNavigationCalendar from '@/components/meal-plan/DailyNavigationCalendar';
import DailyNutritionCard from '@/components/meal-plan/DailyNutritionCard';
import MealCard from '@/components/meal-plan/MealCard';
import SnacksSection from '@/components/meal-plan/SnacksSection';
import BottomActionBar from '@/components/meal-plan/BottomActionBar';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';

const CreateMealPlanPage = () => {
  // Use our custom hook for meal plan logic
  const {
    currentDay,
    setCurrentDay,
    mealPlan,
    isGenerating,
    lockedMeals,
    toggleLockMeal,
    regenerateMeals,
    calculateDayTotals,
    checkExceedsGoals
  } = useMealPlanUtils();

  // Local component state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSavePlanDialogOpen, setIsSavePlanDialogOpen] = useState(false);
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [isRecipeVaultOpen, setIsRecipeVaultOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState('');
  const [targetMealIndex, setTargetMealIndex] = useState<number | undefined>(undefined);

  // Handle recipe selection to view details
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  // Save the current meal plan
  const handleSavePlan = () => {
    setIsSavePlanDialogOpen(true);
  };

  // Open the Recipe Vault dialog
  const handleOpenVault = (mealType: string, index?: number) => {
    setTargetMealType(mealType);
    setTargetMealIndex(index);
    setIsRecipeVaultOpen(true);
  };

  // Open the Week Overview dialog
  const handleOpenWeekOverview = () => {
    setIsWeekOverviewOpen(true);
  };

  // Add a recipe to the meal plan from the vault
  const handleAddFromVault = (recipe: Recipe, mealType: string, index?: number) => {
    // Clone current meal plan
    const newMealPlan = [...mealPlan];
    const currentDayData = { ...newMealPlan[currentDay] };
    const currentMeals = { ...currentDayData.meals };
    
    // Update based on meal type
    if (mealType === 'breakfast') {
      currentMeals.breakfast = recipe;
    } else if (mealType === 'lunch') {
      currentMeals.lunch = recipe;
    } else if (mealType === 'dinner') {
      currentMeals.dinner = recipe;
    } else if (mealType === 'snack' && index !== undefined) {
      const newSnacks = [...(currentMeals.snacks || [])];
      newSnacks[index] = recipe;
      currentMeals.snacks = newSnacks;
    }
    
    currentDayData.meals = currentMeals;
    newMealPlan[currentDay] = currentDayData;
    
    // No need to call setMealPlan as it's handled by the hook
  };

  // Get current day's data
  const currentDayData = mealPlan[currentDay];
  const dayTotals = calculateDayTotals();
  const goalExceeds = checkExceedsGoals();

  if (!currentDayData) {
    return <div className="p-4">Loading meal plan...</div>;
  }

  return (
    <div className="pb-20 animate-fade-in">
      <PageHeader 
        onOpenVault={() => handleOpenVault('all')} 
        onOpenWeekOverview={handleOpenWeekOverview} 
      />

      {/* Weekly Calendar Navigation */}
      <DailyNavigationCalendar 
        mealPlan={mealPlan}
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
      />

      {/* Daily Nutrition Card */}
      <DailyNutritionCard 
        dayTotals={dayTotals}
        userGoals={calculateDayTotals()}
        exceedsGoals={goalExceeds}
      />

      {/* Meal Sections */}
      <div className="space-y-6">
        {/* Breakfast */}
        <MealCard 
          title="Breakfast"
          meal={currentDayData.meals.breakfast}
          isLocked={!!lockedMeals[`${currentDay}-breakfast`]}
          toggleLock={() => toggleLockMeal('breakfast')}
          onAddFromVault={() => handleOpenVault('breakfast')}
          onMealClick={handleRecipeClick}
        />
        
        {/* Lunch */}
        <MealCard 
          title="Lunch"
          meal={currentDayData.meals.lunch}
          isLocked={!!lockedMeals[`${currentDay}-lunch`]}
          toggleLock={() => toggleLockMeal('lunch')}
          onAddFromVault={() => handleOpenVault('lunch')}
          onMealClick={handleRecipeClick}
        />
        
        {/* Dinner */}
        <MealCard 
          title="Dinner"
          meal={currentDayData.meals.dinner}
          isLocked={!!lockedMeals[`${currentDay}-dinner`]}
          toggleLock={() => toggleLockMeal('dinner')}
          onAddFromVault={() => handleOpenVault('dinner')}
          onMealClick={handleRecipeClick}
        />
        
        {/* Snacks */}
        <SnacksSection 
          snacks={currentDayData.meals.snacks || [null, null]}
          lockedSnacks={[
            !!lockedMeals[`${currentDay}-snack-0`],
            !!lockedMeals[`${currentDay}-snack-1`]
          ]}
          toggleLockSnack={(index) => toggleLockMeal('snack', index)}
          onAddFromVault={(index) => handleOpenVault('snack', index)}
          onSnackClick={handleRecipeClick}
        />
      </div>

      {/* Bottom Action Buttons */}
      <BottomActionBar 
        onRegenerate={regenerateMeals}
        onSave={handleSavePlan}
        isGenerating={isGenerating}
      />

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

      {/* Week Overview Dialog */}
      <WeekOverviewDialog
        isOpen={isWeekOverviewOpen}
        onClose={() => setIsWeekOverviewOpen(false)}
        mealPlan={mealPlan}
      />

      {/* Recipe Vault Dialog */}
      <RecipeVaultDialog
        isOpen={isRecipeVaultOpen}
        onClose={() => setIsRecipeVaultOpen(false)}
        onSelectRecipe={handleAddFromVault}
        targetMealType={targetMealType}
        targetMealIndex={targetMealIndex}
      />
    </div>
  );
};

export default CreateMealPlanPage;
