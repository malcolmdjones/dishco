
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { MealPlan } from '@/hooks/useSavedMealPlans';

interface PlanStartDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  plan: MealPlan | null;
}

const PlanStartDateDialog: React.FC<PlanStartDateDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  plan
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  if (!plan) return null;
  
  const handleConfirm = () => {
    onConfirm(selectedDate);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>When should this plan start?</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="flex items-center mb-4">
            <CalendarIcon className="mr-2 text-green-500" />
            <span>Plan: <strong>{plan.name}</strong></span>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border pointer-events-auto"
            initialFocus
          />
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Starting date: <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanStartDateDialog;
