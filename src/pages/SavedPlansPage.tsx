
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trash2, ChevronRight, Plus, Pencil, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

type SavedMealPlan = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  plan_data: {
    days: any[];
    description?: string;
  };
  user_id: string;
};

const SavedPlansPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavedMealPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [planToActivate, setPlanToActivate] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved plans:', error);
        return;
      }

      // Transform the data to match our SavedMealPlan type
      const transformedData = data.map(plan => ({
        ...plan,
        plan_data: typeof plan.plan_data === 'string' 
          ? JSON.parse(plan.plan_data) 
          : plan.plan_data
      })) as SavedMealPlan[];

      setSavedPlans(transformedData);
    } catch (error) {
      console.error('Error fetching saved plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));

      toast({
        title: "Plan Deleted",
        description: "The meal plan has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const handleActivate = (id: string) => {
    const planToActivate = savedPlans.find(plan => plan.id === id);
    if (!planToActivate) return;
    
    setPlanToActivate(id);
    setShowCalendar(true);
  };

  const handleConfirmActivate = () => {
    if (!planToActivate || !selectedDate) return;
    
    const planData = savedPlans.find(plan => plan.id === planToActivate)?.plan_data;
    if (!planData) return;
    
    // Store the selected date and plan data in session storage
    sessionStorage.setItem('activatePlanDate', selectedDate.toISOString());
    sessionStorage.setItem('activatePlanData', JSON.stringify(planData));
    
    toast({
      title: "Plan Activated",
      description: `Your meal plan will start on ${format(selectedDate, 'MMMM d, yyyy')}.`,
    });
    
    setShowCalendar(false);
    setPlanToActivate(null);
    
    // Navigate to planning page
    navigate('/planning');
  };

  const handleCopyAndEdit = (id: string) => {
    const planToCopy = savedPlans.find(plan => plan.id === id);
    if (!planToCopy) return;

    // Store the plan data and lock all meals
    sessionStorage.setItem('planToCopy', JSON.stringify(planToCopy.plan_data));
    
    // Create a locked meals object to lock all meals in the plan
    const lockedMeals: {[key: string]: boolean} = {};
    
    planToCopy.plan_data.days.forEach((day, dayIndex) => {
      if (day.meals) {
        if (day.meals.breakfast) {
          lockedMeals[`breakfast-${day.meals.breakfast.id}`] = true;
        }
        if (day.meals.lunch) {
          lockedMeals[`lunch-${day.meals.lunch.id}`] = true;
        }
        if (day.meals.dinner) {
          lockedMeals[`dinner-${day.meals.dinner.id}`] = true;
        }
        if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
          day.meals.snacks.forEach((snack, snackIndex) => {
            if (snack) {
              lockedMeals[`snacks-${snack.id}-${snackIndex}`] = true;
            }
          });
        }
      }
    });
    
    // Store the locked meals in session storage
    sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
    
    toast({
      title: "Plan Copied for Editing",
      description: "You can now edit the copied plan. All meals are locked by default.",
    });
    
    navigate('/planning');
  };

  const handleEditClick = (plan: SavedMealPlan) => {
    setSelectedPlan(plan);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.description || '');
    setIsRenaming(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .update({
          name: newPlanName,
          plan_data: {
            ...selectedPlan.plan_data,
            description: newPlanDescription
          }
        })
        .eq('id', selectedPlan.id);
      
      if (error) throw error;
      
      // Update the state
      setSavedPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === selectedPlan.id 
            ? {
                ...plan,
                name: newPlanName,
                plan_data: {
                  ...plan.plan_data,
                  description: newPlanDescription
                }
              }
            : plan
        )
      );
      
      toast({
        title: "Plan Updated",
        description: "Your meal plan has been updated.",
      });
      
      setIsRenaming(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const handleViewDetails = (plan: SavedMealPlan) => {
    setSelectedPlan(plan);
    setSelectedDay(0);
    setShowPlanDetails(true);
  };

  const macroColors = {
    calories: '#FFF4D7',
    protein: '#DBE9FE',
    carbs: '#FEF9C3',
    fat: '#F3E8FF'
  };

  // Function to calculate daily macros
  const calculateDailyMacros = (meals: any) => {
    let dailyMacros = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    if (!meals) return dailyMacros;
    
    if (meals.breakfast && meals.breakfast.macros) {
      dailyMacros.calories += meals.breakfast.macros.calories || 0;
      dailyMacros.protein += meals.breakfast.macros.protein || 0;
      dailyMacros.carbs += meals.breakfast.macros.carbs || 0;
      dailyMacros.fat += meals.breakfast.macros.fat || 0;
    }
    
    if (meals.lunch && meals.lunch.macros) {
      dailyMacros.calories += meals.lunch.macros.calories || 0;
      dailyMacros.protein += meals.lunch.macros.protein || 0;
      dailyMacros.carbs += meals.lunch.macros.carbs || 0;
      dailyMacros.fat += meals.lunch.macros.fat || 0;
    }
    
    if (meals.dinner && meals.dinner.macros) {
      dailyMacros.calories += meals.dinner.macros.calories || 0;
      dailyMacros.protein += meals.dinner.macros.protein || 0;
      dailyMacros.carbs += meals.dinner.macros.carbs || 0;
      dailyMacros.fat += meals.dinner.macros.fat || 0;
    }
    
    if (meals.snacks && Array.isArray(meals.snacks)) {
      meals.snacks.forEach((snack: any) => {
        if (snack && snack.macros) {
          dailyMacros.calories += snack.macros.calories || 0;
          dailyMacros.protein += snack.macros.protein || 0;
          dailyMacros.carbs += snack.macros.carbs || 0;
          dailyMacros.fat += snack.macros.fat || 0;
        }
      });
    }
    
    return dailyMacros;
  };

  // Calculate week total macros
  const calculateWeeklyMacros = (days: any[]) => {
    let weeklyMacros = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    if (!days || !Array.isArray(days)) return weeklyMacros;
    
    days.forEach(day => {
      if (day.meals) {
        const dailyMacros = calculateDailyMacros(day.meals);
        weeklyMacros.calories += dailyMacros.calories;
        weeklyMacros.protein += dailyMacros.protein;
        weeklyMacros.carbs += dailyMacros.carbs;
        weeklyMacros.fat += dailyMacros.fat;
      }
    });
    
    return weeklyMacros;
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Saved Meal Plans</h1>
          <p className="text-dishco-text-light">View and manage your saved meal plans</p>
        </div>
      </header>

      <div className="grid gap-4">
        {savedPlans.length > 0 ? (
          savedPlans.map((plan) => (
            <Card key={plan.id} className="shadow-sm hover:shadow-md transition-shadow" onClick={() => handleViewDetails(plan)}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>
                  Created on {format(new Date(plan.created_at), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardFooter className="py-3 flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAndEdit(plan.id);
                    }}
                  >
                    <span>Copy & Edit</span>
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(plan);
                    }}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlanToDelete(plan.id);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivate(plan.id);
                    }}
                  >
                    Use this plan
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-dishco-primary mb-4"></div>
            <p>Loading your meal plans...</p>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl p-6">
            <div className="mb-4 w-16 h-16 bg-dishco-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
              <Calendar size={24} className="text-dishco-primary" />
            </div>
            <h3 className="font-semibold mb-2">No meal plans saved yet</h3>
            <p className="text-dishco-text-light mb-6">
              Create and save meal plans to access them later
            </p>
            <Button 
              onClick={() => navigate('/planning')}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Create a Meal Plan
            </Button>
          </div>
        )}
      </div>

      <Sheet open={showPlanDetails} onOpenChange={setShowPlanDetails}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedPlan && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPlan.name}</SheetTitle>
                <SheetDescription>
                  {selectedPlan.plan_data.description || 'No description provided'}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Weekly Nutrition</h3>
                {selectedPlan.plan_data.days && (
                  <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(() => {
                        const weeklyMacros = calculateWeeklyMacros(selectedPlan.plan_data.days);
                        const dailyAverage = {
                          calories: Math.round(weeklyMacros.calories / 7),
                          protein: Math.round(weeklyMacros.protein / 7),
                          carbs: Math.round(weeklyMacros.carbs / 7),
                          fat: Math.round(weeklyMacros.fat / 7)
                        };
                        
                        return (
                          <>
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 mb-1">
                                <CircularProgressbar
                                  value={100}
                                  text={`${dailyAverage.calories}`}
                                  styles={buildStyles({
                                    textSize: '28px',
                                    pathColor: macroColors.calories,
                                    textColor: '#3C3C3C',
                                    trailColor: '#F9F9F9',
                                  })}
                                />
                              </div>
                              <span className="text-xs text-center">
                                Calories/day
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 mb-1">
                                <CircularProgressbar
                                  value={100}
                                  text={`${dailyAverage.protein}g`}
                                  styles={buildStyles({
                                    textSize: '28px',
                                    pathColor: macroColors.protein,
                                    textColor: '#3C3C3C',
                                    trailColor: '#F9F9F9',
                                  })}
                                />
                              </div>
                              <span className="text-xs text-center">
                                Protein/day
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 mb-1">
                                <CircularProgressbar
                                  value={100}
                                  text={`${dailyAverage.carbs}g`}
                                  styles={buildStyles({
                                    textSize: '28px',
                                    pathColor: macroColors.carbs,
                                    textColor: '#3C3C3C',
                                    trailColor: '#F9F9F9',
                                  })}
                                />
                              </div>
                              <span className="text-xs text-center">
                                Carbs/day
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 mb-1">
                                <CircularProgressbar
                                  value={100}
                                  text={`${dailyAverage.fat}g`}
                                  styles={buildStyles({
                                    textSize: '28px',
                                    pathColor: macroColors.fat,
                                    textColor: '#3C3C3C',
                                    trailColor: '#F9F9F9',
                                  })}
                                />
                              </div>
                              <span className="text-xs text-center">
                                Fat/day
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Day {selectedDay + 1} Meals</h3>
                      <div className="flex">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={selectedDay === 0}
                          onClick={() => setSelectedDay(prev => Math.max(0, prev - 1))}
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-2"
                          disabled={selectedDay === 6}
                          onClick={() => setSelectedDay(prev => Math.min(6, prev + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    {selectedPlan.plan_data.days && selectedPlan.plan_data.days[selectedDay]?.meals && (
                      <div className="space-y-3">
                        {/* Breakfast */}
                        <div className="bg-white rounded-lg shadow-sm p-3">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Breakfast</h4>
                            {selectedPlan.plan_data.days[selectedDay].meals.breakfast ? (
                              <Badge variant="outline">
                                {selectedPlan.plan_data.days[selectedDay].meals.breakfast.macros.calories} cal
                              </Badge>
                            ) : null}
                          </div>
                          {selectedPlan.plan_data.days[selectedDay].meals.breakfast ? (
                            <p className="text-sm mt-1">
                              {selectedPlan.plan_data.days[selectedDay].meals.breakfast.name}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">No breakfast planned</p>
                          )}
                        </div>

                        {/* Lunch */}
                        <div className="bg-white rounded-lg shadow-sm p-3">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Lunch</h4>
                            {selectedPlan.plan_data.days[selectedDay].meals.lunch ? (
                              <Badge variant="outline">
                                {selectedPlan.plan_data.days[selectedDay].meals.lunch.macros.calories} cal
                              </Badge>
                            ) : null}
                          </div>
                          {selectedPlan.plan_data.days[selectedDay].meals.lunch ? (
                            <p className="text-sm mt-1">
                              {selectedPlan.plan_data.days[selectedDay].meals.lunch.name}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">No lunch planned</p>
                          )}
                        </div>

                        {/* Dinner */}
                        <div className="bg-white rounded-lg shadow-sm p-3">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Dinner</h4>
                            {selectedPlan.plan_data.days[selectedDay].meals.dinner ? (
                              <Badge variant="outline">
                                {selectedPlan.plan_data.days[selectedDay].meals.dinner.macros.calories} cal
                              </Badge>
                            ) : null}
                          </div>
                          {selectedPlan.plan_data.days[selectedDay].meals.dinner ? (
                            <p className="text-sm mt-1">
                              {selectedPlan.plan_data.days[selectedDay].meals.dinner.name}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">No dinner planned</p>
                          )}
                        </div>

                        {/* Snacks */}
                        {selectedPlan.plan_data.days[selectedDay].meals.snacks && 
                         selectedPlan.plan_data.days[selectedDay].meals.snacks.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm p-3">
                            <h4 className="font-medium mb-2">Snacks</h4>
                            <ul className="space-y-2">
                              {selectedPlan.plan_data.days[selectedDay].meals.snacks.map((snack: any, idx: number) => (
                                snack && (
                                  <li key={idx} className="flex justify-between text-sm">
                                    <span>{snack.name}</span>
                                    <Badge variant="outline">{snack.macros.calories} cal</Badge>
                                  </li>
                                )
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPlanDetails(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      handleActivate(selectedPlan.id);
                      setShowPlanDetails(false);
                    }}
                  >
                    Use this plan
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (planToDelete) {
                  handleDelete(planToDelete);
                  setPlanToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update the name and description of your meal plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input 
                id="plan-name" 
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-description">Description (optional)</Label>
              <Textarea 
                id="plan-description"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                placeholder="Enter plan description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)}>Cancel</Button>
            <Button onClick={handleUpdatePlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={18} className="text-dishco-primary" />
              Choose Start Date
            </DialogTitle>
            <DialogDescription>
              Select the date you want to start this meal plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalendar(false)}>Cancel</Button>
            <Button onClick={handleConfirmActivate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedPlansPage;
