
import { useState, useEffect } from 'react';
import { ActiveMealPlan, MealPlan } from '@/types/mealPlanTypes';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useMealPlanApiOperations } from './useMealPlanApiOperations';
import { 
  checkPlanOverlap, 
  calculatePlanDates, 
  getActivePlanForDate,
  getMealsForDate as getMealsForDateUtil,
  dateHasActivePlan as dateHasActivePlanUtil,
  getDatesWithActivePlans as getDatesWithActivePlansUtil
} from '@/utils/mealPlanUtils';
import { format, parseISO } from 'date-fns';

export type { MealPlanData, MealPlan, ActiveMealPlan } from '@/types/mealPlanTypes';

export const useSavedMealPlans = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false);
  const [activePlans, setActivePlans] = useState<ActiveMealPlan[]>([]);
  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const [pendingActivation, setPendingActivation] = useState<{plan: MealPlan, startDay: number, startDate: string} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isLoading, fetchPlans: apiFetchPlans, deletePlan: apiDeletePlan, updatePlan: apiUpdatePlan, saveMealPlan: apiSaveMealPlan } = useMealPlanApiOperations(user);

  useEffect(() => {
    const loadActivePlans = () => {
      const storedActivePlans = sessionStorage.getItem('activePlans');
      if (!storedActivePlans) return;
      
      try {
        const parsedPlans = JSON.parse(storedActivePlans) as ActiveMealPlan[];
        
        if (plans.length > 0) {
          const updatedActivePlans: ActiveMealPlan[] = [];
          
          for (const activePlan of parsedPlans) {
            const matchingPlan = plans.find(p => p.id === activePlan.plan.id);
            
            if (matchingPlan) {
              updatedActivePlans.push({
                plan: matchingPlan,
                startDay: activePlan.startDay,
                startDate: activePlan.startDate,
                endDate: activePlan.endDate
              });
            } else {
              updatedActivePlans.push(activePlan);
            }
          }
          
          setActivePlans(updatedActivePlans);
        } else {
          setActivePlans(parsedPlans);
        }
      } catch (error) {
        console.error('Error parsing active meal plans:', error);
        sessionStorage.removeItem('activePlans');
      }
    };
    
    loadActivePlans();
  }, []);
  
  useEffect(() => {
    if (plans.length > 0) {
      const storedActivePlans = sessionStorage.getItem('activePlans');
      if (!storedActivePlans) return;
      
      try {
        const parsedPlans = JSON.parse(storedActivePlans) as ActiveMealPlan[];
        const updatedActivePlans: ActiveMealPlan[] = [];
        
        for (const activePlan of parsedPlans) {
          const matchingPlan = plans.find(p => p.id === activePlan.plan.id);
          
          if (matchingPlan) {
            updatedActivePlans.push({
              plan: matchingPlan,
              startDay: activePlan.startDay,
              startDate: activePlan.startDate,
              endDate: activePlan.endDate
            });
          } else {
            updatedActivePlans.push(activePlan);
          }
        }
        
        setActivePlans(updatedActivePlans);
      } catch (error) {
        console.error('Error updating active meal plans after plans loaded:', error);
      }
    }
  }, [plans]);

  const fetchPlans = async () => {
    const fetchedPlans = await apiFetchPlans();
    setPlans(fetchedPlans);
  };

  const deletePlan = async (id: string) => {
    const success = await apiDeletePlan(id, activePlans);
    
    if (success) {
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
      
      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
        setIsPlanDetailOpen(false);
      }
      
      // Update active plans
      const updatedActivePlans = activePlans.filter(ap => ap.plan.id !== id);
      if (updatedActivePlans.length !== activePlans.length) {
        setActivePlans(updatedActivePlans);
        if (updatedActivePlans.length === 0) {
          sessionStorage.removeItem('activePlans');
        } else {
          sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
        }
      }
    }
    
    return success;
  };

  const updatePlan = async (id: string, updates: { name?: string; description?: string }) => {
    const success = await apiUpdatePlan(id, updates, plans);
    
    if (success) {
      setPlans(prevPlans => prevPlans.map(p => 
        p.id === id 
          ? { 
            ...p, 
            name: updates.name ?? p.name, 
            plan_data: {
              ...p.plan_data,
              description: updates.description ?? p.plan_data.description
            } 
          } 
          : p
      ));
    }
  };

  const saveMealPlan = async (planData: any) => {
    const planId = await apiSaveMealPlan(planData);
    
    if (planId) {
      await fetchPlans();
    }
    
    return planId;
  };

  const viewPlanDetails = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsPlanDetailOpen(true);
  };

  const activatePlan = (plan: MealPlan, startDay: number = 0, force: boolean = false) => {
    const { startDate, endDate } = calculatePlanDates(plan, startDay);
    
    if (!force && checkPlanOverlap(plan, startDate, activePlans)) {
      setPendingActivation({ plan, startDay, startDate });
      setShowOverlapWarning(true);
      return false;
    }
    
    const newActivePlan: ActiveMealPlan = {
      plan,
      startDay,
      startDate,
      endDate
    };
    
    const updatedActivePlans = [...activePlans, newActivePlan];
    setActivePlans(updatedActivePlans);
    
    sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
    
    toast({
      title: "Plan Activated",
      description: `${plan.name} is now active from ${format(parseISO(startDate), 'MMM d')} to ${format(parseISO(endDate), 'MMM d')}.`,
    });
    
    return true;
  };

  const forceActivatePlan = () => {
    if (!pendingActivation) {
      console.error("No pending activation found when trying to force activate");
      return false;
    }
    
    try {
      console.log("Force activating plan:", pendingActivation.plan.name);
      
      const { plan, startDay, startDate } = pendingActivation;
      const { endDate } = calculatePlanDates(plan, startDay);
      
      console.log(`Activating plan from ${startDate} to ${endDate}`);
      console.log(`Current active plans:`, activePlans);
      
      const updatedActivePlans = activePlans.filter(activePlan => {
        const activeStartDate = new Date(activePlan.startDate);
        const activeEndDate = new Date(activePlan.endDate);
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);
        
        const hasOverlap = (
          (newStartDate <= activeEndDate && newStartDate >= activeStartDate) ||
          (newEndDate <= activeEndDate && newEndDate >= activeStartDate) ||
          (newStartDate <= activeStartDate && newEndDate >= activeEndDate)
        );
        
        if (hasOverlap) {
          console.log(`Removing overlapping plan: ${activePlan.plan.name} (${activePlan.startDate} - ${activePlan.endDate})`);
        }
        return !hasOverlap;
      });
      
      const newActivePlan: ActiveMealPlan = {
        plan,
        startDay,
        startDate,
        endDate
      };
      
      updatedActivePlans.push(newActivePlan);
      console.log("Updated active plans:", updatedActivePlans);
      
      setActivePlans(updatedActivePlans);
      sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
      
      setPendingActivation(null);
      setShowOverlapWarning(false);
      
      toast({
        title: "Plan Activated",
        description: `${plan.name} is now active from ${format(parseISO(startDate), 'MMM d')} to ${format(parseISO(endDate), 'MMM d')}.`,
      });
      
      console.log("Plan successfully activated");
      return true;
    } catch (error) {
      console.error("Error in forceActivatePlan:", error);
      setPendingActivation(null);
      setShowOverlapWarning(false);
      return false;
    }
  };

  const cancelActivation = () => {
    setPendingActivation(null);
    setShowOverlapWarning(false);
  };

  const deactivatePlan = (planId: string) => {
    const updatedActivePlans = activePlans.filter(ap => ap.plan.id !== planId);
    setActivePlans(updatedActivePlans);
    
    if (updatedActivePlans.length === 0) {
      sessionStorage.removeItem('activePlans');
    } else {
      sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
    }
    
    toast({
      title: "Plan Deactivated",
      description: "The meal plan has been deactivated.",
    });
  };

  const deactivateAllPlans = () => {
    setActivePlans([]);
    sessionStorage.removeItem('activePlans');
    
    toast({
      title: "All Plans Deactivated",
      description: "You no longer have any active meal plans.",
    });
  };

  const copyAndEditPlan = (plan: MealPlan) => {
    const lockedMeals: {[key: string]: boolean} = {};
    
    if (plan.plan_data.days) {
      plan.plan_data.days.forEach((day, dayIndex) => {
        if (day.meals) {
          if (day.meals.breakfast?.id) {
            lockedMeals[`breakfast-${day.meals.breakfast.id}`] = true;
          }
          
          if (day.meals.lunch?.id) {
            lockedMeals[`lunch-${day.meals.lunch.id}`] = true;
          }
          
          if (day.meals.dinner?.id) {
            lockedMeals[`dinner-${day.meals.dinner.id}`] = true;
          }
          
          if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
            day.meals.snacks.forEach((snack, snackIndex) => {
              if (snack?.id) {
                lockedMeals[`snacks-${snack.id}-${snackIndex}`] = true;
              }
            });
          }
        }
      });
    }
    
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
    
    toast({
      title: "Copy & Edit Mode",
      description: "You can now edit a copy of this meal plan.",
    });
  };

  // Wrapper functions that call the utilities with the current activePlans
  const getMealsForDate = (dateString: string) => {
    return getMealsForDateUtil(dateString, activePlans);
  };

  const dateHasActivePlan = (date: Date): boolean => {
    return dateHasActivePlanUtil(date, activePlans);
  };

  const getDatesWithActivePlans = (): {[key: string]: string} => {
    return getDatesWithActivePlansUtil(activePlans);
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  return {
    plans,
    isLoading,
    selectedPlan,
    setSelectedPlan,
    isPlanDetailOpen,
    setIsPlanDetailOpen,
    activePlans,
    showOverlapWarning,
    setShowOverlapWarning,
    pendingActivation,
    fetchPlans,
    deletePlan,
    updatePlan,
    viewPlanDetails,
    activatePlan,
    forceActivatePlan,
    cancelActivation,
    deactivatePlan,
    deactivateAllPlans,
    copyAndEditPlan,
    getMealsForDate,
    dateHasActivePlan,
    getDatesWithActivePlans,
    getActivePlanForDate: (dateString: string) => getActivePlanForDate(dateString, activePlans),
    saveMealPlan
  };
};
