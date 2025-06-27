import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DisabledItems {
  id: number;
  disabled_items: number[];
  updated_at: string;
}

// Helper functions for disabled items
export async function getDisabledItems(): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('menu_settings')
      .select('disabled_items')
      .single();

    if (error) {
      console.error('Error fetching disabled items:', error);
      return [];
    }

    return data?.disabled_items || [];
  } catch (error) {
    console.error('Error fetching disabled items:', error);
    return [];
  }
}

export async function updateDisabledItems(disabledItems: number[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('menu_settings')
      .upsert({ 
        id: 1, 
        disabled_items: disabledItems,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating disabled items:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating disabled items:', error);
    return false;
  }
} 