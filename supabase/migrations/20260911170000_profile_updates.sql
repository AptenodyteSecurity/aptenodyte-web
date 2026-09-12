-- Allow signed-in users to maintain their own profile details from Settings.

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant update on public.profiles to authenticated;
