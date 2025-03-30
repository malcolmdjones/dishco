
import React, { useState } from 'react';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RecipeScraperFormProps {
  onRecipeAdded: (recipe: any) => void;
}

const RecipeScraperForm: React.FC<RecipeScraperFormProps> = ({ onRecipeAdded }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedRecipe, setScrapedRecipe] = useState<any>(null);
  const [editedRecipe, setEditedRecipe] = useState<any>(null);
  
  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('recipe-scraper', {
        body: JSON.stringify({ url }),
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.success || !data?.data) {
        throw new Error('Failed to scrape recipe data');
      }
      
      console.log("Scraped data:", data.data);
      
      const scrapedData = data.data;
      setScrapedRecipe(scrapedData);
      setEditedRecipe({
        name: scrapedData.name || '',
        description: scrapedData.description || '',
        ingredients: scrapedData.ingredients || [],
        instructions: scrapedData.instructions || [],
        prepTime: scrapedData.prepTime || '',
        cookTime: scrapedData.cookTime || '',
        servings: scrapedData.servings || '',
        calories: scrapedData.calories || '',
        protein: scrapedData.protein || '',
        carbs: scrapedData.carbs || '',
        fat: scrapedData.fat || '',
        mealType: scrapedData.mealType || '',
        equipment: scrapedData.equipment || [],
        imageUrl: scrapedData.localImageUrl || scrapedData.imageUrl || '',
        tags: scrapedData.tags || []
      });
      
      toast({
        title: 'Recipe scraped',
        description: 'Review and edit the details before saving',
      });
    } catch (error: any) {
      toast({
        title: 'Error scraping recipe',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };
  
  const handleAddArrayItem = (field: string, defaultValue: string = '') => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };
  
  const handleRemoveArrayItem = (field: string, index: number) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };
  
  const handleSaveRecipe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save recipes",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the edge function to save the recipe
      const { data, error } = await supabase.functions.invoke('recipe-scraper', {
        body: JSON.stringify({
          url,
          userId: user.id,
          recipe: editedRecipe
        }),
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.success || !data?.data) {
        throw new Error('Failed to save recipe data');
      }
      
      // Call the callback with the saved recipe
      onRecipeAdded(data.data);
      
      // Reset form
      setUrl('');
      setScrapedRecipe(null);
      setEditedRecipe(null);
      
      toast({
        title: 'Recipe saved',
        description: 'Recipe has been added to your collection',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving recipe',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-url">Recipe URL</Label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="recipe-url"
                    placeholder="https://example.com/recipe/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleScrape} disabled={loading}>
                  {loading && !scrapedRecipe ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scraping...
                    </>
                  ) : (
                    'Scrape Recipe'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter the URL of a recipe page to automatically extract the details
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {scrapedRecipe && editedRecipe && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Review Recipe Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipe-name">Recipe Name</Label>
                <Input
                  id="recipe-name"
                  value={editedRecipe.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipe-description">Description</Label>
                <Textarea
                  id="recipe-description"
                  value={editedRecipe.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-prep-time">Prep Time (mins)</Label>
                  <Input
                    id="recipe-prep-time"
                    type="number"
                    value={editedRecipe.prepTime}
                    onChange={(e) => handleInputChange('prepTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipe-cook-time">Cook Time (mins)</Label>
                  <Input
                    id="recipe-cook-time"
                    type="number"
                    value={editedRecipe.cookTime}
                    onChange={(e) => handleInputChange('cookTime', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-servings">Servings</Label>
                  <Input
                    id="recipe-servings"
                    type="number"
                    value={editedRecipe.servings}
                    onChange={(e) => handleInputChange('servings', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipe-meal-type">Meal Type</Label>
                  <Input
                    id="recipe-meal-type"
                    value={editedRecipe.mealType}
                    onChange={(e) => handleInputChange('mealType', e.target.value)}
                    placeholder="breakfast, lunch, dinner..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipe-image">Image URL</Label>
                <Input
                  id="recipe-image"
                  value={editedRecipe.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
                {editedRecipe.imageUrl && (
                  <div className="mt-2 h-40 overflow-hidden rounded-md">
                    <img 
                      src={editedRecipe.imageUrl} 
                      alt="Recipe preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-calories">Calories</Label>
                  <Input
                    id="recipe-calories"
                    type="number"
                    value={editedRecipe.calories}
                    onChange={(e) => handleInputChange('calories', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipe-protein">Protein (g)</Label>
                  <Input
                    id="recipe-protein"
                    type="number"
                    value={editedRecipe.protein}
                    onChange={(e) => handleInputChange('protein', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-carbs">Carbs (g)</Label>
                  <Input
                    id="recipe-carbs"
                    type="number"
                    value={editedRecipe.carbs}
                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipe-fat">Fat (g)</Label>
                  <Input
                    id="recipe-fat"
                    type="number"
                    value={editedRecipe.fat}
                    onChange={(e) => handleInputChange('fat', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tags</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAddArrayItem('tags')}
                  >
                    + Add Tag
                  </Button>
                </div>
                {editedRecipe.tags.map((tag: string, index: number) => (
                  <div key={`tag-${index}`} className="flex space-x-2">
                    <Input
                      value={tag}
                      onChange={(e) => handleArrayInputChange('tags', index, e.target.value)}
                      placeholder={`Tag ${index + 1}`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveArrayItem('tags', index)}
                      className="text-red-500"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Equipment</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAddArrayItem('equipment')}
                  >
                    + Add Equipment
                  </Button>
                </div>
                {editedRecipe.equipment.map((item: string, index: number) => (
                  <div key={`equipment-${index}`} className="flex space-x-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayInputChange('equipment', index, e.target.value)}
                      placeholder={`Equipment ${index + 1}`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveArrayItem('equipment', index)}
                      className="text-red-500"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Ingredients</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleAddArrayItem('ingredients')}
              >
                + Add Ingredient
              </Button>
            </div>
            {editedRecipe.ingredients.map((ingredient: string, index: number) => (
              <div key={`ingredient-${index}`} className="flex space-x-2">
                <Input
                  value={ingredient}
                  onChange={(e) => handleArrayInputChange('ingredients', index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveArrayItem('ingredients', index)}
                  className="text-red-500"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Instructions</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleAddArrayItem('instructions')}
              >
                + Add Step
              </Button>
            </div>
            {editedRecipe.instructions.map((instruction: string, index: number) => (
              <div key={`instruction-${index}`} className="flex space-x-2">
                <Textarea
                  value={instruction}
                  onChange={(e) => handleArrayInputChange('instructions', index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveArrayItem('instructions', index)}
                  className="text-red-500"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setScrapedRecipe(null);
                setEditedRecipe(null);
                setUrl('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRecipe}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Recipe'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeScraperForm;
