
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';
import { useHomePageUtils } from '@/hooks/useHomePageUtils';
import CaloricBalanceOverview from '@/components/home/CaloricBalanceOverview';
import WeeklyTargets from '@/components/home/WeeklyTargets';
import { useCaloricBalance } from '@/hooks/useCaloricBalance';

const ProgressPage = () => {
  const navigate = useNavigate();
  const { selectedDate } = useHomePageUtils();
  const caloricBalance = useCaloricBalance(selectedDate);

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-dishco-text-light">Track your nutrition progress and goals</p>
      </header>
      
      <CaloricBalanceOverview
        weeklyData={caloricBalance.weeklyData}
        averageCalories={caloricBalance.averageCalories}
        targetCalories={caloricBalance.targetCalories}
        missingLogDays={caloricBalance.missingLogDays}
      />
      
      <WeeklyTargets selectedDate={selectedDate} />
      
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/nutrition-goals')}
          className="w-full py-6"
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          Adjust Nutrition Goals
        </Button>
      </div>
    </div>
  );
};

export default ProgressPage;

