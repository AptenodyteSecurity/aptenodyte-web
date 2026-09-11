"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { UserProfile } from "@/lib/auth/context";
import { dashboardNav } from "@/lib/dashboard/nav";
import {
  AnalyticsIcon,
  DatabaseIcon,
  PlugIcon,
  SettingsIcon,
} from "@/components/dashboard/icons";

const iconById = {
  database: DatabaseIcon,
  analytics: AnalyticsIcon,
  connect: PlugIcon,
};

function navClass(active: boolean) {
  return [
    "flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-semibold text-black transition-colors duration-150",
    active
      ? "border-yellow-500 bg-yellow-400"
      : "border-black bg-white hover:border-yellow-500 hover:bg-yellow-100 active:border-orange-600 active:bg-orange-500",
  ].join(" ");
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardShell({
  profile,
  orgName,
  children,
}: {
  profile: UserProfile;
  orgName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b-2 border-black px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/AptenodyteLogo9.png"
            alt="Aptenodyte"
            width={48}
            height={48}
            className="h-10 w-10 object-contain"
          />
          <span className="text-base font-bold tracking-tight text-black">
            Aptenodyte
          </span>
        </Link>
        {orgName ? (
          <p className="mt-2 truncate text-xs text-zinc-700">{orgName}</p>
        ) : null}
      </div>

      <nav
        aria-label="Dashboard"
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-3"
      >
        {dashboardNav.map((item) => {
          const Icon = iconById[item.id];
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navClass(active)}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t-2 border-black p-3">
        <Link
          href="/dashboard/settings"
          className={navClass(isActive(pathname, "/dashboard/settings"))}
          aria-current={
            isActive(pathname, "/dashboard/settings") ? "page" : undefined
          }
        >
          <SettingsIcon className="h-5 w-5 shrink-0" />
          Settings
        </Link>

        <div className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 py-2">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-yellow-400 text-sm font-bold text-black"
            aria-hidden="true"
          >
            {profile.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">
              {profile.displayName}
            </p>
            {profile.email ? (
              <p className="truncate text-xs text-zinc-700">{profile.email}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <aside className="hidden h-dvh w-64 shrink-0 border-r-2 border-black md:flex md:flex-col">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id={menuId}
            className="relative z-50 flex h-full w-72 max-w-[85vw] flex-col border-r-2 border-black bg-white"
          >
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex items-center gap-3 border-b-2 border-black px-4 py-3 md:hidden">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border-2 border-black bg-white px-3 text-sm font-semibold text-black hover:bg-yellow-100"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <span className="text-sm font-bold text-black">Dashboard</span>
        </div>
        {children}
      </div>
    </div>
  );
}
