
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import DashboardStats from '@/components/admin/DashboardStats';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { loading, isAdminUser, userCount, planCount, recipeCount } = useAdmin();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useAuth hook
  }
  
  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-screen bg-gray-50">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-dishco-text-light">Manage recipes, users and content</p>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <DashboardStats 
            userCount={userCount}
            planCount={planCount}
            recipeCount={recipeCount}
          />
        </div>
        
        <div className="lg:col-span-12">
          <AdminTabs />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
