import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "Aptenodyte",
  description: "Compliance made easy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
