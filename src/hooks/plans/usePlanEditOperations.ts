
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MealPlan } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';

export const usePlanEditOperations = (
  fetchPlans: () => Promise<void>,
  updatePlan: (id: string, updates: { name?: string; description?: string }) => Promise<boolean | undefined>
) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEditPlan = (
    plan: MealPlan, 
    setEditPlan: (plan: MealPlan) => void,
    setNewPlanName: (name: string) => void,
    setNewPlanDescription: (desc: string) => void,
    setIsEditDialogOpen: (isOpen: boolean) => void
  ) => {
    setEditPlan(plan);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.plan_data?.description || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async (
    editPlan: MealPlan | null,
    newPlanName: string,
    newPlanDescription: string,
    setIsEditDialogOpen: (isOpen: boolean) => void
  ) => {
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

  const handleCopyAndEdit = (plan: MealPlan) => {
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    navigate('/planning');
  };

  return {
    handleEditPlan,
    handleUpdatePlan,
    handleCopyAndEdit
  };
};
