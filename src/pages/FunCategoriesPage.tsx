
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import FeaturedCategories from '@/components/fun-categories/FeaturedCategories';
import CategoryShowcase from '@/components/fun-categories/CategoryShowcase';
import SplitCategories from '@/components/fun-categories/SplitCategories';
import PageHeader from '@/components/fun-categories/PageHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categoryData } from '@/data/categoryData';

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
            title={categoryData.mealPrep.title} 
            description={categoryData.mealPrep.description}
            recipes={mealPrepRecipes.slice(0, 6)} 
            placeholderImage={categoryData.mealPrep.image}
            viewAll={() => navigate('/explore-recipes')}
            gradientColors={categoryData.mealPrep.gradientColors}
          />
          
          {/* Split Categories - Budget Bites & Smoothie Station */}
          <SplitCategories 
            leftCategory={{
              title: categoryData.budgetBites.title,
              description: categoryData.budgetBites.description,
              recipes: recipes.slice(0, 3),
              placeholderImage: categoryData.budgetBites.image,
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: categoryData.budgetBites.gradientColors,
            }}
            rightCategory={{
              title: categoryData.smoothieStation.title,
              description: categoryData.smoothieStation.description,
              recipes: smoothieRecipes.slice(0, 3),
              placeholderImage: categoryData.smoothieStation.image,
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: categoryData.smoothieStation.gradientColors,
            }}
          />
          
          {/* Full Width Category - 5 Minute Breakfast Club */}
          <CategoryShowcase 
            title={categoryData.breakfastClub.title} 
            description={categoryData.breakfastClub.description}
            recipes={breakfastRecipes.slice(0, 6)} 
            placeholderImage={categoryData.breakfastClub.image}
            viewAll={() => navigate('/explore-recipes')}
            gradientColors={categoryData.breakfastClub.gradientColors}
          />
          
          {/* Split Categories - Protein Bakery & Brunch Vibes */}
          <SplitCategories 
            leftCategory={{
              title: categoryData.proteinBakery.title,
              description: categoryData.proteinBakery.description,
              recipes: proteinRecipes.slice(0, 3),
              placeholderImage: categoryData.proteinBakery.image,
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: categoryData.proteinBakery.gradientColors,
            }}
            rightCategory={{
              title: categoryData.brunchVibes.title,
              description: categoryData.brunchVibes.description,
              recipes: brunchRecipes.slice(0, 3),
              placeholderImage: categoryData.brunchVibes.image,
              viewAll: () => navigate('/explore-recipes'),
              gradientColors: categoryData.brunchVibes.gradientColors,
            }}
          />
          
          {/* Full Width Category - Snack Savvy */}
          <CategoryShowcase 
            title={categoryData.snackSavvy.title} 
            description={categoryData.snackSavvy.description}
            recipes={snackRecipes.slice(0, 6)} 
            placeholderImage={categoryData.snackSavvy.image}
            viewAll={() => navigate('/explore-snacks')}
            gradientColors={categoryData.snackSavvy.gradientColors}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default FunCategoriesPage;
