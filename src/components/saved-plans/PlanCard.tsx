
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, ShoppingBag } from 'lucide-react';
import { MealPlan } from '@/hooks/useSavedMealPlans';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

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
  selectedDate = new Date(),
  onEdit,
  onDelete,
  onViewDetails,
  onCopyAndEdit,
  onAddToGrocery,
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

  return (
    <Card className="relative overflow-hidden animate-fade-in">
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(plan);
          }}
          className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plan.id);
          }}
          className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
        >
          <Trash size={16} />
        </Button>
        <Button
          variant="ghost" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onAddToGrocery(plan);
          }}
          className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
          title="Add to grocery list"
        >
          <ShoppingBag size={16} />
        </Button>
      </div>

      <div 
        className="cursor-pointer"
        onClick={() => onViewDetails(plan)}
      >
        <div className="h-32 bg-gradient-to-r from-dishco-primary/20 to-dishco-secondary/20 p-4">
          <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
          <p className="text-sm text-dishco-text-light line-clamp-2">
            {planData.description || "No description available"}
          </p>
        </div>
        
        <CardContent className="p-4 pt-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-dishco-text-light">
              {days.length} days
            </span>
            <span className="text-sm">
              {calculateTotalCalories(days)} calories/day
            </span>
          </div>
          
          <div className="flex gap-2">
            {planData.tags && Array.isArray(planData.tags) && planData.tags.map((tag: string, i: number) => (
              <span 
                key={i}
                className="px-2 py-1 bg-dishco-primary/10 rounded text-xs text-dishco-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onCopyAndEdit(plan);
          }}
        >
          Copy & Edit
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              size="sm"
              className="text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Use this plan
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              className="border-0 shadow-md"
            />
            <div className="p-2">
              <Button size="sm" className="w-full" onClick={() => onUsePlan(plan)}>
                Activate Plan
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
