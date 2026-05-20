import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";

/**
 * Layout del panel del estudiante.
 * Guarda de seguridad: requireRole redirige si el usuario no es
 * estudiante (o no tiene sesión). El shell con sidebar llega en la Fase 5.
 */
export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(USER_ROLES.STUDENT);
  return <>{children}</>;
}
