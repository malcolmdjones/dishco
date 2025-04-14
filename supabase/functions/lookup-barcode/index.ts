
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
    
    // Try OpenFoodFacts API first
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    console.log(`Calling OpenFoodFacts API: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`OpenFoodFacts API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: "Error calling external API", 
          status: response.status 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const data = await response.json();
    
    // If product not found in OpenFoodFacts, try alternate APIs or fallback
    if (data.status !== 1 || !data.product) {
      console.log(`Product not found in OpenFoodFacts for code ${barcode}, trying backup sources...`);
      
      // Currently we don't have a backup API integrated
      // This is where you could add additional API calls
      
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

    console.log(`Found product: ${data.product.product_name || 'Unnamed product'}`);
    
    // Return the product data with detailed info
    return new Response(
      JSON.stringify({
        code: barcode,
        product: data.product,
        status: data.status,
        source: "OpenFoodFacts"
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
