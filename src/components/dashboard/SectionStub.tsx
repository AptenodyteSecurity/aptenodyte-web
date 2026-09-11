export default function SectionStub({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-2 border-black bg-white p-6">
      <h1 className="text-3xl font-bold tracking-tight text-black">{title}</h1>
      <p className="mt-3 text-base text-zinc-800">{description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-dashed border-black px-4 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-700">
            Coming soon
          </p>
          <p className="mt-2 text-2xl font-bold text-black">—</p>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-black px-4 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-700">
            Placeholder
          </p>
          <p className="mt-2 text-sm text-zinc-700">
            This section is a shell for upcoming data in/out.
          </p>
        </div>
      </div>
    </div>
  );
}
