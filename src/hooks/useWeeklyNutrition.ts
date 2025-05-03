
import { useState, useEffect } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const useWeeklyNutrition = () => {
  const [weeklyData, setWeeklyData] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyNutrition = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would be an API call to get weekly nutrition data
        // For this demo, we'll create mock data
        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
        
        const mockWeeklyData: DailyNutrition[] = Array.from({ length: 7 }).map((_, index) => {
          const day = addDays(startDate, index);
          const dateString = format(day, 'yyyy-MM-dd');
          
          // Generate some varying data for the chart
          const baseCalories = 1800;
          const variation = Math.random() * 600 - 200; // +/- 300 from base
          
          const calories = Math.round(baseCalories + variation);
          const protein = Math.round((calories * 0.25) / 4); // ~25% from protein
          const carbs = Math.round((calories * 0.5) / 4);    // ~50% from carbs
          const fat = Math.round((calories * 0.25) / 9);     // ~25% from fat
          
          return {
            date: dateString,
            calories,
            protein,
            carbs,
            fat
          };
        });
        
        setWeeklyData(mockWeeklyData);
      } catch (error) {
        console.error("Error fetching weekly nutrition data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeeklyNutrition();
  }, []);
  
  return { weeklyData, loading };
};
