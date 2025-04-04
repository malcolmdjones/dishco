
import React, { useState } from 'react';
import { Recipe } from '@/data/mockData';
import MealCard from '@/components/meal-plan/MealCard';
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
    let meals = { ...currentDayData.meals };
    
    // Handle different source types
    if (source.droppableId === 'breakfast') {
      if (Array.isArray(meals.breakfast) && meals.breakfast[source.index]) {
        draggedRecipe = meals.breakfast[source.index];
      } else if (meals.breakfast) {
        draggedRecipe = meals.breakfast;
      }
    } else if (source.droppableId === 'lunch') {
      if (Array.isArray(meals.lunch) && meals.lunch[source.index]) {
        draggedRecipe = meals.lunch[source.index];
      } else if (meals.lunch) {
        draggedRecipe = meals.lunch;
      }
    } else if (source.droppableId === 'dinner') {
      if (Array.isArray(meals.dinner) && meals.dinner[source.index]) {
        draggedRecipe = meals.dinner[source.index];
      } else if (meals.dinner) {
        draggedRecipe = meals.dinner;
      }
    } else if (source.droppableId === 'snacks') {
      if (Array.isArray(meals.snacks) && meals.snacks[source.index]) {
        draggedRecipe = meals.snacks[source.index];
      }
    }

    if (!draggedRecipe) return;

    // Remove from source
    if (source.droppableId === 'breakfast') {
      if (Array.isArray(meals.breakfast)) {
        const newBreakfast = [...meals.breakfast];
        newBreakfast[source.index] = null;
        updateMeal('breakfast', null, source.index);
      } else {
        updateMeal('breakfast', null);
      }
    } else if (source.droppableId === 'lunch') {
      if (Array.isArray(meals.lunch)) {
        const newLunch = [...meals.lunch];
        newLunch[source.index] = null;
        updateMeal('lunch', null, source.index);
      } else {
        updateMeal('lunch', null);
      }
    } else if (source.droppableId === 'dinner') {
      if (Array.isArray(meals.dinner)) {
        const newDinner = [...meals.dinner];
        newDinner[source.index] = null;
        updateMeal('dinner', null, source.index);
      } else {
        updateMeal('dinner', null);
      }
    } else if (source.droppableId === 'snacks') {
      if (Array.isArray(meals.snacks)) {
        updateMeal('snack', null, source.index);
      }
    }

    // Add to destination
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

  // Helper function to render a meal section
  const renderMealSection = (mealType: string, meals: Recipe[] | Recipe | null) => {
    const mealArray = Array.isArray(meals) ? meals : (meals ? [meals] : [null]);
    
    return (
      <Droppable droppableId={mealType.toLowerCase()} type="MEAL">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="meal-section"
          >
            <h3 className="font-medium text-lg mb-2">{mealType}</h3>
            {mealArray.length > 0 ? (
              mealArray.map((meal, index) => (
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
                        title=""
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
              ))
            ) : (
              <div className="mb-6">
                <MealCard 
                  title=""
                  meal={null}
                  isLocked={false}
                  toggleLock={() => {}}
                  onAddFromVault={() => onAddFromVault(mealType.toLowerCase())}
                  onMealClick={handleMealClick}
                  isDraggable={false}
                />
              </div>
            )}
            {provided.placeholder}
            <div className="mb-6 mt-2 text-center">
              <button 
                onClick={() => onAddFromVault(mealType.toLowerCase())}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add {mealType.toLowerCase()} item
              </button>
            </div>
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <div className="grid grid-cols-1 gap-4">
          {/* Breakfast */}
          {renderMealSection("Breakfast", currentDayData.meals.breakfast)}
          
          {/* Lunch */}
          {renderMealSection("Lunch", currentDayData.meals.lunch)}
          
          {/* Dinner */}
          {renderMealSection("Dinner", currentDayData.meals.dinner)}
          
          {/* Snacks */}
          {renderMealSection("Snacks", currentDayData.meals.snacks)}
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
