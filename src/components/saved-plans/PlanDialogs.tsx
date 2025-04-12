
import React from 'react';
import { MealPlan } from '@/hooks/useSavedMealPlans';
import EditPlanDialog from './EditPlanDialog';
import DeletePlanDialog from './DeletePlanDialog';
import MealPlanDetailView from '@/components/MealPlanDetailView';
import PlanStartDateDialog from './PlanStartDateDialog';
import OverlapWarningDialog from '@/components/OverlapWarningDialog';
import GroceryListConfirmationDialog from '@/components/GroceryListConfirmationDialog';

interface PlanDialogsProps {
  // Edit dialog
  isEditDialogOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  editPlan: MealPlan | null;
  planName: string;
  planDescription: string;
  onPlanNameChange: (name: string) => void;
  onPlanDescriptionChange: (description: string) => void;
  onUpdatePlan: () => void;

  // Delete dialog
  isDeleteDialogOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;

  // Detail view
  isPlanDetailOpen: boolean;
  onPlanDetailClose: () => void;
  selectedPlan: MealPlan | null;

  // Start date dialog
  isStartDateDialogOpen: boolean;
  onStartDateOpenChange: (open: boolean) => void;
  onDateConfirm: (date: Date) => void;
  activeDates: {[key: string]: string};

  // Overlap warning dialog
  showOverlapWarning: boolean;
  onConfirmOverlap: () => void;
  onCancelActivation: () => void;
  pendingPlanName: string;

  // Grocery list dialog
  showConfirmation: boolean;
  onConfirmationOpenChange: (open: boolean) => void;
  onConfirmGrocery: () => void;
  onCancelGrocery: () => void;
  mealPlanName: string;
}

const PlanDialogs: React.FC<PlanDialogsProps> = ({
  // Edit dialog props
  isEditDialogOpen,
  onEditOpenChange,
  editPlan,
  planName,
  planDescription,
  onPlanNameChange,
  onPlanDescriptionChange,
  onUpdatePlan,

  // Delete dialog props
  isDeleteDialogOpen,
  onDeleteOpenChange,
  onConfirmDelete,
  isDeleting,

  // Detail view props
  isPlanDetailOpen,
  onPlanDetailClose,
  selectedPlan,

  // Start date dialog props
  isStartDateDialogOpen,
  onStartDateOpenChange,
  onDateConfirm,
  activeDates,

  // Overlap warning dialog props
  showOverlapWarning,
  onConfirmOverlap,
  onCancelActivation,
  pendingPlanName,

  // Grocery list dialog props
  showConfirmation,
  onConfirmationOpenChange,
  onConfirmGrocery,
  onCancelGrocery,
  mealPlanName
}) => {
  return (
    <>
      <EditPlanDialog
        isOpen={isEditDialogOpen}
        onOpenChange={onEditOpenChange}
        plan={editPlan}
        planName={planName}
        planDescription={planDescription}
        onPlanNameChange={onPlanNameChange}
        onPlanDescriptionChange={onPlanDescriptionChange}
        onUpdatePlan={onUpdatePlan}
      />
      
      <DeletePlanDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        onConfirmDelete={onConfirmDelete}
        isDeleting={isDeleting}
      />
      
      <MealPlanDetailView 
        plan={selectedPlan} 
        isOpen={isPlanDetailOpen} 
        onClose={onPlanDetailClose} 
      />
      
      <PlanStartDateDialog
        isOpen={isStartDateDialogOpen}
        onOpenChange={onStartDateOpenChange}
        onConfirm={onDateConfirm}
        plan={selectedPlan}
        activeDates={activeDates}
      />
      
      <OverlapWarningDialog
        isOpen={showOverlapWarning}
        onConfirm={onConfirmOverlap}
        onCancel={onCancelActivation}
        planName={pendingPlanName}
      />
      
      <GroceryListConfirmationDialog
        isOpen={showConfirmation}
        onOpenChange={onConfirmationOpenChange}
        onConfirm={onConfirmGrocery}
        onCancel={onCancelGrocery}
        mealPlanName={mealPlanName}
      />
    </>
  );
};

export default PlanDialogs;
