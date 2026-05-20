import type { Metadata } from "next";
import {
  Users,
  UserCheck,
  CheckCircle2,
  Download,
  LogIn,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Estadísticas" };

const ACTION_LABELS: Record<string, string> = {
  login: "Inició sesión",
  logout: "Cerró sesión",
  course_view: "Vio un curso",
  lesson_view: "Vio una lección",
  lesson_complete: "Completó una lección",
  download: "Descargó un archivo",
  level_unlocked: "Desbloqueó un nivel",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function displayName(profile: { fullName: string; username: string }): string {
  return profile.fullName || profile.username;
}

export default async function EstadisticasPage() {
  const [
    totalUsers,
    activeStudents,
    completedLessons,
    totalDownloads,
    completedLevels,
    publishedCourses,
    recentLogins,
    recentDownloads,
    recentActivity,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({
      where: { role: "estudiante", status: "activo" },
    }),
    prisma.progress.count({ where: { completed: true } }),
    prisma.download.count(),
    prisma.enrollment.count({ where: { status: "completado" } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.activityLog.findMany({
      where: { action: "login" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { profile: { select: { fullName: true, username: true } } },
    }),
    prisma.download.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { profile: { select: { fullName: true, username: true } } },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { profile: { select: { fullName: true, username: true } } },
    }),
  ]);

  const stats = [
    { label: "Usuarios totales", value: totalUsers, icon: Users },
    { label: "Estudiantes activos", value: activeStudents, icon: UserCheck },
    {
      label: "Lecciones completadas",
      value: completedLessons,
      icon: CheckCircle2,
    },
    { label: "Descargas realizadas", value: totalDownloads, icon: Download },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-sm text-muted-foreground">
          Actividad y métricas de la plataforma.
        </p>
      </header>

      {/* Tarjetas principales */}
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

      {/* Métricas secundarias */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <span className="text-sm text-muted-foreground">
              Niveles completados por estudiantes
            </span>
            <span className="text-2xl font-bold">{completedLevels}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <span className="text-sm text-muted-foreground">
              Cursos publicados
            </span>
            <span className="text-2xl font-bold">{publishedCourses}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conexiones recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LogIn className="h-4 w-4 text-primary" />
              Conexiones recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogins.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay inicios de sesión registrados.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {recentLogins.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="truncate font-medium">
                      {displayName(log.profile)}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Descargas recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4 text-primary" />
              Descargas recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDownloads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay descargas registradas.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {recentDownloads.map((download) => (
                  <li key={download.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium">
                        {download.fileName}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(download.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {displayName(download.profile)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Actividad reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay actividad registrada.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {recentActivity.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="truncate">
                    <span className="font-medium">
                      {displayName(log.profile)}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      — {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
