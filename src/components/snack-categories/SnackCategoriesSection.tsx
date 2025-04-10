
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface SnackCategory {
  id: string;
  title: string;
  imageSrc: string;
  slug: string;
}

const categories: SnackCategory[] = [
  {
    id: 'brunch',
    title: 'Brunch',
    imageSrc: '/lovable-uploads/af22c164-be39-42b2-a000-579985f8dd02.png',
    slug: 'brunch'
  },
  {
    id: 'game-day',
    title: 'Game Day',
    imageSrc: '/lovable-uploads/af22c164-be39-42b2-a000-579985f8dd02.png',
    slug: 'game-day'
  },
  {
    id: 'halloween',
    title: 'Halloween',
    imageSrc: '/lovable-uploads/af22c164-be39-42b2-a000-579985f8dd02.png',
    slug: 'halloween'
  },
  {
    id: 'snacks',
    title: 'Snacks',
    imageSrc: '/lovable-uploads/af22c164-be39-42b2-a000-579985f8dd02.png',
    slug: 'snacks'
  },
  {
    id: 'ice-cream',
    title: 'Ice Cream',
    imageSrc: '/lovable-uploads/af22c164-be39-42b2-a000-579985f8dd02.png',
    slug: 'ice-cream'
  },
  {
    id: 'drinks',
    title: 'Drinks',
    imageSrc: '/lovable-uploads/af22c164-be39-42b2-a000-579985f8dd02.png',
    slug: 'drinks'
  }
];

const SnackCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/explore-snacks/${slug}`);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm animate-slide-up">
      <h2 className="text-xl font-semibold mb-4">Snack Categories</h2>
      <p className="text-sm text-dishco-text-light mb-4">
        Explore snacks by category to find exactly what you're craving.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {categories.slice(0, 3).map((category) => (
          <Card 
            key={category.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCategoryClick(category.slug)}
          >
            <div 
              className="h-32 bg-cover bg-center relative" 
              style={{backgroundImage: `url(${category.imageSrc})`}}
            >
              <div className="absolute top-0 left-0 bg-white bg-opacity-75 px-3 py-1 m-2 rounded-lg">
                <h3 className="font-bold text-lg">{category.title}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {categories.slice(3).map((category) => (
          <Card 
            key={category.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCategoryClick(category.slug)}
          >
            <div 
              className="h-24 bg-cover bg-center relative"
              style={{backgroundImage: `url(${category.imageSrc})`}}
            >
              <div className="absolute top-0 left-0 bg-white bg-opacity-75 px-2 py-1 m-2 rounded-lg">
                <h3 className="font-bold">{category.title}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SnackCategoriesSection;
