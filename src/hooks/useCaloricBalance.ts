
import { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';

interface CaloricBalance {
  caloriesConsumed: number;
  caloriesBurned: number;
  netCalories: number;
}

export const useCaloricBalance = (selectedDate: Date) => {
  const [caloricBalance, setCaloricBalance] = useState<CaloricBalance>({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    netCalories: 0
  });

  useEffect(() => {
    // In a real app, fetch this data from an API
    // For now, we'll just use mock data
    const fetchCaloricBalance = async () => {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Mock values that would normally come from an API
      const mockConsumed = 1650; // Calories consumed
      const mockBurned = 350;   // Calories burned
      
      setCaloricBalance({
        caloriesConsumed: mockConsumed,
        caloriesBurned: mockBurned,
        netCalories: mockConsumed - mockBurned
      });
    };
    
    fetchCaloricBalance();
  }, [selectedDate]);
  
  return caloricBalance;
};
