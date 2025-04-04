
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface RecipeDetailFooterProps {
  isSaved: boolean;
  loading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const RecipeDetailFooter: React.FC<RecipeDetailFooterProps> = ({
  isSaved,
  loading,
  onSave,
  onClose
}) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        className={`flex-1 justify-center ${isSaved ? 'border-red-500 hover:bg-red-50' : ''}`}
        onClick={onSave}
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
  );
};

export default RecipeDetailFooter;
