
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import DailyNavigationCalendar from '@/components/meal-plan/DailyNavigationCalendar';
import DailyNutritionCard from '@/components/meal-plan/DailyNutritionCard';
import BottomActionBar from '@/components/meal-plan/BottomActionBar';
import MealSections from '@/components/meal-plan/meal-sections/MealSections';
import SavePlanDialog from '@/components/SavePlanDialog';

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
  onOpenVault: (mealType: string, index?: number) => void;
  updateMeal: (mealType: string, recipe: Recipe | null, index?: number) => void;
  userGoals: any;
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
  checkExceedsGoals,
  onOpenVault,
  updateMeal,
  userGoals
}) => {
  // Get current day's data
  const currentDayData = mealPlan[currentDay];
  const dayTotals = calculateDayTotals();
  const goalExceeds = checkExceedsGoals();
  
  // State for save dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  return (
    <div className="pb-24 px-4 animate-fade-in">
      {/* Weekly Calendar Navigation */}
      <DailyNavigationCalendar 
        mealPlan={mealPlan}
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
      />

      {/* Daily Nutrition Card */}
      <DailyNutritionCard 
        dayTotals={dayTotals}
        userGoals={userGoals}
        exceedsGoals={goalExceeds}
      />

      {/* Meal Sections */}
      <MealSections
        currentDayData={currentDayData}
        currentDay={currentDay}
        lockedMeals={lockedMeals}
        toggleLockMeal={toggleLockMeal}
        onAddFromVault={onOpenVault}
        onMealClick={() => {}} // We'll handle recipe viewing in a future update
        updateMeal={updateMeal}
      />

      {/* Bottom Action Buttons */}
      <BottomActionBar 
        onRegenerate={regenerateMeals}
        onSave={() => setIsSaveDialogOpen(true)}
        isGenerating={isGenerating}
      />

      {/* Save Plan Dialog */}
      <SavePlanDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        mealPlan={mealPlan}
      />
    </div>
  );
};

export default CreateMealPlanContent;
