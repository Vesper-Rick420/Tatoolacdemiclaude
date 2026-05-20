/**
 * Crea los buckets de Supabase Storage de Tatool Academy.
 * Se ejecuta una sola vez (es idempotente: ignora los que ya existen).
 *
 *   node scripts/setup-storage.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const buckets = [
  { id: "course-videos", public: false }, // videos de las lecciones
  { id: "course-resources", public: false }, // PDFs y recursos
  { id: "avatars", public: true }, // fotos de perfil
];

for (const bucket of buckets) {
  const { error } = await supabase.storage.createBucket(bucket.id, {
    public: bucket.public,
  });
  if (error && !/already exists/i.test(error.message)) {
    console.error(`‼ ${bucket.id}: ${error.message}`);
  } else {
    console.log(
      `✔ bucket "${bucket.id}" (${bucket.public ? "público" : "privado"})`,
    );
  }
}
