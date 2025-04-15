
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

    console.log(`Searching FatSecret API for: ${query}`);
    
    // Get FatSecret API credentials from environment
    const clientId = Deno.env.get("FATSECRET_CLIENT_ID");
    const clientSecret = Deno.env.get("FATSECRET_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("FatSecret API credentials not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API configuration error", 
          details: "Missing credentials"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Step 1: Get access token using client credentials
    const tokenResponse = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        "grant_type": "client_credentials",
        "scope": "basic"
      })
    });
    
    if (!tokenResponse.ok) {
      console.error(`Error getting FatSecret access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
      const errorText = await tokenResponse.text();
      console.error(`Error details: ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: "Authentication error", 
          status: tokenResponse.status,
          details: errorText 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Step 2: Use the access token to search for foods
    const searchParams = new URLSearchParams({
      method: "foods.search",
      format: "json",
      search_expression: query,
      max_results: "20"
    });
    
    const searchResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${searchParams}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!searchResponse.ok) {
      console.error(`FatSecret API error: ${searchResponse.status} ${searchResponse.statusText}`);
      const errorText = await searchResponse.text();
      console.error(`Error details: ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: "Error calling external API", 
          status: searchResponse.status,
          details: errorText
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const data = await searchResponse.json();
    console.log(`FatSecret API response received`);
    
    // Process the response to extract the most relevant information
    const processedResults = [];
    
    // Check if foods exist in the response
    if (data.foods && data.foods.food) {
      // FatSecret can return either an array of foods or a single food object
      const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
      
      foods.forEach((food) => {
        // Extract the nutrition info
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;
        
        // Parse nutrition info from description
        if (food.food_description) {
          const caloriesMatch = food.food_description.match(/Cal:\s*(\d+)/i);
          if (caloriesMatch) calories = parseInt(caloriesMatch[1], 10);
          
          const proteinMatch = food.food_description.match(/Prot:\s*(\d+)g/i);
          if (proteinMatch) protein = parseInt(proteinMatch[1], 10);
          
          const carbsMatch = food.food_description.match(/Carbs:\s*(\d+)g/i);
          if (carbsMatch) carbs = parseInt(carbsMatch[1], 10);
          
          const fatMatch = food.food_description.match(/Fat:\s*(\d+)g/i);
          if (fatMatch) fat = parseInt(fatMatch[1], 10);
        }
        
        // Some foods have more detailed nutrition info
        if (food.food_nutrition) {
          calories = parseFloat(food.food_nutrition.calories) || calories;
          protein = parseFloat(food.food_nutrition.protein) || protein;
          carbs = parseFloat(food.food_nutrition.carbohydrate) || carbs;
          fat = parseFloat(food.food_nutrition.fat) || fat;
        }
        
        // Create a standardized format similar to what we had with OpenFoodFacts
        processedResults.push({
          foodId: food.food_id,
          label: food.food_name,
          brand: food.brand_name || "",
          nutrients: {
            ENERC_KCAL: calories,
            PROCNT: protein,
            FAT: fat,
            CHOCDF: carbs
          },
          image: food.food_image || "",
          servingSize: food.serving_description || "",
          description: food.food_description || ""
        });
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
