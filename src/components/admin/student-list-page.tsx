"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { InternshipStatus } from "@prisma/client";
import {
  initialSaveStudentActionState,
  type StudentListItem,
} from "@/app/intern/admin/students/action-state";
import { logoutAction, saveStudentAction } from "@/app/intern/admin/students/actions";
import {
  AdminMobileNotificationsCard,
  AdminNotificationMenu,
} from "@/components/admin/admin-notification-menu";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

type StudentListPageProps = {
  students: StudentListItem[];
  currentUser: {
    email: string;
    name: string | null;
  };
  unreadNotificationCount: number;
  notifications: AdminNotificationItem[];
};

type StudentDialogProps = {
  onClose: () => void;
  onCreated: (student: StudentListItem) => void;
};

type DeleteDialogProps = {
  student: StudentListItem;
  onClose: () => void;
};

type StudentStatusFilter = "all" | InternshipStatus;

const STATUS_FILTERS: Array<{
  value: StudentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4.25 4.25" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <circle cx="10" cy="6.25" r="3.25" />
      <path d="M3.75 16c1.35-2.87 3.62-4.3 6.25-4.3S14.9 13.13 16.25 16" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <path d="M1.75 10s2.75-5 8.25-5 8.25 5 8.25 5-2.75 5-8.25 5-8.25-5-8.25-5Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function ViewStudentLink({ email, href }: { email: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      aria-label={`View ${email}`}
      title={`View ${email}`}
    >
      <EyeIcon />
    </Link>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <path d="m13.75 3.75 2.5 2.5" />
      <path d="M4.75 15.25 7.5 14.5l7.5-7.5a1.77 1.77 0 0 0-2.5-2.5L5 12l-.25 3.25Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <path d="M3.75 5.5h12.5" />
      <path d="M7.25 2.75h5.5" />
      <path d="M6.25 5.5v9.25c0 .41.34.75.75.75h6c.41 0 .75-.34.75-.75V5.5" />
      <path d="M8.5 8.25v4.5" />
      <path d="M11.5 8.25v4.5" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-14 w-14">
      <rect x="10" y="14" width="44" height="36" rx="10" className="fill-student/10 stroke-student/20" strokeWidth="2" />
      <path d="M20 26h24" className="stroke-student/50" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 36h14" className="stroke-student/35" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="41" r="8" className="fill-(--color-student)" />
      <path d="M42.5 41h7" className="stroke-white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M46 37.5v7" className="stroke-white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <rect x="7" y="7" width="9" height="9" rx="2" />
      <path d="M4 12V6a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m4.75 10.25 3.25 3.25 7.25-7.25" />
    </svg>
  );
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email;
  const segments = source.split(/\s+/).filter(Boolean);

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();
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

function ResultCount({ count }: { count: number }) {
  return (
    <p className="text-sm text-slate-500">
      {count} {count === 1 ? "student" : "students"}
    </p>
  );
}

function ActionButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Creating..." : children}
    </button>
  );
}

function ModalFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/15 sm:p-7">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function ActionIconButton({
  label,
  children,
  onClick,
  tone = "neutral",
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "neutral" | "destructive";
  disabled?: boolean;
}) {
  const className =
    tone === "destructive"
      ? "text-red-500 hover:bg-red-50 hover:text-red-600"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-300" : className}`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function CreateStudentDialog({ onClose, onCreated }: StudentDialogProps) {
  const [state, formAction] = useActionState(
    saveStudentAction,
    initialSaveStudentActionState,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1500);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopyPassword() {
    if (!state.generatedPassword) {
      return;
    }

    await navigator.clipboard.writeText(state.generatedPassword);
    setCopied(true);
  }

  function handleDone() {
    if (state.student) {
      onCreated(state.student);
    }

    onClose();
  }

  if (state.status === "created" && state.generatedPassword && state.student) {
    return (
      <ModalFrame
        title="Student account created"
        description="Store this generated password securely before closing. It is only shown once in this flow."
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">Generated password</p>
                <p className="mt-3 font-mono text-lg font-semibold tracking-[0.08em]">
                  {state.generatedPassword}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-100"
                aria-label="Copy generated password"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-medium text-slate-800">{state.student.name}</p>
            <p>{state.student.email}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDone}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95"
            >
              Done
            </button>
          </div>
        </div>
      </ModalFrame>
    );
  }

  return (
    <ModalFrame
      title="Create student"
      description="Add a student account. The system will generate a password after save."
    >
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="student-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="student-name"
            name="name"
            defaultValue={state.values.name}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
            placeholder="Enter student name"
          />
          {state.fieldErrors.name ? (
            <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="student-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="student-email"
            name="email"
            type="email"
            defaultValue={state.values.email}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
            placeholder="student@cmu.ac.th"
          />
          {state.fieldErrors.email ? (
            <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
          ) : null}
        </div>

        {state.status === "error" && state.message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          A related student profile will be created with an initial pending internship status.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <ActionButton>Create Student</ActionButton>
        </div>
      </form>
    </ModalFrame>
  );
}

function DeleteStudentDialog({ student, onClose }: DeleteDialogProps) {
  return (
    <ModalFrame
      title="Delete student"
      description="The destructive delete flow is reserved for the dedicated student management slice. This dialog is present now so the list UI matches the approved design."
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          <p className="font-medium">{student.name}</p>
          <p className="mt-1">{student.email}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Delete student is not implemented in this feature. The current page only exposes the action entry point in the UI.
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

export function StudentListPage({
  students,
  currentUser,
  unreadNotificationCount,
  notifications,
}: StudentListPageProps) {
  const [studentItems, setStudentItems] = useState(students);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StudentStatusFilter>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentListItem | null>(null);

  const statusCounts = studentItems.reduce(
    (counts, student) => {
      counts.all += 1;
      counts[student.status] += 1;

      return counts;
    },
    {
      all: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
    } as Record<StudentStatusFilter, number>,
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredStudents = studentItems.filter((student) => {
    if (activeFilter !== "all" && student.status !== activeFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [student.name, student.email, student.major ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const emptyState = studentItems.length === 0;
  const filteredEmptyState = !emptyState && filteredStudents.length === 0;

  function handleStudentCreated(student: StudentListItem) {
    setStudentItems((currentStudents) => {
      if (currentStudents.some((currentStudent) => currentStudent.id === student.id)) {
        return currentStudents;
      }

      return [student, ...currentStudents];
    });
  }

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/intern/dashboard" className="flex items-center gap-3">
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
                aria-current="page"
              >
                Student List
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AdminNotificationMenu unreadNotificationCount={unreadNotificationCount} notifications={notifications} />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {currentUser.name ?? "Admin"}
              </p>
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
                aria-current="page"
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
              Admin Workspace
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Student List
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Browse student records, filter by internship status, and open the student management actions from one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-lg shadow-admin/25 transition hover:brightness-95"
          >
            Create Student
          </button>
        </div>

        <section className="mt-8 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-md text-slate-500">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <SearchIcon />
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:bg-white focus:ring-4 focus:ring-admin/10"
                  placeholder="Search by name, email, or major"
                />
              </label>
              <ResultCount count={filteredStudents.length} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={isActive
                      ? "inline-flex items-center gap-2 rounded-full bg-(--color-admin) px-4 py-2 text-sm font-semibold text-white"
                      : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    }
                    aria-pressed={isActive}
                  >
                    <span>{filter.label}</span>
                    <span className={isActive ? "text-white/80" : "text-slate-400"}>
                      {statusCounts[filter.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {emptyState ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-student/8 text-(--color-student)">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                No students yet
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                Student records will appear here after admin-created accounts are added to the system.
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95"
              >
                Create Student
              </button>
            </div>
          ) : filteredEmptyState ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-100 text-slate-400">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                No matching students
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                Try another search term or switch the active status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-admin/7 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="transition hover:bg-slate-50/80">
                        <td className="border-t border-slate-100 px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-student) text-sm font-semibold text-white">
                              {getInitials(student.name, student.email)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{student.name}</p>
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                                <UserIcon />
                                {student.major ?? "Student record"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
                          {student.email}
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(student.status)}`}>
                            {formatStatusLabel(student.status)}
                          </span>
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <ViewStudentLink
                              email={student.email}
                              href={`/intern/admin/students/${student.id}`}
                            />
                            <ActionIconButton
                              label={`Edit ${student.email} (coming soon)`}
                              disabled
                            >
                              <EditIcon />
                            </ActionIconButton>
                            <ActionIconButton
                              label={`Delete ${student.email}`}
                              tone="destructive"
                              onClick={() => setDeletingStudent(student)}
                            >
                              <TrashIcon />
                            </ActionIconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredStudents.map((student) => (
                  <article key={student.id} className="space-y-4 px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-student) text-sm font-semibold text-white">
                          {getInitials(student.name, student.email)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{student.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{student.major ?? "Student record"}</p>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(student.status)}`}>
                        {formatStatusLabel(student.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{student.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <ViewStudentLink
                        email={student.email}
                        href={`/intern/admin/students/${student.id}`}
                      />
                      <ActionIconButton label={`Edit ${student.email} (coming soon)`} disabled>
                        <EditIcon />
                      </ActionIconButton>
                      <ActionIconButton
                        label={`Delete ${student.email}`}
                        tone="destructive"
                        onClick={() => setDeletingStudent(student)}
                      >
                        <TrashIcon />
                      </ActionIconButton>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {createOpen ? (
        <CreateStudentDialog
          onClose={() => setCreateOpen(false)}
          onCreated={handleStudentCreated}
        />
      ) : null}
      {deletingStudent ? (
        <DeleteStudentDialog student={deletingStudent} onClose={() => setDeletingStudent(null)} />
      ) : null}
    </div>
  );
}