
import React from 'react';
import { Recipe } from '@/types/Recipe';
import { DragDropContext } from '@hello-pangea/dnd';
import { MealSectionsProvider } from './MealSectionsContext';
import RecipeDetailHandler from './recipe-dialog/RecipeDetailHandler';
import MealSection from './meal-section/MealSection';
import { handleMealPlanDragEnd } from './MealSectionsDragUtils';

interface MealSectionsProps {
  currentDayData: any;
  currentDay: number;
  lockedMeals: {[key: string]: boolean};
  toggleLockMeal: (mealType: string, index?: number) => void;
  onAddFromVault: (mealType: string, index?: number) => void;
  onMealClick: (recipe: Recipe) => void;
  updateMeal: (mealType: string, recipe: Recipe | null, index?: number) => void;
}

const MealSections: React.FC<MealSectionsProps> = ({
  currentDayData,
  currentDay,
  lockedMeals,
  toggleLockMeal,
  onAddFromVault,
  onMealClick,
  updateMeal
}) => {
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = React.useState(false);

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

  const handleDragEnd = (result: any) => {
    handleMealPlanDragEnd(result, currentDayData, updateMeal);
  };

  return (
    <MealSectionsProvider onMealClick={onMealClick}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4">
          {/* Breakfast */}
          <MealSection
            mealType="Breakfast"
            meals={currentDayData.meals.breakfast}
            lockedMeals={lockedMeals}
            toggleLock={toggleLockMeal}
            onAddFromVault={onAddFromVault}
            onMealClick={handleMealClick}
            currentDay={currentDay}
          />
          
          {/* Lunch */}
          <MealSection
            mealType="Lunch"
            meals={currentDayData.meals.lunch}
            lockedMeals={lockedMeals}
            toggleLock={toggleLockMeal}
            onAddFromVault={onAddFromVault}
            onMealClick={handleMealClick}
            currentDay={currentDay}
          />
          
          {/* Dinner */}
          <MealSection
            mealType="Dinner"
            meals={currentDayData.meals.dinner}
            lockedMeals={lockedMeals}
            toggleLock={toggleLockMeal}
            onAddFromVault={onAddFromVault}
            onMealClick={handleMealClick}
            currentDay={currentDay}
          />
          
          {/* Snacks */}
          <MealSection
            mealType="Snacks"
            meals={currentDayData.meals.snacks}
            lockedMeals={lockedMeals}
            toggleLock={toggleLockMeal}
            onAddFromVault={onAddFromVault}
            onMealClick={handleMealClick}
            currentDay={currentDay}
          />
        </div>

        {/* Recipe Detail Dialog */}
        <RecipeDetailHandler
          selectedRecipe={selectedRecipe}
          isRecipeDetailOpen={isRecipeDetailOpen}
          handleCloseRecipeDetail={handleCloseRecipeDetail}
          handleToggleSave={handleToggleSave}
        />
      </DragDropContext>
    </MealSectionsProvider>
  );
};

export default MealSections;
