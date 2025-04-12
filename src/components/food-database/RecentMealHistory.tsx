
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface RecentMealHistoryProps {
  recentMeals: any[];
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
    <div className="space-y-2">
      {recentMeals.map((meal) => (
        <div 
          key={meal.id} 
          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
        >
          <div>
            <div className="flex items-center">
              <p className="font-medium">{meal.name}</p>
              {meal.consumed && (
                <span className="ml-2">
                  <Check size={16} className="text-green-500" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {meal.calories} cal, {meal.servingInfo || '1 serving'}, {meal.source || ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddMeal(meal.recipe)}
            className="h-10 w-10 rounded-full bg-gray-200"
          >
            <Plus size={20} />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default RecentMealHistory;
