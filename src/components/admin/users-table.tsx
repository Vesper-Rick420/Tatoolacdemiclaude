"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UserRowActions } from "@/components/admin/user-row-actions";

export type UserRow = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "admin" | "estudiante";
  status: "activo" | "suspendido";
  unlockedLevelIds: string[];
};

export type LevelOption = { id: string; name: string; order: number };

export function UsersTable({
  users,
  levels,
  currentUserId,
}: {
  users: UserRow[];
  levels: LevelOption[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateUserDialog />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Niveles</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                        {getInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.fullName || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{user.username} · {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role === "admin" ? "Admin" : "Estudiante"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "activo" ? "outline" : "destructive"
                    }
                  >
                    {user.status === "activo" ? "Activo" : "Suspendido"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.unlockedLevelIds.length} / {levels.length}
                </TableCell>
                <TableCell className="text-right">
                  <UserRowActions
                    user={user}
                    levels={levels}
                    isSelf={user.id === currentUserId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
