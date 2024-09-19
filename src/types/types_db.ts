export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          full_name: string | null;
          email: string;
          id: string;
        };
        Insert: {
          full_name?: string | null;
          email: string;
          id: string;
        };
        Update: {
          full_name?: string | null;
          email?: string;
          id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}