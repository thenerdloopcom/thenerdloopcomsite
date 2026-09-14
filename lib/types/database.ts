/**
 * Minimal hand-written types matching supabase/migrations/*.sql.
 *
 * Once your project is live, prefer generating these automatically:
 *   npx supabase gen types typescript --project-id <ref> > lib/types/database.ts
 * That keeps this file in sync with the real schema. This hand-written
 * version is just enough to get the integration compiling today.
 */

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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          full_name: string
          phone: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['addresses']['Row']> & {
          user_id: string
          full_name: string
          address_line_1: string
          city: string
          state: string
          postal_code: string
        }
        Update: Partial<Database['public']['Tables']['addresses']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          sort_order: number
          active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & {
          name: string
          slug: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          subtitle: string | null
          description: string | null
          category_id: string | null
          product_type: 'standard' | 'access-card'
          card_type: 'ready-made' | 'photo-personalized' | null
          price: number
          compare_at_price: number | null
          badge: string | null
          status: 'draft' | 'active' | 'archived'
          featured: boolean
          inventory_count: number | null
          color: string | null
          details: string[]
          personalization: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          slug: string
          name: string
          price: number
        }
        Update: Partial<Database['public']['Tables']['products']['Row']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          image_type: string
          sort_order: number
          alt_text: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['product_images']['Row']> & {
          product_id: string
          url: string
        }
        Update: Partial<Database['public']['Tables']['product_images']['Row']>
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: string
          payment_status: string
          fulfillment_status: string
          subtotal: number
          shipping_fee: number
          discount: number
          total: number
          currency: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['orders']['Row']>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string
          unit_price: number
          quantity: number
          line_total: number
          customization_type: string | null
          instructions: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['order_items']['Row']> & {
          order_id: string
          product_name: string
          product_slug: string
          unit_price: number
          line_total: number
        }
        Update: Partial<Database['public']['Tables']['order_items']['Row']>
      }
      order_addresses: {
        Row: {
          id: string
          order_id: string
          address_type: string
          full_name: string
          phone: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['order_addresses']['Row']> & {
          order_id: string
          full_name: string
          address_line_1: string
          city: string
          state: string
          postal_code: string
        }
        Update: Partial<Database['public']['Tables']['order_addresses']['Row']>
      }
      payments: {
        Row: {
          id: string
          order_id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          amount: number
          currency: string
          status: string
          method: string | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          order_id: string
          amount: number
        }
        Update: Partial<Database['public']['Tables']['payments']['Row']>
      }
      customer_uploads: {
        Row: {
          id: string
          user_id: string | null
          order_id: string | null
          order_item_id: string | null
          storage_provider: string
          bucket: string
          object_key: string
          original_filename: string | null
          content_type: string | null
          file_size: number | null
          status: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['customer_uploads']['Row']> & {
          bucket: string
          object_key: string
        }
        Update: Partial<Database['public']['Tables']['customer_uploads']['Row']>
      }
      shipments: {
        Row: {
          id: string
          order_id: string
          provider: string | null
          provider_order_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          status: string
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['shipments']['Row']> & { order_id: string }
        Update: Partial<Database['public']['Tables']['shipments']['Row']>
      }
    }
    Functions: {
      create_order: {
        Args: {
          p_user_id: string | null
          p_items: Json
          p_address: Json
          p_currency?: string
          p_shipping_fee?: number
        }
        Returns: { order_id: string; order_number: string; total: number }[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}