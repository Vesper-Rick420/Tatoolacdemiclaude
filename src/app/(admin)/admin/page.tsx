import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Panel de administración" };

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Panel de administración</h1>
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
            Sesión de administrador
            {profile && <Badge>{profile.role}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          ✅ La autenticación y la protección por roles funcionan. La gestión
          de usuarios, cursos y estadísticas se construye en la Fase 4.
        </CardContent>
      </Card>
    </div>
  );
}
