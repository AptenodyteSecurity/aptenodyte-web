# Dashboard redesign — sidebar + database upload

Branch: `feat/dashboard` off `develop`. Auth-gated app shell; first real ingest path.

## Layout

- Persistent left sidebar; main panel is the active section.
- Site colors: black / white / yellow / orange. Square marketing chrome stays as-is.
- Sidebar nav uses slightly rounder buttons (`rounded-2xl`), color hover/active, no animation libraries.
- Bottom of sidebar (fixed): Settings, then profile (display name + initials avatar).
- Mobile: overlay drawer. Skip-to-content still targets the main panel.

### v1 sections

| Nav | Route | Status |
| --- | --- | --- |
| Database | `/dashboard` | Upload, validate, persist |
| Analytics | `/dashboard/analytics` | Stub (jurisdictions placeholder) |
| Connect database | `/dashboard/connect` | Stub |
| Settings | `/dashboard/settings` | Stub + accessibility control |

## Database ingest

Server action (logged-in user only):

1. Accept `.csv` and `.xlsx` (first sheet).
2. Validate type, size (4 MB), unique non-empty headers, and max row/column counts. No required column names or filled cells.
3. Store original file in private Storage bucket `dataset-uploads` at `{org_id}/{upload_id}/…`.
4. Store parsed rows as JSONB on `dataset_uploads` (org-scoped, RLS).
5. Return success/error to the form. No downstream processing.

Org: first membership. No org → upload disabled, existing empty-state copy.

## Auth

- Dashboard layout requires a session (redirect `/login?next=…`).
- Wire existing `updateSession` through `src/proxy.ts` so `/dashboard/*` stays gated.

## Out of scope

Commits, external DB connection, analytics computation, profile photo upload.
