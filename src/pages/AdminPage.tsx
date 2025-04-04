
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
      
      <DashboardStats 
        userCount={userCount}
        planCount={planCount}
        recipeCount={recipeCount}
      />
      
      <AdminTabs />
    </div>
  );
};

export default AdminPage;
