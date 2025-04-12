
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MealPlan } from '@/hooks/useSavedMealPlans';
import PlanCard from './PlanCard';
import EmptyPlansState from './EmptyPlansState';

interface PlansDisplayProps {
  plans: MealPlan[];
  isLoading: boolean;
  selectedDate?: Date;
  onEdit: (plan: MealPlan) => void;
  onDelete: (id: string) => void;
  onViewDetails: (plan: MealPlan) => void;
  onCopyAndEdit: (plan: MealPlan) => void;
  onAddToGrocery: (plan: MealPlan) => void;
  onUsePlan: (plan: MealPlan) => void;
}

const PlansDisplay: React.FC<PlansDisplayProps> = ({
  plans,
  isLoading,
  selectedDate,
  onEdit,
  onDelete,
  onViewDetails,
  onCopyAndEdit,
  onAddToGrocery,
  onUsePlan
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading your meal plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return <EmptyPlansState />;
  }

  return (
    <>
      <Link to="/planning" className="block mb-6">
        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Plus className="text-green-500 mr-2" />
          <span className="text-lg">Create a new meal plan</span>
        </div>
      </Link>
      
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          selectedDate={selectedDate}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onCopyAndEdit={onCopyAndEdit}
          onAddToGrocery={onAddToGrocery}
          onUsePlan={onUsePlan}
        />
      ))}
    </>
  );
};

export default PlansDisplay;
