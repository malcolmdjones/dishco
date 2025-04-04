
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { recipes } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const SavedSnacksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter recipes that are snacks
  const savedSnacks = recipes
    .filter(recipe => recipe.type === 'snack')
    .slice(0, 8); // Just to show some sample data
  
  const filteredSnacks = savedSnacks.filter(snack => 
    snack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveFavorite = (id: string) => {
    toast({
      title: "Snack removed",
      description: "The snack has been removed from your favorites.",
    });
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/more')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Saved Snacks</h1>
          <p className="text-dishco-text-light">Your favorite snacks collection</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search saved snacks..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-4 focus:border-dishco-primary focus:outline-none focus:ring-2 focus:ring-dishco-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Snacks Grid */}
      {filteredSnacks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredSnacks.map((snack) => (
            <div key={snack.id} className="relative bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-40">
                <img 
                  src={snack.imageSrc} 
                  alt={snack.name} 
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md"
                  onClick={() => handleRemoveFavorite(snack.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 5L5 19M5 5l14 14"/>
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold truncate">{snack.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">{snack.macros.calories} cal</span>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Snack</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M3 11V3h8M21 13v8h-8M11 3h8v8M13 21H3v-8"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No saved snacks found</h3>
          <p className="text-gray-500 mt-1">Browse the snack collection to add some favorites.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/explore-snacks')}
          >
            Explore Snacks
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedSnacksPage;
