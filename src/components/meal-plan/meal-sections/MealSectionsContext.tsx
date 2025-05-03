
import React, { createContext, useContext, useState } from 'react';
import { Recipe } from '@/types/Recipe';

interface MealSectionsContextType {
  selectedRecipe: Recipe | null;
  isRecipeDetailOpen: boolean;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setIsRecipeDetailOpen: (isOpen: boolean) => void;
  handleMealClick: (recipe: Recipe) => void;
  handleCloseRecipeDetail: () => void;
}

const MealSectionsContext = createContext<MealSectionsContextType | undefined>(undefined);

export const MealSectionsProvider: React.FC<{
  children: React.ReactNode;
  onMealClick: (recipe: Recipe) => void;
}> = ({ children, onMealClick }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);

  const handleMealClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeDetailOpen(true);
    // Call the parent onMealClick if needed
    onMealClick(recipe);
  };

  const handleCloseRecipeDetail = () => {
    setIsRecipeDetailOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <MealSectionsContext.Provider
      value={{
        selectedRecipe,
        isRecipeDetailOpen,
        setSelectedRecipe,
        setIsRecipeDetailOpen,
        handleMealClick,
        handleCloseRecipeDetail
      }}
    >
      {children}
    </MealSectionsContext.Provider>
  );
};

export const useMealSections = () => {
  const context = useContext(MealSectionsContext);
  if (!context) {
    throw new Error('useMealSections must be used within a MealSectionsProvider');
  }
  return context;
};
