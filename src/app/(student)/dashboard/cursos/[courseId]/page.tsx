import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { USER_ROLES, STORAGE_BUCKETS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { CoursePlayer } from "@/components/student/course-player";

export const metadata: Metadata = { title: "Curso" };

export default async function CoursePlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ l?: string | string[] }>;
}) {
  const { courseId } = await params;
  const lParam = (await searchParams).l;
  const requestedLessonId = Array.isArray(lParam) ? lParam[0] : lParam;

  const profile = await requireRole(USER_ROLES.STUDENT);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course || !course.isPublished) notFound();

  // ¿El nivel del curso está desbloqueado para el estudiante?
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      profileId_levelId: { profileId: profile.id, levelId: course.levelId },
    },
  });
  const levelUnlocked =
    enrollment?.status === "activo" || enrollment?.status === "completado";

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const isAccessible = (free: boolean) => levelUnlocked || free;

  // Curso sin lecciones, o nivel bloqueado sin lecciones gratuitas.
  if (allLessons.length === 0) {
    return (
      <StateView title={course.title} message="Este curso aún no tiene lecciones." />
    );
  }
  if (!levelUnlocked && !allLessons.some((l) => l.isFree)) {
    return (
      <StateView
        title={course.title}
        locked
        message="Este curso pertenece a un nivel que aún no has desbloqueado."
      />
    );
  }

  // Lección actual: la pedida por ?l= (si es accesible) o la primera accesible.
  const current =
    (requestedLessonId &&
      allLessons.find(
        (l) => l.id === requestedLessonId && isAccessible(l.isFree),
      )) ||
    allLessons.find((l) => isAccessible(l.isFree)) ||
    allLessons[0];

  // Progreso del estudiante en las lecciones de este curso.
  const progressRows = await prisma.progress.findMany({
    where: {
      profileId: profile.id,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
  });
  const resumeAt =
    progressRows.find((p) => p.lessonId === current.id)?.lastPositionSeconds ??
    0;
  const completedLessonIds = progressRows
    .filter((p) => p.completed)
    .map((p) => p.lessonId);

  // URL firmada del video de la lección actual (válida 2 horas).
  let signedUrl: string | null = null;
  if (current.videoPath && isAccessible(current.isFree)) {
    const supabase = createAdminClient();
    const { data } = await supabase.storage
      .from(STORAGE_BUCKETS.videos)
      .createSignedUrl(current.videoPath, 60 * 60 * 2);
    signedUrl = data?.signedUrl ?? null;
  }

  const modules = course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      isFree: lesson.isFree,
      hasVideo: Boolean(lesson.videoPath),
      accessible: isAccessible(lesson.isFree),
    })),
  }));

  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      modules={modules}
      currentLessonId={current.id}
      currentTitle={current.title}
      currentDescription={current.description}
      signedUrl={signedUrl}
      resumeAt={resumeAt}
      completedLessonIds={completedLessonIds}
    />
  );
}

/** Vista para curso vacío o bloqueado. */
function StateView({
  title,
  message,
  locked = false,
}: {
  title: string;
  message: string;
  locked?: boolean;
}) {
  return (
    <div className="space-y-6 p-6 lg:p-10">
      <Link
        href="/dashboard/cursos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis cursos
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        {locked && <Lock className="h-8 w-8 text-muted-foreground" />}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
