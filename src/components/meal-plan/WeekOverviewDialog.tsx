
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO, startOfDay } from 'date-fns';
import { MealPlanDay } from '@/types/MealPlanTypes';
import { Recipe } from '@/types/Recipe';

interface WeekOverviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlanDay[];
  currentDay?: number;
  setCurrentDay?: (day: number) => void;
}

const WeekOverviewDialog: React.FC<WeekOverviewDialogProps> = ({
  isOpen,
  onClose,
  mealPlan,
  currentDay,
  setCurrentDay
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>7-Day Meal Plan Overview</DialogTitle>
          <DialogDescription>View your entire week's meal plan at a glance</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {mealPlan.map((day, index) => {
            const date = new Date(day.date);
            return (
              <Card 
                key={index} 
                className={`overflow-hidden ${currentDay === index ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setCurrentDay && setCurrentDay(index)}
              >
                <div className="bg-green-50 p-3 border-b">
                  <h3 className="font-semibold">
                    {format(date, 'EEEE, MMMM d')}
                  </h3>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <MealTypeOverview title="Breakfast" meals={day.meals.breakfast} />
                    <MealTypeOverview title="Lunch" meals={day.meals.lunch} />
                    <MealTypeOverview title="Dinner" meals={day.meals.dinner} />
                    <MealTypeOverview title="Snacks" meals={day.meals.snacks} isSnack={true} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MealTypeOverviewProps {
  title: string;
  meals: Recipe | Recipe[] | null;
  isSnack?: boolean;
}

const MealTypeOverview: React.FC<MealTypeOverviewProps> = ({ title, meals, isSnack = false }) => {
  if (!meals || (Array.isArray(meals) && meals.length === 0)) {
    return (
      <div className="py-1 border-b last:border-b-0">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <span className="text-sm text-gray-400">No {title.toLowerCase()} selected</span>
      </div>
    );
  }

  const mealArray = Array.isArray(meals) ? meals.filter(Boolean) : [meals].filter(Boolean);
  
  return (
    <div className="py-1 border-b last:border-b-0">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      {mealArray.length > 0 ? (
        mealArray.map((meal, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-sm">{meal.name}</span>
            <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
              {meal.macros.calories} kcal
            </span>
          </div>
        ))
      ) : (
        <span className="text-sm text-gray-400">No {title.toLowerCase()} selected</span>
      )}
    </div>
  );
};

export default WeekOverviewDialog;
