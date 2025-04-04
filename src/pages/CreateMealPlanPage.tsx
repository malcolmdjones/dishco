
import React from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import PageHeader from '@/components/meal-plan/PageHeader';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';
import { Recipe } from '@/data/mockData';

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
  const [targetMealType, setTargetMealType] = React.useState('');
  const [targetMealIndex, setTargetMealIndex] = React.useState<number | undefined>(undefined);

  // Handle opening the Recipe Vault dialog without a specific meal
  const handleOpenVault = () => {
    setTargetMealType('');
    setTargetMealIndex(undefined);
    setIsRecipeVaultOpen(true);
  };

  // Handle opening the Week Overview dialog
  const handleOpenWeekOverview = () => {
    setIsWeekOverviewOpen(true);
  };

  // Handle adding a recipe from the vault to the meal plan
  const handleAddRecipeToMealPlan = (recipe: Recipe, mealType: string, index?: number) => {
    // If no specific meal type is provided from header button, use current day's breakfast as default
    const actualMealType = mealType || 'breakfast';
    const actualIndex = typeof index !== 'undefined' ? index : undefined;
    
    // Clone current meal plan
    const newMealPlan = [...mealPlan];
    const currentDayData = { ...newMealPlan[currentDay] };
    const currentMeals = { ...currentDayData.meals };
    
    // Update based on meal type
    if (actualMealType === 'breakfast') {
      currentMeals.breakfast = recipe;
    } else if (actualMealType === 'lunch') {
      currentMeals.lunch = recipe;
    } else if (actualMealType === 'dinner') {
      currentMeals.dinner = recipe;
    } else if (actualMealType === 'snack' && actualIndex !== undefined) {
      const newSnacks = [...(currentMeals.snacks || [])];
      newSnacks[actualIndex] = recipe;
      currentMeals.snacks = newSnacks;
    }
    
    currentDayData.meals = currentMeals;
    newMealPlan[currentDay] = currentDayData;
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
        onOpenVault={(mealType, index) => {
          setTargetMealType(mealType);
          setTargetMealIndex(index);
          setIsRecipeVaultOpen(true);
        }}
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
        onSelectRecipe={handleAddRecipeToMealPlan}
        targetMealType={targetMealType}
        targetMealIndex={targetMealIndex}
      />
    </div>
  );
};

export default CreateMealPlanPage;
