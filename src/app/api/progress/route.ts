import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { checkLevelCompletion } from "@/lib/learning";

/**
 * POST /api/progress
 * Guarda el progreso del estudiante en una lección.
 * Body JSON: { lessonId: string, position: number, completed?: boolean }
 *
 * Se usa una API Route (no una server action) para que el guardado
 * periódico NO provoque un refresco de la página ni recargue el video.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { lessonId, position, completed } = (body ?? {}) as {
    lessonId?: unknown;
    position?: unknown;
    completed?: unknown;
  };
  if (typeof lessonId !== "string" || typeof position !== "number") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const isCompleted = completed === true;

  // La lección debe existir; necesitamos su nivel para el control de acceso.
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      isFree: true,
      module: { select: { course: { select: { levelId: true } } } },
    },
  });
  if (!lesson) {
    return NextResponse.json(
      { error: "Lección no encontrada." },
      { status: 404 },
    );
  }

  // Control de acceso: el nivel debe estar desbloqueado (salvo lección gratis).
  const levelId = lesson.module.course.levelId;
  if (!lesson.isFree) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { profileId_levelId: { profileId: user.id, levelId } },
    });
    const hasAccess =
      enrollment?.status === "activo" || enrollment?.status === "completado";
    if (!hasAccess) {
      return NextResponse.json({ error: "Sin acceso." }, { status: 403 });
    }
  }

  const safePosition = Math.max(0, Math.floor(position));

  await prisma.progress.upsert({
    where: { profileId_lessonId: { profileId: user.id, lessonId } },
    create: {
      profileId: user.id,
      lessonId,
      lastPositionSeconds: safePosition,
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    update: {
      lastPositionSeconds: safePosition,
      // Una lección completada nunca se "descompleta".
      ...(isCompleted ? { completed: true, completedAt: new Date() } : {}),
    },
  });

  if (isCompleted) {
    await prisma.activityLog
      .create({
        data: { profileId: user.id, action: "lesson_complete", metadata: { lessonId } },
      })
      .catch(() => {});
    // Comprobar si se completó el nivel y desbloquear el siguiente.
    await checkLevelCompletion(user.id, levelId);
    // Refrescar las OTRAS rutas (no la del reproductor actual).
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/cursos");
  }

  return NextResponse.json({ ok: true });
}
