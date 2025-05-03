
import React from 'react';
import { Recipe } from '@/data/mockData';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem 
} from '@/components/ui/carousel';
import { ArrowRight } from 'lucide-react';
import { getRecipeImage } from '@/utils/recipeUtils';

interface CategoryShowcaseProps {
  title: string;
  description?: string;
  recipes?: Recipe[];
  placeholderImage?: string;
  viewAll: () => void;
  gradientColors: string;
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ 
  title,
  description,
  recipes = [],
  placeholderImage,
  viewAll,
  gradientColors
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
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <CarouselItem key={recipe.id} className="pl-2 md:pl-4 basis-2/3 md:basis-1/2 lg:basis-1/3">
                <div className="overflow-hidden rounded-xl h-48 relative cursor-pointer group">
                  <div className="w-full h-full">
                    <img 
                      src={getRecipeImage(recipe.imageSrc)} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-t ${gradientColors} opacity-60`}></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold line-clamp-1">{recipe.name}</h3>
                    {recipe.prepTime && recipe.cookTime && (
                      <p className="text-sm opacity-90">{recipe.prepTime + recipe.cookTime} min</p>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))
          ) : placeholderImage ? (
            <CarouselItem className="pl-2 md:pl-4 basis-full">
              <div className="overflow-hidden rounded-xl h-48 relative cursor-pointer group">
                <div className="w-full h-full">
                  <img 
                    src={placeholderImage} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientColors} opacity-60`}></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold line-clamp-1">{title}</h3>
                  {description && <p className="text-sm opacity-90">{description}</p>}
                </div>
              </div>
            </CarouselItem>
          ) : (
            <CarouselItem className="pl-2 md:pl-4 basis-full">
              <div className="h-48 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                No image available
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CategoryShowcase;
