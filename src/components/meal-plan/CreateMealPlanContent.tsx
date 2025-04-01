
import React from 'react';
import { Recipe } from '@/data/mockData';
import DailyNavigationCalendar from '@/components/meal-plan/DailyNavigationCalendar';
import DailyNutritionCard from '@/components/meal-plan/DailyNutritionCard';
import BottomActionBar from '@/components/meal-plan/BottomActionBar';
import MealPlanDialogHandlers from '@/components/meal-plan/dialog-handlers/MealPlanDialogHandlers';
import MealSections from '@/components/meal-plan/meal-sections/MealSections';

interface CreateMealPlanContentProps {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  mealPlan: any[];
  isGenerating: boolean;
  lockedMeals: {[key: string]: boolean};
  toggleLockMeal: (mealType: string, index?: number) => void;
  regenerateMeals: () => void;
  calculateDayTotals: () => any;
  checkExceedsGoals: () => any;
}

const CreateMealPlanContent: React.FC<CreateMealPlanContentProps> = ({
  currentDay,
  setCurrentDay,
  mealPlan,
  isGenerating,
  lockedMeals,
  toggleLockMeal,
  regenerateMeals,
  calculateDayTotals,
  checkExceedsGoals
}) => {
  // Get current day's data
  const currentDayData = mealPlan[currentDay];
  const dayTotals = calculateDayTotals();
  const goalExceeds = checkExceedsGoals();

  // Handle adding a recipe from the vault to the meal plan
  const handleAddFromVault = (recipe: Recipe, mealType: string, index?: number) => {
    // Clone current meal plan
    const newMealPlan = [...mealPlan];
    const currentDayData = { ...newMealPlan[currentDay] };
    const currentMeals = { ...currentDayData.meals };
    
    // Update based on meal type
    if (mealType === 'breakfast') {
      currentMeals.breakfast = recipe;
    } else if (mealType === 'lunch') {
      currentMeals.lunch = recipe;
    } else if (mealType === 'dinner') {
      currentMeals.dinner = recipe;
    } else if (mealType === 'snack' && index !== undefined) {
      const newSnacks = [...(currentMeals.snacks || [])];
      newSnacks[index] = recipe;
      currentMeals.snacks = newSnacks;
    }
    
    currentDayData.meals = currentMeals;
    newMealPlan[currentDay] = currentDayData;
    
    // No need to call setMealPlan as it's handled by the hook
  };

  return (
    <div className="pb-20 animate-fade-in">
      <MealPlanDialogHandlers mealPlan={mealPlan}>
        {({
          handleRecipeClick,
          handleSavePlan,
          handleOpenVault,
          isRecipeViewerOpen,
          isSavePlanDialogOpen,
          isWeekOverviewOpen,
          isRecipeVaultOpen,
        }) => (
          <>
            {/* Weekly Calendar Navigation */}
            <DailyNavigationCalendar 
              mealPlan={mealPlan}
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
            />

            {/* Daily Nutrition Card */}
            <DailyNutritionCard 
              dayTotals={dayTotals}
              userGoals={calculateDayTotals()}
              exceedsGoals={goalExceeds}
            />

            {/* Meal Sections */}
            <MealSections
              currentDayData={currentDayData}
              currentDay={currentDay}
              lockedMeals={lockedMeals}
              toggleLockMeal={toggleLockMeal}
              onAddFromVault={handleOpenVault}
              onMealClick={handleRecipeClick}
            />

            {/* Bottom Action Buttons */}
            <BottomActionBar 
              onRegenerate={regenerateMeals}
              onSave={handleSavePlan}
              isGenerating={isGenerating}
            />
          </>
        )}
      </MealPlanDialogHandlers>
    </div>
  );
};

export default CreateMealPlanContent;
