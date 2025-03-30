
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RecipeData = {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType?: string;
  tags?: string[];
  equipment?: string[];
  imageUrl?: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { url, userId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Attempting to scrape recipe from: ${url}`);
    
    // Fetch the page content
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch page: ${response.statusText}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract recipe data - this is a simplified version
    // In practice, you'd need more sophisticated selectors based on the website structure
    let recipeData: RecipeData = {
      name: $('h1').first().text().trim() || "Untitled Recipe",
      ingredients: [],
      instructions: []
    };

    // Look for common recipe schema elements
    // Try to find structured JSON-LD data first (most recipe sites use this)
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    if (jsonLdScript) {
      try {
        const jsonData = JSON.parse(jsonLdScript);
        // Handle array of schemas
        const recipeSchema = Array.isArray(jsonData) 
          ? jsonData.find(item => item['@type'] === 'Recipe') 
          : (jsonData['@type'] === 'Recipe' ? jsonData : jsonData['@graph']?.find(item => item['@type'] === 'Recipe'));
        
        if (recipeSchema) {
          recipeData.name = recipeSchema.name || recipeData.name;
          recipeData.description = recipeSchema.description;
          recipeData.imageUrl = recipeSchema.image?.url || recipeSchema.image;
          
          // Get ingredients
          if (recipeSchema.recipeIngredient) {
            recipeData.ingredients = Array.isArray(recipeSchema.recipeIngredient) 
              ? recipeSchema.recipeIngredient.map((ing: string) => ing.trim())
              : [recipeSchema.recipeIngredient];
          }
          
          // Get instructions
          if (recipeSchema.recipeInstructions) {
            if (Array.isArray(recipeSchema.recipeInstructions)) {
              recipeData.instructions = recipeSchema.recipeInstructions.map((inst: any) => 
                typeof inst === 'string' ? inst : (inst.text || "")
              );
            } else if (typeof recipeSchema.recipeInstructions === 'string') {
              recipeData.instructions = [recipeSchema.recipeInstructions];
            }
          }
          
          // Get nutritional info
          if (recipeSchema.nutrition) {
            recipeData.calories = parseInt(recipeSchema.nutrition.calories) || undefined;
            recipeData.protein = parseInt(recipeSchema.nutrition.proteinContent) || undefined;
            recipeData.carbs = parseInt(recipeSchema.nutrition.carbohydrateContent) || undefined;
            recipeData.fat = parseInt(recipeSchema.nutrition.fatContent) || undefined;
          }
          
          // Get cooking info
          recipeData.prepTime = recipeSchema.prepTime ? parseDuration(recipeSchema.prepTime) : undefined;
          recipeData.cookTime = recipeSchema.cookTime ? parseDuration(recipeSchema.cookTime) : undefined;
          recipeData.servings = recipeSchema.recipeYield ? parseServings(recipeSchema.recipeYield) : undefined;
          
          // Try to identify meal type and tags
          if (recipeSchema.recipeCategory) {
            const categories = Array.isArray(recipeSchema.recipeCategory) 
              ? recipeSchema.recipeCategory 
              : [recipeSchema.recipeCategory];
              
            recipeData.tags = categories;
            
            // Try to identify meal type from categories
            const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'];
            for (const category of categories) {
              const lowercaseCategory = category.toLowerCase();
              if (mealTypes.includes(lowercaseCategory)) {
                recipeData.mealType = lowercaseCategory;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.error("Error parsing JSON-LD:", e);
      }
    }
    
    // If JSON-LD didn't provide everything, fall back to HTML parsing
    if (recipeData.ingredients.length === 0) {
      // Try common ingredient selectors
      const ingredientSelectors = [
        '.recipe-ingredients li', '.ingredients li', '.ingredient-list li',
        '[itemprop="recipeIngredient"]', '.wprm-recipe-ingredient'
      ];
      
      for (const selector of ingredientSelectors) {
        const ingredients = $(selector).map((_, el) => $(el).text().trim()).get();
        if (ingredients.length > 0) {
          recipeData.ingredients = ingredients;
          break;
        }
      }
    }
    
    if (recipeData.instructions.length === 0) {
      // Try common instruction selectors
      const instructionSelectors = [
        '.recipe-instructions li', '.instructions li', '.preparation-steps li',
        '[itemprop="recipeInstructions"]', '.wprm-recipe-instruction'
      ];
      
      for (const selector of instructionSelectors) {
        const instructions = $(selector).map((_, el) => $(el).text().trim()).get();
        if (instructions.length > 0) {
          recipeData.instructions = instructions;
          break;
        }
      }
    }
    
    // Estimate equipment needed based on instructions
    const commonEquipment = [
      'oven', 'stove', 'stovetop', 'grill', 'microwave', 'blender', 
      'food processor', 'mixer', 'slow cooker', 'pressure cooker', 
      'air fryer', 'pan', 'pot', 'skillet', 'baking sheet'
    ];
    
    recipeData.equipment = [];
    for (const instruction of recipeData.instructions) {
      for (const item of commonEquipment) {
        if (instruction.toLowerCase().includes(item) && !recipeData.equipment.includes(item)) {
          recipeData.equipment.push(item);
        }
      }
    }
    
    if (!recipeData.imageUrl) {
      // Try to find main recipe image
      const imageSelectors = [
        '.recipe-image img', '.hero-photo img', '[itemprop="image"]', 
        '.wprm-recipe-image img', '.post-thumbnail img'
      ];
      
      for (const selector of imageSelectors) {
        const imgSrc = $(selector).first().attr('src');
        if (imgSrc) {
          recipeData.imageUrl = imgSrc;
          break;
        }
      }
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Only save to database if userId is provided
    if (userId) {
      const { data, error } = await storeRecipeInDatabase(supabase, recipeData, userId);
      
      if (error) {
        return new Response(
          JSON.stringify({ error: `Failed to store recipe: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Otherwise just return the scraped data without saving
    return new Response(
      JSON.stringify({ success: true, data: recipeData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Scraping error:", error);
    return new Response(
      JSON.stringify({ error: `Failed to scrape recipe: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to parse ISO duration string to minutes
function parseDuration(duration: string): number | undefined {
  try {
    // Handle ISO 8601 duration format like PT1H30M
    if (duration.startsWith('P')) {
      const hours = duration.match(/(\d+)H/)?.[1] || '0';
      const minutes = duration.match(/(\d+)M/)?.[1] || '0';
      return parseInt(hours) * 60 + parseInt(minutes);
    }
    // Handle plain number of minutes
    return parseInt(duration);
  } catch (e) {
    return undefined;
  }
}

// Helper function to parse servings
function parseServings(yield_: string | number | any[]): number | undefined {
  if (typeof yield_ === 'number') return yield_;
  if (Array.isArray(yield_)) yield_ = yield_[0];
  if (typeof yield_ === 'string') {
    // Try to extract the first number from the string
    const match = yield_.match(/\d+/);
    if (match) return parseInt(match[0]);
  }
  return undefined;
}

// Function to store recipe data in database
async function storeRecipeInDatabase(supabase: any, recipeData: RecipeData, userId: string) {
  try {
    // First, insert the main recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        name: recipeData.name,
        description: recipeData.description,
        image_url: recipeData.imageUrl,
        prep_time: recipeData.prepTime,
        cook_time: recipeData.cookTime,
        servings: recipeData.servings,
        calories: recipeData.calories,
        protein: recipeData.protein,
        carbs: recipeData.carbs,
        fat: recipeData.fat,
        meal_type: recipeData.mealType,
        user_id: userId,
        is_public: true,
        requires_blender: recipeData.equipment?.includes('blender') || false,
        requires_cooking: !!(recipeData.cookTime && recipeData.cookTime > 0)
      })
      .select()
      .single();
    
    if (recipeError) throw recipeError;
    
    // Insert ingredients
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredients = recipeData.ingredients.map(ingredient => {
        // Try to extract quantity and unit from ingredient text
        const parts = ingredient.trim().match(/^([\d\/\.\,\s]+)?\s*([a-zA-Z]+)?\s+(.+)$/);
        
        if (parts) {
          return {
            recipe_id: recipe.id,
            name: parts[3].trim(),
            quantity: parts[1]?.trim() || null,
            unit: parts[2]?.trim() || null
          };
        }
        
        return {
          recipe_id: recipe.id,
          name: ingredient.trim(),
          quantity: null,
          unit: null
        };
      });
      
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);
      
      if (ingredientsError) console.error("Error inserting ingredients:", ingredientsError);
    }
    
    // Insert instructions
    if (recipeData.instructions && recipeData.instructions.length > 0) {
      const instructions = recipeData.instructions.map((instruction, index) => ({
        recipe_id: recipe.id,
        step_number: index + 1,
        instruction: instruction.trim()
      }));
      
      const { error: instructionsError } = await supabase
        .from('recipe_instructions')
        .insert(instructions);
      
      if (instructionsError) console.error("Error inserting instructions:", instructionsError);
    }
    
    // Insert equipment
    if (recipeData.equipment && recipeData.equipment.length > 0) {
      const equipment = recipeData.equipment.map(item => ({
        recipe_id: recipe.id,
        name: item.trim()
      }));
      
      const { error: equipmentError } = await supabase
        .from('recipe_equipment')
        .insert(equipment);
      
      if (equipmentError) console.error("Error inserting equipment:", equipmentError);
    }
    
    // Insert tags
    if (recipeData.tags && recipeData.tags.length > 0) {
      for (const tagName of recipeData.tags) {
        // First get or create the tag
        let tagId;
        const { data: existingTag } = await supabase
          .from('recipe_tags')
          .select('id')
          .eq('name', tagName.trim())
          .maybeSingle();
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from('recipe_tags')
            .insert({ name: tagName.trim() })
            .select()
            .single();
          
          if (tagError) {
            console.error("Error creating tag:", tagError);
            continue;
          }
          
          tagId = newTag.id;
        }
        
        // Create relation between recipe and tag
        const { error: relationError } = await supabase
          .from('recipe_tag_relations')
          .insert({
            recipe_id: recipe.id,
            tag_id: tagId
          });
        
        if (relationError) console.error("Error creating tag relation:", relationError);
      }
    }
    
    return { data: recipe, error: null };
    
  } catch (error) {
    return { data: null, error };
  }
}
