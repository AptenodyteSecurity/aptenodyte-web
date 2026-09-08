-- Blog posts stored in Postgres (not Markdown files).
-- Public: SELECT published rows only.
-- Aptenodyte org owner/admin: full CRUD (enforced by RLS).

create or replace function public.is_aptenodyte_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members as members
    inner join public.organizations as orgs
      on orgs.id = members.org_id
    where members.user_id = (select auth.uid())
      and orgs.slug = 'aptenodyte'
      and members.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_aptenodyte_admin() from public;
grant execute on function public.is_aptenodyte_admin() to anon, authenticated;

create table if not exists public.blog_posts (
  id bigint generated always as identity primary key,
  slug text not null,
  title text not null,
  excerpt text not null,
  body text not null,
  cover_image_url text,
  author_name text not null,
  author_id uuid references auth.users (id) on delete set null,
  published boolean not null default false,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint blog_posts_slug_len check (
    char_length(slug) between 1 and 80
  ),
  constraint blog_posts_title_len check (
    char_length(title) between 1 and 200
  ),
  constraint blog_posts_excerpt_len check (
    char_length(excerpt) between 1 and 500
  ),
  constraint blog_posts_author_len check (
    char_length(author_name) between 1 and 80
  ),
  constraint blog_posts_body_len check (
    char_length(body) between 1 and 100000
  )
);

create unique index if not exists blog_posts_slug_key
  on public.blog_posts (slug);

create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published_at desc)
  where published = true;

create index if not exists blog_posts_author_id_idx
  on public.blog_posts (author_id);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row
  execute procedure public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;
alter table public.blog_posts force row level security;

drop policy if exists blog_posts_select_published on public.blog_posts;
create policy blog_posts_select_published
  on public.blog_posts
  for select
  to anon, authenticated
  using (
    published = true
    or (select public.is_aptenodyte_admin())
  );

drop policy if exists blog_posts_insert_admin on public.blog_posts;
create policy blog_posts_insert_admin
  on public.blog_posts
  for insert
  to authenticated
  with check ((select public.is_aptenodyte_admin()));

drop policy if exists blog_posts_update_admin on public.blog_posts;
create policy blog_posts_update_admin
  on public.blog_posts
  for update
  to authenticated
  using ((select public.is_aptenodyte_admin()))
  with check ((select public.is_aptenodyte_admin()));

drop policy if exists blog_posts_delete_admin on public.blog_posts;
create policy blog_posts_delete_admin
  on public.blog_posts
  for delete
  to authenticated
  using ((select public.is_aptenodyte_admin()));

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
revoke all on public.blog_posts from public;

insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do update
  set public = true;

drop policy if exists blog_covers_public_read on storage.objects;
create policy blog_covers_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'blog-covers');

drop policy if exists blog_covers_admin_insert on storage.objects;
create policy blog_covers_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-covers'
    and (select public.is_aptenodyte_admin())
  );

drop policy if exists blog_covers_admin_update on storage.objects;
create policy blog_covers_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and (select public.is_aptenodyte_admin())
  )
  with check (
    bucket_id = 'blog-covers'
    and (select public.is_aptenodyte_admin())
  );

drop policy if exists blog_covers_admin_delete on storage.objects;
create policy blog_covers_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and (select public.is_aptenodyte_admin())
  );
