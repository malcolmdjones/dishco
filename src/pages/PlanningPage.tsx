
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { recipes } from '@/data/mockData';

const PlanningPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = () => {
    navigate('/create-meal-plan');
  };

  // Get a selection of 4 recipes for display
  const recipeSelection = recipes.slice(0, 4);
  // Get 4 snack recipes for the Snack Savvy section
  const snackSelection = recipes.filter(recipe => recipe.type === 'snack').slice(0, 4);

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Meal Planning</h1>
        <p className="text-dishco-text-light">Plan your meals for the week</p>
      </header>

      <div className="space-y-6">
        {/* Weekly Overview */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Weekly Overview</h2>
            <Link to="/saved-plans">
              <Button variant="ghost" size="sm" className="text-xs">View Saved Plans</Button>
            </Link>
          </div>
          <p className="text-sm text-dishco-text-light">
            Here's a summary of your planned meals for the week.
          </p>
          {/* Placeholder for weekly calendar/summary */}
          <div className="mt-4 text-center">
            <Calendar size={48} className="mx-auto text-gray-300" />
            <p className="text-gray-400">Coming soon: Weekly meal plan view</p>
          </div>
        </div>

        {/* Generate Meal Plan Button */}
        <Button 
          className="w-full py-6 text-lg font-medium"
          onClick={handleGeneratePlan}
        >
          Generate a Meal Plan
          <ArrowRight className="ml-2" />
        </Button>

        {/* Discover Recipes */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              <span className="text-[#FF6B6B]">Dish</span>
              <span className="text-[#6B66FF]">cover</span> Recipes
            </h2>
            <Link to="/explore-recipes">
              <Button variant="ghost" size="sm">Explore Recipes</Button>
            </Link>
          </div>
          <p className="text-sm text-dishco-text-light mb-4">
            Discover new and exciting meal ideas tailored to your preferences.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {recipeSelection.map((recipe) => (
              <div key={recipe.id} className="cursor-pointer" onClick={() => navigate('/explore-recipes')}>
                <div className="bg-gray-100 rounded-lg aspect-square mb-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src={recipe.imageSrc} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{recipe.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">{recipe.macros.calories} cal</span>
                  <span className="text-xs text-blue-600">{recipe.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Snack Savvy Section - New Addition */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Snack Savvy</h2>
            <Link to="/explore-snacks">
              <Button variant="ghost" size="sm">Explore Snacks</Button>
            </Link>
          </div>
          <p className="text-sm text-dishco-text-light mb-4">
            Enjoy convenient snacks that fit your macros and your lifestyle.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {snackSelection.length > 0 ? (
              snackSelection.map((snack) => (
                <div key={snack.id} className="cursor-pointer" onClick={() => navigate('/explore-snacks')}>
                  <div className="bg-gray-100 rounded-lg aspect-square mb-2 flex items-center justify-center overflow-hidden">
                    <img 
                      src={snack.imageSrc} 
                      alt={snack.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{snack.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">{snack.macros.calories} cal</span>
                    <span className="text-xs text-green-600">Snack</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback to use regular recipes if there aren't enough snack-specific recipes
              recipeSelection.map((recipe) => (
                <div key={recipe.id} className="cursor-pointer" onClick={() => navigate('/explore-snacks')}>
                  <div className="bg-gray-100 rounded-lg aspect-square mb-2 flex items-center justify-center overflow-hidden">
                    <img 
                      src={recipe.imageSrc} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{recipe.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">{recipe.macros.calories} cal</span>
                    <span className="text-xs text-green-600">Snack</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;
