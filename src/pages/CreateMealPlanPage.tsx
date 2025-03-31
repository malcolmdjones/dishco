
import React, { useState, useEffect } from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import PageHeader from '@/components/meal-plan/PageHeader';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageHeaderContent from '@/components/meal-plan/PageHeaderContent';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';

const CreateMealPlanPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Dialog states
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [isRecipeVaultOpen, setIsRecipeVaultOpen] = useState(false);
  
  // Check for a plan to copy from session storage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem('planToCopy');
    const storedLockedMeals = sessionStorage.getItem('lockedMeals');
    
    // Check for activation timestamp
    const planActivatedAt = localStorage.getItem('planActivatedAt');
    if (planActivatedAt) {
      // Force a refresh when navigating to this page
      const now = new Date().toISOString();
      localStorage.setItem('planActivatedAt', now);
    }
    
    if (storedPlan && storedLockedMeals) {
      try {
        // Pass to useMealPlanUtils in a future update
        console.log('Loading copied plan', JSON.parse(storedPlan));
        console.log('Loading locked meals', JSON.parse(storedLockedMeals));
        
        toast({
          title: "Plan Copied",
          description: "You're now editing a copy of your saved meal plan.",
        });
        
        // Clear session storage after loading
        sessionStorage.removeItem('planToCopy');
        sessionStorage.removeItem('lockedMeals');
      } catch (error) {
        console.error('Error parsing copied plan data:', error);
      }
    }
  }, [toast]);

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

  const handleOpenVault = () => {
    setIsRecipeVaultOpen(true);
  };

  const handleOpenWeekOverview = () => {
    setIsWeekOverviewOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <PageHeaderContent 
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
          userGoals={userGoals} 
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
          onSelectRecipe={() => {}}
          targetMealType=""
        />
      </div>
    </div>
  );
};

export default CreateMealPlanPage;
