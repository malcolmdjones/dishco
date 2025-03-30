
// We'll update the existing recipe scraper to improve recipe classification and tagging
// This enhances filtering in the Explore Recipes page

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
  localImageUrl?: string;
  cuisineType?: string;
  priceRange?: string;
  dietaryNeeds?: string[];
  isHighProtein?: boolean;
};

// Define meal types that match the ExploreRecipesPage filters
const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

// Define cuisine types that match the ExploreRecipesPage filters
const validCuisineTypes = ['american', 'italian', 'mexican', 'indian', 'chinese', 'other'];

// Define dietary needs that match the ExploreRecipesPage filters
const validDietaryNeeds = ['keto', 'vegan', 'vegetarian', 'paleo', 'gluten-free', 'dairy-free'];

// Define equipment types that match the ExploreRecipesPage filters
const validEquipment = ['oven', 'stovetop', 'air fryer', 'blender', 'grill', 'slow cooker'];

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
    const jsonLdScripts = $('script[type="application/ld+json"]');
    let foundRecipeSchema = false;
    
    jsonLdScripts.each((i, script) => {
      if (foundRecipeSchema) return;
      
      try {
        const scriptContent = $(script).html();
        if (!scriptContent) return;
        
        const jsonData = JSON.parse(scriptContent);
        
        // Handle different structures of JSON-LD
        const recipeSchema = findRecipeSchema(jsonData);
        
        if (recipeSchema) {
          foundRecipeSchema = true;
          console.log("Found recipe schema in JSON-LD!");
          
          recipeData.name = recipeSchema.name || recipeData.name;
          recipeData.description = recipeSchema.description;
          
          // Get image - handle different formats
          if (recipeSchema.image) {
            if (typeof recipeSchema.image === 'string') {
              recipeData.imageUrl = recipeSchema.image;
            } else if (recipeSchema.image.url) {
              recipeData.imageUrl = recipeSchema.image.url;
            } else if (Array.isArray(recipeSchema.image) && recipeSchema.image.length > 0) {
              if (typeof recipeSchema.image[0] === 'string') {
                recipeData.imageUrl = recipeSchema.image[0];
              } else if (recipeSchema.image[0].url) {
                recipeData.imageUrl = recipeSchema.image[0].url;
              }
            }
          }
          
          // Get ingredients
          if (recipeSchema.recipeIngredient) {
            recipeData.ingredients = Array.isArray(recipeSchema.recipeIngredient) 
              ? recipeSchema.recipeIngredient.map((ing: string) => ing.trim())
              : [recipeSchema.recipeIngredient];
          }
          
          // Get instructions
          if (recipeSchema.recipeInstructions) {
            if (Array.isArray(recipeSchema.recipeInstructions)) {
              recipeData.instructions = recipeSchema.recipeInstructions.map((inst: any) => {
                if (typeof inst === 'string') {
                  return inst;
                } else if (inst.text) {
                  return inst.text;
                } else if (inst.itemListElement) {
                  // Some schemas nest instructions in itemListElement
                  return Array.isArray(inst.itemListElement) 
                    ? inst.itemListElement.map((item: any) => item.text || "").join("\n")
                    : "";
                } else {
                  return "";
                }
              }).filter((text: string) => text.trim() !== "");
            } else if (typeof recipeSchema.recipeInstructions === 'string') {
              // Split by periods or line breaks if it's a single string
              recipeData.instructions = recipeSchema.recipeInstructions
                .split(/(?<=\.)\s+|[\r\n]+/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);
            }
          }
          
          // Get nutritional info
          if (recipeSchema.nutrition) {
            recipeData.calories = parseNutritionValue(recipeSchema.nutrition.calories);
            recipeData.protein = parseNutritionValue(recipeSchema.nutrition.proteinContent);
            recipeData.carbs = parseNutritionValue(recipeSchema.nutrition.carbohydrateContent);
            recipeData.fat = parseNutritionValue(recipeSchema.nutrition.fatContent);
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
            for (const category of categories) {
              const lowercaseCategory = category.toLowerCase();
              if (validMealTypes.includes(lowercaseCategory)) {
                recipeData.mealType = lowercaseCategory;
                break;
              }
            }
          }

          // Try to identify cuisine type
          if (recipeSchema.recipeCuisine) {
            const cuisines = Array.isArray(recipeSchema.recipeCuisine)
              ? recipeSchema.recipeCuisine
              : [recipeSchema.recipeCuisine];
            
            for (const cuisine of cuisines) {
              const lowercaseCuisine = cuisine.toLowerCase();
              if (validCuisineTypes.includes(lowercaseCuisine)) {
                recipeData.cuisineType = lowercaseCuisine;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.error("Error parsing JSON-LD:", e);
      }
    });
    
    // If JSON-LD didn't provide everything, fall back to HTML parsing
    // First check if we need to extract ingredients
    if (recipeData.ingredients.length === 0) {
      console.log("Falling back to HTML parsing for ingredients");
      // Try common ingredient selectors
      const ingredientSelectors = [
        '.recipe-ingredients li', '.ingredients li', '.ingredient-list li',
        '[itemprop="recipeIngredient"]', '.wprm-recipe-ingredient',
        '.recipe__ingredient', '.recipe-ingredient', '.ingredient'
      ];
      
      for (const selector of ingredientSelectors) {
        const ingredients = $(selector).map((_, el) => $(el).text().trim()).get();
        if (ingredients.length > 0) {
          recipeData.ingredients = ingredients;
          break;
        }
      }
    }
    
    // Check if we need to extract instructions
    if (recipeData.instructions.length === 0) {
      console.log("Falling back to HTML parsing for instructions");
      // Try common instruction selectors
      const instructionSelectors = [
        '.recipe-instructions li', '.instructions li', '.preparation-steps li',
        '[itemprop="recipeInstructions"]', '.wprm-recipe-instruction',
        '.recipe__instruction', '.recipe-instruction', '.instruction',
        '.recipe-method-step', '.recipe-directions__list-item'
      ];
      
      for (const selector of instructionSelectors) {
        const instructions = $(selector).map((_, el) => $(el).text().trim()).get();
        if (instructions.length > 0) {
          recipeData.instructions = instructions.filter(text => text.length > 0);
          break;
        }
      }
      
      // If still no instructions, try finding a parent container and getting all list items
      if (recipeData.instructions.length === 0) {
        const instructionContainerSelectors = [
          '.recipe-instructions', '.instructions', '.preparation-steps',
          '.recipe-directions', '.recipe-method', '.directions'
        ];
        
        for (const selector of instructionContainerSelectors) {
          if ($(selector).length) {
            const container = $(selector).first();
            const instructions = container.find('li, p').map((_, el) => $(el).text().trim()).get();
            if (instructions.length > 0) {
              recipeData.instructions = instructions.filter(text => text.length > 0);
              break;
            }
          }
        }
      }
    }
    
    // Use AI to improve the instructions formatting and to analyze the recipe for classification
    // Get OpenAI API key from environment variable
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (openAIKey) {
      try {
        console.log("Using AI to improve recipe data");
        
        // Combine recipe data for AI analysis
        const recipeAnalysisText = `
Recipe Name: ${recipeData.name}
Description: ${recipeData.description || ''}
Ingredients:
${recipeData.ingredients.join('\n')}
Instructions:
${recipeData.instructions.join('\n')}
`;
        
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert recipe analyst that helps classify recipes and improve instruction formatting. 
                
Please analyze the recipe and:
1. Format the instructions into clear, step-by-step instructions.
2. Classify the recipe into these categories:
   - Meal Type: ${validMealTypes.join(', ')}
   - Cuisine Type: ${validCuisineTypes.join(', ')}
   - Equipment Needed: ${validEquipment.join(', ')}
   - Dietary Needs: ${validDietaryNeeds.join(', ')}
   - Price Range: $ (budget), $$ (moderate), or $$$ (expensive)
   - Is High Protein: true/false (>20g protein per serving)
   
Return your analysis as a JSON object with these fields:
- instructions: array of formatted step-by-step instructions
- mealType: string (one of the valid meal types)
- cuisineType: string (one of the valid cuisine types)
- equipment: array of equipment needed
- dietaryNeeds: array of dietary needs this recipe meets
- priceRange: string (one of $, $$, $$$)
- isHighProtein: boolean
- cookTimeCategory: "quick" (≤15 min), "medium" (16-30 min), or "long" (>30 min)

Correct any spelling or grammar issues in the instructions.`
              },
              {
                role: 'user',
                content: recipeAnalysisText
              }
            ],
            temperature: 0.3,
          })
        });
        
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          try {
            // Parse the AI analysis
            const content = aiData.choices[0].message.content;
            // Extract JSON from the content (handles cases where AI adds text around the JSON)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const aiAnalysis = JSON.parse(jsonMatch[0]);
              
              // Update recipe data with AI analysis
              if (aiAnalysis.instructions && Array.isArray(aiAnalysis.instructions) && aiAnalysis.instructions.length > 0) {
                recipeData.instructions = aiAnalysis.instructions;
              }
              
              if (aiAnalysis.mealType && validMealTypes.includes(aiAnalysis.mealType)) {
                recipeData.mealType = aiAnalysis.mealType;
              }
              
              if (aiAnalysis.cuisineType && validCuisineTypes.includes(aiAnalysis.cuisineType)) {
                recipeData.cuisineType = aiAnalysis.cuisineType;
              }
              
              if (aiAnalysis.equipment && Array.isArray(aiAnalysis.equipment)) {
                recipeData.equipment = aiAnalysis.equipment.filter(item => 
                  validEquipment.includes(item.toLowerCase().replace('-', ' '))
                );
              }
              
              if (aiAnalysis.dietaryNeeds && Array.isArray(aiAnalysis.dietaryNeeds)) {
                recipeData.dietaryNeeds = aiAnalysis.dietaryNeeds.filter(need => 
                  validDietaryNeeds.includes(need.toLowerCase())
                );
              }
              
              if (aiAnalysis.priceRange && ['$', '$$', '$$$'].includes(aiAnalysis.priceRange)) {
                recipeData.priceRange = aiAnalysis.priceRange;
              }
              
              if (typeof aiAnalysis.isHighProtein === 'boolean') {
                recipeData.isHighProtein = aiAnalysis.isHighProtein;
              }
              
              console.log("Successfully enhanced recipe with AI analysis");
            }
          } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
          }
        } else {
          console.error("Error from OpenAI API:", await aiResponse.text());
        }
      } catch (aiError) {
        console.error("Error using AI for recipe analysis:", aiError);
      }
    }
    
    // If we still don't have equipment, estimate it based on instructions
    if (!recipeData.equipment || recipeData.equipment.length === 0) {
      recipeData.equipment = [];
      for (const instruction of recipeData.instructions) {
        for (const item of validEquipment) {
          if (instruction.toLowerCase().includes(item) && !recipeData.equipment.includes(item)) {
            recipeData.equipment.push(item);
          }
        }
      }
    }
    
    // If we still don't have an image URL, try to find one in the HTML
    if (!recipeData.imageUrl) {
      console.log("Falling back to HTML parsing for image");
      // Try to find main recipe image
      const imageSelectors = [
        '.recipe-image img', '.hero-photo img', '[itemprop="image"]', 
        '.wprm-recipe-image img', '.post-thumbnail img',
        '.recipe__image img', '.recipe-card__image img',
        '.recipe-featured-image img', '.featured-image img'
      ];
      
      for (const selector of imageSelectors) {
        const imgSrc = $(selector).first().attr('src') || $(selector).first().attr('data-src');
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
    
    // Download and store the image if URL exists
    if (recipeData.imageUrl) {
      try {
        console.log(`Downloading image from: ${recipeData.imageUrl}`);
        
        // Generate a unique file name for the image
        const imageName = `recipe-images/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
        
        // Download the image
        const imageResponse = await fetch(recipeData.imageUrl);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          
          // Check if images bucket exists, if not create it
          const { data: buckets } = await supabase.storage.listBuckets();
          const imagesBucketExists = buckets?.some(bucket => bucket.name === 'recipe-images');
          
          if (!imagesBucketExists) {
            console.log("Creating recipe-images bucket");
            const { error: bucketError } = await supabase.storage.createBucket('recipe-images', {
              public: true
            });
            if (bucketError) {
              console.error("Error creating bucket:", bucketError);
            }
          }
          
          // Upload the image to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recipe-images')
            .upload(imageName, imageBlob, {
              contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
              upsert: true
            });
          
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
          } else {
            console.log("Image uploaded successfully:", uploadData);
            
            // Get the public URL of the uploaded image
            const { data: publicUrlData } = await supabase.storage
              .from('recipe-images')
              .getPublicUrl(imageName);
            
            if (publicUrlData) {
              recipeData.localImageUrl = publicUrlData.publicUrl;
              console.log("Image public URL:", publicUrlData.publicUrl);
            }
          }
        } else {
          console.error("Failed to download image:", imageResponse.statusText);
        }
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
    
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

// Helper function to find recipe schema in JSON-LD data
function findRecipeSchema(jsonData: any): any {
  // Case 1: Direct Recipe object
  if (jsonData['@type'] === 'Recipe') {
    return jsonData;
  }
  
  // Case 2: Array of schemas
  if (Array.isArray(jsonData)) {
    return jsonData.find(item => item['@type'] === 'Recipe');
  }
  
  // Case 3: Graph with multiple items
  if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
    return jsonData['@graph'].find((item: any) => item['@type'] === 'Recipe');
  }
  
  // Case 4: Nested in another structure
  for (const key in jsonData) {
    if (typeof jsonData[key] === 'object' && jsonData[key] !== null) {
      if (jsonData[key]['@type'] === 'Recipe') {
        return jsonData[key];
      }
    }
  }
  
  return null;
}

// Helper function to parse nutrition values
function parseNutritionValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  
  // Extract numbers from the string (e.g., "150 calories" -> 150)
  const match = value.match(/\d+/);
  return match ? parseInt(match[0]) : undefined;
}

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
    // Use local image URL if available, otherwise use original URL
    const imageUrl = recipeData.localImageUrl || recipeData.imageUrl;
    
    // Determine meal type if not already set
    if (!recipeData.mealType) {
      const name = recipeData.name.toLowerCase();
      const description = (recipeData.description || '').toLowerCase();
      
      if (name.includes('breakfast') || name.includes('oatmeal') || name.includes('pancake') || 
          description.includes('breakfast') || name.includes('waffle') || name.includes('muffin')) {
        recipeData.mealType = 'breakfast';
      } else if (name.includes('lunch') || name.includes('sandwich') || name.includes('wrap') ||
                description.includes('lunch') || name.includes('salad')) {
        recipeData.mealType = 'lunch';
      } else if (name.includes('dinner') || name.includes('supper') || 
                description.includes('dinner') || name.includes('casserole')) {
        recipeData.mealType = 'dinner';
      } else if (name.includes('snack') || name.includes('appetizer') || 
                description.includes('snack') || name.includes('bite')) {
        recipeData.mealType = 'snack';
      } else {
        // Default to other if we can't determine
        recipeData.mealType = 'other';
      }
    }
    
    // If high protein is not set by AI analysis, calculate it based on protein content
    if (recipeData.isHighProtein === undefined && recipeData.protein) {
      recipeData.isHighProtein = recipeData.protein >= 20;
    }
    
    // First, insert the main recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        name: recipeData.name,
        description: recipeData.description,
        image_url: imageUrl,
        prep_time: recipeData.prepTime,
        cook_time: recipeData.cookTime,
        servings: recipeData.servings || 1,
        calories: recipeData.calories,
        protein: recipeData.protein,
        carbs: recipeData.carbs,
        fat: recipeData.fat,
        meal_type: recipeData.mealType,
        user_id: userId,
        is_public: true,
        requires_blender: recipeData.equipment?.includes('blender') || false,
        requires_cooking: !!(recipeData.cookTime && recipeData.cookTime > 0),
        price_range: recipeData.priceRange || '$',
        cuisine_type: recipeData.cuisineType || 'other',
        is_high_protein: recipeData.isHighProtein || false
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
    
    // Insert dietary needs as tags
    if (recipeData.dietaryNeeds && recipeData.dietaryNeeds.length > 0) {
      const dietaryTags = [...recipeData.dietaryNeeds];
      if (recipeData.tags) {
        dietaryTags.push(...recipeData.tags);
      }
      
      for (const tagName of dietaryTags) {
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
