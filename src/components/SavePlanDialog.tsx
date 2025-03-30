
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SavePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: any;
}

const SavePlanDialog: React.FC<SavePlanDialogProps> = ({ isOpen, onClose, mealPlan }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your meal plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare the plan data
      const planData = {
        name: planName,
        plan: mealPlan,
        description: `${format(new Date(), 'MMM d')} - ${format(new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}`,
      };

      // Save to Supabase
      const { error } = await supabase
        .from('saved_meal_plans')
        .insert([{
          name: planName,
          plan_data: planData
        }]);

      if (error) {
        console.error('Error saving meal plan:', error);
        toast({
          title: "Error",
          description: "There was a problem saving your meal plan. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Plan Saved",
        description: "Your meal plan has been saved successfully.",
      });

      // Close dialog and navigate to saved plans
      onClose();
      navigate('/saved-plans');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Meal Plan</DialogTitle>
          <DialogDescription>
            Give your meal plan a name to save it for later.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              placeholder="e.g., Clean Eating Week"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <h3 className="text-sm font-medium mb-2">Week Overview</h3>
            <div className="text-sm text-dishco-text-light">
              {format(new Date(), 'MMM d')} - {format(new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
            </div>
            <p className="text-xs mt-2">
              This plan includes {mealPlan.length} days of meals with all your customizations.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !planName.trim()}>
              {loading ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlanDialog;
