
export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  checked?: boolean;
}

export interface Recipe {
  name: string;
  ingredients?: Ingredient[] | string[] | Record<string, any>[];
}

export interface GroceryMealPlan {
  name?: string;
  id?: string;
  plan_data: {
    days: Array<{
      date: string;
      meals: {
        breakfast?: Recipe | Recipe[];
        lunch?: Recipe | Recipe[];
        dinner?: Recipe | Recipe[];
        snacks?: Recipe[];
      };
    }>;
  };
}
