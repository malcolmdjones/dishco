
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CategoryCardProps {
  title: string;
  imageSrc: string;
  link: string;
  size?: 'large' | 'medium' | 'small';
}

const CategoryCard = ({ title, imageSrc, link, size = 'medium' }: CategoryCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(link);
  };
  
  const sizeClasses = {
    large: 'w-[300px] sm:w-[350px]',
    medium: 'w-[220px] sm:w-[250px]',
    small: 'w-[160px] sm:w-[180px]'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] bg-white`}
      onClick={handleClick}
    >
      <div className="relative">
        <AspectRatio ratio={4/3}>
          <img 
            src={imageSrc || '/placeholder.svg'} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-3">
          <h3 className="font-medium text-white text-lg truncate">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
