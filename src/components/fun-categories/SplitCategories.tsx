
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
    <div className="px-4 grid grid-cols-2 gap-2 mb-3">
      <CategoryTile {...leftCategory} />
      <CategoryTile {...rightCategory} />
    </div>
  );
};

const CategoryTile: React.FC<CategoryProps> = ({ title, description, image, viewAll }) => {
  return (
    <div 
      className="rounded-xl overflow-hidden h-28 relative cursor-pointer"
      onClick={viewAll}
    >
      <div className="w-full h-full">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="absolute bottom-0 left-0 p-2 bg-white bg-opacity-90 rounded-tr-lg">
        <div className="font-bold text-xs">{title}</div>
      </div>
    </div>
  );
};

export default SplitCategories;
