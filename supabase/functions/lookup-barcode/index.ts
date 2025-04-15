
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    
    if (!barcode) {
      return new Response(
        JSON.stringify({ error: "Barcode is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Looking up barcode: ${barcode}`);
    
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
        "scope": "barcode premier"
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
    
    // Step 2: Use the access token to look up the barcode
    const searchParams = new URLSearchParams({
      method: "food.find_id_for_barcode",
      format: "json",
      barcode: barcode
    });
    
    const barcodeResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${searchParams}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!barcodeResponse.ok) {
      console.error(`FatSecret API error: ${barcodeResponse.status} ${barcodeResponse.statusText}`);
      const errorText = await barcodeResponse.text();
      console.error(`Error details: ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: "Error calling external API", 
          status: barcodeResponse.status,
          details: errorText
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const barcodeData = await barcodeResponse.json();
    
    // Check if a food was found
    if (!barcodeData.food_id) {
      console.log(`No product found for barcode: ${barcode}`);
      return new Response(
        JSON.stringify({ 
          error: "Product not found",
          code: barcode
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // Step 3: Get the food details using the food_id
    const foodParams = new URLSearchParams({
      method: "food.get.v2",
      format: "json",
      food_id: barcodeData.food_id
    });
    
    const foodResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?${foodParams}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!foodResponse.ok) {
      console.error(`FatSecret API error getting food details: ${foodResponse.status} ${foodResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: "Error fetching product details", 
          status: foodResponse.status
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const foodData = await foodResponse.json();
    console.log(`Found product: ${foodData.food?.food_name || 'Unnamed product'}`);
    
    return new Response(
      JSON.stringify({
        code: barcode,
        product: foodData.food,
        source: "FatSecret"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
