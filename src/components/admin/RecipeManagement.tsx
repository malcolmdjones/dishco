
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Eye, Search, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { DbRecipe } from '@/utils/recipeDbUtils';

const RecipeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<DbRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<DbRecipe | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the returned data to DbRecipe[] to match our interface
      setRecipes((data || []) as unknown as DbRecipe[]);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (recipe: DbRecipe) => {
    try {
      if (recipe.id === undefined || recipe.is_public === undefined) {
        throw new Error("Recipe missing required properties");
      }
      
      const { error } = await supabase
        .from('recipes')
        .update({ is_public: !recipe.is_public })
        .eq('id', recipe.id);

      if (error) throw error;

      // Update the local state
      setRecipes(recipes.map(r => 
        r.id === recipe.id ? { ...r, is_public: !recipe.is_public } : r
      ));

      toast({
        title: "Success",
        description: `Recipe is now ${!recipe.is_public ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating recipe visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe visibility",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteRecipe = (recipe: DbRecipe) => {
    setRecipeToDelete(recipe);
    setIsDeleting(true);
  };

  const handleDeleteRecipe = async () => {
    if (!recipeToDelete || !recipeToDelete.id) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeToDelete.id);

      if (error) throw error;

      setRecipes(recipes.filter(r => r.id !== recipeToDelete.id));
      
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setRecipeToDelete(null);
    }
  };

  const filteredRecipes = recipes.filter(recipe => 
    (recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (recipe.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search recipes..."
            className="pl-9 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading recipes...</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32">
                    No recipes found. {searchTerm ? 'Try a different search term.' : ''}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">{recipe.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {recipe.type || 'Meal'}
                      </Badge>
                    </TableCell>
                    <TableCell>{recipe.nutrition_calories || 'N/A'}</TableCell>
                    <TableCell>
                      {recipe.is_public ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Public</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(`/admin/recipe/${recipe.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/admin/edit-recipe/${recipe.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleTogglePublic(recipe)}
                        >
                          {recipe.is_public ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDeleteRecipe(recipe)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{recipeToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRecipe}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeManagement;
