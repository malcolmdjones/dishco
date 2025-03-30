
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Info, Clock, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateDailyMacros } from '@/data/mockData';

interface PlanDetailViewProps {
  plan: any;
  isOpen: boolean;
  onClose: () => void;
}

const PlanDetailView: React.FC<PlanDetailViewProps> = ({ plan, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!plan) return null;
  
  const planData = plan.plan_data || {};
  const days = planData.days || [];
  
  const calculateTotalCalories = () => {
    if (!days || days.length === 0) return 0;
    
    let total = 0;
    days.forEach(day => {
      if (!day || !day.meals) return;
      
      total += day.meals.breakfast?.macros?.calories || 0;
      total += day.meals.lunch?.macros?.calories || 0;
      total += day.meals.dinner?.macros?.calories || 0;
      if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
        day.meals.snacks.forEach(snack => {
          total += snack?.macros?.calories || 0;
        });
      }
    });
    return Math.round(total / (days.length || 1));
  };
  
  const calculateTotalMacros = () => {
    if (!days || days.length === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    
    days.forEach(day => {
      if (!day || !day.meals) return;
      
      protein += day.meals.breakfast?.macros?.protein || 0;
      protein += day.meals.lunch?.macros?.protein || 0;
      protein += day.meals.dinner?.macros?.protein || 0;
      
      carbs += day.meals.breakfast?.macros?.carbs || 0;
      carbs += day.meals.lunch?.macros?.carbs || 0;
      carbs += day.meals.dinner?.macros?.carbs || 0;
      
      fat += day.meals.breakfast?.macros?.fat || 0;
      fat += day.meals.lunch?.macros?.fat || 0;
      fat += day.meals.dinner?.macros?.fat || 0;
      
      if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
        day.meals.snacks.forEach(snack => {
          protein += snack?.macros?.protein || 0;
          carbs += snack?.macros?.carbs || 0;
          fat += snack?.macros?.fat || 0;
        });
      }
    });
    
    return {
      protein: Math.round(protein / (days.length || 1)),
      carbs: Math.round(carbs / (days.length || 1)),
      fat: Math.round(fat / (days.length || 1))
    };
  };
  
  const totalCalories = calculateTotalCalories();
  const totalMacros = calculateTotalMacros();
  
  const renderMealDetail = (meal, type) => {
    if (!meal) return <p className="text-sm text-gray-500">No {type} planned</p>;
    
    return (
      <div className="border rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{meal.name}</h4>
          <span className="text-sm">{meal.macros?.calories || 0} cal</span>
        </div>
        
        {meal.image && (
          <img 
            src={meal.image} 
            alt={meal.name} 
            className="w-full h-32 object-cover rounded-md mb-2" 
          />
        )}
        
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>P: {meal.macros?.protein || 0}g</span>
          <span>C: {meal.macros?.carbs || 0}g</span>
          <span>F: {meal.macros?.fat || 0}g</span>
        </div>
        
        {meal.ingredients && (
          <div className="mt-3">
            <h5 className="text-sm font-medium mb-1">Ingredients:</h5>
            <ul className="text-sm list-disc pl-5">
              {meal.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
        
        {meal.instructions && (
          <div className="mt-3">
            <h5 className="text-sm font-medium mb-1">Instructions:</h5>
            <ol className="text-sm list-decimal pl-5">
              {meal.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-md mx-auto overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Created {format(new Date(plan.created_at), 'MMM d, yyyy')}
          </p>
          {planData.description && (
            <p className="text-sm mt-2">{planData.description}</p>
          )}
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Daily Calories</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-center">
                    <div className="w-24 h-24">
                      <CircularProgressbar
                        value={75}
                        text={`${totalCalories}`}
                        styles={buildStyles({
                          textSize: '22px',
                          pathColor: '#10b981',
                          textColor: '#333',
                        })}
                      />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">calories/day</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Daily Macros</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Protein</span>
                    <span className="font-medium">{totalMacros.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Carbs</span>
                    <span className="font-medium">{totalMacros.carbs}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fat</span>
                    <span className="font-medium">{totalMacros.fat}g</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Info size={18} className="mr-2 text-gray-500" />
                    <span className="text-sm">{days.length} days meal plan</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-gray-500" />
                    <span className="text-sm">Average prep time: 30 mins</span>
                  </div>
                  <div className="flex items-center">
                    <Utensils size={18} className="mr-2 text-gray-500" />
                    <span className="text-sm">{days.reduce((count, day) => {
                      if (!day || !day.meals) return count;
                      let mealCount = 0;
                      if (day.meals.breakfast) mealCount++;
                      if (day.meals.lunch) mealCount++;
                      if (day.meals.dinner) mealCount++;
                      if (day.meals.snacks) mealCount += day.meals.snacks.length;
                      return count + mealCount;
                    }, 0)} total meals</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meals">
            {days.map((day, index) => (
              <div key={index} className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Day {index + 1}</h3>
                
                {day && day.meals ? (
                  <>
                    <h4 className="font-medium text-sm mb-2 text-gray-600">Breakfast</h4>
                    {renderMealDetail(day.meals.breakfast, 'breakfast')}
                    
                    <h4 className="font-medium text-sm mb-2 text-gray-600">Lunch</h4>
                    {renderMealDetail(day.meals.lunch, 'lunch')}
                    
                    <h4 className="font-medium text-sm mb-2 text-gray-600">Dinner</h4>
                    {renderMealDetail(day.meals.dinner, 'dinner')}
                    
                    {day.meals.snacks && day.meals.snacks.length > 0 && (
                      <>
                        <h4 className="font-medium text-sm mb-2 text-gray-600">Snacks</h4>
                        {day.meals.snacks.map((snack, i) => (
                          <div key={i}>
                            {renderMealDetail(snack, `snack ${i + 1}`)}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No meals planned for this day</p>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PlanDetailView;
