
import { useState } from 'react';
import { MealPlan, useSavedMealPlans } from '@/hooks/useSavedMealPlans';
import { usePlanDialogState } from './plans/usePlanDialogState';
import { usePlanEditOperations } from './plans/usePlanEditOperations';
import { usePlanDeleteOperations } from './plans/usePlanDeleteOperations';
import { usePlanActivationOperations } from './plans/usePlanActivationOperations';

export const usePlanOperations = () => {
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false);
  
  const { 
    plans, 
    isLoading,
    selectedPlan, 
    setSelectedPlan,
    fetchPlans,
    deletePlan,
    updatePlan,
    viewPlanDetails,
    activatePlan,
    showOverlapWarning,
    setShowOverlapWarning,
    forceActivatePlan,
    cancelActivation,
    pendingActivation,
    getDatesWithActivePlans
  } = useSavedMealPlans();

  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editPlan,
    setEditPlan,
    newPlanName,
    setNewPlanName,
    newPlanDescription,
    setNewPlanDescription,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    setIsDeleting,
    deletePlanId,
    setDeletePlanId,
    isStartDateDialogOpen,
    setIsStartDateDialogOpen,
    selectedDate,
    setSelectedDate
  } = usePlanDialogState();

  // Convert updatePlan (Promise<void>) to updatePlanWithResult (Promise<boolean>)
  const updatePlanWithResult = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      await updatePlan(id, updates);
      return true; // If the function completes without throwing an error, return true
    } catch (error) {
      console.error('Error updating plan with result:', error);
      return false;
    }
  };

  const {
    handleEditPlan: handleEditPlanBase,
    handleUpdatePlan: handleUpdatePlanBase,
    handleCopyAndEdit
  } = usePlanEditOperations(fetchPlans, updatePlanWithResult);

  const {
    handleDeletePlan: handleDeletePlanBase,
    confirmDeletePlan: confirmDeletePlanBase
  } = usePlanDeleteOperations(deletePlan);

  const {
    handleUsePlan,
    handleDateSelected,
    handleConfirmOverlap,
    handleConfirmGroceryAddition,
    showConfirmation,
    setShowConfirmation,
    currentMealPlan
  } = usePlanActivationOperations(
    [],
    activatePlan,
    forceActivatePlan,
    cancelActivation,
    fetchPlans,
    setSelectedPlan,
    setIsStartDateDialogOpen,
    pendingActivation
  );

  // Create wrapper functions to provide the necessary state setters
  const handleEditPlan = (plan: MealPlan) => {
    handleEditPlanBase(
      plan,
      setEditPlan,
      setNewPlanName,
      setNewPlanDescription,
      setIsEditDialogOpen
    );
  };

  const handleUpdatePlan = async () => {
    await handleUpdatePlanBase(
      editPlan,
      newPlanName,
      newPlanDescription,
      setIsEditDialogOpen
    );
  };

  const handleDeletePlan = (id: string) => {
    handleDeletePlanBase(
      id,
      setDeletePlanId,
      setIsDeleteDialogOpen
    );
  };

  const confirmDeletePlan = async () => {
    await confirmDeletePlanBase(
      deletePlanId,
      setIsDeleting,
      setIsDeleteDialogOpen,
      setDeletePlanId,
      fetchPlans
    );
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
