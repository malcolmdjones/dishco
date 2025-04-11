
// Import necessary libraries and components
import React from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';
import { useRecipeVault } from '@/hooks/useRecipeVault';
import { Recipe } from '@/types/MealPlan';
import { convertToMockDataRecipe } from '@/utils/typeUtils';

const PlanningPage = () => {
  const [isOverviewOpen, setIsOverviewOpen] = React.useState(false);
  const [isVaultOpen, setIsVaultOpen] = React.useState(false);
  const [currentMealType, setCurrentMealType] = React.useState<string>("");
  const [currentMealIndex, setCurrentMealIndex] = React.useState<number | undefined>(undefined);
  
  // Get meal plan state and functions
  const {
    currentDay,
    setCurrentDay,
    mealPlan,
    userGoals,
    isGenerating,
    lockedMeals,
    regenerateMeals,
    toggleLockMeal,
    updateMeal,
    calculateDayTotals,
    checkExceedsGoals,
    preferences
  } = useMealPlanUtils();

  // Get recipe vault functionality
  const { getRecipesByType, isRecipeSaved } = useRecipeVault();
  
  // Check if there's an active plan
  const { activePlan } = useSavedMealPlans();
  const hasActivePlan = Boolean(activePlan);

  // Handle opening the recipe vault
  const handleOpenVault = (mealType: string, index?: number) => {
    setCurrentMealType(mealType);
    setCurrentMealIndex(index);
    setIsVaultOpen(true);
  };

  // Add recipe from vault to meal plan
  const handleAddRecipeFromVault = (recipe: Recipe) => {
    // Convert to MockData Recipe type as needed by updateMeal
    const convertedRecipe = convertToMockDataRecipe(recipe);
    updateMeal(currentMealType, convertedRecipe, currentMealIndex);
    setIsVaultOpen(false);
  };

  return (
    <div>
      <CreateMealPlanContent
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
        mealPlan={mealPlan}
        isGenerating={isGenerating}
        lockedMeals={lockedMeals}
        toggleLockMeal={toggleLockMeal}
        regenerateMeals={regenerateMeals}
        calculateDayTotals={calculateDayTotals}
        checkExceedsGoals={checkExceedsGoals}
        onOpenVault={handleOpenVault}
        updateMeal={updateMeal}
        userGoals={userGoals}
        preferences={preferences}
      />

      <WeekOverviewDialog
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        mealPlan={mealPlan}
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
      />

      <RecipeVaultDialog
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        mealType={currentMealType}
        onSelectRecipe={handleAddRecipeFromVault}
        isRecipeSaved={isRecipeSaved}
      />
    </div>
  );
};

export default PlanningPage;
