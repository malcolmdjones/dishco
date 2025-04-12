
// src/types/food.ts
export interface ExternalFood {
  id: string;
  name: string;
  description?: string;
  type?: string;
  imageSrc?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servingSize?: string;
  servingUnit?: string;
  brand?: string;
  externalId: string;
}
