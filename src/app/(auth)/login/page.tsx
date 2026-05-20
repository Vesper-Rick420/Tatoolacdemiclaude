import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";
import { getCurrentProfile, roleHome } from "@/lib/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  // Si ya hay una sesión activa, ir directo al panel correspondiente.
  const profile = await getCurrentProfile();
  if (profile && profile.status === "activo") {
    redirect(roleHome(profile.role));
  }

  return (
    <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      {/* Cabecera con el logo (fondo oscuro para que resalte) */}
      <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-[#1c1030] to-neutral-950 px-6 py-8">
        <Logo className="w-44 object-contain" />
        <p className="text-sm text-white/60">
          Inicia sesión para acceder a tus cursos
        </p>
      </div>

      {/* Formulario */}
      <div className="p-6">
        <LoginForm />
      </div>
    </div>
  );
}
