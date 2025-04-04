
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/hooks/useRecipes';
import SnackCard from '@/components/saved-snacks/SnackCard';
import EmptySnacksState from '@/components/saved-snacks/EmptySnacksState';

const SavedSnacksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { recipes, loading, savedRecipeIds, toggleSaveRecipe } = useRecipes();
  
  // Filter recipes that are snacks and saved
  const savedSnacks = recipes
    .filter(recipe => recipe.type === 'snack' && savedRecipeIds.includes(recipe.id));
  
  const filteredSnacks = savedSnacks.filter(snack => 
    snack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveFavorite = async (id: string) => {
    await toggleSaveRecipe(id);
    toast({
      title: "Snack removed",
      description: "The snack has been removed from your favorites.",
    });
  };

  // Use consistent image
  const imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

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

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading saved snacks...</p>
        </div>
      ) : (
        <>
          {/* Snacks Grid */}
          {filteredSnacks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredSnacks.map((snack) => (
                <SnackCard 
                  key={snack.id}
                  id={snack.id}
                  name={snack.name}
                  imageSrc={snack.imageSrc || imageUrl}
                  calories={snack.macros.calories}
                  onRemove={handleRemoveFavorite}
                />
              ))}
            </div>
          ) : (
            <EmptySnacksState />
          )}
        </>
      )}
    </div>
  );
};

export default SavedSnacksPage;
