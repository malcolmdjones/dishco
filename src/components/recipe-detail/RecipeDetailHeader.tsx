
import React from 'react';
import { X } from 'lucide-react';

interface RecipeDetailHeaderProps {
  imageUrl: string;
  recipeType?: string;
  onClose: () => void;
}

const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({
  imageUrl,
  recipeType,
  onClose
}) => {
  return (
    <div className="relative">
      <div className="w-full h-64 bg-gray-100 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={recipeType || 'Recipe'} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {recipeType && (
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
            {recipeType.charAt(0).toUpperCase() + recipeType.slice(1)}
          </span>
        </div>
      )}
      
      <button 
        className="absolute top-4 right-4 bg-white rounded-full p-2 text-black hover:bg-white"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default RecipeDetailHeader;
