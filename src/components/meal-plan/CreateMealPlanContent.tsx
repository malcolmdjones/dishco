
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import SavePlanDialog from '@/components/SavePlanDialog';
import DailyNavigationCalendar from '@/components/meal-plan/DailyNavigationCalendar';
import DailyNutritionCard from '@/components/meal-plan/DailyNutritionCard';
import MealCard from '@/components/meal-plan/MealCard';
import SnacksSection from '@/components/meal-plan/SnacksSection';
import BottomActionBar from '@/components/meal-plan/BottomActionBar';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';

interface CreateMealPlanContentProps {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  mealPlan: any[];
  isGenerating: boolean;
  lockedMeals: {[key: string]: boolean};
  toggleLockMeal: (mealType: string, index?: number) => void;
  regenerateMeals: () => void;
  calculateDayTotals: () => any;
  checkExceedsGoals: () => any;
  onOpenVault?: (mealType: string, index?: number) => void;
}

const CreateMealPlanContent: React.FC<CreateMealPlanContentProps> = ({
  currentDay,
  setCurrentDay,
  mealPlan,
  isGenerating,
  lockedMeals,
  toggleLockMeal,
  regenerateMeals,
  calculateDayTotals,
  checkExceedsGoals,
  onOpenVault
}) => {
  // Local component state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);
  const [isSavePlanDialogOpen, setIsSavePlanDialogOpen] = useState(false);
  
  // Get user goals from the hook
  const { userGoals } = useMealPlanUtils();

  // Handle recipe selection to view details
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  // Save the current meal plan
  const handleSavePlan = () => {
    setIsSavePlanDialogOpen(true);
  };

  // Handle opening the vault for a specific meal
  const handleOpenVault = (mealType: string, index?: number) => {
    if (onOpenVault) {
      onOpenVault(mealType, index);
    }
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
      {/* Weekly Calendar Navigation */}
      <DailyNavigationCalendar 
        mealPlan={mealPlan}
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
      />

      {/* Daily Nutrition Card */}
      <DailyNutritionCard 
        dayTotals={dayTotals}
        userGoals={userGoals}
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
    </div>
  );
};

export default CreateMealPlanContent;
