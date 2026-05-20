"use server";

/**
 * Server Actions de recursos descargables de las lecciones (admin).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/constants";

type ActionResult = { error?: string; success?: string };

/** Deduce el tipo de recurso a partir de la extensión del archivo. */
function resourceTypeFromExt(ext: string): "pdf" | "imagen" | "archivo" {
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "imagen";
  return "archivo";
}

/** URL firmada para subir un recurso al bucket privado. */
export async function createResourceUploadUrl(
  lessonId: string,
  ext: string,
): Promise<{ path: string; token: string } | { error: string }> {
  await getAdminProfile();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true },
  });
  if (!lesson) return { error: "La lección no existe." };

  const safeExt = /^[a-z0-9]{1,6}$/.test(ext) ? ext : "bin";
  const path = `${lessonId}/${Date.now()}.${safeExt}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.resources)
    .createSignedUploadUrl(path);
  if (error || !data) return { error: "No se pudo preparar la subida." };

  return { path: data.path, token: data.token };
}

/** Registra el recurso ya subido en la base de datos. */
export async function createResource(
  lessonId: string,
  input: { name: string; ext: string; filePath: string; sizeBytes: number },
): Promise<ActionResult> {
  await getAdminProfile();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) return { error: "La lección no existe." };

  await prisma.resource.create({
    data: {
      lessonId,
      name: input.name.trim().slice(0, 160) || "Recurso",
      type: resourceTypeFromExt(input.ext.toLowerCase()),
      filePath: input.filePath,
      sizeBytes: Math.max(0, Math.floor(input.sizeBytes)),
    },
  });

  revalidatePath(`/admin/cursos/${lesson.module.courseId}`);
  return { success: "Recurso añadido." };
}

/** Elimina un recurso (registro + archivo en Storage). */
export async function deleteResource(
  resourceId: string,
): Promise<ActionResult> {
  await getAdminProfile();

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      filePath: true,
      lesson: { select: { module: { select: { courseId: true } } } },
    },
  });
  if (!resource) return { error: "El recurso no existe." };

  const supabase = createAdminClient();
  await supabase.storage
    .from(STORAGE_BUCKETS.resources)
    .remove([resource.filePath]);
  await prisma.resource.delete({ where: { id: resourceId } });

  revalidatePath(`/admin/cursos/${resource.lesson.module.courseId}`);
  return { success: "Recurso eliminado." };
}
