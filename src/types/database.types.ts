export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      super_admins: {
        Row: {
          user_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          segment: string;
          status: string;
          plan: string;
          monthly_fee: number;
          owner_name: string | null;
          owner_email: string | null;
          owner_phone: string | null;
          address: string | null;
          logo_url: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          segment?: string;
          status?: string;
          plan?: string;
          monthly_fee?: number;
          owner_name?: string | null;
          owner_email?: string | null;
          owner_phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          segment?: string;
          status?: string;
          plan?: string;
          monthly_fee?: number;
          owner_name?: string | null;
          owner_email?: string | null;
          owner_phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tenant_members: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      services: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          category: string;
          duration_minutes: number;
          price: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          category?: string;
          duration_minutes?: number;
          price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          category?: string;
          duration_minutes?: number;
          price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      professionals: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          name: string;
          role: string | null;
          phone: string | null;
          email: string | null;
          color_class: string;
          photo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          name: string;
          role?: string | null;
          phone?: string | null;
          email?: string | null;
          color_class?: string;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          name?: string;
          role?: string | null;
          phone?: string | null;
          email?: string | null;
          color_class?: string;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professionals_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          photo_url: string | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
          photo_url?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          email?: string | null;
          photo_url?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          service_id: string | null;
          professional_id: string | null;
          client_name: string;
          client_phone: string;
          service_name: string;
          professional_name: string;
          scheduled_at: string;
          duration_minutes: number;
          status: string;
          price: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          service_id?: string | null;
          professional_id?: string | null;
          client_name: string;
          client_phone: string;
          service_name: string;
          professional_name: string;
          scheduled_at: string;
          duration_minutes?: number;
          status?: string;
          price?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          service_id?: string | null;
          professional_id?: string | null;
          client_name?: string;
          client_phone?: string;
          service_name?: string;
          professional_name?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: string;
          price?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      financial_transactions: {
        Row: {
          id: string;
          tenant_id: string;
          appointment_id: string | null;
          description: string;
          amount: number;
          type: string;
          category: string;
          payment_method: string | null;
          status: string;
          due_date: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          appointment_id?: string | null;
          description: string;
          amount: number;
          type: string;
          category: string;
          payment_method?: string | null;
          status?: string;
          due_date?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          appointment_id?: string | null;
          description?: string;
          amount?: number;
          type?: string;
          category?: string;
          payment_method?: string | null;
          status?: string;
          due_date?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stock_products: {
        Row: {
          id: string;
          tenant_id: string;
          sku: string | null;
          name: string;
          category: string;
          cost_price: number;
          sale_price: number;
          stock_quantity: number;
          min_stock_alert: number;
          unit: string;
          supplier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          sku?: string | null;
          name: string;
          category: string;
          cost_price?: number;
          sale_price?: number;
          stock_quantity?: number;
          min_stock_alert?: number;
          unit?: string;
          supplier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sku?: string | null;
          name?: string;
          category?: string;
          cost_price?: number;
          sale_price?: number;
          stock_quantity?: number;
          min_stock_alert?: number;
          unit?: string;
          supplier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          type: string;
          quantity: number;
          unit_cost: number | null;
          reason: string | null;
          operator_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id: string;
          type: string;
          quantity: number;
          unit_cost?: number | null;
          reason?: string | null;
          operator_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          type?: string;
          quantity?: number;
          unit_cost?: number | null;
          reason?: string | null;
          operator_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          category: string;
          price: number;
          interval: string;
          description: string | null;
          included_services: Json;
          max_sessions_per_month: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          category: string;
          price: number;
          interval?: string;
          description?: string | null;
          included_services?: Json;
          max_sessions_per_month?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          category?: string;
          price?: number;
          interval?: string;
          description?: string | null;
          included_services?: Json;
          max_sessions_per_month?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string;
          plan_id: string;
          status: string;
          payment_method: string | null;
          start_date: string;
          next_billing_date: string;
          sessions_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id: string;
          plan_id: string;
          status?: string;
          payment_method?: string | null;
          start_date?: string;
          next_billing_date: string;
          sessions_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string;
          plan_id?: string;
          status?: string;
          payment_method?: string | null;
          start_date?: string;
          next_billing_date?: string;
          sessions_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      loyalty_accounts: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string;
          points_balance: number;
          cashback_balance: number;
          total_earned_cashback: number;
          total_redeemed_cashback: number;
          last_movement_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id: string;
          points_balance?: number;
          cashback_balance?: number;
          total_earned_cashback?: number;
          total_redeemed_cashback?: number;
          last_movement_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string;
          points_balance?: number;
          cashback_balance?: number;
          total_earned_cashback?: number;
          total_redeemed_cashback?: number;
          last_movement_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      loyalty_transactions: {
        Row: {
          id: string;
          tenant_id: string;
          account_id: string;
          type: string;
          points: number;
          cashback_amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          account_id: string;
          type: string;
          points?: number;
          cashback_amount?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          account_id?: string;
          type?: string;
          points?: number;
          cashback_amount?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string | null;
          action: string;
          resource: string;
          resource_id: string | null;
          details: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          action: string;
          resource: string;
          resource_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          action?: string;
          resource?: string;
          resource_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_tenant_info: {
        Row: {
          id: string;
          name: string;
          slug: string;
          segment: string;
          logo_url: string | null;
          settings: Json;
        };
        Insert: {
          id?: string;
          name?: string;
          slug?: string;
          segment?: string;
          logo_url?: string | null;
          settings?: Json;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          segment?: string;
          logo_url?: string | null;
          settings?: Json;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_available_slots: {
        Args: {
          p_tenant_id: string;
          p_professional_id: string | null;
          p_date: string;
        };
        Returns: {
          scheduled_at: string;
          duration_minutes: number;
        }[];
      };
      is_super_admin: {
        Args: {
          check_user_id?: string;
        };
        Returns: boolean;
      };
      is_tenant_member: {
        Args: {
          target_tenant_id: string;
          check_user_id?: string;
        };
        Returns: boolean;
      };
      get_user_role_in_tenant: {
        Args: {
          target_tenant_id: string;
          check_user_id?: string;
        };
        Returns: string;
      };
    };
  };
}
