
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface RecipeFooterProps {
  isSaved: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  isConsumed?: boolean;
  onToggleConsumed?: () => void;
}

const RecipeFooter: React.FC<RecipeFooterProps> = ({ 
  isSaved, 
  saving, 
  onSave, 
  onClose,
  isConsumed,
  onToggleConsumed
}) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      {onToggleConsumed && (
        <Button
          className={`w-full ${isConsumed ? 'bg-green-600 hover:bg-green-700' : ''}`}
          variant={isConsumed ? "default" : "outline"}
          onClick={onToggleConsumed}
        >
          {isConsumed ? (
            <span className="flex items-center">
              Consumed <Check className="ml-2" size={16} />
            </span>
          ) : (
            "Mark as consumed"
          )}
        </Button>
      )}
      
      <div className="flex space-x-2 w-full">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          className="flex-1"
          onClick={onSave}
          disabled={saving}
        >
          {isSaved ? "Saved to Favorites" : "Save to Favorites"}
        </Button>
      </div>
    </div>
  );
};

export default RecipeFooter;
