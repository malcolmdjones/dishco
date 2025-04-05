
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import PageHeader from '@/components/meal-plan/PageHeader';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';

const CreateMealPlanPage = () => {
  const navigate = useNavigate();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [currentVaultMealType, setCurrentVaultMealType] = useState('');
  const [currentVaultIndex, setCurrentVaultIndex] = useState<number | undefined>(undefined);
  
  const {
    currentDay,
    setCurrentDay,
    mealPlan,
    userGoals,
    isGenerating,
    lockedMeals,
    aiReasoning,
    regenerateMeals,
    toggleLockMeal,
    updateMeal,
    calculateDayTotals,
    checkExceedsGoals,
    preferences
  } = useMealPlanUtils();

  const handleOpenVault = (mealType: string, index?: number) => {
    setCurrentVaultMealType(mealType);
    setCurrentVaultIndex(index);
    setIsVaultOpen(true);
  };

  const handleSelectedRecipe = (recipe: any | null) => {
    updateMeal(currentVaultMealType, recipe, currentVaultIndex);
    setIsVaultOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Create Meal Plan"
        showWeekViewButton
        showBackButton
        onBackClick={() => navigate('/planning')}
        onWeekViewClick={() => setIsWeekOverviewOpen(true)}
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
        updateMeal={updateMeal}
        userGoals={userGoals}
        preferences={preferences}
      />

      {/* Recipe Vault Dialog */}
      <RecipeVaultDialog 
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onSelectRecipe={handleSelectedRecipe}
        mealType={currentVaultMealType}
      />

      {/* Week Overview Dialog */}
      <WeekOverviewDialog 
        isOpen={isWeekOverviewOpen}
        onClose={() => setIsWeekOverviewOpen(false)}
        mealPlan={mealPlan}
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
      />

      {/* AI Reasoning Sheet */}
      <Sheet open={!!aiReasoning} onOpenChange={() => {}}>
        <SheetContent side="bottom" className="h-[50vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AI's Meal Plan Reasoning</h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {}}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="prose max-w-none">
            <p>{aiReasoning}</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CreateMealPlanPage;
