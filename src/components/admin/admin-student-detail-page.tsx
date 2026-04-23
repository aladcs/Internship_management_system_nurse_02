"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { InternshipStatus } from "@prisma/client";
import {
  initialUpdateStudentStatusActionState,
  type UpdateStudentStatusActionState,
} from "@/app/intern/admin/students/[id]/action-state";
import { updateStudentStatusAction } from "@/app/intern/admin/students/[id]/actions";
import { logoutAction } from "@/app/intern/admin/students/actions";
import {
  AdminMobileNotificationsCard,
  AdminNotificationMenu,
} from "@/components/admin/admin-notification-menu";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

type SummaryItem = {
  label: string;
  value: string;
};

type FileItem = {
  id: string;
  name: string;
  href: string;
  meta: string;
};

export type AdminStudentDetailPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  unreadNotificationCount: number;
  notifications: AdminNotificationItem[];
  student: {
    id: string;
    firstName: string;
    displayName: string;
    email: string;
    status: InternshipStatus;
    statusLabel: string;
    completionNote: string | null;
    personal: SummaryItem[];
    internship: SummaryItem[];
    education: SummaryItem[];
    files: FileItem[];
    summary: {
      lastUpdatedLabel: string;
      submittedAtLabel: string;
    };
  };
};

type TimelineStep = {
  id: string;
  title: string;
  description: string;
  tone: "complete" | "active" | "upcoming";
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

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="M11.75 4.75 6.5 10l5.25 5.25" />
      <path d="M7 10h7" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="M10 2.5 11.45 7l4.55 1.45L11.45 9.9 10 14.5 8.55 9.9 4 8.45 8.55 7 10 2.5Z" />
      <path d="m15.5 12.5.7 2.05 2.05.7-2.05.7-.7 2.05-.7-2.05-2.05-.7 2.05-.7.7-2.05Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-5 w-5">
      <rect x="4.25" y="8.5" width="11.5" height="8" rx="2.25" />
      <path d="M6.75 8.5V6.75a3.25 3.25 0 1 1 6.5 0V8.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-5 w-5">
      <path d="M6.5 2.75h5.25L15.5 6.5v8.75A2.25 2.25 0 0 1 13.25 17.5h-6.5A2.25 2.25 0 0 1 4.5 15.25v-10A2.5 2.5 0 0 1 7 2.75Z" />
      <path d="M11.5 2.75V6.5h3.75" />
    </svg>
  );
}

function EmptyFilesIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-16 w-16">
      <rect x="12" y="12" width="40" height="40" rx="14" className="fill-admin/10 stroke-admin/20" strokeWidth="2" />
      <path d="M24 28h16" className="stroke-admin/45" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 36h10" className="stroke-admin/35" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-4 w-4">
      <circle cx="10" cy="6" r="2.75" />
      <path d="M4.5 16c1.2-2.73 3.08-4.1 5.5-4.1 2.42 0 4.3 1.37 5.5 4.1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-4 w-4">
      <rect x="3.25" y="4.5" width="13.5" height="12.25" rx="2.25" />
      <path d="M6.5 2.75v3.5" />
      <path d="M13.5 2.75v3.5" />
      <path d="M3.25 8h13.5" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-4 w-4">
      <path d="m2.5 7.25 7.5-3.5 7.5 3.5-7.5 3.5-7.5-3.5Z" />
      <path d="M5.5 8.75v3.15c0 1.3 2.02 2.35 4.5 2.35s4.5-1.05 4.5-2.35V8.75" />
    </svg>
  );
}

