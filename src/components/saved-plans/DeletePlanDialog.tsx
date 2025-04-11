
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DeletePlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  isDeleting
}) => {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onConfirmDelete();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this meal plan? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-between sm:justify-between mt-4">
          <AlertDialogCancel 
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Plan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlanDialog;
