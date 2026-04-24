"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { type StudentFormActionState } from "@/app/intern/form/action-state";
import {
  logoutAction as defaultLogoutAction,
  saveStudentFormAction as defaultSaveStudentFormAction,
} from "@/app/intern/form/actions";
import { AccountMenu } from "@/components/auth/account-menu";
import { formatInternshipStatusLabel } from "@/lib/internship-status";

const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

type ExistingFileItem = {
  id: string;
  name: string;
  href: string;
  meta: string;
};

type ProfileImageItem = {
  src: string;
  name: string;
  downloadHref: string;
};

type StudentFormServerAction = (
  state: StudentFormActionState,
  formData: FormData,
) => Promise<StudentFormActionState>;

type LogoutServerAction = () => Promise<void>;

type FormTheme = {
  pageBackground: string;
  headerBorder: string;
  brandText: string;
  navHover: string;
  navActive: string;
  accentTile: string;
  primaryButton: string;
  backHoverText: string;
  successMessage: string;
  uploadIdle: string;
  uploadActive: string;
  stickyBar: string;
  readyText: string;
  inputFocus: string;
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
  profileImage: ProfileImageItem | null;
  initialState: StudentFormActionState;
  mode?: "student" | "admin";
  backHref?: string;
  backLabel?: string;
  cancelHref?: string;
  saveAction?: StudentFormServerAction;
  logoutAction?: LogoutServerAction;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
};

const PREFIX_OPTIONS = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
] as const;

const GENDER_OPTIONS = [
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
  { value: "other", label: "อื่นๆ" },
  { value: "prefer_not_to_say", label: "ไม่ระบุ" },
] as const;

const EDUCATION_LEVEL_OPTIONS = [
  { value: "diploma", label: "ประกาศนียบัตร" },
  { value: "bachelor", label: "ปริญญาตรี" },
  { value: "master", label: "ปริญญาโท" },
  { value: "doctorate", label: "ปริญญาเอก" },
  { value: "other", label: "อื่นๆ" },
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

function CameraIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-5 w-5">
      <path d="M6.5 5.25 7.4 3.75h5.2l.9 1.5h1.75A1.75 1.75 0 0 1 17 7v7.25A1.75 1.75 0 0 1 15.25 16h-10.5A1.75 1.75 0 0 1 3 14.25V7a1.75 1.75 0 0 1 1.75-1.75H6.5Z" />
      <circle cx="10" cy="10.5" r="2.75" />
    </svg>
  );
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

function getFormTheme(isAdminMode: boolean): FormTheme {
  if (isAdminMode) {
    return {
      pageBackground: "bg-[#fbf7f4]",
      headerBorder: "border-slate-200/80",
      brandText: "text-(--color-admin)",
      navHover: "hover:bg-admin/8 hover:text-(--color-admin)",
      navActive: "bg-admin/12 text-(--color-admin)",
      accentTile: "bg-admin/10 text-(--color-admin)",
      primaryButton: "bg-(--color-admin) shadow-lg shadow-admin/25",
      backHoverText: "hover:text-(--color-admin)",
      successMessage: "border-admin/20 bg-admin/8 text-(--color-admin)",
      uploadIdle: "border-admin/20 bg-[#faf6fa] hover:border-admin/30 hover:bg-admin/6",
      uploadActive: "border-admin/30 bg-admin/8",
      stickyBar: "border-slate-200 bg-[#fbf7f4]/95",
      readyText: "text-(--color-admin)",
      inputFocus: "border-slate-200 focus:border-admin/40 focus:ring-admin/10",
    };
  }

  return {
    pageBackground: "bg-[#fff7f1]",
    headerBorder: "border-orange-100/80",
    brandText: "text-(--color-student)",
    navHover: "hover:bg-student/8 hover:text-(--color-student)",
    navActive: "bg-student/12 text-(--color-student)",
    accentTile: "bg-student/10 text-(--color-student)",
    primaryButton: "bg-(--color-student) shadow-lg shadow-orange-600/25",
    backHoverText: "hover:text-(--color-student)",
    successMessage: "border-orange-200 bg-[#fff4eb] text-orange-700",
    uploadIdle: "border-orange-200 bg-[#fff9f4] hover:border-orange-300 hover:bg-orange-50/70",
    uploadActive: "border-orange-300 bg-orange-50",
    stickyBar: "border-orange-100 bg-[#fff7f1]/95",
    readyText: "text-orange-600",
    inputFocus: "border-slate-200 focus:border-orange-300 focus:ring-orange-100",
  };
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
  inputFocusClass,
}: {
  id: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  error?: string;
  inputFocusClass: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : inputFocusClass}`}
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
  inputFocusClass,
}: {
  id: string;
  name: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
  error?: string;
  inputFocusClass: string;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={value}
      className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : inputFocusClass}`}
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
  inputFocusClass,
}: {
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  inputFocusClass: string;
}) {
  return (
    <textarea
      id={id}
      name={name}
      defaultValue={value}
      rows={rows}
      placeholder={placeholder}
      className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : inputFocusClass}`}
    />
  );
}

function SectionCard({
  icon,
  title,
  description,
  accentTileClass,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentTileClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="flex items-start gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentTileClass}`}>
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

