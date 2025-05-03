
import { Recipe } from '@/types/Recipe';

export const handleMealPlanDragEnd = (
  result: any, 
  currentDayData: any, 
  updateMeal: (mealType: string, recipe: Recipe | null, index?: number) => void
) => {
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
      updateMeal('breakfast', null, source.index);
    } else {
      updateMeal('breakfast', null);
    }
  } else if (source.droppableId === 'lunch') {
    if (Array.isArray(meals.lunch)) {
      updateMeal('lunch', null, source.index);
    } else {
      updateMeal('lunch', null);
    }
  } else if (source.droppableId === 'dinner') {
    if (Array.isArray(meals.dinner)) {
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
