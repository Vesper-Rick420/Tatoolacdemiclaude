import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis cursos" };

export default function StudentCursosPage() {
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold">Mis cursos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La vista de niveles y cursos se construye en la Parte B de la Fase 5.
      </p>
    </div>
  );
}
