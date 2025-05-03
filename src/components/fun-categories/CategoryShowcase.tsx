
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
    <div className="px-4 space-y-2 mb-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button 
          className="flex items-center text-sm font-medium text-blue-600"
          onClick={viewAll}
        >
          View all <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
      
      <div 
        className="overflow-hidden rounded-xl h-32 relative cursor-pointer"
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
          <div className="font-bold text-sm">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryShowcase;
