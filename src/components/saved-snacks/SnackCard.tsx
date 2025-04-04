
import React from 'react';

interface SnackCardProps {
  id: string;
  name: string;
  imageSrc: string;
  calories: number;
  onRemove: (id: string) => void;
}

const SnackCard = ({ id, name, imageSrc, calories, onRemove }: SnackCardProps) => {
  return (
    <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-40">
        <img 
          src={imageSrc} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md"
          onClick={() => onRemove(id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 5L5 19M5 5l14 14"/>
          </svg>
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-semibold truncate">{name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">{calories} cal</span>
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Snack</span>
        </div>
      </div>
    </div>
  );
};

export default SnackCard;
