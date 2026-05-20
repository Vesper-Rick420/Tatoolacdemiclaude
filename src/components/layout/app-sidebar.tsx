"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { APP_NAME } from "@/lib/constants";

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Contenido de la barra lateral. Lo reutilizan el panel admin y el del estudiante. */
export function AppSidebar({
  items,
  subtitle,
  user,
  onNavigate,
}: {
  items: readonly NavItem[];
  subtitle: string;
  user: { name: string; role: string };
  /** Se llama al pulsar un enlace (para cerrar el drawer en móvil). */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const homeHref = items[0]?.href ?? "/";

  return (
    <div className="flex h-full flex-col gap-2 bg-sidebar p-4">
      {/* Marca */}
      <Link
        href={homeHref}
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 px-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <GraduationCap className="h-5 w-5 text-primary" />
        </span>
        <span className="text-sm font-semibold leading-tight">
          {APP_NAME}
          <span className="block text-xs font-normal text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          // El primer enlace es el "inicio": coincidencia exacta.
          const active =
            item.href === homeHref
              ? pathname === item.href
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
            <p className="truncate text-xs text-muted-foreground">
              {user.role}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
