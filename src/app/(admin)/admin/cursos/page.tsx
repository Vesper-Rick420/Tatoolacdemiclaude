import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cursos" };

export default function CursosPage() {
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold">Cursos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La gestión de cursos se construye en la Parte C de la Fase 4.
      </p>
    </div>
  );
}
