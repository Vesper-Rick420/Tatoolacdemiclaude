import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";
import {
  UsersTable,
  type UserRow,
  type LevelOption,
} from "@/components/admin/users-table";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  const [me, profiles, levels] = await Promise.all([
    getCurrentProfile(),
    prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: { select: { levelId: true, status: true } },
      },
    }),
    prisma.level.findMany({ orderBy: { order: "asc" } }),
  ]);

  // Aplanamos los datos de Prisma a una forma serializable y mínima
  // para pasarla al componente cliente de la tabla.
  const users: UserRow[] = profiles.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    username: p.username,
    email: p.email,
    role: p.role,
    status: p.status,
    unlockedLevelIds: p.enrollments
      .filter((e) => e.status === "activo" || e.status === "completado")
      .map((e) => e.levelId),
  }));

  const levelOptions: LevelOption[] = levels.map((l) => ({
    id: l.id,
    name: l.name,
    order: l.order,
  }));

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} usuario(s) registrados
        </p>
      </header>

      <UsersTable
        users={users}
        levels={levelOptions}
        currentUserId={me?.id ?? ""}
      />
    </div>
  );
}
