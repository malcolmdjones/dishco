
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';

const AdminTabs: React.FC = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default AdminTabs;
