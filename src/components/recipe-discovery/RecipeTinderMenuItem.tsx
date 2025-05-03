
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeTinderMenuItemProps {
  className?: string;
}

const RecipeTinderMenuItem: React.FC<RecipeTinderMenuItemProps> = ({ className }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className || ''}`}
      onClick={() => navigate('/fun-categories')}
    >
      <div className="flex items-center">
        <div className="bg-pink-100 p-3 rounded-full mr-3">
          <Heart className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <h3 className="font-medium">Fun Categories</h3>
          <p className="text-sm text-gray-500">Discover recipes by category</p>
        </div>
      </div>
      <Button 
        className="w-full mt-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/fun-categories');
        }}
      >
        Explore Categories
      </Button>
    </div>
  );
};

export default RecipeTinderMenuItem;
