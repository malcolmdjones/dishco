
import { useState, useEffect } from 'react';
import { addDays, format, isEqual, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns';
import { defaultGoals } from '@/data/mockData';

interface WeeklyNutritionData {
  calories: number[];
  protein: number[];
  carbs: number[];
  fat: number[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const useWeeklyNutrition = (selectedDate: Date) => {
  const [weeklyNutrition, setWeeklyNutrition] = useState<WeeklyNutritionData>({
    calories: [0, 0, 0, 0, 0, 0, 0],
    protein: [0, 0, 0, 0, 0, 0, 0],
    carbs: [0, 0, 0, 0, 0, 0, 0],
    fat: [0, 0, 0, 0, 0, 0, 0],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  
  const [userGoals, setUserGoals] = useState<UserGoals>(defaultGoals);
  
  useEffect(() => {
    // Get user's nutrition goals from localStorage or API
    const storedGoals = JSON.parse(localStorage.getItem('nutritionGoals') || JSON.stringify(defaultGoals));
    setUserGoals(storedGoals);
    
    // Calculate the start of the week (Monday)
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    
    // Get logged meals from localStorage
    const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    // Initialize arrays for each day's nutrition
    const weekData = {
      calories: Array(7).fill(0),
      protein: Array(7).fill(0),
      carbs: Array(7).fill(0),
      fat: Array(7).fill(0)
    };
    
    // Process each meal and add to appropriate day
    storedMeals.forEach((meal: any) => {
      if (!meal.loggedAt || !meal.consumed) return;
      
      const mealDate = startOfDay(parseISO(meal.loggedAt));
      
      // Check if meal is within current week
      const mealDay = new Date(mealDate);
      let dayIndex = -1;
      
      // Check each day of the week (0 = Monday, 6 = Sunday)
      for (let i = 0; i < 7; i++) {
        const currentWeekDay = addDays(monday, i);
        if (isEqual(startOfDay(currentWeekDay), startOfDay(mealDay))) {
          dayIndex = i;
          break;
        }
      }
      
      if (dayIndex >= 0 && meal.recipe && meal.recipe.macros) {
        weekData.calories[dayIndex] += meal.recipe.macros.calories || 0;
        weekData.protein[dayIndex] += meal.recipe.macros.protein || 0;
        weekData.carbs[dayIndex] += meal.recipe.macros.carbs || 0;
        weekData.fat[dayIndex] += meal.recipe.macros.fat || 0;
      }
    });
    
    // Calculate totals
    const totalCalories = weekData.calories.reduce((sum, day) => sum + day, 0);
    const totalProtein = weekData.protein.reduce((sum, day) => sum + day, 0);
    const totalCarbs = weekData.carbs.reduce((sum, day) => sum + day, 0);
    const totalFat = weekData.fat.reduce((sum, day) => sum + day, 0);
    
    setWeeklyNutrition({
      ...weekData,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    });
  }, [selectedDate]);
  
  return {
    weeklyNutrition,
    userGoals
  };
};
