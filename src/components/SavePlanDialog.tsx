
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface SavePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: any[];
}

const SavePlanDialog: React.FC<SavePlanDialogProps> = ({ isOpen, onClose, mealPlan }) => {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save meal plans.",
        variant: "destructive"
      });
      return;
    }

    if (!planName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your meal plan.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const planData = {
        days: mealPlan,
        description: description.trim()
      };
      
      const { error } = await supabase
        .from('saved_meal_plans')
        .insert([{ 
          name: planName.trim(),
          plan_data: planData,
          user_id: user.id
        }]);
      
      if (error) {
        console.error('Error saving meal plan:', error);
        toast({
          title: "Save Failed",
          description: error.message || "There was an error saving your meal plan.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Plan Saved",
        description: "Your meal plan has been saved successfully.",
      });
      
      onClose();
      navigate('/saved-plans');
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Save Failed",
        description: error.message || "There was an error saving your meal plan.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Meal Plan</DialogTitle>
          <DialogDescription>
            Give your meal plan a name and optional description to save it for later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              placeholder="e.g., My Weekly Plan, Keto Plan"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="plan-description">Description (Optional)</Label>
            <Textarea
              id="plan-description"
              placeholder="Add notes about this meal plan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlanDialog;
