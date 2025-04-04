
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import MealCard from '@/components/meal-plan/MealCard';
import SnacksSection from '@/components/meal-plan/SnacksSection';
import RecipeDetail from '@/components/RecipeDetail';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';

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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

  if (!currentDayData) {
    return <div className="p-4">Loading meal plan...</div>;
  }

  const handleMealClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeDetailOpen(true);
    // Also call the parent onMealClick if needed
    onMealClick(recipe);
  };

  const handleCloseRecipeDetail = () => {
    setIsRecipeDetailOpen(false);
    setSelectedRecipe(null);
  };

  const handleToggleSave = (recipeId: string, isSaved: boolean) => {
    // This would typically update some state or call an API
    console.log(`Recipe ${recipeId} saved state: ${isSaved}`);
    return Promise.resolve();
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        {/* Breakfast */}
        <MealCard 
          title="Breakfast"
          meal={currentDayData.meals.breakfast}
          isLocked={!!lockedMeals[`${currentDay}-breakfast`]}
          toggleLock={() => toggleLockMeal('breakfast')}
          onAddFromVault={() => onAddFromVault('breakfast')}
          onMealClick={handleMealClick}
        />
        
        {/* Lunch */}
        <MealCard 
          title="Lunch"
          meal={currentDayData.meals.lunch}
          isLocked={!!lockedMeals[`${currentDay}-lunch`]}
          toggleLock={() => toggleLockMeal('lunch')}
          onAddFromVault={() => onAddFromVault('lunch')}
          onMealClick={handleMealClick}
        />
        
        {/* Dinner */}
        <MealCard 
          title="Dinner"
          meal={currentDayData.meals.dinner}
          isLocked={!!lockedMeals[`${currentDay}-dinner`]}
          toggleLock={() => toggleLockMeal('dinner')}
          onAddFromVault={() => onAddFromVault('dinner')}
          onMealClick={handleMealClick}
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
          onSnackClick={handleMealClick}
        />
      </div>

      {/* Recipe Detail Dialog */}
      {selectedRecipe && isRecipeDetailOpen && (
        <RecipeDetail
          recipeId={selectedRecipe.id}
          onClose={handleCloseRecipeDetail}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
};

export default MealSections;
