"use client";

/**
 * Página de bienvenida (landing) de Tatool Academy.
 * Secciones: hero con logo · misión y visión · profesores · footer con redes.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, GraduationCap, Target } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  APP_NAME,
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  ROUTES,
} from "@/lib/constants";

// ── Contenido editable ────────────────────────────────────
// 👉 Personaliza estos textos y datos con la información real.

const MISION =
  "Formar tatuadores profesionales con técnica sólida, ética y bioseguridad, ofreciendo una educación de calidad, práctica y 100 % en línea, accesible desde cualquier lugar.";

const VISION =
  "Ser la academia de tatuaje online de referencia en Latinoamérica, reconocida por la excelencia de sus egresados y por innovar constantemente en la forma de enseñar el arte del tatuaje.";

const TEACHERS = [
  {
    name: "Carlos Méndez",
    specialty: "Realismo y retrato",
    initials: "CM",
    instagram: "#",
    facebook: "#",
  },
  {
    name: "Lucía Fernández",
    specialty: "Línea fina y minimalismo",
    initials: "LF",
    instagram: "#",
    facebook: "#",
  },
  {
    name: "Diego Torres",
    specialty: "Black & grey y sombreado",
    initials: "DT",
    instagram: "#",
    facebook: "#",
  },
];

const SOCIALS = [
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "Facebook", href: "#", icon: FaFacebookF },
  { label: "YouTube", href: "#", icon: FaYoutube },
];

// Animación de aparición al entrar en pantalla.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function LandingHero() {
  const [logoError, setLogoError] = useState(false);

  return (
    <main>
      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1c1030] via-neutral-950 to-neutral-950 px-6 py-20 text-center">
        {/* Halos morados */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-[320px] w-[320px] rounded-full bg-fuchsia-500/20 blur-[120px]"
        />

        {/* Acceso rápido */}
        <Link
          href={ROUTES.login}
          className="absolute top-6 right-6 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          Iniciar sesión
        </Link>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {logoError ? (
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                <GraduationCap className="h-7 w-7 text-primary" />
              </span>
              <span className="text-3xl font-bold text-white">
                {APP_NAME}
              </span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo.png"
              alt={APP_NAME}
              onError={() => setLogoError(true)}
              className="h-24 w-auto object-contain sm:h-32"
            />
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-8 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          Aprende a tatuar como un{" "}
          <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">
            profesional
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-5 max-w-xl text-lg text-white/65"
        >
          Cursos de tatuaje online estructurados por niveles. Del primer trazo
          hasta dominar técnicas profesionales.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-8"
        >
          <Button
            render={<Link href={ROUTES.login} />}
            nativeButton={false}
            size="lg"
            className="group h-12 px-8 text-base"
          >
            Entrar a la plataforma
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Niveles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mt-14 flex flex-wrap items-center justify-center gap-3"
        >
          {COURSE_LEVELS.map((level, index) => (
            <div
              key={level}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/25 text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
              {COURSE_LEVEL_LABELS[level]}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══ MISIÓN Y VISIÓN ═══ */}
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...reveal} className="text-center">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Nuestra esencia
            </p>
            <h2 className="mt-2 text-3xl font-bold">Misión y visión</h2>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <motion.div
              {...reveal}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <Target className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">Misión</h3>
              <p className="mt-2 text-muted-foreground">{MISION}</p>
            </motion.div>

            <motion.div
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <Eye className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">Visión</h3>
              <p className="mt-2 text-muted-foreground">{VISION}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PROFESORES ═══ */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...reveal} className="text-center">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              El equipo
            </p>
            <h2 className="mt-2 text-3xl font-bold">Nuestros profesores</h2>
            <p className="mt-2 text-muted-foreground">
              Aprende de tatuadores con experiencia real en el estudio.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEACHERS.map((teacher, index) => (
              <motion.div
                key={teacher.name}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.1 }}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-400 text-xl font-bold text-white">
                  {teacher.initials}
                </span>
                <h3 className="mt-4 font-semibold">{teacher.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {teacher.specialty}
                </p>
                <div className="mt-4 flex gap-2">
                  <a
                    href={teacher.instagram}
                    aria-label={`Instagram de ${teacher.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <FaInstagram className="h-4 w-4" />
                  </a>
                  <a
                    href={teacher.facebook}
                    aria-label={`Facebook de ${teacher.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <FaFacebookF className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-neutral-950 px-6 py-14 text-center">
        <div className="mx-auto max-w-5xl">
          {!logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo.png"
              alt={APP_NAME}
              className="mx-auto h-14 w-auto object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-white">{APP_NAME}</span>
          )}

          <p className="mt-4 text-sm text-white/55">
            Síguenos en nuestras redes sociales
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-primary/50 hover:text-white"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="mt-8 text-xs text-white/40">
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
