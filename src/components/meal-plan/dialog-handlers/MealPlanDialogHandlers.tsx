
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import RecipeViewer from '@/components/RecipeViewer';
import SavePlanDialog from '@/components/SavePlanDialog';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';

interface MealPlanDialogHandlersProps {
  mealPlan: any[];
  children: (handlers: {
    handleRecipeClick: (recipe: Recipe) => void;
    handleSavePlan: () => void;
    handleOpenVault: (mealType: string, index?: number) => void;
    handleAddFromVault: (recipe: Recipe, mealType: string, index?: number) => void;
    isRecipeViewerOpen: boolean;
    setIsRecipeViewerOpen: (isOpen: boolean) => void;
    isSavePlanDialogOpen: boolean;
    setIsSavePlanDialogOpen: (isOpen: boolean) => void;
    isWeekOverviewOpen: boolean;
    setIsWeekOverviewOpen: (isOpen: boolean) => void;
    isRecipeVaultOpen: boolean;
    setIsRecipeVaultOpen: (isOpen: boolean) => void;
    selectedRecipe: Recipe | null;
    targetMealType: string;
    targetMealIndex: number | undefined;
  }) => React.ReactNode;
}

const MealPlanDialogHandlers: React.FC<MealPlanDialogHandlersProps> = ({ mealPlan, children }) => {
  // Dialog state
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

  // Add a recipe to the meal plan from the vault
  const handleAddFromVault = (recipe: Recipe, mealType: string, index?: number) => {
    // We'll handle logic in the parent component
  };

  // Render the dialogs and child components with handlers
  return (
    <>
      {children({
        handleRecipeClick,
        handleSavePlan,
        handleOpenVault,
        handleAddFromVault,
        isRecipeViewerOpen,
        setIsRecipeViewerOpen,
        isSavePlanDialogOpen,
        setIsSavePlanDialogOpen,
        isWeekOverviewOpen,
        setIsWeekOverviewOpen,
        isRecipeVaultOpen,
        setIsRecipeVaultOpen,
        selectedRecipe,
        targetMealType,
        targetMealIndex,
      })}

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
    </>
  );
};

export default MealPlanDialogHandlers;
