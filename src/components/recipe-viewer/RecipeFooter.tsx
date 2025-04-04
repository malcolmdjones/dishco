
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  
  const handleSave = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to save recipes.",
        variant: "destructive"
      });
      return;
    }
    
    // If authenticated, proceed with save
    onSave();
  };

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between w-full">
        <Button 
          variant="outline" 
          onClick={handleSave}
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
