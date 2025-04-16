
import React from 'react';
import { useNavigate } from 'react-router-dom';

import RecipeViewer from '@/components/RecipeViewer';
import { useHomePageUtils } from '@/hooks/useHomePageUtils';
import DateSelector from '@/components/home/DateSelector';
import DailyNutritionSummary from '@/components/home/DailyNutritionSummary';
import MealsList from '@/components/home/MealsList';
import CaloricBalanceOverview from '@/components/home/CaloricBalanceOverview';
import StreakCounter from '@/components/home/StreakCounter';
import WeeklyTargets from '@/components/home/WeeklyTargets';
import { useCaloricBalance } from '@/hooks/useCaloricBalance';
import { useStreakData } from '@/hooks/useStreakData';

const HomePage = () => {
  const navigate = useNavigate();
  const {
    selectedDate,
    selectedRecipe,
    isRecipeViewerOpen,
    isSaved,
    dailyNutrition,
    todaysMeals,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    handleOpenRecipe,
    handleToggleSave,
    handleToggleConsumed,
    handleRecipeConsumed,
    getMacroStatus,
    formatMealType,
    setIsRecipeViewerOpen,
    setSelectedRecipe
  } = useHomePageUtils();
  
  const caloricBalance = useCaloricBalance(selectedDate);
  const { streak, todayLogged } = useStreakData();

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Hi there 👋</h1>
        <p className="text-dishco-text-light">Track your meals and plan for the week</p>
      </header>
      
      <StreakCounter streak={streak} todayLogged={todayLogged} />
      
      <DateSelector 
        selectedDate={selectedDate}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        goToToday={goToToday}
      />
      
      <DailyNutritionSummary 
        dailyNutrition={dailyNutrition}
        getMacroStatus={getMacroStatus}
      />
      
      <CaloricBalanceOverview
        weeklyData={caloricBalance.weeklyData}
        averageCalories={caloricBalance.averageCalories}
        targetCalories={caloricBalance.targetCalories}
        missingLogDays={caloricBalance.missingLogDays}
      />
      
      <WeeklyTargets selectedDate={selectedDate} />
      
      <MealsList 
        todaysMeals={todaysMeals}
        navigate={navigate}
        handleOpenRecipe={handleOpenRecipe}
        handleToggleConsumed={handleToggleConsumed}
        formatMealType={formatMealType}
      />
      
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          isConsumed={!!todaysMeals.find(meal => {
            const mealRecipe = Array.isArray(meal.recipe) ? meal.recipe[0] : meal.recipe;
            return mealRecipe?.id === selectedRecipe.id && meal.consumed;
          })}
          onToggleConsumed={handleRecipeConsumed}
        />
      )}
    </div>
  );
};

export default HomePage;
