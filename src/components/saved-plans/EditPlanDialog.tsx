
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MealPlanType } from '@/types/mealPlan';

interface EditPlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MealPlanType | null;
  planName: string;
  planDescription: string;
  onPlanNameChange: (name: string) => void;
  onPlanDescriptionChange: (description: string) => void;
  onUpdatePlan: () => void;
}

const EditPlanDialog: React.FC<EditPlanDialogProps> = ({
  isOpen,
  onOpenChange,
  planName,
  planDescription,
  onPlanNameChange,
  onPlanDescriptionChange,
  onUpdatePlan
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Meal Plan</DialogTitle>
          <DialogDescription>
            Update the name and description of your saved meal plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-right inline-block">Plan name</label>
            <Input
              id="name"
              value={planName}
              onChange={(e) => onPlanNameChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-right inline-block">Description</label>
            <Textarea
              id="description"
              value={planDescription}
              onChange={(e) => onPlanDescriptionChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={onUpdatePlan}>Update Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanDialog;
