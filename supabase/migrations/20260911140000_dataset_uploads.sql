-- Org-scoped spreadsheet ingest. Original files live in private Storage;
-- parsed rows are stored as JSONB for later use. No processing beyond save.

create table if not exists public.dataset_uploads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  original_filename text not null,
  content_type text not null,
  storage_path text not null unique,
  byte_size integer not null check (byte_size > 0),
  row_count integer not null check (row_count >= 0),
  columns text[] not null,
  rows jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint dataset_uploads_filename_len check (
    char_length(original_filename) between 1 and 255
  ),
  constraint dataset_uploads_columns_len check (
    cardinality(columns) between 1 and 40
  )
);

create index if not exists dataset_uploads_org_id_created_at_idx
  on public.dataset_uploads (org_id, created_at desc);

create index if not exists dataset_uploads_uploaded_by_idx
  on public.dataset_uploads (uploaded_by);

alter table public.dataset_uploads enable row level security;
alter table public.dataset_uploads force row level security;

drop policy if exists dataset_uploads_select_member on public.dataset_uploads;
create policy dataset_uploads_select_member
  on public.dataset_uploads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.org_members
      where org_members.org_id = dataset_uploads.org_id
        and org_members.user_id = (select auth.uid())
    )
  );

drop policy if exists dataset_uploads_insert_member on public.dataset_uploads;
create policy dataset_uploads_insert_member
  on public.dataset_uploads
  for insert
  to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and exists (
      select 1
      from public.org_members
      where org_members.org_id = dataset_uploads.org_id
        and org_members.user_id = (select auth.uid())
    )
  );

grant select, insert on public.dataset_uploads to authenticated;
revoke update, delete on public.dataset_uploads from anon, authenticated;
revoke all on public.dataset_uploads from public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dataset-uploads',
  'dataset-uploads',
  false,
  4194304,
  array[
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
  set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists dataset_uploads_storage_select on storage.objects;
create policy dataset_uploads_storage_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'dataset-uploads'
    and exists (
      select 1
      from public.org_members
      where org_members.user_id = (select auth.uid())
        and org_members.org_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists dataset_uploads_storage_insert on storage.objects;
create policy dataset_uploads_storage_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'dataset-uploads'
    and exists (
      select 1
      from public.org_members
      where org_members.user_id = (select auth.uid())
        and org_members.org_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists dataset_uploads_storage_delete on storage.objects;
create policy dataset_uploads_storage_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'dataset-uploads'
    and exists (
      select 1
      from public.org_members
      where org_members.user_id = (select auth.uid())
        and org_members.org_id::text = (storage.foldername(name))[1]
    )
  );
