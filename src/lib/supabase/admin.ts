import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la clave SERVICE_ROLE.
 *
 * ⚠️ SOLO en el servidor. Tiene acceso total y OMITE el RLS.
 * Se usa para operaciones de administración: crear usuarios,
 * generar URLs firmadas, etc. Nunca debe llegar al navegador.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
