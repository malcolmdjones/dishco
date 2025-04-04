
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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

  const handleSave = async () => {
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
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to save meal plans.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Prepare data with additional metadata
      const planData = {
        days: mealPlan,
        description: description.trim(),
        tags: ['auto-generated'],
        created_at: new Date().toISOString()
      };
      
      // Insert with user_id from session
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .insert([{ 
          name: planName.trim(),
          plan_data: planData,
          user_id: session.user.id
        }]);
      
      if (error) {
        console.error('Error saving meal plan:', error);
        throw error;
      }
      
      toast({
        title: "Plan Saved",
        description: "Your meal plan has been saved successfully.",
      });
      
      // Reset form
      setPlanName('');
      setDescription('');
      
      onClose();
      navigate('/saved-plans');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your meal plan. Please try again.",
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
