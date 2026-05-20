"use server";

/**
 * Server Actions de autenticación.
 * Se ejecutan SIEMPRE en el servidor (nunca en el navegador).
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { roleHome } from "@/lib/auth";

type ActionResult = { error: string };

/** IP del cliente desde las cabeceras (mejor esfuerzo). */
async function getClientIp(): Promise<string | null> {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/**
 * Inicia sesión. Acepta USUARIO o EMAIL como identificador.
 * Devuelve { error } si falla; redirige al panel si tiene éxito.
 */
export async function login(
  values: LoginInput,
): Promise<ActionResult | undefined> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }
  const identifier = parsed.data.identifier.trim();
  const { password } = parsed.data;

  // 1. Resolver el email. Supabase Auth solo conoce emails, así que
  //    si el identificador no es un email, lo buscamos por username.
  let email = identifier;
  if (!identifier.includes("@")) {
    const found = await prisma.profile.findUnique({
      where: { username: identifier },
      select: { email: true },
    });
    if (!found) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    email = found.email;
  }

  // 2. Iniciar sesión en Supabase Auth (esto fija las cookies).
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  // 3. Cargar el perfil y validar el estado de la cuenta.
  const profile = await prisma.profile.findUnique({
    where: { id: data.user.id },
  });
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "No se encontró el perfil del usuario." };
  }
  if (profile.status === "suspendido") {
    await supabase.auth.signOut();
    return { error: "Tu cuenta está suspendida. Contacta al administrador." };
  }

  // 4. Registrar el inicio de sesión (no debe bloquear el login).
  try {
    await prisma.activityLog.create({
      data: {
        profileId: profile.id,
        action: "login",
        ipAddress: await getClientIp(),
      },
    });
  } catch {
    // El log de actividad es secundario: si falla, seguimos.
  }

  // 5. Redirigir según el rol.
  redirect(roleHome(profile.role));
}

/** Cierra la sesión, registra la actividad y vuelve al login. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await prisma.activityLog.create({
        data: { profileId: user.id, action: "logout" },
      });
    } catch {
      // ignorar
    }
  }

  await supabase.auth.signOut();
  redirect("/login");
}
