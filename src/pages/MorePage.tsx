import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Settings, User, Utensils, LogOut, Calendar, AlertTriangle, Cookie, ShieldCheck, ShoppingCart, Cake } from 'lucide-react';
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
    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchNutritionGoals();
    }
  }, [isAuthenticated, navigate]);

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
      name: 'Profile',
      icon: <User size={20} className="text-blue-500" />,
      path: '/profile',
      description: 'View and edit your profile'
    },
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
  
  // Add admin panel menu item for admin users
  if (isAdmin) {
    menuItems.push({
      name: 'Admin Panel',
      icon: <ShieldCheck size={20} className="text-red-500" />,
      path: '/admin',
      description: 'Access admin controls and management'
    });
  }

  // If not authenticated, show a login prompt
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
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">More</h1>
        <p className="text-dishco-text-light">Account, recipes and settings</p>
      </header>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center">
        <div className="w-14 h-14 rounded-full bg-dishco-primary flex items-center justify-center mr-4">
          <User size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold">{user?.user_metadata?.name || user?.email}</h2>
          <p className="text-sm text-dishco-text-light">{user?.email}</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3 mb-6">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center">
              <div className="mr-4">
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-dishco-text-light">{item.description}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Nutrition Goals Summary */}
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

      {/* Logout Button */}
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
