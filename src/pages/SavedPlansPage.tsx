
import React, { useEffect } from 'react';
import { usePlanOperations } from '@/hooks/usePlanOperations';
import SavedPlansHeader from '@/components/saved-plans/SavedPlansHeader';
import PlansDisplay from '@/components/saved-plans/PlansDisplay';
import PlanDialogs from '@/components/saved-plans/PlanDialogs';

const SavedPlansPage: React.FC = () => {
  const {
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
  } = usePlanOperations();

  useEffect(() => {
    fetchPlans();
  }, []);

  const activeDates = getDatesWithActivePlans();
  
  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <SavedPlansHeader title="Saved Plans" />
      
      <div className="max-w-3xl mx-auto">
        <PlansDisplay
          plans={plans}
          isLoading={isLoading}
          selectedDate={selectedDate}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onViewDetails={(plan) => {
            setIsPlanDetailOpen(true);
            handleEditPlan(plan);
          }}
          onCopyAndEdit={handleCopyAndEdit}
          onAddToGrocery={() => {}}
          onUsePlan={handleUsePlan}
        />
      </div>

      <PlanDialogs
        // Edit dialog props
        isEditDialogOpen={isEditDialogOpen}
        onEditOpenChange={setIsEditDialogOpen}
        editPlan={editPlan}
        planName={newPlanName}
        planDescription={newPlanDescription}
        onPlanNameChange={setNewPlanName}
        onPlanDescriptionChange={setNewPlanDescription}
        onUpdatePlan={handleUpdatePlan}

        // Delete dialog props
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDeletePlan}
        isDeleting={isDeleting}

        // Detail view props
        isPlanDetailOpen={isPlanDetailOpen}
        onPlanDetailClose={() => setIsPlanDetailOpen(false)}
        selectedPlan={selectedPlan}

        // Start date dialog props
        isStartDateDialogOpen={isStartDateDialogOpen}
        onStartDateOpenChange={setIsStartDateDialogOpen}
        onDateConfirm={handleDateSelected}
        activeDates={activeDates}

        // Overlap warning dialog props
        showOverlapWarning={showOverlapWarning}
        onConfirmOverlap={handleConfirmOverlap}
        onCancelActivation={cancelActivation}
        pendingPlanName={pendingActivation?.plan.name || 'this meal plan'}

        // Grocery list dialog props
        showConfirmation={showConfirmation}
        onConfirmationOpenChange={setShowConfirmation}
        onConfirmGrocery={handleConfirmGroceryAddition}
        onCancelGrocery={() => setShowConfirmation(false)}
        mealPlanName={currentMealPlan?.name || 'your meal plan'}
      />
    </div>
  );
};

export default SavedPlansPage;
