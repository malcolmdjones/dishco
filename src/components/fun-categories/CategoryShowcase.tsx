
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CategoryShowcaseProps {
  title: string;
  description?: string;
  image: string;
  viewAll: () => void;
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ 
  title,
  description,
  image,
  viewAll
}) => {
  return (
    <div className="px-4 space-y-1 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <button 
          className="flex items-center text-xs font-medium text-blue-600"
          onClick={viewAll}
        >
          View all <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
      
      <div 
        className="overflow-hidden rounded-lg h-36 relative cursor-pointer"
        onClick={viewAll}
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-1.5 bg-white bg-opacity-80 rounded-tr-lg">
          <div className="font-semibold text-xs">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryShowcase;
