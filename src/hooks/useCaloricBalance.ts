
import { useEffect, useState } from 'react';
import { addDays, format, isEqual, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns';
import { defaultGoals } from '@/data/mockData';

export const useCaloricBalance = (selectedDate: Date) => {
  const [weeklyData, setWeeklyData] = useState<Array<{
    date: string;
    calories: number;
    target: number;
  }>>([]);
  const [averageCalories, setAverageCalories] = useState(0);
  const [targetCalories, setTargetCalories] = useState(defaultGoals.calories);
  const [missingLogDays, setMissingLogDays] = useState(0);

  useEffect(() => {
    // Calculate the start of the week (Monday)
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    
    // Get the user's target calories from storage or use default
    const userGoals = JSON.parse(localStorage.getItem('nutritionGoals') || JSON.stringify(defaultGoals));
    setTargetCalories(userGoals.calories);
    
    // Get logged meals from localStorage
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const weekData = [];
    let totalCalories = 0;
    let daysWithLogs = 0;
    let missingDays = 0;
    const today = startOfDay(new Date());
    
    // Generate data for each day in the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(monday, i);
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const currentDateStart = startOfDay(currentDate);
      
      // Filter meals for the current day
      const dayMeals = storedMeals.filter((meal: any) => {
        if (!meal.loggedAt) return false;
        const mealDate = startOfDay(parseISO(meal.loggedAt));
        return isEqual(mealDate, currentDateStart);
      });
      
      // Calculate total calories for the day
      let dayCalories = 0;
      dayMeals.forEach((meal: any) => {
        if (meal.consumed && meal.recipe && meal.recipe.macros) {
          dayCalories += meal.recipe.macros.calories || 0;
        }
      });
      
      // Only include days up to today in the statistics
      if (currentDateStart <= today) {
        // Only count days with some logged calories for the average
        if (dayCalories > 0) {
          totalCalories += dayCalories;
          daysWithLogs++;
        } else {
          missingDays++;
        }
      }
      
      // For future days or today with no logs, set calories to null for the chart
      const caloriesValue = currentDateStart > today ? null : dayCalories;
      
      weekData.push({
        date: formattedDate,
        calories: caloriesValue,
        target: userGoals.calories
      });
    }
    
    // Calculate the average calories per day
    const avgCalories = daysWithLogs > 0 ? Math.round(totalCalories / daysWithLogs) : 0;
    
    setWeeklyData(weekData);
    setAverageCalories(avgCalories);
    setMissingLogDays(missingDays);
  }, [selectedDate]);

  return {
    weeklyData,
    averageCalories,
    targetCalories,
    missingLogDays
  };
};
