"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type LogoutServerAction = () => Promise<void>;

type AccountMenuProps = {
  email: string;
  logoutAction: LogoutServerAction;
  name: string;
  roleLabel: string;
  tone: "student" | "admin";
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m5.75 7.75 4.25 4.5 4.25-4.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <rect x="4.25" y="8.5" width="11.5" height="8" rx="2.25" />
      <path d="M6.75 8.5V6.75a3.25 3.25 0 1 1 6.5 0V8.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="M8 4.75H6.75A2.25 2.25 0 0 0 4.5 7v6a2.25 2.25 0 0 0 2.25 2.25H8" />
      <path d="M11 13.25 14.25 10 11 6.75" />
      <path d="M14 10H7.5" />
    </svg>
  );
}

export function AccountMenu({
  email,
  logoutAction,
  name,
  roleLabel,
  tone,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const accentClasses =
    tone === "student"
      ? {
          button: "hover:border-orange-200 hover:bg-orange-50/70",
          badge: "text-(--color-student)",
          item: "hover:bg-orange-50 hover:text-orange-700",
        }
      : {
          button: "hover:border-admin/20 hover:bg-admin/6",
          badge: "text-(--color-admin)",
          item: "hover:bg-admin/6 hover:text-(--color-admin)",
        };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition ${accentClasses.button}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className={`text-xs uppercase tracking-[0.2em] text-slate-500 ${accentClasses.badge}`}>
            {roleLabel}
          </p>
        </div>
        <div className="text-slate-400">
          <ChevronDownIcon />
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-72 rounded-[28px] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/12">
          <div className="rounded-3xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{name}</p>
            <p className="mt-1 break-all text-xs text-slate-500">{email}</p>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/intern/account/password"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition ${accentClasses.item}`}
              onClick={() => setOpen(false)}
            >
              <LockIcon />
              เปลี่ยนรหัสผ่าน
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <LogoutIcon />
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}