
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SavePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: any[];
}

const SavePlanDialog: React.FC<SavePlanDialogProps> = ({ isOpen, onClose, mealPlan }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your meal plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const planData = {
        days: mealPlan,
        description: planDescription,
        tags: [] // You could add tags feature in the future
      };

      const { data, error } = await supabase
        .from('saved_meal_plans')
        .insert({
          name: planName,
          plan_data: planData,
          user_id: user?.id
        })
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your meal plan has been saved.",
      });

      // Set the plan as active
      sessionStorage.setItem('activePlan', JSON.stringify({
        ...planData,
        startDay: 0
      }));
      
      // Close the dialog
      onClose();
      
      // Redirect to saved plans page after successful save
      navigate('/saved-plans');
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save your meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Meal Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="plan-name" className="text-sm font-medium">
              Plan Name
            </label>
            <Input
              id="plan-name"
              placeholder="e.g. My Healthy Week, Keto Plan, etc."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="plan-description"
              placeholder="Add notes or details about this meal plan..."
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlanDialog;
