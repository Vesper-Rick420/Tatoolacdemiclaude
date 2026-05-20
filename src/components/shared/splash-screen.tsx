"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Pantalla de carga con el logo. Aparece al entrar a la plataforma
 * (en cada carga completa de la página) y se desvanece sola.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 overflow-hidden bg-neutral-950"
        >
          {/* Halo morado de fondo */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-80 w-80 rounded-full bg-primary/25 blur-[120px]"
          />

          {/* Logo */}
          <motion.img
            src="/logo.png"
            alt="Tatool Academy"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative h-28 w-auto object-contain sm:h-36"
          />

          {/* Indicador de carga */}
          <div className="relative flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
