
import { useToast } from '@/hooks/use-toast';

export const usePlanDeleteOperations = (
  deletePlan: (id: string) => Promise<boolean>
) => {
  const { toast } = useToast();
  
  const handleDeletePlan = (
    id: string,
    setDeletePlanId: (id: string | null) => void,
    setIsDeleteDialogOpen: (isOpen: boolean) => void
  ) => {
    console.log(`Setting up deletion for plan: ${id}`);
    setDeletePlanId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async (
    deletePlanId: string | null,
    setIsDeleting: (isDeleting: boolean) => void,
    setIsDeleteDialogOpen: (isOpen: boolean) => void,
    setDeletePlanId: (id: string | null) => void,
    fetchPlans: () => Promise<void>
  ) => {
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

  return {
    handleDeletePlan,
    confirmDeletePlan
  };
};
