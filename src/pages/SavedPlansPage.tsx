
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
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
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    updatePlan: hookUpdatePlan, // This now correctly references the updatePlan function 
    fetchPlans
  } = useSavedMealPlans();

  // Re-fetch plans when the page loads
  useEffect(() => {
    fetchPlans();
  }, []);

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
      toast({
        title: "Success",
        description: "Meal plan updated successfully."
      });
      // Refresh the plans after update
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
      const success = await hookDeletePlan(deletePlanId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Meal plan deleted successfully."
        });
        
        // Force refresh of plans after successful deletion
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
        <div className="flex justify-center py-12">
          <p>Loading your meal plans...</p>
        </div>
      );
    }

    if (plans.length === 0) {
      return <EmptyPlansState />;
    }

    return (
      <>
        <Link to="/planning" className="block mb-6">
          <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Plus className="text-green-500 mr-2" />
            <span className="text-lg">Create a new meal plan</span>
          </div>
        </Link>
        
        {plans.map((plan) => (
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
        ))}
      </>
    );
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <SavedPlansHeader title="Saved Plans" />
      
      <div className="max-w-3xl mx-auto">
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
        isDeleting={isDeleting}
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
