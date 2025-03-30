import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type UserGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const NutritionGoalsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<UserGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNutritionGoals();
    }
  }, [user]);

  const fetchNutritionGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching nutrition goals:', error);
        return;
      }
      
      if (data) {
        setRecordId(data.id);
        setGoals({
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat
        });
      }
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
    }
  };

  const handleChange = (field: keyof UserGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoals(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save nutrition goals.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      if (recordId) {
        // Update existing record
        const { error } = await supabase
          .from('nutrition_goals')
          .update({
            calories: goals.calories,
            protein: goals.protein,
            carbs: goals.carbs,
            fat: goals.fat,
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('nutrition_goals')
          .insert([{
            calories: goals.calories,
            protein: goals.protein,
            carbs: goals.carbs,
            fat: goals.fat,
            user_id: user.id
          }]);
          
        if (error) throw error;
      }
      
      toast({
        title: "Goals Updated",
        description: "Your nutrition goals have been saved successfully.",
      });
      
      // Navigate back to More page
      navigate('/more');
    } catch (error: any) {
      console.error('Error saving nutrition goals:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem saving your goals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nutrition Goals</h1>
          <p className="text-dishco-text-light">Set your daily targets</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium mb-1">Daily Calories (kcal)</label>
            <Input
              id="calories"
              type="number"
              value={goals.calories}
              onChange={(e) => handleChange('calories', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-dishco-text-light mt-1">
              Recommended: 1800-2500 kcal for average adults
            </p>
          </div>

          <div>
            <label htmlFor="protein" className="block text-sm font-medium mb-1">Protein (g)</label>
            <Input
              id="protein"
              type="number"
              value={goals.protein}
              onChange={(e) => handleChange('protein', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-dishco-text-light mt-1">
              Recommended: 0.8-1.2g per pound of body weight
            </p>
          </div>

          <div>
            <label htmlFor="carbs" className="block text-sm font-medium mb-1">Carbohydrates (g)</label>
            <Input
              id="carbs"
              type="number"
              value={goals.carbs}
              onChange={(e) => handleChange('carbs', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-dishco-text-light mt-1">
              Recommended: 45-65% of your daily calories
            </p>
          </div>

          <div>
            <label htmlFor="fat" className="block text-sm font-medium mb-1">Fat (g)</label>
            <Input
              id="fat"
              type="number"
              value={goals.fat}
              onChange={(e) => handleChange('fat', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-dishco-text-light mt-1">
              Recommended: 20-35% of your daily calories
            </p>
          </div>
        </div>
      </div>

      {/* Macronutrient Distribution */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Macronutrient Ratio</h2>
        <div className="flex rounded-lg bg-gray-100 h-10 overflow-hidden mb-2">
          <div 
            className="bg-dishco-primary h-full"
            style={{ width: `${(goals.protein * 4 / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9)) * 100}%` }}
          />
          <div 
            className="bg-dishco-accent h-full"
            style={{ width: `${(goals.carbs * 4 / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9)) * 100}%` }}
          />
          <div 
            className="bg-dishco-secondary h-full"
            style={{ width: `${(goals.fat * 9 / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-dishco-primary mr-1" />
            <span>Protein ({Math.round((goals.protein * 4 / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9)) * 100)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-dishco-accent mr-1" />
            <span>Carbs ({Math.round((goals.carbs * 4 / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9)) * 100)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-dishco-secondary mr-1" />
            <span>Fat ({Math.round((goals.fat * 9 / (goals.protein * 4 + goals.carbs * 4 + goals.fat * 9)) * 100)}%)</span>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full" disabled={loading}>
        <Save size={18} className="mr-2" />
        Save Goals
      </Button>
    </div>
  );
};

export default NutritionGoalsPage;
