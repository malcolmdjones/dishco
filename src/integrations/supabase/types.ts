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
            referencedRelation: "recipes"
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
            referencedRelation: "recipes"
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
            referencedRelation: "recipes"
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
            referencedRelation: "recipes"
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
            referencedRelation: "recipes"
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
        Args: {
          user_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
