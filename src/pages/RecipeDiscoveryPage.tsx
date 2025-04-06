
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, X, Filter } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecipePreferences } from '@/hooks/useRecipePreferences';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipe-discovery/RecipeCard';
import { Recipe } from '@/data/mockData';

const RecipeDiscoveryPage = () => {
  const navigate = useNavigate();
  const { recipes, isRecipeSaved, toggleSaveRecipe, loading: recipesLoading } = useRecipes();
  const { isRecipeLiked, setRecipePreference, likedRecipeIds } = useRecipePreferences();
  const { toast } = useToast();
  const [shuffledRecipes, setShuffledRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLiked, setShowLiked] = useState(false);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Motion values for dragging - declare ALL motion hooks unconditionally at the top level
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const cardOpacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const likeScale = useTransform(x, [0, 150], [0.5, 1.5]);
  const nopeScale = useTransform(x, [-150, 0], [1.5, 0.5]);
  const controls = useAnimation();

  // Refs for indicators
  const likeIndicatorRef = useRef<HTMLDivElement>(null);
  const nopeIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipes.length > 0) {
      const shuffled = [...recipes].sort(() => Math.random() - 0.5);
      setShuffledRecipes(shuffled);
      setLoading(false);
    }
  }, [recipes]);

  useEffect(() => {
    const liked = recipes.filter(recipe => likedRecipeIds.includes(recipe.id));
    setLikedRecipes(liked);
  }, [recipes, likedRecipeIds]);

  const currentRecipe = shuffledRecipes[currentIndex];
  const isFinished = currentIndex >= shuffledRecipes.length;

  const handleLike = useCallback(() => {
    if (!currentRecipe) return;
    
    controls.start({ x: 500, opacity: 0, transition: { duration: 0.5 } })
      .then(() => {
        setRecipePreference(currentRecipe.id, true);
        
        toast({
          title: "Recipe liked!",
          description: `Added ${currentRecipe.name} to your liked recipes`,
        });
        
        setCurrentIndex(prevIndex => prevIndex + 1);
        x.set(0);
      });
  }, [controls, currentRecipe, setRecipePreference, toast, x]);

  const handleDislike = useCallback(() => {
    if (!currentRecipe) return;
    
    controls.start({ x: -500, opacity: 0, transition: { duration: 0.5 } })
      .then(() => {
        setRecipePreference(currentRecipe.id, false);
        setCurrentIndex(prevIndex => prevIndex + 1);
        x.set(0);
      });
  }, [controls, currentRecipe, setRecipePreference, x]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 150;
    if (info.offset.x > threshold) {
      handleLike();
    } else if (info.offset.x < -threshold) {
      handleDislike();
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  }, [controls, handleDislike, handleLike]);

  const handleSaveRecipe = useCallback(async (recipe: Recipe) => {
    await toggleSaveRecipe(recipe.id);
    toast({
      title: isRecipeSaved(recipe.id) ? "Recipe removed" : "Recipe saved!",
      description: isRecipeSaved(recipe.id) 
        ? "Recipe removed from your saved recipes"
        : "Recipe added to your saved recipes",
    });
  }, [isRecipeSaved, toggleSaveRecipe, toast]);

  const handleRemoveFromLiked = useCallback((recipeId: string) => {
    setRecipePreference(recipeId, false);
    toast({
      title: "Recipe removed",
      description: "Recipe removed from your liked recipes",
    });
  }, [setRecipePreference, toast]);

  // Loading state component
  const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // Render liked recipes section
  const LikedRecipesSection = () => {
    return (
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
    );
  };

  // Render finished state component
  const FinishedState = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">No more recipes!</h2>
      <p className="text-gray-500 mb-6">Check out your liked recipes or refresh to start over</p>
      <div className="flex gap-4 justify-center">
        <Button 
          variant="outline"
          onClick={() => {
            const reshuffled = [...recipes].sort(() => Math.random() - 0.5);
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
  );

  // Render active swiping card component
  const SwipeCard = () => (
    <>
      <div className="relative w-full max-w-md mx-auto mb-6">
        <div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-green-500 rounded-full px-6 py-3"
          style={{ 
            scale: likeScale.get(), 
            opacity: x.get() > 0 ? x.get() / 150 * 0.8 : 0 
          }}
          ref={likeIndicatorRef}
        >
          <span className="text-white font-bold text-2xl">LIKE</span>
        </div>
        
        <div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-red-500 rounded-full px-6 py-3"
          style={{ 
            scale: nopeScale.get(), 
            opacity: x.get() < 0 ? Math.abs(x.get()) / 150 * 0.8 : 0 
          }}
          ref={nopeIndicatorRef}
        >
          <span className="text-white font-bold text-2xl">NOPE</span>
        </div>

        <motion.div
          style={{ 
            x, 
            rotate,
            opacity: cardOpacity
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="w-full touch-none"
        >
          {currentRecipe && <RecipeCard recipe={currentRecipe} />}
        </motion.div>
      </div>
      
      <div className="text-center mt-8 mb-4">
        <p className="text-sm text-gray-500">
          <span className="mr-2">👈 Swipe left to pass</span> | 
          <span className="ml-2">Swipe right to like 👉</span>
        </p>
      </div>

      <div className="flex justify-center gap-6">
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
          <Heart size={32} fill="white" className="text-white" />
        </motion.button>
      </div>
    </>
  );

  // Recipe swiper content component
  const RecipeSwiperContent = () => {
    if (isFinished) {
      return <FinishedState />;
    }
    return <SwipeCard />;
  };

  if (loading || recipesLoading) {
    return <LoadingState />;
  }

  // Main render function
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
          {showLiked ? <LikedRecipesSection /> : <RecipeSwiperContent />}
        </div>
      </div>
    </div>
  );
};

export default RecipeDiscoveryPage;
