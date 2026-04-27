"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/login/actions";
import { initialLoginActionState } from "@/app/login/action-state";

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-(--color-admin) px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80"
    >
      {pending ? (
        <>
          <SpinnerIcon />
          กำลังเข้าสู่ระบบ...
        </>
      ) : (
        "เข้าสู่ระบบ"
      )}
    </button>
  );
}

type LoginFormProps = {
  initialError?: string | null;
  googleLoginEnabled: boolean;
  googleLoginHref: string;
  cmuLoginEnabled: boolean;
  cmuLoginHref: string;
  nextPath?: string | null;
};

export function LoginForm({
  initialError = null,
  googleLoginEnabled,
  googleLoginHref,
  cmuLoginEnabled,
  cmuLoginHref,
  nextPath = null,
}: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialLoginActionState);
  const [showPassword, setShowPassword] = useState(false);
  const errorMessage = state.error ?? initialError;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          เข้าสู่ระบบเพื่อดำเนินการต่อ
        </h1>
        <p className="text-sm leading-6 text-slate-600 sm:text-base">
          ใช้บัญชีที่ได้รับมอบหมายในระบบจัดการนักศึกษาฝึกงาน
        </p>
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="mt-0.5 shrink-0 text-red-500">
            <AlertIcon />
          </div>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
            placeholder="you@cmu.ac.th"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            รหัสผ่าน
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
              placeholder="กรอกรหัสผ่าน"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-600"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <SubmitButton />
      </form>

      <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>หรือ</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {googleLoginEnabled ? (
        <a
          href={googleLoginHref}
          className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-admin/10"
          aria-label="เข้าสู่ระบบด้วย Google"
        >
          <Image
            src="/google-logo.svg"
            alt="Google"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span>เข้าสู่ระบบด้วย Google</span>
        </a>
      ) : (
        <div
          aria-disabled="true"
          className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-400 opacity-70 grayscale"
          title="ยังไม่ได้ตั้งค่าการเข้าสู่ระบบ Google สำหรับสภาพแวดล้อมนี้"
        >
          <Image
            src="/google-logo.svg"
            alt="Google"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span>เข้าสู่ระบบด้วย Google</span>
        </div>
      )}

      {cmuLoginEnabled ? (
        <a
          href={cmuLoginHref}
          className="block rounded-[22px] outline-none transition hover:opacity-95 focus-visible:ring-4 focus-visible:ring-admin/15"
          aria-label="เข้าสู่ระบบด้วยบัญชี CMU"
        >
          <Image
            src="/login_cmu.png"
            alt="เข้าสู่ระบบด้วยบัญชี CMU"
            width={640}
            height={186}
            className="h-auto w-full rounded-[22px]"
            priority
          />
        </a>
      ) : (
        <div
          aria-disabled="true"
          className="rounded-[22px] opacity-60 grayscale"
          title="ยังไม่ได้ตั้งค่าการเข้าสู่ระบบ CMU Entra สำหรับสภาพแวดล้อมนี้"
        >
          <Image
            src="/login_cmu.png"
            alt="ไม่สามารถเข้าสู่ระบบด้วยบัญชี CMU ได้ในขณะนี้"
            width={640}
            height={186}
            className="h-auto w-full rounded-[22px]"
          />
        </div>
      )}

      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">การเข้าถึงบัญชี</p>
        <div className="mt-3 space-y-2 leading-6">
          <p>ต้องมีบัญชีอยู่ในฐานข้อมูลก่อนจึงจะเข้าสู่ระบบได้</p>
          <p>super admin เป็นผู้สร้างบัญชี admin และ admin เป็นผู้สร้างบัญชีนักศึกษา</p>
          <p>การเข้าสู่ระบบด้วย Google หรือ CMU Entra ใช้งานได้เมื่อเซิร์ฟเวอร์ตั้งค่าเรียบร้อยแล้วเท่านั้น</p>
        </div>
      </div>
    </div>
  );
}