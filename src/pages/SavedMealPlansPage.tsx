import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trash2, ChevronRight, Plus, Pencil, BookOpen, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateDailyMacros } from '@/data/mockData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PlanDetailView from '@/components/PlanDetailView';
import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

type SavedMealPlan = {
  id: string;
  name: string;
  created_at: string;
  plan_data: {
    days: any[];
    description?: string;
  };
};

const SavedMealPlansPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SavedMealPlan | null>(null);
  const [isViewingPlan, setIsViewingPlan] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [planDetailOpen, setPlanDetailOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching saved meal plans:', error);
        return;
      }
      
      if (data) {
        const typedPlans: SavedMealPlan[] = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          created_at: plan.created_at as string,
          plan_data: {
            days: (plan.plan_data as any)?.days || [],
            description: (plan.plan_data as any)?.description
          }
        }));
        
        setSavedPlans(typedPlans);
      }
    } catch (error) {
      console.error('Error fetching saved meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setNewPlanName(plan.name);
    setNewDescription(plan.plan_data.description || '');
    setIsRenaming(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan || !newPlanName.trim()) return;

    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .update({ 
          name: newPlanName.trim(),
          plan_data: {
            ...selectedPlan.plan_data,
            description: newDescription.trim()
          }
        })
        .eq('id', selectedPlan.id);
      
      if (error) {
        console.error('Error updating meal plan:', error);
        toast({
          title: "Update Failed",
          description: "There was an error updating your meal plan.",
          variant: "destructive"
        });
        return;
      }
      
      setSavedPlans(savedPlans.map(plan => 
        plan.id === selectedPlan.id 
          ? {
              ...plan, 
              name: newPlanName.trim(),
              plan_data: {
                ...plan.plan_data,
                description: newDescription.trim()
              }
            } 
          : plan
      ));
      
      toast({
        title: "Plan Updated",
        description: "Your meal plan has been updated successfully.",
      });
      
      setIsRenaming(false);
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your meal plan.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting meal plan:', error);
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the meal plan.",
          variant: "destructive"
        });
        return;
      }
      
      setSavedPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
      
      const activePlanJson = localStorage.getItem('activePlan');
      if (activePlanJson) {
        try {
          const activePlan = JSON.parse(activePlanJson);
          if (activePlan.id === id) {
            localStorage.removeItem('activePlan');
            localStorage.removeItem('savedMealPlans');
            localStorage.setItem('planActivatedAt', new Date().toISOString());
          }
        } catch (e) {
          console.error('Error checking active plan:', e);
        }
      }
      
      toast({
        title: "Plan Deleted",
        description: "The meal plan has been removed from your saved plans.",
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the meal plan.",
        variant: "destructive"
      });
    }
  };

  const confirmDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', selectedPlan.id);
      
      if (error) {
        console.error('Error deleting meal plan:', error);
        return;
      }
      
      setSavedPlans(savedPlans.filter(plan => plan.id !== selectedPlan.id));
      toast({
        title: "Plan Deleted",
        description: "The meal plan has been removed from your saved plans.",
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const handleViewPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setPlanDetailOpen(true);
  };

  const handleCopyAndEdit = (plan) => {
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    
    const lockedMeals = {};
    if (plan.plan_data && plan.plan_data.days) {
      plan.plan_data.days.forEach((day, dayIndex) => {
        if (day && day.meals) {
          ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            if (day.meals[mealType]) {
              lockedMeals[`${dayIndex}-${mealType}`] = true;
            }
          });
          
          if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
            day.meals.snacks.forEach((snack, snackIndex) => {
              if (snack) {
                lockedMeals[`${dayIndex}-snack-${snackIndex}`] = true;
              }
            });
          }
        }
      });
    }
    
    sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
    
    toast({
      title: "Copy & Edit Mode",
      description: "You can now edit a copy of this meal plan with all meals locked by default.",
    });
    
    navigate('/create-meal-plan');
  };

  const handleActivatePlan = (id) => {
    const planToActivate = savedPlans.find(plan => plan.id === id);
    if (!planToActivate) return;

    setSelectedPlan(planToActivate);
    setIsSelectingStartDate(true);
  };

  const confirmActivatePlan = () => {
    if (!selectedPlan) return;

    const startDate = selectedDate ? selectedDate : new Date();
    
    try {
      const activePlanData = {
        ...selectedPlan.plan_data,
        name: selectedPlan.name,
        id: selectedPlan.id,
        startDate: startDate.toISOString()
      };
      
      localStorage.setItem('activePlan', JSON.stringify(activePlanData));
      localStorage.setItem('savedMealPlans', JSON.stringify([{
        id: selectedPlan.id,
        name: selectedPlan.name,
        created_at: selectedPlan.created_at,
        plan_data: activePlanData
      }]));
      localStorage.setItem('planActivatedAt', new Date().toISOString());
      
      toast({
        title: "Plan Activated",
        description: `${selectedPlan.name} is now your active meal plan starting from ${format(startDate, 'MMMM d, yyyy')}.`,
      });
      
      setIsSelectingStartDate(false);
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

  const calculateTotalCalories = (days) => {
    if (!days || !Array.isArray(days) || days.length === 0) return 0;
    
    let total = 0;
    let validDayCount = 0;
    
    days.forEach(day => {
      if (!day || !day.meals) return;
      
      let dayTotal = 0;
      
      if (day.meals.breakfast && day.meals.breakfast.macros) {
        dayTotal += day.meals.breakfast.macros.calories || 0;
      }
      
      if (day.meals.lunch && day.meals.lunch.macros) {
        dayTotal += day.meals.lunch.macros.calories || 0;
      }
      
      if (day.meals.dinner && day.meals.dinner.macros) {
        dayTotal += day.meals.dinner.macros.calories || 0;
      }
      
      if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
        day.meals.snacks.forEach(snack => {
          if (snack && snack.macros) {
            dayTotal += snack.macros.calories || 0;
          }
        });
      }
      
      if (dayTotal > 0) {
        total += dayTotal;
        validDayCount++;
      }
    });
    
    return validDayCount > 0 ? Math.round(total / validDayCount) : 0;
  };

  if (savedPlans.length === 0 && !loading) {
    return (
      <div className="animate-fade-in">
        <header className="mb-6 flex items-center">
          <Link to="/more" className="mr-3">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Saved Plans</h1>
            <p className="text-dishco-text-light">Your collection of meal plans</p>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar size={32} className="text-dishco-text-light" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No saved plans yet</h2>
          <p className="text-dishco-text-light text-center mb-6">
            Create and save your weekly meal plans to access them later
          </p>
          <Button onClick={() => navigate('/planning')} className="flex items-center">
            <Plus size={18} className="mr-2" />
            Create a Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Saved Plans</h1>
          <p className="text-dishco-text-light">Your collection of meal plans</p>
        </div>
      </header>

      <Button 
        variant="outline" 
        className="w-full mb-6 border-dashed justify-start"
        onClick={() => navigate('/planning')}
      >
        <Plus size={18} className="mr-2 text-dishco-primary" />
        Create a new meal plan
      </Button>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p>Loading saved meal plans...</p>
          </div>
        ) : (
          savedPlans.map(plan => (
            <div 
              key={plan.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
              onClick={() => handleViewPlanDetails(plan)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <BookOpen size={20} className="text-dishco-primary mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-xs text-dishco-text-light">
                        Created {format(new Date(plan.created_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm mt-1">
                        {plan.plan_data && plan.plan_data.description ? 
                          plan.plan_data.description : 
                          'Custom meal plan'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPlan(plan);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4" onClick={e => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAndEdit(plan);
                    }}
                  >
                    Copy & Edit
                  </Button>
                  <Button 
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivatePlan(plan.id);
                    }}
                  >
                    Use This Plan <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPlan && (
        <PlanDetailView
          plan={selectedPlan}
          isOpen={planDetailOpen}
          onClose={() => setPlanDetailOpen(false)}
        />
      )}

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update the name and description of your meal plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="plan-description">Description (Optional)</Label>
              <Textarea
                id="plan-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsRenaming(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectingStartDate} onOpenChange={setIsSelectingStartDate}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Start Date</DialogTitle>
            <DialogDescription>
              Choose which day to start this meal plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="p-3 pointer-events-auto"
              />
            </div>
            
            <p className="text-center mb-4 text-sm">
              Selected start date: <span className="font-medium">{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'None'}</span>
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsSelectingStartDate(false)}>
              Cancel
            </Button>
            <Button onClick={confirmActivatePlan} disabled={!selectedDate}>
              Start Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedMealPlansPage;
