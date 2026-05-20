"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUser } from "@/lib/actions/users";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "estudiante",
    },
  });

  function onSubmit(values: CreateUserInput) {
    startTransition(async () => {
      const result = await createUser(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Usuario creado.");
      reset();
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Crear usuario
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              El usuario podrá iniciar sesión con su nombre de usuario o su
              correo.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                {...register("role")}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="estudiante">Estudiante</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
