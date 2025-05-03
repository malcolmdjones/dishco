
import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecipeDetailHeaderProps {
  imageUrl: string | null;
  recipeType?: string;
  onClose: () => void;
  isStoreBought?: boolean;
}

const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({ 
  imageUrl, 
  recipeType, 
  onClose,
  isStoreBought
}) => {
  return (
    <div className="relative">
      <div className="h-52 bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Recipe" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>
      
      <button 
        className="absolute top-3 right-3 z-10 bg-black bg-opacity-50 text-white p-1 rounded-full"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      
      <div className="absolute bottom-3 left-3 flex space-x-2">
        {recipeType && (
          <Badge 
            variant={
              recipeType.toLowerCase() === 'homemade' ? 'default' : 
              recipeType.toLowerCase() === 'store-bought' ? 'secondary' : 'outline'
            }
            className={
              recipeType.toLowerCase() === 'homemade' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
              recipeType.toLowerCase() === 'store-bought' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
              'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          >
            {isStoreBought && <ShoppingBag size={14} className="mr-1" />}
            {recipeType.charAt(0).toUpperCase() + recipeType.slice(1)}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailHeader;
