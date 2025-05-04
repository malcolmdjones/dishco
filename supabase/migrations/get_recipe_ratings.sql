
-- Create function to get recipe ratings
CREATE OR REPLACE FUNCTION public.get_recipe_ratings()
RETURNS TABLE (recipe_id uuid, avg_rating numeric, rating_count bigint) 
LANGUAGE sql
as $$
  SELECT 
    recipe_id,
    ROUND(AVG(rating)::numeric, 1) as avg_rating,
    COUNT(id) as rating_count
  FROM public.recipe_ratings
  GROUP BY recipe_id
$$;
