// Tipos de base de datos generados automáticamente por Supabase
// Estos tipos se generan con: npx supabase gen types typescript --local > src/lib/database.types.ts
// Por ahora, definimos tipos básicos basados en nuestra estructura

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
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'teacher' | 'student';
          student_id: string | null;
          teacher_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: 'teacher' | 'student';
          student_id?: string | null;
          teacher_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'teacher' | 'student';
          student_id?: string | null;
          teacher_id?: string | null;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          semester: string;
          career: string;
          teacher_id: string;
          school_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          semester: string;
          career: string;
          teacher_id: string;
          school_year: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          semester?: string;
          career?: string;
          teacher_id?: string;
          school_year?: string;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          schedule: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          schedule: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          schedule?: string;
          created_at?: string;
        };
      };
      group_students: {
        Row: {
          group_id: string;
          student_id: string;
        };
        Insert: {
          group_id: string;
          student_id: string;
        };
        Update: {
          group_id?: string;
          student_id?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          student_id: string;
          student_name: string;
          subject_id: string;
          subject_name: string;
          group_id: string;
          semester: string;
          career: string;
          class_schedule: string;
          file_name: string;
          file_size: number;
          file_path: string | null;
          status: 'pending' | 'approved' | 'rejected';
          teacher_comment: string | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_name: string;
          subject_id: string;
          subject_name: string;
          group_id: string;
          semester: string;
          career: string;
          class_schedule: string;
          file_name: string;
          file_size: number;
          file_path?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          teacher_comment?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          student_name?: string;
          subject_id?: string;
          subject_name?: string;
          group_id?: string;
          semester?: string;
          career?: string;
          class_schedule?: string;
          file_name?: string;
          file_size?: number;
          file_path?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          teacher_comment?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
      };
      evaluation_templates: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      evaluation_criteria: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          description: string | null;
          max_score: number;
          order_index: number;
        };
        Insert: {
          id?: string;
          template_id: string;
          name: string;
          description?: string | null;
          max_score: number;
          order_index: number;
        };
        Update: {
          id?: string;
          template_id?: string;
          name?: string;
          description?: string | null;
          max_score?: number;
          order_index?: number;
        };
      };
      portfolio_evaluations: {
        Row: {
          id: string;
          portfolio_id: string;
          total_score: number;
          max_total_score: number;
          percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          total_score: number;
          max_total_score: number;
          percentage: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          total_score?: number;
          max_total_score?: number;
          percentage?: number;
          created_at?: string;
        };
      };
      evaluation_scores: {
        Row: {
          id: string;
          evaluation_id: string;
          criterion_id: string | null;
          criterion_name: string;
          criterion_max_score: number;
          score: number;
          order_index: number;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          criterion_id?: string | null;
          criterion_name: string;
          criterion_max_score: number;
          score: number;
          order_index: number;
        };
        Update: {
          id?: string;
          evaluation_id?: string;
          criterion_id?: string | null;
          criterion_name?: string;
          criterion_max_score?: number;
          score?: number;
          order_index?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'teacher' | 'student';
      portfolio_status: 'pending' | 'approved' | 'rejected';
    };
  };
}




