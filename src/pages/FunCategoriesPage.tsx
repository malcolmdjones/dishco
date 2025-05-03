
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedCategories from '@/components/fun-categories/FeaturedCategories';
import CategoryShowcase from '@/components/fun-categories/CategoryShowcase';
import SplitCategories from '@/components/fun-categories/SplitCategories';
import PageHeader from '@/components/fun-categories/PageHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categoryData } from '@/data/categoryData';

const FunCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="h-full flex flex-col">
      <PageHeader />
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="py-2">
          {/* Featured Categories */}
          <FeaturedCategories />
          
          {/* Full Width Category */}
          <CategoryShowcase 
            title={categoryData.mealPrep.title} 
            description={categoryData.mealPrep.description}
            image={categoryData.mealPrep.image}
            viewAll={() => navigate('/explore-recipes')}
          />
          
          {/* Split Categories */}
          <SplitCategories 
            leftCategory={{
              title: categoryData.budgetBites.title,
              description: categoryData.budgetBites.description,
              image: categoryData.budgetBites.image,
              viewAll: () => navigate('/explore-recipes'),
            }}
            rightCategory={{
              title: categoryData.smoothieStation.title,
              description: categoryData.smoothieStation.description,
              image: categoryData.smoothieStation.image,
              viewAll: () => navigate('/explore-recipes'),
            }}
          />
          
          {/* Full Width Category */}
          <CategoryShowcase 
            title={categoryData.breakfastClub.title} 
            description={categoryData.breakfastClub.description}
            image={categoryData.breakfastClub.image}
            viewAll={() => navigate('/explore-recipes')}
          />
          
          {/* Split Categories */}
          <SplitCategories 
            leftCategory={{
              title: categoryData.proteinBakery.title,
              description: categoryData.proteinBakery.description,
              image: categoryData.proteinBakery.image,
              viewAll: () => navigate('/explore-recipes'),
            }}
            rightCategory={{
              title: categoryData.brunchVibes.title,
              description: categoryData.brunchVibes.description,
              image: categoryData.brunchVibes.image,
              viewAll: () => navigate('/explore-recipes'),
            }}
          />
          
          {/* Full Width Category */}
          <CategoryShowcase 
            title={categoryData.snackSavvy.title} 
            description={categoryData.snackSavvy.description}
            image={categoryData.snackSavvy.image}
            viewAll: () => navigate('/explore-snacks'),
          />
          
          {/* Add some padding at the bottom for better scrolling experience */}
          <div className="h-16"></div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FunCategoriesPage;
