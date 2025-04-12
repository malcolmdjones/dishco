
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Environment variables will be set in Supabase
const EDAMAM_APP_ID = Deno.env.get("EDAMAM_APP_ID") || "";
const EDAMAM_APP_KEY = Deno.env.get("EDAMAM_APP_KEY") || "";

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

    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      return new Response(
        JSON.stringify({ error: "API credentials not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Call the Edamam Food Database API
    const url = new URL("https://api.edamam.com/api/food-database/v2/parser");
    url.searchParams.append("app_id", EDAMAM_APP_ID);
    url.searchParams.append("app_key", EDAMAM_APP_KEY);
    url.searchParams.append("ingr", query);
    url.searchParams.append("nutrition-type", "logging");

    const response = await fetch(url.toString());
    const data = await response.json();

    // Process the response to extract the most relevant information
    const processedResults = [];

    // Add parsed foods
    if (data.parsed && data.parsed.length > 0) {
      data.parsed.forEach((item: any) => {
        processedResults.push({
          foodId: item.food.foodId,
          label: item.food.label,
          brand: item.food.brand,
          category: item.food.category,
          categoryLabel: item.food.categoryLabel,
          nutrients: item.food.nutrients,
          image: item.food.image,
          source: "Edamam"
        });
      });
    }

    // Add food hints (suggestions)
    if (data.hints && data.hints.length > 0) {
      data.hints.forEach((item: any) => {
        // Only add if not already in the results
        if (!processedResults.some(r => r.foodId === item.food.foodId)) {
          processedResults.push({
            foodId: item.food.foodId,
            label: item.food.label,
            brand: item.food.brand,
            category: item.food.category,
            categoryLabel: item.food.categoryLabel,
            nutrients: item.food.nutrients,
            image: item.food.image,
            source: "Edamam"
          });
        }
      });
    }

    return new Response(JSON.stringify(processedResults.slice(0, 20)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
