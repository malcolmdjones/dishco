
import React from 'react';
import { Recipe } from '@/data/mockData';
import MealCard from '@/components/meal-plan/MealCard';
import SnacksSection from '@/components/meal-plan/SnacksSection';

interface MealSectionsProps {
  currentDayData: any;
  currentDay: number;
  lockedMeals: {[key: string]: boolean};
  toggleLockMeal: (mealType: string, index?: number) => void;
  onAddFromVault: (mealType: string, index?: number) => void;
  onMealClick: (recipe: Recipe) => void;
}

const MealSections: React.FC<MealSectionsProps> = ({
  currentDayData,
  currentDay,
  lockedMeals,
  toggleLockMeal,
  onAddFromVault,
  onMealClick
}) => {
  if (!currentDayData) {
    return <div className="p-4">Loading meal plan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breakfast */}
      <MealCard 
        title="Breakfast"
        meal={currentDayData.meals.breakfast}
        isLocked={!!lockedMeals[`${currentDay}-breakfast`]}
        toggleLock={() => toggleLockMeal('breakfast')}
        onAddFromVault={() => onAddFromVault('breakfast')}
        onMealClick={onMealClick}
      />
      
      {/* Lunch */}
      <MealCard 
        title="Lunch"
        meal={currentDayData.meals.lunch}
        isLocked={!!lockedMeals[`${currentDay}-lunch`]}
        toggleLock={() => toggleLockMeal('lunch')}
        onAddFromVault={() => onAddFromVault('lunch')}
        onMealClick={onMealClick}
      />
      
      {/* Dinner */}
      <MealCard 
        title="Dinner"
        meal={currentDayData.meals.dinner}
        isLocked={!!lockedMeals[`${currentDay}-dinner`]}
        toggleLock={() => toggleLockMeal('dinner')}
        onAddFromVault={() => onAddFromVault('dinner')}
        onMealClick={onMealClick}
      />
      
      {/* Snacks */}
      <SnacksSection 
        snacks={currentDayData.meals.snacks || [null, null]}
        lockedSnacks={[
          !!lockedMeals[`${currentDay}-snack-0`],
          !!lockedMeals[`${currentDay}-snack-1`]
        ]}
        toggleLockSnack={(index) => toggleLockMeal('snack', index)}
        onAddFromVault={(index) => onAddFromVault('snack', index)}
        onSnackClick={onMealClick}
      />
    </div>
  );
};

export default MealSections;
