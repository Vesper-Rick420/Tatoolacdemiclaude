import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { AdminShell } from "@/components/layout/admin-shell";

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
    <AdminShell
      user={{
        name: profile.fullName || profile.username,
        role: "Administrador",
      }}
    >
      {children}
    </AdminShell>
  );
}
