
import { useState, useEffect } from 'react';

interface StreakData {
  streak: number;
  todayLogged: boolean;
}

export const useStreakData = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    streak: 0,
    todayLogged: false
  });

  useEffect(() => {
    // In a real app, fetch this data from an API
    // For now, we'll just use mock data
    const fetchStreakData = async () => {
      // Mock values that would normally come from an API
      setStreakData({
        streak: 3,
        todayLogged: true
      });
    };
    
    fetchStreakData();
  }, []);

  return streakData;
};
