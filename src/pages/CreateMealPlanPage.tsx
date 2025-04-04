
import React, { useState } from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import PageHeader from '@/components/meal-plan/PageHeader';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';
import { Recipe } from '@/data/mockData';
import RecipeDetailHandler from '@/components/meal-plan/meal-sections/recipe-dialog/RecipeDetailHandler';

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
    updateMeal,
    calculateDayTotals,
    checkExceedsGoals
  } = useMealPlanUtils();

  // Local component state for dialog handling
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [isRecipeVaultOpen, setIsRecipeVaultOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState('');
  const [targetMealIndex, setTargetMealIndex] = useState<number | undefined>(undefined);
  
  // Recipe detail dialog state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

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
  
  // Handle opening recipe details
  const handleOpenRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeDetailOpen(true);
  };
  
  // Handle closing recipe details
  const handleCloseRecipeDetail = () => {
    setIsRecipeDetailOpen(false);
    setSelectedRecipe(null);
  };
  
  // Handle save toggling for recipes
  const handleToggleSave = async (recipeId: string, isSaved: boolean) => {
    console.log(`${isSaved ? 'Saved' : 'Unsaved'} recipe with id: ${recipeId}`);
    // In a real app, we would update the database here
  };

  // Handle adding a recipe from the vault to the meal plan
  const handleAddRecipeToMealPlan = (recipe: Recipe, mealType: string, index?: number) => {
    // If no specific meal type is provided from header button, use breakfast as default
    // and always add as the first item
    const actualMealType = mealType || 'breakfast';
    const actualIndex = typeof index !== 'undefined' ? index : 0;
    
    // Use the updateMeal function to update the meal plan
    updateMeal(actualMealType, recipe, actualIndex);
    
    // Close the dialog after adding the recipe
    setIsRecipeVaultOpen(false);
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
        updateMeal={updateMeal}
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
      
      {/* Recipe Detail Handler */}
      <RecipeDetailHandler
        selectedRecipe={selectedRecipe}
        isRecipeDetailOpen={isRecipeDetailOpen}
        handleCloseRecipeDetail={handleCloseRecipeDetail}
        handleToggleSave={handleToggleSave}
      />
    </div>
  );
};

export default CreateMealPlanPage;
