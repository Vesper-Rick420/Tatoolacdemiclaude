"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EllipsisVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setUserStatus, deleteUser, setLevelAccess } from "@/lib/actions/users";
import type { UserRow, LevelOption } from "@/components/admin/users-table";

export function UserRowActions({
  user,
  levels,
  isSelf,
}: {
  user: UserRow;
  levels: LevelOption[];
  isSelf: boolean;
}) {
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function notify(result: { error?: string; success?: string }) {
    if (result.error) toast.error(result.error);
    else if (result.success) toast.success(result.success);
  }

  function handleToggleStatus() {
    startTransition(async () => {
      const next = user.status === "activo" ? "suspendido" : "activo";
      notify(await setUserStatus(user.id, next));
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id);
      notify(result);
      if (!result.error) setDeleteOpen(false);
    });
  }

  function handleLevel(levelId: string, grant: boolean) {
    startTransition(async () => {
      notify(await setLevelAccess(user.id, levelId, grant));
    });
  }

  const displayName = user.fullName || user.username;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Acciones" />
          }
        >
          <EllipsisVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleStatus} disabled={isSelf}>
            {user.status === "activo" ? "Suspender" : "Reactivar"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLevelsOpen(true)}>
            Gestionar niveles
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf}
            onClick={() => setDeleteOpen(true)}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo: gestionar acceso a niveles */}
      <Dialog open={levelsOpen} onOpenChange={setLevelsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Niveles de {displayName}</DialogTitle>
            <DialogDescription>
              Concede o retira el acceso del estudiante a cada nivel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {levels.map((level) => {
              const granted = user.unlockedLevelIds.includes(level.id);
              return (
                <div
                  key={level.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm font-medium">{level.name}</span>
                  <Button
                    size="sm"
                    variant={granted ? "outline" : "default"}
                    disabled={isPending}
                    onClick={() => handleLevel(level.id, !granted)}
                  >
                    {granted ? "Quitar acceso" : "Conceder acceso"}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: confirmar eliminación */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              Se eliminará a <strong>{displayName}</strong> de forma
              permanente, junto con su progreso y actividad. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
