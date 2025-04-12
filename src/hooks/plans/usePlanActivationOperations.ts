
import { format } from 'date-fns';
import { MealPlan } from '@/types/mealPlanTypes';
import { useGroceryListUtils } from '@/hooks/useGroceryListUtils';

export const usePlanActivationOperations = (
  activePlans: any[],
  activatePlan: (plan: MealPlan, startDay: number, force?: boolean) => boolean,
  forceActivatePlan: () => boolean,
  cancelActivation: () => void,
  fetchPlans: () => Promise<void>,
  setSelectedPlan: (plan: MealPlan | null) => void,
  setIsStartDateDialogOpen: (isOpen: boolean) => void,
  pendingActivation: any
) => {
  const { 
    showConfirmation, 
    setShowConfirmation, 
    processMealPlanForGroceries, 
    handleConfirmGroceryAddition, 
    currentMealPlan 
  } = useGroceryListUtils();

  const handleUsePlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsStartDateDialogOpen(true);
  };
  
  const handleDateSelected = (date: Date) => {
    setIsStartDateDialogOpen(false);
    const selectedPlan = pendingActivation?.plan;
    
    if (selectedPlan) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.round((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
      
      console.log(`Activating plan with start day offset: ${dayDiff}`);
      
      const activated = activatePlan(selectedPlan, dayDiff);
      
      if (activated) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        sessionStorage.setItem('activatePlanDate', formattedDate);
        sessionStorage.setItem('activatePlanData', JSON.stringify(selectedPlan));
        
        processMealPlanForGroceries(selectedPlan);
        setShowConfirmation(true);
      }
    }
  };
  
  const handleConfirmOverlap = () => {
    console.log("Confirming overlap with pendingActivation:", pendingActivation);
    if (pendingActivation) {
      console.log("Attempting to force activate plan:", pendingActivation.plan.name);
      try {
        const success = forceActivatePlan();
        console.log("Force activate result:", success);
        
        if (success) {
          const formattedDate = format(new Date(pendingActivation.startDate), 'yyyy-MM-dd');
          sessionStorage.setItem('activatePlanDate', formattedDate);
          sessionStorage.setItem('activatePlanData', JSON.stringify(pendingActivation.plan));
          
          processMealPlanForGroceries(pendingActivation.plan);
          setShowConfirmation(true);
          
          fetchPlans();
        }
      } catch (error) {
        console.error("Error during plan activation:", error);
      }
    } else {
      console.error("No pending activation found when confirming overlap");
    }
  };

  return {
    handleUsePlan,
    handleDateSelected,
    handleConfirmOverlap,
    handleConfirmGroceryAddition,
    showConfirmation,
    setShowConfirmation,
    currentMealPlan
  };
};
