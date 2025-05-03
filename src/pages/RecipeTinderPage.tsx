
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeViewer from '@/components/RecipeViewer';

const RecipeTinderPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recipes, loading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left' | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  
  useEffect(() => {
    if (recipes.length > 0) {
      // Shuffle recipes for variety
      const shuffled = [...recipes].sort(() => 0.5 - Math.random());
      setFilteredRecipes(shuffled);
    }
  }, [recipes]);

  const currentRecipe = filteredRecipes[currentIndex];
  
  const handleSwipe = (liked: boolean) => {
    setDirection(liked ? 'right' : 'left');
    
    if (liked && currentRecipe) {
      handleSaveRecipe(currentRecipe.id);
    }
    
    setTimeout(() => {
      if (currentIndex < filteredRecipes.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        // Reset or show end message
        toast({
          title: "You've seen all recipes!",
          description: "Start again from the beginning?",
        });
        setCurrentIndex(0);
      }
      setDirection(null);
    }, 300);
  };
  
  const handleSaveRecipe = async (id: string) => {
    try {
      await toggleSaveRecipe(id);
      toast({
        title: "Saved!",
        description: "Recipe added to your favorites",
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };
  
  const handleViewDetails = () => {
    setIsViewerOpen(true);
  };

  return (
    <div className="h-full bg-white animate-fade-in">
      <header className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold">Recipe Tinder</h1>
        <div className="w-10" />
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4" />
            <p className="text-gray-500">Loading recipes...</p>
          </div>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="relative h-[70vh] px-4 pt-2 pb-8 flex flex-col items-center">
          {/* Current recipe card */}
          <AnimatePresence>
            {currentRecipe && (
              <motion.div 
                key={currentRecipe.id}
                className="absolute w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                  rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
                }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Recipe image */}
                <div className="relative h-64 bg-gray-200">
                  {currentRecipe.imageSrc ? (
                    <img 
                      src={currentRecipe.imageSrc} 
                      alt={currentRecipe.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  {/* Recipe type badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                      {currentRecipe.type?.charAt(0).toUpperCase() + currentRecipe.type?.slice(1) || 'Recipe'}
                    </span>
                  </div>
                </div>

                {/* Recipe details */}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{currentRecipe.name}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{currentRecipe.description}</p>
                  
                  {/* Macros */}
                  <div className="flex space-x-3 mb-3">
                    <div className="bg-red-100 px-2 py-1 rounded-md text-xs text-red-700">
                      {currentRecipe.macros?.calories || 0} cal
                    </div>
                    <div className="bg-blue-100 px-2 py-1 rounded-md text-xs text-blue-700">
                      {currentRecipe.macros?.protein || 0}g protein
                    </div>
                    <div className="bg-yellow-100 px-2 py-1 rounded-md text-xs text-yellow-700">
                      {currentRecipe.macros?.carbs || 0}g carbs
                    </div>
                  </div>
                  
                  {/* Prep time */}
                  {(currentRecipe.prepTime > 0 || currentRecipe.cookTime > 0) && (
                    <p className="text-sm text-gray-500">
                      {currentRecipe.prepTime > 0 ? `Prep: ${currentRecipe.prepTime}min` : ''}
                      {currentRecipe.prepTime > 0 && currentRecipe.cookTime > 0 ? ' • ' : ''}
                      {currentRecipe.cookTime > 0 ? `Cook: ${currentRecipe.cookTime}min` : ''}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Action buttons */}
          <div className="absolute bottom-0 flex justify-center space-x-6 w-full">
            <Button 
              variant="outline"
              size="lg" 
              className="h-14 w-14 rounded-full border-2 border-red-400 text-red-500"
              onClick={() => handleSwipe(false)}
            >
              <X size={30} />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-blue-400 text-blue-500"
              onClick={handleViewDetails}
            >
              <Info size={24} />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500"
              onClick={() => handleSwipe(true)}
            >
              <Heart size={24} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <p className="text-gray-500">No recipes available</p>
          </div>
        </div>
      )}
      
      {/* Recipe details viewer */}
      {currentRecipe && (
        <RecipeViewer
          recipe={currentRecipe}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onToggleSave={() => handleSaveRecipe(currentRecipe.id)}
          isSaved={isRecipeSaved(currentRecipe.id)}
        />
      )}
    </div>
  );
};

export default RecipeTinderPage;
