
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyNutrition } from '@/hooks/useWeeklyNutrition';
import { Flame } from 'lucide-react';
import MacroRow from './weekly-targets/MacroRow';
import DayLabels from './weekly-targets/DayLabels';

interface WeeklyTargetsProps {
  selectedDate: Date;
}

const WeeklyTargets: React.FC<WeeklyTargetsProps> = ({ selectedDate }) => {
  const { weeklyNutrition, userGoals } = useWeeklyNutrition(selectedDate);
  
  // Color classes for different macros - using pastel colors matching the reference
  const macroColors = {
    calories: 'bg-blue-300',
    protein: 'bg-orange-200',
    fat: 'bg-yellow-300',
    carbs: 'bg-green-300'
  };
  
  // Get day index (0-6) from date
  const getTodayIndex = (): number => {
    const today = new Date();
    const index = today.getDay() - 1; // Monday is 0
    return index < 0 ? 6 : index; // Sunday becomes 6
  };
  
  const todayIndex = getTodayIndex();
  
  return (
    <Card className="mb-6 overflow-hidden rounded-3xl bg-white shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-3xl font-bold mb-10">Weekly Targets</h2>
        
        <div>
          {/* Calories */}
          <MacroRow 
            label="1220"
            icon={<Flame className="ml-1 text-red-500" size={20} />}
            values={weeklyNutrition.calories}
            goalValue={userGoals.calories}
            color={macroColors.calories}
            todayIndex={todayIndex}
          />
          
          {/* Protein */}
          <MacroRow 
            label="95P"
            values={weeklyNutrition.protein}
            goalValue={userGoals.protein}
            color={macroColors.protein}
            todayIndex={todayIndex}
          />
          
          {/* Fat */}
          <MacroRow 
            label="58F"
            values={weeklyNutrition.fat}
            goalValue={userGoals.fat}
            color={macroColors.fat}
            todayIndex={todayIndex}
          />
          
          {/* Carbs */}
          <MacroRow 
            label="87C"
            values={weeklyNutrition.carbs}
            goalValue={userGoals.carbs}
            color={macroColors.carbs}
            todayIndex={todayIndex}
            isLastRow={true}
          />
          
          {/* Day labels at the bottom */}
          <DayLabels todayIndex={todayIndex} />
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyTargets;
