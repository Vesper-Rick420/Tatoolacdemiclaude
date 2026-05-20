"use client";

/**
 * Hero de la landing pública (placeholder de la Fase 1).
 * En fases posteriores la raíz redirigirá según el rol del usuario.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APP_NAME,
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  ROUTES,
} from "@/lib/constants";

// Animación reutilizable: aparece desplazándose hacia arriba, con retardo
// escalonado según el índice (efecto "cascada").
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function LandingHero() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      {/* Halo morado difuminado de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]"
      />

      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        Plataforma de cursos de tatuaje
      </motion.div>

      <motion.h1
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-3xl text-center text-5xl font-bold tracking-tight sm:text-6xl"
      >
        Domina el arte del tatuaje con{" "}
        <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">
          {APP_NAME}
        </span>
      </motion.h1>

      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 max-w-xl text-center text-lg text-muted-foreground"
      >
        Cursos online estructurados por niveles. Aprende paso a paso, desde el
        primer trazo hasta dominar técnicas profesionales.
      </motion.p>

      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <Button
          render={<Link href={ROUTES.login} />}
          size="lg"
          className="group h-12 px-8 text-base"
        >
          Entrar a la plataforma
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-14 flex flex-wrap items-center justify-center gap-3"
      >
        {COURSE_LEVELS.map((level, index) => (
          <div
            key={level}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            {COURSE_LEVEL_LABELS[level]}
          </div>
        ))}
      </motion.div>
    </main>
  );
}
