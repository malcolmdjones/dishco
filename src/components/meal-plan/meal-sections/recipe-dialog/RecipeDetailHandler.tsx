
import React from 'react';
import { Recipe } from '@/data/mockData';
import RecipeDetail from '@/components/RecipeDetail';

interface RecipeDetailHandlerProps {
  selectedRecipe: Recipe | null;
  isRecipeDetailOpen: boolean;
  handleCloseRecipeDetail: () => void;
  handleToggleSave: (recipeId: string, isSaved: boolean) => Promise<void>;
}

const RecipeDetailHandler: React.FC<RecipeDetailHandlerProps> = ({
  selectedRecipe,
  isRecipeDetailOpen,
  handleCloseRecipeDetail,
  handleToggleSave
}) => {
  if (!selectedRecipe || !isRecipeDetailOpen) return null;
  
  return (
    <RecipeDetail
      recipeId={selectedRecipe.id}
      onClose={handleCloseRecipeDetail}
      onToggleSave={handleToggleSave}
    />
  );
};

export default RecipeDetailHandler;
