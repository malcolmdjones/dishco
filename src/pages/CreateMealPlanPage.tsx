
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

const CreateMealPlanPage = () => {
  // Use our custom hook for meal plan logic
  const {
    currentDay,
    setCurrentDay,
    mealPlan,
    isGenerating,
    lockedMeals,
    aiReasoning,
    toggleLockMeal,
    regenerateMeals,
    calculateDayTotals,
    checkExceedsGoals
  } = useMealPlanUtils();

  // Local component state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSavePlanDialogOpen, setIsSavePlanDialogOpen] = useState(false);

  // Handle recipe selection to view details
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  // Save the current meal plan
  const handleSavePlan = () => {
    setIsSavePlanDialogOpen(true);
  };

  // Placeholder for the Add from Vault functionality
  const handleAddFromVault = (mealType: string, index?: number) => {
    // This would be implemented in a future feature
    console.log(`Add from vault for ${mealType}${index !== undefined ? ` ${index}` : ''}`);
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
      <PageHeader />

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
        aiReasoning={aiReasoning}
      />

      {/* Meal Sections */}
      <div className="space-y-6">
        {/* Breakfast */}
        <MealCard 
          title="Breakfast"
          meal={currentDayData.meals.breakfast}
          isLocked={!!lockedMeals[`${currentDay}-breakfast`]}
          toggleLock={() => toggleLockMeal('breakfast')}
          onAddFromVault={() => handleAddFromVault('breakfast')}
          onMealClick={handleRecipeClick}
        />
        
        {/* Lunch */}
        <MealCard 
          title="Lunch"
          meal={currentDayData.meals.lunch}
          isLocked={!!lockedMeals[`${currentDay}-lunch`]}
          toggleLock={() => toggleLockMeal('lunch')}
          onAddFromVault={() => handleAddFromVault('lunch')}
          onMealClick={handleRecipeClick}
        />
        
        {/* Dinner */}
        <MealCard 
          title="Dinner"
          meal={currentDayData.meals.dinner}
          isLocked={!!lockedMeals[`${currentDay}-dinner`]}
          toggleLock={() => toggleLockMeal('dinner')}
          onAddFromVault={() => handleAddFromVault('dinner')}
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
          onAddFromVault={(index) => handleAddFromVault('snack', index)}
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
    </div>
  );
};

export default CreateMealPlanPage;
