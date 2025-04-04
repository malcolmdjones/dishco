
import React from 'react';
import { X } from 'lucide-react';
import Badge from '@/components/Badge';

interface RecipeHeaderProps {
  imageUrl: string;
  recipeName: string | undefined;
  recipeType: string | undefined;
  onClose: () => void;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  imageUrl,
  recipeName,
  recipeType,
  onClose
}) => {
  return (
    <div className="h-48 w-full overflow-hidden relative">
      <img 
        src={imageUrl} 
        alt={recipeName} 
        className="w-full h-full object-cover"
      />
      <button 
        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
        onClick={onClose}
      >
        <X size={18} />
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

export default RecipeHeader;
