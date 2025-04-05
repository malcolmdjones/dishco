
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Unlock, Info } from 'lucide-react';
import { Recipe } from '@/data/mockData';
import { Draggable } from '@hello-pangea/dnd';

interface SnacksSectionProps {
  snacks: (Recipe | null)[];
  lockedSnacks: boolean[];
  toggleLockSnack: (index: number) => void;
  onAddFromVault: (index: number) => void;
  onSnackClick: (recipe: Recipe) => void;
  isDraggable?: boolean;
  currentDay?: number;
  updateMeal?: (mealType: string, recipe: Recipe | null, index?: number) => void;
}

const SnacksSection: React.FC<SnacksSectionProps> = ({
  snacks,
  lockedSnacks,
  toggleLockSnack,
  onAddFromVault,
  onSnackClick,
  isDraggable = false,
  currentDay = 0
}) => {
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="mb-6">
      <h3 className="font-medium text-lg mb-2">Snacks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {snacks.map((snack, idx) => (
          <React.Fragment key={idx}>
            {snack && isDraggable ? (
              <Draggable 
                draggableId={`snack-${idx}`} 
                index={idx}
                isDragDisabled={lockedSnacks[idx]}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-70" : ""}
                  >
                    <div 
                      className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                        lockedSnacks[idx] ? 'border-2 border-green-500' : ''
                      }`}
                    >
                      <div 
                        className="cursor-pointer cursor-grab active:cursor-grabbing" 
                        onClick={() => onSnackClick(snack)}
                      >
                        <div className="relative h-32 bg-gray-100">
                          <img 
                            src={imageUrl} 
                            alt={snack.name} 
                            className="w-full h-full object-cover"
                          />
                          
                          <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {snack.macros.calories} kcal
                          </div>
                          
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
                        
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-1">{snack.name}</h4>
                          
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
                          
                          {!lockedSnacks[idx] && (
                            <div className="mt-1 text-xs text-gray-400">
                              Drag to move
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ) : (
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
                    <div className="relative h-32 bg-gray-100">
                      <img 
                        src={imageUrl} 
                        alt={snack.name} 
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {snack.macros.calories} kcal
                      </div>
                      
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
                    
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-1">{snack.name}</h4>
                      
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
                  <Button 
                    variant="outline" 
                    onClick={() => onAddFromVault(idx)}
                    className="h-32 w-full flex flex-col items-center justify-center bg-gray-50"
                  >
                    <Plus size={24} className="mb-2" />
                    Add snack
                  </Button>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SnacksSection;
