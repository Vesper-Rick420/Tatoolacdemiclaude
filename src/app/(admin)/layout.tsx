import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Layout del panel de administración.
 * requireRole redirige si el usuario no es admin (o no tiene sesión).
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole(USER_ROLES.ADMIN);

  return (
    <AppShell
      variant="admin"
      user={{
        name: profile.fullName || profile.username,
        role: "Administrador",
      }}
    >
      {children}
    </AppShell>
  );
}
