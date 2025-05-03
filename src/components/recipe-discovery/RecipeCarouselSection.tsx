
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import RecipeCarouselCard from './RecipeCarouselCard';
import { Recipe } from '@/types/Recipe';

interface RecipeCarouselSectionProps {
  title: string;
  recipes: Recipe[];
  onOpenRecipe?: (recipe: Recipe) => void;
  cardSize?: 'large' | 'medium' | 'small';
}

const RecipeCarouselSection = ({ title, recipes, onOpenRecipe, cardSize = 'medium' }: RecipeCarouselSectionProps) => {
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
          {recipes.map((recipe) => (
            <CarouselItem key={recipe.id} className="basis-auto pl-4 first:pl-0">
              <RecipeCarouselCard 
                recipe={recipe} 
                onOpenRecipe={onOpenRecipe}
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

export default RecipeCarouselSection;
