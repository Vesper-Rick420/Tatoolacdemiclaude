/**
 * Crea un usuario en Supabase Auth usando la clave service_role.
 * El trigger `handle_new_user` generará automáticamente su perfil.
 *
 *   node scripts/create-user.mjs <email> <password> <username> <fullName> [role]
 *
 * role: admin | estudiante   (por defecto: estudiante)
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const [email, password, username, fullName, role = "estudiante"] =
  process.argv.slice(2);

if (!email || !password || !username || !fullName) {
  console.error(
    "Uso: node scripts/create-user.mjs <email> <password> <username> <fullName> [role]",
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // marca el email como verificado → puede entrar ya
  user_metadata: { username, full_name: fullName, role },
});

if (error) {
  console.error("‼ Error:", error.message);
  process.exit(1);
}

console.log(`✔ Usuario creado: ${email}  (rol: ${role})`);
console.log(`  id: ${data.user.id}`);
