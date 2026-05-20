"use client";

/**
 * Providers globales de la aplicación.
 * Se monta una sola vez en el layout raíz y envuelve toda la app:
 *  - QueryClientProvider → caché y fetching de datos (TanStack Query)
 *  - ThemeProvider       → dark mode (next-themes)
 *  - Toaster             → notificaciones tipo toast (sonner)
 */

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  // useState con función inicial → garantiza UNA sola instancia de QueryClient
  // por sesión de cliente (no se recrea en cada render).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 min: evita refetch innecesario
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
