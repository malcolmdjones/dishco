import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Badge from './Badge';
import { useRecipes } from '@/hooks/useRecipes';

interface RecipeDetailProps {
  recipeId: string;
  onClose: () => void;
  onToggleSave?: (recipeId: string, isSaved: boolean) => void;
  isSaved?: boolean;
  className?: string;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ 
  recipeId, 
  onClose, 
  onToggleSave,
  isSaved: propIsSaved,
  className = ''
}) => {
  const { toast } = useToast();
  const { recipes, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [isSaved, setIsSaved] = useState(propIsSaved || false);
  const [loading, setLoading] = useState(false);
  
  const recipe = recipes.find(r => r.id === recipeId);

  useEffect(() => {
    // If isSaved prop is provided, use it
    if (propIsSaved !== undefined) {
      setIsSaved(propIsSaved);
    } else {
      // Otherwise check from recipe hook
      setIsSaved(isRecipeSaved(recipeId));
    }
  }, [recipeId, propIsSaved, isRecipeSaved]);
  
  const handleToggleSave = async () => {
    setLoading(true);
    try {
      await toggleSaveRecipe(recipeId);
      
      // Update local state
      setIsSaved(!isSaved);
      
      // Call parent callback if provided
      if (onToggleSave) {
        onToggleSave(recipeId, !isSaved);
      }
    } catch (error) {
      console.error('Error toggling recipe save state:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!recipe) {
    return (
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
          <p>Recipe not found</p>
          <Button onClick={onClose} className="mt-4 w-full">Close</Button>
        </div>
      </div>
    );
  }

  const recipeType = recipe.type || 'homemade';
  const imageUrl = recipe.imageSrc || "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-xl p-0 max-w-md w-full max-h-[85vh] overflow-hidden">
        <div className="relative h-48">
          <img 
            src={imageUrl} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
          >
            <X size={20} />
          </button>
          
          {recipe.type && (
            <div className="absolute top-3 left-3">
              <Badge 
                text={recipeType.charAt(0).toUpperCase() + recipeType.slice(1)} 
                variant={recipeType as any}
              />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">{recipe.name}</h2>
          <p className="text-dishco-text-light mb-4">{recipe.description}</p>
          
          <div className="flex space-x-2 mb-4">
            <span className="px-2 py-1 bg-dishco-primary bg-opacity-10 rounded-md text-xs font-medium text-dishco-primary">
              {recipe.macros.calories} kcal
            </span>
            <span className="px-2 py-1 bg-amber-100 rounded-md text-xs font-medium text-amber-700">
              {recipe.macros.protein}g protein
            </span>
            <span className="px-2 py-1 bg-blue-100 rounded-md text-xs font-medium text-blue-700">
              {recipe.macros.carbs}g carbs
            </span>
            <span className="px-2 py-1 bg-green-100 rounded-md text-xs font-medium text-green-700">
              {recipe.macros.fat}g fat
            </span>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-sm">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2">
              {recipe.instructions && recipe.instructions.map((step, idx) => (
                <li key={idx} className="text-sm">{step}</li>
              ))}
            </ol>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className={`flex-1 justify-center ${isSaved ? 'border-red-500 hover:bg-red-50' : ''}`}
              onClick={handleToggleSave}
              disabled={loading}
            >
              <Heart 
                size={18} 
                className={isSaved ? "text-red-500 fill-current" : "text-red-500"} 
              />
              <span className="ml-2">{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            <Button className="flex-1" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
