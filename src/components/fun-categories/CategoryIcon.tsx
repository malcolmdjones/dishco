
import React from 'react';

interface CategoryIconProps {
  name: string;
  icon: string;
  color: string;
  textColor: string;
  onClick: () => void;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ name, icon, color, textColor, onClick }) => {
  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={onClick}>
      <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-2xl`}>
        <span>{icon}</span>
      </div>
      <p className={`${textColor} text-sm font-medium`}>{name}</p>
    </div>
  );
};

export default CategoryIcon;
