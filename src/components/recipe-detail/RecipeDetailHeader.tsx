
import React from 'react';
import { X, Heart } from 'lucide-react';
import Badge from '@/components/Badge';

interface RecipeDetailHeaderProps {
  imageUrl: string;
  recipeType: string | undefined;
  onClose: () => void;
}

const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({
  imageUrl,
  recipeType,
  onClose
}) => {
  return (
    <div className="relative h-48">
      <img 
        src={imageUrl} 
        alt="Recipe" 
        className="w-full h-full object-cover"
      />
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
      >
        <X size={20} />
      </button>
      
      {recipeType && (
        <div className="absolute top-3 left-3">
          <Badge 
            text={recipeType.charAt(0).toUpperCase() + recipeType.slice(1)} 
            variant={recipeType as any}
          />
        </div>
      )}
    </div>
  );
};

export default RecipeDetailHeader;