function PrimaryActionButton({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={pending}
    >
      {pending ? "กำลังบันทึก..." : label}
    </button>
  );
}

function CancelLink({ href }: { href: string }) {
  const { pending } = useFormStatus();

  return (
    <Link
      href={href}
      aria-disabled={pending}
      className={`inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${pending ? "pointer-events-none opacity-60" : ""}`}
    >
      ยกเลิก
    </Link>
  );
}

export function StudentFormPage({
  currentUser,
  student,
  existingFiles,
  profileImage,
  initialState,
  mode = "student",
  backHref,
  backLabel,
  cancelHref,
  saveAction = defaultSaveStudentFormAction,
  logoutAction = defaultLogoutAction,
  hiddenFields = [],
}: StudentFormPageProps) {
  const [state, formAction] = useActionState(saveAction, initialState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const isAdminMode = mode === "admin";
  const resolvedBackHref = backHref ?? (isAdminMode ? "/intern/admin/students" : "/intern/overview");
  const resolvedBackLabel = backLabel ?? (isAdminMode ? "กลับไปหน้ารายชื่อนักศึกษา" : "กลับไปหน้าภาพรวม");
  const resolvedCancelHref = cancelHref ?? (isAdminMode ? resolvedBackHref : "/intern/overview");
  const pageTitle = isAdminMode ? "แก้ไขข้อมูลนักศึกษา" : "แบบฟอร์มฝึกงาน";
  const pageDescription = isAdminMode
    ? "อัปเดตข้อมูลส่วนตัว การศึกษา รายละเอียดการฝึกงาน และไฟล์แนบของนักศึกษาได้จากหน้าฟอร์มเดียวกัน"
    : "กรอกข้อมูลการฝึกงาน แนบไฟล์ประกอบ และส่งการอัปเดตให้ผู้ดูแลตรวจสอบ";
  const primaryButtonLabel = isAdminMode || student.hasSubmitted ? "บันทึกการเปลี่ยนแปลง" : "ส่งแบบฟอร์ม";
  const theme = getFormTheme(isAdminMode);
  const selectedProfileImagePreview = useMemo(
    () => (selectedProfileImage ? URL.createObjectURL(selectedProfileImage) : null),
    [selectedProfileImage],
  );
  const visibleProfileImage = selectedProfileImagePreview
    ? {
        src: selectedProfileImagePreview,
        name: selectedProfileImage?.name ?? "รูปโปรไฟล์ใหม่",
      }
    : removeProfileImage
      ? null
      : profileImage;
  const visibleExistingFiles = useMemo(
    () => existingFiles.filter((file) => !removedFileIds.includes(file.id)),
    [existingFiles, removedFileIds],
  );

  function handleProfileImageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setLocalFileError("รูปโปรไฟล์ต้องเป็นไฟล์ JPG หรือ PNG เท่านั้น");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalFileError("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    setLocalFileError(null);
    setRemoveProfileImage(false);
    setSelectedProfileImage(file);
  }

  function handleRemoveProfileImage() {
    setLocalFileError(null);
    setSelectedProfileImage(null);
    setRemoveProfileImage(Boolean(profileImage));

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }
  }

  function handlePreviewProfileImage() {
    if (!visibleProfileImage) {
      return;
    }

    window.open(visibleProfileImage.src, "_blank", "noopener,noreferrer");
  }

  function syncInputFiles(files: File[]) {
    const dataTransfer = new DataTransfer();

    files.forEach((file) => dataTransfer.items.add(file));

    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  }

  function validateIncomingFiles(incomingFiles: File[], queuedFiles: File[]) {
    if (visibleExistingFiles.length + queuedFiles.length + incomingFiles.length > MAX_FILE_COUNT) {
      return `คุณสามารถเก็บไฟล์ได้รวมสูงสุด ${MAX_FILE_COUNT} ไฟล์`;
    }

    for (const file of incomingFiles) {
      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        return "อนุญาตเฉพาะไฟล์ PDF, JPG และ PNG เท่านั้น";
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return "แต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB";
      }
    }

    return null;
  }

  function mergeFiles(incomingFiles: File[]) {
    const mergedFiles = [...selectedFiles];

    incomingFiles.forEach((file) => {
      if (!mergedFiles.some((currentFile) => currentFile.name === file.name && currentFile.size === file.size)) {
        mergedFiles.push(file);
      }
    });

    const validationError = validateIncomingFiles(
      mergedFiles.filter((file) => !selectedFiles.some((currentFile) => currentFile.name === file.name && currentFile.size === file.size)),
      selectedFiles,
    );

    if (validationError) {
      setLocalFileError(validationError);
      syncInputFiles(selectedFiles);
      return;
    }

    setLocalFileError(null);
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

    setLocalFileError(null);
    setSelectedFiles(nextFiles);
    syncInputFiles(nextFiles);
  }

  function markExistingFileRemoved(fileId: string) {
    setLocalFileError(null);
    setRemovedFileIds((currentFileIds) => (currentFileIds.includes(fileId) ? currentFileIds : [...currentFileIds, fileId]));
  }

  if (!isAdminMode && student.isReadOnly) {
    return (
      <div className="min-h-screen bg-[#fff7f1] text-slate-950">
        <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/intern/overview" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image src="/nurse_logo.svg" alt="ระบบจัดการฝึกงาน" width={30} height={30} priority />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-student)">ระบบ</p>
                <p className="text-sm font-medium text-slate-700">จัดการฝึกงาน</p>
              </div>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="w-full rounded-4xl border border-orange-200 bg-[#fff1e7] p-8 text-center shadow-xl shadow-orange-950/8 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-(--color-student) shadow-sm">
              <LockIcon />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">แบบฟอร์มนี้เป็นแบบอ่านอย่างเดียว</h1>
            <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
              สถานะการฝึกงานของคุณคือ {formatInternshipStatusLabel(student.status)} จึงไม่สามารถแก้ไขได้ แต่ยังสามารถตรวจสอบข้อมูลที่ส่งไว้จากหน้าภาพรวมได้
            </p>
            <Link
              href="/intern/overview"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-(--color-student) px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-95"
            >
              กลับไปหน้าภาพรวม
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-slate-950 ${theme.pageBackground}`}>
      <header className={`sticky top-0 z-30 border-b bg-white/90 backdrop-blur-xl ${theme.headerBorder}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={isAdminMode ? "/intern/admin/students" : "/intern/overview"} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image src="/nurse_logo.svg" alt="ระบบจัดการฝึกงาน" width={30} height={30} priority />
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.brandText}`}>ระบบ</p>
                <p className="text-sm font-medium text-slate-700">จัดการฝึกงาน</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {isAdminMode ? (
                <>
                  <Link href="/intern/dashboard" className={`rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition ${theme.navHover}`}>
                    แดชบอร์ด
                  </Link>
                  <Link href="/intern/admin/students" className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.navActive}`} aria-current="page">
                    แก้ไขข้อมูลนักศึกษา
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/intern/overview" className={`rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition ${theme.navHover}`}>
                    ภาพรวม
                  </Link>
                  <Link href="/intern/form" className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.navActive}`} aria-current="page">
                    แบบฟอร์ม
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AccountMenu
              email={isAdminMode ? currentUser.email : student.email}
              logoutAction={logoutAction}
              name={isAdminMode ? currentUser.name : student.displayName}
              roleLabel={isAdminMode ? "ผู้ดูแล" : "นักศึกษา"}
              tone={isAdminMode ? "admin" : "student"}
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
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{isAdminMode ? (currentUser.name?.trim() || currentUser.email) : student.displayName}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{isAdminMode ? currentUser.email : student.email}</p>
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
              {isAdminMode ? (
                <>
                  <Link href="/intern/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>
                    แดชบอร์ด
                  </Link>
                  <Link href="/intern/admin/students" className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${theme.navActive}`} aria-current="page" onClick={() => setMobileMenuOpen(false)}>
                    แก้ไขข้อมูลนักศึกษา
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/intern/overview" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>
                    ภาพรวม
                  </Link>
                  <Link href="/intern/form" className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${theme.navActive}`} aria-current="page" onClick={() => setMobileMenuOpen(false)}>
                    แบบฟอร์ม
                  </Link>
                </>
              )}
              {isAdminMode ? (
                <Link
                  href="/intern/account/name"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-admin/6 hover:text-(--color-admin)"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {currentUser.name?.trim() ? "แก้ไขชื่อที่แสดง" : "ตั้งชื่อที่แสดง"}
                </Link>
              ) : null}
              <Link
                href="/intern/account/password"
                className={`block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition ${isAdminMode ? "hover:bg-admin/6 hover:text-(--color-admin)" : "hover:bg-orange-50 hover:text-orange-700"}`}
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={resolvedBackHref} className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition ${theme.backHoverText}`}>
            <BackIcon />
            {resolvedBackLabel}
          </Link>
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClasses(student.status)}`}>
            {formatInternshipStatusLabel(student.status)}
          </span>
        </div>

        <div className="mt-5 max-w-3xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{pageTitle}</h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            {pageDescription}
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6 pb-24">
          <SectionCard
            icon={<CameraIcon />}
            title="รูปโปรไฟล์นักศึกษา"
            description="นักศึกษาหรือผู้ดูแลสามารถอัปโหลด เปลี่ยน ดูตัวอย่าง หรือเอารูปโปรไฟล์ออกได้จากส่วนนี้"
            accentTileClass={theme.accentTile}
          >
            <input
              ref={profileImageInputRef}
              id="profileImage"
              name="profileImage"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={handleProfileImageInputChange}
            />

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className={`relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-white ${theme.accentTile}`}>
                  {visibleProfileImage ? (
                    <Image
                      src={visibleProfileImage.src}
                      alt={visibleProfileImage.name}
                      fill
                      className="object-cover"
                      unoptimized={
                        visibleProfileImage.src.startsWith("blob:") ||
                        visibleProfileImage.src.startsWith("/uploads/") ||
                        visibleProfileImage.src.startsWith("/intern/api/")
                      }
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-white/95">
                      {student.displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-base font-semibold text-slate-950">{student.displayName}</p>
                  <p className="text-sm text-slate-600">
                    {visibleProfileImage ? visibleProfileImage.name : "ยังไม่มีรูปโปรไฟล์"}
                  </p>
                  <p className="text-xs leading-5 text-slate-500">รองรับ JPG และ PNG ขนาดไม่เกิน 5 MB</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition hover:brightness-95 ${theme.primaryButton}`}
                >
                  {visibleProfileImage ? "เปลี่ยนรูป" : "เพิ่มรูป"}
                </button>
                <button
                  type="button"
                  onClick={handlePreviewProfileImage}
                  disabled={!visibleProfileImage}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ดูตัวอย่าง
                </button>
                <a
                  href={selectedProfileImagePreview ? selectedProfileImagePreview : profileImage?.downloadHref ?? "#"}
                  download={visibleProfileImage?.name}
                  aria-disabled={!visibleProfileImage}
                  className={`inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${visibleProfileImage ? "" : "pointer-events-none opacity-60"}`}
                >
                  ดาวน์โหลดรูป
                </a>
                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  disabled={!visibleProfileImage}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ลบรูป
                </button>
              </div>
            </div>

            {removeProfileImage ? <input type="hidden" name="removeProfileImage" value="true" /> : null}
          </SectionCard>

          {hiddenFields.map((field) => (
            <input key={`${field.name}-${field.value}`} type="hidden" name={field.name} value={field.value} />
          ))}
          {state.message ? (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${state.status === "error" ? "border-red-200 bg-red-50 text-red-700" : theme.successMessage}`}>
              {state.message}
            </div>
          ) : null}

          <SectionCard
            icon={<UserIcon />}
            title="ข้อมูลส่วนตัว"
            description="กรอกรายละเอียดส่วนตัวหลักที่ใช้ในข้อมูลการฝึกงานและการติดต่อ"
            accentTileClass={theme.accentTile}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="คำนำหน้า" htmlFor="prefix" required error={state.fieldErrors.prefix}>
                <SelectInput id="prefix" name="prefix" value={state.values.prefix} options={PREFIX_OPTIONS} placeholder="เลือกคำนำหน้า" error={state.fieldErrors.prefix} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="เพศ" htmlFor="gender" required error={state.fieldErrors.gender}>
                <SelectInput id="gender" name="gender" value={state.values.gender} options={GENDER_OPTIONS} placeholder="เลือกเพศ" error={state.fieldErrors.gender} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="ชื่อ" htmlFor="firstName" required error={state.fieldErrors.firstName}>
                <TextInput id="firstName" name="firstName" value={state.values.firstName} placeholder="ชื่อ" error={state.fieldErrors.firstName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="นามสกุล" htmlFor="lastName" required error={state.fieldErrors.lastName}>
                <TextInput id="lastName" name="lastName" value={state.values.lastName} placeholder="นามสกุล" error={state.fieldErrors.lastName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="วันเกิด" htmlFor="dateOfBirth" required error={state.fieldErrors.dateOfBirth}>
                <TextInput id="dateOfBirth" name="dateOfBirth" type="date" value={state.values.dateOfBirth} error={state.fieldErrors.dateOfBirth} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="หมายเลขโทรศัพท์" htmlFor="phoneNumber" required error={state.fieldErrors.phoneNumber}>
                <TextInput id="phoneNumber" name="phoneNumber" value={state.values.phoneNumber} placeholder="หมายเลขโทรศัพท์" error={state.fieldErrors.phoneNumber} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="ที่อยู่" htmlFor="address" required error={state.fieldErrors.address}>
                  <TextArea id="address" name="address" value={state.values.address} placeholder="ที่อยู่ปัจจุบัน" error={state.fieldErrors.address} inputFocusClass={theme.inputFocus} />
                </FieldShell>
              </div>
              <FieldShell label="เบอร์โทรผู้ปกครอง" htmlFor="parentPhone" required error={state.fieldErrors.parentPhone}>
                <TextInput id="parentPhone" name="parentPhone" value={state.values.parentPhone} placeholder="เบอร์โทรผู้ปกครอง" error={state.fieldErrors.parentPhone} inputFocusClass={theme.inputFocus} />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon={<AcademicIcon />}
            title="ข้อมูลการศึกษา"
            description="ระบุข้อมูลการศึกษาให้ถูกต้องเพื่อให้ผู้ดูแลตรวจสอบบริบทการฝึกงานได้อย่างเหมาะสม"
            accentTileClass={theme.accentTile}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="ระดับการศึกษา" htmlFor="educationLevel" required error={state.fieldErrors.educationLevel}>
                <SelectInput id="educationLevel" name="educationLevel" value={state.values.educationLevel} options={EDUCATION_LEVEL_OPTIONS} placeholder="เลือกระดับการศึกษา" error={state.fieldErrors.educationLevel} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="สถานศึกษา" htmlFor="institution" required error={state.fieldErrors.institution}>
                <TextInput id="institution" name="institution" value={state.values.institution} placeholder="สถานศึกษา" error={state.fieldErrors.institution} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="คณะ" htmlFor="faculty" required error={state.fieldErrors.faculty}>
                <TextInput id="faculty" name="faculty" value={state.values.faculty} placeholder="คณะ" error={state.fieldErrors.faculty} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="สาขา" htmlFor="major" required error={state.fieldErrors.major}>
                <TextInput id="major" name="major" value={state.values.major} placeholder="สาขา" error={state.fieldErrors.major} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="ชื่ออาจารย์ที่ปรึกษาสหกิจ" htmlFor="coOpAdvisorName" required error={state.fieldErrors.coOpAdvisorName}>
                <TextInput id="coOpAdvisorName" name="coOpAdvisorName" value={state.values.coOpAdvisorName} placeholder="ชื่ออาจารย์ที่ปรึกษา" error={state.fieldErrors.coOpAdvisorName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="เบอร์โทรอาจารย์ที่ปรึกษาสหกิจ" htmlFor="coOpAdvisorPhone" required error={state.fieldErrors.coOpAdvisorPhone}>
                <TextInput id="coOpAdvisorPhone" name="coOpAdvisorPhone" value={state.values.coOpAdvisorPhone} placeholder="เบอร์โทรอาจารย์ที่ปรึกษา" error={state.fieldErrors.coOpAdvisorPhone} inputFocusClass={theme.inputFocus} />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon={<BriefcaseIcon />}
            title="รายละเอียดการฝึกงาน"
            description="ระบุรายละเอียดหลักของสถานที่ฝึกงานและช่วงเวลาการติดตามตรวจสอบ"
            accentTileClass={theme.accentTile}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="ตำแหน่ง" htmlFor="position" required error={state.fieldErrors.position}>
                <TextInput id="position" name="position" value={state.values.position} placeholder="ตำแหน่งฝึกงาน" error={state.fieldErrors.position} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="แผนก / หน่วยงาน" htmlFor="departmentUnit" required error={state.fieldErrors.departmentUnit}>
                <TextInput id="departmentUnit" name="departmentUnit" value={state.values.departmentUnit} placeholder="แผนกหรือหน่วยงาน" error={state.fieldErrors.departmentUnit} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="ชื่อผู้ควบคุม" htmlFor="supervisorName" required error={state.fieldErrors.supervisorName}>
                <TextInput id="supervisorName" name="supervisorName" value={state.values.supervisorName} placeholder="ชื่อผู้ควบคุม" error={state.fieldErrors.supervisorName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="วันเริ่มฝึกงาน" htmlFor="startDate" required error={state.fieldErrors.startDate}>
                <TextInput id="startDate" name="startDate" type="date" value={state.values.startDate} error={state.fieldErrors.startDate} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="วันสิ้นสุดฝึกงาน" htmlFor="endDate" required error={state.fieldErrors.endDate}>
                <TextInput id="endDate" name="endDate" type="date" value={state.values.endDate} error={state.fieldErrors.endDate} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="รายละเอียดเพิ่มเติม" htmlFor="additionalDetails" error={state.fieldErrors.additionalDetails}>
                  <TextArea id="additionalDetails" name="additionalDetails" value={state.values.additionalDetails} placeholder="บันทึกเพิ่มเติมหรือรายละเอียดการฝึกงาน" error={state.fieldErrors.additionalDetails} rows={5} inputFocusClass={theme.inputFocus} />
                </FieldShell>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<FileIcon />}
            title="ไฟล์แนบ"
            description="อัปโหลดไฟล์ PDF หรือรูปภาพเพื่อประกอบข้อมูลการฝึกงานของคุณ สามารถเก็บได้สูงสุด 5 ไฟล์ และแต่ละไฟล์ต้องไม่เกิน 5 MB"
            accentTileClass={theme.accentTile}
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
                className={`flex w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${dragActive ? theme.uploadActive : theme.uploadIdle}`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${theme.accentTile}`}>
                  <UploadIcon />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-950">อัปโหลดไฟล์ฝึกงาน</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  ลากไฟล์มาวางที่นี่หรือคลิกเพื่อเลือกไฟล์ รองรับ PDF, JPG, PNG รวมได้สูงสุด 5 ไฟล์
                </p>
              </button>

              <FieldError message={localFileError ?? state.fieldErrors.files} />

              {visibleExistingFiles.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {visibleExistingFiles.map((file) => (
                    <div key={file.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start gap-3">
                        <a
                          href={file.href}
                          download={file.name}
                          className="flex items-start gap-3 rounded-2xl transition hover:opacity-85"
                        >
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.accentTile}`}>
                            <FileIcon />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{file.meta}</p>
                            <p className="mt-2 hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:inline-flex">
                              <CheckIcon />
                              อัปโหลดแล้ว กดเพื่อดาวน์โหลด
                            </p>
                          </div>
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => markExistingFileRemoved(file.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`ลบ ${file.name}`}
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
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.accentTile}`}>
                          <FileIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{`${(file.size / 1024).toFixed(1)} KB`}</p>
                          <p className={`mt-2 hidden text-xs font-medium sm:block ${theme.readyText}`}>Ready to upload</p>
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

          <div className={`sticky bottom-0 z-20 -mx-4 border-t px-4 pb-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${theme.stickyBar}`}>
            <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <CancelLink href={resolvedCancelHref} />
              <PrimaryActionButton label={primaryButtonLabel} className={theme.primaryButton} />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}