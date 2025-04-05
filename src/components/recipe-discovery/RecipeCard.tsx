
import React from 'react';
import { motion } from 'framer-motion';
import { Recipe } from '@/data/mockData';
import { Star } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <motion.div 
      className="w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative h-[400px]">
        <img 
          src={recipe.imageSrc || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{recipe.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm">
                  {recipe.type}
                </span>
                {recipe.requiresCooking && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm">
                    Requires cooking
                  </span>
                )}
              </div>
              <p className="text-white text-sm line-clamp-2">{recipe.description}</p>
            </div>
            <div className="flex flex-col items-center justify-center bg-yellow-400 w-14 h-14 rounded-full">
              <div className="flex items-center">
                <Star size={14} className="text-white" fill="white" />
                <span className="text-white font-bold ml-1">4.7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Nutrition</h3>
          </div>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {recipe.macros.calories} kcal
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <span className="text-xs text-blue-500 font-medium">Protein</span>
            <p className="text-lg font-bold text-blue-700">{recipe.macros.protein}g</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <span className="text-xs text-yellow-500 font-medium">Carbs</span>
            <p className="text-lg font-bold text-yellow-700">{recipe.macros.carbs}g</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <span className="text-xs text-purple-500 font-medium">Fat</span>
            <p className="text-lg font-bold text-purple-700">{recipe.macros.fat}g</p>
          </div>
        </div>
        
        {/* Swipe instructions */}
        <div className="mt-6 flex justify-center">
          <div className="text-center px-4 py-2 bg-gray-50 rounded-full">
            <p className="text-sm text-gray-500">
              <span className="mr-2">👈 Swipe left to pass</span> | 
              <span className="ml-2">Swipe right to like 👉</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
