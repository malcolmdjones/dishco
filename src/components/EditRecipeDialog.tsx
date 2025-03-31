
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EditRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  onSuccess: () => void;
}

const EditRecipeDialog: React.FC<EditRecipeDialogProps> = ({ 
  isOpen, 
  onClose, 
  recipeId,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    meal_type: '',
    cuisine_type: 'other',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servings: 1,
    prep_time: 0,
    cook_time: 0,
    is_high_protein: false,
    price_range: '$',
    requires_blender: false,
    requires_cooking: true
  });

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchRecipeDetails();
    }
  }, [isOpen, recipeId]);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRecipe({
          name: data.name || '',
          description: data.description || '',
          meal_type: data.meal_type || '',
          cuisine_type: data.cuisine_type || 'other',
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fat || 0,
          servings: data.servings || 1,
          prep_time: data.prep_time || 0,
          cook_time: data.cook_time || 0,
          is_high_protein: data.is_high_protein || false,
          price_range: data.price_range || '$',
          requires_blender: data.requires_blender || false,
          requires_cooking: data.requires_cooking || true
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching recipe",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number') {
      setRecipe({ ...recipe, [name]: value ? parseInt(value) : 0 });
    } else {
      setRecipe({ ...recipe, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setRecipe({ ...recipe, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setRecipe({ ...recipe, [name]: checked });
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('recipes')
        .update({
          name: recipe.name,
          description: recipe.description,
          meal_type: recipe.meal_type,
          cuisine_type: recipe.cuisine_type,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          servings: recipe.servings,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          is_high_protein: recipe.is_high_protein,
          price_range: recipe.price_range,
          requires_blender: recipe.requires_blender,
          requires_cooking: recipe.requires_cooking,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Recipe updated",
        description: "Your recipe has been updated successfully.",
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating recipe",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              id="name"
              name="name"
              value={recipe.name}
              onChange={handleChange}
              placeholder="Enter recipe name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={recipe.description}
              onChange={handleChange}
              placeholder="Enter a brief description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meal_type">Meal Type</Label>
              <Select
                value={recipe.meal_type}
                onValueChange={(value) => handleSelectChange('meal_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Select
                value={recipe.cuisine_type}
                onValueChange={(value) => handleSelectChange('cuisine_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                value={recipe.calories}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                value={recipe.servings}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                name="protein"
                type="number"
                value={recipe.protein}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                name="carbs"
                type="number"
                value={recipe.carbs}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                name="fat"
                type="number"
                value={recipe.fat}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prep_time">Prep Time (min)</Label>
              <Input
                id="prep_time"
                name="prep_time"
                type="number"
                value={recipe.prep_time}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cook_time">Cook Time (min)</Label>
              <Input
                id="cook_time"
                name="cook_time"
                type="number"
                value={recipe.cook_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price_range">Price Range</Label>
              <Select
                value={recipe.price_range}
                onValueChange={(value) => handleSelectChange('price_range', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (Budget)</SelectItem>
                  <SelectItem value="$$">$$ (Moderate)</SelectItem>
                  <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_high_protein"
                checked={recipe.is_high_protein}
                onCheckedChange={(checked) => handleSwitchChange('is_high_protein', checked)}
              />
              <Label htmlFor="is_high_protein">High Protein</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="requires_blender"
                checked={recipe.requires_blender}
                onCheckedChange={(checked) => handleSwitchChange('requires_blender', checked)}
              />
              <Label htmlFor="requires_blender">Requires Blender</Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="requires_cooking"
              checked={recipe.requires_cooking}
              onCheckedChange={(checked) => handleSwitchChange('requires_cooking', checked)}
            />
            <Label htmlFor="requires_cooking">Requires Cooking</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeDialog;
