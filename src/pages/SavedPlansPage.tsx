
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Copy, Trash2, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SavedPlansPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Mock data for saved plans
  const [savedPlans, setSavedPlans] = useState([
    { id: '1', name: 'Weight Loss Plan', date: 'Created Apr 10, 2023', description: 'Low-calorie plan with high protein' },
    { id: '2', name: 'Muscle Building', date: 'Created May 15, 2023', description: 'High protein and carbs for workout days' },
    { id: '3', name: 'Vegetarian Week', date: 'Created Jun 22, 2023', description: 'Plant-based meals with complete proteins' },
  ]);

  const handleDelete = (id: string) => {
    setSavedPlans(savedPlans.filter(plan => plan.id !== id));
    toast({
      title: "Plan Deleted",
      description: "The meal plan has been removed from your saved plans.",
    });
  };

  const handleCopy = (id: string) => {
    toast({
      title: "Plan Duplicated",
      description: "A copy of the plan has been created.",
    });
  };

  const handleActivate = (id: string) => {
    toast({
      title: "Plan Activated",
      description: "This meal plan is now your active plan for the week.",
    });
    // In a real app, this would set the active plan in state/database
    navigate('/planning');
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Link to="/planning" className="mr-3">
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
        <PlusCircle size={18} className="mr-2 text-dishco-primary" />
        Create a new meal plan
      </Button>

      {/* Saved plans list */}
      <div className="space-y-4">
        {savedPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Calendar size={20} className="text-dishco-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-xs text-dishco-text-light">{plan.date}</p>
                    <p className="text-sm mt-1">{plan.description}</p>
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
        ))}
      </div>
    </div>
  );
};

export default SavedPlansPage;
