"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { type StudentFormActionState } from "@/app/intern/form/action-state";
import { logoutAction, saveStudentFormAction } from "@/app/intern/form/actions";

type ExistingFileItem = {
  id: string;
  name: string;
  meta: string;
};

export type StudentFormPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  student: {
    displayName: string;
    email: string;
    status: "pending" | "in_progress" | "completed";
    isReadOnly: boolean;
    hasSubmitted: boolean;
  };
  existingFiles: ExistingFileItem[];
  initialState: StudentFormActionState;
};

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const EDUCATION_LEVEL_OPTIONS = [
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "doctorate", label: "Doctorate" },
  { value: "other", label: "Other" },
] as const;

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="M11.5 4.5 6 10l5.5 5.5" />
      <path d="M6.75 10h8.25" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6">
      <rect x="4.25" y="8.5" width="11.5" height="8" rx="2.25" />
      <path d="M6.75 8.5V6.75a3.25 3.25 0 1 1 6.5 0V8.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-5 w-5">
      <circle cx="10" cy="6" r="2.75" />
      <path d="M4.5 16c1.2-2.73 3.08-4.1 5.5-4.1 2.42 0 4.3 1.37 5.5 4.1" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-5 w-5">
      <path d="m2.5 7.25 7.5-3.5 7.5 3.5-7.5 3.5-7.5-3.5Z" />
      <path d="M5.5 8.75v3.15c0 1.3 2.02 2.35 4.5 2.35s4.5-1.05 4.5-2.35V8.75" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-5 w-5">
      <rect x="3.25" y="5.5" width="13.5" height="10.5" rx="2.25" />
      <path d="M7.25 5.5V4.75A1.75 1.75 0 0 1 9 3h2a1.75 1.75 0 0 1 1.75 1.75v.75" />
      <path d="M3.25 10.25h13.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-5 w-5">
      <path d="M6.5 2.75h5.25L15.5 6.5v8.75A2.25 2.25 0 0 1 13.25 17.5h-6.5A2.25 2.25 0 0 1 4.5 15.25v-10A2.5 2.5 0 0 1 7 2.75Z" />
      <path d="M11.5 2.75V6.5h3.75" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-6 w-6">
      <path d="M10 13.75v-8.5" />
      <path d="m6.75 8.5 3.25-3.25L13.25 8.5" />
      <path d="M4.25 14.75A2.25 2.25 0 0 0 6.5 17h7a2.25 2.25 0 0 0 2.25-2.25" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="m5.5 5.5 9 9" />
      <path d="m14.5 5.5-9 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="m4.75 10.25 3.25 3.25 7.25-7.25" />
    </svg>
  );
}

