
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Settings, User, Utensils, BookOpen, LogOut, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const MorePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchNutritionGoals();
    }
  }, [user]);

  const fetchNutritionGoals = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // With authentication, we can now fetch the user's specific nutrition goals
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
        setGoals({
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat
        });
      }
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
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
      name: 'Saved Meal Plans',
      icon: <Calendar size={20} className="text-purple-500" />,
      path: '/saved-plans',
      description: 'Access your collection of meal plans'
    },
    {
      name: 'Custom Recipes',
      icon: <Utensils size={20} className="text-green-500" />,
      path: '/add-recipe',
      description: 'View and create your own custom recipes'
    },
    {
      name: 'Dietary Restrictions',
      icon: <AlertTriangle size={20} className="text-orange-500" />,
      path: '/dietary-restrictions',
      description: 'Set your food preferences and allergies'
    },
    {
      name: 'Nutrition Goals',
      icon: <BookOpen size={20} className="text-blue-500" />,
      path: '/nutrition-goals',
      description: 'Set your daily macro and calorie targets'
    },
    {
      name: 'Account Settings',
      icon: <Settings size={20} className="text-gray-500" />,
      path: '/settings',
      description: 'Manage your profile and preferences'
    }
  ];

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
          <h2 className="font-bold">{user?.email || 'Loading...'}</h2>
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
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading your goals...</div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Logout Button */}
      <button 
        className="w-full py-3 border border-gray-300 rounded-xl text-dishco-text-light font-medium flex items-center justify-center"
        onClick={handleSignOut}
      >
        <LogOut size={18} className="mr-2" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default MorePage;
