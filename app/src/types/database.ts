// Database types - will be generated from Supabase later via `npm run db:generate`
// For now, define core types manually based on migration schema

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
          legal_name: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          logo_url: string | null
          primary_color: string | null
          settings: Json | null
          subscription_tier: string
          subscription_status: string
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          legal_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          logo_url?: string | null
          primary_color?: string | null
          settings?: Json | null
          subscription_tier?: string
          subscription_status?: string
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          legal_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          logo_url?: string | null
          primary_color?: string | null
          settings?: Json | null
          subscription_tier?: string
          subscription_status?: string
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          name: string
          role: UserRole
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          last_login_at: string | null
          preferences: Json | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          name: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          preferences?: Json | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          name?: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          preferences?: Json | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          company_id: string
          name: string
          company_name: string | null
          email: string | null
          phone: string | null
          mobile_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          spouse_name: string | null
          spouse_email: string | null
          spouse_phone: string | null
          lead_source: string | null
          referred_by: string | null
          portal_enabled: boolean
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          mobile_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          spouse_name?: string | null
          spouse_email?: string | null
          spouse_phone?: string | null
          lead_source?: string | null
          referred_by?: string | null
          portal_enabled?: boolean
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          mobile_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          spouse_name?: string | null
          spouse_email?: string | null
          spouse_phone?: string | null
          lead_source?: string | null
          referred_by?: string | null
          portal_enabled?: boolean
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          client_id: string | null
          name: string
          job_number: string | null
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          latitude: number | null
          longitude: number | null
          project_type: ProjectType
          status: JobStatus
          contract_type: ContractType
          contract_amount: number | null
          cost_plus_markup: number | null
          start_date: string | null
          target_completion: string | null
          actual_completion: string | null
          sqft_conditioned: number | null
          sqft_total: number | null
          sqft_garage: number | null
          bedrooms: number | null
          bathrooms: number | null
          stories: number | null
          budget_total: number
          committed_total: number
          invoiced_total: number
          paid_total: number
          billed_total: number
          received_total: number
          settings: Json
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          client_id?: string | null
          name: string
          job_number?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          latitude?: number | null
          longitude?: number | null
          project_type?: ProjectType
          status?: JobStatus
          contract_type?: ContractType
          contract_amount?: number | null
          cost_plus_markup?: number | null
          start_date?: string | null
          target_completion?: string | null
          actual_completion?: string | null
          sqft_conditioned?: number | null
          sqft_total?: number | null
          sqft_garage?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          stories?: number | null
          budget_total?: number
          committed_total?: number
          invoiced_total?: number
          paid_total?: number
          billed_total?: number
          received_total?: number
          settings?: Json
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          client_id?: string | null
          name?: string
          job_number?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          latitude?: number | null
          longitude?: number | null
          project_type?: ProjectType
          status?: JobStatus
          contract_type?: ContractType
          contract_amount?: number | null
          cost_plus_markup?: number | null
          start_date?: string | null
          target_completion?: string | null
          actual_completion?: string | null
          sqft_conditioned?: number | null
          sqft_total?: number | null
          sqft_garage?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          stories?: number | null
          budget_total?: number
          committed_total?: number
          invoiced_total?: number
          paid_total?: number
          billed_total?: number
          received_total?: number
          settings?: Json
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          company_id: string
          name: string
          dba_name: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          trade: string | null
          trades: string[] | null
          tax_id: string | null
          license_number: string | null
          license_expiration: string | null
          insurance_expiration: string | null
          gl_coverage_amount: number | null
          workers_comp_expiration: string | null
          payment_terms: string
          default_cost_code_id: string | null
          is_active: boolean
          is_1099: boolean
          w9_on_file: boolean
          performance_score: number | null
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          dba_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          trade?: string | null
          trades?: string[] | null
          tax_id?: string | null
          license_number?: string | null
          license_expiration?: string | null
          insurance_expiration?: string | null
          gl_coverage_amount?: number | null
          workers_comp_expiration?: string | null
          payment_terms?: string
          default_cost_code_id?: string | null
          is_active?: boolean
          is_1099?: boolean
          w9_on_file?: boolean
          performance_score?: number | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          dba_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          trade?: string | null
          trades?: string[] | null
          tax_id?: string | null
          license_number?: string | null
          license_expiration?: string | null
          insurance_expiration?: string | null
          gl_coverage_amount?: number | null
          workers_comp_expiration?: string | null
          payment_terms?: string
          default_cost_code_id?: string | null
          is_active?: boolean
          is_1099?: boolean
          w9_on_file?: boolean
          performance_score?: number | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
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
          status: InvoiceStatus
          invoice_date: string | null
          due_date: string | null
          notes: string | null
          version: number
          currency_code: string
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
          status?: InvoiceStatus
          invoice_date?: string | null
          due_date?: string | null
          notes?: string | null
          version?: number
          currency_code?: string
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
          status?: InvoiceStatus
          invoice_date?: string | null
          due_date?: string | null
          notes?: string | null
          version?: number
          currency_code?: string
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
          status: DrawStatus
          submitted_date: string | null
          funded_date: string | null
          notes: string | null
          version: number
          currency_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          job_id: string
          draw_number?: number
          amount: number
          status?: DrawStatus
          submitted_date?: string | null
          funded_date?: string | null
          notes?: string | null
          version?: number
          currency_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          job_id?: string
          draw_number?: number
          amount?: number
          status?: DrawStatus
          submitted_date?: string | null
          funded_date?: string | null
          notes?: string | null
          version?: number
          currency_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      cost_codes: {
        Row: {
          id: string
          company_id: string
          code: string
          division: string
          subdivision: string | null
          name: string
          description: string | null
          category: CostCodeCategory
          trade: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          is_default: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          code: string
          division: string
          subdivision?: string | null
          name: string
          description?: string | null
          category?: CostCodeCategory
          trade?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          is_default?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          code?: string
          division?: string
          subdivision?: string | null
          name?: string
          description?: string | null
          category?: CostCodeCategory
          trade?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          is_default?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      job_assignments: {
        Row: {
          id: string
          company_id: string
          job_id: string
          user_id: string
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          job_id: string
          user_id: string
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          job_id?: string
          user_id?: string
          role?: string | null
          created_at?: string
        }
      }
      job_queue: {
        Row: {
          id: string
          company_id: string
          type: string
          payload: Json
          status: string
          priority: number
          attempts: number
          max_attempts: number
          run_at: string
          started_at: string | null
          completed_at: string | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          type: string
          payload?: Json
          status?: string
          priority?: number
          attempts?: number
          max_attempts?: number
          run_at?: string
          started_at?: string | null
          completed_at?: string | null
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          type?: string
          payload?: Json
          status?: string
          priority?: number
          attempts?: number
          max_attempts?: number
          run_at?: string
          started_at?: string | null
          completed_at?: string | null
          error?: string | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          base_role: UserRole
          is_system: boolean
          permissions: Json
          field_overrides: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          base_role: UserRole
          is_system?: boolean
          permissions?: Json
          field_overrides?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          base_role?: UserRole
          is_system?: boolean
          permissions?: Json
          field_overrides?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      auth_audit_log: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          event_type: string
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          event_type: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          event_type?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      project_user_roles: {
        Row: {
          id: string
          company_id: string
          user_id: string
          job_id: string
          role_id: string | null
          role_override: UserRole | null
          granted_by: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          job_id: string
          role_id?: string | null
          role_override?: UserRole | null
          granted_by: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          job_id?: string
          role_id?: string | null
          role_override?: UserRole | null
          granted_by?: string
          created_at?: string
        }
      }
      gl_accounts: {
        Row: {
          id: string
          company_id: string
          account_code: string
          account_name: string
          account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
          parent_id: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          account_code: string
          account_name: string
          account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          account_code?: string
          account_name?: string
          account_type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      gl_journal_entries: {
        Row: {
          id: string
          company_id: string
          entry_date: string
          description: string
          reference_type: string | null
          reference_id: string | null
          is_reversed: boolean
          reversed_by: string | null
          posted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          entry_date: string
          description: string
          reference_type?: string | null
          reference_id?: string | null
          is_reversed?: boolean
          reversed_by?: string | null
          posted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          entry_date?: string
          description?: string
          reference_type?: string | null
          reference_id?: string | null
          is_reversed?: boolean
          reversed_by?: string | null
          posted_by?: string | null
          created_at?: string
        }
      }
      gl_journal_lines: {
        Row: {
          id: string
          journal_entry_id: string
          account_id: string
          debit: number
          credit: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          journal_entry_id: string
          account_id: string
          debit?: number
          credit?: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          journal_entry_id?: string
          account_id?: string
          debit?: number
          credit?: number
          description?: string | null
          created_at?: string
        }
      }
      tenant_configs: {
        Row: {
          id: string
          company_id: string
          section: string
          key: string
          value: Json
          description: string | null
          data_type: string
          is_sensitive: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          section: string
          key: string
          value: Json
          description?: string | null
          data_type?: string
          is_sensitive?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          section?: string
          key?: string
          value?: Json
          description?: string | null
          data_type?: string
          is_sensitive?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          company_id: string
          flag_key: string
          enabled: boolean
          plan_required: string | null
          metadata: Json
          enabled_at: string | null
          enabled_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          flag_key: string
          enabled?: boolean
          plan_required?: string | null
          metadata?: Json
          enabled_at?: string | null
          enabled_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          flag_key?: string
          enabled?: boolean
          plan_required?: string | null
          metadata?: Json
          enabled_at?: string | null
          enabled_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_phases: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          color: string
          default_duration_days: number | null
          sort_order: number
          is_active: boolean
          is_system: boolean
          milestone_type: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          color?: string
          default_duration_days?: number | null
          sort_order?: number
          is_active?: boolean
          is_system?: boolean
          milestone_type?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          color?: string
          default_duration_days?: number | null
          sort_order?: number
          is_active?: boolean
          is_system?: boolean
          milestone_type?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      terminology_overrides: {
        Row: {
          id: string
          company_id: string
          term_key: string
          display_value: string
          plural_value: string | null
          context: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          term_key: string
          display_value: string
          plural_value?: string | null
          context?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          term_key?: string
          display_value?: string
          plural_value?: string | null
          context?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      numbering_patterns: {
        Row: {
          id: string
          company_id: string
          entity_type: string
          pattern: string
          scope: string
          current_sequence: number
          prefix: string | null
          suffix: string | null
          padding: number
          reset_yearly: boolean
          last_reset_year: number | null
          sample_output: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          entity_type: string
          pattern: string
          scope?: string
          current_sequence?: number
          prefix?: string | null
          suffix?: string | null
          padding?: number
          reset_yearly?: boolean
          last_reset_year?: number | null
          sample_output?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          entity_type?: string
          pattern?: string
          scope?: string
          current_sequence?: number
          prefix?: string | null
          suffix?: string | null
          padding?: number
          reset_yearly?: boolean
          last_reset_year?: number | null
          sample_output?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_field_definitions: {
        Row: {
          id: string
          company_id: string
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          description: string | null
          placeholder: string | null
          default_value: Json | null
          options: Json | null
          validation: Json
          show_conditions: Json | null
          section: string | null
          sort_order: number
          visible_to_roles: string[] | null
          editable_by_roles: string[] | null
          show_in_portal: boolean
          show_in_list_view: boolean
          is_required: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          description?: string | null
          placeholder?: string | null
          default_value?: Json | null
          options?: Json | null
          validation?: Json
          show_conditions?: Json | null
          section?: string | null
          sort_order?: number
          visible_to_roles?: string[] | null
          editable_by_roles?: string[] | null
          show_in_portal?: boolean
          show_in_list_view?: boolean
          is_required?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          entity_type?: string
          field_key?: string
          field_label?: string
          field_type?: string
          description?: string | null
          placeholder?: string | null
          default_value?: Json | null
          options?: Json | null
          validation?: Json
          show_conditions?: Json | null
          section?: string | null
          sort_order?: number
          visible_to_roles?: string[] | null
          editable_by_roles?: string[] | null
          show_in_portal?: boolean
          show_in_list_view?: boolean
          is_required?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      custom_field_values: {
        Row: {
          id: string
          company_id: string
          field_definition_id: string
          entity_type: string
          entity_id: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          field_definition_id: string
          entity_type: string
          entity_id: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          field_definition_id?: string
          entity_type?: string
          entity_id?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      numbering_sequences: {
        Row: {
          id: string
          company_id: string
          pattern_id: string
          job_id: string | null
          year: number | null
          current_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          pattern_id: string
          job_id?: string | null
          year?: number | null
          current_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          pattern_id?: string
          job_id?: string | null
          year?: number | null
          current_value?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_company_id: {
        Args: Record<string, never>
        Returns: string
      }
      user_has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      allocate_amount: {
        Args: { total: number; parts: number }
        Returns: number[]
      }
      get_next_sequence_number: {
        Args: { p_company_id: string; p_entity_type: string; p_job_id: string | null }
        Returns: string
      }
    }
    Enums: {
      job_status: JobStatus
      user_role: UserRole
      contract_type: ContractType
      project_type: ProjectType
      cost_code_category: CostCodeCategory
      invoice_status: InvoiceStatus
      draw_status: DrawStatus
      account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
    }
  }
}

// Enum types
export type UserRole = 'owner' | 'admin' | 'pm' | 'superintendent' | 'office' | 'field' | 'read_only'
export type JobStatus = 'lead' | 'pre_construction' | 'active' | 'on_hold' | 'completed' | 'warranty' | 'closed' | 'cancelled'
export type ContractType = 'fixed_price' | 'cost_plus' | 'time_materials'
export type ProjectType = 'new_construction' | 'renovation' | 'addition' | 'remodel' | 'commercial' | 'other'
export type CostCodeCategory = 'labor' | 'material' | 'subcontractor' | 'equipment' | 'other'
export type InvoiceStatus = 'draft' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'approved' | 'in_draw' | 'paid' | 'denied'
export type DrawStatus = 'draft' | 'pending_approval' | 'approved' | 'submitted' | 'funded' | 'rejected'

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
export type CostCode = Tables<'cost_codes'>
export type JobAssignment = Tables<'job_assignments'>
export type AuditLog = Tables<'audit_log'>
export type GlAccount = Tables<'gl_accounts'>
export type GlJournalEntry = Tables<'gl_journal_entries'>
export type GlJournalLine = Tables<'gl_journal_lines'>
export type RoleRow = Tables<'roles'>
export type AuthAuditLogRow = Tables<'auth_audit_log'>
export type ProjectUserRoleRow = Tables<'project_user_roles'>
export type TenantConfig = Tables<'tenant_configs'>
export type FeatureFlag = Tables<'feature_flags'>
export type ProjectPhase = Tables<'project_phases'>
export type TerminologyOverride = Tables<'terminology_overrides'>
export type NumberingPattern = Tables<'numbering_patterns'>
export type NumberingSequence = Tables<'numbering_sequences'>
export type CustomFieldDefinition = Tables<'custom_field_definitions'>
export type CustomFieldValue = Tables<'custom_field_values'>
