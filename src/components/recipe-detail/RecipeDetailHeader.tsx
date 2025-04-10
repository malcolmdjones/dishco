
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
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm">
          {recipeType.charAt(0).toUpperCase() + recipeType.slice(1)}
        </div>
      )}
      
      <button 
        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 text-black hover:bg-white"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default RecipeDetailHeader;
