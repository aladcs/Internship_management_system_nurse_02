"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction } from "@/app/intern/account/password/actions";
import { initialChangePasswordActionState } from "@/app/intern/account/password/action-state";

type ChangePasswordFormProps = {
  backHref: string;
  currentUser: {
    email: string;
    name: string | null;
    roleLabel: string;
  };
  theme: "student" | "admin";
};

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-11.5a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0v-4Zm.75 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="m4.75 10.25 3.25 3.25 7.25-7.25" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <path d="M2.04 12a11.96 11.96 0 0 1 19.92 0 11.96 11.96 0 0 1-19.92 0Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M3 3 21 21" />
      <path d="M10.58 10.58A2 2 0 0 0 13.4 13.4" />
      <path d="M9.88 5.09A9.77 9.77 0 0 1 12 4.85c5.05 0 8.27 4.22 9.24 5.72a1 1 0 0 1 0 1.08 18.18 18.18 0 0 1-4.15 4.55" />
      <path d="M6.61 6.61A18.2 18.2 0 0 0 2.76 10.57a1 1 0 0 0 0 1.08C3.73 13.15 6.95 17.35 12 17.35c1.52 0 2.91-.38 4.16-.98" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-white/30" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  focusClassName,
}: {
  id: string;
  label: string;
  autoComplete: string;
  focusClassName: string;
}) {
  const [showValue, setShowValue] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={showValue ? "text" : "password"}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${focusClassName}`}
          required
        />
        <button
          type="button"
          onClick={() => setShowValue((current) => !current)}
          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-600"
          aria-label={showValue ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          <EyeIcon open={showValue} />
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ tone }: { tone: "student" | "admin" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80 ${tone === "student" ? "bg-(--color-student) shadow-orange-600/25" : "bg-(--color-admin) shadow-admin/25"}`}
    >
      {pending ? (
        <>
          <SpinnerIcon />
          กำลังบันทึก...
        </>
      ) : (
        "บันทึกรหัสผ่านใหม่"
      )}
    </button>
  );
}

export function ChangePasswordForm({
  backHref,
  currentUser,
  theme,
}: ChangePasswordFormProps) {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialChangePasswordActionState,
  );

  const accentClasses =
    theme === "student"
      ? {
          page: "bg-[#fff7f1]",
          panel: "border-orange-100 bg-white shadow-orange-950/8",
          chip: "bg-student/10 text-(--color-student)",
          back: "hover:text-(--color-student)",
          success: "border-emerald-200 bg-emerald-50 text-emerald-700",
          error: "border-red-200 bg-red-50 text-red-700",
          input: "focus:border-orange-300 focus:ring-orange-100",
        }
      : {
          page: "bg-[#fbf7f4]",
          panel: "border-slate-200 bg-white shadow-admin/10",
          chip: "bg-admin/10 text-(--color-admin)",
          back: "hover:text-(--color-admin)",
          success: "border-emerald-200 bg-emerald-50 text-emerald-700",
          error: "border-red-200 bg-red-50 text-red-700",
          input: "focus:border-admin/40 focus:ring-admin/10",
        };

  return (
    <main className={`min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${accentClasses.page}`}>
      <div className="mx-auto max-w-3xl">
        <Link
          href={backHref}
          className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition ${accentClasses.back}`}
        >
          <span aria-hidden="true">←</span>
          กลับไปหน้าก่อนหน้า
        </Link>

        <section className={`mt-5 rounded-[32px] border p-6 shadow-xl sm:p-8 ${accentClasses.panel}`}>
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${accentClasses.chip}`}>
                {currentUser.roleLabel}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  เปลี่ยนรหัสผ่าน
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  อัปเดตรหัสผ่านของบัญชีนี้โดยยืนยันรหัสผ่านปัจจุบันก่อนทุกครั้ง
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{currentUser.name ?? currentUser.email}</p>
              <p className="mt-1 break-all">{currentUser.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {state.error ? (
              <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${accentClasses.error}`}>
                <div className="mt-0.5 shrink-0">
                  <AlertIcon />
                </div>
                <p>{state.error}</p>
              </div>
            ) : null}

            {state.success ? (
              <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${accentClasses.success}`}>
                <div className="mt-0.5 shrink-0">
                  <CheckIcon />
                </div>
                <p>{state.success}</p>
              </div>
            ) : null}
          </div>

          <form action={formAction} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <PasswordField
                  id="currentPassword"
                  label="รหัสผ่านปัจจุบัน"
                  autoComplete="current-password"
                  focusClassName={accentClasses.input}
                />
              </div>
              <PasswordField
                id="newPassword"
                label="รหัสผ่านใหม่"
                autoComplete="new-password"
                focusClassName={accentClasses.input}
              />
              <PasswordField
                id="confirmPassword"
                label="ยืนยันรหัสผ่านใหม่"
                autoComplete="new-password"
                focusClassName={accentClasses.input}
              />
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-800">ข้อกำหนด</p>
              <p className="mt-2">รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร และต้องไม่ซ้ำกับรหัสผ่านเดิม</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href={backHref} className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
                ยกเลิก
              </Link>
              <SubmitButton tone={theme} />
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}