
import React from 'react';
import { Recipe } from '@/data/mockData';
import RecipeDetail from '@/components/RecipeDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
    <Dialog open={isRecipeDetailOpen} onOpenChange={(open) => {
      if (!open) handleCloseRecipeDetail();
    }}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-auto">
        <RecipeDetail
          recipeId={selectedRecipe.id}
          onClose={handleCloseRecipeDetail}
          onToggleSave={handleToggleSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailHandler;
