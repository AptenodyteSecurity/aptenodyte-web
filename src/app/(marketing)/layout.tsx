import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
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
        {children}
      </div>
      <Footer />
    </>
  );
}
