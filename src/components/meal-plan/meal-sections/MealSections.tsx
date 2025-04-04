
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import MealCard from '@/components/meal-plan/MealCard';
import SnacksSection from '@/components/meal-plan/SnacksSection';
import RecipeDetail from '@/components/RecipeDetail';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Get the recipe that was dragged
    let draggedRecipe: Recipe | null = null;
    
    // Handle different source types
    if (source.droppableId === 'breakfast') {
      if (Array.isArray(currentDayData.meals.breakfast)) {
        draggedRecipe = currentDayData.meals.breakfast[source.index];
      } else {
        draggedRecipe = currentDayData.meals.breakfast;
      }
    } else if (source.droppableId === 'lunch') {
      if (Array.isArray(currentDayData.meals.lunch)) {
        draggedRecipe = currentDayData.meals.lunch[source.index];
      } else {
        draggedRecipe = currentDayData.meals.lunch;
      }
    } else if (source.droppableId === 'dinner') {
      if (Array.isArray(currentDayData.meals.dinner)) {
        draggedRecipe = currentDayData.meals.dinner[source.index];
      } else {
        draggedRecipe = currentDayData.meals.dinner;
      }
    } else if (source.droppableId === 'snacks') {
      draggedRecipe = currentDayData.meals.snacks[source.index];
    }

    if (!draggedRecipe) return;

    // Add to destination (without removing from source for now - that's the key change)
    // The updateMeal function will need to be modified to append rather than replace
    if (destination.droppableId === 'breakfast') {
      updateMeal('breakfast', draggedRecipe, destination.index);
    } else if (destination.droppableId === 'lunch') {
      updateMeal('lunch', draggedRecipe, destination.index);
    } else if (destination.droppableId === 'dinner') {
      updateMeal('dinner', draggedRecipe, destination.index);
    } else if (destination.droppableId === 'snacks') {
      updateMeal('snack', draggedRecipe, destination.index);
    }
  };

  // Helper function to render meal items
  const renderMealItems = (mealType: string, meals: Recipe | Recipe[] | null) => {
    // If meals is null, render empty state
    if (!meals) {
      return (
        <MealCard 
          title={mealType}
          meal={null}
          isLocked={false}
          toggleLock={() => {}}
          onAddFromVault={() => onAddFromVault(mealType.toLowerCase())}
          onMealClick={handleMealClick}
          isDraggable={false}
        />
      );
    }

    // Convert single meal to array for consistent handling
    const mealArray = Array.isArray(meals) ? meals : [meals];
    
    return mealArray.map((meal, index) => (
      <Draggable 
        key={`${mealType}-${index}-${meal?.id || 'empty'}`}
        draggableId={`${mealType}-${index}-${meal?.id || 'empty'}`} 
        index={index}
        isDragDisabled={!!lockedMeals[`${currentDay}-${mealType.toLowerCase()}-${index}`]}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={snapshot.isDragging ? "opacity-70 mb-6" : "mb-6"}
          >
            <MealCard 
              title={index === 0 ? mealType : ""}
              meal={meal}
              isLocked={!!lockedMeals[`${currentDay}-${mealType.toLowerCase()}-${index}`]}
              toggleLock={() => toggleLockMeal(mealType.toLowerCase(), index)}
              onAddFromVault={() => onAddFromVault(mealType.toLowerCase(), index)}
              onMealClick={handleMealClick}
              isDraggable={true}
            />
          </div>
        )}
      </Draggable>
    ));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <div className="grid grid-cols-1 gap-4">
          {/* Breakfast */}
          <Droppable droppableId="breakfast" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="meal-section"
              >
                {renderMealItems("Breakfast", currentDayData.meals.breakfast)}
                {provided.placeholder}
                <div className="mb-6 mt-2 text-center">
                  <button 
                    onClick={() => onAddFromVault('breakfast')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add breakfast item
                  </button>
                </div>
              </div>
            )}
          </Droppable>
          
          {/* Lunch */}
          <Droppable droppableId="lunch" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="meal-section"
              >
                {renderMealItems("Lunch", currentDayData.meals.lunch)}
                {provided.placeholder}
                <div className="mb-6 mt-2 text-center">
                  <button 
                    onClick={() => onAddFromVault('lunch')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add lunch item
                  </button>
                </div>
              </div>
            )}
          </Droppable>
          
          {/* Dinner */}
          <Droppable droppableId="dinner" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="meal-section"
              >
                {renderMealItems("Dinner", currentDayData.meals.dinner)}
                {provided.placeholder}
                <div className="mb-6 mt-2 text-center">
                  <button 
                    onClick={() => onAddFromVault('dinner')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add dinner item
                  </button>
                </div>
              </div>
            )}
          </Droppable>
          
          {/* Snacks */}
          <Droppable droppableId="snacks" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <SnacksSection 
                  snacks={currentDayData.meals.snacks || [null, null]}
                  lockedSnacks={[
                    !!lockedMeals[`${currentDay}-snack-0`],
                    !!lockedMeals[`${currentDay}-snack-1`]
                  ]}
                  toggleLockSnack={(index) => toggleLockMeal('snack', index)}
                  onAddFromVault={(index) => onAddFromVault('snack', index)}
                  onSnackClick={handleMealClick}
                  isDraggable={true}
                  currentDay={currentDay}
                  updateMeal={updateMeal}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
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
    </DragDropContext>
  );
};

export default MealSections;
