import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio — Aptenodyte",
  robots: { index: false, follow: false, nocache: true },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl flex-1 px-6 py-8"
    >
      {children}
    </main>
  );
}
