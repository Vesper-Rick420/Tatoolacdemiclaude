-- ═══════════════════════════════════════════════════════════
--  Tatool Academy — Datos semilla: los 4 niveles (FASE 2)
--  Idempotente: re-ejecutarlo no duplica filas (on conflict).
--  `id` y `created_at` se rellenan solos con sus DEFAULT.
-- ═══════════════════════════════════════════════════════════
insert into public.levels (slug, name, description, "order")
values
  ('basico',      'Básico',      'Fundamentos del tatuaje: higiene, bioseguridad, materiales y primeros trazos.', 1),
  ('intermedio',  'Intermedio',  'Técnicas de línea, sombreado y manejo avanzado de la máquina.',                2),
  ('avanzado',    'Avanzado',    'Realismo, color, texturas y composición de piezas complejas.',                 3),
  ('profesional', 'Profesional', 'Especialización, desarrollo de estilo propio y gestión de un estudio.',        4)
on conflict (slug) do nothing;
