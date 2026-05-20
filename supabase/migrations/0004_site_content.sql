-- ═══════════════════════════════════════════════════════════
--  Tatool Academy — Contenido editable del sitio
--  Crea las tablas site_settings y teachers (no se usa
--  `prisma db push` por la FK cross-schema con auth.users),
--  aplica RLS y siembra los datos iniciales.
-- ═══════════════════════════════════════════════════════════

-- ── Tablas (coinciden con los modelos de schema.prisma) ──
create table if not exists public.site_settings (
  id         text primary key default 'default',
  mision     text not null,
  vision     text not null,
  updated_at timestamptz(6) not null default now()
);

create table if not exists public.teachers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  specialty     text not null,
  photo_url     text,
  instagram_url text,
  facebook_url  text,
  "order"       integer not null default 0,
  created_at    timestamptz(6) not null default now(),
  updated_at    timestamptz(6) not null default now()
);

-- ── RLS: lectura pública (contenido de la landing), escritura admin ──
alter table public.site_settings enable row level security;
alter table public.teachers enable row level security;

drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings
  for select using (true);
drop policy if exists site_settings_write on public.site_settings;
create policy site_settings_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists teachers_select on public.teachers;
create policy teachers_select on public.teachers
  for select using (true);
drop policy if exists teachers_write on public.teachers;
create policy teachers_write on public.teachers
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Datos iniciales ──
insert into public.site_settings (id, mision, vision)
values (
  'default',
  'En Tatool Academy formamos tatuadores profesionales con bases sólidas en técnica, bioseguridad y arte. Ofrecemos una educación práctica, cercana y 100 % online, para que cualquier persona apasionada por el tatuaje aprenda a su ritmo y convierta su talento en una verdadera profesión.',
  'Ser la academia de tatuaje online líder en Latinoamérica, reconocida por la calidad de sus egresados y por impulsar una nueva generación de artistas del tatuaje con técnica, ética y estilo propio.'
)
on conflict (id) do nothing;

insert into public.teachers (name, specialty, "order")
select * from (values
  ('Carlos Méndez', 'Realismo y retrato', 1),
  ('Lucía Fernández', 'Línea fina y blackwork', 2),
  ('Diego Torres', 'Color y neotradicional', 3)
) as t(name, specialty, "order")
where not exists (select 1 from public.teachers);
