import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

/**
 * Layout del panel de administración.
 * Guarda de seguridad: requireRole redirige si el usuario no es
 * admin (o no tiene sesión). El shell con sidebar llega en la Fase 4.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(USER_ROLES.ADMIN);
  return <>{children}</>;
}
