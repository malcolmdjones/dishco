
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import CategoryCard from './CategoryCard';

interface Category {
  title: string;
  imageSrc: string;
  link: string;
}

interface CategorySectionProps {
  title: string;
  categories: Category[];
  cardSize?: 'large' | 'medium' | 'small';
}

const CategorySection = ({ title, categories, cardSize = 'medium' }: CategorySectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {categories.map((category, index) => (
            <CarouselItem key={index} className="basis-auto pl-4 first:pl-0">
              <CategoryCard 
                title={category.title} 
                imageSrc={category.imageSrc} 
                link={category.link}
                size={cardSize}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default CategorySection;
