
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { MealPlanDay, Recipe } from '@/data/mockData';

interface WeekOverviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlanDay[];
}

const WeekOverviewDialog: React.FC<WeekOverviewDialogProps> = ({
  isOpen,
  onClose,
  mealPlan
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
              <Card key={index} className="overflow-hidden">
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
                    <div className="pt-1">
                      <h4 className="text-sm font-medium text-gray-500">Snacks</h4>
                      <div className="pl-2">
                        {day.meals.snacks?.filter(Boolean).map((snack, idx) => (
                          <MealOverviewItem key={idx} title={`Snack ${idx + 1}`} meal={snack} isSnack />
                        ))}
                        {!day.meals.snacks?.some(Boolean) && (
                          <span className="text-sm text-gray-400">No snacks selected</span>
                        )}
                      </div>
                    </div>
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

const MealTypeOverview = ({ title, meals }) => {
  if (!meals || (Array.isArray(meals) && meals.length === 0)) {
    return (
      <div className="py-1 border-b last:border-b-0">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <span className="text-sm text-gray-400">No {title.toLowerCase()} selected</span>
      </div>
    );
  }

  const mealArray = Array.isArray(meals) ? meals : [meals];
  
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

const MealOverviewItem = ({ title, meal, isSnack = false }) => {
  return (
    <div className={`${isSnack ? '' : 'py-1 border-b last:border-b-0'}`}>
      {!isSnack && <h4 className="text-sm font-medium text-gray-500">{title}</h4>}
      {meal ? (
        <div className="flex justify-between items-center">
          <span className="text-sm">{meal.name}</span>
          <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
            {meal.macros.calories} kcal
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">No {title.toLowerCase()} selected</span>
      )}
    </div>
  );
};

export default WeekOverviewDialog;
