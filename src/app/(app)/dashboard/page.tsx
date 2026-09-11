import DatasetDeleteButton from "@/components/dashboard/DatasetDeleteButton";
import DatasetUploadForm from "@/components/dashboard/DatasetUploadForm";
import { listDatasetUploads } from "@/lib/datasets/list";
import { getMemberships } from "@/lib/orgs/getMemberships";

function formatUploadedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function DashboardPage() {
  const memberships = await getMemberships();
  const org = memberships[0]?.organization ?? null;
  const uploads = org ? await listDatasetUploads(org.id) : [];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-4xl flex-1 px-6 py-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-black">
          Database
        </h1>
        <p className="mt-3 text-lg text-zinc-800">
          Upload a spreadsheet so Aptenodyte can use it later. We check that it
          parses, then store it — nothing else runs yet.
        </p>
      </header>

      <div className="mt-8">
        <DatasetUploadForm
          orgName={org?.name ?? null}
          disabledReason={
            org
              ? null
              : "No organization is attached to this account yet. If you have an access code, create an account from the sign-up page, or ask Aptenodyte to attach your user."
          }
        />
      </div>

      <section className="mt-10" aria-labelledby="uploads-heading">
        <h2
          id="uploads-heading"
          className="text-xl font-bold tracking-tight text-black"
        >
          Saved datasets
        </h2>
        {uploads.length === 0 ? (
          <p className="mt-3 border-2 border-black bg-white px-4 py-3 text-sm text-zinc-700">
            No datasets uploaded yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {uploads.map((upload) => (
              <li
                key={upload.id}
                className="flex items-center gap-3 border-2 border-black bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-black">
                    {upload.originalFilename}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    {upload.rowCount.toLocaleString()} rows ·{" "}
                    {upload.columns.length} columns ·{" "}
                    {formatUploadedAt(upload.createdAt)}
                  </p>
                </div>
                <DatasetDeleteButton
                  id={upload.id}
                  filename={upload.originalFilename}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
