
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useGroceryListUtils } from '@/hooks/useGroceryListUtils';
import { useSavedMealPlans, MealPlan } from '@/hooks/useSavedMealPlans';

// Extracted components
import SavedPlansHeader from '@/components/saved-plans/SavedPlansHeader';
import PlanCard from '@/components/saved-plans/PlanCard';
import EditPlanDialog from '@/components/saved-plans/EditPlanDialog';
import DeletePlanDialog from '@/components/saved-plans/DeletePlanDialog';
import EmptyPlansState from '@/components/saved-plans/EmptyPlansState';
import GroceryListConfirmationDialog from '@/components/GroceryListConfirmationDialog';
import MealPlanDetailView from '@/components/MealPlanDetailView';

const SavedPlansPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states
  const [editPlan, setEditPlan] = useState<MealPlan | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Use hooks
  const { showConfirmation, setShowConfirmation, processMealPlanForGroceries, handleConfirmGroceryAddition, currentMealPlan } = useGroceryListUtils();
  const { 
    plans, 
    isLoading,
    isPlanDetailOpen, 
    setIsPlanDetailOpen,
    selectedPlan, 
    viewPlanDetails,
    deletePlan: hookDeletePlan,
    updatePlan: hookUpdatePlan,
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
      await hookUpdatePlan(editPlan.id, { 
        name: newPlanName, 
        description: newPlanDescription 
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleDeletePlan = (id: string) => {
    setDeletePlanId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!deletePlanId) return;

    try {
      await hookDeletePlan(deletePlanId);
      setIsDeleteDialogOpen(false);
      setDeletePlanId(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meal plan.",
        variant: "destructive"
      });
    }
  };

  const handleCopyAndEdit = (plan: MealPlan) => {
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    navigate('/planning');
  };
  
  const handleUsePlan = (plan: MealPlan) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      sessionStorage.setItem('activatePlanDate', formattedDate);
      sessionStorage.setItem('activatePlanData', JSON.stringify(plan));
      
      processMealPlanForGroceries(plan);
      setShowConfirmation(false);
      navigate('/grocery');
    } else {
      toast({
        title: "Select Date",
        description: "Please select a date to activate the plan.",
      });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="col-span-3 flex justify-center py-12">
          <p>Loading your meal plans...</p>
        </div>
      );
    }

    if (plans.length === 0) {
      return <EmptyPlansState />;
    }

    return plans.map((plan) => (
      <PlanCard
        key={plan.id}
        plan={plan}
        selectedDate={selectedDate}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
        onViewDetails={viewPlanDetails}
        onCopyAndEdit={handleCopyAndEdit}
        onAddToGrocery={processMealPlanForGroceries}
        onUsePlan={handleUsePlan}
      />
    ));
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <SavedPlansHeader title="Saved Meal Plans" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderContent()}
      </div>

      <EditPlanDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        plan={editPlan}
        planName={newPlanName}
        planDescription={newPlanDescription}
        onPlanNameChange={setNewPlanName}
        onPlanDescriptionChange={setNewPlanDescription}
        onUpdatePlan={handleUpdatePlan}
      />
      
      <DeletePlanDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDeletePlan}
      />
      
      <MealPlanDetailView 
        plan={selectedPlan} 
        isOpen={isPlanDetailOpen} 
        onClose={() => setIsPlanDetailOpen(false)} 
      />
      
      <GroceryListConfirmationDialog
        isOpen={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmGroceryAddition}
        onCancel={() => setShowConfirmation(false)}
        mealPlanName={currentMealPlan?.name || 'your meal plan'}
      />
    </div>
  );
};

export default SavedPlansPage;
