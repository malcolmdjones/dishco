
import React from 'react';

interface CategoryProps {
  title: string;
  description?: string;
  image: string;
  viewAll: () => void;
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

const CategoryTile: React.FC<CategoryProps> = ({ title, description, image, viewAll }) => {
  return (
    <div 
      className="rounded-xl overflow-hidden h-40 relative cursor-pointer group"
      onClick={viewAll}
    >
      <div className="w-full h-full">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-black bg-opacity-30">
        <h3 className="font-bold text-sm md:text-base">{title}</h3>
        {description && <p className="text-xs opacity-90 hidden md:block">{description}</p>}
      </div>
    </div>
  );
};

export default SplitCategories;
