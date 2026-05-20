import type { Metadata } from "next";
import {
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

/** Etiqueta legible para cada tipo de acción del log. */
const ACTION_LABELS: Record<string, string> = {
  login: "inició sesión",
  logout: "cerró sesión",
  course_view: "vio un curso",
  lesson_view: "vio una lección",
  lesson_complete: "completó una lección",
  download: "descargó un archivo",
  level_unlocked: "desbloqueó un nivel",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminDashboardPage() {
  // Todas las consultas en paralelo para una carga rápida.
  const [
    profile,
    totalUsers,
    activeStudents,
    totalCourses,
    publishedCourses,
    recentActivity,
  ] = await Promise.all([
    getCurrentProfile(),
    prisma.profile.count(),
    prisma.profile.count({
      where: { role: "estudiante", status: "activo" },
    }),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.activityLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        profile: { select: { fullName: true, username: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Usuarios totales", value: totalUsers, icon: Users },
    { label: "Estudiantes activos", value: activeStudents, icon: UserCheck },
    { label: "Cursos", value: totalCourses, icon: BookOpen },
    { label: "Cursos publicados", value: publishedCourses, icon: GraduationCap },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenido de nuevo, {profile?.fullName || profile?.username}.
        </p>
      </header>

      {/* Tarjetas de estadísticas */}
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
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <span className="truncate">
                    <span className="font-medium">
                      {log.profile.fullName || log.profile.username}
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
