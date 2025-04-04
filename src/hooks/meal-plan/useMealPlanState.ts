
import { useState, useEffect } from 'react';
import { MealPlanDay, NutritionGoals, defaultGoals, fetchNutritionGoals } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage the basic state of the meal plan
 */
export const useMealPlanState = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [userGoals, setUserGoals] = useState<NutritionGoals>(defaultGoals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedMeals, setLockedMeals] = useState<{[key: string]: boolean}>({});
  const [aiReasoning, setAiReasoning] = useState<string>("");

  // Get user's nutrition goals from Supabase
  useEffect(() => {
    const fetchUserNutritionGoals = async () => {
      try {
        // Try to fetch user's goals from Supabase
        const { data, error } = await supabase
          .from('nutrition_goals')
          .select('*')
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching nutrition goals:', error);
          // Fall back to local goals if error
          const localGoals = await fetchNutritionGoals();
          setUserGoals(localGoals);
          return;
        }
        
        if (data) {
          // Use Supabase nutrition goals
          setUserGoals({
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat
          });
        } else {
          // Fall back to local goals if no data
          const localGoals = await fetchNutritionGoals();
          setUserGoals(localGoals);
        }
      } catch (error) {
        console.error('Error fetching nutrition goals:', error);
        // Fall back to local goals on catch
        const localGoals = await fetchNutritionGoals();
        setUserGoals(localGoals);
      }
    };
    
    fetchUserNutritionGoals();
  }, []);

  // Initialize or generate meal plan
  useEffect(() => {
    if (mealPlan.length === 0) {
      generateFullMealPlan();
    }
  }, [userGoals]);

  // Function to generate a meal plan for the entire week
  const generateFullMealPlan = () => {
    setIsGenerating(true);
    // Create a 7-day meal plan
    const newPlan: MealPlanDay[] = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i - currentDay); // Adjust to keep current day in sync
      
      return {
        date: date.toISOString(),
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [null, null]
        }
      };
    });
    
    setMealPlan(newPlan);
  };

  return {
    currentDate,
    setCurrentDate,
    currentDay,
    setCurrentDay,
    mealPlan,
    setMealPlan,
    userGoals,
    isGenerating,
    setIsGenerating,
    lockedMeals,
    setLockedMeals,
    aiReasoning,
    setAiReasoning,
    generateFullMealPlan
  };
};
