
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
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Today, 1 = Tomorrow, etc.
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [planDetailOpen, setPlanDetailOpen] = useState(false);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting meal plan:', error);
        return;
      }
      
      setSavedPlans(savedPlans.filter(plan => plan.id !== id));
      toast({
        title: "Plan Deleted",
        description: "The meal plan has been removed from your saved plans.",
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const handleActivate = (id: string) => {
    const planToActivate = savedPlans.find(plan => plan.id === id);
    if (!planToActivate) return;

    setSelectedPlan(planToActivate);
    setIsSelectingStartDate(true);
  };

  const confirmActivatePlan = () => {
    if (!selectedPlan) return;

    // Store the selected date as the start date
    const startDate = selectedDate ? selectedDate : new Date();
    
    sessionStorage.setItem('activePlan', JSON.stringify({
      ...selectedPlan.plan_data,
      startDate: startDate.toISOString()
    }));
    
    toast({
      title: "Plan Activated",
      description: "This meal plan is now your active plan starting from " + format(startDate, 'MMMM d, yyyy'),
    });
    
    setIsSelectingStartDate(false);
    navigate('/planning');
  };

  const handleViewPlan = (plan: SavedMealPlan) => {
    setSelectedPlan(plan);
    setPlanDetailOpen(true);
  };

  const handleRename = (plan: SavedMealPlan) => {
    setSelectedPlan(plan);
    setNewPlanName(plan.name);
    setNewDescription(plan.plan_data.description || '');
    setIsRenaming(true);
  };

  const savePlanRename = async () => {
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

  const handleCopyAndEdit = (plan: SavedMealPlan) => {
    if (!plan.plan_data.days) return;
    
    const lockedMeals: {[key: string]: boolean} = {};
    
    plan.plan_data.days.forEach((day, dayIndex) => {
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        if (day.meals[mealType]?.id) {
          lockedMeals[`${dayIndex}-${mealType}`] = true;
        }
      });
      
      if (day.meals.snacks) {
        day.meals.snacks.forEach((snack: any, snackIndex: number) => {
          if (snack?.id) {
            lockedMeals[`${dayIndex}-snack-${snackIndex}`] = true;
          }
        });
      }
    });
    
    // Save plan data and locked meals to session storage
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
    
    toast({
      title: "Copy & Edit Mode",
      description: "You can now edit a copy of this meal plan with all meals locked by default.",
    });
    
    navigate('/create-meal-plan');
  };

  const calculateDayNutrition = (day: any) => {
    return calculateDailyMacros(day.meals);
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
              onClick={() => handleViewPlan(plan)}
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
                        handleRename(plan);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plan.id);
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
                      handleActivate(plan.id);
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
            <Button onClick={savePlanRename}>
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
