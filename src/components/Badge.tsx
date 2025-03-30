
import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'homemade' | 'takeout' | 'store-bought' | 'default';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, variant = 'default', className = '' }) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
  
  const variantClasses = {
    'homemade': "bg-green-100 text-green-800",
    'takeout': "bg-orange-100 text-orange-800",
    'store-bought': "bg-blue-100 text-blue-800",
    'default': "bg-gray-100 text-gray-800"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
