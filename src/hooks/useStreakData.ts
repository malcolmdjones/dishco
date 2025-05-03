
import { useState, useEffect } from 'react';
import { addDays, format, isEqual, parseISO, startOfDay } from 'date-fns';

export const useStreakData = () => {
  const [streak, setStreak] = useState(0);
  const [todayLogged, setTodayLogged] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  
  useEffect(() => {
    const calculateStreak = () => {
      // Get logged meals from localStorage
      const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
      
      // Group meals by date
      const mealsByDate = new Map();
      storedMeals.forEach((meal: any) => {
        if (meal.loggedAt) {
          const dateStr = format(parseISO(meal.loggedAt), 'yyyy-MM-dd');
          mealsByDate.set(dateStr, true);
        }
      });
      
      // Check if any meal is logged today
      const today = format(new Date(), 'yyyy-MM-dd');
      const isTodayLogged = mealsByDate.has(today);
      setTodayLogged(isTodayLogged);
      
      // Calculate current streak
      let currentStreak = isTodayLogged ? 1 : 0;
      let yesterday = addDays(new Date(), -1);
      
      // Count backwards from yesterday
      while (true) {
        const dateStr = format(yesterday, 'yyyy-MM-dd');
        if (mealsByDate.has(dateStr)) {
          currentStreak++;
          yesterday = addDays(yesterday, -1);
        } else {
          break;
        }
      }
      
      // Get stored longest streak
      const storedLongestStreak = parseInt(localStorage.getItem('longestStreak') || '0', 10);
      
      // Update longest streak if needed
      if (currentStreak > storedLongestStreak) {
        localStorage.setItem('longestStreak', currentStreak.toString());
        setLongestStreak(currentStreak);
      } else {
        setLongestStreak(storedLongestStreak);
      }
      
      setStreak(currentStreak);
      
      // Store current streak
      localStorage.setItem('currentStreak', currentStreak.toString());
    };
    
    // Calculate streak immediately
    calculateStreak();
    
    // Set up an interval to recalculate (useful if the app stays open past midnight)
    const intervalId = setInterval(calculateStreak, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    streak,
    todayLogged,
    longestStreak
  };
};
