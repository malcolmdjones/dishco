
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyRecipeStateProps {
  onAddRecipe: () => void;
}

const EmptyRecipeState: React.FC<EmptyRecipeStateProps> = ({ onAddRecipe }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <h2 className="text-lg font-medium mb-2">No custom recipes yet</h2>
      <p className="text-gray-500 mb-4">Start adding your own recipes to build your collection.</p>
      <Button 
        onClick={onAddRecipe}
        className="mx-auto"
      >
        <Plus size={18} className="mr-2" />
        Add First Recipe
      </Button>
    </div>
  );
};

export default EmptyRecipeState;
