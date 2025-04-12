
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Environment variables will be set in Supabase
const USDA_API_KEY = Deno.env.get("USDA_API_KEY") || "";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check for API credentials
    if (!USDA_API_KEY) {
      console.error("Missing USDA API Key");
      return new Response(
        JSON.stringify({ 
          error: "API credentials not configured",
          message: "Please configure USDA_API_KEY in Supabase secrets"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log(`Searching USDA FoodData Central API for: ${query}`);
    
    // Call the USDA FoodData Central API
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.append("api_key", USDA_API_KEY);
    url.searchParams.append("query", query);
    url.searchParams.append("pageSize", "20");
    url.searchParams.append("dataType", "Foundation,SR Legacy,Survey (FNDDS)");

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`USDA API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: "Error calling external API", 
          status: response.status,
          details: errorText
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const data = await response.json();
    console.log(`Found ${data.foods?.length || 0} results`);

    // Process the response to extract the most relevant information
    const processedResults = [];

    if (data.foods && data.foods.length > 0) {
      data.foods.forEach((item) => {
        // Get nutrients from the food item
        const nutrients = {};
        
        // Find the nutrients we need
        if (item.foodNutrients) {
          // Map nutrient IDs to their common names
          const NUTRIENT_MAP = {
            1008: "ENERC_KCAL", // Energy (kcal)
            1003: "PROCNT",      // Protein
            1004: "FAT",         // Total lipid (fat)
            1005: "CHOCDF"       // Carbohydrate, by difference
          };
          
          item.foodNutrients.forEach(nutrient => {
            const nutrientId = nutrient.nutrientId;
            if (NUTRIENT_MAP[nutrientId]) {
              nutrients[NUTRIENT_MAP[nutrientId]] = nutrient.value || 0;
            }
          });
        }

        // Only add foods that have at least some nutrients
        if (Object.keys(nutrients).length > 0) {
          // Make sure all required nutrients are present
          const requiredNutrients = ["ENERC_KCAL", "PROCNT", "FAT", "CHOCDF"];
          requiredNutrients.forEach(nutrient => {
            if (!nutrients[nutrient]) nutrients[nutrient] = 0;
          });
          
          processedResults.push({
            foodId: item.fdcId.toString(),
            label: item.description,
            brand: item.brandName || item.brandOwner || "",
            nutrients: nutrients,
            image: item.foodCategory === 'Fruits and Fruit Juices' 
              ? 'https://www.fda.gov/files/food/published/fruits-and-vegetables-723x406-72-dpi.jpg'
              : item.foodCategory === 'Vegetables and Vegetable Products'
              ? 'https://www.fda.gov/files/food/published/fruits-and-vegetables-723x406-72-dpi.jpg' 
              : item.foodCategory === 'Dairy and Egg Products'
              ? 'https://www.tasteofhome.com/wp-content/uploads/2019/11/dairy-shutterstock_311353164.jpg'
              : item.foodCategory === 'Poultry Products'
              ? 'https://cdn.britannica.com/16/234216-050-C66F8665/bevy-of-bluebirds-feast-on-birdseed.jpg'
              : item.foodCategory === 'Beef Products'
              ? 'https://www.seriouseats.com/thmb/gBMNm_YK3baKvJSbGwnOWOwQl6k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2015__05__Anova-Steak-Guide-Sous-Vide-Photos15-beauty-159b7038c56a4e7685b57f478ca3e4c8.jpg'
              : item.foodCategory === 'Seafood Products' 
              ? 'https://www.seriouseats.com/thmb/HM-WBgsF9-MRQsJWIK8FBuHIiNs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2019__10__20191022-seafood-platter-vicky-wasik-21-c88308ca2c5941ef8a3f2b4a9ef3113a.jpg'
              : 'https://www.healthyeating.org/images/default-source/home-0.0/nutrition-topics-2.0/general-nutrition-wellness/2-2-2-2foodgroups_vegetables_detailfeature.jpg?sfvrsn=226f1bc7_6'
          });
        }
      });
    }

    return new Response(JSON.stringify(processedResults), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
