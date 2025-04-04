
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminEditRecipePage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams<{ recipeId: string }>();
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return null; // Will redirect in useAuth hook
  }
  
  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-screen bg-gray-50">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Recipe</h1>
          <p className="text-dishco-text-light">Update recipe ID: {recipeId}</p>
        </div>
      </header>
      
      {/* Recipe form will be implemented here */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center py-8 text-gray-500">
          Recipe edit form will be implemented here with fields for name, description, image, ingredients, 
          instructions, nutrition information, and public/private toggle.
        </p>
      </div>
    </div>
  );
};

export default AdminEditRecipePage;
