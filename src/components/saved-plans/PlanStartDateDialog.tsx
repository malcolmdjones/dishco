import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MealPlanType } from '@/types/mealPlan';

interface PlanStartDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  plan: MealPlanType | null;
  activeDates: string[];
  onOverlap: (date: Date) => void;
  onClearDate: (date: Date) => void;
}

const PlanStartDateDialog: React.FC<PlanStartDateDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  plan,
  activeDates,
  onOverlap,
  onClearDate
}) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isDateActive, setIsDateActive] = useState(false);

  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setIsDateActive(activeDates.includes(formattedDate));
    }
  }, [date, activeDates]);

  const handleConfirm = () => {
    if (!date) return;

    const formattedDate = format(date, 'yyyy-MM-dd');
    if (activeDates.includes(formattedDate)) {
      onOverlap(date);
    } else {
      onConfirm(date);
    }
  };

  const handleClearDate = () => {
    if (!date) return;
    onClearDate(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a Start Date</DialogTitle>
          <DialogDescription>
            Select the date you'd like to start this meal plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) =>
              date < startOfDay(new Date())
            }
            className="rounded-md border"
          />
        </div>
        <div className="flex justify-between">
          {isDateActive && (
            <Button variant="destructive" onClick={handleClearDate}>
              <X className="w-4 h-4 mr-2" />
              Clear Date
            </Button>
          )}
          <div className="space-x-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleConfirm}>
              Confirm Date
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanStartDateDialog;
