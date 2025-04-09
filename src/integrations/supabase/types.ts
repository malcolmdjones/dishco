export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      custom_recipes: {
        Row: {
          cookingtime: number | null
          createdat: string
          description: string | null
          id: string
          imageurl: string | null
          ingredients: Json | null
          instructions: string[] | null
          nutrition: Json | null
          servings: number | null
          sourceurl: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          cookingtime?: number | null
          createdat?: string
          description?: string | null
          id: string
          imageurl?: string | null
          ingredients?: Json | null
          instructions?: string[] | null
          nutrition?: Json | null
          servings?: number | null
          sourceurl?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          cookingtime?: number | null
          createdat?: string
          description?: string | null
          id?: string
          imageurl?: string | null
          ingredients?: Json | null
          instructions?: string[] | null
          nutrition?: Json | null
          servings?: number | null
          sourceurl?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          id: string
          protein: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          id?: string
          protein?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          id?: string
          protein?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recipe_equipment: {
        Row: {
          created_at: string | null
          id: string
          name: string
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_equipment_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_old"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          name: string
          quantity: string | null
          recipe_id: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          quantity?: string | null
          recipe_id?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          quantity?: string | null
          recipe_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_old"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_instructions: {
        Row: {
          created_at: string | null
          id: string
          instruction: string
          recipe_id: string | null
          step_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          instruction: string
          recipe_id?: string | null
          step_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          instruction?: string
          recipe_id?: string | null
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_old"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_preferences: {
        Row: {
          created_at: string
          id: string
          liked: boolean
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked?: boolean
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked?: boolean
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_preferences_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_old"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tag_relations: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string | null
          tag_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          tag_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tag_relations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "recipe_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          air_fryer: boolean | null
          blender: boolean | null
          calorie_bracket: string | null
          cook_time: string | null
          created_at: string | null
          created_by: string | null
          cuisine: string | null
          dietary_tags: string | null
          grill: boolean | null
          id: string
          image_url: string | null
          ingredients_json: Json | null
          instructions_json: Json | null
          is_public: boolean | null
          meal_prep: boolean | null
          nutrition_calories: number | null
          nutrition_carbs: number | null
          nutrition_fat: number | null
          nutrition_protein: number | null
          oven: boolean | null
          prep_duration_days: string | null
          prep_time: string | null
          price_range: string | null
          protein_focus: string | null
          servings: number | null
          short_description: string | null
          slow_cooker: boolean | null
          stovetop: boolean | null
          tags: string | null
          title: string | null
          total_time: string | null
          type: string | null
          upc_ingredients: Json | null
          updated_at: string | null
        }
        Insert: {
          air_fryer?: boolean | null
          blender?: boolean | null
          calorie_bracket?: string | null
          cook_time?: string | null
          created_at?: string | null
          created_by?: string | null
          cuisine?: string | null
          dietary_tags?: string | null
          grill?: boolean | null
          id?: string
          image_url?: string | null
          ingredients_json?: Json | null
          instructions_json?: Json | null
          is_public?: boolean | null
          meal_prep?: boolean | null
          nutrition_calories?: number | null
          nutrition_carbs?: number | null
          nutrition_fat?: number | null
          nutrition_protein?: number | null
          oven?: boolean | null
          prep_duration_days?: string | null
          prep_time?: string | null
          price_range?: string | null
          protein_focus?: string | null
          servings?: number | null
          short_description?: string | null
          slow_cooker?: boolean | null
          stovetop?: boolean | null
          tags?: string | null
          title?: string | null
          total_time?: string | null
          type?: string | null
          upc_ingredients?: Json | null
          updated_at?: string | null
        }
        Update: {
          air_fryer?: boolean | null
          blender?: boolean | null
          calorie_bracket?: string | null
          cook_time?: string | null
          created_at?: string | null
          created_by?: string | null
          cuisine?: string | null
          dietary_tags?: string | null
          grill?: boolean | null
          id?: string
          image_url?: string | null
          ingredients_json?: Json | null
          instructions_json?: Json | null
          is_public?: boolean | null
          meal_prep?: boolean | null
          nutrition_calories?: number | null
          nutrition_carbs?: number | null
          nutrition_fat?: number | null
          nutrition_protein?: number | null
          oven?: boolean | null
          prep_duration_days?: string | null
          prep_time?: string | null
          price_range?: string | null
          protein_focus?: string | null
          servings?: number | null
          short_description?: string | null
          slow_cooker?: boolean | null
          stovetop?: boolean | null
          tags?: string | null
          title?: string | null
          total_time?: string | null
          type?: string | null
          upc_ingredients?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes_old: {
        Row: {
          calories: number | null
          carbs: number | null
          cook_time: number | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          fat: number | null
          id: string
          image_url: string | null
          is_high_protein: boolean | null
          is_public: boolean | null
          meal_type: string | null
          name: string
          prep_time: number | null
          price_range: string | null
          protein: number | null
          requires_blender: boolean | null
          requires_cooking: boolean | null
          servings: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          cook_time?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          is_high_protein?: boolean | null
          is_public?: boolean | null
          meal_type?: string | null
          name: string
          prep_time?: number | null
          price_range?: string | null
          protein?: number | null
          requires_blender?: boolean | null
          requires_cooking?: boolean | null
          servings?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          cook_time?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          is_high_protein?: boolean | null
          is_public?: boolean | null
          meal_type?: string | null
          name?: string
          prep_time?: number | null
          price_range?: string | null
          protein?: number | null
          requires_blender?: boolean | null
          requires_cooking?: boolean | null
          servings?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_meal_plans: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan_data: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan_data: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan_data?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          id: string
          recipe_id: string
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          recipe_id: string
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          recipe_id?: string
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin"],
    },
  },
} as const
