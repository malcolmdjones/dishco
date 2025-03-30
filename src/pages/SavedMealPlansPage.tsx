
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Copy, Trash2, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

type SavedMealPlan = {
  id: string;
  name: string;
  created_at: string;
  plan_data: any;
};

const SavedMealPlansPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Store the plan data in session storage for use in planning page
    sessionStorage.setItem('activePlan', JSON.stringify(planToActivate.plan_data));
    
    toast({
      title: "Plan Activated",
      description: "This meal plan is now your active plan for the week.",
    });
    
    navigate('/planning');
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
            <div key={plan.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <div className="flex space-x-1">
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={() => handleCopy(plan.id)}
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className="p-1.5 rounded-full hover:bg-gray-100"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleCopy(plan.id)}
                  >
                    Duplicate
                  </Button>
                  <Button 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleActivate(plan.id)}
                  >
                    Use This Plan <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedMealPlansPage;
