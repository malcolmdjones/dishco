
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { recipes } from '@/data/mockData';
import { format, startOfWeek, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const PlanningPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    // Generate current week days
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    setWeekDays(days);

    // Check for active plan in session storage
    const storedPlan = sessionStorage.getItem('activePlan');
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        setActivePlan(parsedPlan);
      } catch (error) {
        console.error('Error parsing active plan:', error);
      }
    }
  }, []);

  const handleGeneratePlan = () => {
    navigate('/create-meal-plan');
  };

  // Get a selection of 4 recipes for display
  const recipeSelection = recipes.slice(0, 4);

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Meal Planning</h1>
        <p className="text-dishco-text-light">Plan your meals for the week</p>
      </header>

      <div className="space-y-6">
        {/* Weekly Overview */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Weekly Overview</h2>
            <Link to="/saved-plans">
              <Button variant="ghost" size="sm" className="text-xs">View Saved Plans</Button>
            </Link>
          </div>
          
          {activePlan ? (
            <div className="mt-2">
              <h3 className="font-medium mb-2">{activePlan.name || "Current Plan"}</h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day, index) => {
                  const dayPlan = activePlan.days && activePlan.days[index];
                  const hasData = dayPlan && 
                    (dayPlan.meals.breakfast || dayPlan.meals.lunch || dayPlan.meals.dinner);
                  
                  return (
                    <div 
                      key={index}
                      className={`p-2 rounded-md ${hasData ? 'bg-green-50' : 'bg-gray-50'}`}
                    >
                      <p className="text-xs font-medium">{format(day, 'EEE')}</p>
                      <p className="text-sm">{format(day, 'd')}</p>
                      {hasData && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 mb-2">No active meal plan</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => navigate('/saved-plans')}
              >
                Activate a plan
              </Button>
            </div>
          )}
        </div>

        {/* Generate Meal Plan Button */}
        <Button 
          className="w-full py-6 text-lg font-medium"
          onClick={handleGeneratePlan}
        >
          Generate a Meal Plan
          <ArrowRight className="ml-2" />
        </Button>

        {/* Discover Recipes */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              <span className="text-[#FF6B6B]">Dish</span>
              <span className="text-[#6B66FF]">cover</span> Recipes
            </h2>
            <Link to="/explore-recipes">
              <Button variant="ghost" size="sm">Explore Recipes</Button>
            </Link>
          </div>
          <p className="text-sm text-dishco-text-light mb-4">
            Discover new and exciting meal ideas tailored to your preferences.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {recipeSelection.map((recipe) => (
              <div key={recipe.id} className="cursor-pointer" onClick={() => navigate('/explore-recipes')}>
                <div className="bg-gray-100 rounded-lg aspect-square mb-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{recipe.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">{recipe.macros.calories} cal</span>
                  <span className="text-xs text-blue-600">{recipe.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;
