"use server";

/**
 * Server Actions de módulos y lecciones (solo administradores).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "@/lib/auth";
import {
  moduleSchema,
  lessonSchema,
  type ModuleInput,
  type LessonInput,
} from "@/lib/validations/content";

type ActionResult = { error?: string; success?: string };

/** Refresca la página de detalle del curso y el listado. */
function revalidateCourse(courseId: string) {
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/admin/cursos");
}

// ── Módulos ───────────────────────────────────────────────

export async function createModule(
  courseId: string,
  values: ModuleInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = moduleSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) return { error: "El curso no existe." };

  const order = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { courseId, title: parsed.data.title, order },
  });

  revalidateCourse(courseId);
  return { success: "Módulo creado." };
}

export async function updateModule(
  moduleId: string,
  values: ModuleInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = moduleSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) return { error: "El módulo no existe." };

  await prisma.module.update({
    where: { id: moduleId },
    data: { title: parsed.data.title },
  });

  revalidateCourse(mod.courseId);
  return { success: "Módulo actualizado." };
}

export async function deleteModule(moduleId: string): Promise<ActionResult> {
  await getAdminProfile();
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) return { error: "El módulo no existe." };

  // Las lecciones del módulo se eliminan en cascada.
  await prisma.module.delete({ where: { id: moduleId } });

  revalidateCourse(mod.courseId);
  return { success: "Módulo eliminado." };
}

// ── Lecciones ─────────────────────────────────────────────

export async function createLesson(
  moduleId: string,
  values: LessonInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = lessonSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) return { error: "El módulo no existe." };

  const order = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      description: parsed.data.description.trim() || null,
      isFree: parsed.data.isFree,
      order,
    },
  });

  revalidateCourse(mod.courseId);
  return { success: "Lección creada." };
}

export async function updateLesson(
  lessonId: string,
  values: LessonInput,
): Promise<ActionResult> {
  await getAdminProfile();
  const parsed = lessonSchema.safeParse(values);
  if (!parsed.success) return { error: "Datos inválidos." };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) return { error: "La lección no existe." };

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description.trim() || null,
      isFree: parsed.data.isFree,
    },
  });

  revalidateCourse(lesson.module.courseId);
  return { success: "Lección actualizada." };
}

export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  await getAdminProfile();
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) return { error: "La lección no existe." };

  await prisma.lesson.delete({ where: { id: lessonId } });

  revalidateCourse(lesson.module.courseId);
  return { success: "Lección eliminada." };
}
