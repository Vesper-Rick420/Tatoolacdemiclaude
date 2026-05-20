"use server";

/**
 * Server Actions de gestión de cursos (solo administradores).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminProfile } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { courseSchema, type CourseInput } from "@/lib/validations/course";

type ActionResult = { error?: string; success?: string };

/** Genera un slug único para un curso (añade -2, -3... si choca). */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "curso";
  for (let n = 1; n < 1000; n += 1) {
    const slug = n === 1 ? root : `${root}-${n}`;
    const found = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!found || found.id === excludeId) return slug;
  }
  return `${root}-${Date.now()}`;
}

export async function createCourse(values: CourseInput): Promise<ActionResult> {
  await getAdminProfile();

  const parsed = courseSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };
  const { title, description, levelId } = parsed.data;

  const level = await prisma.level.findUnique({
    where: { id: levelId },
    select: { id: true },
  });
  if (!level) return { error: "El nivel seleccionado no existe." };

  // El nuevo curso se coloca al final de su nivel.
  const order = await prisma.course.count({ where: { levelId } });
  const slug = await uniqueSlug(slugify(title));

  await prisma.course.create({
    data: {
      title,
      slug,
      levelId,
      description: description.trim() || null,
      order,
    },
  });

  revalidatePath("/admin/cursos");
  return { success: "Curso creado correctamente." };
}

export async function updateCourse(
  courseId: string,
  values: CourseInput,
): Promise<ActionResult> {
  await getAdminProfile();

  const parsed = courseSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa los datos del formulario." };
  const { title, description, levelId } = parsed.data;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "El curso no existe." };

  // Solo regeneramos el slug si cambió el título.
  const slug =
    title === course.title
      ? course.slug
      : await uniqueSlug(slugify(title), courseId);

  await prisma.course.update({
    where: { id: courseId },
    data: { title, slug, levelId, description: description.trim() || null },
  });

  revalidatePath("/admin/cursos");
  return { success: "Curso actualizado." };
}

export async function toggleCoursePublished(
  courseId: string,
  publish: boolean,
): Promise<ActionResult> {
  await getAdminProfile();
  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: publish },
  });
  revalidatePath("/admin/cursos");
  return { success: publish ? "Curso publicado." : "Curso ocultado." };
}

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  await getAdminProfile();
  // Módulos y lecciones se eliminan en cascada (FK on delete cascade).
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/cursos");
  return { success: "Curso eliminado." };
}
