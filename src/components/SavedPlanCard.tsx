
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trash2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SavedPlanCardProps {
  plan: {
    id: string;
    name: string;
    created_at: string;
    plan_data: any;
  };
  onDelete: (id: string) => void;
}

const SavedPlanCard: React.FC<SavedPlanCardProps> = ({ plan, onDelete }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // Parse plan data
  const planData = plan.plan_data;
  const firstDay = planData.days && planData.days[0];
  const firstDate = firstDay?.date ? new Date(firstDay.date) : new Date();
  
  // Count meals
  let mealCount = 0;
  if (planData.days && Array.isArray(planData.days)) {
    planData.days.forEach((day: any) => {
      if (day.meals) {
        if (day.meals.breakfast) mealCount++;
        if (day.meals.lunch) mealCount++;
        if (day.meals.dinner) mealCount++;
        if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
          day.meals.snacks.forEach((snack: any) => {
            if (snack) mealCount++;
          });
        }
      }
    });
  }

  // Handle activating a plan
  const handleActivate = () => {
    try {
      // Add the plan name and ID to the data
      const activePlanData = {
        ...planData,
        name: plan.name,
        id: plan.id
      };
      
      // Store the complete plan in localStorage
      localStorage.setItem('activePlan', JSON.stringify(activePlanData));
      
      // Also store the full plan object with metadata
      localStorage.setItem('savedMealPlans', JSON.stringify([{
        id: plan.id,
        name: plan.name,
        created_at: plan.created_at,
        plan_data: activePlanData
      }]));
      
      // Force a refresh of other components by setting a timestamp
      localStorage.setItem('planActivatedAt', new Date().toISOString());
      
      toast({
        title: "Plan Activated",
        description: `${plan.name} is now your active meal plan.`,
      });
      
      navigate('/planning');
    } catch (error) {
      console.error('Error activating plan:', error);
      toast({
        title: "Error",
        description: "Failed to activate the meal plan.",
        variant: "destructive"
      });
    }
  };
  
  // Handle copying a plan for editing
  const handleCopy = () => {
    setIsCopying(true);
    
    try {
      // Get the locked meals data (if any)
      const lockedMeals = planData.lockedMeals || {};
      
      // Store in sessionStorage (to be picked up by CreateMealPlanPage)
      sessionStorage.setItem('planToCopy', JSON.stringify(planData));
      sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
      
      toast({
        title: "Plan Copied",
        description: "You can now edit a copy of this meal plan.",
      });
      
      // Navigate to the create meal plan page
      navigate('/create-meal-plan');
    } catch (error) {
      console.error('Error copying plan:', error);
      toast({
        title: "Error",
        description: "Failed to copy the meal plan.",
        variant: "destructive"
      });
      setIsCopying(false);
    }
  };
  
  // Handle deleting a plan
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', plan.id);
      
      if (error) throw error;
      
      // Check if this is the active plan
      const activePlanJson = localStorage.getItem('activePlan');
      if (activePlanJson) {
        const activePlan = JSON.parse(activePlanJson);
        if (activePlan.id === plan.id) {
          // Clear the active plan if it was the one deleted
          localStorage.removeItem('activePlan');
          localStorage.removeItem('savedMealPlans');
        }
      }
      
      // Call the parent component's onDelete callback
      onDelete(plan.id);
      
      toast({
        title: "Plan Deleted",
        description: `${plan.name} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meal plan.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="line-clamp-1">{plan.name}</span>
        </CardTitle>
        <CardDescription className="flex items-center">
          <Calendar size={14} className="mr-1" />
          <span>Created {format(new Date(plan.created_at), 'MMM d, yyyy')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Start Date:</span> {format(firstDate, 'MMM d, yyyy')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Duration:</span> {planData.days?.length || 7} days
          </p>
          <p className="text-sm">
            <span className="font-medium">Total Meals:</span> {mealCount}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="default" 
          onClick={handleActivate}
          className="flex-1 mr-2"
        >
          <Check size={16} className="mr-2" />
          Activate
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleCopy}
          disabled={isCopying}
          className="mr-2"
        >
          <Copy size={16} />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              disabled={isDeleting}
            >
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{plan.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default SavedPlanCard;
