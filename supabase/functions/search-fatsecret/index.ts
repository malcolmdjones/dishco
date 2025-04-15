
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
        "scope": "basic premier"
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
      method: "foods.search.v2",
      format: "json",
      search_expression: query,
      max_results: "20",
      page_number: "0"
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
      
      for (const food of foods) {
        try {
          // Get the detailed food information for this result
          const foodParams = new URLSearchParams({
            method: "food.get.v2",
            format: "json",
            food_id: food.food_id
          });
          
          const foodResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${foodParams}`, {
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          });
          
          if (!foodResponse.ok) continue;
          
          const foodData = await foodResponse.json();
          const foodDetails = foodData.food;
          
          if (!foodDetails || !foodDetails.servings || !foodDetails.servings.serving) continue;
          
          // Get servings information
          const servings = Array.isArray(foodDetails.servings.serving) 
            ? foodDetails.servings.serving 
            : [foodDetails.servings.serving];
          
          // Use the first serving (usually the default)
          if (servings.length > 0) {
            const serving = servings[0];
            
            processedResults.push({
              foodId: foodDetails.food_id,
              label: foodDetails.food_name,
              brand: foodDetails.brand_name || "",
              nutrients: {
                ENERC_KCAL: parseFloat(serving.calories) || 0,
                PROCNT: parseFloat(serving.protein) || 0,
                CHOCDF: parseFloat(serving.carbohydrate) || 0,
                FAT: parseFloat(serving.fat) || 0,
                FIBTG: parseFloat(serving.fiber) || 0,
                SUGAR: parseFloat(serving.sugar) || 0,
                NA: parseFloat(serving.sodium) || 0,
                CHOLE: parseFloat(serving.cholesterol) || 0,
                FASAT: parseFloat(serving.saturated_fat) || 0,
                FATRN: parseFloat(serving.trans_fat) || 0
              },
              image: foodDetails.food_image || "",
              servingSize: serving.serving_description || "",
              description: food.food_description || ""
            });
          }
        } catch (error) {
          console.error(`Error processing food item ${food.food_id}:`, error);
          // Continue to the next item if this one fails
          continue;
        }
      }
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
