
import { useEffect, useState } from 'react';
import { addDays, format, isEqual, parseISO, startOfDay, subDays } from 'date-fns';
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
    // Calculate the start date (6 days ago) to show a 7-day period including today
    const startDate = subDays(selectedDate, 6);
    
    // Get the user's target calories from storage or use default
    const userGoals = JSON.parse(localStorage.getItem('nutritionGoals') || JSON.stringify(defaultGoals));
    setTargetCalories(userGoals.calories);
    
    // Get logged meals from localStorage
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    const weekData = [];
    let totalCalories = 0;
    let daysWithLogs = 0;
    let missingDays = 0;
    
    // Generate data for each day in the week
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i);
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
      
      // Only count days with some logged calories for the average
      if (dayCalories > 0) {
        totalCalories += dayCalories;
        daysWithLogs++;
      } else {
        // If the day has passed and no calories logged, count as missing
        const today = startOfDay(new Date());
        if (currentDateStart <= today) {
          missingDays++;
        }
      }
      
      weekData.push({
        date: formattedDate,
        calories: dayCalories,
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
