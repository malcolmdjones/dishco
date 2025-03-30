
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define type for the AI request
interface AIRequest {
  userGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  lockedMeals?: {
    [key: string]: any;
  };
  availableRecipes: any[];
  currentDay?: number;
  mealTypes?: string[];
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get OpenAI API key from environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData: AIRequest = await req.json();
    const { userGoals, lockedMeals, availableRecipes, mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] } = requestData;

    console.log("Received request for meal planning with goals:", userGoals);
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not set");
    }

    if (!availableRecipes || availableRecipes.length === 0) {
      throw new Error("No available recipes provided");
    }

    // Prepare the system prompt
    const systemPrompt = `You are a nutrition expert AI assistant that helps create optimal meal plans.
Your task is to create a meal plan that meets the user's nutritional goals as closely as possible.
The user's daily nutritional goals are:
- Calories: ${userGoals.calories} (acceptable range: ${userGoals.calories - 75} to ${userGoals.calories + 75})
- Protein: ${userGoals.protein}g (acceptable range: ${userGoals.protein - 2}g to ${userGoals.protein + 2}g)
- Carbs: ${userGoals.carbs}g (acceptable range: ${userGoals.carbs - 5}g to ${userGoals.carbs + 5}g)
- Fat: ${userGoals.fat}g (acceptable range: ${userGoals.fat - 5}g to ${userGoals.fat + 5}g)

You will be provided with a list of available recipes, each with its nutritional information.
Some meals might be locked, meaning they must be included in the final meal plan.
Your job is to fill the remaining meal slots to create a balanced daily meal plan that meets the nutritional goals.
`;

    // Format available recipes for the AI
    const formattedRecipes = availableRecipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      type: recipe.type,
      calories: recipe.macros.calories,
      protein: recipe.macros.protein,
      carbs: recipe.macros.carbs,
      fat: recipe.macros.fat,
      description: recipe.description
    }));

    // Format locked meals if any
    let lockedMealsPrompt = "";
    if (lockedMeals && Object.keys(lockedMeals).length > 0) {
      lockedMealsPrompt = "The following meals are locked and must be included in the plan:\n";
      for (const [mealType, meal] of Object.entries(lockedMeals)) {
        if (meal) {
          lockedMealsPrompt += `- ${mealType}: ${meal.name} (${meal.macros.calories} calories, ${meal.macros.protein}g protein, ${meal.macros.carbs}g carbs, ${meal.macros.fat}g fat)\n`;
        }
      }
    }

    // Create user prompt
    const userPrompt = `
${lockedMealsPrompt}

Please create a meal plan that includes one breakfast, one lunch, one dinner, and two snacks from the available recipes:

${JSON.stringify(formattedRecipes, null, 2)}

Return your answer as a valid JSON object with this structure:
{
  "breakfast": { recipe id or null if locked },
  "lunch": { recipe id or null if locked },
  "dinner": { recipe id or null if locked },
  "snacks": [{ recipe id or null if locked }, { recipe id or null if locked }],
  "nutritionTotals": {
    "calories": total calories,
    "protein": total protein in grams,
    "carbs": total carbs in grams,
    "fat": total fat in grams
  },
  "reasoning": "Your explanation of why you chose these meals"
}

Only include recipe IDs for meals that need to be filled, use null for locked meals.
Make sure the total nutrition values are as close as possible to the user's goals.
`;

    console.log("Sending request to OpenAI");
    
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    // Parse the response
    const responseData = await response.json();
    
    if (!responseData.choices || responseData.choices.length === 0) {
      console.error("Unexpected OpenAI response:", responseData);
      throw new Error("Failed to get a valid response from OpenAI");
    }

    // Extract the generated meal plan
    const aiResponse = responseData.choices[0].message.content.trim();
    console.log("AI response received:", aiResponse);
    
    let mealPlan;
    try {
      // Find JSON block in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      throw new Error("Failed to parse meal plan from AI response");
    }

    // Map the meal plan back to actual recipes
    const recipesMap = Object.fromEntries(availableRecipes.map(r => [r.id, r]));
    
    const result = {
      mealPlan: {
        breakfast: mealPlan.breakfast ? recipesMap[mealPlan.breakfast] : lockedMeals?.breakfast || null,
        lunch: mealPlan.lunch ? recipesMap[mealPlan.lunch] : lockedMeals?.lunch || null,
        dinner: mealPlan.dinner ? recipesMap[mealPlan.dinner] : lockedMeals?.dinner || null,
        snacks: [
          mealPlan.snacks?.[0] ? recipesMap[mealPlan.snacks[0]] : lockedMeals?.['snack-0'] || null,
          mealPlan.snacks?.[1] ? recipesMap[mealPlan.snacks[1]] : lockedMeals?.['snack-1'] || null
        ]
      },
      nutritionTotals: mealPlan.nutritionTotals,
      reasoning: mealPlan.reasoning
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in meal-plan-ai function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
