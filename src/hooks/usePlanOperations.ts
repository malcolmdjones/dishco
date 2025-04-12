
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MealPlan, useSavedMealPlans } from './useSavedMealPlans';
import { useToast } from './use-toast';
import { useGroceryListUtils } from './useGroceryListUtils';

export const usePlanOperations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartDateDialogOpen, setIsStartDateDialogOpen] = useState(false);
  
  const [editPlan, setEditPlan] = useState<MealPlan | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { 
    showConfirmation, 
    setShowConfirmation, 
    processMealPlanForGroceries, 
    handleConfirmGroceryAddition, 
    currentMealPlan 
  } = useGroceryListUtils();
  
  const { 
    plans, 
    isLoading,
    isPlanDetailOpen, 
    setIsPlanDetailOpen,
    selectedPlan, 
    setSelectedPlan,
    viewPlanDetails,
    deletePlan,
    updatePlan,
    fetchPlans,
    activatePlan,
    showOverlapWarning,
    setShowOverlapWarning,
    forceActivatePlan,
    cancelActivation,
    pendingActivation,
    getDatesWithActivePlans
  } = useSavedMealPlans();

  const handleEditPlan = (plan: MealPlan) => {
    setEditPlan(plan);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.plan_data?.description || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!editPlan) return;

    try {
      await updatePlan(editPlan.id, { 
        name: newPlanName, 
        description: newPlanDescription 
      });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Meal plan updated successfully."
      });
      await fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleDeletePlan = (id: string) => {
    console.log(`Setting up deletion for plan: ${id}`);
    setDeletePlanId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!deletePlanId) {
      console.error("No plan ID set for deletion");
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`Confirming deletion for plan: ${deletePlanId}`);
      const success = await deletePlan(deletePlanId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Meal plan deleted successfully."
        });
        await fetchPlans();
      } else {
        throw new Error("Failed to delete the meal plan.");
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meal plan.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletePlanId(null);
    }
  };

  const handleCopyAndEdit = (plan: MealPlan) => {
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    navigate('/planning');
  };
  
  const handleUsePlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsStartDateDialogOpen(true);
  };
  
  const handleDateSelected = (date: Date) => {
    setIsStartDateDialogOpen(false);
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
          
          toast({
            title: "Success",
            description: `${pendingActivation.plan.name} has been activated and overlapping plans have been replaced.`,
          });
        } else {
          console.error("Failed to force activate the meal plan");
          toast({
            title: "Error",
            description: "Failed to activate the meal plan. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error during plan activation:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      console.error("No pending activation found when confirming overlap");
    }
  };
  
  return {
    // State
    plans,
    isLoading,
    isPlanDetailOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDeleting,
    isStartDateDialogOpen,
    showConfirmation,
    showOverlapWarning,
    editPlan,
    newPlanName,
    newPlanDescription,
    deletePlanId,
    selectedPlan,
    selectedDate,
    currentMealPlan,
    pendingActivation,
    
    // Methods
    setIsPlanDetailOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStartDateDialogOpen,
    setNewPlanName,
    setNewPlanDescription,
    setShowConfirmation,
    viewPlanDetails,
    fetchPlans,
    handleEditPlan,
    handleUpdatePlan,
    handleDeletePlan,
    confirmDeletePlan,
    handleCopyAndEdit,
    handleUsePlan,
    handleDateSelected,
    handleConfirmOverlap,
    handleConfirmGroceryAddition,
    cancelActivation,
    
    // Additional data
    getDatesWithActivePlans
  };
};
