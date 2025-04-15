
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// NOTE: This function is now primarily used for barcode scanning.
// Food searching is now handled by search-fatsecret function.
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

    console.log(`Searching OpenFoodFacts API for: ${query}`);
    
    // Call the OpenFoodFacts API
    const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
    url.searchParams.append("search_terms", query);
    url.searchParams.append("search_simple", "1");
    url.searchParams.append("action", "process");
    url.searchParams.append("json", "1");
    url.searchParams.append("page_size", "20");

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`OpenFoodFacts API error: ${response.status} ${response.statusText}`);
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
    console.log(`Found ${data.products?.length || 0} results`);

    // Process the response to extract the most relevant information
    const processedResults = [];

    if (data.products && data.products.length > 0) {
      data.products.forEach((product) => {
        // Skip products without a name
        if (!product.product_name) return;
        
        // Get macros - default to 0 if not available
        const calories = product.nutriments?.['energy-kcal_100g'] || 0;
        const protein = product.nutriments?.proteins_100g || 0;
        const carbs = product.nutriments?.carbohydrates_100g || 0;
        const fat = product.nutriments?.fat_100g || 0;

        // Only add foods that have at least calories
        if (calories > 0) {
          processedResults.push({
            foodId: product.code,
            label: product.product_name,
            brand: product.brands || "",
            nutrients: {
              ENERC_KCAL: calories,
              PROCNT: protein,
              FAT: fat,
              CHOCDF: carbs
            },
            image: product.image_url || "",
            servingSize: product.serving_size || product.quantity,
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
