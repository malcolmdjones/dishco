
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';

const FeaturedCategories: React.FC = () => {
  const navigate = useNavigate();
  
  const categories = [
    { name: 'Meal Prep', icon: '🍱', color: 'bg-purple-100', textColor: 'text-purple-800' },
    { name: 'Breakfast', icon: '🍳', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { name: 'Smoothies', icon: '🥤', color: 'bg-pink-100', textColor: 'text-pink-800' },
    { name: 'Protein', icon: '💪', color: 'bg-blue-100', textColor: 'text-blue-800' },
    { name: 'Snacks', icon: '🍿', color: 'bg-green-100', textColor: 'text-green-800' },
    { name: 'Desserts', icon: '🍰', color: 'bg-red-100', textColor: 'text-red-800' },
    { name: 'Budget', icon: '💰', color: 'bg-amber-100', textColor: 'text-amber-800' },
    { name: 'Quick', icon: '⏱️', color: 'bg-cyan-100', textColor: 'text-cyan-800' },
  ];
  
  return (
    <div className="px-4 mb-4">
      <div className="flex overflow-x-auto py-3 gap-4 no-scrollbar">
        {categories.map((category, index) => (
          <CategoryIcon 
            key={index}
            name={category.name}
            icon={category.icon}
            color={category.color}
            textColor={category.textColor}
            onClick={() => navigate('/explore-recipes')}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategories;
