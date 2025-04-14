
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
      console.error("Missing barcode parameter");
      return new Response(
        JSON.stringify({ error: "Barcode is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Normalize barcode input (remove spaces, non-numeric chars for some formats)
    const normalizedBarcode = barcode.toString().replace(/\s+/g, '');
    console.log(`Looking up barcode: ${normalizedBarcode}`);
    
    // Try OpenFoodFacts API first
    const url = `https://world.openfoodfacts.org/api/v2/product/${normalizedBarcode}.json`;
    console.log(`Calling OpenFoodFacts API: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MealPlanner/1.0 (https://planprovisions.lovable.app)'
      }
    });
    
    if (!response.ok) {
      console.error(`OpenFoodFacts API error: ${response.status} ${response.statusText}`);
      
      // Enhanced logging for debugging
      let responseBody = "";
      try {
        responseBody = await response.text();
        console.error(`Response body: ${responseBody}`);
      } catch (e) {
        console.error(`Could not read response body: ${e}`);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Error calling external API", 
          status: response.status,
          details: responseBody || "No details available"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    const data = await response.json();
    console.log(`OpenFoodFacts response status: ${data.status}`);
    
    // Log the entire product data in development for debugging
    console.log(`Raw product data:`, JSON.stringify(data).substring(0, 500) + "...");
    
    // If product not found in OpenFoodFacts, try alternate APIs or fallback
    if (data.status !== 1 || !data.product) {
      console.log(`Product not found in OpenFoodFacts for code ${normalizedBarcode}, trying backup sources...`);
      
      // Example log to help debug why products aren't being found
      if (data.status === 0) {
        console.log(`OpenFoodFacts returned status 0. Reason: ${data.status_verbose || 'Unknown'}`);
      }
      
      // Try UPC database API as fallback (currently just a placeholder)
      // Add your backup API implementation here
      
      return new Response(
        JSON.stringify({ 
          error: "Product not found",
          code: normalizedBarcode,
          apiResponse: data
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    console.log(`Found product: ${data.product.product_name || 'Unnamed product'}`);
    console.log(`Product brand: ${data.product.brands || 'Unknown brand'}`);
    console.log(`Nutrient data available: ${data.product.nutriments ? 'Yes' : 'No'}`);
    
    // Return the product data with detailed info
    return new Response(
      JSON.stringify({
        code: normalizedBarcode,
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
