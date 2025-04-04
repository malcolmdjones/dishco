
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface DailyNutritionCardProps {
  dayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  userGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  exceedsGoals: {
    any: boolean;
    exceeds: {
      calories: boolean;
      protein: boolean;
      carbs: boolean;
      fat: boolean;
    };
  };
}

const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({ dayTotals, userGoals, exceedsGoals }) => {
  // Calculate percentages of goals reached
  const caloriePercentage = Math.min(100, (dayTotals.calories / (userGoals.calories || 1)) * 100);
  const proteinPercentage = Math.min(100, (dayTotals.protein / (userGoals.protein || 1)) * 100);
  const carbsPercentage = Math.min(100, (dayTotals.carbs / (userGoals.carbs || 1)) * 100);
  const fatPercentage = Math.min(100, (dayTotals.fat / (userGoals.fat || 1)) * 100);

  // Determine colors based on whether goals are exceeded
  const getProgressColor = (nutrient: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (exceedsGoals.exceeds[nutrient]) {
      return '#ef4444'; // Red for exceeded
    } else if ((
      nutrient === 'calories' ? caloriePercentage : 
      nutrient === 'protein' ? proteinPercentage : 
      nutrient === 'carbs' ? carbsPercentage : 
      fatPercentage
    ) > 80) {
      return '#22c55e'; // Green for close to goal
    } else if ((
      nutrient === 'calories' ? caloriePercentage : 
      nutrient === 'protein' ? proteinPercentage : 
      nutrient === 'carbs' ? carbsPercentage : 
      fatPercentage
    ) > 50) {
      return '#eab308'; // Yellow for midway
    } else {
      return '#3b82f6'; // Blue for low progress
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">Daily Nutrition</h2>
      
      <div className="flex justify-between items-center">
        {/* Calories */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <CircularProgressbar
              value={caloriePercentage}
              text={`${dayTotals.calories}`}
              styles={buildStyles({
                textSize: '30px',
                pathColor: getProgressColor('calories'),
                textColor: '#3c3c3c',
                trailColor: '#f9f9f9',
              })}
            />
          </div>
          <span className="text-xs text-center mt-1">
            {dayTotals.calories} / {userGoals.calories} Cal
          </span>
        </div>
        
        {/* Protein */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <CircularProgressbar
              value={proteinPercentage}
              text={`${dayTotals.protein}g`}
              styles={buildStyles({
                textSize: '30px',
                pathColor: getProgressColor('protein'),
                textColor: '#3c3c3c',
                trailColor: '#f9f9f9',
              })}
            />
          </div>
          <span className="text-xs text-center mt-1">
            {dayTotals.protein}g / {userGoals.protein}g
          </span>
        </div>
        
        {/* Carbs */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <CircularProgressbar
              value={carbsPercentage}
              text={`${dayTotals.carbs}g`}
              styles={buildStyles({
                textSize: '30px',
                pathColor: getProgressColor('carbs'),
                textColor: '#3c3c3c',
                trailColor: '#f9f9f9',
              })}
            />
          </div>
          <span className="text-xs text-center mt-1">
            {dayTotals.carbs}g / {userGoals.carbs}g
          </span>
        </div>
        
        {/* Fat */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <CircularProgressbar
              value={fatPercentage}
              text={`${dayTotals.fat}g`}
              styles={buildStyles({
                textSize: '30px',
                pathColor: getProgressColor('fat'),
                textColor: '#3c3c3c',
                trailColor: '#f9f9f9',
              })}
            />
          </div>
          <span className="text-xs text-center mt-1">
            {dayTotals.fat}g / {userGoals.fat}g
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyNutritionCard;
