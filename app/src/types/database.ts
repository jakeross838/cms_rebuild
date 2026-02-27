export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  | Record<string, unknown>
  | unknown[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ab_experiments: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          feature_key: string | null
          id: string
          name: string
          results: Json
          sample_percentage: number
          start_date: string | null
          status: string
          updated_at: string
          variants: Json
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          feature_key?: string | null
          id?: string
          name: string
          results?: Json
          sample_percentage?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          variants?: Json
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          feature_key?: string | null
          id?: string
          name?: string
          results?: Json
          sample_percentage?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ab_experiments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_experiments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_connections: {
        Row: {
          access_token_encrypted: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          external_company_id: string | null
          external_company_name: string | null
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          settings: Json | null
          status: string
          sync_direction: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          external_company_id?: string | null
          external_company_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token_encrypted?: string | null
          settings?: Json | null
          status?: string
          sync_direction?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          external_company_id?: string | null
          external_company_name?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          settings?: Json | null
          status?: string
          sync_direction?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_feedback: {
        Row: {
          company_id: string
          corrected_value: string | null
          created_at: string
          created_by: string | null
          extraction_id: string | null
          feedback_type: string
          field_name: string
          id: string
          original_value: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          corrected_value?: string | null
          created_at?: string
          created_by?: string | null
          extraction_id?: string | null
          feedback_type: string
          field_name: string
          id?: string
          original_value?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          corrected_value?: string | null
          created_at?: string
          created_by?: string | null
          extraction_id?: string | null
          feedback_type?: string
          field_name?: string
          id?: string
          original_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "document_extractions"
            referencedColumns: ["id"]
          },
        ]
      }
      ap_bill_lines: {
        Row: {
          amount: number
          bill_id: string
          cost_code_id: string | null
          created_at: string | null
          description: string | null
          gl_account_id: string
          id: string
          job_id: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          cost_code_id?: string | null
          created_at?: string | null
          description?: string | null
          gl_account_id: string
          id?: string
          job_id?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          cost_code_id?: string | null
          created_at?: string | null
          description?: string | null
          gl_account_id?: string
          id?: string
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ap_bill_lines_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "ap_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_bill_lines_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_bill_lines_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ap_bills: {
        Row: {
          amount: number
          balance_due: number
          bill_date: string
          bill_number: string
          company_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string
          id: string
          job_id: string | null
          received_date: string | null
          status: string
          terms: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          balance_due: number
          bill_date: string
          bill_number: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          job_id?: string | null
          received_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          balance_due?: number
          bill_date?: string
          bill_number?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          job_id?: string | null
          received_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ap_bills_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_bills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_bills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ap_payment_applications: {
        Row: {
          amount: number
          bill_id: string
          created_at: string | null
          id: string
          payment_id: string
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string | null
          id?: string
          payment_id: string
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string | null
          id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ap_payment_applications_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "ap_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_payment_applications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "ap_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      ap_payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          memo: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          memo?: string | null
          payment_date: string
          payment_method: string
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          memo?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ap_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit_per_minute: number
          revoked_at: string | null
          revoked_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit_per_minute?: number
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit_per_minute?: number
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      api_metrics: {
        Row: {
          company_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          method: string
          response_time_ms: number
          status_code: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          method: string
          response_time_ms: number
          status_code: number
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_invoice_lines: {
        Row: {
          amount: number
          cost_code_id: string | null
          created_at: string | null
          description: string
          gl_account_id: string | null
          id: string
          invoice_id: string
          job_id: string | null
          quantity: number | null
          unit_price: number
        }
        Insert: {
          amount: number
          cost_code_id?: string | null
          created_at?: string | null
          description: string
          gl_account_id?: string | null
          id?: string
          invoice_id: string
          job_id?: string | null
          quantity?: number | null
          unit_price: number
        }
        Update: {
          amount?: number
          cost_code_id?: string | null
          created_at?: string | null
          description?: string
          gl_account_id?: string | null
          id?: string
          invoice_id?: string
          job_id?: string | null
          quantity?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ar_invoice_lines_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ar_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_invoice_lines_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_invoices: {
        Row: {
          amount: number
          balance_due: number
          client_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          job_id: string | null
          notes: string | null
          status: string
          terms: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          balance_due: number
          client_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          job_id?: string | null
          notes?: string | null
          status?: string
          terms?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          balance_due?: number
          client_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          job_id?: string | null
          notes?: string | null
          status?: string
          terms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_receipt_applications: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          receipt_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          receipt_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          receipt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_receipt_applications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ar_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_receipt_applications_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "ar_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_receipts: {
        Row: {
          amount: number
          client_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          memo: string | null
          payment_method: string
          receipt_date: string
          reference_number: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          memo?: string | null
          payment_method: string
          receipt_date: string
          reference_number?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          memo?: string | null
          payment_method?: string
          receipt_date?: string
          reference_number?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_receipts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_receipts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assemblies: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          parameter_unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parameter_unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parameter_unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assemblies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      assembly_items: {
        Row: {
          assembly_id: string
          company_id: string
          cost_code_id: string | null
          created_at: string
          description: string
          id: string
          qty_per_unit: number | null
          sort_order: number
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          assembly_id: string
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          description: string
          id?: string
          qty_per_unit?: number | null
          sort_order?: number
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          assembly_id?: string
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          description?: string
          id?: string
          qty_per_unit?: number | null
          sort_order?: number
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assembly_items_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          company_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_audit_log: {
        Row: {
          company_id: string
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_awards: {
        Row: {
          award_amount: number
          awarded_at: string
          awarded_by: string | null
          bid_package_id: string
          bid_response_id: string | null
          company_id: string
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          award_amount?: number
          awarded_at?: string
          awarded_by?: string | null
          bid_package_id: string
          bid_response_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          award_amount?: number
          awarded_at?: string
          awarded_by?: string | null
          bid_package_id?: string
          bid_response_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_awards_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_awards_bid_package_id_fkey"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_awards_bid_response_id_fkey"
            columns: ["bid_response_id"]
            isOneToOne: false
            referencedRelation: "bid_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_awards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_comparisons: {
        Row: {
          bid_package_id: string
          company_id: string
          comparison_data: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          bid_package_id: string
          company_id: string
          comparison_data?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          bid_package_id?: string
          company_id?: string
          comparison_data?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_comparisons_bid_package_id_fkey"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_comparisons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_comparisons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_invitations: {
        Row: {
          bid_package_id: string
          company_id: string
          created_at: string
          decline_reason: string | null
          id: string
          invited_at: string
          responded_at: string | null
          status: string
          updated_at: string
          vendor_id: string
          viewed_at: string | null
        }
        Insert: {
          bid_package_id: string
          company_id: string
          created_at?: string
          decline_reason?: string | null
          id?: string
          invited_at?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
          viewed_at?: string | null
        }
        Update: {
          bid_package_id?: string
          company_id?: string
          created_at?: string
          decline_reason?: string | null
          id?: string
          invited_at?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_invitations_bid_package_id_fkey"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_packages: {
        Row: {
          bid_due_date: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          documents: Json | null
          id: string
          job_id: string
          scope_of_work: string | null
          status: string
          title: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          bid_due_date?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          job_id: string
          scope_of_work?: string | null
          status?: string
          title: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          bid_due_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          job_id?: string
          scope_of_work?: string | null
          status?: string
          title?: string
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_packages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_responses: {
        Row: {
          attachments: Json | null
          bid_package_id: string
          breakdown: Json | null
          company_id: string
          created_at: string
          id: string
          invitation_id: string | null
          is_qualified: boolean
          notes: string | null
          submitted_at: string | null
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          attachments?: Json | null
          bid_package_id: string
          breakdown?: Json | null
          company_id: string
          created_at?: string
          id?: string
          invitation_id?: string | null
          is_qualified?: boolean
          notes?: string | null
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          attachments?: Json | null
          bid_package_id?: string
          breakdown?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          invitation_id?: string | null
          is_qualified?: boolean
          notes?: string | null
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_responses_bid_package_id_fkey"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_responses_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "bid_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          currency: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          stripe_event_id: string | null
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          currency?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          stripe_event_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          stripe_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string | null
          body_html: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_name?: string | null
          body_html?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_name?: string | null
          body_html?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      budget_change_logs: {
        Row: {
          budget_id: string
          changed_by: string | null
          created_at: string
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          budget_id: string
          changed_by?: string | null
          created_at?: string
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          budget_id?: string
          changed_by?: string | null
          created_at?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_change_logs_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_change_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_lines: {
        Row: {
          actual_amount: number
          budget_id: string
          committed_amount: number
          company_id: string
          cost_code_id: string | null
          created_at: string
          deleted_at: string | null
          description: string
          estimated_amount: number
          id: string
          job_id: string
          notes: string | null
          phase: string | null
          projected_amount: number
          sort_order: number
          updated_at: string
          variance_amount: number
        }
        Insert: {
          actual_amount?: number
          budget_id: string
          committed_amount?: number
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          estimated_amount?: number
          id?: string
          job_id: string
          notes?: string | null
          phase?: string | null
          projected_amount?: number
          sort_order?: number
          updated_at?: string
          variance_amount?: number
        }
        Update: {
          actual_amount?: number
          budget_id?: string
          committed_amount?: number
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          estimated_amount?: number
          id?: string
          job_id?: string
          notes?: string | null
          phase?: string | null
          projected_amount?: number
          sort_order?: number
          updated_at?: string
          variance_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_cost_code_id_fkey"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          job_id: string
          name: string
          notes: string | null
          status: string
          total_amount: number
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          job_id: string
          name: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          job_id?: string
          name?: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_branding: {
        Row: {
          accent_color: string
          company_id: string
          created_at: string
          custom_css: string | null
          favicon_url: string | null
          font_family: string
          header_style: string
          id: string
          login_background_url: string | null
          login_message: string | null
          logo_dark_url: string | null
          logo_url: string | null
          metadata: Json
          powered_by_visible: boolean
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          company_id: string
          created_at?: string
          custom_css?: string | null
          favicon_url?: string | null
          font_family?: string
          header_style?: string
          id?: string
          login_background_url?: string | null
          login_message?: string | null
          logo_dark_url?: string | null
          logo_url?: string | null
          metadata?: Json
          powered_by_visible?: boolean
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          company_id?: string
          created_at?: string
          custom_css?: string | null
          favicon_url?: string | null
          font_family?: string
          header_style?: string
          id?: string
          login_background_url?: string | null
          login_message?: string | null
          logo_dark_url?: string | null
          logo_url?: string | null
          metadata?: Json
          powered_by_visible?: boolean
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_branding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_content_pages: {
        Row: {
          company_id: string
          content_html: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_published: boolean
          page_type: string
          published_at: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          page_type?: string
          published_at?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content_html?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          page_type?: string
          published_at?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_content_pages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_custom_domains: {
        Row: {
          company_id: string
          created_at: string
          deleted_at: string | null
          domain: string
          id: string
          is_primary: boolean
          ssl_expires_at: string | null
          ssl_issued_at: string | null
          ssl_status: string | null
          status: string
          subdomain: string | null
          updated_at: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          deleted_at?: string | null
          domain: string
          id?: string
          is_primary?: boolean
          ssl_expires_at?: string | null
          ssl_issued_at?: string | null
          ssl_status?: string | null
          status?: string
          subdomain?: string | null
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          domain?: string
          id?: string
          is_primary?: boolean
          ssl_expires_at?: string | null
          ssl_issued_at?: string | null
          ssl_status?: string | null
          status?: string
          subdomain?: string | null
          updated_at?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_custom_domains_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_email_config: {
        Row: {
          company_id: string
          created_at: string
          email_footer_html: string | null
          email_header_html: string | null
          email_signature: string | null
          from_email: string | null
          from_name: string | null
          id: string
          is_verified: boolean
          reply_to_email: string | null
          smtp_encrypted_password: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string
          use_custom_smtp: boolean
          verified_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          email_footer_html?: string | null
          email_header_html?: string | null
          email_signature?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_verified?: boolean
          reply_to_email?: string | null
          smtp_encrypted_password?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
          use_custom_smtp?: boolean
          verified_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          email_footer_html?: string | null
          email_header_html?: string | null
          email_signature?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_verified?: boolean
          reply_to_email?: string | null
          smtp_encrypted_password?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
          use_custom_smtp?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_email_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_terminology: {
        Row: {
          company_id: string
          context: string | null
          created_at: string
          custom_term: string
          default_term: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          company_id: string
          context?: string | null
          created_at?: string
          custom_term: string
          default_term: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          company_id?: string
          context?: string | null
          created_at?: string
          custom_term?: string
          default_term?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_terminology_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          company_id: string
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          converted_at: string | null
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          opened_at: string | null
          sent_at: string | null
          status: string
          updated_at: string
                  deleted_at: string | null
}
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          company_id: string
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
                  deleted_at?: string | null
}
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          company_id?: string
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          challenge: string | null
          company_name: string | null
          company_size: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          industry_tags: string[] | null
          is_published: boolean | null
          metrics: Json | null
          photos: string[] | null
          published_at: string | null
          quote_author: string | null
          quote_text: string | null
          region_tags: string[] | null
          results: string | null
          slug: string
          solution: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          industry_tags?: string[] | null
          is_published?: boolean | null
          metrics?: Json | null
          photos?: string[] | null
          published_at?: string | null
          quote_author?: string | null
          quote_text?: string | null
          region_tags?: string[] | null
          results?: string | null
          slug: string
          solution?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          industry_tags?: string[] | null
          is_published?: boolean | null
          metrics?: Json | null
          photos?: string[] | null
          published_at?: string | null
          quote_author?: string | null
          quote_text?: string | null
          region_tags?: string[] | null
          results?: string | null
          slug?: string
          solution?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      change_order_history: {
        Row: {
          action: string
          change_order_id: string
          created_at: string
          details: Json | null
          id: string
          new_status: string | null
          performed_by: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          change_order_id: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          performed_by?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          change_order_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          performed_by?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_order_history_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      change_order_items: {
        Row: {
          amount: number | null
          change_order_id: string
          cost_code_id: string | null
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          markup_amount: number | null
          markup_pct: number | null
          quantity: number | null
          sort_order: number | null
          total: number | null
          unit_price: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          change_order_id: string
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          markup_amount?: number | null
          markup_pct?: number | null
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit_price?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          change_order_id?: string
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          markup_amount?: number | null
          markup_pct?: number | null
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit_price?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_order_items_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          amount: number | null
          approval_chain: Json | null
          approved_at: string | null
          approved_by: string | null
          budget_id: string | null
          change_type: string
          client_approved: boolean | null
          client_approved_at: string | null
          co_number: string
          company_id: string
          cost_impact: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          document_id: string | null
          id: string
          job_id: string
          requested_by_id: string | null
          requested_by_type: string | null
          schedule_impact_days: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          approval_chain?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string | null
          change_type?: string
          client_approved?: boolean | null
          client_approved_at?: string | null
          co_number: string
          company_id: string
          cost_impact?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          job_id: string
          requested_by_id?: string | null
          requested_by_type?: string | null
          schedule_impact_days?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          approval_chain?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string | null
          change_type?: string
          client_approved?: boolean | null
          client_approved_at?: string | null
          co_number?: string
          company_id?: string
          cost_impact?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          job_id?: string
          requested_by_id?: string | null
          requested_by_type?: string | null
          schedule_impact_days?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_approvals: {
        Row: {
          approval_type: string
          client_user_id: string
          comments: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          job_id: string
          reference_id: string
          requested_at: string | null
          requested_by: string | null
          responded_at: string | null
          signature_data: string | null
          signature_hash: string | null
          signature_ip: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approval_type: string
          client_user_id: string
          comments?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          job_id: string
          reference_id: string
          requested_at?: string | null
          requested_by?: string | null
          responded_at?: string | null
          signature_data?: string | null
          signature_hash?: string | null
          signature_ip?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approval_type?: string
          client_user_id?: string
          comments?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string
          reference_id?: string
          requested_at?: string | null
          requested_by?: string | null
          responded_at?: string | null
          signature_data?: string | null
          signature_hash?: string | null
          signature_ip?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_approvals_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          attachments: Json | null
          category: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          external_channel: string | null
          id: string
          is_external_log: boolean | null
          job_id: string
          message_text: string
          read_at: string | null
          sender_type: string
          sender_user_id: string
          status: string
          subject: string | null
          thread_id: string | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          category?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          external_channel?: string | null
          id?: string
          is_external_log?: boolean | null
          job_id: string
          message_text: string
          read_at?: string | null
          sender_type: string
          sender_user_id: string
          status?: string
          subject?: string | null
          thread_id?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          category?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          external_channel?: string | null
          id?: string
          is_external_log?: boolean | null
          job_id?: string
          message_text?: string
          read_at?: string | null
          sender_type?: string
          sender_user_id?: string
          status?: string
          subject?: string | null
          thread_id?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          amount: number
          client_user_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          draw_request_id: string | null
          id: string
          invoice_id: string | null
          job_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_number: string | null
          received_at: string | null
          received_by: string | null
          reference_number: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          client_user_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          draw_request_id?: string | null
          id?: string
          invoice_id?: string | null
          job_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number?: string | null
          received_at?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_user_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          draw_request_id?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number?: string | null
          received_at?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_payments_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          client_name: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          job_id: string
          message: string | null
          role: string | null
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          client_name?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          job_id: string
          message?: string | null
          role?: string | null
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          client_name?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          job_id?: string
          message?: string | null
          role?: string | null
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_invitations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_settings: {
        Row: {
          approval_config: Json | null
          branding: Json | null
          company_id: string
          created_at: string | null
          custom_domain: string | null
          email_templates: Json | null
          feature_flags: Json | null
          footer_text: string | null
          id: string
          notification_rules: Json | null
          privacy_policy_url: string | null
          terms_of_service_url: string | null
          updated_at: string | null
          visibility_rules: Json | null
        }
        Insert: {
          approval_config?: Json | null
          branding?: Json | null
          company_id: string
          created_at?: string | null
          custom_domain?: string | null
          email_templates?: Json | null
          feature_flags?: Json | null
          footer_text?: string | null
          id?: string
          notification_rules?: Json | null
          privacy_policy_url?: string | null
          terms_of_service_url?: string | null
          updated_at?: string | null
          visibility_rules?: Json | null
        }
        Update: {
          approval_config?: Json | null
          branding?: Json | null
          company_id?: string
          created_at?: string | null
          custom_domain?: string | null
          email_templates?: Json | null
          feature_flags?: Json | null
          footer_text?: string | null
          id?: string
          notification_rules?: Json | null
          privacy_policy_url?: string | null
          terms_of_service_url?: string | null
          updated_at?: string | null
          visibility_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reviews: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_email: string | null
          client_name: string
          company_id: string
          created_at: string
          created_by: string | null
          display_name: string | null
          id: string
          is_featured: boolean
          job_id: string | null
          published_at: string | null
          rating: number
          requested_at: string | null
          response_at: string | null
          response_by: string | null
          response_text: string | null
          review_text: string | null
          source: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_email?: string | null
          client_name: string
          company_id: string
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          id?: string
          is_featured?: boolean
          job_id?: string | null
          published_at?: string | null
          rating?: number
          requested_at?: string | null
          response_at?: string | null
          response_by?: string | null
          response_text?: string | null
          review_text?: string | null
          source?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_email?: string | null
          client_name?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          id?: string
          is_featured?: boolean
          job_id?: string | null
          published_at?: string | null
          rating?: number
          requested_at?: string | null
          response_at?: string | null
          response_by?: string | null
          response_text?: string | null
          review_text?: string | null
          source?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          communication_type: string
          company_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          job_id: string
          message_body: string
          notes: string | null
          priority: string
          recipient: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          communication_type?: string
          company_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          job_id: string
          message_body: string
          notes?: string | null
          priority?: string
          recipient?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          communication_type?: string
          company_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          job_id?: string
          message_body?: string
          notes?: string | null
          priority?: string
          recipient?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          permissions_mode: string | null
          phone: string | null
          primary_color: string | null
          settings: Json | null
          state: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          permissions_mode?: string | null
          phone?: string | null
          primary_color?: string | null
          settings?: Json | null
          state?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          permissions_mode?: string | null
          phone?: string | null
          primary_color?: string | null
          settings?: Json | null
          state?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      company_document_settings: {
        Row: {
          blocked_extensions: string[] | null
          company_id: string
          created_at: string | null
          folder_templates: Json | null
          id: string
          max_file_size_mb: number | null
          retention_policy: Json | null
          updated_at: string | null
        }
        Insert: {
          blocked_extensions?: string[] | null
          company_id: string
          created_at?: string | null
          folder_templates?: Json | null
          id?: string
          max_file_size_mb?: number | null
          retention_policy?: Json | null
          updated_at?: string | null
        }
        Update: {
          blocked_extensions?: string[] | null
          company_id?: string
          created_at?: string | null
          folder_templates?: Json | null
          id?: string
          max_file_size_mb?: number | null
          retention_policy?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_document_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_notification_config: {
        Row: {
          channels: string[] | null
          company_id: string
          created_at: string | null
          enabled: boolean | null
          event_type_id: string
          id: string
          roles: string[] | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          channels?: string[] | null
          company_id: string
          created_at?: string | null
          enabled?: boolean | null
          event_type_id: string
          id?: string
          roles?: string[] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          channels?: string[] | null
          company_id?: string
          created_at?: string | null
          enabled?: boolean | null
          event_type_id?: string
          id?: string
          roles?: string[] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_notification_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_notification_config_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "notification_event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      company_storage_usage: {
        Row: {
          company_id: string
          file_count: number | null
          id: string
          last_calculated_at: string | null
          quota_bytes: number
          total_bytes: number | null
        }
        Insert: {
          company_id: string
          file_count?: number | null
          id?: string
          last_calculated_at?: string | null
          quota_bytes?: number
          total_bytes?: number | null
        }
        Update: {
          company_id?: string
          file_count?: number | null
          id?: string
          last_calculated_at?: string | null
          quota_bytes?: number
          total_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_storage_usage_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          billing_cycle: string
          cancel_reason: string | null
          cancelled_at: string | null
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          grandfathered_plan: string | null
          id: string
          metadata: Json
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          grandfathered_plan?: string | null
          id?: string
          metadata?: Json
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          grandfathered_plan?: string | null
          id?: string
          metadata?: Json
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tag_library: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          id: string
          tag: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          tag: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tag_library_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      config_versions: {
        Row: {
          change_summary: string | null
          changed_at: string | null
          changed_by: string | null
          company_id: string
          id: string
          section: string
          snapshot_data: Json
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          company_id: string
          id?: string
          section: string
          snapshot_data: Json
          version_number: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          company_id?: string
          id?: string
          section?: string
          snapshot_data?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_clauses: {
        Row: {
          category: string | null
          company_id: string
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_clauses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signers: {
        Row: {
          company_id: string
          contract_id: string
          created_at: string
          decline_reason: string | null
          declined_at: string | null
          deleted_at: string | null
          email: string
          id: string
          ip_address: string | null
          name: string
          role: string
          sign_order: number | null
          signed_at: string | null
          status: string
          updated_at: string
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          company_id: string
          contract_id: string
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          name: string
          role?: string
          sign_order?: number | null
          signed_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          company_id?: string
          contract_id?: string
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          name?: string
          role?: string
          sign_order?: number | null
          signed_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signers_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          clauses: Json | null
          company_id: string
          content: string | null
          contract_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          clauses?: Json | null
          company_id: string
          content?: string | null
          contract_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          clauses?: Json | null
          company_id?: string
          content?: string | null
          contract_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          change_summary: string | null
          company_id: string
          content: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          snapshot_json: Json | null
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          company_id: string
          content?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot_json?: Json | null
          version_number: number
        }
        Update: {
          change_summary?: string | null
          company_id?: string
          content?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot_json?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          client_id: string | null
          company_id: string
          content: string | null
          contract_number: string
          contract_type: string
          contract_value: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          executed_at: string | null
          expires_at: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          retention_pct: number | null
          start_date: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          client_id?: string | null
          company_id: string
          content?: string | null
          contract_number: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          retention_pct?: number | null
          start_date?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string
          content?: string | null
          contract_number?: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          retention_pct?: number | null
          start_date?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_codes: {
        Row: {
          category: string | null
          code: string
          company_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          division: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          subdivision: string | null
          trade: string | null
        }
        Insert: {
          category?: string | null
          code: string
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          division: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          subdivision?: string | null
          trade?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          division?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          subdivision?: string | null
          trade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_codes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_codes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_transactions: {
        Row: {
          amount: number
          budget_line_id: string | null
          company_id: string
          cost_code_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          job_id: string
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
          transaction_type: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          budget_line_id?: string | null
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          transaction_type: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          budget_line_id?: string | null
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          transaction_type?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_transactions_budget_line_id_fkey"
            columns: ["budget_line_id"]
            isOneToOne: false
            referencedRelation: "budget_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_transactions_cost_code_id_fkey"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          company_id: string
          created_at: string | null
          default_value: Json | null
          deleted_at: string | null
          description: string | null
          editable_by_roles: string[] | null
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          options: Json | null
          placeholder: string | null
          section: string | null
          show_conditions: Json | null
          show_in_list_view: boolean | null
          show_in_portal: boolean | null
          sort_order: number | null
          updated_at: string | null
          validation: Json | null
          visible_to_roles: string[] | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          default_value?: Json | null
          deleted_at?: string | null
          description?: string | null
          editable_by_roles?: string[] | null
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          placeholder?: string | null
          section?: string | null
          show_conditions?: Json | null
          show_in_list_view?: boolean | null
          show_in_portal?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          validation?: Json | null
          visible_to_roles?: string[] | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          default_value?: Json | null
          deleted_at?: string | null
          description?: string | null
          editable_by_roles?: string[] | null
          entity_type?: string
          field_key?: string
          field_label?: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          placeholder?: string | null
          section?: string | null
          show_conditions?: Json | null
          show_in_list_view?: boolean | null
          show_in_portal?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          validation?: Json | null
          visible_to_roles?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          company_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          field_definition_id: string
          id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          company_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_definition_id: string
          id?: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          company_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_definition_id?: string
          id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_field_definition_id_fkey"
            columns: ["field_definition_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_report_widgets: {
        Row: {
          company_id: string
          configuration: Json
          created_at: string
          data_source: string
          deleted_at: string | null
          filters: Json
          id: string
          report_id: string
          sort_order: number
          title: string | null
          updated_at: string
          widget_type: string
        }
        Insert: {
          company_id: string
          configuration?: Json
          created_at?: string
          data_source?: string
          deleted_at?: string | null
          filters?: Json
          id?: string
          report_id: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          widget_type?: string
        }
        Update: {
          company_id?: string
          configuration?: Json
          created_at?: string
          data_source?: string
          deleted_at?: string | null
          filters?: Json
          id?: string
          report_id?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_report_widgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_report_widgets_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_reports: {
        Row: {
          audience: string
          calculated_fields: Json
          company_id: string
          created_at: string
          created_by: string | null
          data_sources: Json
          deleted_at: string | null
          description: string | null
          fields: Json
          filters: Json
          grouping: Json
          id: string
          is_template: boolean
          name: string
          refresh_frequency: string
          report_type: string
          shared_with: Json
          sorting: Json
          status: string
          updated_at: string
          visualization_type: string
        }
        Insert: {
          audience?: string
          calculated_fields?: Json
          company_id: string
          created_at?: string
          created_by?: string | null
          data_sources?: Json
          deleted_at?: string | null
          description?: string | null
          fields?: Json
          filters?: Json
          grouping?: Json
          id?: string
          is_template?: boolean
          name: string
          refresh_frequency?: string
          report_type?: string
          shared_with?: Json
          sorting?: Json
          status?: string
          updated_at?: string
          visualization_type?: string
        }
        Update: {
          audience?: string
          calculated_fields?: Json
          company_id?: string
          created_at?: string
          created_by?: string | null
          data_sources?: Json
          deleted_at?: string | null
          description?: string | null
          fields?: Json
          filters?: Json
          grouping?: Json
          id?: string
          is_template?: boolean
          name?: string
          refresh_frequency?: string
          report_type?: string
          shared_with?: Json
          sorting?: Json
          status?: string
          updated_at?: string
          visualization_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_log_entries: {
        Row: {
          created_at: string | null
          created_by: string
          daily_log_id: string
          description: string
          entry_type: string
          id: string
          sort_order: number | null
          time_logged: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          daily_log_id: string
          description: string
          entry_type: string
          id?: string
          sort_order?: number | null
          time_logged?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          daily_log_id?: string
          description?: string
          entry_type?: string
          id?: string
          sort_order?: number | null
          time_logged?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_log_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_entries_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_log_labor: {
        Row: {
          company_id: string
          created_at: string | null
          daily_log_id: string
          headcount: number | null
          hours_worked: number
          id: string
          overtime_hours: number | null
          trade: string | null
          worker_name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          daily_log_id: string
          headcount?: number | null
          hours_worked?: number
          id?: string
          overtime_hours?: number | null
          trade?: string | null
          worker_name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          daily_log_id?: string
          headcount?: number | null
          hours_worked?: number
          id?: string
          overtime_hours?: number | null
          trade?: string | null
          worker_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_log_labor_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_labor_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_log_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          created_by: string
          daily_log_id: string
          id: string
          location_description: string | null
          storage_path: string
          taken_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          created_by: string
          daily_log_id: string
          id?: string
          location_description?: string | null
          storage_path: string
          taken_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          created_by?: string
          daily_log_id?: string
          id?: string
          location_description?: string | null
          storage_path?: string
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_log_photos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_photos_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          conditions: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          high_temp: number | null
          id: string
          job_id: string
          log_date: string
          low_temp: number | null
          notes: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          weather_summary: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          conditions?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          high_temp?: number | null
          id?: string
          job_id: string
          log_date: string
          low_temp?: number | null
          notes?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          weather_summary?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          conditions?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          high_temp?: number | null
          id?: string
          job_id?: string
          log_date?: string
          low_temp?: number | null
          notes?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          weather_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          company_id: string
          configuration: Json
          created_at: string
          dashboard_id: string
          data_source: string
          deleted_at: string | null
          height: number
          id: string
          position_x: number
          position_y: number
          refresh_interval_seconds: number
          report_id: string | null
          title: string | null
          updated_at: string
          widget_type: string
          width: number
        }
        Insert: {
          company_id: string
          configuration?: Json
          created_at?: string
          dashboard_id: string
          data_source?: string
          deleted_at?: string | null
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          refresh_interval_seconds?: number
          report_id?: string | null
          title?: string | null
          updated_at?: string
          widget_type?: string
          width?: number
        }
        Update: {
          company_id?: string
          configuration?: Json
          created_at?: string
          dashboard_id?: string
          data_source?: string
          deleted_at?: string | null
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          refresh_interval_seconds?: number
          report_id?: string | null
          title?: string | null
          updated_at?: string
          widget_type?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "report_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      default_terminology: {
        Row: {
          default_plural: string
          default_singular: string
          description: string | null
          term_key: string
        }
        Insert: {
          default_plural: string
          default_singular: string
          description?: string | null
          term_key: string
        }
        Update: {
          default_plural?: string
          default_singular?: string
          description?: string | null
          term_key?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          head_user_id: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_releases: {
        Row: {
          affected_services: Json
          changelog: string | null
          created_at: string
          deployed_at: string | null
          deployed_by: string | null
          description: string | null
          id: string
          release_type: string
          rollback_reason: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          affected_services?: Json
          changelog?: string | null
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          description?: string | null
          id?: string
          release_type?: string
          rollback_reason?: string | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          affected_services?: Json
          changelog?: string | null
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          description?: string | null
          id?: string
          release_type?: string
          rollback_reason?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_releases_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_classifications: {
        Row: {
          classified_type: string
          company_id: string
          confidence_score: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_id: string
          id: string
          metadata: Json | null
          model_version: string | null
          updated_at: string
        }
        Insert: {
          classified_type: string
          company_id: string
          confidence_score: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id: string
          id?: string
          metadata?: Json | null
          model_version?: string | null
          updated_at?: string
        }
        Update: {
          classified_type?: string
          company_id?: string
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string
          id?: string
          metadata?: Json | null
          model_version?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_classifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_classifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_expirations: {
        Row: {
          alert_14_sent: boolean | null
          alert_30_sent: boolean | null
          alert_60_sent: boolean | null
          alert_90_sent: boolean | null
          alert_expired_sent: boolean | null
          company_id: string
          created_at: string | null
          document_id: string
          entity_id: string | null
          entity_type: string | null
          expiration_date: string
          id: string
          updated_at: string | null
        }
        Insert: {
          alert_14_sent?: boolean | null
          alert_30_sent?: boolean | null
          alert_60_sent?: boolean | null
          alert_90_sent?: boolean | null
          alert_expired_sent?: boolean | null
          company_id: string
          created_at?: string | null
          document_id: string
          entity_id?: string | null
          entity_type?: string | null
          expiration_date: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          alert_14_sent?: boolean | null
          alert_30_sent?: boolean | null
          alert_60_sent?: boolean | null
          alert_90_sent?: boolean | null
          alert_expired_sent?: boolean | null
          company_id?: string
          created_at?: string | null
          document_id?: string
          entity_id?: string | null
          entity_type?: string | null
          expiration_date?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_expirations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_expirations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_extractions: {
        Row: {
          classification_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_id: string
          extracted_data: Json
          extraction_template_id: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          classification_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id: string
          extracted_data?: Json
          extraction_template_id?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          classification_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string
          extracted_data?: Json
          extraction_template_id?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_extractions_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "document_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_extraction_template_id_fkey"
            columns: ["extraction_template_id"]
            isOneToOne: false
            referencedRelation: "extraction_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          job_id: string | null
          name: string
          parent_folder_id: string | null
          path: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_id?: string | null
          name: string
          parent_folder_id?: string | null
          path: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_id?: string | null
          name?: string
          parent_folder_id?: string | null
          path?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_queue: {
        Row: {
          attempts: number
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          document_id: string
          error_message: string | null
          id: string
          max_attempts: number
          priority: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_id: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          priority?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          priority?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_processing_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_search_content: {
        Row: {
          created_at: string | null
          document_id: string
          extracted_text: string | null
          extraction_method: string | null
          extraction_status: string | null
          id: string
          tsv_content: unknown
          updated_at: string | null
          version_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          extracted_text?: string | null
          extraction_method?: string | null
          extraction_status?: string | null
          id?: string
          tsv_content?: unknown
          updated_at?: string | null
          version_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          extracted_text?: string | null
          extraction_method?: string | null
          extraction_status?: string | null
          id?: string
          tsv_content?: unknown
          updated_at?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_search_content_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_search_content_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          tag: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          tag: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_notes: string | null
          created_at: string | null
          document_id: string
          file_size: number
          id: string
          mime_type: string | null
          storage_path: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          created_at?: string | null
          document_id: string
          file_size: number
          id?: string
          mime_type?: string | null
          storage_path: string
          uploaded_by: string
          version_number: number
        }
        Update: {
          change_notes?: string | null
          created_at?: string | null
          document_id?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          storage_path?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_classification: string | null
          ai_confidence: number | null
          company_id: string
          created_at: string | null
          current_version_id: string | null
          deleted_at: string | null
          document_type: string | null
          file_size: number
          filename: string
          folder_id: string | null
          id: string
          job_id: string | null
          mime_type: string
          status: string | null
          storage_path: string
          thumbnail_path: string | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          ai_classification?: string | null
          ai_confidence?: number | null
          company_id: string
          created_at?: string | null
          current_version_id?: string | null
          deleted_at?: string | null
          document_type?: string | null
          file_size: number
          filename: string
          folder_id?: string | null
          id?: string
          job_id?: string | null
          mime_type: string
          status?: string | null
          storage_path: string
          thumbnail_path?: string | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          ai_classification?: string | null
          ai_confidence?: number | null
          company_id?: string
          created_at?: string | null
          current_version_id?: string | null
          deleted_at?: string | null
          document_type?: string | null
          file_size?: number
          filename?: string
          folder_id?: string | null
          id?: string
          job_id?: string | null
          mime_type?: string
          status?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_request_history: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          draw_request_id: string
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          draw_request_id: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          draw_request_id?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_request_history_draw_request_id_fkey"
            columns: ["draw_request_id"]
            isOneToOne: false
            referencedRelation: "draw_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_request_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_request_lines: {
        Row: {
          balance_to_finish: number
          cost_code_id: string | null
          created_at: string
          current_work: number
          description: string
          draw_request_id: string
          id: string
          materials_stored: number
          pct_complete: number
          previous_applications: number
          retainage: number
          scheduled_value: number
          sort_order: number
          total_completed: number
          updated_at: string
        }
        Insert: {
          balance_to_finish?: number
          cost_code_id?: string | null
          created_at?: string
          current_work?: number
          description?: string
          draw_request_id: string
          id?: string
          materials_stored?: number
          pct_complete?: number
          previous_applications?: number
          retainage?: number
          scheduled_value?: number
          sort_order?: number
          total_completed?: number
          updated_at?: string
        }
        Update: {
          balance_to_finish?: number
          cost_code_id?: string | null
          created_at?: string
          current_work?: number
          description?: string
          draw_request_id?: string
          id?: string
          materials_stored?: number
          pct_complete?: number
          previous_applications?: number
          retainage?: number
          scheduled_value?: number
          sort_order?: number
          total_completed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_request_lines_cost_code_id_fkey"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_request_lines_draw_request_id_fkey"
            columns: ["draw_request_id"]
            isOneToOne: false
            referencedRelation: "draw_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_requests: {
        Row: {
          application_date: string
          approved_at: string | null
          approved_by: string | null
          balance_to_finish: number
          company_id: string
          contract_amount: number
          created_at: string
          current_due: number
          deleted_at: string | null
          draw_number: number
          id: string
          job_id: string
          lender_reference: string | null
          less_previous: number
          notes: string | null
          period_to: string
          retainage_amount: number
          retainage_pct: number
          status: string
          submitted_at: string | null
          submitted_by: string | null
          total_completed: number
          total_earned: number
          updated_at: string
        }
        Insert: {
          application_date: string
          approved_at?: string | null
          approved_by?: string | null
          balance_to_finish?: number
          company_id: string
          contract_amount?: number
          created_at?: string
          current_due?: number
          deleted_at?: string | null
          draw_number: number
          id?: string
          job_id: string
          lender_reference?: string | null
          less_previous?: number
          notes?: string | null
          period_to: string
          retainage_amount?: number
          retainage_pct?: number
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          total_completed?: number
          total_earned?: number
          updated_at?: string
        }
        Update: {
          application_date?: string
          approved_at?: string | null
          approved_by?: string | null
          balance_to_finish?: number
          company_id?: string
          contract_amount?: number
          created_at?: string
          current_due?: number
          deleted_at?: string | null
          draw_number?: number
          id?: string
          job_id?: string
          lender_reference?: string | null
          less_previous?: number
          notes?: string | null
          period_to?: string
          retainage_amount?: number
          retainage_pct?: number
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          total_completed?: number
          total_earned?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draw_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_requests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_requests_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      draws: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          draw_number: number | null
          funded_date: string | null
          id: string
          job_id: string
          notes: string | null
          status: Database["public"]["Enums"]["draw_status"] | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          draw_number?: number | null
          funded_date?: string | null
          id?: string
          job_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["draw_status"] | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          draw_number?: number | null
          funded_date?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["draw_status"] | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draws_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_certifications: {
        Row: {
          certification_name: string
          certification_number: string | null
          certification_type: string | null
          company_id: string
          created_at: string
          created_by: string | null
          document_url: string | null
          employee_id: string
          expiration_date: string | null
          id: string
          issued_date: string | null
          issuing_authority: string | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          certification_name: string
          certification_number?: string | null
          certification_type?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          employee_id: string
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          certification_name?: string
          certification_number?: string | null
          certification_type?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          employee_id?: string
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          document_type: string
          employee_id: string
          file_name: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          document_type?: string
          employee_id: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          document_type?: string
          employee_id?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          base_wage: number | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string
          employment_status: string
          employment_type: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          notes: string | null
          pay_type: string | null
          phone: string | null
          position_id: string | null
          termination_date: string | null
          updated_at: string
          user_id: string | null
          workers_comp_class: string | null
        }
        Insert: {
          address?: string | null
          base_wage?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number: string
          employment_status?: string
          employment_type?: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          notes?: string | null
          pay_type?: string | null
          phone?: string | null
          position_id?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          workers_comp_class?: string | null
        }
        Update: {
          address?: string | null
          base_wage?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string
          employment_status?: string
          employment_type?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          notes?: string | null
          pay_type?: string | null
          phone?: string | null
          position_id?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          workers_comp_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          current_value: number | null
          daily_rate: number | null
          deleted_at: string | null
          description: string | null
          equipment_type: string
          id: string
          location: string | null
          make: string | null
          model: string | null
          name: string
          notes: string | null
          ownership_type: string
          photo_urls: Json | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: string
          updated_at: string
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          daily_rate?: number | null
          deleted_at?: string | null
          description?: string | null
          equipment_type?: string
          id?: string
          location?: string | null
          make?: string | null
          model?: string | null
          name: string
          notes?: string | null
          ownership_type?: string
          photo_urls?: Json | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          daily_rate?: number | null
          deleted_at?: string | null
          description?: string | null
          equipment_type?: string
          id?: string
          location?: string | null
          make?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          ownership_type?: string
          photo_urls?: Json | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      equipment_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          end_date: string | null
          equipment_id: string
          hours_used: number | null
          id: string
          job_id: string | null
          notes: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          equipment_id: string
          hours_used?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          equipment_id?: string
          hours_used?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_costs: {
        Row: {
          amount: number
          company_id: string
          cost_date: string
          cost_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          equipment_id: string
          id: string
          job_id: string | null
          notes: string | null
          receipt_url: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          company_id: string
          cost_date?: string
          cost_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          equipment_id: string
          id?: string
          job_id?: string | null
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          cost_date?: string
          cost_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          equipment_id?: string
          id?: string
          job_id?: string | null
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_costs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_inspections: {
        Row: {
          checklist: Json | null
          company_id: string
          corrective_action: string | null
          created_at: string
          created_by: string | null
          deficiencies: string | null
          deleted_at: string | null
          equipment_id: string
          id: string
          inspection_date: string
          inspection_type: string
          inspector_id: string | null
          notes: string | null
          result: string
          updated_at: string
        }
        Insert: {
          checklist?: Json | null
          company_id: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          deficiencies?: string | null
          deleted_at?: string | null
          equipment_id: string
          id?: string
          inspection_date?: string
          inspection_type?: string
          inspector_id?: string | null
          notes?: string | null
          result?: string
          updated_at?: string
        }
        Update: {
          checklist?: Json | null
          company_id?: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          deficiencies?: string | null
          deleted_at?: string | null
          equipment_id?: string
          id?: string
          inspection_date?: string
          inspection_type?: string
          inspector_id?: string | null
          notes?: string | null
          result?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_inspections_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance: {
        Row: {
          company_id: string
          completed_date: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          equipment_id: string
          id: string
          labor_cost: number | null
          maintenance_type: string
          notes: string | null
          parts_cost: number | null
          performed_by: string | null
          scheduled_date: string | null
          service_provider: string | null
          status: string
          title: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          equipment_id: string
          id?: string
          labor_cost?: number | null
          maintenance_type?: string
          notes?: string | null
          parts_cost?: number | null
          performed_by?: string | null
          scheduled_date?: string | null
          service_provider?: string | null
          status?: string
          title: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          equipment_id?: string
          id?: string
          labor_cost?: number | null
          maintenance_type?: string
          notes?: string | null
          parts_cost?: number | null
          performed_by?: string | null
          scheduled_date?: string | null
          service_provider?: string | null
          status?: string
          title?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          ai_confidence: string | null
          ai_suggested: boolean | null
          alt_group: string | null
          assembly_id: string | null
          company_id: string
          cost_code_id: string | null
          created_at: string
          description: string
          estimate_id: string
          id: string
          item_type: string
          markup_pct: number | null
          notes: string | null
          quantity: number | null
          section_id: string | null
          sort_order: number
          total: number | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          ai_confidence?: string | null
          ai_suggested?: boolean | null
          alt_group?: string | null
          assembly_id?: string | null
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          item_type?: string
          markup_pct?: number | null
          notes?: string | null
          quantity?: number | null
          section_id?: string | null
          sort_order?: number
          total?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          ai_confidence?: string | null
          ai_suggested?: boolean | null
          alt_group?: string | null
          assembly_id?: string | null
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          description?: string
          estimate_id?: string
          id?: string
          item_type?: string
          markup_pct?: number | null
          notes?: string | null
          quantity?: number | null
          section_id?: string | null
          sort_order?: number
          total?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "estimate_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_sections: {
        Row: {
          company_id: string
          created_at: string
          estimate_id: string
          id: string
          name: string
          parent_id: string | null
          sort_order: number
          subtotal: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          estimate_id: string
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number
          subtotal?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          estimate_id?: string
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
          subtotal?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_sections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_sections_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_sections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "estimate_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_versions: {
        Row: {
          change_summary: string | null
          company_id: string
          created_at: string
          created_by: string | null
          estimate_id: string
          id: string
          snapshot_json: Json
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          estimate_id: string
          id?: string
          snapshot_json?: Json
          version_number: number
        }
        Update: {
          change_summary?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          estimate_id?: string
          id?: string
          snapshot_json?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_versions_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          contract_type: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          estimate_type: string
          id: string
          job_id: string | null
          markup_pct: number | null
          markup_type: string | null
          name: string
          notes: string | null
          overhead_pct: number | null
          parent_version_id: string | null
          profit_pct: number | null
          status: string
          subtotal: number | null
          total: number | null
          updated_at: string
          valid_until: string | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          estimate_type?: string
          id?: string
          job_id?: string | null
          markup_pct?: number | null
          markup_type?: string | null
          name: string
          notes?: string | null
          overhead_pct?: number | null
          parent_version_id?: string | null
          profit_pct?: number | null
          status?: string
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          estimate_type?: string
          id?: string
          job_id?: string | null
          markup_pct?: number | null
          markup_type?: string | null
          name?: string
          notes?: string | null
          overhead_pct?: number | null
          parent_version_id?: string | null
          profit_pct?: number | null
          status?: string
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimates_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          extraction_id: string
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          extraction_id: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          extraction_id?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_audit_log_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "invoice_extractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extraction_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_field_mappings: {
        Row: {
          company_id: string
          created_at: string
          data_type: string
          default_value: string | null
          extraction_path: string
          field_name: string
          id: string
          is_required: boolean
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          data_type?: string
          default_value?: string | null
          extraction_path: string
          field_name: string
          id?: string
          is_required?: boolean
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          data_type?: string
          default_value?: string | null
          extraction_path?: string
          field_name?: string
          id?: string
          is_required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_field_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_rules: {
        Row: {
          actions: Json
          company_id: string
          conditions: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          priority: number
          rule_type: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actions?: Json
          company_id: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_type: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actions?: Json
          company_id?: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_type?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extraction_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_templates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_type: string
          field_definitions: Json
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type: string
          field_definitions?: Json
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type?: string
          field_definitions?: Json
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extraction_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          company_id: string
          created_at: string | null
          enabled: boolean | null
          enabled_at: string | null
          enabled_by: string | null
          flag_key: string
          id: string
          metadata: Json | null
          plan_required: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          flag_key: string
          id?: string
          metadata?: Json | null
          plan_required?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          flag_key?: string
          id?: string
          metadata?: Json | null
          plan_required?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_enabled_by_fkey"
            columns: ["enabled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_request_votes: {
        Row: {
          company_id: string
          created_at: string
          feature_request_id: string
          id: string
          user_id: string
                  deleted_at: string | null
}
        Insert: {
          company_id: string
          created_at?: string
          feature_request_id: string
          id?: string
          user_id: string
                  deleted_at?: string | null
}
        Update: {
          company_id?: string
          created_at?: string
          feature_request_id?: string
          id?: string
          user_id?: string
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "feature_request_votes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_request_votes_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          category: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
          vote_count: number
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          vote_count?: number
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "feature_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage_events: {
        Row: {
          company_id: string
          created_at: string
          event_type: string
          feature_key: string
          id: string
          metadata: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          event_type?: string
          feature_key: string
          id?: string
          metadata?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          event_type?: string
          feature_key?: string
          id?: string
          metadata?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          company_id: string
          created_at: string | null
          fiscal_quarter: number | null
          fiscal_year: number
          id: string
          period_end: string
          period_name: string
          period_start: string
          status: string
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          company_id: string
          created_at?: string | null
          fiscal_quarter?: number | null
          fiscal_year: number
          id?: string
          period_end: string
          period_name: string
          period_start: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          company_id?: string
          created_at?: string | null
          fiscal_quarter?: number | null
          fiscal_year?: number
          id?: string
          period_end?: string
          period_name?: string
          period_start?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_periods_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_accounts: {
        Row: {
          account_number: string
          account_type: string
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          normal_balance: string
          parent_account_id: string | null
          sub_type: string | null
          updated_at: string | null
        }
        Insert: {
          account_number: string
          account_type: string
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          normal_balance: string
          parent_account_id?: string | null
          sub_type?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string
          account_type?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          normal_balance?: string
          parent_account_id?: string | null
          sub_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_journal_entries: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          entry_date: string
          id: string
          memo: string | null
          posted_at: string | null
          posted_by: string | null
          reference_number: string | null
          source_id: string | null
          source_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          entry_date: string
          id?: string
          memo?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          entry_date?: string
          id?: string
          memo?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_journal_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_entries_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_journal_lines: {
        Row: {
          account_id: string
          client_id: string | null
          cost_code_id: string | null
          created_at: string | null
          credit_amount: number | null
          debit_amount: number | null
          id: string
          job_id: string | null
          journal_entry_id: string
          memo: string | null
          vendor_id: string | null
        }
        Insert: {
          account_id: string
          client_id?: string | null
          cost_code_id?: string | null
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          id?: string
          job_id?: string | null
          journal_entry_id: string
          memo?: string | null
          vendor_id?: string | null
        }
        Update: {
          account_id?: string
          client_id?: string | null
          cost_code_id?: string | null
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          id?: string
          job_id?: string | null
          journal_entry_id?: string
          memo?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_lines_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_lines_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "gl_journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_lines_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_results: {
        Row: {
          company_id: string
          conditions_to_satisfy: string | null
          created_at: string
          deficiencies: Json
          id: string
          inspection_id: string
          inspector_comments: string | null
          is_first_time_pass: boolean | null
          photos: Json
          recorded_at: string
          recorded_by: string | null
          responsible_vendor_id: string | null
          result: string
          result_notes: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          conditions_to_satisfy?: string | null
          created_at?: string
          deficiencies?: Json
          id?: string
          inspection_id: string
          inspector_comments?: string | null
          is_first_time_pass?: boolean | null
          photos?: Json
          recorded_at?: string
          recorded_by?: string | null
          responsible_vendor_id?: string | null
          result: string
          result_notes?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          conditions_to_satisfy?: string | null
          created_at?: string
          deficiencies?: Json
          id?: string
          inspection_id?: string
          inspector_comments?: string | null
          is_first_time_pass?: boolean | null
          photos?: Json
          recorded_at?: string
          recorded_by?: string | null
          responsible_vendor_id?: string | null
          result?: string
          result_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_results_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "permit_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_installs: {
        Row: {
          company_id: string
          configuration: Json
          created_at: string
          id: string
          installed_at: string
          installed_by: string | null
          listing_id: string
          status: string
          uninstalled_at: string | null
          uninstalled_by: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          configuration?: Json
          created_at?: string
          id?: string
          installed_at?: string
          installed_by?: string | null
          listing_id: string
          status?: string
          uninstalled_at?: string | null
          uninstalled_by?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          configuration?: Json
          created_at?: string
          id?: string
          installed_at?: string
          installed_by?: string | null
          listing_id?: string
          status?: string
          uninstalled_at?: string | null
          uninstalled_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_installs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_installs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "integration_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_listings: {
        Row: {
          avg_rating: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          developer_name: string | null
          developer_url: string | null
          documentation_url: string | null
          id: string
          install_count: number
          is_featured: boolean
          logo_url: string | null
          long_description: string | null
          name: string
          price_monthly: number
          pricing_type: string
          required_plan_tier: string | null
          review_count: number
          screenshots: Json
          slug: string
          status: string
          support_url: string | null
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          developer_name?: string | null
          developer_url?: string | null
          documentation_url?: string | null
          id?: string
          install_count?: number
          is_featured?: boolean
          logo_url?: string | null
          long_description?: string | null
          name: string
          price_monthly?: number
          pricing_type?: string
          required_plan_tier?: string | null
          review_count?: number
          screenshots?: Json
          slug: string
          status?: string
          support_url?: string | null
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          developer_name?: string | null
          developer_url?: string | null
          documentation_url?: string | null
          id?: string
          install_count?: number
          is_featured?: boolean
          logo_url?: string | null
          long_description?: string | null
          name?: string
          price_monthly?: number
          pricing_type?: string
          required_plan_tier?: string | null
          review_count?: number
          screenshots?: Json
          slug?: string
          status?: string
          support_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          reorder_point: number | null
          reorder_quantity: number | null
          sku: string | null
          unit_cost: number | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku?: string | null
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku?: string | null
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          job_id: string | null
          location_type: Database["public"]["Enums"]["inventory_location_type"]
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          job_id?: string | null
          location_type?: Database["public"]["Enums"]["inventory_location_type"]
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          job_id?: string | null
          location_type?: Database["public"]["Enums"]["inventory_location_type"]
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_locations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          company_id: string
          created_at: string
          id: string
          item_id: string
          last_counted_at: string | null
          location_id: string
          quantity_available: number
          quantity_on_hand: number
          quantity_reserved: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          item_id: string
          last_counted_at?: string | null
          location_id: string
          quantity_available?: number
          quantity_on_hand?: number
          quantity_reserved?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          item_id?: string
          last_counted_at?: string | null
          location_id?: string
          quantity_available?: number
          quantity_on_hand?: number
          quantity_reserved?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          company_id: string
          cost_code_id: string | null
          created_at: string
          from_location_id: string | null
          id: string
          item_id: string
          job_id: string | null
          notes: string | null
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          to_location_id: string | null
          total_cost: number | null
          transaction_type: Database["public"]["Enums"]["inventory_transaction_type"]
          unit_cost: number | null
        }
        Insert: {
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          from_location_id?: string | null
          id?: string
          item_id: string
          job_id?: string | null
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
          total_cost?: number | null
          transaction_type: Database["public"]["Enums"]["inventory_transaction_type"]
          unit_cost?: number | null
        }
        Update: {
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          from_location_id?: string | null
          id?: string
          item_id?: string
          job_id?: string | null
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
          total_cost?: number | null
          transaction_type?: Database["public"]["Enums"]["inventory_transaction_type"]
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_cost_code_id_fkey"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_extractions: {
        Row: {
          company_id: string
          confidence_score: number | null
          created_at: string
          document_id: string
          error_message: string | null
          extracted_data: Json | null
          extraction_model: string | null
          id: string
          job_match_id: string | null
          matched_bill_id: string | null
          processing_time_ms: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          vendor_match_id: string | null
        }
        Insert: {
          company_id: string
          confidence_score?: number | null
          created_at?: string
          document_id: string
          error_message?: string | null
          extracted_data?: Json | null
          extraction_model?: string | null
          id?: string
          job_match_id?: string | null
          matched_bill_id?: string | null
          processing_time_ms?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          vendor_match_id?: string | null
        }
        Update: {
          company_id?: string
          confidence_score?: number | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          extracted_data?: Json | null
          extraction_model?: string | null
          id?: string
          job_match_id?: string | null
          matched_bill_id?: string | null
          processing_time_ms?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          vendor_match_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_extractions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_extractions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_extractions: {
        Row: {
          amount: number | null
          confidence_score: number | null
          cost_code_match_id: string | null
          created_at: string
          description: string | null
          extraction_id: string
          id: string
          line_number: number
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          amount?: number | null
          confidence_score?: number | null
          cost_code_match_id?: string | null
          created_at?: string
          description?: string | null
          extraction_id: string
          id?: string
          line_number: number
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          amount?: number | null
          confidence_score?: number | null
          cost_code_match_id?: string | null
          created_at?: string
          description?: string | null
          extraction_id?: string
          id?: string
          line_number?: number
          quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_extractions_extraction_id_fkey"
            columns: ["extraction_id"]
            isOneToOne: false
            referencedRelation: "invoice_extractions"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          job_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          job_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          job_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          id: string
          job_id: string
          location: string | null
          notes: string | null
          photo_url: string
          taken_by: string | null
          taken_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id: string
          location?: string | null
          notes?: string | null
          photo_url: string
          taken_by?: string | null
          taken_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id?: string
          location?: string | null
          notes?: string | null
          photo_url?: string
          taken_by?: string | null
          taken_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_taken_by_fkey"
            columns: ["taken_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          attempts: number
          company_id: string
          completed_at: string | null
          created_at: string | null
          error: string | null
          id: string
          max_attempts: number
          payload: Json
          priority: number
          run_at: string
          started_at: string | null
          status: string
          type: string
        }
        Insert: {
          attempts?: number
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          max_attempts?: number
          payload?: Json
          priority?: number
          run_at?: string
          started_at?: string | null
          status?: string
          type: string
        }
        Update: {
          attempts?: number
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          max_attempts?: number
          payload?: Json
          priority?: number
          run_at?: string
          started_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_completion: string | null
          address: string | null
          city: string | null
          client_id: string | null
          company_id: string
          contract_amount: number | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          deleted_at: string | null
          id: string
          job_number: string | null
          name: string
          notes: string | null
          start_date: string | null
          state: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          target_completion: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          actual_completion?: string | null
          address?: string | null
          city?: string | null
          client_id?: string | null
          company_id: string
          contract_amount?: number | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          job_number?: string | null
          name: string
          notes?: string | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          target_completion?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          actual_completion?: string | null
          address?: string | null
          city?: string | null
          client_id?: string | null
          company_id?: string
          contract_amount?: number | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          job_number?: string | null
          name?: string
          notes?: string | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          target_completion?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          author_id: string | null
          category: string | null
          company_id: string | null
          content: string | null
          created_at: string
          deleted_at: string | null
          helpful_count: number
          id: string
          not_helpful_count: number
          slug: string
          status: string
          tags: Json
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          company_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          helpful_count?: number
          id?: string
          not_helpful_count?: number
          slug: string
          status?: string
          tags?: Json
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category?: string | null
          company_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          helpful_count?: number
          id?: string
          not_helpful_count?: number
          slug?: string
          status?: string
          tags?: Json
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rate_history: {
        Row: {
          change_pct: number | null
          company_id: string
          created_at: string
          effective_date: string
          id: string
          labor_rate_id: string
          new_rate: number
          old_rate: number | null
        }
        Insert: {
          change_pct?: number | null
          company_id: string
          created_at?: string
          effective_date?: string
          id?: string
          labor_rate_id: string
          new_rate: number
          old_rate?: number | null
        }
        Update: {
          change_pct?: number | null
          company_id?: string
          created_at?: string
          effective_date?: string
          id?: string
          labor_rate_id?: string
          new_rate?: number
          old_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_rate_history_labor_rate_id_fkey"
            columns: ["labor_rate_id"]
            isOneToOne: false
            referencedRelation: "labor_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_date: string
          end_date: string | null
          hourly_rate: number
          id: string
          notes: string | null
          overtime_rate: number | null
          rate_type: string
          region: string | null
          skill_level: string | null
          trade: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_date?: string
          end_date?: string | null
          hourly_rate?: number
          id?: string
          notes?: string | null
          overtime_rate?: number | null
          rate_type?: string
          region?: string | null
          skill_level?: string | null
          trade?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_date?: string
          end_date?: string | null
          hourly_rate?: number
          id?: string
          notes?: string | null
          overtime_rate?: number | null
          rate_type?: string
          region?: string | null
          skill_level?: string | null
          trade?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_rates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_date: string
          activity_type: string
          company_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          lead_id: string
          performed_by: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          activity_date?: string
          activity_type?: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id: string
          performed_by?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string
          performed_by?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          source_type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          source_type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          budget_range_high: number | null
          budget_range_low: number | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          expected_contract_value: number | null
          financing_status: string | null
          first_name: string
          id: string
          last_name: string
          lost_competitor: string | null
          lost_reason: string | null
          lot_address: string | null
          lot_status: string | null
          phone: string | null
          pipeline_id: string | null
          preconstruction_type: string | null
          priority: string
          probability_pct: number | null
          project_type: string | null
          score: number | null
          source: string
          source_detail: string | null
          stage_id: string | null
          status: string
          timeline: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          won_project_id: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          budget_range_high?: number | null
          budget_range_low?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          expected_contract_value?: number | null
          financing_status?: string | null
          first_name: string
          id?: string
          last_name: string
          lost_competitor?: string | null
          lost_reason?: string | null
          lot_address?: string | null
          lot_status?: string | null
          phone?: string | null
          pipeline_id?: string | null
          preconstruction_type?: string | null
          priority?: string
          probability_pct?: number | null
          project_type?: string | null
          score?: number | null
          source?: string
          source_detail?: string | null
          stage_id?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          won_project_id?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          budget_range_high?: number | null
          budget_range_low?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          expected_contract_value?: number | null
          financing_status?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lost_competitor?: string | null
          lost_reason?: string | null
          lot_address?: string | null
          lot_status?: string | null
          phone?: string | null
          pipeline_id?: string | null
          preconstruction_type?: string | null
          priority?: string
          probability_pct?: number | null
          project_type?: string | null
          score?: number | null
          source?: string
          source_detail?: string | null
          stage_id?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          won_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_pipeline"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_leads_stage"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lien_waiver_templates: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_default: boolean
          state_code: string | null
          template_content: string | null
          template_name: string
          updated_at: string
          waiver_type: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          state_code?: string | null
          template_content?: string | null
          template_name: string
          updated_at?: string
          waiver_type: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          state_code?: string | null
          template_content?: string | null
          template_name?: string
          updated_at?: string
          waiver_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lien_waiver_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lien_waiver_tracking: {
        Row: {
          company_id: string
          created_at: string
          expected_amount: number | null
          id: string
          is_compliant: boolean
          job_id: string
          notes: string | null
          period_end: string | null
          period_start: string | null
          updated_at: string
          vendor_id: string | null
          waiver_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          expected_amount?: number | null
          id?: string
          is_compliant?: boolean
          job_id: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          updated_at?: string
          vendor_id?: string | null
          waiver_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          expected_amount?: number | null
          id?: string
          is_compliant?: boolean
          job_id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          updated_at?: string
          vendor_id?: string | null
          waiver_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lien_waiver_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waiver_tracking_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waiver_tracking_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waiver_tracking_waiver_id_fkey"
            columns: ["waiver_id"]
            isOneToOne: false
            referencedRelation: "lien_waivers"
            referencedColumns: ["id"]
          },
        ]
      }
      lien_waivers: {
        Row: {
          amount: number | null
          approved_at: string | null
          approved_by: string | null
          check_number: string | null
          claimant_name: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          document_id: string | null
          id: string
          job_id: string
          notes: string | null
          payment_id: string | null
          received_at: string | null
          requested_at: string | null
          requested_by: string | null
          status: string
          through_date: string | null
          updated_at: string
          vendor_id: string | null
          waiver_type: string
        }
        Insert: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          check_number?: string | null
          claimant_name?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          job_id: string
          notes?: string | null
          payment_id?: string | null
          received_at?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          through_date?: string | null
          updated_at?: string
          vendor_id?: string | null
          waiver_type: string
        }
        Update: {
          amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          check_number?: string | null
          claimant_name?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          payment_id?: string | null
          received_at?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          through_date?: string | null
          updated_at?: string
          vendor_id?: string | null
          waiver_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lien_waivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waivers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waivers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          assigned_to: string | null
          assigned_vendor_id: string | null
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          frequency: string
          id: string
          is_active: boolean
          job_id: string
          next_due_date: string | null
          notes: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          job_id: string
          next_due_date?: string | null
          notes?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          job_id?: string
          next_due_date?: string | null
          notes?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          actual_cost: number | null
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          notes: string | null
          schedule_id: string
          status: string
          title: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          notes?: string | null
          schedule_id: string
          status?: string
          title: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          schedule_id?: string
          status?: string
          title?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          actual_spend: number
          budget: number
          campaign_type: string
          channel: string | null
          company_id: string
          contract_value_won: number
          contracts_won: number
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          leads_generated: number
          name: string
          notes: string | null
          proposals_sent: number
          roi_pct: number | null
          start_date: string | null
          status: string
          target_audience: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          actual_spend?: number
          budget?: number
          campaign_type?: string
          channel?: string | null
          company_id: string
          contract_value_won?: number
          contracts_won?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          leads_generated?: number
          name: string
          notes?: string | null
          proposals_sent?: number
          roi_pct?: number | null
          start_date?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          actual_spend?: number
          budget?: number
          campaign_type?: string
          channel?: string | null
          company_id?: string
          contract_value_won?: number
          contracts_won?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          leads_generated?: number
          name?: string
          notes?: string | null
          proposals_sent?: number
          roi_pct?: number | null
          start_date?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_leads: {
        Row: {
          assigned_to: string | null
          close_probability: number | null
          closed_at: string | null
          closed_reason: string | null
          company_name: string | null
          company_size: string | null
          competitor_name: string | null
          created_at: string | null
          crm_id: string | null
          current_tools: string | null
          deal_value: number | null
          deleted_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          pipeline_stage: string
          source: string
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          assigned_to?: string | null
          close_probability?: number | null
          closed_at?: string | null
          closed_reason?: string | null
          company_name?: string | null
          company_size?: string | null
          competitor_name?: string | null
          created_at?: string | null
          crm_id?: string | null
          current_tools?: string | null
          deal_value?: number | null
          deleted_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          source?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          assigned_to?: string | null
          close_probability?: number | null
          closed_at?: string | null
          closed_reason?: string | null
          company_name?: string | null
          company_size?: string | null
          competitor_name?: string | null
          created_at?: string | null
          crm_id?: string | null
          current_tools?: string | null
          deal_value?: number | null
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          source?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      marketing_referrals: {
        Row: {
          clicked_at: string | null
          converted_at: string | null
          created_at: string | null
          credit_applied: boolean | null
          id: string
          notes: string | null
          referral_code: string
          referred_company_id: string | null
          referred_company_name: string | null
          referred_email: string
          referrer_company_id: string
          referrer_credit: number | null
          signed_up_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          credit_applied?: boolean | null
          id?: string
          notes?: string | null
          referral_code: string
          referred_company_id?: string | null
          referred_company_name?: string | null
          referred_email: string
          referrer_company_id: string
          referrer_credit?: number | null
          signed_up_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          credit_applied?: boolean | null
          id?: string
          notes?: string | null
          referral_code?: string
          referred_company_id?: string | null
          referred_company_name?: string | null
          referred_email?: string
          referrer_company_id?: string
          referrer_credit?: number | null
          signed_up_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_referrals_referrer_company_id_fkey"
            columns: ["referrer_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_installs: {
        Row: {
          company_id: string
          created_at: string
          id: string
          installed_at: string
          installed_by: string
          payment_amount: number | null
          payment_id: string | null
          template_id: string
          template_version: string
          uninstalled_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          installed_at?: string
          installed_by: string
          payment_amount?: number | null
          payment_id?: string | null
          template_id: string
          template_version: string
          uninstalled_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          installed_at?: string
          installed_by?: string
          payment_amount?: number | null
          payment_id?: string | null
          template_id?: string
          template_version?: string
          uninstalled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_installs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_installs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "marketplace_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_publishers: {
        Row: {
          avg_rating: number
          bio: string | null
          created_at: string
          credentials: string | null
          display_name: string
          id: string
          is_verified: boolean
          profile_image: string | null
          publisher_type: string
          revenue_share_pct: number
          stripe_connect_id: string | null
          total_installs: number
          total_templates: number
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avg_rating?: number
          bio?: string | null
          created_at?: string
          credentials?: string | null
          display_name: string
          id?: string
          is_verified?: boolean
          profile_image?: string | null
          publisher_type?: string
          revenue_share_pct?: number
          stripe_connect_id?: string | null
          total_installs?: number
          total_templates?: number
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avg_rating?: number
          bio?: string | null
          created_at?: string
          credentials?: string | null
          display_name?: string
          id?: string
          is_verified?: boolean
          profile_image?: string | null
          publisher_type?: string
          revenue_share_pct?: number
          stripe_connect_id?: string | null
          total_installs?: number
          total_templates?: number
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      marketplace_reviews: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_flagged: boolean
          is_verified_purchase: boolean
          publisher_responded_at: string | null
          publisher_response: string | null
          rating: number
          review_text: string | null
          template_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_flagged?: boolean
          is_verified_purchase?: boolean
          publisher_responded_at?: string | null
          publisher_response?: string | null
          rating: number
          review_text?: string | null
          template_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_flagged?: boolean
          is_verified_purchase?: boolean
          publisher_responded_at?: string | null
          publisher_response?: string | null
          rating?: number
          review_text?: string | null
          template_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "marketplace_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_template_versions: {
        Row: {
          changelog: string | null
          created_at: string
          id: string
          published_at: string
          template_data: Json
          template_id: string
          version: string
        }
        Insert: {
          changelog?: string | null
          created_at?: string
          id?: string
          published_at?: string
          template_data?: Json
          template_id: string
          version: string
        }
        Update: {
          changelog?: string | null
          created_at?: string
          id?: string
          published_at?: string
          template_data?: Json
          template_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "marketplace_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_templates: {
        Row: {
          avg_rating: number
          construction_tags: Json
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          description: string | null
          id: string
          install_count: number
          is_active: boolean
          is_featured: boolean
          long_description: string | null
          name: string
          price: number
          publisher_id: string
          publisher_type: string
          region_tags: Json
          required_modules: Json
          review_count: number
          review_status: string
          screenshots: Json
          slug: string
          tags: Json
          template_data: Json
          template_type: string
          updated_at: string
          version: string
        }
        Insert: {
          avg_rating?: number
          construction_tags?: Json
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          install_count?: number
          is_active?: boolean
          is_featured?: boolean
          long_description?: string | null
          name: string
          price?: number
          publisher_id: string
          publisher_type?: string
          region_tags?: Json
          required_modules?: Json
          review_count?: number
          review_status?: string
          screenshots?: Json
          slug: string
          tags?: Json
          template_data?: Json
          template_type: string
          updated_at?: string
          version?: string
        }
        Update: {
          avg_rating?: number
          construction_tags?: Json
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          install_count?: number
          is_active?: boolean
          is_featured?: boolean
          long_description?: string | null
          name?: string
          price?: number
          publisher_id?: string
          publisher_type?: string
          region_tags?: Json
          required_modules?: Json
          review_count?: number
          review_status?: string
          screenshots?: Json
          slug?: string
          tags?: Json
          template_data?: Json
          template_type?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_templates_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "marketplace_publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      master_items: {
        Row: {
          category: string
          company_id: string
          created_at: string
          created_by: string | null
          default_unit_price: number | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          sku: string | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          default_unit_price?: number | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          sku?: string | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          default_unit_price?: number | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sku?: string | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_request_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_id: string | null
          notes: string | null
          quantity_fulfilled: number
          quantity_requested: number
          request_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          quantity_fulfilled?: number
          quantity_requested?: number
          request_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          quantity_fulfilled?: number
          quantity_requested?: number
          request_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_request_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      material_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          job_id: string | null
          needed_by: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["material_request_priority"]
          requested_by: string | null
          status: Database["public"]["Enums"]["material_request_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          job_id?: string | null
          needed_by?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["material_request_priority"]
          requested_by?: string | null
          status?: Database["public"]["Enums"]["material_request_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          job_id?: string | null
          needed_by?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["material_request_priority"]
          requested_by?: string | null
          status?: Database["public"]["Enums"]["material_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_field_mappings: {
        Row: {
          company_id: string
          created_at: string
          default_value: string | null
          id: string
          is_required: boolean
          job_id: string
          sample_source_value: string | null
          sample_target_value: string | null
          sort_order: number
          source_field: string
          target_field: string
          target_table: string
          transform_config: Json
          transform_type: string
          updated_at: string
                  deleted_at: string | null
}
        Insert: {
          company_id: string
          created_at?: string
          default_value?: string | null
          id?: string
          is_required?: boolean
          job_id: string
          sample_source_value?: string | null
          sample_target_value?: string | null
          sort_order?: number
          source_field: string
          target_field: string
          target_table: string
          transform_config?: Json
          transform_type?: string
          updated_at?: string
                  deleted_at?: string | null
}
        Update: {
          company_id?: string
          created_at?: string
          default_value?: string | null
          id?: string
          is_required?: boolean
          job_id?: string
          sample_source_value?: string | null
          sample_target_value?: string | null
          sort_order?: number
          source_field?: string
          target_field?: string
          target_table?: string
          transform_config?: Json
          transform_type?: string
          updated_at?: string
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "migration_field_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_field_mappings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "migration_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_jobs: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          error_log: Json
          failed_records: number
          id: string
          name: string
          processed_records: number
          rolled_back_at: string | null
          rolled_back_by: string | null
          skipped_records: number
          source_file_name: string | null
          source_file_url: string | null
          source_platform: string
          started_at: string | null
          status: string
          total_records: number
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          error_log?: Json
          failed_records?: number
          id?: string
          name: string
          processed_records?: number
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          skipped_records?: number
          source_file_name?: string | null
          source_file_url?: string | null
          source_platform?: string
          started_at?: string | null
          status?: string
          total_records?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          error_log?: Json
          failed_records?: number
          id?: string
          name?: string
          processed_records?: number
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          skipped_records?: number
          source_file_name?: string | null
          source_file_url?: string | null
          source_platform?: string
          started_at?: string | null
          status?: string
          total_records?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_mapping_templates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_system: boolean
          mappings: Json
          name: string
          source_platform: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          mappings?: Json
          name: string
          source_platform: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          mappings?: Json
          name?: string
          source_platform?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_mapping_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_reconciliation: {
        Row: {
          company_id: string
          created_at: string
          discrepancies: Json
          entity_type: string
          id: string
          imported_count: number
          job_id: string
          matched_count: number
          notes: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          source_count: number
          status: string
          unmatched_count: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          discrepancies?: Json
          entity_type: string
          id?: string
          imported_count?: number
          job_id: string
          matched_count?: number
          notes?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          source_count?: number
          status?: string
          unmatched_count?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          discrepancies?: Json
          entity_type?: string
          id?: string
          imported_count?: number
          job_id?: string
          matched_count?: number
          notes?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          source_count?: number
          status?: string
          unmatched_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_reconciliation_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_reconciliation_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "migration_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_validation_results: {
        Row: {
          company_id: string
          created_at: string
          field_name: string | null
          id: string
          is_resolved: boolean
          job_id: string
          message: string
          record_index: number | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_value: string | null
          validation_type: string
        }
        Insert: {
          company_id: string
          created_at?: string
          field_name?: string | null
          id?: string
          is_resolved?: boolean
          job_id: string
          message: string
          record_index?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_value?: string | null
          validation_type?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          field_name?: string | null
          id?: string
          is_resolved?: boolean
          job_id?: string
          message?: string
          record_index?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_value?: string | null
          validation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_validation_results_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_validation_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "migration_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_app_settings: {
        Row: {
          auto_sync: boolean
          biometric_enabled: boolean
          company_id: string
          created_at: string
          data_saver_mode: boolean
          gps_accuracy: string
          id: string
          location_tracking: boolean
          offline_storage_limit_mb: number
          photo_quality: string
          preferences: Json
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sync_on_wifi_only: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sync?: boolean
          biometric_enabled?: boolean
          company_id: string
          created_at?: string
          data_saver_mode?: boolean
          gps_accuracy?: string
          id?: string
          location_tracking?: boolean
          offline_storage_limit_mb?: number
          photo_quality?: string
          preferences?: Json
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sync_on_wifi_only?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sync?: boolean
          biometric_enabled?: boolean
          company_id?: string
          created_at?: string
          data_saver_mode?: boolean
          gps_accuracy?: string
          id?: string
          location_tracking?: boolean
          offline_storage_limit_mb?: number
          photo_quality?: string
          preferences?: Json
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sync_on_wifi_only?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_app_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_devices: {
        Row: {
          app_version: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          device_model: string | null
          device_name: string
          device_token: string | null
          id: string
          last_active_at: string | null
          last_ip_address: string | null
          metadata: Json
          os_version: string | null
          platform: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          device_model?: string | null
          device_name: string
          device_token?: string | null
          id?: string
          last_active_at?: string | null
          last_ip_address?: string | null
          metadata?: Json
          os_version?: string | null
          platform?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          device_model?: string | null
          device_name?: string
          device_token?: string | null
          id?: string
          last_active_at?: string | null
          last_ip_address?: string | null
          metadata?: Json
          os_version?: string | null
          platform?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_devices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_sessions: {
        Row: {
          company_id: string
          created_at: string
          device_id: string
          ended_at: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          last_activity_at: string
          session_token: string
          started_at: string
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          device_id: string
          ended_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          session_token: string
          started_at?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          device_id?: string
          ended_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          session_token?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempts: number | null
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          notification_id: string
          provider_message_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          notification_id: string
          provider_message_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          notification_id?: string
          provider_message_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_event_types: {
        Row: {
          category: string
          created_at: string | null
          default_channels: string[] | null
          default_roles: string[] | null
          description: string | null
          event_type: string
          id: string
          module: string
          urgency: string | null
          variables: string[] | null
        }
        Insert: {
          category: string
          created_at?: string | null
          default_channels?: string[] | null
          default_roles?: string[] | null
          description?: string | null
          event_type: string
          id?: string
          module: string
          urgency?: string | null
          variables?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_channels?: string[] | null
          default_roles?: string[] | null
          description?: string | null
          event_type?: string
          id?: string
          module?: string
          urgency?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          archived: boolean | null
          body: string | null
          category: string
          company_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          idempotency_key: string | null
          job_id: string | null
          read: boolean | null
          read_at: string | null
          snoozed_until: string | null
          title: string
          triggered_by: string | null
          urgency: string | null
          url_path: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          body?: string | null
          category: string
          company_id: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          idempotency_key?: string | null
          job_id?: string | null
          read?: boolean | null
          read_at?: string | null
          snoozed_until?: string | null
          title: string
          triggered_by?: string | null
          urgency?: string | null
          url_path?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          body?: string | null
          category?: string
          company_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string | null
          job_id?: string | null
          read?: boolean | null
          read_at?: string | null
          snoozed_until?: string | null
          title?: string
          triggered_by?: string | null
          urgency?: string | null
          url_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      numbering_patterns: {
        Row: {
          company_id: string
          created_at: string | null
          current_sequence: number | null
          entity_type: string
          id: string
          last_reset_year: number | null
          padding: number | null
          pattern: string
          prefix: string | null
          reset_yearly: boolean | null
          sample_output: string | null
          scope: string | null
          suffix: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          current_sequence?: number | null
          entity_type: string
          id?: string
          last_reset_year?: number | null
          padding?: number | null
          pattern: string
          prefix?: string | null
          reset_yearly?: boolean | null
          sample_output?: string | null
          scope?: string | null
          suffix?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          current_sequence?: number | null
          entity_type?: string
          id?: string
          last_reset_year?: number | null
          padding?: number | null
          pattern?: string
          prefix?: string | null
          reset_yearly?: boolean | null
          sample_output?: string | null
          scope?: string | null
          suffix?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "numbering_patterns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      numbering_sequences: {
        Row: {
          company_id: string
          created_at: string | null
          current_value: number | null
          id: string
          job_id: string | null
          pattern_id: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          job_id?: string | null
          pattern_id: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          job_id?: string | null
          pattern_id?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "numbering_sequences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "numbering_sequences_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "numbering_sequences_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "numbering_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync_queue: {
        Row: {
          action: string
          company_id: string
          created_at: string
          device_id: string
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          max_retries: number
          payload: Json
          priority: number
          retry_count: number
          status: string
          synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action?: string
          company_id: string
          created_at?: string
          device_id: string
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          max_retries?: number
          payload?: Json
          priority?: number
          retry_count?: number
          status?: string
          synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          device_id?: string
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          payload?: Json
          priority?: number
          retry_count?: number
          status?: string
          synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_sync_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklists: {
        Row: {
          category: string
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          is_required: boolean | null
          session_id: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          is_required?: boolean | null
          session_id: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          is_required?: boolean | null
          session_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_milestones: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          milestone_key: string
          session_id: string
          skipped_at: string | null
          sort_order: number | null
          started_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          milestone_key: string
          session_id: string
          skipped_at?: string | null
          sort_order?: number | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          milestone_key?: string
          session_id?: string
          skipped_at?: string | null
          sort_order?: number | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_milestones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_milestones_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_reminders: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          message: string | null
          reminder_type: string
          scheduled_at: string
          sent_at: string | null
          session_id: string
          status: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          reminder_type?: string
          scheduled_at: string
          sent_at?: string | null
          session_id: string
          status?: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          reminder_type?: string
          scheduled_at?: string
          sent_at?: string | null
          session_id?: string
          status?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_reminders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_sessions: {
        Row: {
          company_id: string
          company_size: string | null
          company_type: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_step: number | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          skipped_at: string | null
          started_at: string | null
          status: string
          total_steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          company_size?: string | null
          company_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          skipped_at?: string | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          company_size?: string | null
          company_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          skipped_at?: string | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_exports: {
        Row: {
          company_id: string
          created_at: string
          employee_count: number | null
          export_format: string
          exported_by: string | null
          file_path: string | null
          id: string
          payroll_period_id: string | null
          total_amount: number | null
          total_hours: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_count?: number | null
          export_format?: string
          exported_by?: string | null
          file_path?: string | null
          id?: string
          payroll_period_id?: string | null
          total_amount?: number | null
          total_hours?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_count?: number | null
          export_format?: string
          exported_by?: string | null
          file_path?: string | null
          id?: string
          payroll_period_id?: string | null
          total_amount?: number | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_exports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_exports_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          company_id: string
          created_at: string
          exported_at: string | null
          exported_by: string | null
          id: string
          period_end: string
          period_start: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          exported_at?: string | null
          exported_by?: string | null
          id?: string
          period_end: string
          period_start: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          exported_at?: string | null
          exported_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_documents: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          document_type: string
          file_name: string | null
          file_url: string
          id: string
          permit_id: string
          uploaded_at: string
          uploaded_by: string | null
                  deleted_at: string | null
}
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          document_type: string
          file_name?: string | null
          file_url: string
          id?: string
          permit_id: string
          uploaded_at?: string
          uploaded_by?: string | null
                  deleted_at?: string | null
}
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          document_type?: string
          file_name?: string | null
          file_url?: string
          id?: string
          permit_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "permit_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_documents_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_fees: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          notes: string | null
          paid_by: string | null
          paid_date: string | null
          permit_id: string
          receipt_url: string | null
          status: string
          updated_at: string
                  deleted_at: string | null
}
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_by?: string | null
          paid_date?: string | null
          permit_id: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_by?: string | null
          paid_date?: string | null
          permit_id?: string
          receipt_url?: string | null
          status?: string
          updated_at?: string
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "permit_fees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_fees_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_inspections: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          inspection_type: string
          inspector_name: string | null
          inspector_phone: string | null
          is_reinspection: boolean
          job_id: string
          notes: string | null
          original_inspection_id: string | null
          permit_id: string
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_type: string
          inspector_name?: string | null
          inspector_phone?: string | null
          is_reinspection?: boolean
          job_id: string
          notes?: string | null
          original_inspection_id?: string | null
          permit_id: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_type?: string
          inspector_name?: string | null
          inspector_phone?: string | null
          is_reinspection?: boolean
          job_id?: string
          notes?: string | null
          original_inspection_id?: string | null
          permit_id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permit_inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_inspections_original_inspection_id_fkey"
            columns: ["original_inspection_id"]
            isOneToOne: false
            referencedRelation: "permit_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_inspections_permit_id_fkey"
            columns: ["permit_id"]
            isOneToOne: false
            referencedRelation: "permits"
            referencedColumns: ["id"]
          },
        ]
      }
      permits: {
        Row: {
          applied_date: string | null
          company_id: string
          conditions: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expiration_date: string | null
          id: string
          issued_date: string | null
          job_id: string
          jurisdiction: string | null
          notes: string | null
          permit_number: string | null
          permit_type: string
          status: string
          updated_at: string
        }
        Insert: {
          applied_date?: string | null
          company_id: string
          conditions?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          job_id: string
          jurisdiction?: string | null
          notes?: string | null
          permit_number?: string | null
          permit_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          applied_date?: string | null
          company_id?: string
          conditions?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          job_id?: string
          jurisdiction?: string | null
          notes?: string | null
          permit_number?: string | null
          permit_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          pipeline_id: string
          probability_default: number | null
          sequence_order: number
          stage_type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          pipeline_id: string
          probability_default?: number | null
          sequence_order?: number
          stage_type?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          pipeline_id?: string
          probability_default?: number | null
          sequence_order?: number
          stage_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_addons: {
        Row: {
          addon_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_metered: boolean
          meter_price_per_unit: number
          meter_unit: string | null
          name: string
          price_annual: number
          price_monthly: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          addon_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_metered?: boolean
          meter_price_per_unit?: number
          meter_unit?: string | null
          name: string
          price_annual?: number
          price_monthly?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          addon_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_metered?: boolean
          meter_price_per_unit?: number
          meter_unit?: string | null
          name?: string
          price_annual?: number
          price_monthly?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      platform_defaults: {
        Row: {
          created_at: string | null
          data_type: string | null
          description: string | null
          id: string
          key: string
          section: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          key: string
          section: string
          value: Json
        }
        Update: {
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          key?: string
          section?: string
          value?: Json
        }
        Relationships: []
      }
      platform_metrics_snapshots: {
        Row: {
          breakdown: Json
          company_id: string | null
          created_at: string
          created_by: string | null
          id: string
          metric_type: string
          metric_value: number
          period: string
          snapshot_date: string
          updated_at: string
        }
        Insert: {
          breakdown?: Json
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metric_type: string
          metric_value?: number
          period?: string
          snapshot_date?: string
          updated_at?: string
        }
        Update: {
          breakdown?: Json
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metric_type?: string
          metric_value?: number
          period?: string
          snapshot_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_metrics_snapshots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_metrics_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      po_receipt_lines: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          po_line_id: string
          quantity_received: number
          receipt_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          po_line_id: string
          quantity_received: number
          receipt_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          po_line_id?: string
          quantity_received?: number
          receipt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_receipt_lines_po_line_id_fkey"
            columns: ["po_line_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_receipt_lines_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "po_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      po_receipts: {
        Row: {
          company_id: string
          created_at: string
          document_id: string | null
          id: string
          notes: string | null
          po_id: string
          received_by: string | null
          received_date: string
        }
        Insert: {
          company_id: string
          created_at?: string
          document_id?: string | null
          id?: string
          notes?: string | null
          po_id: string
          received_by?: string | null
          received_date?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          document_id?: string | null
          id?: string
          notes?: string | null
          po_id?: string
          received_by?: string | null
          received_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_receipts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_activity_log: {
        Row: {
          action: string
          client_id: string
          company_id: string
          created_at: string | null
          id: string
          job_id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          client_id: string
          company_id: string
          created_at?: string | null
          id?: string
          job_id: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          client_id?: string
          company_id?: string
          created_at?: string | null
          id?: string
          job_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_activity_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_messages: {
        Row: {
          body: string
          company_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          job_id: string
          parent_message_id: string | null
          sender_id: string
          sender_type: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id: string
          parent_message_id?: string | null
          sender_id: string
          sender_type: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string
          parent_message_id?: string | null
          sender_id?: string
          sender_type?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "portal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_settings: {
        Row: {
          branding_logo_url: string | null
          branding_primary_color: string | null
          company_id: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          job_id: string
          show_budget: boolean | null
          show_daily_logs: boolean | null
          show_documents: boolean | null
          show_photos: boolean | null
          show_schedule: boolean | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          branding_logo_url?: string | null
          branding_primary_color?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          job_id: string
          show_budget?: boolean | null
          show_daily_logs?: boolean | null
          show_documents?: boolean | null
          show_photos?: boolean | null
          show_schedule?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          branding_logo_url?: string | null
          branding_primary_color?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          job_id?: string
          show_budget?: boolean | null
          show_daily_logs?: boolean | null
          show_documents?: boolean | null
          show_photos?: boolean | null
          show_schedule?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_settings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_shared_documents: {
        Row: {
          company_id: string
          created_at: string | null
          document_id: string
          id: string
          job_id: string
          notes: string | null
          shared_at: string | null
          shared_by: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_id: string
          id?: string
          job_id: string
          notes?: string | null
          shared_at?: string | null
          shared_by: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
          job_id?: string
          notes?: string | null
          shared_at?: string | null
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_shared_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_shared_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_shared_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_shared_documents_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_shared_photos: {
        Row: {
          album_name: string | null
          caption: string | null
          company_id: string
          created_at: string | null
          id: string
          job_id: string
          shared_by: string
          sort_order: number | null
          storage_path: string
        }
        Insert: {
          album_name?: string | null
          caption?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          job_id: string
          shared_by: string
          sort_order?: number | null
          storage_path: string
        }
        Update: {
          album_name?: string | null
          caption?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          job_id?: string
          shared_by?: string
          sort_order?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_shared_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_shared_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_shared_photos_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_update_posts: {
        Row: {
          body: string
          company_id: string
          created_at: string | null
          created_by: string
          deleted_at: string | null
          id: string
          is_published: boolean | null
          job_id: string
          post_type: string
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean | null
          job_id: string
          post_type: string
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean | null
          job_id?: string
          post_type?: string
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_update_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_update_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_update_posts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          display_order: number
          id: string
          is_cover: boolean
          photo_type: string
          photo_url: string
          portfolio_project_id: string
          room: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_cover?: boolean
          photo_type?: string
          photo_url: string
          portfolio_project_id: string
          room?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_cover?: boolean
          photo_type?: string
          photo_url?: string
          portfolio_project_id?: string
          room?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_photos_portfolio_project_id_fkey"
            columns: ["portfolio_project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          build_duration_days: number | null
          category: string | null
          company_id: string
          completion_date: string | null
          cover_photo_url: string | null
          created_at: string
          created_by: string | null
          custom_features: Json
          deleted_at: string | null
          description: string | null
          display_order: number
          highlights: Json
          id: string
          is_featured: boolean
          job_id: string | null
          location: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          square_footage: number | null
          status: string
          style: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          build_duration_days?: number | null
          category?: string | null
          company_id: string
          completion_date?: string | null
          cover_photo_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_features?: Json
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          highlights?: Json
          id?: string
          is_featured?: boolean
          job_id?: string | null
          location?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          square_footage?: number | null
          status?: string
          style?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          build_duration_days?: number | null
          category?: string | null
          company_id?: string
          completion_date?: string | null
          cover_photo_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_features?: Json
          deleted_at?: string | null
          description?: string | null
          display_order?: number
          highlights?: Json
          id?: string
          is_featured?: boolean
          job_id?: string | null
          location?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          square_footage?: number | null
          status?: string
          style?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          company_id: string
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          pay_grade: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          pay_grade?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          pay_grade?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          change_pct: number | null
          company_id: string
          created_at: string
          id: string
          master_item_id: string
          new_price: number
          old_price: number | null
          recorded_at: string
          vendor_id: string | null
        }
        Insert: {
          change_pct?: number | null
          company_id: string
          created_at?: string
          id?: string
          master_item_id: string
          new_price: number
          old_price?: number | null
          recorded_at?: string
          vendor_id?: string | null
        }
        Update: {
          change_pct?: number | null
          company_id?: string
          created_at?: string
          id?: string
          master_item_id?: string
          new_price?: number
          old_price?: number | null
          recorded_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_master_item_id_fkey"
            columns: ["master_item_id"]
            isOneToOne: false
            referencedRelation: "master_items"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          color: string | null
          company_id: string
          created_at: string | null
          default_duration_days: number | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          milestone_type: string | null
          name: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string | null
          default_duration_days?: number | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          milestone_type?: string | null
          name: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string | null
          default_duration_days?: number | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          milestone_type?: string | null
          name?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_user_roles: {
        Row: {
          company_id: string
          created_at: string | null
          granted_by: string
          id: string
          job_id: string
          role_id: string | null
          role_override: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          granted_by: string
          id?: string
          job_id: string
          role_id?: string | null
          role_override?: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          granted_by?: string
          id?: string
          job_id?: string
          role_id?: string | null
          role_override?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_roles_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_item_photos: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          id: string
          photo_type: string
          photo_url: string
          punch_item_id: string
          uploaded_at: string
          uploaded_by: string | null
                  deleted_at: string | null
}
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          id?: string
          photo_type?: string
          photo_url: string
          punch_item_id: string
          uploaded_at?: string
          uploaded_by?: string | null
                  deleted_at?: string | null
}
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          id?: string
          photo_type?: string
          photo_url?: string
          punch_item_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "punch_item_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_item_photos_punch_item_id_fkey"
            columns: ["punch_item_id"]
            isOneToOne: false
            referencedRelation: "punch_items"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_items: {
        Row: {
          assigned_to: string | null
          assigned_vendor_id: string | null
          category: string | null
          company_id: string
          completed_at: string | null
          cost_estimate: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          id: string
          job_id: string
          location: string | null
          priority: string
          room: string | null
          status: string
          title: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          category?: string | null
          company_id: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          job_id: string
          location?: string | null
          priority?: string
          room?: string | null
          status?: string
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          category?: string | null
          company_id?: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string
          location?: string | null
          priority?: string
          room?: string | null
          status?: string
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "punch_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_lines: {
        Row: {
          amount: number
          cost_code_id: string | null
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          po_id: string
          quantity: number
          received_quantity: number
          sort_order: number
          unit: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          amount?: number
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          po_id: string
          quantity?: number
          received_quantity?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          po_id?: string
          quantity?: number
          received_quantity?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget_id: string | null
          company_id: string
          cost_code_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          delivery_date: string | null
          id: string
          job_id: string
          notes: string | null
          po_number: string
          sent_at: string | null
          shipping_address: string | null
          shipping_amount: number
          status: string
          subtotal: number
          tax_amount: number
          terms: string | null
          title: string
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string | null
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivery_date?: string | null
          id?: string
          job_id: string
          notes?: string | null
          po_number: string
          sent_at?: string | null
          shipping_address?: string | null
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string | null
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivery_date?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          po_number?: string
          sent_at?: string | null
          shipping_address?: string | null
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_tokens: {
        Row: {
          company_id: string
          created_at: string
          device_id: string
          id: string
          is_active: boolean
          last_used_at: string | null
          provider: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          device_id: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          provider?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          provider?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_tokens_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notification_tokens_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklist_items: {
        Row: {
          checklist_id: string
          company_id: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          notes: string | null
          photo_url: string | null
          result: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          checklist_id: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          result?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          result?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "quality_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklist_template_items: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string
          id: string
          is_required: boolean
          sort_order: number
          template_id: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description: string
          id?: string
          is_required?: boolean
          sort_order?: number
          template_id: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          is_required?: boolean
          sort_order?: number
          template_id?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklist_template_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quality_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklist_templates: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklist_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklists: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          failed_items: number
          id: string
          inspection_date: string | null
          inspector_id: string | null
          job_id: string
          location: string | null
          na_items: number
          name: string
          passed_items: number
          status: string
          template_id: string | null
          total_items: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failed_items?: number
          id?: string
          inspection_date?: string | null
          inspector_id?: string | null
          job_id: string
          location?: string | null
          na_items?: number
          name: string
          passed_items?: number
          status?: string
          template_id?: string | null
          total_items?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failed_items?: number
          id?: string
          inspection_date?: string | null
          inspector_id?: string | null
          job_id?: string
          location?: string | null
          na_items?: number
          name?: string
          passed_items?: number
          status?: string
          template_id?: string | null
          total_items?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quality_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_dashboards: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          global_filters: Json
          id: string
          is_admin_pushed: boolean
          is_default: boolean
          layout: string
          name: string
          target_roles: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          global_filters?: Json
          id?: string
          is_admin_pushed?: boolean
          is_default?: boolean
          layout?: string
          name: string
          target_roles?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          global_filters?: Json
          id?: string
          is_admin_pushed?: boolean
          is_default?: boolean
          layout?: string
          name?: string
          target_roles?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_dashboards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_dashboards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      report_definitions: {
        Row: {
          company_id: string
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_definitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          company_id: string
          created_at: string | null
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipients: Json
          report_definition_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: Json
          report_definition_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: Json
          report_definition_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_schedules_report_definition_id_fkey"
            columns: ["report_definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      report_snapshots: {
        Row: {
          company_id: string
          created_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          period_end: string
          period_start: string
          report_definition_id: string
          snapshot_data: Json
        }
        Insert: {
          company_id: string
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          period_end: string
          period_start: string
          report_definition_id: string
          snapshot_data?: Json
        }
        Update: {
          company_id?: string
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          report_definition_id?: string
          snapshot_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "report_snapshots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_snapshots_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_snapshots_report_definition_id_fkey"
            columns: ["report_definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_responses: {
        Row: {
          attachments: Json | null
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_official: boolean
          responded_by: string | null
          response_text: string
          rfi_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_official?: boolean
          responded_by?: string | null
          response_text: string
          rfi_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_official?: boolean
          responded_by?: string | null
          response_text?: string
          rfi_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfi_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_responses_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_responses_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_routing: {
        Row: {
          company_id: string
          created_at: string
          id: string
          notes: string | null
          rfi_id: string
          routed_at: string
          routed_by: string | null
          routed_to: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          rfi_id: string
          routed_at?: string
          routed_by?: string | null
          routed_to?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          rfi_id?: string
          routed_at?: string
          routed_by?: string | null
          routed_to?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfi_routing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_routing_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_routing_routed_by_fkey"
            columns: ["routed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_routing_routed_to_fkey"
            columns: ["routed_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_templates: {
        Row: {
          category: string
          company_id: string
          created_at: string
          default_priority: string
          id: string
          is_active: boolean
          name: string
          question_template: string | null
          subject_template: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          default_priority?: string
          id?: string
          is_active?: boolean
          name: string
          question_template?: string | null
          subject_template?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          default_priority?: string
          id?: string
          is_active?: boolean
          name?: string
          question_template?: string | null
          subject_template?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfi_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          answered_at: string | null
          assigned_to: string | null
          category: string
          closed_at: string | null
          closed_by: string | null
          company_id: string
          cost_impact: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          due_date: string | null
          id: string
          job_id: string
          priority: string
          question: string
          related_document_id: string | null
          rfi_number: string
          schedule_impact_days: number
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          answered_at?: string | null
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          company_id: string
          cost_impact?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          job_id: string
          priority?: string
          question: string
          related_document_id?: string | null
          rfi_number: string
          schedule_impact_days?: number
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          answered_at?: string | null
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          company_id?: string
          cost_impact?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          job_id?: string
          priority?: string
          question?: string
          related_document_id?: string | null
          rfi_number?: string
          schedule_impact_days?: number
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfis_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          base_role: Database["public"]["Enums"]["user_role"]
          company_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          field_overrides: Json | null
          id: string
          is_system: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          base_role: Database["public"]["Enums"]["user_role"]
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          field_overrides?: Json | null
          id?: string
          is_system?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          base_role?: Database["public"]["Enums"]["user_role"]
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          field_overrides?: Json | null
          id?: string
          is_system?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          closed_by: string | null
          company_id: string
          corrective_actions: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          documents: Json
          id: string
          incident_date: string
          incident_number: string
          incident_time: string | null
          incident_type: string
          injured_party: string | null
          injury_description: string | null
          job_id: string
          location: string | null
          lost_work_days: number
          medical_treatment: boolean
          osha_recordable: boolean
          osha_report_number: string | null
          photos: Json
          preventive_actions: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          restricted_days: number
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          witnesses: Json
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_id: string
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          documents?: Json
          id?: string
          incident_date: string
          incident_number: string
          incident_time?: string | null
          incident_type?: string
          injured_party?: string | null
          injury_description?: string | null
          job_id: string
          location?: string | null
          lost_work_days?: number
          medical_treatment?: boolean
          osha_recordable?: boolean
          osha_report_number?: string | null
          photos?: Json
          preventive_actions?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          restricted_days?: number
          root_cause?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          witnesses?: Json
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_id?: string
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          documents?: Json
          id?: string
          incident_date?: string
          incident_number?: string
          incident_time?: string | null
          incident_type?: string
          injured_party?: string | null
          injury_description?: string | null
          job_id?: string
          location?: string | null
          lost_work_days?: number
          medical_treatment?: boolean
          osha_recordable?: boolean
          osha_report_number?: string | null
          photos?: Json
          preventive_actions?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          restricted_days?: number
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          witnesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_inspection_items: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string
          id: string
          inspection_id: string
          notes: string | null
          photo_url: string | null
          result: string
          sort_order: number
          updated_at: string
                  deleted_at: string | null
}
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description: string
          id?: string
          inspection_id: string
          notes?: string | null
          photo_url?: string | null
          result?: string
          sort_order?: number
          updated_at?: string
                  deleted_at?: string | null
}
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          inspection_id?: string
          notes?: string | null
          photo_url?: string | null
          result?: string
          sort_order?: number
          updated_at?: string
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "safety_inspection_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_inspection_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "safety_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_inspections: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          failed_items: number
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_required: boolean
          id: string
          inspection_date: string
          inspection_number: string
          inspection_type: string
          inspector_id: string | null
          job_id: string
          location: string | null
          na_items: number
          notes: string | null
          passed_items: number
          result: string | null
          score: number | null
          status: string
          title: string
          total_items: number
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failed_items?: number
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean
          id?: string
          inspection_date: string
          inspection_number: string
          inspection_type?: string
          inspector_id?: string | null
          job_id: string
          location?: string | null
          na_items?: number
          notes?: string | null
          passed_items?: number
          result?: string | null
          score?: number | null
          status?: string
          title: string
          total_items?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failed_items?: number
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean
          id?: string
          inspection_date?: string
          inspection_number?: string
          inspection_type?: string
          inspector_id?: string | null
          job_id?: string
          location?: string | null
          na_items?: number
          notes?: string | null
          passed_items?: number
          result?: string | null
          score?: number | null
          status?: string
          title?: string
          total_items?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_data_sets: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          company_id: string
          content: Json | null
          created_at: string | null
          created_by: string | null
          data_type: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          company_id: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          company_id?: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_data_sets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          company_id: string
          context: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          filter_config: Json
          id: string
          is_global: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          context?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          filter_config?: Json
          id?: string
          is_global?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          context?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          filter_config?: Json
          id?: string
          is_global?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_filters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_baselines: {
        Row: {
          baseline_data: Json
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          job_id: string
          name: string
          snapshot_date: string
        }
        Insert: {
          baseline_data?: Json
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_id: string
          name: string
          snapshot_date?: string
        }
        Update: {
          baseline_data?: Json
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_id?: string
          name?: string
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_baselines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_baselines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_baselines_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string
          id: string
          lag_days: number | null
          predecessor_id: string
          successor_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string
          id?: string
          lag_days?: number | null
          predecessor_id: string
          successor_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string
          id?: string
          lag_days?: number | null
          predecessor_id?: string
          successor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_dependencies_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "schedule_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_dependencies_successor_id_fkey"
            columns: ["successor_id"]
            isOneToOne: false
            referencedRelation: "schedule_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_predictions: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          company_id: string
          confidence_score: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_accepted: boolean | null
          job_id: string
          model_version: string | null
          predicted_value: Json
          prediction_type: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id: string
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_accepted?: boolean | null
          job_id: string
          model_version?: string | null
          predicted_value?: Json
          prediction_type: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id?: string
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_accepted?: boolean | null
          job_id?: string
          model_version?: string | null
          predicted_value?: Json
          prediction_type?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_predictions_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_predictions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_predictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_predictions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_risk_scores: {
        Row: {
          assessed_at: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dependency_component: number | null
          history_component: number | null
          id: string
          job_id: string
          mitigation_suggestions: Json | null
          resource_component: number | null
          risk_factors: Json | null
          risk_level: string
          risk_score: number
          task_id: string | null
          updated_at: string
          weather_component: number | null
        }
        Insert: {
          assessed_at?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dependency_component?: number | null
          history_component?: number | null
          id?: string
          job_id: string
          mitigation_suggestions?: Json | null
          resource_component?: number | null
          risk_factors?: Json | null
          risk_level: string
          risk_score?: number
          task_id?: string | null
          updated_at?: string
          weather_component?: number | null
        }
        Update: {
          assessed_at?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dependency_component?: number | null
          history_component?: number | null
          id?: string
          job_id?: string
          mitigation_suggestions?: Json | null
          resource_component?: number | null
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number
          task_id?: string | null
          updated_at?: string
          weather_component?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_risk_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_risk_scores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_risk_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_scenarios: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          job_id: string
          name: string
          parameters: Json | null
          projected_completion: string | null
          projected_cost_impact: number | null
          results: Json | null
          scenario_type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id: string
          name: string
          parameters?: Json | null
          projected_completion?: string | null
          projected_cost_impact?: number | null
          results?: Json | null
          scenario_type: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id?: string
          name?: string
          parameters?: Json | null
          projected_completion?: string | null
          projected_cost_impact?: number | null
          results?: Json | null
          scenario_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_scenarios_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_scenarios_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_tasks: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assigned_to: string | null
          assigned_vendor_id: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          duration_days: number | null
          id: string
          is_critical_path: boolean | null
          job_id: string
          name: string
          notes: string | null
          parent_task_id: string | null
          phase: string | null
          planned_end: string | null
          planned_start: string | null
          progress_pct: number | null
          sort_order: number | null
          status: string | null
          task_type: string | null
          total_float: number | null
          trade: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_critical_path?: boolean | null
          job_id: string
          name: string
          notes?: string | null
          parent_task_id?: string | null
          phase?: string | null
          planned_end?: string | null
          planned_start?: string | null
          progress_pct?: number | null
          sort_order?: number | null
          status?: string | null
          task_type?: string | null
          total_float?: number | null
          trade?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_critical_path?: boolean | null
          job_id?: string
          name?: string
          notes?: string | null
          parent_task_id?: string | null
          phase?: string | null
          planned_end?: string | null
          planned_start?: string | null
          progress_pct?: number | null
          sort_order?: number | null
          status?: string | null
          task_type?: string | null
          total_float?: number | null
          trade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "schedule_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_weather_events: {
        Row: {
          affected_tasks: Json | null
          auto_logged: boolean | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_date: string
          id: string
          impact_description: string | null
          job_id: string
          notes: string | null
          precipitation_inches: number | null
          schedule_impact_days: number | null
          severity: string
          temperature_high: number | null
          temperature_low: number | null
          updated_at: string
          weather_type: string
          wind_speed_mph: number | null
        }
        Insert: {
          affected_tasks?: Json | null
          auto_logged?: boolean | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_date: string
          id?: string
          impact_description?: string | null
          job_id: string
          notes?: string | null
          precipitation_inches?: number | null
          schedule_impact_days?: number | null
          severity: string
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string
          weather_type: string
          wind_speed_mph?: number | null
        }
        Update: {
          affected_tasks?: Json | null
          auto_logged?: boolean | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_date?: string
          id?: string
          impact_description?: string | null
          job_id?: string
          notes?: string | null
          precipitation_inches?: number | null
          schedule_impact_days?: number | null
          severity?: string
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string
          weather_type?: string
          wind_speed_mph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_weather_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_weather_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_weather_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      selection_categories: {
        Row: {
          allowance_amount: number | null
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          deleted_at: string | null
          designer_access: boolean | null
          id: string
          job_id: string
          lead_time_buffer_days: number | null
          name: string
          notes: string | null
          pricing_model: string
          room: string | null
          sort_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          allowance_amount?: number | null
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deleted_at?: string | null
          designer_access?: boolean | null
          id?: string
          job_id: string
          lead_time_buffer_days?: number | null
          name: string
          notes?: string | null
          pricing_model?: string
          room?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          allowance_amount?: number | null
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deleted_at?: string | null
          designer_access?: boolean | null
          id?: string
          job_id?: string
          lead_time_buffer_days?: number | null
          name?: string
          notes?: string | null
          pricing_model?: string
          room?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      selection_history: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          category_id: string
          company_id: string
          created_at: string
          id: string
          notes: string | null
          option_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          category_id: string
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          option_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          category_id?: string
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "selection_history_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "selection_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      selection_options: {
        Row: {
          availability_status: string | null
          category_id: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_recommended: boolean | null
          lead_time_days: number | null
          model_number: string | null
          name: string
          quantity: number | null
          sku: string | null
          sort_order: number | null
          source: string
          total_price: number | null
          unit_price: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          availability_status?: string | null
          category_id: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_recommended?: boolean | null
          lead_time_days?: number | null
          model_number?: string | null
          name: string
          quantity?: number | null
          sku?: string | null
          sort_order?: number | null
          source?: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          availability_status?: string | null
          category_id?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_recommended?: boolean | null
          lead_time_days?: number | null
          model_number?: string | null
          name?: string
          quantity?: number | null
          sku?: string | null
          sort_order?: number | null
          source?: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "selection_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "selection_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      selections: {
        Row: {
          category_id: string
          change_reason: string | null
          company_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          job_id: string
          option_id: string
          room: string | null
          selected_at: string | null
          selected_by: string | null
          status: string
          superseded_by: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          change_reason?: string | null
          company_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          job_id: string
          option_id: string
          room?: string | null
          selected_at?: string | null
          selected_by?: string | null
          status?: string
          superseded_by?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          change_reason?: string | null
          company_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          job_id?: string
          option_id?: string
          room?: string | null
          selected_at?: string | null
          selected_by?: string | null
          status?: string
          superseded_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "selections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "selection_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selections_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "selection_options"
            referencedColumns: ["id"]
          },
        ]
      }
      submittals: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          id: string
          job_id: string
          notes: string | null
          priority: string
          required_date: string | null
          spec_section: string | null
          status: string
          submission_date: string | null
          submittal_number: string
          submitted_by: string | null
          submitted_to: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id: string
          notes?: string | null
          priority?: string
          required_date?: string | null
          spec_section?: string | null
          status?: string
          submission_date?: string | null
          submittal_number: string
          submitted_by?: string | null
          submitted_to?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          priority?: string
          required_date?: string | null
          spec_section?: string | null
          status?: string
          submission_date?: string | null
          submittal_number?: string
          submitted_by?: string | null
          submitted_to?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submittals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_projects: number | null
          max_users: number | null
          name: string
          price_annual: number
          price_monthly: number
          slug: string
          sort_order: number
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_projects?: number | null
          max_users?: number | null
          name: string
          price_annual?: number
          price_monthly?: number
          slug: string
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_projects?: number | null
          max_users?: number | null
          name?: string
          price_annual?: number
          price_monthly?: number
          slug?: string
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_agent_id: string | null
          category: string
          channel: string
          closed_at: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          first_response_at: string | null
          id: string
          priority: string
          resolved_at: string | null
          satisfaction_rating: number | null
          status: string
          subject: string
          tags: Json
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          category?: string
          channel?: string
          closed_at?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          status?: string
          subject: string
          tags?: Json
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          category?: string
          channel?: string
          closed_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          status?: string
          subject?: string
          tags?: Json
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_conflicts: {
        Row: {
          company_id: string
          connection_id: string
          created_at: string
          entity_type: string
          external_data: Json
          external_id: string
          field_conflicts: Json
          id: string
          internal_data: Json
          internal_id: string
          resolution: string
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          connection_id: string
          created_at?: string
          entity_type: string
          external_data?: Json
          external_id: string
          field_conflicts?: Json
          id?: string
          internal_data?: Json
          internal_id: string
          resolution?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          connection_id?: string
          created_at?: string
          entity_type?: string
          external_data?: Json
          external_id?: string
          field_conflicts?: Json
          id?: string
          internal_data?: Json
          internal_id?: string
          resolution?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_conflicts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "accounting_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          company_id: string
          completed_at: string | null
          connection_id: string
          created_at: string
          direction: string
          entities_created: number
          entities_failed: number
          entities_processed: number
          entities_updated: number
          error_details: Json | null
          id: string
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          connection_id: string
          created_at?: string
          direction: string
          entities_created?: number
          entities_failed?: number
          entities_processed?: number
          entities_updated?: number
          error_details?: Json | null
          id?: string
          started_at?: string
          status?: string
          sync_type: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          direction?: string
          entities_created?: number
          entities_failed?: number
          entities_processed?: number
          entities_updated?: number
          error_details?: Json | null
          id?: string
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "accounting_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_mappings: {
        Row: {
          company_id: string
          connection_id: string
          created_at: string
          entity_type: string
          error_message: string | null
          external_id: string
          external_name: string | null
          id: string
          internal_id: string
          last_synced_at: string | null
          sync_status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          connection_id: string
          created_at?: string
          entity_type: string
          error_message?: string | null
          external_id: string
          external_name?: string | null
          id?: string
          internal_id: string
          last_synced_at?: string | null
          sync_status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          connection_id?: string
          created_at?: string
          entity_type?: string
          error_message?: string | null
          external_id?: string
          external_name?: string | null
          id?: string
          internal_id?: string
          last_synced_at?: string | null
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_mappings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "accounting_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_configs: {
        Row: {
          company_id: string
          created_at: string | null
          data_type: string | null
          description: string | null
          id: string
          is_sensitive: boolean | null
          key: string
          section: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          company_id: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key: string
          section: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          company_id?: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key?: string
          section?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tenant_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_health_scores: {
        Row: {
          active_users_count: number
          adoption_score: number
          churn_probability: number
          company_id: string
          created_at: string
          created_by: string | null
          engagement_score: number
          feature_utilization: Json
          growth_score: number
          id: string
          last_login_at: string | null
          notes: string | null
          overall_score: number
          risk_level: string
          satisfaction_score: number
          score_date: string
          updated_at: string
        }
        Insert: {
          active_users_count?: number
          adoption_score?: number
          churn_probability?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          engagement_score?: number
          feature_utilization?: Json
          growth_score?: number
          id?: string
          last_login_at?: string | null
          notes?: string | null
          overall_score?: number
          risk_level?: string
          satisfaction_score?: number
          score_date?: string
          updated_at?: string
        }
        Update: {
          active_users_count?: number
          adoption_score?: number
          churn_probability?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          engagement_score?: number
          feature_utilization?: Json
          growth_score?: number
          id?: string
          last_login_at?: string | null
          notes?: string | null
          overall_score?: number
          risk_level?: string
          satisfaction_score?: number
          score_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_health_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_health_scores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      terminology_overrides: {
        Row: {
          company_id: string
          context: string | null
          created_at: string | null
          display_value: string
          id: string
          plural_value: string | null
          term_key: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          context?: string | null
          created_at?: string | null
          display_value: string
          id?: string
          plural_value?: string | null
          term_key: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          context?: string | null
          created_at?: string | null
          display_value?: string
          id?: string
          plural_value?: string | null
          term_key?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terminology_overrides_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          collected_at: string | null
          company_display_name: string | null
          company_id: string
          contact_name: string
          contact_title: string | null
          created_at: string | null
          display_on: string[] | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          photo_url: string | null
          quote_text: string
          rating: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          collected_at?: string | null
          company_display_name?: string | null
          company_id: string
          contact_name: string
          contact_title?: string | null
          created_at?: string | null
          display_on?: string[] | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          photo_url?: string | null
          quote_text: string
          rating?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          collected_at?: string | null
          company_display_name?: string | null
          company_id?: string
          contact_name?: string
          contact_title?: string | null
          created_at?: string | null
          display_on?: string[] | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          photo_url?: string | null
          quote_text?: string
          rating?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_internal: boolean
          message_text: string
          sender_id: string | null
          sender_type: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          message_text: string
          sender_id?: string | null
          sender_type?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          message_text?: string
          sender_id?: string | null
          sender_type?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_minutes: number | null
          clock_in: string | null
          clock_out: string | null
          company_id: string
          cost_code_id: string | null
          created_at: string
          deleted_at: string | null
          double_time_hours: number | null
          entry_date: string
          entry_method: string | null
          gps_clock_in: Json | null
          gps_clock_out: Json | null
          id: string
          job_id: string
          notes: string | null
          overtime_hours: number | null
          regular_hours: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          double_time_hours?: number | null
          entry_date?: string
          entry_method?: string | null
          gps_clock_in?: Json | null
          gps_clock_out?: Json | null
          id?: string
          job_id: string
          notes?: string | null
          overtime_hours?: number | null
          regular_hours?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          deleted_at?: string | null
          double_time_hours?: number | null
          entry_date?: string
          entry_method?: string | null
          gps_clock_in?: Json | null
          gps_clock_out?: Json | null
          id?: string
          job_id?: string
          notes?: string | null
          overtime_hours?: number | null
          regular_hours?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entry_allocations: {
        Row: {
          company_id: string
          cost_code_id: string | null
          created_at: string
          hours: number
          id: string
          job_id: string
          notes: string | null
          time_entry_id: string
        }
        Insert: {
          company_id: string
          cost_code_id?: string | null
          created_at?: string
          hours?: number
          id?: string
          job_id: string
          notes?: string | null
          time_entry_id: string
        }
        Update: {
          company_id?: string
          cost_code_id?: string | null
          created_at?: string
          hours?: number
          id?: string
          job_id?: string
          notes?: string | null
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entry_allocations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entry_allocations_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      toolbox_talk_attendees: {
        Row: {
          attendee_id: string | null
          attendee_name: string
          company_id: string
          company_name: string | null
          created_at: string
          id: string
          notes: string | null
          signed: boolean
          signed_at: string | null
          talk_id: string
          trade: string | null
                  deleted_at: string | null
}
        Insert: {
          attendee_id?: string | null
          attendee_name: string
          company_id: string
          company_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          signed?: boolean
          signed_at?: string | null
          talk_id: string
          trade?: string | null
                  deleted_at?: string | null
}
        Update: {
          attendee_id?: string | null
          attendee_name?: string
          company_id?: string
          company_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          signed?: boolean
          signed_at?: string | null
          talk_id?: string
          trade?: string | null
                  deleted_at?: string | null
}
        Relationships: [
          {
            foreignKeyName: "toolbox_talk_attendees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toolbox_talk_attendees_talk_id_fkey"
            columns: ["talk_id"]
            isOneToOne: false
            referencedRelation: "toolbox_talks"
            referencedColumns: ["id"]
          },
        ]
      }
      toolbox_talks: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          job_id: string
          location: string | null
          materials: Json
          notes: string | null
          presenter_id: string | null
          status: string
          talk_date: string
          talk_time: string | null
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          job_id: string
          location?: string | null
          materials?: Json
          notes?: string | null
          presenter_id?: string | null
          status?: string
          talk_date: string
          talk_time?: string | null
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          job_id?: string
          location?: string | null
          materials?: Json
          notes?: string | null
          presenter_id?: string | null
          status?: string
          talk_date?: string
          talk_time?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toolbox_talks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          category: string | null
          company_id: string | null
          content_url: string | null
          course_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number | null
          id: string
          is_published: boolean
          language: string
          module_tag: string | null
          role_tags: string[] | null
          sort_order: number
          thumbnail_url: string | null
          title: string
          transcript: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          content_url?: string | null
          course_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          language?: string
          module_tag?: string | null
          role_tags?: string[] | null
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          transcript?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          category?: string | null
          company_id?: string | null
          content_url?: string | null
          course_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          language?: string
          module_tag?: string | null
          role_tags?: string[] | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_courses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      training_path_items: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_required: boolean
          item_id: string
          item_type: string
          path_id: string
          sort_order: number
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_required?: boolean
          item_id: string
          item_type?: string
          path_id: string
          sort_order?: number
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_required?: boolean
          item_id?: string
          item_type?: string
          path_id?: string
          sort_order?: number
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_path_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "training_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      training_paths: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          is_active: boolean
          name: string
          role_key: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name: string
          role_key?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name?: string
          role_key?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_paths_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_meters: {
        Row: {
          addon_id: string | null
          company_id: string
          created_at: string
          id: string
          meter_type: string
          overage_cost: number
          overage_quantity: number
          period_end: string
          period_start: string
          quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          addon_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          meter_type: string
          overage_cost?: number
          overage_quantity?: number
          period_end: string
          period_start: string
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          addon_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          meter_type?: string
          overage_cost?: number
          overage_quantity?: number
          period_end?: string
          period_start?: string
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_meters_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "plan_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_meters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          assessment_score: number | null
          attempt_count: number
          certification_level: number
          certification_name: string
          certified_at: string | null
          company_id: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          issued_by: string | null
          notes: string | null
          passed: boolean
          passing_score: number | null
          time_limit_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_score?: number | null
          attempt_count?: number
          certification_level?: number
          certification_name: string
          certified_at?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          issued_by?: string | null
          notes?: string | null
          passed?: boolean
          passing_score?: number | null
          time_limit_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_score?: number | null
          attempt_count?: number
          certification_level?: number
          certification_name?: string
          certified_at?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          issued_by?: string | null
          notes?: string | null
          passed?: boolean
          passing_score?: number | null
          time_limit_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_memberships: {
        Row: {
          accepted_at: string | null
          auth_user_id: string
          company_id: string
          created_at: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          auth_user_id: string
          company_id: string
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          auth_user_id?: string
          company_id?: string
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          name: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          token_hash: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          name?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          token_hash: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          name?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          token_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          category: string
          channel: string
          company_id: string
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          channel: string
          company_id: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          channel?: string
          company_id?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          company_id: string
          created_at: string | null
          critical_bypass_quiet: boolean | null
          digest_frequency: string | null
          digest_mode: boolean | null
          digest_time: string | null
          id: string
          quiet_end: string | null
          quiet_start: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          critical_bypass_quiet?: boolean | null
          digest_frequency?: string | null
          digest_mode?: boolean | null
          digest_time?: string | null
          id?: string
          quiet_end?: string | null
          quiet_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          critical_bypass_quiet?: boolean | null
          digest_frequency?: string | null
          digest_mode?: boolean | null
          digest_time?: string | null
          id?: string
          quiet_end?: string | null
          quiet_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_training_progress: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          id: string
          item_id: string
          item_type: string
          progress_pct: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          item_id: string
          item_type?: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_training_progress_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_compliance: {
        Row: {
          company_id: string
          created_at: string | null
          document_id: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          requirement_name: string
          requirement_type: string
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_id?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          requirement_name: string
          requirement_type: string
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_id?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          requirement_name?: string
          requirement_type?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_compliance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_compliance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          company_id: string
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          title: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          title?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          title?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_insurance: {
        Row: {
          carrier_name: string
          certificate_document_id: string | null
          company_id: string
          coverage_amount: number | null
          created_at: string | null
          deleted_at: string | null
          expiration_date: string
          id: string
          insurance_type: string
          policy_number: string
          status: string
          updated_at: string | null
          vendor_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          carrier_name: string
          certificate_document_id?: string | null
          company_id: string
          coverage_amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          expiration_date: string
          id?: string
          insurance_type: string
          policy_number: string
          status?: string
          updated_at?: string | null
          vendor_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          carrier_name?: string
          certificate_document_id?: string | null
          company_id?: string
          coverage_amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          expiration_date?: string
          id?: string
          insurance_type?: string
          policy_number?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_insurance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_insurance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_item_prices: {
        Row: {
          company_id: string
          created_at: string
          effective_date: string
          id: string
          lead_time_days: number | null
          master_item_id: string
          min_order_qty: number | null
          notes: string | null
          unit_price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          effective_date?: string
          id?: string
          lead_time_days?: number | null
          master_item_id: string
          min_order_qty?: number | null
          notes?: string | null
          unit_price?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          effective_date?: string
          id?: string
          lead_time_days?: number | null
          master_item_id?: string
          min_order_qty?: number | null
          notes?: string | null
          unit_price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_item_prices_master_item_id_fkey"
            columns: ["master_item_id"]
            isOneToOne: false
            referencedRelation: "master_items"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_job_performance: {
        Row: {
          bid_amount: number | null
          budget_adherence_rating: number | null
          change_order_count: number | null
          communication_rating: number | null
          company_id: string
          created_at: string
          deleted_at: string | null
          final_amount: number | null
          id: string
          inspection_pass_rate: number | null
          job_id: string
          overall_rating: number | null
          punch_items_count: number | null
          punch_resolution_avg_days: number | null
          quality_rating: number | null
          rated_by: string | null
          rating_notes: string | null
          safety_rating: number | null
          tasks_on_time: number | null
          tasks_total: number | null
          timeliness_rating: number | null
          trade: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          bid_amount?: number | null
          budget_adherence_rating?: number | null
          change_order_count?: number | null
          communication_rating?: number | null
          company_id: string
          created_at?: string
          deleted_at?: string | null
          final_amount?: number | null
          id?: string
          inspection_pass_rate?: number | null
          job_id: string
          overall_rating?: number | null
          punch_items_count?: number | null
          punch_resolution_avg_days?: number | null
          quality_rating?: number | null
          rated_by?: string | null
          rating_notes?: string | null
          safety_rating?: number | null
          tasks_on_time?: number | null
          tasks_total?: number | null
          timeliness_rating?: number | null
          trade?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          bid_amount?: number | null
          budget_adherence_rating?: number | null
          change_order_count?: number | null
          communication_rating?: number | null
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          final_amount?: number | null
          id?: string
          inspection_pass_rate?: number | null
          job_id?: string
          overall_rating?: number | null
          punch_items_count?: number | null
          punch_resolution_avg_days?: number | null
          quality_rating?: number | null
          rated_by?: string | null
          rating_notes?: string | null
          safety_rating?: number | null
          tasks_on_time?: number | null
          tasks_total?: number | null
          timeliness_rating?: number | null
          trade?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_messages: {
        Row: {
          attachments: Json
          body: string
          company_id: string
          created_at: string
          deleted_at: string | null
          direction: string
          id: string
          is_read: boolean
          job_id: string | null
          parent_message_id: string | null
          read_at: string | null
          sender_id: string | null
          subject: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          attachments?: Json
          body: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          direction?: string
          id?: string
          is_read?: boolean
          job_id?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          sender_id?: string | null
          subject: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          attachments?: Json
          body?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          direction?: string
          id?: string
          is_read?: boolean
          job_id?: string | null
          parent_message_id?: string | null
          read_at?: string | null
          sender_id?: string | null
          subject?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "vendor_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_notes: {
        Row: {
          author_id: string | null
          body: string
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_internal: boolean | null
          tags: Json | null
          title: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_portal_access: {
        Row: {
          access_level: string
          allowed_job_ids: Json
          can_send_messages: boolean
          can_submit_daily_reports: boolean
          can_submit_invoices: boolean
          can_submit_lien_waivers: boolean
          can_upload_documents: boolean
          can_view_purchase_orders: boolean
          can_view_schedule: boolean
          company_id: string
          created_at: string
          deleted_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          access_level?: string
          allowed_job_ids?: Json
          can_send_messages?: boolean
          can_submit_daily_reports?: boolean
          can_submit_invoices?: boolean
          can_submit_lien_waivers?: boolean
          can_upload_documents?: boolean
          can_view_purchase_orders?: boolean
          can_view_schedule?: boolean
          company_id: string
          created_at?: string
          deleted_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          access_level?: string
          allowed_job_ids?: Json
          can_send_messages?: boolean
          can_submit_daily_reports?: boolean
          can_submit_invoices?: boolean
          can_submit_lien_waivers?: boolean
          can_upload_documents?: boolean
          can_view_purchase_orders?: boolean
          can_view_schedule?: boolean
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_portal_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_portal_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          contact_name: string | null
          created_at: string
          deleted_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          message: string | null
          phone: string | null
          status: string
          token: string
          updated_at: string
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          message?: string | null
          phone?: string | null
          status?: string
          token: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          message?: string | null
          phone?: string | null
          status?: string
          token?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_portal_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_portal_settings: {
        Row: {
          allow_self_registration: boolean
          allowed_submission_types: Json
          auto_approve_submissions: boolean
          company_id: string
          created_at: string
          deleted_at: string | null
          id: string
          notification_settings: Json
          portal_branding: Json
          portal_enabled: boolean
          portal_welcome_message: string | null
          require_approval: boolean
          required_compliance_docs: Json
          updated_at: string
        }
        Insert: {
          allow_self_registration?: boolean
          allowed_submission_types?: Json
          auto_approve_submissions?: boolean
          company_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notification_settings?: Json
          portal_branding?: Json
          portal_enabled?: boolean
          portal_welcome_message?: string | null
          require_approval?: boolean
          required_compliance_docs?: Json
          updated_at?: string
        }
        Update: {
          allow_self_registration?: boolean
          allowed_submission_types?: Json
          auto_approve_submissions?: boolean
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notification_settings?: Json
          portal_branding?: Json
          portal_enabled?: boolean
          portal_welcome_message?: string | null
          require_approval?: boolean
          required_compliance_docs?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_portal_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ratings: {
        Row: {
          category: string
          company_id: string
          created_at: string | null
          id: string
          job_id: string | null
          rated_by: string | null
          rating: number
          review_text: string | null
          vendor_id: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          rated_by?: string | null
          rating: number
          review_text?: string | null
          vendor_id: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          rated_by?: string | null
          rating?: number
          review_text?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ratings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_score_history: {
        Row: {
          budget_adherence_score: number | null
          communication_score: number | null
          company_id: string
          created_at: string
          id: string
          notes: string | null
          overall_score: number | null
          quality_score: number | null
          safety_score: number | null
          snapshot_date: string
          timeliness_score: number | null
          vendor_id: string
          vendor_score_id: string
        }
        Insert: {
          budget_adherence_score?: number | null
          communication_score?: number | null
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          overall_score?: number | null
          quality_score?: number | null
          safety_score?: number | null
          snapshot_date?: string
          timeliness_score?: number | null
          vendor_id: string
          vendor_score_id: string
        }
        Update: {
          budget_adherence_score?: number | null
          communication_score?: number | null
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          overall_score?: number | null
          quality_score?: number | null
          safety_score?: number | null
          snapshot_date?: string
          timeliness_score?: number | null
          vendor_id?: string
          vendor_score_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_score_history_vendor_score_id_fkey"
            columns: ["vendor_score_id"]
            isOneToOne: false
            referencedRelation: "vendor_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_scores: {
        Row: {
          budget_adherence_score: number | null
          calculated_at: string | null
          calculation_window_months: number | null
          communication_score: number | null
          company_id: string
          created_at: string
          created_by: string | null
          data_point_count: number | null
          deleted_at: string | null
          id: string
          manual_adjustment: number | null
          manual_adjustment_reason: string | null
          overall_score: number | null
          quality_score: number | null
          safety_score: number | null
          timeliness_score: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          budget_adherence_score?: number | null
          calculated_at?: string | null
          calculation_window_months?: number | null
          communication_score?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          data_point_count?: number | null
          deleted_at?: string | null
          id?: string
          manual_adjustment?: number | null
          manual_adjustment_reason?: string | null
          overall_score?: number | null
          quality_score?: number | null
          safety_score?: number | null
          timeliness_score?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          budget_adherence_score?: number | null
          calculated_at?: string | null
          calculation_window_months?: number | null
          communication_score?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          data_point_count?: number | null
          deleted_at?: string | null
          id?: string
          manual_adjustment?: number | null
          manual_adjustment_reason?: string | null
          overall_score?: number | null
          quality_score?: number | null
          safety_score?: number | null
          timeliness_score?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_submissions: {
        Row: {
          amount: number | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          file_urls: Json
          id: string
          job_id: string | null
          metadata: Json
          reference_number: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_type: string
          submitted_at: string | null
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          file_urls?: Json
          id?: string
          job_id?: string | null
          metadata?: Json
          reference_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_type: string
          submitted_at?: string | null
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          file_urls?: Json
          id?: string
          job_id?: string | null
          metadata?: Json
          reference_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_type?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_submissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_trades: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          trade_name: string
          vendor_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          trade_name: string
          vendor_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          trade_name?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_trades_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_trades_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_warranty_callbacks: {
        Row: {
          company_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          job_id: string
          reported_by: string | null
          reported_date: string | null
          resolution_cost: number | null
          resolution_days: number | null
          resolution_notes: string | null
          resolved_by: string | null
          resolved_date: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id: string
          reported_by?: string | null
          reported_date?: string | null
          resolution_cost?: number | null
          resolution_days?: number | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          job_id?: string
          reported_by?: string | null
          reported_date?: string | null
          resolution_cost?: number | null
          resolution_days?: number | null
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          tax_id: string | null
          trade: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          trade?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          trade?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      warranties: {
        Row: {
          company_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          coverage_details: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          document_id: string | null
          end_date: string
          exclusions: string | null
          id: string
          job_id: string
          start_date: string
          status: string
          title: string
          transferred_at: string | null
          transferred_to: string | null
          updated_at: string
          vendor_id: string | null
          warranty_type: string
        }
        Insert: {
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_details?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          document_id?: string | null
          end_date: string
          exclusions?: string | null
          id?: string
          job_id: string
          start_date: string
          status?: string
          title: string
          transferred_at?: string | null
          transferred_to?: string | null
          updated_at?: string
          vendor_id?: string | null
          warranty_type?: string
        }
        Update: {
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_details?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          document_id?: string | null
          end_date?: string
          exclusions?: string | null
          id?: string
          job_id?: string
          start_date?: string
          status?: string
          title?: string
          transferred_at?: string | null
          transferred_to?: string | null
          updated_at?: string
          vendor_id?: string | null
          warranty_type?: string
        }
        Relationships: []
      }
      warranty_claim_history: {
        Row: {
          action: string
          claim_id: string
          company_id: string
          created_at: string
          details: Json | null
          id: string
          new_status: string | null
          performed_by: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          claim_id: string
          company_id: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          performed_by?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          claim_id?: string
          company_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          performed_by?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_claim_history_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "warranty_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_claims: {
        Row: {
          assigned_to: string | null
          assigned_vendor_id: string | null
          claim_number: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          id: string
          photos: Json | null
          priority: string
          reported_by: string | null
          reported_date: string
          resolution_cost: number | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          updated_at: string
          warranty_id: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          claim_number: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          photos?: Json | null
          priority?: string
          reported_by?: string | null
          reported_date?: string
          resolution_cost?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          updated_at?: string
          warranty_id: string
        }
        Update: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          claim_number?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          photos?: Json | null
          priority?: string
          reported_by?: string | null
          reported_date?: string
          resolution_cost?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          warranty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_claims_warranty_id_fkey"
            columns: ["warranty_id"]
            isOneToOne: false
            referencedRelation: "warranties"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_records: {
        Row: {
          company_id: string
          conditions: string | null
          created_at: string | null
          deleted_at: string | null
          high_temp: number | null
          id: string
          is_work_day: boolean | null
          job_id: string
          low_temp: number | null
          notes: string | null
          precipitation_inches: number | null
          record_date: string
          updated_at: string | null
          wind_mph: number | null
        }
        Insert: {
          company_id: string
          conditions?: string | null
          created_at?: string | null
          deleted_at?: string | null
          high_temp?: number | null
          id?: string
          is_work_day?: boolean | null
          job_id: string
          low_temp?: number | null
          notes?: string | null
          precipitation_inches?: number | null
          record_date: string
          updated_at?: string | null
          wind_mph?: number | null
        }
        Update: {
          company_id?: string
          conditions?: string | null
          created_at?: string | null
          deleted_at?: string | null
          high_temp?: number | null
          id?: string
          is_work_day?: boolean | null
          job_id?: string
          low_temp?: number | null
          notes?: string | null
          precipitation_inches?: number | null
          record_date?: string
          updated_at?: string | null
          wind_mph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weather_records_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          company_id: string
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status_code: number | null
          status: string
          subscription_id: string
        }
        Insert: {
          attempt_count?: number
          company_id: string
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status_code?: number | null
          status?: string
          subscription_id: string
        }
        Update: {
          attempt_count?: number
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status_code?: number | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          events: Json
          failure_count: number
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          max_retries: number
          retry_count: number
          secret: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          events?: Json
          failure_count?: number
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          max_retries?: number
          retry_count?: number
          secret: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          events?: Json
          failure_count?: number
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          max_retries?: number
          retry_count?: number
          secret?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          company_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          notifications: Json | null
          states: Json
          thresholds: Json | null
          transitions: Json
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          notifications?: Json | null
          states?: Json
          thresholds?: Json | null
          transitions?: Json
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          notifications?: Json | null
          states?: Json
          thresholds?: Json | null
          transitions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_definitions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_metrics: { Args: never; Returns: number }
      get_config_value: {
        Args: {
          p_company_id: string
          p_default?: Json
          p_key: string
          p_section: string
        }
        Returns: Json
      }
      get_current_company_id: { Args: never; Returns: string }
      get_invitation_by_token: {
        Args: { p_token_hash: string }
        Returns: {
          accepted_at: string
          company_id: string
          company_name: string
          email: string
          expires_at: string
          id: string
          name: string
          revoked_at: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_next_sequence_number: {
        Args: { p_company_id: string; p_entity_type: string; p_job_id?: string }
        Returns: string
      }
      get_user_companies: {
        Args: { p_auth_user_id?: string }
        Returns: {
          company_id: string
          company_name: string
          is_current: boolean
          membership_id: string
          role: string
          status: string
        }[]
      }
      get_user_company_id: { Args: never; Returns: string }
      is_feature_enabled: {
        Args: { p_company_id: string; p_flag_key: string }
        Returns: boolean
      }
      user_has_role: { Args: { allowed_roles: string[] }; Returns: boolean }
    }
    Enums: {
      contract_type: "fixed_price" | "cost_plus" | "time_materials"
      draw_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "submitted"
        | "funded"
        | "rejected"
      inventory_location_type: "warehouse" | "job_site" | "vehicle" | "other"
      inventory_transaction_type:
        | "receive"
        | "transfer"
        | "consume"
        | "adjust"
        | "return"
      invoice_status:
        | "draft"
        | "pm_pending"
        | "accountant_pending"
        | "owner_pending"
        | "approved"
        | "in_draw"
        | "paid"
        | "denied"
      job_status:
        | "pre_construction"
        | "active"
        | "on_hold"
        | "completed"
        | "warranty"
        | "cancelled"
      material_request_priority: "low" | "normal" | "high" | "urgent"
      material_request_status:
        | "draft"
        | "submitted"
        | "approved"
        | "partially_fulfilled"
        | "fulfilled"
        | "rejected"
      user_role:
        | "owner"
        | "admin"
        | "pm"
        | "superintendent"
        | "office"
        | "field"
        | "read_only"
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
      contract_type: ["fixed_price", "cost_plus", "time_materials"],
      draw_status: [
        "draft",
        "pending_approval",
        "approved",
        "submitted",
        "funded",
        "rejected",
      ],
      inventory_location_type: ["warehouse", "job_site", "vehicle", "other"],
      inventory_transaction_type: [
        "receive",
        "transfer",
        "consume",
        "adjust",
        "return",
      ],
      invoice_status: [
        "draft",
        "pm_pending",
        "accountant_pending",
        "owner_pending",
        "approved",
        "in_draw",
        "paid",
        "denied",
      ],
      job_status: [
        "pre_construction",
        "active",
        "on_hold",
        "completed",
        "warranty",
        "cancelled",
      ],
      material_request_priority: ["low", "normal", "high", "urgent"],
      material_request_status: [
        "draft",
        "submitted",
        "approved",
        "partially_fulfilled",
        "fulfilled",
        "rejected",
      ],
      user_role: [
        "owner",
        "admin",
        "pm",
        "superintendent",
        "office",
        "field",
        "read_only",
      ],
    },
  },
} as const

// ── Convenience type aliases ─────────────────────────────────────────

export type Company = Tables<'companies'>
export type User = Tables<'users'>
export type Job = Tables<'jobs'>
export type Client = Tables<'clients'>
export type Vendor = Tables<'vendors'>
export type CostCode = Tables<'cost_codes'>
// JobAssignment: table 'job_assignments' not yet in live DB
export type JobAssignment = { id: string; company_id: string; [key: string]: unknown }
export type Role = Tables<'roles'>
// Permission: table 'permissions' not yet in live DB
export type Permission = { id: string; company_id: string; [key: string]: unknown }
// RolePermission: table 'role_permissions' not yet in live DB
export type RolePermission = { id: string; company_id: string; [key: string]: unknown }
export type RoleRow = Tables<'roles'>
// RoleHierarchy: table 'role_hierarchy' not yet in live DB
export type RoleHierarchy = { id: string; company_id: string; [key: string]: unknown }
export type AuditLog = Tables<'audit_log'>
// SessionInfo: table 'sessions' not yet in live DB
export type SessionInfo = { id: string; company_id: string; [key: string]: unknown }
export type TenantConfig = Tables<'tenant_configs'>
export type FeatureFlag = Tables<'feature_flags'>
export type WorkflowDefinition = Tables<'workflow_definitions'>
export type ProjectPhase = Tables<'project_phases'>
export type TerminologyOverride = Tables<'terminology_overrides'>
export type NumberingPattern = Tables<'numbering_patterns'>
export type NumberingSequence = Tables<'numbering_sequences'>
export type CustomFieldDefinition = Tables<'custom_field_definitions'>
export type CustomFieldValue = Tables<'custom_field_values'>
export type ConfigVersion = Tables<'config_versions'>
export type PlatformDefault = Tables<'platform_defaults'>
export type DefaultTerminology = Tables<'default_terminology'>
export type ScheduleTask = Tables<'schedule_tasks'>
export type TaskDependency = Tables<'schedule_dependencies'>
export type DailyLog = Tables<'daily_logs'>
export type DailyLogEntry = Tables<'daily_log_entries'>
export type BudgetLine = Tables<'budget_lines'>
export type CostEntry = Tables<'cost_transactions'>
export type VendorInsurance = Tables<'vendor_insurance'>
export type VendorContact = Tables<'vendor_contacts'>
export type GlAccount = Tables<'gl_accounts'>
export type JournalEntry = Tables<'gl_journal_entries'>
export type JournalEntryLine = Tables<'gl_journal_lines'>
export type Invoice = Tables<'invoices'>
export type InvoiceLine = Tables<'ar_invoice_lines'>
export type Payment = Tables<'ap_payments'>
export type PaymentApplication = Tables<'ap_payment_applications'>
export type ClientPortalConfig = Tables<'client_portal_settings'>
export type ClientPortalMessage = Tables<'client_messages'>
export type ClientApproval = Tables<'client_approvals'>
export type AiInvoice = Tables<'invoice_extractions'>
export type LienWaiver = Tables<'lien_waivers'>
export type DrawRequest = Tables<'draw_requests'>
export type DrawRequestLine = Tables<'draw_request_lines'>
export type AccountingConnection = Tables<'accounting_connections'>
export type AccountingSyncLog = Tables<'sync_logs'>
export type ChangeOrder = Tables<'change_orders'>
export type ChangeOrderLine = Tables<'change_order_items'>
export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderLine = Tables<'purchase_order_lines'>
export type FinancialReport = Tables<'custom_reports'>
export type SavedReport = Tables<'report_snapshots'>
export type Estimate = Tables<'estimates'>
export type EstimateLine = Tables<'estimate_line_items'>
export type AssemblyTemplate = Tables<'assemblies'>
export type Selection = Tables<'selections'>
export type SelectionOption = Tables<'selection_options'>
export type SelectionChoice = Tables<'selection_options'>
export type VendorScorecard = Tables<'vendor_scores'>
export type VendorReview = Tables<'vendor_score_history'>
export type PriceEntry = Tables<'price_history'>
export type ProcessedDocument = Tables<'document_extractions'>
export type DocumentExtractionRule = Tables<'extraction_rules'>
export type WeatherForecast = Tables<'schedule_weather_events'>
export type ScheduleOptimization = Tables<'schedule_scenarios'>
export type BidPackage = Tables<'bid_packages'>
export type BidInvitation = Tables<'bid_invitations'>
export type BidResponse = Tables<'bid_responses'>
export type Rfi = Tables<'rfis'>
export type RfiResponse = Tables<'rfi_responses'>
export type PunchItem = Tables<'punch_items'>
export type ClientPortalPayment = Tables<'client_payments'>
export type ClientSelectionApproval = Tables<'client_approvals'>
export type VendorPortalConfig = Tables<'vendor_portal_settings'>
export type WarrantyClaim = Tables<'warranty_claims'>
export type WarrantyItem = Tables<'warranties'>
export type MaintenanceSchedule = Tables<'maintenance_schedules'>
export type MaintenanceTask = Tables<'maintenance_tasks'>
export type Permit = Tables<'permits'>
export type Inspection = Tables<'inspection_results'>
export type SafetyIncident = Tables<'safety_incidents'>
export type ToolboxTalk = Tables<'toolbox_talks'>
export type Employee = Tables<'employees'>
export type Certification = Tables<'employee_certifications'>
export type Equipment = Tables<'equipment'>
export type EquipmentMaintenance = Tables<'equipment_maintenance'>
export type Lead = Tables<'leads'>
export type LeadActivity = Tables<'lead_activities'>
export type PortfolioProject = Tables<'portfolio_projects'>
export type ClientReview = Tables<'client_reviews'>
export type Contract = Tables<'contracts'>
export type ContractTemplate = Tables<'contract_templates'>
export type SignatureRequest = Tables<'contract_signers'>
export type ReportDefinition = Tables<'report_definitions'>
export type ReportSchedule = Tables<'report_schedules'>
export type TimeEntry = Tables<'time_entries'>
// CrewAssignment: table 'crew_assignments' not yet in live DB
export type CrewAssignment = { id: string; company_id: string; [key: string]: unknown }
export type InventoryItem = Tables<'inventory_items'>
export type InventoryTransaction = Tables<'inventory_transactions'>
export type Document = Tables<'documents'>
export type DocumentFolder = Tables<'document_folders'>
export type Notification = Tables<'notifications'>
export type NotificationPreference = Tables<'user_notification_preferences'>
export type OnboardingSession = Tables<'onboarding_sessions'>
export type OnboardingMilestone = Tables<'onboarding_milestones'>
export type OnboardingReminder = Tables<'onboarding_reminders'>
export type OnboardingChecklist = Tables<'onboarding_checklists'>
export type SampleDataSet = Tables<'sample_data_sets'>
export type MigrationJob = Tables<'migration_jobs'>
export type MigrationFieldMapping = Tables<'migration_field_mappings'>
export type MigrationMappingTemplate = Tables<'migration_mapping_templates'>
export type MigrationValidationResult = Tables<'migration_validation_results'>
export type MigrationReconciliation = Tables<'migration_reconciliation'>
export type SubscriptionPlan = Tables<'subscription_plans'>
export type PlanAddon = Tables<'plan_addons'>
export type CompanySubscription = Tables<'company_subscriptions'>
export type UsageMeter = Tables<'usage_meters'>
export type BillingEvent = Tables<'billing_events'>
export type BuilderBranding = Tables<'builder_branding'>
export type BuilderCustomDomain = Tables<'builder_custom_domains'>
export type BuilderEmailConfig = Tables<'builder_email_config'>
export type BuilderTerminology = Tables<'builder_terminology'>
export type BuilderContentPage = Tables<'builder_content_pages'>
export type ApiKey = Tables<'api_keys'>
export type ApiMetric = Tables<'api_metrics'>
export type WebhookSubscription = Tables<'webhook_subscriptions'>
export type WebhookDelivery = Tables<'webhook_deliveries'>
export type IntegrationListing = Tables<'integration_listings'>
export type IntegrationInstall = Tables<'integration_installs'>
export type SupportTicket = Tables<'support_tickets'>
export type TicketMessage = Tables<'ticket_messages'>
export type KbArticle = Tables<'kb_articles'>
export type FeatureRequest = Tables<'feature_requests'>
export type FeatureRequestVote = Tables<'feature_request_votes'>
export type TrainingCourse = Tables<'training_courses'>
export type TrainingPath = Tables<'training_paths'>
export type TrainingPathItem = Tables<'training_path_items'>
export type UserTrainingProgress = Tables<'user_training_progress'>
export type UserCertification = Tables<'user_certifications'>
export type MarketplacePublisher = Tables<'marketplace_publishers'>
export type MarketplaceTemplate = Tables<'marketplace_templates'>
export type MarketplaceTemplateVersion = Tables<'marketplace_template_versions'>
export type MarketplaceInstall = Tables<'marketplace_installs'>
export type MarketplaceReview = Tables<'marketplace_reviews'>
export type PlatformMetricsSnapshot = Tables<'platform_metrics_snapshots'>
export type TenantHealthScore = Tables<'tenant_health_scores'>
export type FeatureUsageEvent = Tables<'feature_usage_events'>
export type AbExperiment = Tables<'ab_experiments'>
export type DeploymentRelease = Tables<'deployment_releases'>
export type MarketingLead = Tables<'marketing_leads'>
export type MarketingCampaign = Tables<'marketing_campaigns'>
export type MarketingReferral = Tables<'marketing_referrals'>
export type CampaignContact = Tables<'campaign_contacts'>
export type Testimonial = Tables<'testimonials'>
export type CaseStudy = Tables<'case_studies'>
export type BlogPost = Tables<'blog_posts'>

// Enum convenience types
export type JobStatus = Enums<'job_status'>
export type ContractType = Enums<'contract_type'>
export type UserRoleEnum = Enums<'user_role'>
export type InvoiceStatus = Enums<'invoice_status'>
export type DrawStatus = Enums<'draw_status'>
export type MaterialRequestStatus = Enums<'material_request_status'>
export type MaterialRequestPriority = Enums<'material_request_priority'>
export type InventoryLocationType = Enums<'inventory_location_type'>
export type InventoryTransactionType = Enums<'inventory_transaction_type'>

// UserRole = the user_role enum (used by settings components)
export type UserRole = Enums<'user_role'>

// Insert types
export type CompanyInsert = TablesInsert<'companies'>
export type UserInsert = TablesInsert<'users'>
export type JobInsert = TablesInsert<'jobs'>
export type ClientInsert = TablesInsert<'clients'>
export type VendorInsert = TablesInsert<'vendors'>

// Update types
export type CompanyUpdate = TablesUpdate<'companies'>
export type UserUpdate = TablesUpdate<'users'>
export type JobUpdate = TablesUpdate<'jobs'>
export type ClientUpdate = TablesUpdate<'clients'>
export type VendorUpdate = TablesUpdate<'vendors'>

// Notification enum types (manual — not DB enums)
export type NotificationCategory = 'financial' | 'schedule' | 'documents' | 'field_operations' | 'approvals' | 'system'
export type NotificationUrgency = 'low' | 'normal' | 'high' | 'critical'
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'
export type DeliveryStatus = 'queued' | 'processing' | 'sent' | 'delivered' | 'failed' | 'bounced'
export type DigestFrequency = 'hourly' | 'twice_daily' | 'daily'

// Notification complex types (manual — not DB tables)
export type NotificationEventType = {
  id: string
  event_type: string
  module: string
  description: string
  default_channels: string[]
  default_roles: string[]
  variables: string[]
  urgency: string
  category: string
  created_at: string
  [key: string]: unknown
}
export type NotificationDelivery = {
  id: string
  notification_id: string
  channel: NotificationChannel
  status: DeliveryStatus
  provider_message_id: string | null
  attempts: number
  last_attempt_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}
export type UserNotificationPreference = {
  id: string
  user_id: string
  company_id: string
  category: string
  channel: string
  enabled: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown
}
export type UserNotificationSetting = {
  id: string
  user_id: string
  company_id: string
  quiet_start: string
  quiet_end: string
  timezone: string
  digest_mode: boolean
  digest_frequency: string
  digest_time: string
  critical_bypass_quiet: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown
}

// New table convenience types
export type JobPhoto = Tables<'job_photos'>
export type Communication = Tables<'communications'>
export type Submittal = Tables<'submittals'>

// Project/entity enum types (manual — not DB enums)
export type ProjectType = 'new_construction' | 'renovation' | 'addition' | 'remodel' | 'commercial' | 'other'
export type CostCodeCategory = 'labor' | 'material' | 'subcontractor' | 'equipment' | 'other'
