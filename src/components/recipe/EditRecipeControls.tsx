
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Trash } from 'lucide-react';

interface EditRecipeControlsProps {
  recipeId: string;
  isEditing: boolean;
}

const EditRecipeControls: React.FC<EditRecipeControlsProps> = ({ recipeId, isEditing }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteRecipe = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
        const updatedRecipes = savedRecipes.filter((recipe: any) => recipe.id !== recipeId);
        localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
        
        toast({
          title: "Recipe deleted",
          description: "Your recipe has been removed from your collection",
        });
        
        navigate('/custom-recipes');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast({
          title: "Error",
          description: "Failed to delete the recipe",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="mt-6 flex justify-end">
      {isEditing && (
        <Button 
          variant="destructive" 
          className="ml-auto"
          onClick={handleDeleteRecipe}
        >
          <Trash size={16} className="mr-2" />
          Delete Recipe
        </Button>
      )}
    </div>
  );
};

export default EditRecipeControls;
