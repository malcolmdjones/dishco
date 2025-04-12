
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OverlapWarningDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  planName: string;
}

const OverlapWarningDialog: React.FC<OverlapWarningDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  planName
}) => {
  const handleConfirm = (event: React.MouseEvent) => {
    // Prevent any default actions
    event.preventDefault();
    event.stopPropagation();
    
    console.log("OverlapWarningDialog: handleConfirm called - executing onConfirm callback");
    
    // Execute the confirmation callback
    onConfirm();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          console.log("Dialog closing via onOpenChange");
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Meal Plan Overlap Detected
          </DialogTitle>
          <DialogDescription>
            Activating "{planName}" will replace your existing meal plan(s) for the selected dates.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <p className="text-sm text-gray-600">
            This action will overwrite any currently active meal plans for the selected dates.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Go Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            type="button"
            className="focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Replace existing plan"
          >
            Replace Existing Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OverlapWarningDialog;
