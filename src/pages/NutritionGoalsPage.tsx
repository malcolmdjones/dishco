
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, SwitchCamera, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const NutritionGoalsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<UserGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [inputMode, setInputMode] = useState<'manual' | 'percentage'>('manual');
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [percentages, setPercentages] = useState({
    protein: 30,
    carbs: 40,
    fat: 30
  });

  useEffect(() => {
    fetchNutritionGoals();
  }, []);

  const fetchNutritionGoals = async () => {
    try {
      // For now, we're not authenticating users, so we'll get the first nutrition goals record
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
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

        // Calculate percentages from the fetched data
        const totalCaloriesFromMacros = data.protein * 4 + data.carbs * 4 + data.fat * 9;
        if (totalCaloriesFromMacros > 0) {
          setPercentages({
            protein: Math.round((data.protein * 4 / totalCaloriesFromMacros) * 100),
            carbs: Math.round((data.carbs * 4 / totalCaloriesFromMacros) * 100),
            fat: Math.round((data.fat * 9 / totalCaloriesFromMacros) * 100)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
    }
  };

  const handleChange = (field: keyof UserGoals, value: string) => {
    // Handle "0" input by allowing the user to enter a new number
    const numValue = value === "" ? 0 : parseInt(value.replace(/^0+/, '')) || 0;
    setGoals(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handlePercentageChange = (macro: 'protein' | 'carbs' | 'fat', value: string) => {
    const numValue = value === "" ? 0 : parseInt(value) || 0;
    
    // Update percentages
    setPercentages(prev => {
      const newPercentages = {
        ...prev,
        [macro]: numValue
      };
      
      // Adjust the macros based on new percentages
      updateMacrosFromPercentages(newPercentages);
      
      return newPercentages;
    });
  };

  const updateMacrosFromPercentages = (newPercentages: typeof percentages) => {
    const { protein: proteinPct, carbs: carbsPct, fat: fatPct } = newPercentages;
    const totalCalories = goals.calories;
    
    const proteinCalories = totalCalories * (proteinPct / 100);
    const carbsCalories = totalCalories * (carbsPct / 100);
    const fatCalories = totalCalories * (fatPct / 100);
    
    setGoals(prev => ({
      ...prev,
      protein: Math.round(proteinCalories / 4),
      carbs: Math.round(carbsCalories / 4),
      fat: Math.round(fatCalories / 9)
    }));
  };

  const toggleInputMode = () => {
    setInputMode(prev => prev === 'manual' ? 'percentage' : 'manual');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (recordId) {
        // Update existing record
        await supabase
          .from('nutrition_goals')
          .update({
            calories: goals.calories,
            protein: goals.protein,
            carbs: goals.carbs,
            fat: goals.fat,
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId);
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('nutrition_goals')
          .insert([{
            calories: goals.calories,
            protein: goals.protein,
            carbs: goals.carbs,
            fat: goals.fat
          }])
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          setRecordId(data[0].id);
        }
      }
      
      // Also update in localStorage for immediate use in the app
      localStorage.setItem('nutritionGoals', JSON.stringify(goals));
      
      toast({
        title: "Goals Updated",
        description: "Your nutrition goals have been saved successfully.",
      });
      
      // Force a reload to reflect changes across the app
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your goals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage = percentages.protein + percentages.carbs + percentages.fat;

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-6 flex items-center">
        <Link to="/more" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nutrition Goals</h1>
          <p className="text-dishco-text-light">Set your daily targets</p>
        </div>
      </header>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Macro Inputs</h2>
        <Button onClick={toggleInputMode} variant="outline" className="flex items-center gap-2">
          {inputMode === 'manual' ? (
            <>
              <Percent size={16} />
              <span>Use Percentages</span>
            </>
          ) : (
            <>
              <SwitchCamera size={16} />
              <span>Manual Input</span>
            </>
          )}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium mb-1">Daily Calories (kcal)</label>
            <Input
              id="calories"
              type="text"
              inputMode="numeric"
              value={goals.calories === 0 ? "" : goals.calories.toString()}
              onChange={(e) => handleChange('calories', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-dishco-text-light mt-1">
              Recommended: 1800-2500 kcal for average adults
            </p>
          </div>

          {inputMode === 'manual' ? (
            <>
              <div>
                <label htmlFor="protein" className="block text-sm font-medium mb-1">Protein (g)</label>
                <Input
                  id="protein"
                  type="text"
                  inputMode="numeric"
                  value={goals.protein === 0 ? "" : goals.protein.toString()}
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
                  type="text"
                  inputMode="numeric"
                  value={goals.carbs === 0 ? "" : goals.carbs.toString()}
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
                  type="text"
                  inputMode="numeric"
                  value={goals.fat === 0 ? "" : goals.fat.toString()}
                  onChange={(e) => handleChange('fat', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-dishco-text-light mt-1">
                  Recommended: 20-35% of your daily calories
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <label htmlFor="protein-pct" className="block text-sm font-medium mb-1">
                    Protein ({percentages.protein}%)
                  </label>
                  <Input
                    id="protein-pct"
                    type="range"
                    min="10"
                    max="60"
                    value={percentages.protein}
                    onChange={(e) => handlePercentageChange('protein', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {goals.protein}g = {Math.round(goals.protein * 4)} calories
                  </p>
                </div>
                
                <div>
                  <label htmlFor="carbs-pct" className="block text-sm font-medium mb-1">
                    Carbs ({percentages.carbs}%)
                  </label>
                  <Input
                    id="carbs-pct"
                    type="range"
                    min="10"
                    max="60"
                    value={percentages.carbs}
                    onChange={(e) => handlePercentageChange('carbs', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {goals.carbs}g = {Math.round(goals.carbs * 4)} calories
                  </p>
                </div>
                
                <div>
                  <label htmlFor="fat-pct" className="block text-sm font-medium mb-1">
                    Fat ({percentages.fat}%)
                  </label>
                  <Input
                    id="fat-pct"
                    type="range"
                    min="10"
                    max="60"
                    value={percentages.fat}
                    onChange={(e) => handlePercentageChange('fat', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {goals.fat}g = {Math.round(goals.fat * 9)} calories
                  </p>
                </div>
                
                {totalPercentage !== 100 && (
                  <p className={`text-sm font-medium ${Math.abs(totalPercentage - 100) > 5 ? 'text-red-500' : 'text-yellow-500'}`}>
                    Total: {totalPercentage}% {totalPercentage !== 100 ? `(Should be 100%)` : ''}
                  </p>
                )}
              </div>
            </>
          )}
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
