import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const PlanningPage = () => {
  const { toast } = useToast();
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 800,
    totalCalories: 2000,
    protein: 60,
    totalProtein: 150,
    carbs: 80,
    totalCarbs: 200,
    fat: 30,
    totalFat: 65
  });

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
          <p className="text-sm text-dishco-text-light">
            Here's a summary of your planned meals for the week.
          </p>
          {/* Placeholder for weekly calendar/summary */}
          <div className="mt-4 text-center">
            <Calendar size={48} className="mx-auto text-gray-300" />
            <p className="text-gray-400">Coming soon: Weekly meal plan view</p>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
          <div className="grid grid-cols-2 gap-4">
            <Progress 
              type="circular" 
              size="sm"
              value={dailyNutrition.calories} 
              max={dailyNutrition.totalCalories}
              showValue={true}
              valueSuffix=""
              label="Calories"
              status="default"
            />
            <Progress 
              type="circular" 
              size="sm"
              value={dailyNutrition.protein} 
              max={dailyNutrition.totalProtein}
              showValue={true}
              valueSuffix="g"
              label="Protein"
              status="default"
            />
            <Progress 
              type="circular" 
              size="sm"
              value={dailyNutrition.carbs} 
              max={dailyNutrition.totalCarbs}
              showValue={true}
              valueSuffix="g"
              label="Carbs"
              status="default"
            />
            <Progress 
              type="circular" 
              size="sm"
              value={dailyNutrition.fat} 
              max={dailyNutrition.totalFat}
              showValue={true}
              valueSuffix="g"
              label="Fat"
              status="default"
            />
          </div>
          <p className="mt-4 text-sm text-dishco-text-light">
            Track your daily macros and stay on top of your nutrition goals.
          </p>
        </div>

        {/* Meal Suggestions */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Meal Suggestions</h2>
            <Link to="/saved-recipes">
              <Button variant="ghost" size="sm" className="text-xs">Explore Recipes</Button>
            </Link>
          </div>
          <p className="text-sm text-dishco-text-light">
            Discover new and exciting meal ideas tailored to your preferences.
          </p>
          {/* Placeholder for meal suggestions */}
          <div className="mt-4 text-center">
            <Calendar size={48} className="mx-auto text-gray-300" />
            <p className="text-gray-400">Coming soon: Personalized meal suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;
