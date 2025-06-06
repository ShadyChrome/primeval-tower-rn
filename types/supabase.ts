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
      player_achievements: {
        Row: {
          achievement_id: string
          id: string
          player_id: string | null
          progress: Json | null
          unlocked_at: string | null
        }
        Insert: {
          achievement_id: string
          id?: string
          player_id?: string | null
          progress?: Json | null
          unlocked_at?: string | null
        }
        Update: {
          achievement_id?: string
          id?: string
          player_id?: string | null
          progress?: Json | null
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_inventory: {
        Row: {
          acquired_at: string | null
          id: string
          item_id: string
          item_type: string
          metadata: Json | null
          player_id: string | null
          quantity: number | null
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          item_id: string
          item_type: string
          metadata?: Json | null
          player_id?: string | null
          quantity?: number | null
        }
        Update: {
          acquired_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          metadata?: Json | null
          player_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_inventory_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_runes: {
        Row: {
          acquired_at: string | null
          created_at: string | null
          equipped_slot: number | null
          id: string
          is_equipped: boolean | null
          player_id: string | null
          rune_level: number | null
          rune_tier: string | null
          rune_type: string
          stat_bonuses: Json | null
        }
        Insert: {
          acquired_at?: string | null
          created_at?: string | null
          equipped_slot?: number | null
          id?: string
          is_equipped?: boolean | null
          player_id?: string | null
          rune_level?: number | null
          rune_tier?: string | null
          rune_type: string
          stat_bonuses?: Json | null
        }
        Update: {
          acquired_at?: string | null
          created_at?: string | null
          equipped_slot?: number | null
          id?: string
          is_equipped?: boolean | null
          player_id?: string | null
          rune_level?: number | null
          rune_tier?: string | null
          rune_type?: string
          stat_bonuses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "player_runes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_tower_progress: {
        Row: {
          best_time: number | null
          completed: boolean | null
          completion_date: string | null
          created_at: string | null
          floor_number: number
          id: string
          player_id: string | null
          rewards_claimed: boolean | null
        }
        Insert: {
          best_time?: number | null
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          floor_number: number
          id?: string
          player_id?: string | null
          rewards_claimed?: boolean | null
        }
        Update: {
          best_time?: number | null
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          floor_number?: number
          id?: string
          player_id?: string | null
          rewards_claimed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "player_tower_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_treasure_box: {
        Row: {
          created_at: string | null
          gems_per_hour: number | null
          id: string
          last_claim_time: string | null
          max_storage: number | null
          player_id: string | null
          total_gems_generated: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gems_per_hour?: number | null
          id?: string
          last_claim_time?: string | null
          max_storage?: number | null
          player_id?: string | null
          total_gems_generated?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gems_per_hour?: number | null
          id?: string
          last_claim_time?: string | null
          max_storage?: number | null
          player_id?: string | null
          total_gems_generated?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_treasure_box_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          current_xp: number | null
          device_id: string
          gems: number | null
          id: string
          last_login: string | null
          level: number | null
          max_xp: number | null
          player_name: string
          total_playtime: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_xp?: number | null
          device_id: string
          gems?: number | null
          id?: string
          last_login?: string | null
          level?: number | null
          max_xp?: number | null
          player_name: string
          total_playtime?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_xp?: number | null
          device_id?: string
          gems?: number | null
          id?: string
          last_login?: string | null
          level?: number | null
          max_xp?: number | null
          player_name?: string
          total_playtime?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_max_xp: {
        Args: { player_level: number }
        Returns: number
      }
      calculate_treasure_box_gems: {
        Args: { p_player_id: string }
        Returns: {
          accumulated_gems: number
          time_until_full: number
          is_full: boolean
          last_claim_time: string
          gems_per_hour: number
          max_storage: number
        }[]
      }
      claim_treasure_box_gems: {
        Args: { p_player_id: string }
        Returns: {
          gems_claimed: number
          new_gem_total: number
          success: boolean
          message: string
        }[]
      }
      save_guest_data: {
        Args: { p_device_id: string; p_progress: Json; p_settings: Json }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

// Additional types for better development experience
export type Player = Tables<'players'>
export type PlayerInventoryItem = Tables<'player_inventory'>
export type PlayerRune = Tables<'player_runes'>
export type PlayerAchievement = Tables<'player_achievements'>
export type PlayerTowerProgress = Tables<'player_tower_progress'>
export type PlayerTreasureBox = Tables<'player_treasure_box'>

export type PlayerInsert = TablesInsert<'players'>
export type PlayerUpdate = TablesUpdate<'players'>
export type PlayerInventoryInsert = TablesInsert<'player_inventory'>
export type PlayerRuneInsert = TablesInsert<'player_runes'>
export type PlayerTreasureBoxInsert = TablesInsert<'player_treasure_box'>

// Treasure box function result types
export type TreasureBoxStatus = {
  accumulated_gems: number
  time_until_full: number
  is_full: boolean
  last_claim_time: string
  gems_per_hour: number
  max_storage: number
}

export type TreasureBoxClaim = {
  gems_claimed: number
  new_gem_total: number
  success: boolean
  message: string
}
