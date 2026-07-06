import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client() {
    return this.supabase;
  }
}
