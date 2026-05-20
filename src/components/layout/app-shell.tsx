"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Globe,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar, type NavItem } from "@/components/layout/app-sidebar";

/** Configuración de navegación por tipo de panel. */
const CONFIG: Record<
  "admin" | "student",
  { subtitle: string; mobileTitle: string; items: readonly NavItem[] }
> = {
  admin: {
    subtitle: "Administración",
    mobileTitle: "Tatool · Admin",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Usuarios", href: "/admin/usuarios", icon: Users },
      { label: "Cursos", href: "/admin/cursos", icon: BookOpen },
      { label: "Sitio web", href: "/admin/contenido", icon: Globe },
      { label: "Estadísticas", href: "/admin/estadisticas", icon: BarChart3 },
    ],
  },
  student: {
    subtitle: "Estudiante",
    mobileTitle: "Tatool Academy",
    items: [
      { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
      { label: "Mis cursos", href: "/dashboard/cursos", icon: BookOpen },
      { label: "Perfil", href: "/dashboard/perfil", icon: User },
    ],
  },
};

/**
 * Estructura visual de los paneles (admin y estudiante).
 *  - Escritorio (lg+): barra lateral fija.
 *  - Móvil: barra oculta; se abre como drawer con el botón ☰.
 */
export function AppShell({
  variant,
  user,
  children,
}: {
  variant: "admin" | "student";
  user: { name: string; role: string };
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = CONFIG[variant];

  return (
    <div className="min-h-screen">
      {/* Barra lateral fija — escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
        <AppSidebar
          items={config.items}
          subtitle={config.subtitle}
          user={user}
        />
      </aside>

      {/* Drawer — móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar lg:hidden"
            >
              <AppSidebar
                items={config.items}
                subtitle={config.subtitle}
                user={user}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Barra superior — solo móvil */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold">{config.mobileTitle}</span>
      </header>

      {/* Contenido */}
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
