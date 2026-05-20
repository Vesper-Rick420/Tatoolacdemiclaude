"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { APP_NAME } from "@/lib/constants";

/** Enlaces de navegación del panel de administración. */
export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Cursos", href: "/admin/cursos", icon: BookOpen },
  { label: "Estadísticas", href: "/admin/estadisticas", icon: BarChart3 },
] as const;

type AdminSidebarProps = {
  user: { name: string; role: string };
  /** Se llama al pulsar un enlace (sirve para cerrar el drawer móvil). */
  onNavigate?: () => void;
};

export function AdminSidebar({ user, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2 bg-sidebar p-4">
      {/* Marca */}
      <Link
        href="/admin"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 px-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <GraduationCap className="h-5 w-5 text-primary" />
        </span>
        <span className="text-sm font-semibold leading-tight">
          {APP_NAME}
          <span className="block text-xs font-normal text-muted-foreground">
            Administración
          </span>
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1">
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + cerrar sesión */}
      <div className="mt-auto space-y-3 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}

/** Iniciales a partir del nombre (máx. 2 letras). */
function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
