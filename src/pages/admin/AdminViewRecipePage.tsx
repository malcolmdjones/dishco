
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminViewRecipePage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams<{ recipeId: string }>();
  const { isAdmin } = useAuth();
  
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
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">View Recipe</h1>
            <p className="text-dishco-text-light">Recipe ID: {recipeId}</p>
          </div>
        </div>
        
        <Button onClick={() => navigate(`/admin/edit-recipe/${recipeId}`)}>
          <Edit size={16} className="mr-1" /> Edit Recipe
        </Button>
      </header>
      
      {/* Recipe details will be displayed here */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center py-8 text-gray-500">
          Recipe details will be displayed here including name, description, image, ingredients, 
          instructions, nutrition information, and visibility status.
        </p>
      </div>
    </div>
  );
};

export default AdminViewRecipePage;
