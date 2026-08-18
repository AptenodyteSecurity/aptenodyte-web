import Link from "next/link";

type ComingSoonProps = {
  title: string;
};

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-6 py-16"
    >
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black">{title}</h1>
        <p className="mt-4 text-xl font-semibold text-zinc-800">Coming soon.</p>
        <Link
          href="/"
          className="mt-10 inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
