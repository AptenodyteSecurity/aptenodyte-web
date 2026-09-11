-- Allow org members to delete their organization's dataset uploads.
-- Parsed row payloads stay off the dashboard list; this only removes the
-- stored file + metadata row.

drop policy if exists dataset_uploads_delete_member on public.dataset_uploads;
create policy dataset_uploads_delete_member
  on public.dataset_uploads
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.org_members
      where org_members.org_id = dataset_uploads.org_id
        and org_members.user_id = (select auth.uid())
    )
  );

grant delete on public.dataset_uploads to authenticated;
revoke update, truncate, trigger, references on public.dataset_uploads from anon, authenticated;
