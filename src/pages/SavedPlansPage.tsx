import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, Calendar as CalendarIcon, Pencil, Trash, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MealPlanDetailView from '@/components/MealPlanDetailView';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as ReactCalendar } from '@/components/ui/calendar';
import { useGroceryListUtils } from '@/hooks/useGroceryListUtils';
import GroceryListConfirmationDialog from '@/components/GroceryListConfirmationDialog';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';

const SavedPlansPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { showConfirmation, setShowConfirmation, processMealPlanForGroceries, handleConfirmGroceryAddition, currentMealPlan } = useGroceryListUtils();
  
  const { 
    plans, 
    isLoading,
    isPlanDetailOpen, 
    setIsPlanDetailOpen,
    selectedPlan, 
    deletePlan: hookDeletePlan,
    updatePlan: hookUpdatePlan,
    viewPlanDetails,
    fetchPlans
  } = useSavedMealPlans();

  const handleEditPlan = (plan) => {
    setEditPlan(plan);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.plan_data?.description || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!editPlan) return;

    try {
      await hookUpdatePlan(editPlan.id, { 
        name: newPlanName, 
        description: newPlanDescription 
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleDeletePlan = (id) => {
    setDeletePlanId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!deletePlanId) return;

    try {
      await hookDeletePlan(deletePlanId);
      setIsDeleteDialogOpen(false);
      setDeletePlanId(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meal plan.",
        variant: "destructive"
      });
    }
  };

  const handleViewPlanDetails = (plan) => {
    console.log('Viewing plan details:', plan);
    setSelectedPlan(plan);
    setIsPlanDetailOpen(true);
  };

  const handleCopyAndEdit = (plan) => {
    sessionStorage.setItem('planToCopy', JSON.stringify(plan));
    navigate('/planning');
  };
  
  const handleUsePlan = (plan) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      sessionStorage.setItem('activatePlanDate', formattedDate);
      sessionStorage.setItem('activatePlanData', JSON.stringify(plan));
      setIsCalendarOpen(false);
      
      processMealPlanForGroceries(plan);
      
      setShowConfirmation(false);
      navigate('/grocery');
    } else {
      toast({
        title: "Select Date",
        description: "Please select a date to activate the plan.",
      });
    }
  };
  
  const handleConfirmGrocery = () => {
    handleConfirmGroceryAddition();
  };
  
  const handleSkipGrocery = () => {
    setShowConfirmation(false);
    navigate('/planning');
  };

  const calculateTotalCalories = (days) => {
    if (!days || !Array.isArray(days)) return 0;
    
    let total = 0;
    days.forEach(day => {
      if (!day || !day.meals) return;
      
      const breakfast = day.meals.breakfast;
      if (Array.isArray(breakfast) && breakfast.length > 0) {
        total += breakfast[0]?.macros?.calories || 0;
      } else if (breakfast?.macros) {
        total += breakfast.macros.calories || 0;
      }
      
      const lunch = day.meals.lunch;
      if (Array.isArray(lunch) && lunch.length > 0) {
        total += lunch[0]?.macros?.calories || 0;
      } else if (lunch?.macros) {
        total += lunch.macros.calories || 0;
      }
      
      const dinner = day.meals.dinner;
      if (Array.isArray(dinner) && dinner.length > 0) {
        total += dinner[0]?.macros?.calories || 0;
      } else if (dinner?.macros) {
        total += dinner.macros.calories || 0;
      }
      
      const snacks = day.meals.snacks;
      if (Array.isArray(snacks)) {
        snacks.forEach(snack => {
          total += snack?.macros?.calories || 0;
        });
      }
    });
    return Math.round(total / (days.length || 1));
  };

  const renderCards = () => {
    if (plans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-dishco-text-light">
          <CalendarIcon size={48} className="mb-4" />
          <p>No saved meal plans yet.</p>
        </div>
      );
    }

    return plans.map((plan) => {
      const planData = plan.plan_data || {};
      const days = planData.days || [];
      
      return (
        <Card key={plan.id} className="relative overflow-hidden animate-fade-in">
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleEditPlan(plan);
              }}
              className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePlan(plan.id);
              }}
              className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
            >
              <Trash size={16} />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                processMealPlanForGroceries(plan);
              }}
              className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
              title="Add to grocery list"
            >
              <ShoppingBag size={16} />
            </Button>
          </div>

          <div 
            className="cursor-pointer"
            onClick={() => handleViewPlanDetails(plan)}
          >
            <div className="h-32 bg-gradient-to-r from-dishco-primary/20 to-dishco-secondary/20 p-4">
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-dishco-text-light line-clamp-2">
                {planData.description || "No description available"}
              </p>
            </div>
            
            <CardContent className="p-4 pt-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-dishco-text-light">
                  {days.length} days
                </span>
                <span className="text-sm">
                  {calculateTotalCalories(days)} calories/day
                </span>
              </div>
              
              <div className="flex gap-2">
                {planData.tags && planData.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-dishco-primary/10 rounded text-xs text-dishco-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </div>

          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              className="text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyAndEdit(plan);
              }}
            >
              Copy & Edit
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  size="sm"
                  className="text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Use this plan
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <ReactCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border-0 shadow-md"
                />
                <div className="p-2">
                  <Button size="sm" className="w-full" onClick={() => handleUsePlan(plan)}>
                    Activate Plan
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </CardFooter>
        </Card>
      );
    });
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Saved Meal Plans</h1>
      <p className="text-dishco-text-light mb-6">Access and manage your saved meal plans</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderCards()}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-right inline-block">Description</label>
              <Textarea
                id="description"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdatePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Meal Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this meal plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={confirmDeletePlan}>
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <MealPlanDetailView 
        plan={selectedPlan} 
        isOpen={isPlanDetailOpen} 
        onClose={() => setIsPlanDetailOpen(false)} 
      />
      
      <GroceryListConfirmationDialog
        isOpen={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmGroceryAddition}
        onCancel={() => setShowConfirmation(false)}
        mealPlanName={currentMealPlan?.name || 'your meal plan'}
      />
    </div>
  );
};

export default SavedPlansPage;
