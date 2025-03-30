
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Copy, Trash2, ChevronRight, Plus, Pencil, Info } from 'lucide-react';
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
        setSavedPlans(data as SavedMealPlan[]);
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

  const handleCopy = (id: string) => {
    const planToCopy = savedPlans.find(plan => plan.id === id);
    if (!planToCopy) return;

    // Store the plan data in session storage for use in planning page
    sessionStorage.setItem('planToCopy', JSON.stringify(planToCopy.plan_data));
    
    toast({
      title: "Plan Duplicated",
      description: "A copy of the plan has been created.",
    });
    
    navigate('/planning');
  };

  const handleActivate = (id: string) => {
    const planToActivate = savedPlans.find(plan => plan.id === id);
    if (!planToActivate) return;

    setSelectedPlan(planToActivate);
    setIsSelectingStartDate(true);
  };

  const confirmActivatePlan = () => {
    if (!selectedPlan) return;

    // Store the plan data in session storage for use in planning page
    sessionStorage.setItem('activePlan', JSON.stringify({
      ...selectedPlan.plan_data,
      startDay: selectedDay
    }));
    
    toast({
      title: "Plan Activated",
      description: "This meal plan is now your active plan for the week.",
    });
    
    setIsSelectingStartDate(false);
    navigate('/planning');
  };

  const handleViewPlan = (plan: SavedMealPlan) => {
    setSelectedPlan(plan);
    setIsViewingPlan(true);
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
      
      // Update local state
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
    // Store the plan data in session storage for use in planning page
    // We'll set all meals to be locked by default
    if (!plan.plan_data.days) return;
    
    const lockedMeals: {[key: string]: boolean} = {};
    
    plan.plan_data.days.forEach((day, dayIndex) => {
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        if (day.meals[mealType]?.id) {
          lockedMeals[`${mealType}-${day.meals[mealType].id}`] = true;
        }
      });
      
      if (day.meals.snacks) {
        day.meals.snacks.forEach((snack: any, snackIndex: number) => {
          if (snack?.id) {
            lockedMeals[`snacks-${snack.id}-${snackIndex}`] = true;
          }
        });
      }
    });
    
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
    
    toast({
      title: "Copy & Edit Mode",
      description: "You can now edit a copy of this meal plan with all meals locked by default.",
    });
    
    navigate('/planning');
  };

  // Calculate nutrition totals for a day's meals
  const calculateDayNutrition = (day: any) => {
    return calculateDailyMacros(day.meals);
  };

  // Placeholder for empty state
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

      {/* Create new plan button */}
      <Button 
        variant="outline" 
        className="w-full mb-6 border-dashed justify-start"
        onClick={() => navigate('/planning')}
      >
        <Plus size={18} className="mr-2 text-dishco-primary" />
        Create a new meal plan
      </Button>

      {/* Saved plans list */}
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
                    <Calendar size={20} className="text-dishco-primary mr-3 mt-1" />
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

      {/* View Plan Details Dialog */}
      <Dialog open={isViewingPlan} onOpenChange={setIsViewingPlan}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={18} className="text-dishco-primary" />
              {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan?.plan_data.description || 'Custom meal plan'}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-6">
              {/* Nutrition Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Nutrition Overview</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-2">
                      <CircularProgressbar
                        value={75}
                        text={`${calculateDayNutrition(selectedPlan.plan_data.days[0]).calories}`}
                        styles={buildStyles({
                          textSize: '28px',
                          pathColor: '#FFF4D7',
                          textColor: '#3C3C3C',
                          trailColor: '#F9F9F9',
                        })}
                      />
                    </div>
                    <span className="text-xs text-center">Calories</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-2">
                      <CircularProgressbar
                        value={65}
                        text={`${calculateDayNutrition(selectedPlan.plan_data.days[0]).protein}g`}
                        styles={buildStyles({
                          textSize: '28px',
                          pathColor: '#DBE9FE',
                          textColor: '#3C3C3C',
                          trailColor: '#F9F9F9',
                        })}
                      />
                    </div>
                    <span className="text-xs text-center">Protein</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-2">
                      <CircularProgressbar
                        value={80}
                        text={`${calculateDayNutrition(selectedPlan.plan_data.days[0]).carbs}g`}
                        styles={buildStyles({
                          textSize: '28px',
                          pathColor: '#FEF9C3',
                          textColor: '#3C3C3C',
                          trailColor: '#F9F9F9',
                        })}
                      />
                    </div>
                    <span className="text-xs text-center">Carbs</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-2">
                      <CircularProgressbar
                        value={60}
                        text={`${calculateDayNutrition(selectedPlan.plan_data.days[0]).fat}g`}
                        styles={buildStyles({
                          textSize: '28px',
                          pathColor: '#F3E8FF',
                          textColor: '#3C3C3C',
                          trailColor: '#F9F9F9',
                        })}
                      />
                    </div>
                    <span className="text-xs text-center">Fat</span>
                  </div>
                </div>
              </div>

              {/* Day 1 Meals */}
              <div>
                <h3 className="font-medium mb-3">Day 1 Meals</h3>
                <div className="space-y-3">
                  {selectedPlan.plan_data.days[0].meals.breakfast && (
                    <MealPreviewCard 
                      title="Breakfast" 
                      meal={selectedPlan.plan_data.days[0].meals.breakfast} 
                    />
                  )}
                  {selectedPlan.plan_data.days[0].meals.lunch && (
                    <MealPreviewCard 
                      title="Lunch" 
                      meal={selectedPlan.plan_data.days[0].meals.lunch} 
                    />
                  )}
                  {selectedPlan.plan_data.days[0].meals.dinner && (
                    <MealPreviewCard 
                      title="Dinner" 
                      meal={selectedPlan.plan_data.days[0].meals.dinner} 
                    />
                  )}
                  {selectedPlan.plan_data.days[0].meals.snacks && 
                    selectedPlan.plan_data.days[0].meals.snacks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Snacks</h4>
                      <div className="space-y-2">
                        {selectedPlan.plan_data.days[0].meals.snacks.map((snack: any, i: number) => (
                          snack && <MealPreviewCard key={i} meal={snack} isSnack />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleCopyAndEdit(selectedPlan)}
                >
                  Copy & Edit
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewingPlan(false);
                    handleActivate(selectedPlan.id);
                  }}
                >
                  Use This Plan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rename Plan Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Plan</DialogTitle>
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

      {/* Start Date Selection Dialog */}
      <Dialog open={isSelectingStartDate} onOpenChange={setIsSelectingStartDate}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Start Date</DialogTitle>
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
                    selectedDay === day ? 'border-dishco-primary bg-dishco-primary bg-opacity-5' : ''
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div>
                    <p className="font-medium">
                      {day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : `In ${day} days`}
                    </p>
                    <p className="text-sm text-dishco-text-light">
                      {format(new Date(Date.now() + day * 24 * 60 * 60 * 1000), 'EEEE, MMM d')}
                    </p>
                  </div>
                  {selectedDay === day && (
                    <div className="h-4 w-4 rounded-full bg-dishco-primary"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsSelectingStartDate(false)}>
              Cancel
            </Button>
            <Button onClick={confirmActivatePlan}>
              Start Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MealPreviewCardProps {
  title?: string;
  meal: any;
  isSnack?: boolean;
}

const MealPreviewCard: React.FC<MealPreviewCardProps> = ({ title, meal, isSnack = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center p-0">
        <div className="w-16 h-16 flex-shrink-0">
          <img 
            src={meal.imageSrc || '/placeholder.svg'} 
            alt={meal.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3 flex-1">
          {title && !isSnack && <p className="text-xs text-dishco-text-light">{title}</p>}
          <h4 className="font-medium">{meal.name}</h4>
          <div className="flex space-x-2 mt-1">
            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">P: {meal.macros.protein}g</span>
            <span className="text-xs px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded">C: {meal.macros.carbs}g</span>
            <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">F: {meal.macros.fat}g</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 p-0 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
            >
              <Info size={14} className="mr-1" />
              Details
            </Button>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="border-t p-3 bg-gray-50 text-sm">
          <h5 className="font-medium mb-2">Ingredients</h5>
          <ul className="list-disc list-inside text-sm space-y-1 mb-3">
            {meal.ingredients?.map((ingredient: string, i: number) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
          
          <h5 className="font-medium mb-2">Instructions</h5>
          <ol className="list-decimal list-inside text-sm space-y-1">
            {meal.instructions?.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SavedMealPlansPage;