function formatStatusLabel(status: InternshipStatus) {
  if (status === "in_progress") {
    return "In Progress";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClasses(status: InternshipStatus) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (status === "in_progress") {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

function getTimelineSteps(status: InternshipStatus): TimelineStep[] {
  if (status === "completed") {
    return [
      {
        id: "submitted",
        title: "Form Submitted",
        description: "The student's internship information is on file.",
        tone: "complete",
      },
      {
        id: "review",
        title: "Admin Review",
        description: "The record has already moved through active review.",
        tone: "complete",
      },
      {
        id: "completed",
        title: "Completed",
        description: "The internship record is finalized.",
        tone: "complete",
      },
    ];
  }

  if (status === "in_progress") {
    return [
      {
        id: "submitted",
        title: "Form Submitted",
        description: "The student's internship details are already on file.",
        tone: "complete",
      },
      {
        id: "review",
        title: "Admin Review",
        description: "The internship is actively in progress and under admin tracking.",
        tone: "active",
      },
      {
        id: "completed",
        title: "Completed",
        description: "Mark the record complete when the internship closes.",
        tone: "upcoming",
      },
    ];
  }

  return [
    {
      id: "submitted",
      title: "Pending Review",
      description: "The student has submitted or is preparing internship information.",
      tone: "active",
    },
    {
      id: "review",
      title: "In Progress",
      description: "Move the record here once active admin review begins.",
      tone: "upcoming",
    },
    {
      id: "completed",
      title: "Completed",
      description: "This becomes available after the internship is tracked in progress.",
      tone: "upcoming",
    },
  ];
}

function getStepClasses(tone: TimelineStep["tone"]) {
  if (tone === "complete") {
    return "border-white/70 bg-white text-slate-900 shadow-lg shadow-admin/10";
  }

  if (tone === "active") {
    return "border-admin/20 bg-admin/8 text-slate-900 shadow-lg shadow-admin/10";
  }

  return "border-dashed border-admin/20 bg-white/55 text-slate-500";
}

function getNextStatusAction(status: InternshipStatus) {
  if (status === "pending") {
    return {
      label: "Move To In Progress",
      helper: "Advance this student from pending review to active internship tracking.",
    };
  }

  if (status === "in_progress") {
    return {
      label: "Mark As Completed",
      helper: "Finalize this internship record and lock student-side editing.",
    };
  }

  return null;
}

function StatusSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-lg shadow-admin/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Updating..." : label}
    </button>
  );
}

function SummaryCard({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: SummaryItem[];
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
          {icon}
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </dt>
            <dd className="mt-2 text-sm font-medium leading-6 text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AdminStudentDetailPage({
  currentUser,
  unreadNotificationCount,
  notifications,
  student,
}: AdminStudentDetailPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusState, formAction] = useActionState<UpdateStudentStatusActionState, FormData>(
    updateStudentStatusAction,
    initialUpdateStudentStatusActionState,
  );
  const router = useRouter();
  const nextAction = getNextStatusAction(student.status);
  const timelineSteps = getTimelineSteps(student.status);

  useEffect(() => {
    if (statusState.status === "success") {
      router.refresh();
    }
  }, [router, statusState.status]);

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/intern/admin/students" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src="/nurse_logo.svg"
                  alt="Internship Management System"
                  width={30}
                  height={30}
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-admin)">
                  Internship
                </p>
                <p className="text-sm font-medium text-slate-700">Management System</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link
                href="/intern/dashboard"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/intern/admin/students"
                className="rounded-full bg-admin/12 px-4 py-2 text-sm font-semibold text-(--color-admin)"
              >
                Student List
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AdminNotificationMenu unreadNotificationCount={unreadNotificationCount} notifications={notifications} />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{currentUser.name ?? "Admin"}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.name ?? "Admin"}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{currentUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700"
                aria-label="Close navigation menu"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              <Link
                href="/intern/dashboard"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/intern/admin/students"
                className="block rounded-2xl bg-admin/12 px-4 py-3 text-sm font-semibold text-(--color-admin)"
                onClick={() => setMobileMenuOpen(false)}
              >
                Student List
              </Link>
            </nav>

            <AdminMobileNotificationsCard unreadNotificationCount={unreadNotificationCount} notifications={notifications} />

            <div className="mt-auto pt-8">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Logout
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <Link
            href="/intern/admin/students"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeftIcon />
            Back to student list
          </Link>
        </div>

        <section className="overflow-hidden rounded-[36px] border border-admin/15 bg-linear-to-br from-[#f3eaf3] via-[#fcfafc] to-[#eee3ef] p-6 shadow-xl shadow-admin/10 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
                  Student Detail
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Review <span className="text-(--color-admin)">{student.firstName}</span>'s internship record
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Inspect the submitted profile, education history, internship details, and files before moving the status forward.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClasses(student.status)}`}>
                  {student.statusLabel}
                </span>
                {student.completionNote ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-white/70">
                    <SparklesIcon />
                    {student.completionNote}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="w-full max-w-sm shrink-0 rounded-[28px] border border-white/70 bg-white/75 p-4 shadow-lg shadow-admin/10 backdrop-blur sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status Control</p>
              <div className="mt-3 space-y-3">
                {nextAction ? (
                  <form action={formAction} className="space-y-3">
                    <input type="hidden" name="studentId" value={student.id} />
                    <StatusSubmitButton label={nextAction.label} />
                    <p className="text-sm leading-6 text-slate-600">{nextAction.helper}</p>
                  </form>
                ) : (
                  <div className="inline-flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <span className="mt-0.5 text-slate-500">
                      <LockIcon />
                    </span>
                    <span>This internship record is already completed.</span>
                  </div>
                )}

                {statusState.message ? (
                  <div className={statusState.status === "error"
                    ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  }>
                    {statusState.message}
                  </div>
                ) : null}

                <div className="grid gap-3 rounded-2xl bg-white/70 p-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last Updated</p>
                    <p className="mt-2 font-medium text-slate-900">{student.summary.lastUpdatedLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Submitted</p>
                    <p className="mt-2 font-medium text-slate-900">{student.summary.submittedAtLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className={`rounded-3xl border p-4 ${getStepClasses(step.tone)}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Step {index + 1}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-slate-700 ring-1 ring-black/5">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-current sm:text-base">{step.title}</p>
                <p className="mt-2 text-xs leading-5 text-current/80 sm:text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <SummaryCard
              title="Personal Information"
              description="Core identity and contact details currently stored for this student."
              icon={<SummaryIcon />}
              items={student.personal}
            />

            <SummaryCard
              title="Internship Information"
              description="Placement details and current internship review context for this record."
              icon={<CalendarIcon />}
              items={student.internship}
            />

            <SummaryCard
              title="Education Information"
              description="Academic details supporting this internship submission."
              icon={<AcademicIcon />}
              items={student.education}
            />
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Files</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Review student uploads directly from the admin workspace.
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
                  <FileIcon />
                </div>
              </div>

              {student.files.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {student.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
                        <FileIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{file.meta}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-admin/20 bg-[#faf6fa] px-5 py-8 text-center">
                  <div className="mx-auto flex justify-center text-(--color-admin)">
                    <EmptyFilesIcon />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">No files uploaded</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This student has not uploaded supporting documents yet.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-admin/15 bg-admin/8 p-6 shadow-xl shadow-admin/10 sm:p-7">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">Admin Review Note</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Status updates follow the defined workflow only: pending to in progress, then in progress to completed.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}