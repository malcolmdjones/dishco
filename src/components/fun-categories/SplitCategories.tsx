
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
      className="relative overflow-hidden h-24 rounded-lg cursor-pointer"
      onClick={viewAll}
    >
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover" 
      />
      <div className="absolute bottom-0 left-0 p-1.5 bg-white bg-opacity-90 rounded-tr-lg">
        <div className="font-semibold text-xs">{title}</div>
      </div>
    </div>
  );
};

export default SplitCategories;
