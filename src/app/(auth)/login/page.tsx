import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile, roleHome } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  // Si ya hay una sesión activa, ir directo al panel correspondiente.
  const profile = await getCurrentProfile();
  if (profile && profile.status === "activo") {
    redirect(roleHome(profile.role));
  }

  return (
    <Card className="relative z-10 w-full max-w-sm border-border/60 shadow-2xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
        <CardDescription>
          Inicia sesión para acceder a tus cursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
