
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Heart, Plus, UtensilsCrossed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { calculateDailyMacros, defaultGoals } from '@/data/mockData';
import HomeRecipeViewer from '@/components/HomeRecipeViewer';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data for today's meal plan
  const todayPlan = {
    breakfast: {
      id: '1',
      name: 'Avocado Toast with Eggs',
      calories: 450,
      protein: 22,
      image: '/placeholder.svg',
    },
    lunch: {
      id: '2',
      name: 'Greek Salad with Grilled Chicken',
      calories: 380,
      protein: 32,
      image: '/placeholder.svg',
    },
    dinner: {
      id: '3',
      name: 'Salmon with Roasted Vegetables',
      calories: 520,
      protein: 38,
      image: '/placeholder.svg',
    }
  };
  
  // Mock nutrition data
  const dailyNutrition = {
    calories: 1350,
    totalCalories: 2000,
    protein: 92,
    totalProtein: 150,
    carbs: 130,
    totalCarbs: 200,
    fat: 50,
    totalFat: 65
  };

  const caloriesPercentage = (dailyNutrition.calories / dailyNutrition.totalCalories) * 100;
  const proteinPercentage = (dailyNutrition.protein / dailyNutrition.totalProtein) * 100;
  const carbsPercentage = (dailyNutrition.carbs / dailyNutrition.totalCarbs) * 100;
  const fatPercentage = (dailyNutrition.fat / dailyNutrition.totalFat) * 100;

  // Color definitions for macros
  const macroColors = {
    calories: '#FFF4D7',
    protein: '#DBE9FE',
    carbs: '#FEF9C3',
    fat: '#F3E8FF'
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Hi there 👋</h1>
        <p className="text-dishco-text-light">Track your meals and plan for the week</p>
      </header>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Nutrition</h2>
            <Link to="/nutrition-goals">
              <Button variant="ghost" size="sm" className="text-xs">Adjust Goals</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-2">
                <CircularProgressbar
                  value={caloriesPercentage}
                  text={`${dailyNutrition.calories}`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: macroColors.calories,
                    textColor: '#3C3C3C',
                    trailColor: '#F9F9F9',
                  })}
                />
              </div>
              <span className="text-xs text-center">
                Calories
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-2">
                <CircularProgressbar
                  value={proteinPercentage}
                  text={`${dailyNutrition.protein}g`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: macroColors.protein,
                    textColor: '#3C3C3C',
                    trailColor: '#F9F9F9',
                  })}
                />
              </div>
              <span className="text-xs text-center">
                Protein
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-2">
                <CircularProgressbar
                  value={carbsPercentage}
                  text={`${dailyNutrition.carbs}g`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: macroColors.carbs,
                    textColor: '#3C3C3C',
                    trailColor: '#F9F9F9',
                  })}
                />
              </div>
              <span className="text-xs text-center">
                Carbs
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-2">
                <CircularProgressbar
                  value={fatPercentage}
                  text={`${dailyNutrition.fat}g`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: macroColors.fat,
                    textColor: '#3C3C3C',
                    trailColor: '#F9F9F9',
                  })}
                />
              </div>
              <span className="text-xs text-center">
                Fat
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <Link to="/log-meal">
              <Button className="w-full flex items-center justify-center gap-2">
                <UtensilsCrossed size={18} />
                Log a Meal
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recipes</h2>
            <Link to="/saved-recipes">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </div>
          
          <HomeRecipeViewer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
