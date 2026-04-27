"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changeDisplayNameAction } from "@/app/intern/account/name/actions";
import { initialChangeDisplayNameActionState } from "@/app/intern/account/name/action-state";

type ChangeDisplayNameFormProps = {
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

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-5 w-5">
      <path d="m13.75 3.75 2.5 2.5" />
      <path d="M4.75 15.25 7.5 14.5l7.5-7.5a1.77 1.77 0 0 0-2.5-2.5L5 12l-.25 3.25Z" />
    </svg>
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
      {pending ? "กำลังบันทึก..." : "บันทึกชื่อที่แสดง"}
    </button>
  );
}

export function ChangeDisplayNameForm({
  backHref,
  currentUser,
  theme,
}: ChangeDisplayNameFormProps) {
  const [state, formAction] = useActionState(changeDisplayNameAction, {
    ...initialChangeDisplayNameActionState,
    value: currentUser.name ?? "",
  });

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
          preview: "bg-student/8 text-(--color-student)",
        }
      : {
          page: "bg-[#fbf7f4]",
          panel: "border-slate-200 bg-white shadow-admin/10",
          chip: "bg-admin/10 text-(--color-admin)",
          back: "hover:text-(--color-admin)",
          success: "border-emerald-200 bg-emerald-50 text-emerald-700",
          error: "border-red-200 bg-red-50 text-red-700",
          input: "focus:border-admin/40 focus:ring-admin/10",
          preview: "bg-admin/8 text-(--color-admin)",
        };

  return (
    <main className={`min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${accentClasses.page}`}>
      <div className="mx-auto w-full max-w-5xl">
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
                  ตั้งชื่อที่แสดง
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  ชื่อนี้จะแสดงบนแถบนำทางและเมนูบัญชีของคุณหลังเข้าสู่ระบบ
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{currentUser.name?.trim() || currentUser.email}</p>
              <p className="mt-1 break-all">{currentUser.email}</p>
            </div>
          </div>

          <form action={formAction} className="mt-6 space-y-5">
            {state.success ? (
              <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${accentClasses.success}`}>
                <div className="mt-0.5 shrink-0">
                  <CheckIcon />
                </div>
                <p>{state.success}</p>
              </div>
            ) : null}

            {state.error ? (
              <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${accentClasses.error}`}>
                <div className="mt-0.5 shrink-0">
                  <AlertIcon />
                </div>
                <p>{state.error}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="display-name" className="text-sm font-medium text-slate-700">
                ชื่อที่แสดง
              </label>
              <div className="relative">
                <input
                  id="display-name"
                  name="name"
                  defaultValue={state.value}
                  maxLength={255}
                  className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${accentClasses.input}`}
                  placeholder="กรอกชื่อและนามสกุล"
                  required
                />
                <div className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400">
                  <PencilIcon />
                </div>
              </div>
              {state.fieldErrors.name ? (
                <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
              ) : null}
            </div>

            <div className={`rounded-3xl border border-transparent px-4 py-4 text-sm ${accentClasses.preview}`}>
              <p className="font-medium text-slate-900">ตัวอย่างการแสดงผล</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{state.value.trim() || currentUser.email}</p>
            </div>

            <div className="flex justify-end">
              <SubmitButton tone={theme} />
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}