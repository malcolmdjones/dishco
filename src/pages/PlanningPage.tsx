
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';

const PlanningPage = () => {
  const navigate = useNavigate();
  const { activePlan } = useSavedMealPlans();
  
  // Sample recipe data for the discovery section
  const discoveryRecipes = [
    {
      id: 'carrot-cake',
      name: 'Carrot Cake Overnight...',
      calories: 363,
      type: 'breakfast',
      imageSrc: 'https://images.unsplash.com/photo-1551781066-15e2b1b00e2b?q=80&w=500'
    },
    {
      id: 'firecracker-beef',
      name: 'Firecracker Beef &...',
      calories: 620,
      type: 'lunch',
      imageSrc: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=500'
    }
  ];

  return (
    <div className="container max-w-md mx-auto pb-24 px-4">
      <div className="mt-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Meal Planning</h1>
        <p className="text-xl text-gray-500 mt-1">Plan your meals for the week</p>
      </div>

      {/* Weekly Overview Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-medium text-gray-800">Weekly Overview</h2>
            <Link to="/saved-plans">
              <Button variant="ghost" className="text-blue-600">View Saved Plans</Button>
            </Link>
          </div>

          {!activePlan ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-16 w-16 text-gray-300" />
              <p className="text-gray-500 mt-3 mb-5">No active meal plan</p>
              <p className="text-gray-500 mb-6">Activate a meal plan to see your meals for the week.</p>
              
              <Link to="/create-meal-plan">
                <Button 
                  variant="outline" 
                  className="rounded-full px-6"
                >
                  Create a meal plan
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {/* Active plan content would go here */}
              <p>Your active meal plan content</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Meal Plan Button */}
      <Button 
        className="w-full py-6 text-xl bg-green-600 hover:bg-green-700 mb-10 rounded-md"
        onClick={() => navigate('/create-meal-plan')}
      >
        Generate a Meal Plan
        <ArrowRight className="ml-2" />
      </Button>

      {/* Discover Recipes Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">
            <span className="text-pink-500 font-bold">Dishco</span>
            <span className="font-bold text-gray-800">ver Recipes</span>
          </h2>
          <Link to="/explore-recipes" className="text-blue-600">
            View All Recipes
          </Link>
        </div>
        
        <p className="text-gray-500 mb-4">
          Discover new and exciting meal ideas tailored to your preferences.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {discoveryRecipes.map((recipe) => (
            <div key={recipe.id} className="rounded-lg overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={recipe.imageSrc} 
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2">
                <p className="font-medium text-sm line-clamp-1">{recipe.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-gray-500">{recipe.calories} cal</p>
                  <p className={`text-${recipe.type === 'breakfast' ? 'blue' : 'purple'}-600`}>
                    {recipe.type === 'breakfast' ? 'Breakfast' : 'Lunch'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snack Savvy Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Snack Savvy</h2>
          <Link to="/explore-snacks" className="text-blue-600">
            View All Snacks
          </Link>
        </div>
        
        {/* Snack content would go here */}
      </div>
    </div>
  );
};

export default PlanningPage;
