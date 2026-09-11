import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getUserProfile, requireSignedIn } from "@/lib/auth/context";
import { getMemberships } from "@/lib/orgs/getMemberships";

export const metadata: Metadata = {
  title: "Dashboard — Aptenodyte",
  description: "Your Aptenodyte workspace.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSignedIn("/dashboard");
  const [profile, memberships] = await Promise.all([
    getUserProfile(),
    getMemberships(),
  ]);

  return (
    <DashboardShell
      profile={profile}
      orgName={memberships[0]?.organization.name ?? null}
    >
      {children}
    </DashboardShell>
  );
}
