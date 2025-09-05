export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string
          session_id?: string
        }
        Relationships: []
      }
      contact_rate_limit: {
        Row: {
          email: string
          first_submission: string | null
          id: string
          ip_address: string
          last_submission: string | null
          submission_count: number | null
        }
        Insert: {
          email: string
          first_submission?: string | null
          id?: string
          ip_address: string
          last_submission?: string | null
          submission_count?: number | null
        }
        Update: {
          email?: string
          first_submission?: string | null
          id?: string
          ip_address?: string
          last_submission?: string | null
          submission_count?: number | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          department: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      market_predictions: {
        Row: {
          confidence_level: number
          created_at: string
          created_by: string | null
          id: string
          prediction_text: string
          prediction_type: string
          product_name: string
          valid_until: string
        }
        Insert: {
          confidence_level: number
          created_at?: string
          created_by?: string | null
          id?: string
          prediction_text: string
          prediction_type: string
          product_name: string
          valid_until: string
        }
        Update: {
          confidence_level?: number
          created_at?: string
          created_by?: string | null
          id?: string
          prediction_text?: string
          prediction_type?: string
          product_name?: string
          valid_until?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          is_active: boolean
          name: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          message: string | null
          product_id: string
          quantity: number
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          message?: string | null
          product_id: string
          quantity: number
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          message?: string | null
          product_id?: string
          quantity?: number
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string
          name: string
          price_per_unit: number
          quantity: number
          status: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location: string
          name: string
          price_per_unit: number
          quantity: number
          status?: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          name?: string
          price_per_unit?: number
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_capacity: {
        Row: {
          created_at: string
          id: string
          occupied_places: number | null
          program_name: string
          program_type: string
          total_places: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          occupied_places?: number | null
          program_name: string
          program_type: string
          total_places: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          occupied_places?: number | null
          program_name?: string
          program_type?: string
          total_places?: number
          updated_at?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_date: string
          pdf_data: string | null
          receipt_number: string
          registration_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_date?: string
          pdf_data?: string | null
          receipt_number: string
          registration_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_date?: string
          pdf_data?: string | null
          receipt_number?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          amount: number | null
          created_at: string
          documents_verified: boolean | null
          email: string
          eventbrite_response: Json | null
          id: string
          name: string
          payment_reference: string | null
          payment_status: string | null
          phone: string
          program_name: string | null
          program_type: string | null
          registration_date: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          documents_verified?: boolean | null
          email: string
          eventbrite_response?: Json | null
          id?: string
          name: string
          payment_reference?: string | null
          payment_status?: string | null
          phone: string
          program_name?: string | null
          program_type?: string | null
          registration_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          documents_verified?: boolean | null
          email?: string
          eventbrite_response?: Json | null
          id?: string
          name?: string
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string
          program_name?: string | null
          program_type?: string | null
          registration_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paystack_customer_id: string | null
          paystack_subscription_id: string | null
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_id?: string | null
          paystack_subscription_id?: string | null
          plan_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_id?: string | null
          paystack_subscription_id?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      submit_registration: {
        Args: { p_email: string; p_name: string; p_phone: string }
        Returns: string
      }
      update_occupied_places: {
        Args: { p_program_name: string; p_program_type: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
