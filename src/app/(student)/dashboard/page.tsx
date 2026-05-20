import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  PlayCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "Mi dashboard" };

export default async function DashboardPage() {
  const profile = await requireRole(USER_ROLES.STUDENT);

  // Matrículas del estudiante (niveles a los que tiene acceso).
  const enrollments = await prisma.enrollment.findMany({
    where: { profileId: profile.id },
    include: { level: true },
    orderBy: { level: { order: "asc" } },
  });
  const unlockedLevelIds = enrollments
    .filter((e) => e.status === "activo" || e.status === "completado")
    .map((e) => e.levelId);

  // Estadísticas (en paralelo).
  const [availableCourses, accessibleLessons, completedLessons, recent] =
    await Promise.all([
      prisma.course.count({
        where: { levelId: { in: unlockedLevelIds }, isPublished: true },
      }),
      prisma.lesson.count({
        where: {
          module: {
            course: { levelId: { in: unlockedLevelIds }, isPublished: true },
          },
        },
      }),
      prisma.progress.count({
        where: { profileId: profile.id, completed: true },
      }),
      prisma.progress.findMany({
        where: { profileId: profile.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: {
          lesson: { include: { module: { include: { course: true } } } },
        },
      }),
    ]);

  const progressPct =
    accessibleLessons > 0
      ? Math.round((completedLessons / accessibleLessons) * 100)
      : 0;

  const stats = [
    {
      label: "Niveles desbloqueados",
      value: unlockedLevelIds.length,
      icon: Layers,
    },
    { label: "Cursos disponibles", value: availableCourses, icon: BookOpen },
    {
      label: "Lecciones completadas",
      value: completedLessons,
      icon: CheckCircle2,
    },
    { label: "Progreso general", value: `${progressPct}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">
          Hola, {profile.fullName || profile.username} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Este es tu progreso en Tatool Academy.
        </p>
      </header>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Niveles */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tus niveles</h2>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/cursos" />}
            nativeButton={false}
          >
            Ver todos los cursos
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aún no tienes acceso a ningún nivel. El administrador debe
            asignártelos.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {enrollments.map((enrollment) => {
              const unlocked =
                enrollment.status === "activo" ||
                enrollment.status === "completado";
              return (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                    {unlocked ? (
                      <PlayCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </span>
                  <div>
                    <p className="font-medium">{enrollment.level.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.status === "completado"
                        ? "Completado"
                        : unlocked
                          ? "En progreso"
                          : "Bloqueado"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Continuar viendo */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Continuar viendo</h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aún no has visto ninguna clase. Cuando empieces, aquí aparecerá tu
            última lección.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-sm font-medium">{item.lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.lesson.module.course.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
