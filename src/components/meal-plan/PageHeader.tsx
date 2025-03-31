
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WeekOverviewDialog from '@/components/meal-plan/WeekOverviewDialog';
import RecipeVaultDialog from '@/components/meal-plan/RecipeVaultDialog';
import { useMealPlanUtils } from '@/hooks/useMealPlanUtils';

const PageHeader = () => {
  const { mealPlan } = useMealPlanUtils();
  const [isWeekOverviewOpen, setIsWeekOverviewOpen] = useState(false);
  const [isRecipeVaultOpen, setIsRecipeVaultOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Link to="/planning">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">New Meal Plan</h1>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsWeekOverviewOpen(true)}
        >
          Week Overview
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsRecipeVaultOpen(true)}
        >
          Recipe Vault
        </Button>
      </div>

      {/* Week Overview Dialog */}
      <WeekOverviewDialog
        isOpen={isWeekOverviewOpen}
        onClose={() => setIsWeekOverviewOpen(false)}
        mealPlan={mealPlan}
      />

      {/* Recipe Vault Dialog */}
      <RecipeVaultDialog
        isOpen={isRecipeVaultOpen}
        onClose={() => setIsRecipeVaultOpen(false)}
        onSelectRecipe={() => {}}
        targetMealType=""
      />
    </div>
  );
};

export default PageHeader;
