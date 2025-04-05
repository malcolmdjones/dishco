
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trash2, ChevronRight, Plus, Pencil, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { calculateDailyMacros } from '@/data/mockData';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';
import MealPlanDetailView from '@/components/MealPlanDetailView';

const SavedMealPlansPage = () => {
  const navigate = useNavigate();
  const {
    plans,
    isLoading,
    selectedPlan,
    isPlanDetailOpen,
    setIsPlanDetailOpen,
    deletePlan,
    updatePlan,
    viewPlanDetails,
    activatePlan,
    copyAndEditPlan
  } = useSavedMealPlans();

  // State for editing plan details
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');

  // State for confirming deletion
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [planToDeleteId, setPlanToDeleteId] = useState<string | null>(null);

  // State for activating plan
  const [isSelectingStartDay, setIsSelectingStartDay] = useState(false);
  const [planToActivateId, setPlanToActivateId] = useState<string | null>(null);
  const [selectedStartDay, setSelectedStartDay] = useState(0);

  const handleEditPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    setEditingPlanId(planId);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.plan_data.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPlanId) return;
    
    await updatePlan(editingPlanId, {
      name: newPlanName,
      description: newPlanDescription
    });
    
    setIsEditing(false);
    setEditingPlanId(null);
  };

  const handleConfirmDelete = (planId: string) => {
    setPlanToDeleteId(planId);
    setIsConfirmingDelete(true);
  };

  const handleDeletePlan = async () => {
    if (!planToDeleteId) return;
    
    await deletePlan(planToDeleteId);
    setIsConfirmingDelete(false);
    setPlanToDeleteId(null);
  };

  const handleActivatePlan = (planId: string) => {
    setPlanToActivateId(planId);
    setSelectedStartDay(0);
    setIsSelectingStartDay(true);
  };

  const handleConfirmActivate = () => {
    if (!planToActivateId) return;
    
    const plan = plans.find(p => p.id === planToActivateId);
    if (!plan) return;
    
    activatePlan(plan, selectedStartDay);
    setIsSelectingStartDay(false);
    setPlanToActivateId(null);
    navigate('/planning');
  };

  const calculateAverageCalories = (days: any[]) => {
    if (!days || !Array.isArray(days) || days.length === 0) return 0;
    
    return Math.round(
      days.reduce((sum: number, day: any) => {
        const dayMacros = calculateDailyMacros(day?.meals || {});
        return sum + (dayMacros.calories || 0);
      }, 0) / days.length
    );
  };

  // Render empty state if no plans
  if (plans.length === 0 && !isLoading) {
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
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading saved meal plans...</p>
          </div>
        ) : (
          plans.map(plan => (
            <Card key={plan.id} className="bg-white overflow-hidden">
              <CardHeader className="p-4 pb-3 cursor-pointer" onClick={() => viewPlanDetails(plan)}>
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <Calendar size={20} className="text-dishco-primary mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-xs text-dishco-text-light">
                        Created {format(new Date(plan.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPlan(plan.id);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(plan.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2 line-clamp-2">
                  {plan.plan_data.description || "Custom meal plan"}
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">{calculateAverageCalories(plan.plan_data.days)} calories/day</span> · <span>{plan.plan_data.days?.length || 0} days</span>
                </div>
              </CardHeader>
              <CardFooter className="p-4 pt-2 flex justify-between" onClick={e => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyAndEditPlan(plan)}
                >
                  Copy & Edit
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleActivatePlan(plan.id)}
                >
                  Use This Plan <ChevronRight size={14} className="ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
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
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Meal Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this meal plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Day Selection Dialog */}
      <Dialog open={isSelectingStartDay} onOpenChange={setIsSelectingStartDay}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>When to Start?</DialogTitle>
            <DialogDescription>
              Choose which day to start this meal plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <div 
                  key={day}
                  className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${
                    selectedStartDay === day ? 'border-dishco-primary bg-dishco-primary bg-opacity-5' : ''
                  }`}
                  onClick={() => setSelectedStartDay(day)}
                >
                  <div>
                    <p className="font-medium">
                      {day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : `In ${day} days`}
                    </p>
                    <p className="text-sm text-dishco-text-light">
                      {format(new Date(Date.now() + day * 24 * 60 * 60 * 1000), 'EEEE, MMM d')}
                    </p>
                  </div>
                  {selectedStartDay === day && (
                    <div className="h-4 w-4 rounded-full bg-dishco-primary"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSelectingStartDay(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmActivate}>
              Start Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meal Plan Detail View */}
      <MealPlanDetailView 
        plan={selectedPlan} 
        isOpen={isPlanDetailOpen} 
        onClose={() => setIsPlanDetailOpen(false)}
      />
    </div>
  );
};

export default SavedMealPlansPage;
