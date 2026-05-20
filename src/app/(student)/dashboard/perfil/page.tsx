import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi perfil" };

export default function PerfilPage() {
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La gestión del perfil se construye en la Parte C de la Fase 5.
      </p>
    </div>
  );
}
