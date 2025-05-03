
import React from 'react';
import CategoryCard from './CategoryCard';

interface Category {
  title: string;
  imageSrc: string;
  link: string;
}

interface SplitCategorySectionProps {
  title: string;
  leftCategory: Category;
  rightCategory: Category;
}

const SplitCategorySection = ({ title, leftCategory, rightCategory }: SplitCategorySectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <CategoryCard 
            title={leftCategory.title} 
            imageSrc={leftCategory.imageSrc} 
            link={leftCategory.link} 
            size="medium"
          />
        </div>
        <div className="col-span-1">
          <CategoryCard 
            title={rightCategory.title} 
            imageSrc={rightCategory.imageSrc} 
            link={rightCategory.link} 
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};

export default SplitCategorySection;
