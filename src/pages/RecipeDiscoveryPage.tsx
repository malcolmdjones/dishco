import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, X, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecipePreferences } from '@/hooks/useRecipePreferences';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipe-discovery/RecipeCard';
import { Recipe } from '@/data/mockData';

const RecipeDiscoveryPage = () => {
  const navigate = useNavigate();
  const { recipes, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const { isRecipeLiked, setRecipePreference } = useRecipePreferences();
  const { toast } = useToast();
  const [shuffledRecipes, setShuffledRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [showLiked, setShowLiked] = useState(false);
  const dragConstraintsRef = useRef(null);

  useEffect(() => {
    const filteredRecipes = [...recipes];
    const shuffled = [...filteredRecipes].sort(() => Math.random() - 0.5);
    setShuffledRecipes(shuffled);
  }, [recipes]);

  const currentRecipe = shuffledRecipes[currentIndex];

  const handleLike = () => {
    if (!currentRecipe) return;
    
    setDirection('right');
    setLikedRecipes(prev => [...prev, currentRecipe]);
    
    setRecipePreference(currentRecipe.id, true);
    
    toast({
      title: "Recipe liked!",
      description: `Added ${currentRecipe.name} to your liked recipes`,
    });
    
    setTimeout(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
      setDirection(null);
    }, 300);
  };

  const handleDislike = () => {
    if (!currentRecipe) return;
    
    setDirection('left');
    
    setRecipePreference(currentRecipe.id, false);
    
    setTimeout(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
      setDirection(null);
    }, 300);
  };

  useEffect(() => {
    const liked = recipes.filter(recipe => isRecipeLiked(recipe.id));
    setLikedRecipes(liked);
  }, [recipes, isRecipeLiked]);

  const handleSaveRecipe = async (recipe: Recipe) => {
    await toggleSaveRecipe(recipe.id);
    toast({
      title: isRecipeSaved(recipe.id) ? "Recipe removed" : "Recipe saved!",
      description: isRecipeSaved(recipe.id) 
        ? "Recipe removed from your saved recipes"
        : "Recipe added to your saved recipes",
    });
  };

  const handleRemoveFromLiked = (recipeId: string) => {
    setLikedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    setRecipePreference(recipeId, false);
    toast({
      title: "Recipe removed",
      description: "Recipe removed from your liked recipes",
    });
  };

  const isFinished = currentIndex >= shuffledRecipes.length;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleDislike(),
    onSwipedRight: () => handleLike(),
    trackMouse: true
  });

  return (
    <div className="min-h-screen pb-16 animate-fade-in">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Recipe Discovery</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showLiked ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setShowLiked(!showLiked)}
          >
            <Heart size={16} fill={showLiked ? "white" : "transparent"} />
            {likedRecipes.length}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            Filters
          </Button>
        </div>
      </div>

      <div className="pt-20 px-4">
        {showLiked ? (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">Liked Recipes</h2>
            {likedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {likedRecipes.map(recipe => (
                  <motion.div 
                    key={recipe.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover-scale"
                  >
                    <div 
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                      onClick={() => {}} // We'll implement recipe detail view later
                    >
                      <div className="relative h-48">
                        <img 
                          src={recipe.imageSrc} 
                          alt={recipe.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {recipe.macros.calories} kcal
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg">{recipe.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                              P: {recipe.macros.protein}g
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                              C: {recipe.macros.carbs}g
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveRecipe(recipe);
                              }}
                            >
                              <Heart size={18} fill={isRecipeSaved(recipe.id) ? "#ea384c" : "transparent"} color={isRecipeSaved(recipe.id) ? "#ea384c" : "currentColor"} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromLiked(recipe.id);
                              }}
                            >
                              <X size={18} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Heart size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">No liked recipes yet</p>
                <p className="text-gray-400 text-sm text-center mt-2">Start swiping to discover recipes you'll love</p>
                <Button 
                  variant="default" 
                  className="mt-6"
                  onClick={() => setShowLiked(false)}
                >
                  Start Discovering
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
            {!isFinished && currentRecipe ? (
              <div 
                ref={dragConstraintsRef} 
                className="w-full max-w-lg relative"
                {...swipeHandlers}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ 
                      x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0, 
                      opacity: 0,
                      rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <RecipeCard recipe={currentRecipe} />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg"
                    onClick={handleDislike}
                  >
                    <X size={24} className="text-red-500" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                    onClick={handleLike}
                  >
                    <Star size={32} className="text-white" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg"
                    onClick={() => handleSaveRecipe(currentRecipe)}
                  >
                    <Heart 
                      size={24} 
                      className={isRecipeSaved(currentRecipe.id) ? "text-red-500" : "text-green-500"} 
                      fill={isRecipeSaved(currentRecipe.id) ? "#ea384c" : "transparent"}
                    />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">No more recipes!</h2>
                <p className="text-gray-500 mb-6">Check out your liked recipes or refresh to start over</p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const reshuffled = [...shuffledRecipes].sort(() => Math.random() - 0.5);
                      setShuffledRecipes(reshuffled);
                      setCurrentIndex(0);
                    }}
                  >
                    Start Over
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => setShowLiked(true)}
                  >
                    View Liked ({likedRecipes.length})
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDiscoveryPage;
