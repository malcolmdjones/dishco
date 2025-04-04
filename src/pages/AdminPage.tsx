
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, BarChart2, Plus, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [planCount, setMealPlanCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access the admin panel.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
        
        // Check if user is an admin
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
          
        if (error || !data) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        
        // Fetch dashboard stats
        await fetchDashboardStats();
        
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Error",
          description: "Failed to verify admin privileges",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate, toast]);
  
  const fetchDashboardStats = async () => {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (!userError) {
        setUserCount(userCount || 0);
      }
      
      // Get meal plan count
      const { count: planCount, error: planError } = await supabase
        .from('saved_meal_plans')
        .select('*', { count: 'exact', head: true });
        
      if (!planError) {
        setMealPlanCount(planCount || 0);
      }
      
      // Get recipe count
      const { count: recipeCount, error: recipeError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });
        
      if (!recipeError) {
        setRecipeCount(recipeCount || 0);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-dishco-text-light">Manage recipes, users and settings</p>
        </div>
      </header>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <Users className="mx-auto mb-2 text-blue-500" />
          <h3 className="text-2xl font-bold">{userCount}</h3>
          <p className="text-sm text-dishco-text-light">Total Users</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <BarChart2 className="mx-auto mb-2 text-green-500" />
          <h3 className="text-2xl font-bold">{planCount}</h3>
          <p className="text-sm text-dishco-text-light">Meal Plans</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <Settings className="mx-auto mb-2 text-purple-500" />
          <h3 className="text-2xl font-bold">{recipeCount}</h3>
          <p className="text-sm text-dishco-text-light">Recipes</p>
        </div>
      </div>
      
      <Tabs defaultValue="recipes">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recipes" className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recipe Management</h2>
            <Button onClick={() => navigate('/add-recipe')}>
              <Plus size={16} className="mr-1" /> Add Recipe
            </Button>
          </div>
          
          <p className="text-dishco-text-light">
            Manage official recipes in the database. Add new recipes, edit existing ones, or remove recipes that are no longer needed.
          </p>
          
          <Button variant="outline" className="mt-4" onClick={() => navigate('/explore-recipes')}>
            View All Recipes
          </Button>
        </TabsContent>
        
        <TabsContent value="users" className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          <p className="text-dishco-text-light">
            View and manage user accounts. Assign admin privileges or deactivate accounts as needed.
          </p>
          
          {/* This would be expanded with a user table component in a real implementation */}
          <div className="mt-4 text-center text-dishco-text-light">
            User management interface coming soon
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">System Settings</h2>
          <p className="text-dishco-text-light">
            Configure application settings and preferences. Manage global parameters for the meal planning system.
          </p>
          
          <div className="mt-4 text-center text-dishco-text-light">
            Settings interface coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
