import type { Metadata } from "next";
import Link from "next/link";
import { Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "Mis cursos" };

export default async function StudentCursosPage() {
  const profile = await requireRole(USER_ROLES.STUDENT);

  const [levels, enrollments, courses, completed] = await Promise.all([
    prisma.level.findMany({ orderBy: { order: "asc" } }),
    prisma.enrollment.findMany({ where: { profileId: profile.id } }),
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        modules: { include: { lessons: { select: { id: true } } } },
      },
    }),
    prisma.progress.findMany({
      where: { profileId: profile.id, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedSet = new Set(completed.map((p) => p.lessonId));
  const statusByLevel = new Map(enrollments.map((e) => [e.levelId, e.status]));

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Mis cursos</h1>
        <p className="text-sm text-muted-foreground">
          Avanza nivel por nivel. Completa uno para desbloquear el siguiente.
        </p>
      </header>

      {levels.map((level) => {
        const status = statusByLevel.get(level.id);
        const unlocked = status === "activo" || status === "completado";
        const levelCourses = courses.filter((c) => c.levelId === level.id);

        return (
          <section key={level.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{level.name}</h2>
              {status === "completado" ? (
                <Badge>Completado</Badge>
              ) : unlocked ? (
                <Badge variant="secondary">Desbloqueado</Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="mr-1 h-3 w-3" />
                  Bloqueado
                </Badge>
              )}
            </div>

            {!unlocked ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                <Lock className="h-5 w-5 shrink-0" />
                Este nivel está bloqueado. Completa el nivel anterior o solicita
                el acceso al administrador.
              </div>
            ) : levelCourses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Aún no hay cursos publicados en este nivel.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {levelCourses.map((course) => {
                  const lessonIds = course.modules.flatMap((m) =>
                    m.lessons.map((l) => l.id),
                  );
                  const total = lessonIds.length;
                  const done = lessonIds.filter((id) =>
                    completedSet.has(id),
                  ).length;
                  const pct =
                    total > 0 ? Math.round((done / total) * 100) : 0;

                  return (
                    <Link
                      key={course.id}
                      href={`/dashboard/cursos/${course.id}`}
                      className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </span>
                      <h3 className="mt-3 font-semibold leading-tight">
                        {course.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {course.description || "Sin descripción."}
                      </p>
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {done} de {total} lecciones
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
