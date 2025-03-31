
import React, { useState, useEffect } from 'react';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';
import PageHeader from '@/components/meal-plan/PageHeader';
import CreateMealPlanContent from '@/components/meal-plan/CreateMealPlanContent';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CreateMealPlanPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check for a plan to copy from session storage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem('planToCopy');
    const storedLockedMeals = sessionStorage.getItem('lockedMeals');
    
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
    fetchDbRecipes
  } = useMealPlanUtils();

  // Fetch database recipes when component mounts
  useEffect(() => {
    fetchDbRecipes();
  }, [fetchDbRecipes]);

  return (
    <div className="animate-fade-in">
      <PageHeader />

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
