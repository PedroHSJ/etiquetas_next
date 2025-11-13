export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: string | null;
          user_id: string | null;
          created_at: string | null;
          cnpj: string | null;
          capacity: number | null;
          opening_date: string | null;
          full_address: string | null;
          zip_code: string | null;
          district: string | null;
          latitude: number | null;
          longitude: number | null;
          main_phone: string | null;
          alt_phone: string | null;
          institutional_email: string | null;
          updated_at: string | null;
          state_id: number | null;
          city_id: number | null;
          address: string | null;
          number: string | null;
          address_complement: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string | null;
          user_id?: string | null;
          created_at?: string | null;
          cnpj?: string | null;
          capacity?: number | null;
          opening_date?: string | null;
          full_address?: string | null;
          zip_code?: string | null;
          district?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          main_phone?: string | null;
          alt_phone?: string | null;
          institutional_email?: string | null;
          updated_at?: string | null;
          state_id?: number | null;
          city_id?: number | null;
          address?: string | null;
          number?: string | null;
          address_complement?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string | null;
          user_id?: string | null;
          created_at?: string | null;
          cnpj?: string | null;
          capacity?: number | null;
          opening_date?: string | null;
          full_address?: string | null;
          zip_code?: string | null;
          district?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          main_phone?: string | null;
          alt_phone?: string | null;
          institutional_email?: string | null;
          updated_at?: string | null;
          state_id?: number | null;
          city_id?: number | null;
          address?: string | null;
          number?: string | null;
          address_complement?: string | null;
        };
      };

      user_organizations: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          profile_id: string;
          active: boolean;
          entry_date: string | null;
          exit_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          profile_id: string;
          active?: boolean;
          entry_date?: string | null;
          exit_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          profile_id?: string;
          active?: boolean;
          entry_date?: string | null;
          exit_date?: string | null;
          created_at?: string | null;
        };
      };

      user_profiles: {
        Row: {
          id: string;
          user_organization_id: string;
          profile_user_id: string;
          active: boolean;
          start_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_organization_id: string;
          profile_user_id: string;
          active?: boolean;
          start_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_organization_id?: string;
          profile_user_id?: string;
          active?: boolean;
          start_date?: string | null;
          created_at?: string | null;
        };
      };

      perfis: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          ativo: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          ativo?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          ativo?: boolean;
          created_at?: string | null;
        };
      };

      funcionalidades: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          rota: string | null;
          ativo: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          rota?: string | null;
          ativo?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          rota?: string | null;
          ativo?: boolean;
          created_at?: string | null;
        };
      };

      permissoes: {
        Row: {
          id: string;
          funcionalidade_id: string;
          perfil_usuario_id: string;
          acao: string | null;
          ativo: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          funcionalidade_id: string;
          perfil_usuario_id: string;
          acao?: string | null;
          ativo?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          funcionalidade_id?: string;
          perfil_usuario_id?: string;
          acao?: string | null;
          ativo?: boolean;
          created_at?: string | null;
        };
      };

      products: {
        Row: {
          id: number;
          name: string;
          group_id: number | null;
        };
        Insert: {
          id?: number;
          name: string;
          group_id?: number | null;
        };
        Update: {
          id?: number;
          name?: string;
          group_id?: number | null;
        };
      };

      groups: {
        Row: {
          id: number;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
        };
      };

      labels: {
        Row: {
          id: number;
          product_id: number | null;
          quantity: number | null;
          printed_at: string | null;
          user_id: string | null;
          organization_id: string | null;
          status: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          product_id?: number | null;
          quantity?: number | null;
          printed_at?: string | null;
          user_id?: string | null;
          organization_id?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          product_id?: number | null;
          quantity?: number | null;
          printed_at?: string | null;
          user_id?: string | null;
          organization_id?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
      };

      label_templates: {
        Row: {
          id: string;
          name: string;
          label_type: string;
          organization_id: string;
          layout_config: Json;
          paper_size: string;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          label_type: string;
          organization_id: string;
          layout_config: Json;
          paper_size?: string;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          label_type?: string;
          organization_id?: string;
          layout_config?: Json;
          paper_size?: string;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      print_layouts: {
        Row: {
          id: string;
          name: string;
          template_id: string;
          paper_size: string;
          labels_per_page: number;
          margin_config: Json;
          spacing_config: Json;
          organization_id: string;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          template_id: string;
          paper_size?: string;
          labels_per_page?: number;
          margin_config: Json;
          spacing_config: Json;
          organization_id: string;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          template_id?: string;
          paper_size?: string;
          labels_per_page?: number;
          margin_config?: Json;
          spacing_config?: Json;
          organization_id?: string;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      technical_responsibles: {
        Row: {
          id: string;
          organization_id: string;
          responsible_type: string;
          name: string;
          document: string | null;
          phone: string | null;
          email: string | null;
          notes: string | null;
          active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          responsible_type: string;
          name: string;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          responsible_type?: string;
          name?: string;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      municipios: {
        Row: {
          id: number;
          estado_id: number;
          codigo_ibge: string | null;
          nome: string;
          cep_inicial: string | null;
          cep_final: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          estado_id: number;
          codigo_ibge?: string | null;
          nome: string;
          cep_inicial?: string | null;
          cep_final?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          estado_id?: number;
          codigo_ibge?: string | null;
          nome?: string;
          cep_inicial?: string | null;
          cep_final?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      estados: {
        Row: {
          id: number;
          codigo: string;
          nome: string;
          sigla: string;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          codigo: string;
          nome: string;
          sigla: string;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          codigo?: string;
          nome?: string;
          sigla?: string;
          created_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type DatabaseType = Database;
