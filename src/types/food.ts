
export interface ExternalFood {
  id: string;
  foodId: string;
  label: string;
  brand?: string;
  category?: string;
  categoryLabel?: string;
  nutrients: {
    ENERC_KCAL: number;
    PROCNT: number;
    FAT: number;
    CHOCDF: number;
    FIBTG?: number;
  };
  image?: string;
  source?: string;
  quantity: number;
  type: string;
  loggedAt: string;
  externalSource?: boolean;
  externalId?: string;
}

export interface LoggedMeal {
  id: string;
  name: string;
  type: string;
  recipe: any;
  consumed: boolean;
  loggedAt: string;
  externalSource?: boolean;
}
