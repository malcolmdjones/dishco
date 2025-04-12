import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGroceryListUtils } from '@/hooks/useGroceryListUtils';
import { useSavedMealPlans, MealPlan } from '@/hooks/useSavedMealPlans';

import SavedPlansHeader from '@/components/saved-plans/SavedPlansHeader';
import PlanCard from '@/components/saved-plans/PlanCard';
import EditPlanDialog from '@/components/saved-plans/EditPlanDialog';
import DeletePlanDialog from '@/components/saved-plans/DeletePlanDialog';
import EmptyPlansState from '@/components/saved-plans/EmptyPlansState';
import GroceryListConfirmationDialog from '@/components/GroceryListConfirmationDialog';
import MealPlanDetailView from '@/components/MealPlanDetailView';
import PlanStartDateDialog from '@/components/saved-plans/PlanStartDateDialog';
import OverlapWarningDialog from '@/components/OverlapWarningDialog';

const SavedPlansPage = () => {
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
    console.log("handleUsePlan called with plan:", plan.name);
    setSelectedPlan(plan);
    setIsStartDateDialogOpen(true);
  };
  
  const handleDateSelected = (date: Date) => {
    console.log("handleDateSelected called with date:", date);
    setIsStartDateDialogOpen(false);
    if (selectedPlan) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.round((date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
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
  
  const handleOverlapDetected = (date: Date) => {
    console.log("Overlap detected for date:", date);
    if (selectedPlan) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.round((date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
      console.log(`Setting up pending activation with start day offset: ${dayDiff}`);
      
      setPendingActivation({
        plan: selectedPlan,
        startDay: dayDiff,
        startDate: date.toISOString()
      });
      
      setShowOverlapWarning(true);
    }
  };
  
  const handleConfirmOverlap = () => {
    console.log("SavedPlansPage: handleConfirmOverlap called with pendingActivation:", pendingActivation);
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

          setShowOverlapWarning(false);
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
      toast({
        title: "Error",
        description: "No meal plan found to activate. Please try again.",
        variant: "destructive"
      });
    }
    
    setShowOverlapWarning(false);
  };
  
  const activeDates = getDatesWithActivePlans();
  
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
      
      <PlanStartDateDialog
        isOpen={isStartDateDialogOpen}
        onOpenChange={setIsStartDateDialogOpen}
        onConfirm={handleDateSelected}
        plan={selectedPlan}
        activeDates={activeDates}
        onOverlap={handleOverlapDetected}
      />
      
      <OverlapWarningDialog
        isOpen={showOverlapWarning}
        onConfirm={handleConfirmOverlap}
        onCancel={cancelActivation}
        planName={pendingActivation?.plan.name || 'this meal plan'}
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
