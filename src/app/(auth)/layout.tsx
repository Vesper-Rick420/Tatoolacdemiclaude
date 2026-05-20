import type { ReactNode } from "react";

/** Layout de las páginas de autenticación: centrado, sin sidebar. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Halo morado de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]"
      />
      {children}
    </div>
  );
}
