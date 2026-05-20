import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Mi dashboard" };

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Mi dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Hola, {profile?.fullName || profile?.username}
            </p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Sesión de estudiante
            {profile && <Badge variant="secondary">{profile.role}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          ✅ La autenticación funciona. Tus cursos, progreso y niveles
          bloqueados se construyen en la Fase 5.
        </CardContent>
      </Card>
    </div>
  );
}
