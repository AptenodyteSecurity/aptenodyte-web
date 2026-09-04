import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { requireAptenodyteAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Studio — Aptenodyte",
  robots: { index: false, follow: false, nocache: true },
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAptenodyteAdmin("/studio");

  return (
    <>
      <a
        href="#accessibility-settings"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-16 focus:z-50 focus:border-2 focus:border-black focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-black"
      >
        Accessibility settings
      </a>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-6 py-8"
        >
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
