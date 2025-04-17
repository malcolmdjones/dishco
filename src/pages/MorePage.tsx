
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Settings, User, Utensils, LogOut, Calendar, AlertTriangle, Cookie, ShieldCheck, ShoppingCart, Cake, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MorePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, signOut } = useAuth();
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchNutritionGoals();
    }
  }, [isAuthenticated, navigate]);

  const fetchNutritionGoals = async () => {
    try {
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
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const menuItems = [
    {
      name: 'Saved Recipes',
      icon: <Heart size={20} className="text-pink-500" />,
      path: '/saved-recipes',
      description: 'View and manage your favorite recipes'
    },
    {
      name: 'Saved Snacks',
      icon: <Cookie size={20} className="text-amber-500" />,
      path: '/saved-snacks',
      description: 'Access your collection of favorite snacks'
    },
    {
      name: 'Saved Desserts',
      icon: <Cake size={20} className="text-purple-500" />,
      path: '/saved-desserts',
      description: 'Access your collection of favorite desserts'
    },
    {
      name: 'Saved Meal Plans',
      icon: <Calendar size={20} className="text-purple-500" />,
      path: '/saved-plans',
      description: 'Access your collection of meal plans'
    },
    {
      name: 'Custom Recipes',
      icon: <Utensils size={20} className="text-green-500" />,
      path: '/custom-recipes',
      description: 'View and manage your custom recipes'
    },
    {
      name: 'Dietary Restrictions',
      icon: <AlertTriangle size={20} className="text-orange-500" />,
      path: '/dietary-restrictions',
      description: 'Set your food preferences and allergies'
    },
    {
      name: 'Grocery List',
      icon: <ShoppingCart size={20} className="text-blue-500" />,
      path: '/grocery',
      description: 'View and manage your shopping list'
    },
    {
      name: 'Account Settings',
      icon: <Settings size={20} className="text-gray-500" />,
      path: '/settings',
      description: 'Manage your profile and preferences'
    }
  ];
  
  if (isAdmin) {
    menuItems.push({
      name: 'Admin Panel',
      icon: <ShieldCheck size={20} className="text-red-500" />,
      path: '/admin',
      description: 'Access admin controls and management'
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-bold mb-4">Please Sign In</h2>
        <p className="text-dishco-text-light mb-6">Sign in to access your profile and settings</p>
        <button 
          className="bg-dishco-primary text-white py-2 px-6 rounded-lg"
          onClick={() => navigate('/auth')}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">More</h1>
      
      <div className="space-y-4">
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Shopping</h2>
          <div className="space-y-2">
            <Link to="/grocery" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <ShoppingCart size={20} className="mr-3 text-dishco-primary" />
              <span>Grocery List</span>
            </Link>
            <Link to="/my-shelf" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <ShoppingBag size={20} className="mr-3 text-dishco-primary" />
              <span>My Shelf</span>
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Account</h2>
          <div className="space-y-2">
            <Link to="/saved-recipes" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <Heart size={20} className="mr-3 text-dishco-primary" />
              <span>Saved Recipes</span>
            </Link>
            <Link to="/saved-snacks" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <Cookie size={20} className="mr-3 text-dishco-primary" />
              <span>Saved Snacks</span>
            </Link>
            <Link to="/saved-desserts" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <Cake size={20} className="mr-3 text-dishco-primary" />
              <span>Saved Desserts</span>
            </Link>
            <Link to="/saved-plans" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <Calendar size={20} className="mr-3 text-dishco-primary" />
              <span>Saved Meal Plans</span>
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Recipes</h2>
          <div className="space-y-2">
            <Link to="/custom-recipes" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <Utensils size={20} className="mr-3 text-dishco-primary" />
              <span>Custom Recipes</span>
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Settings</h2>
          <div className="space-y-2">
            <Link to="/dietary-restrictions" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <AlertTriangle size={20} className="mr-3 text-dishco-primary" />
              <span>Dietary Restrictions</span>
            </Link>
            <Link to="/settings" className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <Settings size={20} className="mr-3 text-dishco-primary" />
              <span>Account Settings</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Current Nutrition Goals</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-dishco-text-light">Daily Calories</p>
            <p className="text-xl font-bold">{goals.calories} kcal</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-dishco-text-light">Protein</p>
            <p className="text-xl font-bold">{goals.protein}g</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-dishco-text-light">Carbs</p>
            <p className="text-xl font-bold">{goals.carbs}g</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-dishco-text-light">Fat</p>
            <p className="text-xl font-bold">{goals.fat}g</p>
          </div>
        </div>
        <button 
          className="w-full mt-4 py-2 px-4 bg-dishco-primary bg-opacity-10 text-dishco-primary rounded-lg font-medium"
          onClick={() => navigate('/nutrition-goals')}
        >
          Edit Goals
        </button>
      </div>

      <button 
        className="w-full py-3 border border-gray-300 rounded-xl text-dishco-text-light font-medium flex items-center justify-center"
        onClick={handleLogout}
      >
        <LogOut size={18} className="mr-2" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default MorePage;
