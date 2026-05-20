import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Comprueba si un estudiante completó TODAS las lecciones de un nivel.
 * Si es así: marca la matrícula del nivel como "completado" y
 * desbloquea automáticamente el siguiente nivel.
 *
 * Se invoca tras marcar una lección como completada.
 */
export async function checkLevelCompletion(
  profileId: string,
  levelId: string,
): Promise<void> {
  // Total de lecciones del nivel (solo cursos publicados).
  const totalLessons = await prisma.lesson.count({
    where: { module: { course: { levelId, isPublished: true } } },
  });
  if (totalLessons === 0) return;

  // Lecciones de ese nivel completadas por el estudiante.
  const completedLessons = await prisma.progress.count({
    where: {
      profileId,
      completed: true,
      lesson: { module: { course: { levelId, isPublished: true } } },
    },
  });
  if (completedLessons < totalLessons) return;

  // Nivel completado → marcar la matrícula.
  await prisma.enrollment.updateMany({
    where: { profileId, levelId },
    data: { status: "completado", completedAt: new Date() },
  });

  // Desbloquear el siguiente nivel (por orden).
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) return;
  const nextLevel = await prisma.level.findFirst({
    where: { order: level.order + 1 },
  });
  if (!nextLevel) return;

  const existing = await prisma.enrollment.findUnique({
    where: {
      profileId_levelId: { profileId, levelId: nextLevel.id },
    },
  });

  if (!existing) {
    await prisma.enrollment.create({
      data: {
        profileId,
        levelId: nextLevel.id,
        status: "activo",
        unlockedAt: new Date(),
      },
    });
  } else if (existing.status === "bloqueado") {
    await prisma.enrollment.update({
      where: { id: existing.id },
      data: { status: "activo", unlockedAt: new Date() },
    });
  }

  await prisma.activityLog
    .create({
      data: {
        profileId,
        action: "level_unlocked",
        metadata: { levelId: nextLevel.id, levelName: nextLevel.name },
      },
    })
    .catch(() => {
      /* el log no debe bloquear el desbloqueo */
    });
}
