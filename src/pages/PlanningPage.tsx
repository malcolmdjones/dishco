
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import MealPlanOnboarding from '@/components/meal-plan/MealPlanOnboarding';
import { useSavedMealPlans } from '@/hooks/useSavedMealPlans';
import WeeklyOverview from '@/components/home/WeeklyOverview';

const PlanningPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { recipes, loading: recipesLoading } = useRecipes();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { activePlan } = useSavedMealPlans();
  
  // Fixed image URL to avoid 404s
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  const handleGeneratePlan = () => {
    setIsOnboardingOpen(true);
  };

  // Get a selection of 2 recipes for display
  const recipeSelection = recipes.slice(0, 2);
  // Get 2 snack recipes for the Snack Savvy section
  const snackSelection = recipes.filter(recipe => recipe.type === 'snack').slice(0, 2);
  // Get 2 dessert recipes for the Desserts section
  const dessertSelection = recipes.filter(recipe => recipe.type === 'dessert').slice(0, 2);

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Meal Planning</h1>
        <p className="text-dishco-text-light">Plan your meals for the week</p>
      </header>

      {recipesLoading ? (
        <div className="text-center py-8">
          <p>Loading meal planning data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weekly Overview - keeping this on the planning page */}
          <WeeklyOverview activePlan={activePlan} />

          {/* Generate Meal Plan Button */}
          <Button 
            className="w-full py-6 text-lg font-medium"
            onClick={handleGeneratePlan}
          >
            Generate a Meal Plan
            <ArrowRight className="ml-2" />
          </Button>

          {/* Discover Recipes with styled title */}
          <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse-light">Dishco</span>
                <span className="text-black">ver Recipes</span>
              </h2>
              <Link to="/explore-recipes">
                <Button variant="ghost" size="sm">View All Recipes</Button>
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
                      src={recipe.imageSrc || imageUrl} 
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
          
          {/* Snack Savvy Section - reduced to 2 items */}
          <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Snack Savvy</h2>
              <Link to="/explore-snacks">
                <Button variant="ghost" size="sm">View All Snacks</Button>
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
                        src={snack.imageSrc || imageUrl} 
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
                // Fallback for no snacks
                <div className="col-span-2 text-center py-6">
                  <p className="text-gray-400">No snacks available. Explore snacks to discover more!</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/explore-snacks')}
                    className="mt-2"
                  >
                    Find Snacks
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Desserts Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Desserts</h2>
              <Link to="/explore-desserts">
                <Button variant="ghost" size="sm">View All Desserts</Button>
              </Link>
            </div>
            <p className="text-sm text-dishco-text-light mb-4">
              Satisfy your sweet tooth while staying on track.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {dessertSelection.length > 0 ? (
                dessertSelection.map((dessert) => (
                  <div key={dessert.id} className="cursor-pointer" onClick={() => navigate('/explore-desserts')}>
                    <div className="bg-gray-100 rounded-lg aspect-square mb-2 flex items-center justify-center overflow-hidden">
                      <img 
                        src={dessert.imageSrc || imageUrl} 
                        alt={dessert.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{dessert.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">{dessert.macros.calories} cal</span>
                      <span className="text-xs text-purple-600">Dessert</span>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback for no desserts
                <div className="col-span-2 text-center py-6">
                  <p className="text-gray-400">No desserts available. Explore desserts to discover more!</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/explore-desserts')}
                    className="mt-2"
                  >
                    Find Desserts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Flow Dialog */}
      <MealPlanOnboarding 
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export default PlanningPage;
