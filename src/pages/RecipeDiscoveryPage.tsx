
import React, { useState, useEffect } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { ScrollArea } from '@/components/ui/scroll-area';
import RecipeViewer from '@/components/RecipeViewer';
import { Recipe } from '@/types/Recipe';
import RecipeCarouselSection from '@/components/recipe-discovery/RecipeCarouselSection';
import SplitCategorySection from '@/components/recipe-discovery/SplitCategorySection';
import CategorySection from '@/components/recipe-discovery/CategorySection';

const RecipeDiscoveryPage = () => {
  const { recipes, loading, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeViewerOpen, setIsRecipeViewerOpen] = useState(false);

  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeViewerOpen(true);
  };

  const categories = [
    { 
      title: 'Meal Prep MVPs', 
      imageSrc: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000', 
      link: '/explore-recipes?category=meal-prep' 
    },
    { 
      title: 'Budget Bites', 
      imageSrc: 'https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?q=80&w=1000', 
      link: '/explore-recipes?category=budget' 
    },
    { 
      title: 'Smoothie Station', 
      imageSrc: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1000', 
      link: '/explore-recipes?category=smoothie' 
    },
    { 
      title: '5 Minute Breakfast', 
      imageSrc: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000', 
      link: '/explore-recipes?category=breakfast' 
    }
  ];

  // Filter recipes by type
  const getRecipesByType = (type: string, limit: number = 10) => {
    return recipes.filter(recipe => recipe.type?.toLowerCase() === type.toLowerCase()).slice(0, limit);
  };

  const breakfast = getRecipesByType('breakfast');
  const lunch = getRecipesByType('lunch');
  const dinner = getRecipesByType('dinner');
  const snacks = getRecipesByType('snack');
  const desserts = getRecipesByType('dessert');
  
  // Quick recipes (cook time < 15 min)
  const quickRecipes = recipes
    .filter(recipe => recipe.cookTime && recipe.cookTime <= 15)
    .slice(0, 10);

  // High protein recipes
  const highProteinRecipes = recipes
    .filter(recipe => recipe.macros?.protein && recipe.macros.protein >= 30)
    .slice(0, 10);

  return (
    <div className="animate-fade-in pb-10">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>

      <ScrollArea className="pb-4">
        <div className="space-y-8">
          {/* Categories Section */}
          <CategorySection 
            title="Explore Categories" 
            categories={categories}
            cardSize="medium"
          />
          
          {/* Full width carousel sections */}
          {quickRecipes.length > 0 && (
            <RecipeCarouselSection 
              title="5 Minute Breakfast Club" 
              recipes={quickRecipes}
              onOpenRecipe={handleOpenRecipe}
              cardSize="medium"
            />
          )}
          
          {/* Split Categories */}
          <SplitCategorySection 
            title="Discover Meal Types"
            leftCategory={{ 
              title: 'Smoothie Station', 
              imageSrc: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1000', 
              link: '/explore-recipes?category=smoothie'
            }}
            rightCategory={{ 
              title: 'Protein Bakery', 
              imageSrc: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000', 
              link: '/explore-recipes?category=bakery'
            }}
          />
          
          {/* More Carousel Sections */}
          {highProteinRecipes.length > 0 && (
            <RecipeCarouselSection 
              title="High Protein" 
              recipes={highProteinRecipes}
              onOpenRecipe={handleOpenRecipe}
              cardSize="medium"
            />
          )}
          
          {/* Split Categories */}
          <SplitCategorySection 
            title="More To Explore"
            leftCategory={{ 
              title: 'Frozen Finds', 
              imageSrc: 'https://images.unsplash.com/photo-1631143070457-c1aecc92abbc?q=80&w=1000', 
              link: '/explore-recipes?category=frozen'
            }}
            rightCategory={{ 
              title: 'Snack Savvy', 
              imageSrc: 'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?q=80&w=1000', 
              link: '/explore-snacks'
            }}
          />
          
          {/* Breakfast Section */}
          {breakfast.length > 0 && (
            <RecipeCarouselSection 
              title="Breakfast Ideas" 
              recipes={breakfast}
              onOpenRecipe={handleOpenRecipe}
              cardSize="small"
            />
          )}
          
          {/* Lunch Section */}
          {lunch.length > 0 && (
            <RecipeCarouselSection 
              title="Lunch Ideas" 
              recipes={lunch}
              onOpenRecipe={handleOpenRecipe}
              cardSize="small"
            />
          )}
          
          {/* Dinner Section */}
          {dinner.length > 0 && (
            <RecipeCarouselSection 
              title="Dinner Ideas" 
              recipes={dinner}
              onOpenRecipe={handleOpenRecipe}
              cardSize="small"
            />
          )}
          
          {/* Snacks Section */}
          {snacks.length > 0 && (
            <RecipeCarouselSection 
              title="Snack Attack" 
              recipes={snacks}
              onOpenRecipe={handleOpenRecipe}
              cardSize="small"
            />
          )}
          
          {/* Desserts Section */}
          {desserts.length > 0 && (
            <RecipeCarouselSection 
              title="Sweet Treats" 
              recipes={desserts}
              onOpenRecipe={handleOpenRecipe}
              cardSize="small"
            />
          )}
        </div>
      </ScrollArea>

      {/* Recipe Viewer */}
      {selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={isRecipeViewerOpen}
          onClose={() => setIsRecipeViewerOpen(false)}
          isSaved={isRecipeSaved(selectedRecipe.id)}
          onToggleSave={() => toggleSaveRecipe(selectedRecipe.id)}
          isConsumed={false}
          onToggleConsumed={() => {}}
        />
      )}
    </div>
  );
};

export default RecipeDiscoveryPage;
