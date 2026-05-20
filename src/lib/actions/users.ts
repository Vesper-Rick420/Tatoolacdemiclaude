"use server";

/**
 * Server Actions de gestión de usuarios (solo administradores).
 * Cada acción verifica primero que quien la llama es admin.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminProfile } from "@/lib/auth";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";

type ActionResult = { error?: string; success?: string };

/** Crea un usuario: cuenta de Supabase Auth + perfil (vía trigger). */
export async function createUser(
  values: CreateUserInput,
): Promise<ActionResult> {
  await getAdminProfile();

  const parsed = createUserSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };
  const { fullName, username, email, password, role } = parsed.data;

  const existing = await prisma.profile.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existing) return { error: "Ese nombre de usuario ya está en uso." };

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // sin verificación por correo
    user_metadata: { username, full_name: fullName, role },
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { success: "Usuario creado correctamente." };
}

/** Suspende o reactiva la cuenta de un usuario. */
export async function setUserStatus(
  profileId: string,
  status: "activo" | "suspendido",
): Promise<ActionResult> {
  const admin = await getAdminProfile();
  if (profileId === admin.id) {
    return { error: "No puedes cambiar el estado de tu propia cuenta." };
  }

  await prisma.profile.update({ where: { id: profileId }, data: { status } });
  revalidatePath("/admin/usuarios");
  return {
    success:
      status === "activo" ? "Usuario reactivado." : "Usuario suspendido.",
  };
}

/** Elimina un usuario. Al borrar la cuenta de Auth, el perfil y sus
 *  datos relacionados se eliminan en cascada (FK on delete cascade). */
export async function deleteUser(profileId: string): Promise<ActionResult> {
  const admin = await getAdminProfile();
  if (profileId === admin.id) {
    return { error: "No puedes eliminar tu propia cuenta." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(profileId);
  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { success: "Usuario eliminado." };
}

/** Concede o retira el acceso de un estudiante a un nivel. */
export async function setLevelAccess(
  profileId: string,
  levelId: string,
  grant: boolean,
): Promise<ActionResult> {
  await getAdminProfile();

  await prisma.enrollment.upsert({
    where: { profileId_levelId: { profileId, levelId } },
    create: {
      profileId,
      levelId,
      status: grant ? "activo" : "bloqueado",
      unlockedAt: grant ? new Date() : null,
    },
    update: {
      status: grant ? "activo" : "bloqueado",
      unlockedAt: grant ? new Date() : null,
    },
  });

  revalidatePath("/admin/usuarios");
  return { success: grant ? "Acceso concedido." : "Acceso retirado." };
}
