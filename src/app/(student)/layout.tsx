import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Layout del panel del estudiante.
 * requireRole redirige si el usuario no es estudiante (o no tiene sesión).
 */
export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole(USER_ROLES.STUDENT);

  return (
    <AppShell
      variant="student"
      user={{
        name: profile.fullName || profile.username,
        role: "Estudiante",
      }}
    >
      {children}
    </AppShell>
  );
}
