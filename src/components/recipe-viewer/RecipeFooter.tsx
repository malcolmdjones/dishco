
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface RecipeFooterProps {
  isSaved: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}

const RecipeFooter: React.FC<RecipeFooterProps> = ({
  isSaved,
  saving,
  onSave,
  onClose
}) => {
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between w-full">
        <Button 
          variant="outline" 
          onClick={onSave}
          disabled={saving}
          className="gap-2"
        >
          <Heart 
            size={16} 
            className={isSaved ? "text-red-500 fill-current" : "text-red-500"} 
          />
          {isSaved ? "Saved" : "Save"}
        </Button>
        <Button variant="default" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default RecipeFooter;
