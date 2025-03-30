
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, Loader2 } from 'lucide-react';

interface BottomActionBarProps {
  onRegenerate: () => void;
  onSave: () => void;
  isGenerating: boolean;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onRegenerate,
  onSave,
  isGenerating
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-white border-t flex justify-between">
      <Button 
        variant="outline" 
        onClick={onRegenerate} 
        disabled={isGenerating}
        className="w-[48%] bg-amber-50 border-amber-200 text-amber-800"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <RefreshCw size={16} className="mr-2" />
            Regenerate
          </>
        )}
      </Button>
      
      <Button 
        onClick={onSave} 
        disabled={isGenerating}
        className="w-[48%] bg-green-600 hover:bg-green-700"
      >
        <Save size={16} className="mr-2" />
        Save Plan
      </Button>
    </div>
  );
};

export default BottomActionBar;
