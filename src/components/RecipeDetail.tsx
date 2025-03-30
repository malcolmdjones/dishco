
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';
import { recipes } from '../data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecipeDetailProps {
  recipeId: string;
  onClose: () => void;
  onToggleSave: (recipeId: string, isSaved: boolean) => void;
  isSaved: boolean;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId, onClose, onToggleSave, isSaved }) => {
  const { toast } = useToast();
  const recipe = recipes.find(r => r.id === recipeId);
  
  if (!recipe) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <p>Recipe not found</p>
          <Button onClick={onClose} className="mt-4 w-full">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{recipe.name}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <img 
            src={recipe.imageSrc} 
            alt={recipe.name} 
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
          <p className="text-dishco-text-light mb-2">{recipe.description}</p>
          
          <div className="flex space-x-2 mb-4">
            <span className="macro-pill macro-pill-protein">P: {recipe.macros.protein}g</span>
            <span className="macro-pill macro-pill-carbs">C: {recipe.macros.carbs}g</span>
            <span className="macro-pill macro-pill-fat">F: {recipe.macros.fat}g</span>
            <span className="macro-pill bg-gray-100 text-gray-800">{recipe.macros.calories} kcal</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <ul className="list-disc pl-5 space-y-1">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="text-sm">{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="text-sm">{step}</li>
            ))}
          </ol>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 justify-center"
            onClick={() => onToggleSave(recipe.id, isSaved)}
          >
            <Heart 
              size={18} 
              className={isSaved ? "text-red-500 fill-current" : "text-red-500"} 
            />
            <span className="ml-2">{isSaved ? 'Unsave' : 'Save'}</span>
          </Button>
          <Button className="flex-1">Add to Plan</Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
