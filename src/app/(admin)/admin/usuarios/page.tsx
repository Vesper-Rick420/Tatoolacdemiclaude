import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsuariosPage() {
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La gestión de usuarios se construye en la Parte B de la Fase 4.
      </p>
    </div>
  );
}
