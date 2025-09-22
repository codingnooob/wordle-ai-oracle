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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analysis_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_completion_seconds: number | null
          expires_at: string | null
          id: string
          input_data: Json
          session_token: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion_seconds?: number | null
          expires_at?: string | null
          id?: string
          input_data: Json
          session_token?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion_seconds?: number | null
          expires_at?: string | null
          id?: string
          input_data?: Json
          session_token?: string
          status?: string
        }
        Relationships: []
      }
      analysis_results: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          job_id: string
          processing_status: string | null
          solutions: Json
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          job_id: string
          processing_status?: string | null
          solutions: Json
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          job_id?: string
          processing_status?: string | null
          solutions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "analysis_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_status_view"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          api_key_hash: string | null
          created_at: string
          endpoint: string
          id: string
          last_request: string
          request_count: number | null
        }
        Insert: {
          api_key_hash?: string | null
          created_at?: string
          endpoint: string
          id?: string
          last_request?: string
          request_count?: number | null
        }
        Update: {
          api_key_hash?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          last_request?: string
          request_count?: number | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          api_key_hash: string | null
          created_at: string
          details: Json | null
          endpoint: string | null
          event_type: string
          id: string
          severity: string | null
          source_ip: string | null
          user_agent: string | null
        }
        Insert: {
          api_key_hash?: string | null
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          event_type: string
          id?: string
          severity?: string | null
          source_ip?: string | null
          user_agent?: string | null
        }
        Update: {
          api_key_hash?: string | null
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          event_type?: string
          id?: string
          severity?: string | null
          source_ip?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      session_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_revoked: boolean
          job_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean
          job_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean
          job_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_tokens_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "analysis_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_tokens_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_status_view"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      job_status_view: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          estimated_completion_seconds: number | null
          id: string | null
          session_token_hint: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_completion_seconds?: number | null
          id?: string | null
          session_token_hint?: never
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_completion_seconds?: number | null
          id?: string | null
          session_token_hint?: never
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_api_usage_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_sensitive_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_hashed_session_token: {
        Args: { job_id_param: string; token_param: string }
        Returns: string
      }
      get_api_usage_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_requests_per_key: number
          endpoint: string
          time_period: string
          total_requests: number
          unique_keys: number
        }[]
      }
      get_job_status_public: {
        Args: { job_id_param: string }
        Returns: {
          completed_at: string
          created_at: string
          error_message: string
          estimated_completion_seconds: number
          job_id: string
          status: string
        }[]
      }
      get_job_status_secure: {
        Args: { job_id_param: string; session_token_param: string }
        Returns: {
          completed_at: string
          confidence_score: number
          created_at: string
          error_message: string
          estimated_completion_seconds: number
          job_id: string
          processing_status: string
          solutions: Json
          status: string
        }[]
      }
      get_job_status_secure_v2: {
        Args: { job_id_param: string; session_token_param: string }
        Returns: {
          completed_at: string
          created_at: string
          error_message: string
          estimated_completion_seconds: number
          job_id: string
          status: string
        }[]
      }
      get_job_status_with_token: {
        Args: { job_id_param: string; session_token_param: string }
        Returns: {
          completed_at: string
          confidence_score: number
          created_at: string
          error_message: string
          estimated_completion_seconds: number
          job_id: string
          processing_status: string
          solutions: Json
          status: string
        }[]
      }
      get_security_events_summary: {
        Args: { hours_back?: number }
        Returns: {
          created_at: string
          endpoint: string
          event_type: string
          id: string
          severity: string
          source_ip_status: string
          user_agent_status: string
        }[]
      }
      get_security_headers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_system_config: {
        Args: { config_key: string }
        Returns: Json
      }
      job_exists_secure: {
        Args: { job_id_param: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_api_key_hash?: string
          p_details?: Json
          p_endpoint?: string
          p_event_type: string
          p_severity?: string
          p_source_ip?: string
          p_user_agent?: string
        }
        Returns: string
      }
      revoke_session_token: {
        Args: { job_id_param: string; token_param: string }
        Returns: boolean
      }
      validate_hashed_session_token: {
        Args: { job_id_param: string; token_param: string }
        Returns: boolean
      }
      validate_session_token: {
        Args: { job_id: string; token: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
