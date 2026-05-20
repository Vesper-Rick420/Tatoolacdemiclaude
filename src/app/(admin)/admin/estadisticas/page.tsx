import type { Metadata } from "next";

export const metadata: Metadata = { title: "Estadísticas" };

export default function EstadisticasPage() {
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold">Estadísticas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        El detalle de estadísticas se construye más adelante en la Fase 4.
      </p>
    </div>
  );
}
