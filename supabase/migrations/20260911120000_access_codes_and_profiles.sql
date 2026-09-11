-- Profiles for signup identity fields + one-time org-linked access codes.
-- Mint codes via public.create_access_code (service_role / SQL editor).
-- Redeem happens server-side after Auth user creation via public.redeem_access_code.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.profiles to authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  org_id uuid not null references public.organizations (id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  note text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null,
  constraint access_codes_code_normalized check (code = upper(code)),
  constraint access_codes_code_format check (code ~ '^[A-Z0-9]{4}-[A-Z0-9]{4}$')
);

create unique index if not exists access_codes_code_uidx
  on public.access_codes (code);

create index if not exists access_codes_org_id_idx
  on public.access_codes (org_id);

create index if not exists access_codes_unused_idx
  on public.access_codes (org_id)
  where used_at is null;

alter table public.access_codes enable row level security;

-- No policies for anon/authenticated: codes are managed via security definer RPCs.
revoke all on public.access_codes from anon, authenticated;
grant select, insert, update, delete on public.access_codes to service_role;

create or replace function public._generate_access_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw text := '';
  i int;
begin
  for i in 1..8 loop
    raw := raw || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
end;
$$;

revoke all on function public._generate_access_code() from public;
revoke all on function public._generate_access_code() from anon, authenticated;

-- Example:
--   select public.create_access_code('swish');
--   select public.create_access_code('swish', 'admin', null, null, 'Mark onboarding');
--   select public.create_access_code('aptenodyte', 'member', 'ABCD-EFGH');
create or replace function public.create_access_code(
  p_org_slug text,
  p_role text default 'member',
  p_code text default null,
  p_expires_at timestamptz default null,
  p_note text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_code text;
  v_attempt int := 0;
begin
  if p_role not in ('owner', 'admin', 'member') then
    raise exception 'invalid role';
  end if;

  select id into v_org_id
  from public.organizations
  where slug = lower(trim(p_org_slug));

  if v_org_id is null then
    raise exception 'organization not found';
  end if;

  if p_code is null or length(trim(p_code)) = 0 then
    loop
      v_attempt := v_attempt + 1;
      if v_attempt > 20 then
        raise exception 'could not generate unique access code';
      end if;
      v_code := public._generate_access_code();
      exit when not exists (
        select 1 from public.access_codes where code = v_code
      );
    end loop;
  else
    v_code := upper(trim(p_code));
    v_code := regexp_replace(v_code, '[^A-Z0-9]', '', 'g');
    if length(v_code) <> 8 then
      raise exception 'access code must be 8 alphanumeric characters (XXXX-XXXX)';
    end if;
    v_code := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4);
  end if;

  insert into public.access_codes (code, org_id, role, expires_at, note)
  values (v_code, v_org_id, p_role, p_expires_at, nullif(trim(coalesce(p_note, '')), ''));

  return v_code;
end;
$$;

revoke all on function public.create_access_code(text, text, text, timestamptz, text)
  from public;
revoke all on function public.create_access_code(text, text, text, timestamptz, text)
  from anon, authenticated;
grant execute on function public.create_access_code(text, text, text, timestamptz, text)
  to service_role;

-- Atomically consume a one-time code, attach org membership, and upsert profile.
create or replace function public.redeem_access_code(
  p_code text,
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_row public.access_codes%rowtype;
  v_first text := trim(p_first_name);
  v_last text := trim(p_last_name);
  v_email text := lower(trim(p_email));
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
begin
  if p_user_id is null then
    raise exception 'user id required';
  end if;

  if v_first is null or length(v_first) = 0 then
    raise exception 'first name required';
  end if;

  if v_last is null or length(v_last) = 0 then
    raise exception 'last name required';
  end if;

  if v_email is null or length(v_email) = 0 then
    raise exception 'email required';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  v_code := upper(trim(coalesce(p_code, '')));
  v_code := regexp_replace(v_code, '[^A-Z0-9]', '', 'g');
  if length(v_code) <> 8 then
    raise exception 'invalid access code';
  end if;
  v_code := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4);

  update public.access_codes
  set
    used_at = now(),
    used_by = p_user_id
  where code = v_code
    and used_at is null
    and (expires_at is null or expires_at > now())
  returning * into v_row;

  if v_row.id is null then
    if exists (
      select 1 from public.access_codes
      where code = v_code and used_at is not null
    ) then
      raise exception 'access code already used';
    elsif exists (
      select 1 from public.access_codes
      where code = v_code and expires_at is not null and expires_at <= now()
    ) then
      raise exception 'access code expired';
    else
      raise exception 'invalid access code';
    end if;
  end if;

  insert into public.org_members (org_id, user_id, role)
  values (v_row.org_id, p_user_id, v_row.role)
  on conflict (org_id, user_id) do update
    set role = excluded.role;

  insert into public.profiles (user_id, first_name, last_name, phone, email)
  values (p_user_id, v_first, v_last, v_phone, v_email)
  on conflict (user_id) do update
    set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      email = excluded.email,
      updated_at = now();

  return v_row.org_id;
end;
$$;

revoke all on function public.redeem_access_code(text, uuid, text, text, text, text)
  from public;
revoke all on function public.redeem_access_code(text, uuid, text, text, text, text)
  from anon, authenticated;
grant execute on function public.redeem_access_code(text, uuid, text, text, text, text)
  to service_role;

-- Lightweight pre-check for the signup form (does not consume the code).
create or replace function public.validate_access_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  v_code := upper(trim(coalesce(p_code, '')));
  v_code := regexp_replace(v_code, '[^A-Z0-9]', '', 'g');
  if length(v_code) <> 8 then
    return false;
  end if;
  v_code := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4);

  return exists (
    select 1
    from public.access_codes
    where code = v_code
      and used_at is null
      and (expires_at is null or expires_at > now())
  );
end;
$$;

revoke all on function public.validate_access_code(text) from public;
revoke all on function public.validate_access_code(text) from anon, authenticated;
grant execute on function public.validate_access_code(text) to service_role;
