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
      family_settings: {
        Row: {
          id: string;
          user_id: string;
          family_name: string;
          share_slug: string;
          is_public: boolean;
          password_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_name: string;
          share_slug: string;
          is_public?: boolean;
          password_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_name?: string;
          share_slug?: string;
          is_public?: boolean;
          password_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      kids: {
        Row: {
          id: string;
          parent_user_id: string;
          name: string;
          birthday: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_user_id: string;
          name: string;
          birthday?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_user_id?: string;
          name?: string;
          birthday?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          kid_id: string | null;
          parent_user_id: string;
          type: 'url_product' | 'text_description' | 'cash_giftcard';
          title: string;
          description: string | null;
          price: number | null;
          image_url: string | null;
          source_url: string | null;
          affiliate_urls: Json | null;
          priority: 'high' | 'medium' | 'low' | 'future';
          is_purchased: boolean;
          purchased_by: string | null;
          purchased_at: string | null;
          reserved_by: string | null;
          reserved_at: string | null;
          enable_group_gifting: boolean;
          group_gift_goal: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kid_id?: string | null;
          parent_user_id: string;
          type: 'url_product' | 'text_description' | 'cash_giftcard';
          title: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          source_url?: string | null;
          affiliate_urls?: Json | null;
          priority?: 'high' | 'medium' | 'low' | 'future';
          is_purchased?: boolean;
          purchased_by?: string | null;
          purchased_at?: string | null;
          reserved_by?: string | null;
          reserved_at?: string | null;
          enable_group_gifting?: boolean;
          group_gift_goal?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kid_id?: string | null;
          parent_user_id?: string;
          type?: 'url_product' | 'text_description' | 'cash_giftcard';
          title?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          source_url?: string | null;
          affiliate_urls?: Json | null;
          priority?: 'high' | 'medium' | 'low' | 'future';
          is_purchased?: boolean;
          purchased_by?: string | null;
          purchased_at?: string | null;
          reserved_by?: string | null;
          reserved_at?: string | null;
          enable_group_gifting?: boolean;
          group_gift_goal?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}