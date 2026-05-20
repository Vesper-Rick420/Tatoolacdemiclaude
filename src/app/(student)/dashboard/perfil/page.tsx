import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/student/profile-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "Mi perfil" };

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

export default async function PerfilPage() {
  const profile = await requireRole(USER_ROLES.STUDENT);

  const [completedLessons, unlockedLevels, recentActivity] = await Promise.all([
    prisma.progress.count({
      where: { profileId: profile.id, completed: true },
    }),
    prisma.enrollment.count({
      where: {
        profileId: profile.id,
        status: { in: ["activo", "completado"] },
      },
    }),
    prisma.activityLog.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus datos y revisa tu actividad.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Datos personales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Datos personales</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialName={profile.fullName}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <InfoRow label="Correo" value={profile.email} />
              <InfoRow
                label="Niveles desbloqueados"
                value={String(unlockedLevels)}
              />
              <InfoRow
                label="Lecciones completadas"
                value={String(completedLessons)}
              />
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay actividad registrada.
                </p>
              ) : (
                <ul className="space-y-2.5 text-sm">
                  {recentActivity.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span>{ACTION_LABELS[log.action] ?? log.action}</span>
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
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
