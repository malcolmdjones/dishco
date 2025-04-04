
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import RecipeManagement from '@/components/admin/RecipeManagement';
import UserManagement from '@/components/admin/UserManagement';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminTabs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recipes');
  
  return (
    <Tabs defaultValue="recipes" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="recipes">Recipes</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="recipes" className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recipe Management</h2>
          <Button onClick={() => navigate('/admin/add-recipe')}>
            <Plus size={16} className="mr-1" /> Add New Recipe
          </Button>
        </div>
        
        <RecipeManagement />
      </TabsContent>
      
      <TabsContent value="users" className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>
        <UserManagement />
      </TabsContent>
      
      <TabsContent value="settings" className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6">System Settings</h2>
        <AdminSettings />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
