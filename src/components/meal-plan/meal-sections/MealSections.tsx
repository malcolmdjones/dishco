
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
      draggedRecipe = currentDayData.meals.breakfast;
    } else if (source.droppableId === 'lunch') {
      draggedRecipe = currentDayData.meals.lunch;
    } else if (source.droppableId === 'dinner') {
      draggedRecipe = currentDayData.meals.dinner;
    } else if (source.droppableId === 'snacks') {
      draggedRecipe = currentDayData.meals.snacks[source.index];
    }

    if (!draggedRecipe) return;

    // Remove from source
    if (source.droppableId === 'breakfast') {
      updateMeal('breakfast', null);
    } else if (source.droppableId === 'lunch') {
      updateMeal('lunch', null);
    } else if (source.droppableId === 'dinner') {
      updateMeal('dinner', null);
    } else if (source.droppableId === 'snacks') {
      updateMeal('snack', null, source.index);
    }

    // Add to destination
    if (destination.droppableId === 'breakfast') {
      updateMeal('breakfast', draggedRecipe);
    } else if (destination.droppableId === 'lunch') {
      updateMeal('lunch', draggedRecipe);
    } else if (destination.droppableId === 'dinner') {
      updateMeal('dinner', draggedRecipe);
    } else if (destination.droppableId === 'snacks') {
      updateMeal('snack', draggedRecipe, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <div className="grid grid-cols-1 gap-6">
          {/* Breakfast */}
          <Droppable droppableId="breakfast" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {currentDayData.meals.breakfast ? (
                  <Draggable 
                    draggableId={`breakfast-meal`} 
                    index={0}
                    isDragDisabled={!!lockedMeals[`${currentDay}-breakfast`]}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "opacity-70" : ""}
                      >
                        <MealCard 
                          title="Breakfast"
                          meal={currentDayData.meals.breakfast}
                          isLocked={!!lockedMeals[`${currentDay}-breakfast`]}
                          toggleLock={() => toggleLockMeal('breakfast')}
                          onAddFromVault={() => onAddFromVault('breakfast')}
                          onMealClick={handleMealClick}
                          isDraggable={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ) : (
                  <MealCard 
                    title="Breakfast"
                    meal={null}
                    isLocked={false}
                    toggleLock={() => {}}
                    onAddFromVault={() => onAddFromVault('breakfast')}
                    onMealClick={handleMealClick}
                    isDraggable={false}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {/* Lunch */}
          <Droppable droppableId="lunch" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {currentDayData.meals.lunch ? (
                  <Draggable 
                    draggableId={`lunch-meal`} 
                    index={0}
                    isDragDisabled={!!lockedMeals[`${currentDay}-lunch`]}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "opacity-70" : ""}
                      >
                        <MealCard 
                          title="Lunch"
                          meal={currentDayData.meals.lunch}
                          isLocked={!!lockedMeals[`${currentDay}-lunch`]}
                          toggleLock={() => toggleLockMeal('lunch')}
                          onAddFromVault={() => onAddFromVault('lunch')}
                          onMealClick={handleMealClick}
                          isDraggable={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ) : (
                  <MealCard 
                    title="Lunch"
                    meal={null}
                    isLocked={false}
                    toggleLock={() => {}}
                    onAddFromVault={() => onAddFromVault('lunch')}
                    onMealClick={handleMealClick}
                    isDraggable={false}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {/* Dinner */}
          <Droppable droppableId="dinner" type="MEAL">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {currentDayData.meals.dinner ? (
                  <Draggable 
                    draggableId={`dinner-meal`} 
                    index={0}
                    isDragDisabled={!!lockedMeals[`${currentDay}-dinner`]}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? "opacity-70" : ""}
                      >
                        <MealCard 
                          title="Dinner"
                          meal={currentDayData.meals.dinner}
                          isLocked={!!lockedMeals[`${currentDay}-dinner`]}
                          toggleLock={() => toggleLockMeal('dinner')}
                          onAddFromVault={() => onAddFromVault('dinner')}
                          onMealClick={handleMealClick}
                          isDraggable={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ) : (
                  <MealCard 
                    title="Dinner"
                    meal={null}
                    isLocked={false}
                    toggleLock={() => {}}
                    onAddFromVault={() => onAddFromVault('dinner')}
                    onMealClick={handleMealClick}
                    isDraggable={false}
                  />
                )}
                {provided.placeholder}
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
