
export interface ExternalFood {
  foodId: string;
  label: string;
  brand?: string;
  nutrients: {
    ENERC_KCAL: number; // calories
    PROCNT: number;      // protein
    FAT: number;         // fat
    CHOCDF: number;      // carbs
    FIBTG?: number;      // fiber (optional)
  };
  image?: string;
  quantity?: number;
}

export interface LoggedMeal {
  id: string;
  name: string;
  type: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  loggedAt: string;
  externalSource?: boolean;
  externalId?: string;
  imageSrc?: string;
}
