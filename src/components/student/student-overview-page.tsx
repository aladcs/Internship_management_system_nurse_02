"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/intern/overview/actions";

type SummaryItem = {
  label: string;
  value: string;
};

type FileItem = {
  id: string;
  name: string;
  meta: string;
};

export type StudentOverviewPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  student: {
    firstName: string;
    displayName: string;
    email: string;
    status: "pending" | "in_progress" | "completed";
    statusLabel: string;
    canEdit: boolean;
    hasStartedForm: boolean;
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
      <rect x="12" y="12" width="40" height="40" rx="14" className="fill-student/10 stroke-student/20" strokeWidth="2" />
      <path d="M24 28h16" className="stroke-student/45" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 36h10" className="stroke-student/35" strokeWidth="3" strokeLinecap="round" />
      <path d="M41 41h8" className="stroke-(--color-student)" strokeWidth="3" strokeLinecap="round" />
      <path d="M45 37v8" className="stroke-(--color-student)" strokeWidth="3" strokeLinecap="round" />
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

function getStatusClasses(status: StudentOverviewPageProps["student"]["status"]) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (status === "in_progress") {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

function getTimelineSteps(student: StudentOverviewPageProps["student"]): TimelineStep[] {
  if (student.status === "completed") {
    return [
      {
        id: "form",
        title: "Form Submitted",
        description: "Your internship information is complete.",
        tone: "complete",
      },
      {
        id: "review",
        title: "Admin Review",
        description: "Your submission has already been reviewed.",
        tone: "complete",
      },
      {
        id: "done",
        title: "Completed",
        description: "The record is now locked for reference.",
        tone: "complete",
      },
    ];
  }

  if (student.status === "in_progress") {
    return [
      {
        id: "form",
        title: "Form Submitted",
        description: "Your internship details are already on file.",
        tone: "complete",
      },
      {
        id: "review",
        title: "Admin Review",
        description: "Your record is currently being updated and tracked.",
        tone: "active",
      },
      {
        id: "done",
        title: "Completed",
        description: "This step becomes final once the internship is closed.",
        tone: "upcoming",
      },
    ];
  }

  return [
    {
      id: "form",
      title: student.hasStartedForm ? "Edit Details" : "Start Form",
      description: student.hasStartedForm
        ? "Continue updating your internship information."
        : "Begin filling in your internship details.",
      tone: "active",
    },
    {
      id: "review",
      title: "Pending Review",
      description: "Admin review begins after you submit the form.",
      tone: "upcoming",
    },
    {
      id: "done",
      title: "Completed",
      description: "Completed records become read-only.",
      tone: "upcoming",
    },
  ];
}

function getStepClasses(tone: TimelineStep["tone"]) {
  if (tone === "complete") {
    return "border-white/70 bg-white text-slate-900 shadow-lg shadow-orange-950/8";
  }

  if (tone === "active") {
    return "border-orange-200 bg-orange-50/90 text-slate-900 shadow-lg shadow-orange-950/8";
  }

  return "border-dashed border-orange-200/80 bg-white/55 text-slate-500";
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
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

export function StudentOverviewPage({ currentUser, student }: StudentOverviewPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ctaLabel = student.hasStartedForm ? "Edit Form" : "Submit Form";
  const timelineSteps = getTimelineSteps(student);

  return (
    <div className="min-h-screen bg-[#fff7f1] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/intern/overview" className="flex items-center gap-3">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-student)">
                  Internship
                </p>
                <p className="text-sm font-medium text-slate-700">Management System</p>
              </div>
            </Link>

            <nav className="hidden md:flex">
              <Link
                href="/intern/overview"
                className="rounded-full bg-student/12 px-4 py-2 text-sm font-semibold text-(--color-student)"
                aria-current="page"
              >
                Overview
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{student.displayName}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Student</p>
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
                <p className="text-sm font-semibold text-slate-900">{student.displayName}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{student.email}</p>
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
                href="/intern/overview"
                className="block rounded-2xl bg-student/12 px-4 py-3 text-sm font-semibold text-(--color-student)"
                aria-current="page"
                onClick={() => setMobileMenuOpen(false)}
              >
                Overview
              </Link>
            </nav>

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
        <section className="overflow-hidden rounded-[36px] border border-orange-100 bg-linear-to-br from-[#fff2e5] via-[#fff9f5] to-[#ffe9db] p-6 shadow-xl shadow-orange-950/8 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-student)">
                  Student Overview
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Welcome back, <span className="text-(--color-student)">{student.firstName}</span>
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Review your internship progress, confirm the information already on file, and continue with the form when updates are still allowed.
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

            <div className="w-full max-w-sm shrink-0 rounded-[28px] border border-white/70 bg-white/75 p-4 shadow-lg shadow-orange-950/8 backdrop-blur sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Primary Action</p>
              <div className="mt-3 space-y-3">
                {student.canEdit ? (
                  <Link
                    href="/intern/form"
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-(--color-student) px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-95"
                  >
                    {ctaLabel}
                  </Link>
                ) : (
                  <div className="inline-flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <span className="mt-0.5 text-slate-500">
                      <LockIcon />
                    </span>
                    <span>Your form is locked because your internship status is completed.</span>
                  </div>
                )}
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
              description="Your core profile details as they currently appear in the internship system."
              icon={<SummaryIcon />}
              items={student.personal}
            />

            <SummaryCard
              title="Internship Summary"
              description="A quick summary of your internship placement and current review status."
              icon={<CalendarIcon />}
              items={student.internship}
            />

            <SummaryCard
              title="Education Summary"
              description="Academic information that supports your internship record."
              icon={<AcademicIcon />}
              items={student.education}
            />
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">My Files</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Files uploaded for your own internship record only.
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
                  <FileIcon />
                </div>
              </div>

              {student.files.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {student.files.map((file) => (
                    <div key={file.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
                        <FileIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{file.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-orange-200 bg-[#fff8f2] px-5 py-8 text-center">
                  <div className="mx-auto flex justify-center text-(--color-student)">
                    <EmptyFilesIcon />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">No files uploaded</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Add supporting documents from the form when your internship record is editable.
                  </p>
                  {student.canEdit ? (
                    <Link
                      href="/intern/form"
                      className="mt-4 inline-flex text-sm font-semibold text-(--color-student) underline decoration-orange-200 underline-offset-4 transition hover:decoration-orange-500"
                    >
                      Upload now
                    </Link>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-orange-200 bg-[#fff1e7] p-6 shadow-xl shadow-orange-950/6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-student)">
                Help & Support
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                Keep your internship record accurate
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Review the summary cards before opening the form. While your status is pending or in progress, you can continue updating your own details. Once the status becomes completed, the record stays visible here but editing is locked.
              </p>
              <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-700 ring-1 ring-orange-100">
                Signed in as {currentUser.email}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}