import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, Lock, RefreshCw, Save, Unlock } from 'lucide-react';
import { calculateDailyMacros, defaultGoals, generateMockMealPlan, recipes } from '../data/mockData';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const PlanningPage = () => {
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState(generateMockMealPlan());
  const [activeDay, setActiveDay] = useState(0);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayPlan = mealPlan[activeDay];
  const dailyMacros = calculateDailyMacros(currentDayPlan.meals);
  const goals = defaultGoals;

  // Calculate percentages for progress bars
  const percentages = {
    calories: Math.min(100, (dailyMacros.calories / goals.calories) * 100),
    protein: Math.min(100, (dailyMacros.protein / goals.protein) * 100),
    carbs: Math.min(100, (dailyMacros.carbs / goals.carbs) * 100),
    fat: Math.min(100, (dailyMacros.fat / goals.fat) * 100),
  };

  const handleLockMeal = (mealType: string, mealId: string) => {
    const key = `${mealType}-${mealId}`;
    setLockedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: lockedMeals[key] ? "Meal unlocked" : "Meal locked",
      description: "Your meal plan will preserve this selection.",
    });
  };

  const handleRegeneratePlan = () => {
    // In a real app, this would call the AI to regenerate the plan
    // Here we'll just generate new random meals while keeping locked ones
    const newPlan = generateMockMealPlan();
    
    // Preserve locked meals
    const updatedPlan = mealPlan.map((day, index) => {
      const newDay = newPlan[index];
      const updatedMeals = { ...newDay.meals };
      
      // Check each meal type
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        const mealKey = `${mealType}-${day.meals[mealType]?.id}`;
        if (lockedMeals[mealKey]) {
          updatedMeals[mealType] = day.meals[mealType];
        }
      });
      
      // Check snacks
      if (day.meals.snacks) {
        updatedMeals.snacks = day.meals.snacks.map((snack, snackIndex) => {
          const snackKey = `snacks-${snack?.id}-${snackIndex}`;
          return lockedMeals[snackKey] ? snack : newDay.meals.snacks[snackIndex];
        });
      }
      
      return {
        ...newDay,
        meals: updatedMeals
      };
    });
    
    setMealPlan(updatedPlan);
    
    toast({
      title: "Plan Regenerated",
      description: "Your meal plan has been refreshed while preserving locked meals.",
    });
  };

  const handleSavePlan = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Plan Saved",
      description: "Your meal plan has been saved successfully.",
      variant: "default",
    });
  };

  const navigateDay = (direction: number) => {
    const newDay = activeDay + direction;
    if (newDay >= 0 && newDay < days.length) {
      setActiveDay(newDay);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
        <p className="text-dishco-text-light">Plan and customize your meals</p>
      </header>

      {/* Day Selection */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateDay(-1)} 
          disabled={activeDay === 0}
          className={`p-2 rounded-full ${activeDay === 0 ? 'text-gray-300' : 'text-dishco-text'}`}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center">
          <Calendar size={18} className="mr-2 text-dishco-primary" />
          <h2 className="text-lg font-semibold">{days[activeDay]}</h2>
        </div>
        
        <button 
          onClick={() => navigateDay(1)} 
          disabled={activeDay === days.length - 1}
          className={`p-2 rounded-full ${activeDay === days.length - 1 ? 'text-gray-300' : 'text-dishco-text'}`}
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Daily Macros Summary Card */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-slide-up">
        <h2 className="text-lg font-semibold mb-3">Daily Nutrition</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span>Calories</span>
              <span className="font-medium">
                {dailyMacros.calories} / {goals.calories} kcal
                <span className={percentages.calories > 100 ? 'text-dishco-error ml-1' : ''}>
                  {percentages.calories > 100 ? '⚠️' : ''}
                </span>
              </span>
            </div>
            <Progress 
              value={percentages.calories} 
              className="h-2" 
              indicatorClassName={
                percentages.calories > 100 
                  ? 'bg-dishco-error' 
                  : percentages.calories > 90 
                    ? 'bg-dishco-accent' 
                    : 'bg-dishco-primary'
              } 
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Protein</span>
              <span className="font-medium">
                {dailyMacros.protein} / {goals.protein} g
                <span className={percentages.protein > 100 ? 'text-dishco-error ml-1' : ''}>
                  {percentages.protein > 100 ? '⚠️' : ''}
                </span>
              </span>
            </div>
            <Progress 
              value={percentages.protein} 
              className="h-2" 
              indicatorClassName={
                percentages.protein > 100 
                  ? 'bg-dishco-error' 
                  : percentages.protein > 90 
                    ? 'bg-dishco-accent' 
                    : 'bg-dishco-primary'
              } 
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Carbs</span>
              <span className="font-medium">
                {dailyMacros.carbs} / {goals.carbs} g
                <span className={percentages.carbs > 100 ? 'text-dishco-error ml-1' : ''}>
                  {percentages.carbs > 100 ? '⚠️' : ''}
                </span>
              </span>
            </div>
            <Progress 
              value={percentages.carbs} 
              className="h-2" 
              indicatorClassName={
                percentages.carbs > 100 
                  ? 'bg-dishco-error' 
                  : percentages.carbs > 90 
                    ? 'bg-dishco-accent' 
                    : 'bg-dishco-primary'
              } 
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Fat</span>
              <span className="font-medium">
                {dailyMacros.fat} / {goals.fat} g
                <span className={percentages.fat > 100 ? 'text-dishco-error ml-1' : ''}>
                  {percentages.fat > 100 ? '⚠️' : ''}
                </span>
              </span>
            </div>
            <Progress 
              value={percentages.fat} 
              className="h-2" 
              indicatorClassName={
                percentages.fat > 100 
                  ? 'bg-dishco-error' 
                  : percentages.fat > 90 
                    ? 'bg-dishco-accent' 
                    : 'bg-dishco-primary'
              } 
            />
          </div>
        </div>
      </div>

      {/* Meals Section */}
      <div className="space-y-4 mb-6">
        <MealCard 
          title="Breakfast" 
          meal={currentDayPlan.meals.breakfast}
          isLocked={lockedMeals[`breakfast-${currentDayPlan.meals.breakfast?.id}`]}
          onLockToggle={() => handleLockMeal('breakfast', currentDayPlan.meals.breakfast?.id)}
        />
        
        <MealCard 
          title="Lunch" 
          meal={currentDayPlan.meals.lunch}
          isLocked={lockedMeals[`lunch-${currentDayPlan.meals.lunch?.id}`]}
          onLockToggle={() => handleLockMeal('lunch', currentDayPlan.meals.lunch?.id)}
        />
        
        <MealCard 
          title="Dinner" 
          meal={currentDayPlan.meals.dinner}
          isLocked={lockedMeals[`dinner-${currentDayPlan.meals.dinner?.id}`]}
          onLockToggle={() => handleLockMeal('dinner', currentDayPlan.meals.dinner?.id)}
        />
        
        <div>
          <h3 className="font-medium mb-2">Snacks</h3>
          <div className="space-y-3">
            {currentDayPlan.meals.snacks?.map((snack, index) => (
              snack && (
                <MealCard 
                  key={index}
                  title={`Snack ${index + 1}`} 
                  meal={snack}
                  isLocked={lockedMeals[`snacks-${snack?.id}-${index}`]}
                  onLockToggle={() => handleLockMeal(`snacks-${snack?.id}`, index.toString())}
                  isSnack={true}
                />
              )
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={handleRegeneratePlan} className="btn-secondary flex items-center justify-center">
          <RefreshCw size={18} className="mr-2" />
          <span>Regenerate</span>
        </button>
        
        <button onClick={handleSavePlan} className="btn-primary flex items-center justify-center">
          <Save size={18} className="mr-2" />
          <span>Save Plan</span>
        </button>
      </div>
    </div>
  );
};

interface MealCardProps {
  title: string;
  meal: any;
  isLocked: boolean;
  onLockToggle: () => void;
  isSnack?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ 
  title, meal, isLocked, onLockToggle, isSnack = false 
}) => {
  return meal ? (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${!isSnack ? 'animate-bounce-in' : 'animate-scale-in'}`}>
      <div className="relative">
        <img 
          src={meal.imageSrc} 
          alt={meal.name} 
          className="w-full h-32 object-cover"
        />
        
        {/* Lock/Unlock Button */}
        <button 
          onClick={onLockToggle}
          className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded-full shadow-sm"
        >
          {isLocked ? (
            <Lock size={18} className="text-dishco-primary" />
          ) : (
            <Unlock size={18} className="text-dishco-text-light" />
          )}
        </button>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
          </div>
          <div className="bg-dishco-secondary bg-opacity-20 rounded-full px-2 py-0.5">
            <span className="text-xs font-medium">{meal.macros.calories} kcal</span>
          </div>
        </div>
        
        <p className="mt-1 font-semibold">{meal.name}</p>
        <p className="text-sm text-dishco-text-light line-clamp-2 mt-1">{meal.description}</p>
        
        {/* Macro Pills */}
        <div className="flex mt-3 space-x-2">
          <span className="macro-pill macro-pill-protein">P: {meal.macros.protein}g</span>
          <span className="macro-pill macro-pill-carbs">C: {meal.macros.carbs}g</span>
          <span className="macro-pill macro-pill-fat">F: {meal.macros.fat}g</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-dashed border-gray-300 flex justify-center items-center h-40">
      <button className="flex flex-col items-center text-dishco-primary">
        <div className="w-12 h-12 rounded-full bg-dishco-primary bg-opacity-10 flex items-center justify-center mb-2">
          <Plus size={24} className="text-dishco-primary" />
        </div>
        <span>Add {title}</span>
      </button>
    </div>
  );
};

// Plus icon component for the MealCard
const Plus = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default PlanningPage;
