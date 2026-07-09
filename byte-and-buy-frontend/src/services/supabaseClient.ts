import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Falla rápido y explícito si falta configuración de entorno,
// en vez de dejar que supabase-js falle más adelante de forma críptica.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY",
  );
}

/** Instancia única de Supabase compartida por toda la app (auth, storage, etc.). */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
