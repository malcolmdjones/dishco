
import React from 'react';
import { format } from 'date-fns';
import { Pencil, Trash, Calendar } from 'lucide-react';
import { MealPlan } from '@/hooks/useSavedMealPlans';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  plan: MealPlan;
  selectedDate?: Date | undefined;
  onEdit: (plan: MealPlan) => void;
  onDelete: (id: string) => void;
  onViewDetails: (plan: MealPlan) => void;
  onCopyAndEdit: (plan: MealPlan) => void;
  onAddToGrocery: (plan: MealPlan) => void;
  onUsePlan: (plan: MealPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onCopyAndEdit,
  onUsePlan
}) => {
  const planData = plan.plan_data || { days: [], description: '', tags: [] };
  const days = planData.days || [];
  
  const calculateTotalCalories = (days: any[] | undefined) => {
    if (!days || !Array.isArray(days)) return 0;
    
    let total = 0;
    days.forEach(day => {
      if (!day || !day.meals) return;
      
      const breakfast = day.meals.breakfast;
      if (Array.isArray(breakfast) && breakfast.length > 0) {
        total += breakfast[0]?.macros?.calories || 0;
      } else if (breakfast?.macros) {
        total += breakfast.macros.calories || 0;
      }
      
      const lunch = day.meals.lunch;
      if (Array.isArray(lunch) && lunch.length > 0) {
        total += lunch[0]?.macros?.calories || 0;
      } else if (lunch?.macros) {
        total += lunch.macros.calories || 0;
      }
      
      const dinner = day.meals.dinner;
      if (Array.isArray(dinner) && dinner.length > 0) {
        total += dinner[0]?.macros?.calories || 0;
      } else if (dinner?.macros) {
        total += dinner.macros.calories || 0;
      }
      
      const snacks = day.meals.snacks;
      if (Array.isArray(snacks)) {
        snacks.forEach(snack => {
          total += snack?.macros?.calories || 0;
        });
      }
    });
    return Math.round(total / (days.length || 1));
  };

  const createdDate = new Date(plan.created_at);
  const formattedDate = format(createdDate, 'MMM d, yyyy');
  const description = planData.description || "Custom meal plan";
  const caloriesPerDay = calculateTotalCalories(days);

  return (
    <div className="border rounded-lg mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Calendar className="text-green-500 mt-1" size={24} />
            <div>
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-gray-500 text-sm">Created {formattedDate}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan);
              }}
              className="h-8 w-8"
            >
              <Pencil size={18} />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plan.id);
              }}
              className="h-8 w-8"
            >
              <Trash size={18} />
            </Button>
          </div>
        </div>
        
        <p className="mt-3">{description}</p>
        <p className="mt-1 font-medium">{caloriesPerDay} calories/day · {days.length} days</p>
        
        <div className="mt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onCopyAndEdit(plan);
            }}
            className="px-4 py-2"
          >
            Copy & Edit
          </Button>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onUsePlan(plan);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700"
          >
            Use This Plan <span className="ml-1">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
