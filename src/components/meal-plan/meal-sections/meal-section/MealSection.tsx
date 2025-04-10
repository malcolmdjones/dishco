
import React from 'react';
import { Recipe } from '@/data/mockData';
import MealCard from '@/components/meal-plan/MealCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface MealSectionProps {
  mealType: string;
  meals: Recipe[] | Recipe | null;
  lockedMeals: {[key: string]: boolean};
  toggleLock: (mealType: string, index?: number) => void;
  onAddFromVault: (mealType: string, index?: number) => void;
  onMealClick: (recipe: Recipe) => void;
  updateMeal: (mealType: string, recipe: Recipe | null, index?: number) => void;
  currentDay: number;
}

const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  meals,
  lockedMeals,
  toggleLock,
  onAddFromVault,
  onMealClick,
  updateMeal,
  currentDay
}) => {
  // Convert meals to array format for consistent handling
  const mealArray = Array.isArray(meals) ? meals : (meals ? [meals] : [null]);
  const lowerMealType = mealType.toLowerCase();
  
  return (
    <Droppable droppableId={lowerMealType} type="MEAL">
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
                key={`${lowerMealType}-${index}-${meal?.id || 'empty'}`}
                draggableId={`${lowerMealType}-${index}-${meal?.id || 'empty'}`} 
                index={index}
                isDragDisabled={!!lockedMeals[`${currentDay}-${lowerMealType}-${index}`]}
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
                      isLocked={!!lockedMeals[`${currentDay}-${lowerMealType}-${index}`]}
                      toggleLock={() => toggleLock(lowerMealType, index)}
                      onAddFromVault={() => onAddFromVault(lowerMealType, index)}
                      onMealClick={onMealClick}
                      onRemove={() => updateMeal(lowerMealType, null, index)}
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
                onAddFromVault={() => onAddFromVault(lowerMealType)}
                onMealClick={onMealClick}
                isDraggable={false}
              />
            </div>
          )}
          {provided.placeholder}
          <div className="mb-6 mt-2 text-center">
            <button 
              onClick={() => onAddFromVault(lowerMealType)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add {mealType === "Snacks" ? "snack" : lowerMealType} item
            </button>
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default MealSection;
