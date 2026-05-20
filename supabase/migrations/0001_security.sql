-- ═══════════════════════════════════════════════════════════
--  Tatool Academy — Seguridad de la base de datos (FASE 2)
--
--  Se aplica DESPUÉS de `prisma db push` (que crea las tablas).
--  Contiene lo que Prisma no puede gestionar:
--   1. FK de profiles con auth.users (esquema de Supabase)
--   2. Trigger que crea el perfil al registrarse un usuario
--   3. Funciones auxiliares para las políticas
--   4. Row Level Security (RLS) + políticas en las 10 tablas
--
--  Nota de arquitectura: Prisma se conecta como rol `postgres`
--  (dueño de las tablas) y por tanto OMITE el RLS. El RLS aquí
--  protege la API pública de Supabase (/rest/v1/) y el acceso
--  con la clave anon. La seguridad del acceso vía Prisma se
--  hace en el código del servidor (middleware + checks, Fase 3).
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- 1. profiles.id  →  auth.users.id   (relación 1:1)
-- ─────────────────────────────────────────────────────────
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- ─────────────────────────────────────────────────────────
-- 2. Valor por defecto de updated_at (para inserciones SQL)
-- ─────────────────────────────────────────────────────────
alter table public.profiles alter column updated_at set default now();
alter table public.courses  alter column updated_at set default now();
alter table public.lessons  alter column updated_at set default now();
alter table public.progress alter column updated_at set default now();

-- ─────────────────────────────────────────────────────────
-- 3. Trigger: crear un profile al registrarse un usuario.
--    SECURITY DEFINER → se ejecuta con permisos del dueño,
--    así puede escribir en profiles saltándose el RLS.
-- ─────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public."Role",
      'estudiante'::public."Role"
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────
-- 4. Funciones auxiliares para las políticas RLS.
--    SECURITY DEFINER + STABLE → leen profiles/enrollments
--    sin disparar el RLS de esas tablas (evita recursión).
-- ─────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.has_level_access(target_level_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.enrollments
    where profile_id = (select auth.uid())
      and level_id = target_level_id
      and status in ('activo', 'completado')
  );
$$;

-- ─────────────────────────────────────────────────────────
-- 5. Activar Row Level Security en todas las tablas.
--    Sin políticas, RLS activo = NADIE accede (vía anon).
-- ─────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.levels        enable row level security;
alter table public.courses       enable row level security;
alter table public.modules       enable row level security;
alter table public.lessons       enable row level security;
alter table public.resources     enable row level security;
alter table public.enrollments   enable row level security;
alter table public.progress      enable row level security;
alter table public.downloads     enable row level security;
alter table public.activity_logs enable row level security;

-- ─────────────────────────────────────────────────────────
-- 6. POLÍTICAS
-- ─────────────────────────────────────────────────────────

-- ── profiles ──────────────────────────────────────────────
-- Cada quien ve/edita su perfil; el admin, todos.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin on public.profiles
  for insert with check (public.is_admin());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete using (public.is_admin());

-- ── levels ────────────────────────────────────────────────
-- Cualquier usuario autenticado los lee; solo el admin escribe.
drop policy if exists levels_select on public.levels;
create policy levels_select on public.levels
  for select using ((select auth.uid()) is not null);

drop policy if exists levels_write_admin on public.levels;
create policy levels_write_admin on public.levels
  for all using (public.is_admin()) with check (public.is_admin());

-- ── courses ───────────────────────────────────────────────
-- El estudiante ve un curso publicado si tiene acceso a su nivel.
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses
  for select using (
    public.is_admin()
    or (is_published and public.has_level_access(level_id))
  );

drop policy if exists courses_write_admin on public.courses;
create policy courses_write_admin on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- ── modules ───────────────────────────────────────────────
drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = modules.course_id
        and c.is_published
        and public.has_level_access(c.level_id)
    )
  );

drop policy if exists modules_write_admin on public.modules;
create policy modules_write_admin on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

-- ── lessons ───────────────────────────────────────────────
-- Las lecciones marcadas `is_free` son visibles para todos.
drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons
  for select using (
    public.is_admin()
    or is_free
    or exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
        and c.is_published
        and public.has_level_access(c.level_id)
    )
  );

drop policy if exists lessons_write_admin on public.lessons;
create policy lessons_write_admin on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ── resources ─────────────────────────────────────────────
drop policy if exists resources_select on public.resources;
create policy resources_select on public.resources
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = resources.lesson_id
        and c.is_published
        and public.has_level_access(c.level_id)
    )
  );

drop policy if exists resources_write_admin on public.resources;
create policy resources_write_admin on public.resources
  for all using (public.is_admin()) with check (public.is_admin());

-- ── enrollments ───────────────────────────────────────────
-- El estudiante ve sus matrículas; solo el admin las modifica.
drop policy if exists enrollments_select on public.enrollments;
create policy enrollments_select on public.enrollments
  for select using (profile_id = (select auth.uid()) or public.is_admin());

drop policy if exists enrollments_write_admin on public.enrollments;
create policy enrollments_write_admin on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- ── progress ──────────────────────────────────────────────
-- El estudiante gestiona su propio progreso.
drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress
  for select using (profile_id = (select auth.uid()) or public.is_admin());

drop policy if exists progress_insert_own on public.progress;
create policy progress_insert_own on public.progress
  for insert with check (profile_id = (select auth.uid()));

drop policy if exists progress_update_own on public.progress;
create policy progress_update_own on public.progress
  for update using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists progress_delete_admin on public.progress;
create policy progress_delete_admin on public.progress
  for delete using (public.is_admin());

-- ── downloads (log inmutable) ─────────────────────────────
drop policy if exists downloads_select on public.downloads;
create policy downloads_select on public.downloads
  for select using (profile_id = (select auth.uid()) or public.is_admin());

drop policy if exists downloads_insert_own on public.downloads;
create policy downloads_insert_own on public.downloads
  for insert with check (profile_id = (select auth.uid()));

-- ── activity_logs (log inmutable) ─────────────────────────
drop policy if exists activity_logs_select on public.activity_logs;
create policy activity_logs_select on public.activity_logs
  for select using (profile_id = (select auth.uid()) or public.is_admin());

drop policy if exists activity_logs_insert_own on public.activity_logs;
create policy activity_logs_insert_own on public.activity_logs
  for insert with check (profile_id = (select auth.uid()));
