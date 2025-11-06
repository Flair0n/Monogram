/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client for authentication and database access
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseConfig } from '../config/env';

// Create Supabase client with anon key (safe for frontend)
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Database types (update after running supabase gen types typescript)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          role: 'free' | 'premium' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      spaces: {
        Row: {
          id: string;
          name: string;
          description: string;
          creator_id: string;
          access_type: 'Public' | 'Private';
          current_week: number;
          current_curator_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['spaces']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['spaces']['Insert']>;
      };
      memberships: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          role: 'member' | 'curator' | 'admin';
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'joined_at'>;
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
      };
      prompts: {
        Row: {
          id: string;
          space_id: string;
          curator_id: string;
          week_number: number;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prompts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>;
      };
      responses: {
        Row: {
          id: string;
          prompt_id: string;
          user_id: string;
          content: string;
          is_draft: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['responses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['responses']['Insert']>;
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          email_notifications: boolean;
          landing_page: 'dashboard' | 'last-space';
          profile_visibility: 'public' | 'spaces' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
    };
  };
};
