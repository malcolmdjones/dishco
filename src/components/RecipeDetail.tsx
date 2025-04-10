
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import { getRecipeImage } from '@/utils/recipeUtils';

import RecipeDetailHeader from './recipe-detail/RecipeDetailHeader';
import RecipeDetailContent from './recipe-detail/RecipeDetailContent';
import RecipeDetailFooter from './recipe-detail/RecipeDetailFooter';

interface RecipeDetailProps {
  recipeId: string;
  onClose: () => void;
  onToggleSave?: (recipeId: string, isSaved: boolean) => void;
  isSaved?: boolean;
  className?: string;
  isOpen?: boolean;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ 
  recipeId, 
  onClose, 
  onToggleSave,
  isSaved: propIsSaved,
  className = '',
  isOpen = true
}) => {
  const { toast } = useToast();
  const { recipes, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [isSaved, setIsSaved] = useState(propIsSaved || false);
  const [loading, setLoading] = useState(false);
  
  const recipe = recipes.find(r => r.id === recipeId);

  useEffect(() => {
    if (propIsSaved !== undefined) {
      setIsSaved(propIsSaved);
    } else {
      setIsSaved(isRecipeSaved(recipeId));
    }
  }, [recipeId, propIsSaved, isRecipeSaved]);
  
  const handleToggleSave = async () => {
    setLoading(true);
    try {
      await toggleSaveRecipe(recipeId);
      
      setIsSaved(!isSaved);
      
      if (onToggleSave) {
        onToggleSave(recipeId, !isSaved);
      }
    } catch (error) {
      console.error('Error toggling recipe save state:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  if (!recipe) {
    return (
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
          <p>Recipe not found</p>
          <button onClick={onClose} className="mt-4 w-full py-2 bg-blue-500 text-white rounded">Close</button>
        </div>
      </div>
    );
  }

  const recipeType = recipe.type || 'homemade';
  const imageUrl = getRecipeImage(recipe.imageSrc);

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-xl p-0 max-w-md w-full max-h-[85vh] overflow-hidden">
        <RecipeDetailHeader 
          imageUrl={imageUrl}
          recipeType={recipeType}
          onClose={onClose}
        />
        
        <RecipeDetailContent recipe={recipe} />
        
        <div className="p-4">
          <RecipeDetailFooter 
            isSaved={isSaved}
            loading={loading}
            onSave={handleToggleSave}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
