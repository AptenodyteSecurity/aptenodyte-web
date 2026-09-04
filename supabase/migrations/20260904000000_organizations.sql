-- Organizations and memberships.
-- Authenticated users can READ their own org + membership only.
-- They cannot INSERT/UPDATE/DELETE (no self-join, no org creation from the app).
-- Add members from the SQL editor via public.add_org_member_by_email.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists org_members_user_id_idx on public.org_members (user_id);

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;

-- No policies for insert/update/delete on the anon/authenticated roles.
drop policy if exists "org_members_select_own" on public.org_members;
create policy "org_members_select_own"
  on public.org_members
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member"
  on public.organizations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.org_members
      where org_members.org_id = organizations.id
        and org_members.user_id = auth.uid()
    )
  );

grant select on public.organizations to authenticated;
grant select on public.org_members to authenticated;

revoke insert, update, delete on public.organizations from anon, authenticated;
revoke insert, update, delete on public.org_members from anon, authenticated;

insert into public.organizations (name, slug)
values
  ('Aptenodyte', 'aptenodyte'),
  ('Swish', 'swish')
on conflict (slug) do nothing;

create or replace function public.add_org_member_by_email(
  p_org_slug text,
  p_email text,
  p_role text default 'member'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_user_id uuid;
begin
  if p_role not in ('owner', 'admin', 'member') then
    raise exception 'invalid role';
  end if;

  select id into v_org_id
  from public.organizations
  where slug = p_org_slug;

  if v_org_id is null then
    raise exception 'organization not found';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email));

  if v_user_id is null then
    raise exception 'user not found';
  end if;

  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, v_user_id, p_role)
  on conflict (org_id, user_id) do update
    set role = excluded.role;
end;
$$;

revoke all on function public.add_org_member_by_email(text, text, text) from public;
revoke all on function public.add_org_member_by_email(text, text, text) from anon, authenticated;
grant execute on function public.add_org_member_by_email(text, text, text) to service_role;

-- Example (run in SQL editor as postgres after creating the Auth user):
-- select public.add_org_member_by_email('aptenodyte', 'you@aptenodyte.com', 'owner');
-- select public.add_org_member_by_email('swish', 'mark@example.com', 'admin');
