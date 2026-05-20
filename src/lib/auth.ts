import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { USER_ROLES, type UserRole } from "@/lib/constants";

/**
 * Helpers de autenticación para el SERVIDOR.
 * `cache()` deduplica las llamadas dentro de una misma petición:
 * aunque se llame varias veces, solo se consulta una vez.
 */

/** Usuario autenticado de Supabase Auth (o null si no hay sesión). */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Perfil completo (tabla profiles, vía Prisma) del usuario actual. */
export const getCurrentProfile = cache(async () => {
  const user = await getAuthUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { id: user.id } });
});

/** Ruta de inicio según el rol del usuario. */
export function roleHome(role: UserRole): string {
  return role === USER_ROLES.ADMIN ? "/admin" : "/dashboard";
}

/**
 * Exige una sesión válida y activa.
 * Redirige a /login si no hay sesión o la cuenta está suspendida.
 */
export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.status === "suspendido") {
    redirect("/login");
  }
  return profile;
}

/**
 * Exige que el usuario tenga un ROL concreto.
 * Si tiene otro rol, lo redirige a su propio panel.
 */
export async function requireRole(role: UserRole) {
  const profile = await requireProfile();
  if (profile.role !== role) {
    redirect(roleHome(profile.role));
  }
  return profile;
}

/**
 * Devuelve el perfil del admin actual o LANZA un error.
 * Pensada para el inicio de las server actions de administración:
 * a diferencia de requireRole, no redirige (lanza), porque las
 * acciones no deben "navegar", deben fallar de forma controlada.
 */
export async function getAdminProfile() {
  const profile = await getCurrentProfile();
  if (
    !profile ||
    profile.role !== USER_ROLES.ADMIN ||
    profile.status === "suspendido"
  ) {
    throw new Error("No autorizado.");
  }
  return profile;
}
