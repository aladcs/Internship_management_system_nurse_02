"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AccountMenu } from "@/components/auth/account-menu";
import { appShellClass } from "@/lib/page-shell";

type LogoutServerAction = () => Promise<void>;

export type AdminShellNavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

type AdminLayoutShellProps = {
  backgroundClassName?: string;
  children: React.ReactNode;
  currentPath: string;
  currentUser: {
    email: string;
    name: string | null;
  };
  homeHref: string;
  logoutAction: LogoutServerAction;
  navItems: AdminShellNavItem[];
  roleLabel: string;
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function isActiveNavItem(currentPath: string, item: AdminShellNavItem) {
  if (item.match === "prefix") {
    return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
  }

  return currentPath === item.href;
}

function getDesktopNavClass(active: boolean) {
  return active
    ? "rounded-full bg-admin/12 px-4 py-2 text-sm font-semibold text-(--color-admin)"
    : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";
}

function getMobileNavClass(active: boolean) {
  return active
    ? "block rounded-2xl bg-admin/12 px-4 py-3 text-sm font-semibold text-(--color-admin)"
    : "block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
}

export function AdminLayoutShell({
  backgroundClassName = "bg-[#fbf7f4] text-slate-950",
  children,
  currentPath,
  currentUser,
  homeHref,
  logoutAction,
  navItems,
  roleLabel,
}: AdminLayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasDisplayName = Boolean(currentUser.name?.trim());

  return (
    <div className={`min-h-screen ${backgroundClassName}`}>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className={`${appShellClass} flex items-center justify-between gap-4 py-3`}>
          <div className="flex items-center gap-4">
            <Link href={homeHref} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src="/nurse_logo.svg"
                  alt="ระบบจัดการฝึกงาน"
                  width={27}
                  height={30}
                  style={{ width: "auto" }}
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-admin)">
                  ระบบ
                </p>
                <p className="text-sm font-medium text-slate-700">จัดการนักศึกษาฝึกงาน</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const active = isActiveNavItem(currentPath, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={getDesktopNavClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AccountMenu
              email={currentUser.email}
              logoutAction={logoutAction}
              name={currentUser.name}
              roleLabel={roleLabel}
              tone="admin"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
            aria-label="เปิดเมนูนำทาง"
          >
            <MenuIcon />
          </button>
        </div>

        {!hasDisplayName ? (
          <div className="border-t border-admin/10 bg-linear-to-r from-admin/8 via-white to-admin/5">
            <div className={`${appShellClass} flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  กรุณาตั้งชื่อที่แสดงสำหรับบัญชีของคุณ
                </p>
                
              </div>
              <Link
                href="/intern/account/name"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-(--color-admin) px-4 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95"
              >
                ตั้งชื่อที่แสดง
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.name?.trim() || currentUser.email}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{currentUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700"
                aria-label="ปิดเมนูนำทาง"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const active = isActiveNavItem(currentPath, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={getMobileNavClass(active)}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/intern/account/name"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-admin/6 hover:text-(--color-admin)"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentUser.name?.trim() ? "แก้ไขชื่อที่แสดง" : "ตั้งชื่อที่แสดง"}
              </Link>
              <Link
                href="/intern/account/password"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-admin/6 hover:text-(--color-admin)"
                onClick={() => setMobileMenuOpen(false)}
              >
                เปลี่ยนรหัสผ่าน
              </Link>
            </nav>

            <div className="mt-auto pt-8">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      {children}
    </div>
  );
}