function statusLabel(status: StudentFormPageProps["student"]["status"]) {
  if (status === "in_progress") {
    return "In Progress";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClasses(status: StudentFormPageProps["student"]["status"]) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (status === "in_progress") {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-red-600">{message}</p>;
}

function FieldShell({
  label,
  htmlFor,
  required = false,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function TextInput({
  id,
  name,
  type = "text",
  value,
  placeholder,
  error,
}: {
  id: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-orange-300 focus:ring-orange-100"}`}
    />
  );
}

function SelectInput({
  id,
  name,
  value,
  options,
  placeholder,
  error,
}: {
  id: string;
  name: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
  error?: string;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={value}
      className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-orange-300 focus:ring-orange-100"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  id,
  name,
  value,
  placeholder,
  error,
  rows = 4,
}: {
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      name={name}
      defaultValue={value}
      rows={rows}
      placeholder={placeholder}
      className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-orange-300 focus:ring-orange-100"}`}
    />
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="flex items-start gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function PrimaryActionButton({ submitted }: { submitted: boolean }) {
  const label = submitted ? "Save Changes" : "Submit Form";
  const { pending } = require("react-dom").useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex h-12 items-center justify-center rounded-2xl bg-(--color-student) px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function CancelLink() {
  const { pending } = require("react-dom").useFormStatus();

  return (
    <Link
      href="/intern/overview"
      aria-disabled={pending}
      className={`inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${pending ? "pointer-events-none opacity-60" : ""}`}
    >
      Cancel
    </Link>
  );
}

export function StudentFormPage({ currentUser, student, existingFiles, initialState }: StudentFormPageProps) {
  const [state, formAction] = useActionState(saveStudentFormAction, initialState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const visibleExistingFiles = useMemo(
    () => existingFiles.filter((file) => !removedFileIds.includes(file.id)),
    [existingFiles, removedFileIds],
  );

  function syncInputFiles(files: File[]) {
    const dataTransfer = new DataTransfer();

    files.forEach((file) => dataTransfer.items.add(file));

    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  }

  function mergeFiles(incomingFiles: File[]) {
    const mergedFiles = [...selectedFiles];

    incomingFiles.forEach((file) => {
      if (!mergedFiles.some((currentFile) => currentFile.name === file.name && currentFile.size === file.size)) {
        mergedFiles.push(file);
      }
    });

    setSelectedFiles(mergedFiles);
    syncInputFiles(mergedFiles);
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    mergeFiles(files);
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragActive(false);
    mergeFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeSelectedFile(index: number) {
    const nextFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);

    setSelectedFiles(nextFiles);
    syncInputFiles(nextFiles);
  }

  function markExistingFileRemoved(fileId: string) {
    setRemovedFileIds((currentFileIds) => (currentFileIds.includes(fileId) ? currentFileIds : [...currentFileIds, fileId]));
  }

  if (student.isReadOnly) {
    return (
      <div className="min-h-screen bg-[#fff7f1] text-slate-950">
        <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/intern/overview" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image src="/nurse_logo.svg" alt="Internship Management System" width={30} height={30} priority />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-student)">Internship</p>
                <p className="text-sm font-medium text-slate-700">Management System</p>
              </div>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="w-full rounded-[32px] border border-orange-200 bg-[#fff1e7] p-8 text-center shadow-xl shadow-orange-950/8 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-(--color-student) shadow-sm">
              <LockIcon />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">This form is read-only</h1>
            <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
              Your internship status is {statusLabel(student.status).toLowerCase()}, so editing is locked. You can still review your submitted information from the overview page.
            </p>
            <Link
              href="/intern/overview"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-(--color-student) px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-95"
            >
              Back to Overview
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f1] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/intern/overview" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image src="/nurse_logo.svg" alt="Internship Management System" width={30} height={30} priority />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-student)">Internship</p>
                <p className="text-sm font-medium text-slate-700">Management System</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link href="/intern/overview" className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-student/8 hover:text-(--color-student)">
                Overview
              </Link>
              <Link href="/intern/form" className="rounded-full bg-student/12 px-4 py-2 text-sm font-semibold text-(--color-student)" aria-current="page">
                Form
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
          <aside className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
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
              <Link href="/intern/overview" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>
                Overview
              </Link>
              <Link href="/intern/form" className="block rounded-2xl bg-student/12 px-4 py-3 text-sm font-semibold text-(--color-student)" aria-current="page" onClick={() => setMobileMenuOpen(false)}>
                Form
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/intern/overview" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-(--color-student)">
            <BackIcon />
            Back to overview
          </Link>
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClasses(student.status)}`}>
            {statusLabel(student.status)}
          </span>
        </div>

        <div className="mt-5 max-w-3xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Internship Form</h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Fill in your internship record, keep supporting files together, and submit updates for admin review.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6 pb-24">
          {state.message ? (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${state.status === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-orange-200 bg-[#fff4eb] text-orange-700"}`}>
              {state.message}
            </div>
          ) : null}

          <SectionCard
            icon={<UserIcon />}
            title="Personal Information"
            description="Provide the key personal details used for your internship record and contact information."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="Prefix / Title" htmlFor="prefix">
                <TextInput id="prefix" name="prefix" value={state.values.prefix} placeholder="Mr., Ms., etc." />
              </FieldShell>
              <FieldShell label="Gender" htmlFor="gender" required error={state.fieldErrors.gender}>
                <SelectInput id="gender" name="gender" value={state.values.gender} options={GENDER_OPTIONS} placeholder="Select gender" error={state.fieldErrors.gender} />
              </FieldShell>
              <FieldShell label="First Name" htmlFor="firstName" required error={state.fieldErrors.firstName}>
                <TextInput id="firstName" name="firstName" value={state.values.firstName} placeholder="First name" error={state.fieldErrors.firstName} />
              </FieldShell>
              <FieldShell label="Last Name" htmlFor="lastName" required error={state.fieldErrors.lastName}>
                <TextInput id="lastName" name="lastName" value={state.values.lastName} placeholder="Last name" error={state.fieldErrors.lastName} />
              </FieldShell>
              <FieldShell label="Date of Birth" htmlFor="dateOfBirth" required error={state.fieldErrors.dateOfBirth}>
                <TextInput id="dateOfBirth" name="dateOfBirth" type="date" value={state.values.dateOfBirth} error={state.fieldErrors.dateOfBirth} />
              </FieldShell>
              <FieldShell label="Phone Number" htmlFor="phoneNumber" required error={state.fieldErrors.phoneNumber}>
                <TextInput id="phoneNumber" name="phoneNumber" value={state.values.phoneNumber} placeholder="Phone number" error={state.fieldErrors.phoneNumber} />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="Address" htmlFor="address" required error={state.fieldErrors.address}>
                  <TextArea id="address" name="address" value={state.values.address} placeholder="Current address" error={state.fieldErrors.address} />
                </FieldShell>
              </div>
              <FieldShell label="Parent Phone" htmlFor="parentPhone" required error={state.fieldErrors.parentPhone}>
                <TextInput id="parentPhone" name="parentPhone" value={state.values.parentPhone} placeholder="Parent phone number" error={state.fieldErrors.parentPhone} />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon={<AcademicIcon />}
            title="Education Information"
            description="Keep your academic details accurate so admins can review the correct placement context."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="Education Level" htmlFor="educationLevel" required error={state.fieldErrors.educationLevel}>
                <SelectInput id="educationLevel" name="educationLevel" value={state.values.educationLevel} options={EDUCATION_LEVEL_OPTIONS} placeholder="Select education level" error={state.fieldErrors.educationLevel} />
              </FieldShell>
              <FieldShell label="Institution" htmlFor="institution" required error={state.fieldErrors.institution}>
                <TextInput id="institution" name="institution" value={state.values.institution} placeholder="Institution" error={state.fieldErrors.institution} />
              </FieldShell>
              <FieldShell label="Faculty" htmlFor="faculty" required error={state.fieldErrors.faculty}>
                <TextInput id="faculty" name="faculty" value={state.values.faculty} placeholder="Faculty" error={state.fieldErrors.faculty} />
              </FieldShell>
              <FieldShell label="Major / Branch" htmlFor="major" required error={state.fieldErrors.major}>
                <TextInput id="major" name="major" value={state.values.major} placeholder="Major" error={state.fieldErrors.major} />
              </FieldShell>
              <FieldShell label="Co-op Advisor Name" htmlFor="coOpAdvisorName" required error={state.fieldErrors.coOpAdvisorName}>
                <TextInput id="coOpAdvisorName" name="coOpAdvisorName" value={state.values.coOpAdvisorName} placeholder="Advisor name" error={state.fieldErrors.coOpAdvisorName} />
              </FieldShell>
              <FieldShell label="Co-op Advisor Phone" htmlFor="coOpAdvisorPhone" required error={state.fieldErrors.coOpAdvisorPhone}>
                <TextInput id="coOpAdvisorPhone" name="coOpAdvisorPhone" value={state.values.coOpAdvisorPhone} placeholder="Advisor phone" error={state.fieldErrors.coOpAdvisorPhone} />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon={<BriefcaseIcon />}
            title="Internship Details"
            description="Capture the main placement details that define your internship and review timeline."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="Position" htmlFor="position" required error={state.fieldErrors.position}>
                <TextInput id="position" name="position" value={state.values.position} placeholder="Internship position" error={state.fieldErrors.position} />
              </FieldShell>
              <FieldShell label="Department / Unit" htmlFor="departmentUnit" required error={state.fieldErrors.departmentUnit}>
                <TextInput id="departmentUnit" name="departmentUnit" value={state.values.departmentUnit} placeholder="Department or unit" error={state.fieldErrors.departmentUnit} />
              </FieldShell>
              <FieldShell label="Supervisor Name" htmlFor="supervisorName" required error={state.fieldErrors.supervisorName}>
                <TextInput id="supervisorName" name="supervisorName" value={state.values.supervisorName} placeholder="Supervisor name" error={state.fieldErrors.supervisorName} />
              </FieldShell>
              <FieldShell label="Internship Start Date" htmlFor="startDate" required error={state.fieldErrors.startDate}>
                <TextInput id="startDate" name="startDate" type="date" value={state.values.startDate} error={state.fieldErrors.startDate} />
              </FieldShell>
              <FieldShell label="Internship End Date" htmlFor="endDate" required error={state.fieldErrors.endDate}>
                <TextInput id="endDate" name="endDate" type="date" value={state.values.endDate} error={state.fieldErrors.endDate} />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="Additional Details" htmlFor="additionalDetails" error={state.fieldErrors.additionalDetails}>
                  <TextArea id="additionalDetails" name="additionalDetails" value={state.values.additionalDetails} placeholder="Optional notes or internship details" error={state.fieldErrors.additionalDetails} rows={5} />
                </FieldShell>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<FileIcon />}
            title="File Attachments"
            description="Upload PDF or image files that support your internship record. You can keep up to 5 files, each no larger than 5 MB."
          >
            <div>
              <input
                ref={inputRef}
                id="attachments"
                name="attachments"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${dragActive ? "border-orange-300 bg-orange-50" : "border-orange-200 bg-[#fff9f4] hover:border-orange-300 hover:bg-orange-50/70"}`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-student/10 text-(--color-student)">
                  <UploadIcon />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-950">Upload internship files</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Drag files here or click to browse. Accepted formats: PDF, JPG, PNG. Maximum 5 files total.
                </p>
              </button>

              <FieldError message={state.fieldErrors.files} />

              {visibleExistingFiles.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {visibleExistingFiles.map((file) => (
                    <div key={file.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
                          <FileIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{file.meta}</p>
                          <p className="mt-2 hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:inline-flex">
                            <CheckIcon />
                            Uploaded
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => markExistingFileRemoved(file.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Remove ${file.name}`}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedFiles.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
                          <FileIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{`${(file.size / 1024).toFixed(1)} KB`}</p>
                          <p className="mt-2 hidden text-xs font-medium text-orange-600 sm:block">Ready to upload</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Remove ${file.name}`}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {removedFileIds.map((fileId) => (
                <input key={fileId} type="hidden" name="removeFileIds" value={fileId} />
              ))}
            </div>
          </SectionCard>

          <div className="sticky bottom-0 z-20 -mx-4 border-t border-orange-100 bg-[#fff7f1]/95 px-4 pb-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <CancelLink />
              <PrimaryActionButton submitted={student.hasSubmitted} />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}