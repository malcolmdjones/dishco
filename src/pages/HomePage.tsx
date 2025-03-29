
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Lock, LucideIcon } from 'lucide-react';
import { calculateDailyMacros, defaultGoals, recipes } from '../data/mockData';
import { Progress } from '@/components/ui/progress';

const HomePage = () => {
  const [todayMeals, setTodayMeals] = useState({
    breakfast: recipes.find(r => r.id === '2'), // Avocado Toast
    lunch: recipes.find(r => r.id === '4'),     // Chicken Salad
    dinner: recipes.find(r => r.id === '7'),    // Salmon with Asparagus
    snacks: [
      recipes.find(r => r.id === '11'),         // Greek Yogurt Cup
      recipes.find(r => r.id === '13'),         // Trail Mix
    ],
  });

  const dailyMacros = calculateDailyMacros(todayMeals);
  const goals = defaultGoals;

  // Calculate percentages for progress bars
  const percentages = {
    calories: Math.min(100, (dailyMacros.calories / goals.calories) * 100),
    protein: Math.min(100, (dailyMacros.protein / goals.protein) * 100),
    carbs: Math.min(100, (dailyMacros.carbs / goals.carbs) * 100),
    fat: Math.min(100, (dailyMacros.fat / goals.fat) * 100),
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-dishco-error';
    if (percentage > 90) return 'bg-dishco-accent';
    return 'bg-dishco-primary';
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Today's Meals</h1>
        <p className="text-dishco-text-light">Track your meals and macros</p>
      </header>

      {/* Daily Macros Summary Card */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-slide-up">
        <h2 className="text-lg font-semibold mb-3">Daily Nutrition</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span>Calories</span>
              <span className="font-medium">
                {dailyMacros.calories} / {goals.calories} kcal
              </span>
            </div>
            <Progress value={percentages.calories} className="h-2" 
                     indicatorClassName={getProgressColor(percentages.calories)} />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Protein</span>
              <span className="font-medium">
                {dailyMacros.protein} / {goals.protein} g
              </span>
            </div>
            <Progress value={percentages.protein} className="h-2" 
                     indicatorClassName={getProgressColor(percentages.protein)} />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Carbs</span>
              <span className="font-medium">
                {dailyMacros.carbs} / {goals.carbs} g
              </span>
            </div>
            <Progress value={percentages.carbs} className="h-2" 
                     indicatorClassName={getProgressColor(percentages.carbs)} />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Fat</span>
              <span className="font-medium">
                {dailyMacros.fat} / {goals.fat} g
              </span>
            </div>
            <Progress value={percentages.fat} className="h-2" 
                     indicatorClassName={getProgressColor(percentages.fat)} />
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        <MealSection 
          title="Breakfast" 
          meal={todayMeals.breakfast} 
          time="7:00 - 9:00 AM" 
          completed={false}
        />
        
        <MealSection 
          title="Lunch" 
          meal={todayMeals.lunch} 
          time="12:00 - 2:00 PM" 
          completed={false}
        />
        
        <MealSection 
          title="Dinner" 
          meal={todayMeals.dinner} 
          time="6:00 - 8:00 PM" 
          completed={false}
        />
        
        <div>
          <h3 className="font-medium mb-2">Snacks</h3>
          <div className="space-y-3">
            {todayMeals.snacks?.map((snack, index) => (
              snack && (
                <MealSection 
                  key={index}
                  title={`Snack ${index + 1}`} 
                  meal={snack} 
                  time={index === 0 ? "10:00 AM" : "3:00 PM"} 
                  completed={false}
                  isSnack={true}
                />
              )
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Plan Button */}
      <Link to="/planning" className="btn-primary w-full mt-8 flex items-center justify-center">
        <span>Plan Your Week</span>
        <ArrowRight className="ml-2" size={18} />
      </Link>
    </div>
  );
};

interface MealSectionProps {
  title: string;
  meal: any;
  time: string;
  completed: boolean;
  isSnack?: boolean;
}

const MealSection: React.FC<MealSectionProps> = ({ 
  title, meal, time, completed, isSnack = false 
}) => {
  return meal ? (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${!isSnack ? 'animate-bounce-in' : 'animate-scale-in'}`}>
      <div className="flex items-center">
        {/* Image */}
        <div className="w-20 h-20 bg-gray-200 relative">
          <img 
            src={meal.imageSrc} 
            alt={meal.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Lock size={16} className="text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-sm">{title}</h3>
              <p className="text-sm text-dishco-text-light">{time}</p>
            </div>
            <div className="bg-dishco-secondary bg-opacity-20 rounded-full px-2 py-0.5">
              <span className="text-xs font-medium">{meal.macros.calories} kcal</span>
            </div>
          </div>
          <p className="mt-1 font-medium">{meal.name}</p>
        </div>
      </div>
      
      {/* Macro Pills */}
      <div className="flex px-3 pb-3 space-x-2 mt-1">
        <span className="macro-pill macro-pill-protein">P: {meal.macros.protein}g</span>
        <span className="macro-pill macro-pill-carbs">C: {meal.macros.carbs}g</span>
        <span className="macro-pill macro-pill-fat">F: {meal.macros.fat}g</span>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-dashed border-gray-300 flex justify-center items-center">
      <button className="flex items-center text-dishco-primary">
        <Plus size={18} className="mr-1" />
        <span>Add {title}</span>
      </button>
    </div>
  );
};

export default HomePage;
