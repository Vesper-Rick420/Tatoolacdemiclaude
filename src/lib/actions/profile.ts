"use server";

/**
 * Server Actions del perfil propio.
 * Cada usuario solo puede modificar SU perfil: las acciones operan
 * siempre sobre el id del perfil de la sesión actual.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/profile";

type ActionResult = { error?: string; success?: string };

/** Actualiza el nombre completo del usuario actual. */
export async function updateProfile(
  values: UpdateProfileInput,
): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "No autenticado." };

  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };

  await prisma.profile.update({
    where: { id: profile.id },
    data: { fullName: parsed.data.fullName },
  });

  revalidatePath("/dashboard/perfil");
  return { success: "Perfil actualizado." };
}

/** URL firmada para subir la foto de perfil directamente a Storage. */
export async function createAvatarUploadUrl(
  ext: string,
): Promise<{ path: string; token: string } | { error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "No autenticado." };

  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
  const path = `${profile.id}/${Date.now()}.${safeExt}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .createSignedUploadUrl(path);
  if (error || !data) return { error: "No se pudo preparar la subida." };

  return { path: data.path, token: data.token };
}

/** Guarda la URL pública de la foto de perfil. */
export async function setAvatar(path: string): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "No autenticado." };

  const supabase = createAdminClient();
  // El bucket "avatars" es público: guardamos la URL pública directa.
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .getPublicUrl(path);

  await prisma.profile.update({
    where: { id: profile.id },
    data: { avatarUrl: data.publicUrl },
  });

  revalidatePath("/dashboard/perfil");
  return { success: "Foto de perfil actualizada." };
}
