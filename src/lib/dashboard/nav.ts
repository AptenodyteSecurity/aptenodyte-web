export const dashboardNav = [
  { href: "/dashboard", label: "Database", id: "database" },
  { href: "/dashboard/analytics", label: "Analytics", id: "analytics" },
  {
    href: "/dashboard/connect",
    label: "Connect database",
    id: "connect",
  },
] as const;

export type DashboardNavId = (typeof dashboardNav)[number]["id"];

export function isDashboardHome(pathname: string) {
  return pathname === "/dashboard" || pathname === "/dashboard/";
}
