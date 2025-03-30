
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Unlock, CookingPot, Zap, Blend } from 'lucide-react';
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
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-medium mb-4">Snacks</h3>
      
      <div className="space-y-4">
        {snacks.map((snack, idx) => (
          <div 
            key={idx} 
            className={`border-b pb-4 last:border-b-0 last:pb-0 ${
              lockedSnacks[idx] ? 'border-2 border-green-500 rounded-lg p-2 -mx-2 animate-pulse' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm text-gray-600">Snack {idx + 1}</h4>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${lockedSnacks[idx] ? 'text-green-500' : ''}`}
                  onClick={() => toggleLockSnack(idx)}
                >
                  {lockedSnacks[idx] ? <Lock size={16} /> : <Unlock size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onAddFromVault(idx)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {snack ? (
              <div 
                className="cursor-pointer" 
                onClick={() => onSnackClick(snack)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{snack.name}</h4>
                  <div className="flex gap-1">
                    {snack.equipment?.includes('blender') && (
                      <span className="text-gray-500" title="Requires blender">
                        <Blend size={14} />
                      </span>
                    )}
                    {snack.equipment?.includes('stove') && (
                      <span className="text-gray-500" title="Requires cooking">
                        <CookingPot size={14} />
                      </span>
                    )}
                    {snack.cookingTime && snack.cookingTime <= 15 && (
                      <span className="text-amber-500" title="Quick to prepare">
                        <Zap size={14} />
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{snack.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {snack.macros.calories} kcal
                  </span>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      P: {snack.macros.protein}g
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      C: {snack.macros.carbs}g
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      F: {snack.macros.fat}g
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-20 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-400 text-sm">No snack selected</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnacksSection;
