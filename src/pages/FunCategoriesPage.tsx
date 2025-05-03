
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import FeaturedCategories from '@/components/fun-categories/FeaturedCategories';
import CategoryShowcase from '@/components/fun-categories/CategoryShowcase';
import SplitCategories from '@/components/fun-categories/SplitCategories';
import PageHeader from '@/components/fun-categories/PageHeader';
import { ScrollArea } from '@/components/ui/scroll-area';

const FunCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes();
  
  // Filter recipes by category
  const getRecipesByCategory = (category: string) => {
    return recipes.filter(recipe => 
      recipe.type?.toLowerCase() === category.toLowerCase() ||
      recipe.name.toLowerCase().includes(category.toLowerCase())
    );
  };
  
  const mealPrepRecipes = getRecipesByCategory('meal prep');
  const breakfastRecipes = getRecipesByCategory('breakfast');
  const smoothieRecipes = getRecipesByCategory('smoothie');
  const proteinRecipes = getRecipesByCategory('protein');
  const snackRecipes = getRecipesByCategory('snack');
  const brunchRecipes = getRecipesByCategory('brunch');

  return (
    <div className="pb-16">
      <PageHeader />
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6 px-1 py-2">
          {/* Featured Categories */}
          <FeaturedCategories />
          
          {/* Full Width Category - Meal Prep MVPs */}
          <CategoryShowcase 
            title="Meal Prep MVPs" 
            recipes={mealPrepRecipes.slice(0, 6)} 
            viewAll={() => navigate('/explore-recipes')}
            gradientColors="from-purple-500 to-blue-500"
          />
          
          {/* Split Categories - Budget Bites & Smoothie Station */}
          <SplitCategories 
            leftCategory={{
              title: "Budget Bites",
              recipes: recipes.slice(0, 3),
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: "from-green-500 to-teal-500",
            }}
            rightCategory={{
              title: "Smoothie Station",
              recipes: smoothieRecipes.slice(0, 3),
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: "from-pink-500 to-red-500",
            }}
          />
          
          {/* Full Width Category - 5 Minute Breakfast Club */}
          <CategoryShowcase 
            title="5 Min Breakfast Club" 
            recipes={breakfastRecipes.slice(0, 6)} 
            viewAll={() => navigate('/explore-recipes')}
            gradientColors="from-yellow-400 to-orange-500"
          />
          
          {/* Split Categories - Protein Bakery & Brunch Vibes */}
          <SplitCategories 
            leftCategory={{
              title: "Protein Bakery",
              recipes: proteinRecipes.slice(0, 3),
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: "from-blue-500 to-indigo-500",
            }}
            rightCategory={{
              title: "Brunch Vibes",
              recipes: brunchRecipes.slice(0, 3),
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: "from-orange-500 to-red-500",
            }}
          />
          
          {/* Full Width Category - Snack Savvy */}
          <CategoryShowcase 
            title="Snack Savvy" 
            recipes={snackRecipes.slice(0, 6)} 
            viewAll={() => navigate('/explore-snacks')}
            gradientColors="from-teal-400 to-cyan-500"
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default FunCategoriesPage;
