
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { defaultGoals, UserGoals } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const NutritionGoalsPage = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<UserGoals>(defaultGoals);

  const handleChange = (field: keyof UserGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoals(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    toast({
      title: "Goals Updated",
      description: "Your nutrition goals have been saved successfully.",
    });
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

      <Button onClick={handleSave} className="w-full">
        <Save size={18} className="mr-2" />
        Save Goals
      </Button>
    </div>
  );
};

export default NutritionGoalsPage;
