
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Recipe } from '@/types/Recipe';
import { LoggedMeal } from '@/types/food';

interface RecentMealHistoryProps {
  recentMeals: LoggedMeal[];
  onAddMeal: (recipe: Recipe) => void;
}

const RecentMealHistory: React.FC<RecentMealHistoryProps> = ({ recentMeals, onAddMeal }) => {
  if (recentMeals.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No recent meals logged</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {recentMeals.map((meal) => (
        <div 
          key={meal.id} 
          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
        >
          <div className="w-full">
            <div className="flex items-center">
              <p className="font-medium">{meal.name}</p>
              {/* Removed the check mark that was here */}
            </div>
            <div className="flex justify-between w-full">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{meal.calories} cal</span>
                {meal.servingInfo && <span>, {meal.servingInfo}</span>}
                {meal.brand && <span>, {meal.brand}</span>}
                {meal.source ? <span>, {meal.source}</span> : null}
                {meal.protein && <span>, {meal.protein}</span>}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddMeal(meal.recipe)}
            className="h-10 w-10 rounded-full bg-gray-200 shrink-0 ml-2"
          >
            <Plus size={20} />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default RecentMealHistory;
