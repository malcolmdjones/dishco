
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeHeaderProps {
  imageUrl: string;
  recipeName: string;
  recipeType?: string;
  onClose: () => void;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  imageUrl,
  recipeName,
  recipeType,
  onClose
}) => {
  return (
    <div className="relative">
      <div className="w-full h-64 overflow-hidden">
        <img 
          src={imageUrl}
          alt={recipeName}
          className="w-full h-full object-cover"
        />
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
        onClick={onClose}
      >
        <X size={18} />
      </Button>
      
      {recipeType && (
        <div className="absolute top-4 left-4">
          <span className="bg-white/80 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium">
            {recipeType.charAt(0).toUpperCase() + recipeType.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default RecipeHeader;
