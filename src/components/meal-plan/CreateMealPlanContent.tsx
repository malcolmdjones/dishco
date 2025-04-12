
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import DailyNavigationCalendar from '@/components/meal-plan/DailyNavigationCalendar';
import DailyNutritionCard from '@/components/meal-plan/DailyNutritionCard';
import BottomActionBar from '@/components/meal-plan/BottomActionBar';
import MealSections from '@/components/meal-plan/meal-sections/MealSections';
import SavePlanDialog from '@/components/SavePlanDialog';
import { Loader2 } from 'lucide-react';

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
  preferences?: any;
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
  userGoals,
  preferences
}) => {
  // Get current day's data
  const currentDayData = mealPlan[currentDay];
  const dayTotals = calculateDayTotals();
  const goalExceeds = checkExceedsGoals();
  
  // State for save dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  if (isGenerating || !currentDayData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Creating your meal plan</h2>
        <p className="text-center text-muted-foreground max-w-md">
          We're generating a personalized meal plan based on your preferences and nutrition goals. This will just take a moment...
        </p>
      </div>
    );
  }

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

      {/* Display preferences as pills if they exist */}
      {preferences && (Object.keys(preferences).length > 1) && (
        <div className="my-3 flex flex-wrap gap-1">
          {preferences.mealMood?.map((mood: string) => (
            <span 
              key={`mood-${mood}`} 
              className="bg-blue-100 text-blue-800 text-xs font-medium py-0.5 px-2 rounded-full"
            >
              {mood}
            </span>
          ))}
          {preferences.proteinFocus?.map((protein: string) => (
            <span 
              key={`protein-${protein}`} 
              className="bg-green-100 text-green-800 text-xs font-medium py-0.5 px-2 rounded-full"
            >
              {protein}
            </span>
          ))}
          {preferences.cravings?.map((craving: string) => (
            <span 
              key={`craving-${craving}`} 
              className="bg-yellow-100 text-yellow-800 text-xs font-medium py-0.5 px-2 rounded-full"
            >
              {craving}
            </span>
          ))}
          {preferences.cuisineVibes?.map((cuisine: string) => (
            <span 
              key={`cuisine-${cuisine}`} 
              className="bg-purple-100 text-purple-800 text-xs font-medium py-0.5 px-2 rounded-full"
            >
              {cuisine}
            </span>
          ))}
        </div>
      )}

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
