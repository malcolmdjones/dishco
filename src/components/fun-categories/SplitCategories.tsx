
import React from 'react';
import { Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';

interface CategoryProps {
  title: string;
  recipes: Recipe[];
  viewAll: () => void;
  gradientColors: string;
}

interface SplitCategoriesProps {
  leftCategory: CategoryProps;
  rightCategory: CategoryProps;
}

const SplitCategories: React.FC<SplitCategoriesProps> = ({ leftCategory, rightCategory }) => {
  return (
    <div className="px-4 grid grid-cols-2 gap-3">
      <CategoryTile {...leftCategory} />
      <CategoryTile {...rightCategory} />
    </div>
  );
};

const CategoryTile: React.FC<CategoryProps> = ({ title, recipes, viewAll, gradientColors }) => {
  const recipe = recipes.length > 0 ? recipes[0] : null;
  
  return (
    <div 
      className="rounded-xl overflow-hidden h-40 relative cursor-pointer group"
      onClick={viewAll}
    >
      {recipe ? (
        <>
          <div className="w-full h-full">
            <img 
              src={getRecipeImage(recipe.imageSrc)} 
              alt={recipe.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
          <div className={`absolute inset-0 bg-gradient-to-t ${gradientColors} opacity-60`}></div>
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-t ${gradientColors} opacity-80`}></div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="font-bold text-sm md:text-base">{title}</h3>
      </div>
    </div>
  );
};

export default SplitCategories;
