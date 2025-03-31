
import React, { useState, useEffect } from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import PageHeader from '@/components/meal-plan/PageHeader';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';

const CreateMealPlanPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [isRecipeVaultOpen, setIsRecipeVaultOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState('');
  const [targetMealIndex, setTargetMealIndex] = useState<number | undefined>(undefined);
  
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
    checkExceedsGoals,
    fetchDbRecipes,
    userGoals
  } = useMealPlanUtils();

  // Fetch database recipes when component mounts
  useEffect(() => {
    fetchDbRecipes();
  }, [fetchDbRecipes]);

  // Handle opening the Recipe Vault dialog
  const handleOpenVault = (mealType: string, index?: number) => {
    setTargetMealType(mealType);
    setTargetMealIndex(index);
    setIsRecipeVaultOpen(true);
  };

  // Add a recipe to the meal plan from the vault
  const handleAddFromVault = (recipe: any, mealType: string, index?: number) => {
    console.log('Adding recipe from vault:', recipe, mealType, index);
    // Implementation handled by CreateMealPlanContent
  };

  return (
    <div className="container mx-auto max-w-4xl pb-20 pt-4 animate-fade-in">
      <PageHeader 
        onOpenVault={() => setIsRecipeVaultOpen(true)}
        onOpenWeekOverview={() => setIsWeekOverviewOpen(true)}
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
        onOpenVault={handleOpenVault}
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
