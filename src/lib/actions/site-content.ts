"use server";

/**
 * Server Actions del contenido de la página de inicio (solo admin):
 * misión, visión y profesores.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  siteSettingsSchema,
  teacherSchema,
  type SiteSettingsInput,
  type TeacherInput,
} from "@/lib/validations/site-content";

type ActionResult = { error?: string; success?: string };

/** Refresca la landing y el panel de contenido. */
function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/admin/contenido");
}

// ── Misión y Visión ───────────────────────────────────────

export async function updateSiteSettings(
  values: SiteSettingsInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = siteSettingsSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data },
    update: parsed.data,
  });

  revalidateContent();
  return { success: "Misión y visión actualizadas." };
}

// ── Profesores ────────────────────────────────────────────

export async function createTeacher(
  values: TeacherInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = teacherSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };

  const order = await prisma.teacher.count();
  await prisma.teacher.create({
    data: {
      name: parsed.data.name,
      specialty: parsed.data.specialty,
      instagramUrl: parsed.data.instagramUrl.trim() || null,
      facebookUrl: parsed.data.facebookUrl.trim() || null,
      order,
    },
  });

  revalidateContent();
  return { success: "Profesor añadido." };
}

export async function updateTeacher(
  teacherId: string,
  values: TeacherInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = teacherSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };

  await prisma.teacher.update({
    where: { id: teacherId },
    data: {
      name: parsed.data.name,
      specialty: parsed.data.specialty,
      instagramUrl: parsed.data.instagramUrl.trim() || null,
      facebookUrl: parsed.data.facebookUrl.trim() || null,
    },
  });

  revalidateContent();
  return { success: "Profesor actualizado." };
}

export async function deleteTeacher(
  teacherId: string,
): Promise<ActionResult> {
  await getAdminProfile();
  await prisma.teacher.delete({ where: { id: teacherId } });
  revalidateContent();
  return { success: "Profesor eliminado." };
}

/** URL firmada para subir la foto de un profesor. */
export async function createTeacherPhotoUploadUrl(
  teacherId: string,
  ext: string,
): Promise<{ path: string; token: string } | { error: string }> {
  await getAdminProfile();
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true },
  });
  if (!teacher) return { error: "El profesor no existe." };

  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
  const path = `teachers/${teacherId}/${Date.now()}.${safeExt}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .createSignedUploadUrl(path);
  if (error || !data) return { error: "No se pudo preparar la subida." };

  return { path: data.path, token: data.token };
}

/** Guarda la URL pública de la foto del profesor. */
export async function setTeacherPhoto(
  teacherId: string,
  path: string,
): Promise<ActionResult> {
  await getAdminProfile();
  const supabase = createAdminClient();
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .getPublicUrl(path);

  await prisma.teacher.update({
    where: { id: teacherId },
    data: { photoUrl: data.publicUrl },
  });

  revalidateContent();
  return { success: "Foto actualizada." };
}
