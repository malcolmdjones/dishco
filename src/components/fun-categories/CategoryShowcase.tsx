
import React from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem 
} from '@/components/ui/carousel';
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
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button 
          className="flex items-center text-sm font-medium text-blue-600"
          onClick={viewAll}
        >
          View all <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
      
      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          <CarouselItem className="pl-2 md:pl-4 basis-full">
            <div className="overflow-hidden rounded-xl h-48 relative cursor-pointer group" onClick={viewAll}>
              <div className="w-full h-full">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-black bg-opacity-30">
                <h3 className="font-bold line-clamp-1">{title}</h3>
                {description && <p className="text-sm opacity-90">{description}</p>}
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CategoryShowcase;
