-- ═══════════════════════════════════════════════════════════
--  Tatool Academy — Endurecimiento de seguridad (FASE 3)
--
--  La política profiles_update original permitía que un usuario
--  editara su propia fila... incluido su ROL. Vía la API pública
--  un estudiante podría haberse ascendido a admin.
--
--  Solución: profiles_update pasa a ser SOLO admin. La edición
--  del propio perfil (nombre, foto) se hará por server actions
--  con Prisma, controlando exactamente qué campos son editables.
-- ═══════════════════════════════════════════════════════════
drop policy if exists profiles_update on public.profiles;

create policy profiles_update on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());
