import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { CMU_ENTRA_LOGIN_PATH, isCmuEntraConfigured } from "@/lib/auth/cmu-entra";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";

const statusChips = [
  {
    label: "Account access",
    value: "Server-side",
    accent: "text-sky-700",
  },
  {
    label: "Role routing",
    value: "Automatic",
    accent: "text-[color:var(--color-admin)]",
  },
  {
    label: "Student flow",
    value: "Protected",
    accent: "text-emerald-700",
  },
] as const;

export const metadata: Metadata = {
  title: "Login | Internship Management System",
  description: "Sign in to access the internship management system.",
};

const CMU_LOGIN_ERRORS: Record<string, string> = {
  not_configured: "CMU Entra login is not configured for this environment.",
  access_denied: "CMU login was canceled before the account could be verified.",
  invalid_state: "CMU login could not be verified. Please try again.",
  token_failed: "CMU login could not complete the secure token exchange.",
  userinfo_failed: "CMU login could not read your CMU account profile.",
  email_not_allowed: "This CMU account does not have access to the internship system.",
  callback_failed: "CMU login returned an unexpected response.",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return typeof value === "string" ? value : null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await readSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const cmuErrorCode = readSearchParam(resolvedSearchParams, "cmu");
  const initialError = cmuErrorCode ? CMU_LOGIN_ERRORS[cmuErrorCode] ?? null : null;

  if (session) {
    redirect(getRoleRedirectPath(session.role));
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <Image
                src="/nurse_logo.svg"
                alt="Internship Management System"
                width={32}
                height={32}
                priority
              />
            </div>
            <div className="text-sm leading-5 text-slate-600">
              <p className="font-semibold uppercase tracking-[0.18em] text-(--color-admin)">
                Internship
              </p>
              <p className="font-medium text-slate-700">Management System</p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-12">
            <LoginForm
              initialError={initialError}
              cmuLoginEnabled={isCmuEntraConfigured()}
              cmuLoginHref={CMU_ENTRA_LOGIN_PATH}
            />
          </div>

          <p className="text-center text-sm text-slate-500">
            © 2026 Internship Management System. All rights reserved.
          </p>
        </section>

        <aside className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#a86ca8_0%,#d7927a_58%,#f4c58f_100%)]" />
          <div className="absolute left-[-12%] top-[10%] h-72 w-72 rounded-full bg-white/14 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-[#fff2df]/30 blur-3xl" />

          <div className="relative z-10 flex flex-1 flex-col justify-between px-14 py-14 text-white">
            <div className="flex justify-end">
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur">
                CMU Nursing
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/14 shadow-lg shadow-black/10 ring-1 ring-white/20 backdrop-blur-sm">
                <Image
                  src="/nurse_logo.svg"
                  alt="Nurse logo"
                  width={60}
                  height={60}
                  priority
                />
              </div>

              <div className="max-w-xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white/80">
                  Secure role-based access
                </p>
                <h2 className="text-4xl font-semibold leading-tight tracking-tight text-balance xl:text-5xl">
                  One sign-in point for super admins, admins, and students.
                </h2>
                <p className="max-w-lg text-base leading-7 text-white/82 xl:text-lg">
                  Access is granted only to accounts provisioned in the database, with role-aware routing prepared for the internship workflow.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {statusChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="rounded-3xl border border-white/15 bg-white/14 p-4 backdrop-blur-md"
                  >
                    <p className="text-sm text-white/70">{chip.label}</p>
                    <p className={`mt-2 text-lg font-semibold ${chip.accent}`}>
                      {chip.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm leading-6 text-white/70">
              Internship workflows remain role-scoped and ready for route protection in the next slice.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}