
import React from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import PageHeader from '@/components/meal-plan/PageHeader';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';

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

  // Local component state for dialog handling
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = React.useState(false);
  const [isRecipeVaultOpen, setIsRecipeVaultOpen] = React.useState(false);

  // Handle opening the Recipe Vault dialog without a specific meal
  const handleOpenVault = () => {
    setIsRecipeVaultOpen(true);
  };

  // Handle opening the Week Overview dialog
  const handleOpenWeekOverview = () => {
    setIsWeekOverviewOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        onOpenVault={handleOpenVault} 
        onOpenWeekOverview={handleOpenWeekOverview} 
      />

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
      />
    </div>
  );
};

export default CreateMealPlanPage;
