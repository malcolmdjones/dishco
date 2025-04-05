
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Recipe } from '@/data/mockData';
import { Clock, Flame } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = forwardRef<HTMLDivElement, RecipeCardProps>(({ recipe }, ref) => {
  return (
    <motion.div 
      ref={ref}
      className="w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative h-[600px]">
        <img 
          src={recipe.imageSrc || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Full gradient overlay - lighter to see more of the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10" />
        
        {/* Recipe info overlaid on image */}
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm">
              {recipe.type}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm flex items-center gap-1">
              <Clock size={14} className="text-white" />
              {recipe.cookTime + recipe.prepTime} min
            </span>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">{recipe.name}</h2>
            <p className="text-white/90 text-sm mb-4 line-clamp-2">{recipe.description}</p>
            
            {/* Macros as overlapping pills */}
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                Protein: {recipe.macros.protein}g
              </span>
              <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                Carbs: {recipe.macros.carbs}g
              </span>
              <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                Fat: {recipe.macros.fat}g
              </span>
              <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-1">
                <Flame size={14} className="text-white" />
                {recipe.macros.calories} kcal
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

RecipeCard.displayName = "RecipeCard";

export default RecipeCard;
