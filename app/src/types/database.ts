// Database types - will be generated from Supabase later
// For now, define core types manually based on SYSTEM_DESIGN.md

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          settings: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          settings?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          settings?: Json | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          name: string
          role: 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          name: string
          role?: 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          name?: string
          role?: 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          client_id: string | null
          job_number: string | null
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          status: 'pre_construction' | 'active' | 'on_hold' | 'completed' | 'warranty' | 'cancelled'
          contract_amount: number | null
          contract_type: 'fixed_price' | 'cost_plus' | 'time_materials' | null
          start_date: string | null
          target_completion: string | null
          actual_completion: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          client_id?: string | null
          job_number?: string | null
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          status?: 'pre_construction' | 'active' | 'on_hold' | 'completed' | 'warranty' | 'cancelled'
          contract_amount?: number | null
          contract_type?: 'fixed_price' | 'cost_plus' | 'time_materials' | null
          start_date?: string | null
          target_completion?: string | null
          actual_completion?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          client_id?: string | null
          job_number?: string | null
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          status?: 'pre_construction' | 'active' | 'on_hold' | 'completed' | 'warranty' | 'cancelled'
          contract_amount?: number | null
          contract_type?: 'fixed_price' | 'cost_plus' | 'time_materials' | null
          start_date?: string | null
          target_completion?: string | null
          actual_completion?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          company_id: string
          name: string
          trade: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          tax_id: string | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          trade?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          tax_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          trade?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          tax_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          job_id: string | null
          vendor_id: string | null
          invoice_number: string | null
          amount: number
          status: 'draft' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'approved' | 'in_draw' | 'paid' | 'denied'
          invoice_date: string | null
          due_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          job_id?: string | null
          vendor_id?: string | null
          invoice_number?: string | null
          amount: number
          status?: 'draft' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'approved' | 'in_draw' | 'paid' | 'denied'
          invoice_date?: string | null
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          job_id?: string | null
          vendor_id?: string | null
          invoice_number?: string | null
          amount?: number
          status?: 'draft' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'approved' | 'in_draw' | 'paid' | 'denied'
          invoice_date?: string | null
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      draws: {
        Row: {
          id: string
          company_id: string
          job_id: string
          draw_number: number
          amount: number
          status: 'draft' | 'pending_approval' | 'approved' | 'submitted' | 'funded' | 'rejected'
          submitted_date: string | null
          funded_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          job_id: string
          draw_number?: number
          amount: number
          status?: 'draft' | 'pending_approval' | 'approved' | 'submitted' | 'funded' | 'rejected'
          submitted_date?: string | null
          funded_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          job_id?: string
          draw_number?: number
          amount?: number
          status?: 'draft' | 'pending_approval' | 'approved' | 'submitted' | 'funded' | 'rejected'
          submitted_date?: string | null
          funded_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      job_status: 'pre_construction' | 'active' | 'on_hold' | 'completed' | 'warranty' | 'cancelled'
      user_role: 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
      contract_type: 'fixed_price' | 'cost_plus' | 'time_materials'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Job = Tables<'jobs'>
export type User = Tables<'users'>
export type Client = Tables<'clients'>
export type Vendor = Tables<'vendors'>
export type Company = Tables<'companies'>
export type Invoice = Tables<'invoices'>
export type Draw = Tables<'draws'>
