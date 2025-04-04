
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Unlock, CookingPot, Zap, Blend, Info } from 'lucide-react';
import { Recipe } from '@/data/mockData';

interface SnacksSectionProps {
  snacks: (Recipe | null)[];
  lockedSnacks: boolean[];
  toggleLockSnack: (index: number) => void;
  onAddFromVault: (index: number) => void;
  onSnackClick: (recipe: Recipe) => void;
}

const SnacksSection: React.FC<SnacksSectionProps> = ({
  snacks,
  lockedSnacks,
  toggleLockSnack,
  onAddFromVault,
  onSnackClick
}) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium text-lg mb-2">Snacks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {snacks.map((snack, idx) => (
          <div 
            key={idx} 
            className={`bg-white rounded-xl shadow-sm overflow-hidden ${
              lockedSnacks[idx] ? 'border-2 border-green-500' : ''
            }`}
          >
            {snack ? (
              <div 
                className="cursor-pointer" 
                onClick={() => onSnackClick(snack)}
              >
                {/* Image Section */}
                <div className="relative h-32 bg-gray-100">
                  {snack.imageSrc ? (
                    <img 
                      src={snack.imageSrc} 
                      alt={snack.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400">No image available</div>
                    </div>
                  )}
                  
                  {/* Calorie Badge */}
                  <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    {snack.macros.calories} kcal
                  </div>
                  
                  {/* Lock/Unlock and Info Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className={`h-6 w-6 rounded-full bg-white shadow-md ${lockedSnacks[idx] ? 'text-green-500' : 'text-gray-500'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLockSnack(idx);
                      }}
                    >
                      {lockedSnacks[idx] ? <Lock size={12} /> : <Unlock size={12} />}
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-6 w-6 rounded-full bg-white shadow-md text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFromVault(idx);
                      }}
                    >
                      <Info size={12} />
                    </Button>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">{snack.name}</h4>
                  
                  {/* Macros */}
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      P: {snack.macros.protein}g
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                      C: {snack.macros.carbs}g
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                      F: {snack.macros.fat}g
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 bg-gray-50 flex flex-col items-center justify-center p-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddFromVault(idx)}
                >
                  <Plus size={14} className="mr-1" />
                  Add snack
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnacksSection;
