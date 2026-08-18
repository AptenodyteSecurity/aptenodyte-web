import { Atkinson_Hyperlegible } from "next/font/google";
import Script from "next/script";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { a11yInitScript } from "@/lib/a11y";
import "./globals.css";

const readableFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-readable",
});

export const metadata = {
  title: "Aptenodyte",
  description: "Compliance made easy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={readableFont.variable} suppressHydrationWarning>
      <body className="bg-white text-zinc-950 antialiased">
        <Script
          id="aptenodyte-a11y-init"
          strategy="beforeInteractive"
        >
          {a11yInitScript}
        </Script>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-black focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-black"
        >
          Skip to main content
        </a>
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
      </body>
    </html>
  );
}
