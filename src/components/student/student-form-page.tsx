"use client";

import Image from "next/image";
import Link from "next/link";
import type { InternshipStatus, UploadedFileCategory } from "@prisma/client";
import { startTransition, useActionState, useMemo, useRef, useState } from "react";
import { type StudentFormActionState } from "@/app/form/action-state";
import {
  logoutAction as defaultLogoutAction,
  saveStudentFormAction as defaultSaveStudentFormAction,
} from "@/app/form/actions";
import { AccountMenu } from "@/components/auth/account-menu";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { AppSelect } from "@/components/ui/app-select";
import { BRAND_LOGO_PATH } from "@/lib/app-paths";
import { formatInternshipStatusLabel } from "@/lib/internship-status";
import { appShellClass } from "@/lib/page-shell";

const MAX_ATTACHMENT_FILE_COUNT = 5;
const MAX_ATTACHMENT_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PORTFOLIO_FILE_COUNT = 5;
const MAX_PORTFOLIO_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ATTACHMENT_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const PORTFOLIO_FILE_TYPES = new Set(["application/pdf"]);
const CURRENT_YEAR = new Date().getUTCFullYear();

type ExistingFileItem = {
  id: string;
  category: UploadedFileCategory;
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
    status: InternshipStatus;
    isReadOnly: boolean;
    hasSubmitted: boolean;
    latestReviewComment: {
      id: string;
      message: string;
      createdAtLabel: string;
      adminLabel: string;
    } | null;
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
  if (status === "draft") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (status === "needs_fix") {
    return "bg-rose-100 text-rose-800 ring-rose-200";
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

function formatUploadFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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
  onChange,
  placeholder,
  error,
  inputFocusClass,
}: {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  error?: string;
  inputFocusClass: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : inputFocusClass}`}
    />
  );
}

function SelectInput({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  tone,
}: {
  id: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
  error?: string;
  tone: "admin" | "student";
}) {
  return (
    <AppSelect
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      error={error}
      tone={tone}
      size="lg"
      surface="muted"
    />
  );
}

function TextArea({
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  inputFocusClass,
}: {
  id: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  error?: string;
  rows?: number;
  inputFocusClass: string;
}) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
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
  className,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentTileClass: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 ${className ?? ""}`}>
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

function SubmitActionButton({
  label,
  className,
  pending,
  name = "intent",
  value = "save_changes",
}: {
  label: string;
  className: string;
  pending: boolean;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={pending}
    >
      {pending ? "กำลังบันทึก..." : label}
    </button>
  );
}

function CancelLink({ href, pending }: { href: string; pending: boolean }) {
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
  const [state, formAction, isPending] = useActionState(saveAction, initialState);
  const [formValues, setFormValues] = useState(initialState.values);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [attachmentDragActive, setAttachmentDragActive] = useState(false);
  const [portfolioDragActive, setPortfolioDragActive] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [selectedAttachmentFiles, setSelectedAttachmentFiles] = useState<File[]>([]);
  const [selectedPortfolioFiles, setSelectedPortfolioFiles] = useState<File[]>([]);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [localAttachmentError, setLocalAttachmentError] = useState<string | null>(null);
  const [localPortfolioError, setLocalPortfolioError] = useState<string | null>(null);
  const [localProfileImageError, setLocalProfileImageError] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const isAdminMode = mode === "admin";
  const hasAdminDisplayName = Boolean(currentUser.name?.trim());
  const resolvedBackHref = backHref ?? (isAdminMode ? "/admin/students" : "/overview");
  const resolvedBackLabel = backLabel ?? (isAdminMode ? "กลับไปหน้ารายชื่อนักศึกษา" : "กลับไปหน้าภาพรวม");
  const resolvedCancelHref = cancelHref ?? (isAdminMode ? resolvedBackHref : "/overview");
  const pageTitle = isAdminMode ? "แก้ไขข้อมูลนักศึกษา" : "แบบฟอร์มฝึกงาน";
  const pageDescription = isAdminMode
    ? "อัปเดตข้อมูลส่วนตัว การศึกษา รายละเอียดการฝึกงาน และไฟล์แนบของนักศึกษาได้จากหน้าฟอร์มเดียวกัน"
    : student.status === "needs_fix"
      ? "แก้ไขข้อมูลตามข้อคิดเห็นของผู้ดูแล แล้วส่งกลับมาเพื่อให้ตรวจสอบอีกครั้ง"
      : student.status === "draft"
        ? "กรอกข้อมูลการฝึกงานและแนบไฟล์ประกอบให้ครบถ้วนก่อนส่งให้ผู้ดูแลตรวจสอบ"
        : "กรอกข้อมูลการฝึกงาน แนบไฟล์ประกอบ และส่งการอัปเดตให้ผู้ดูแลตรวจสอบ";
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
  const visibleExistingAttachmentFiles = useMemo(
    () => visibleExistingFiles.filter((file) => file.category === "general_attachment"),
    [visibleExistingFiles],
  );
  const visibleExistingPortfolioFiles = useMemo(
    () => visibleExistingFiles.filter((file) => file.category === "portfolio_attachment"),
    [visibleExistingFiles],
  );
  const formNotice =
    !isAdminMode && student.status === "needs_fix"
      ? {
          tone: "border-rose-200 bg-rose-50 text-rose-800",
          title: "ผู้ดูแลส่งแบบฟอร์มกลับให้แก้ไข",
          description: student.latestReviewComment?.message || "กรุณาแก้ไขข้อมูลตามข้อคิดเห็นล่าสุด แล้วส่งใหม่อีกครั้ง",
          meta: student.latestReviewComment
            ? `${student.latestReviewComment.adminLabel} • ${student.latestReviewComment.createdAtLabel}`
            : null,
        }
      : !isAdminMode && student.status === "pending"
        ? {
            tone: "border-amber-200 bg-amber-50 text-amber-800",
            title: "แบบฟอร์มกำลังรอการตรวจสอบ",
            description: "คุณยังแก้ไขข้อมูลได้ หากต้องการอัปเดตข้อมูลเพิ่มเติมก่อนผู้ดูแลอนุมัติ",
            meta: null,
          }
        : !isAdminMode && student.status === "in_progress"
          ? {
              tone: "border-sky-200 bg-sky-50 text-sky-800",
              title: "แบบฟอร์มได้รับการอนุมัติแล้ว",
              description: "ทุกการแก้ไขข้อมูลหรือไฟล์ในสถานะนี้จะสร้างการแจ้งเตือนไปยังผู้ดูแลระบบ",
              meta: null,
            }
          : !isAdminMode && student.status === "draft"
            ? {
                tone: "border-slate-200 bg-slate-50 text-slate-700",
                title: "ยังไม่ได้ส่งแบบฟอร์ม",
                description: "กรอกข้อมูลให้ครบถ้วนแล้วส่งแบบฟอร์มเพื่อให้ผู้ดูแลเริ่มตรวจสอบ",
                meta: null,
              }
            : null;

  function updateFormValue<Key extends keyof typeof formValues>(key: Key, value: (typeof formValues)[Key]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submitEvent = event.nativeEvent as SubmitEvent;
    const submitter = submitEvent.submitter instanceof HTMLElement ? submitEvent.submitter : undefined;
    const formData = submitter ? new FormData(event.currentTarget, submitter) : new FormData(event.currentTarget);

    startTransition(() => {
      formAction(formData);
    });
  }

  function handleProfileImageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setLocalProfileImageError("รูปโปรไฟล์ต้องเป็นไฟล์ JPG หรือ PNG เท่านั้น");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES) {
      setLocalProfileImageError("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    setLocalProfileImageError(null);
    setRemoveProfileImage(false);
    setSelectedProfileImage(file);
  }

  function handleRemoveProfileImage() {
    setLocalProfileImageError(null);
    setSelectedProfileImage(null);
    setRemoveProfileImage(Boolean(profileImage));

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }
  }

  function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
    const dataTransfer = new DataTransfer();

    files.forEach((file) => dataTransfer.items.add(file));

    if (input) {
      input.files = dataTransfer.files;
    }
  }

  function mergeFiles(params: {
    incomingFiles: File[];
    currentFiles: File[];
    maxCount: number;
    maxSizeBytes: number;
    allowedTypes: Set<string>;
    invalidTypeMessage: string;
    invalidSizeMessage: string;
    maxCountMessage: string;
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    clearOtherError?: React.Dispatch<React.SetStateAction<string | null>>;
    input: HTMLInputElement | null;
  }) {
    const mergedFiles = [...params.currentFiles];

    params.incomingFiles.forEach((file) => {
      if (!mergedFiles.some((currentFile) => currentFile.name === file.name && currentFile.size === file.size)) {
        mergedFiles.push(file);
      }
    });

    if (mergedFiles.length > params.maxCount) {
      params.setError(params.maxCountMessage);
      syncInputFiles(params.input, params.currentFiles);
      return;
    }

    for (const file of mergedFiles) {
      if (!params.allowedTypes.has(file.type)) {
        params.setError(params.invalidTypeMessage);
        syncInputFiles(params.input, params.currentFiles);
        return;
      }

      if (file.size > params.maxSizeBytes) {
        params.setError(params.invalidSizeMessage);
        syncInputFiles(params.input, params.currentFiles);
        return;
      }
    }

    params.setError(null);
    params.clearOtherError?.(null);
    params.setFiles(mergedFiles);
    syncInputFiles(params.input, mergedFiles);
  }

  function handleAttachmentInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    mergeFiles({
      incomingFiles: Array.from(event.target.files ?? []),
      currentFiles: selectedAttachmentFiles,
      maxCount: MAX_ATTACHMENT_FILE_COUNT,
      maxSizeBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
      allowedTypes: ATTACHMENT_FILE_TYPES,
      invalidTypeMessage: "อนุญาตเฉพาะไฟล์ PDF, JPG และ PNG เท่านั้น",
      invalidSizeMessage: "เอกสารประกอบการฝึกงานแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB",
      maxCountMessage: `อัปโหลดเอกสารประกอบการฝึกงานได้สูงสุด ${MAX_ATTACHMENT_FILE_COUNT} ไฟล์`,
      setFiles: setSelectedAttachmentFiles,
      setError: setLocalAttachmentError,
      input: attachmentInputRef.current,
    });
  }

  function handlePortfolioInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    mergeFiles({
      incomingFiles: Array.from(event.target.files ?? []),
      currentFiles: selectedPortfolioFiles,
      maxCount: MAX_PORTFOLIO_FILE_COUNT,
      maxSizeBytes: MAX_PORTFOLIO_FILE_SIZE_BYTES,
      allowedTypes: PORTFOLIO_FILE_TYPES,
      invalidTypeMessage: "แฟ้มสะสมผลงานอนุญาตเฉพาะไฟล์ PDF เท่านั้น",
      invalidSizeMessage: "แฟ้มสะสมผลงานแต่ละไฟล์ต้องมีขนาดไม่เกิน 10 MB",
      maxCountMessage: `อัปโหลดแฟ้มสะสมผลงานได้สูงสุด ${MAX_PORTFOLIO_FILE_COUNT} ไฟล์`,
      setFiles: setSelectedPortfolioFiles,
      setError: setLocalPortfolioError,
      input: portfolioInputRef.current,
    });
  }

  function handleAttachmentDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setAttachmentDragActive(false);
    mergeFiles({
      incomingFiles: Array.from(event.dataTransfer.files ?? []),
      currentFiles: selectedAttachmentFiles,
      maxCount: MAX_ATTACHMENT_FILE_COUNT,
      maxSizeBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
      allowedTypes: ATTACHMENT_FILE_TYPES,
      invalidTypeMessage: "อนุญาตเฉพาะไฟล์ PDF, JPG และ PNG เท่านั้น",
      invalidSizeMessage: "เอกสารประกอบการฝึกงานแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB",
      maxCountMessage: `อัปโหลดเอกสารประกอบการฝึกงานได้สูงสุด ${MAX_ATTACHMENT_FILE_COUNT} ไฟล์`,
      setFiles: setSelectedAttachmentFiles,
      setError: setLocalAttachmentError,
      input: attachmentInputRef.current,
    });
  }

  function handlePortfolioDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setPortfolioDragActive(false);
    mergeFiles({
      incomingFiles: Array.from(event.dataTransfer.files ?? []),
      currentFiles: selectedPortfolioFiles,
      maxCount: MAX_PORTFOLIO_FILE_COUNT,
      maxSizeBytes: MAX_PORTFOLIO_FILE_SIZE_BYTES,
      allowedTypes: PORTFOLIO_FILE_TYPES,
      invalidTypeMessage: "แฟ้มสะสมผลงานอนุญาตเฉพาะไฟล์ PDF เท่านั้น",
      invalidSizeMessage: "แฟ้มสะสมผลงานแต่ละไฟล์ต้องมีขนาดไม่เกิน 10 MB",
      maxCountMessage: `อัปโหลดแฟ้มสะสมผลงานได้สูงสุด ${MAX_PORTFOLIO_FILE_COUNT} ไฟล์`,
      setFiles: setSelectedPortfolioFiles,
      setError: setLocalPortfolioError,
      input: portfolioInputRef.current,
    });
  }

  function removeSelectedAttachmentFile(index: number) {
    const nextFiles = selectedAttachmentFiles.filter((_, fileIndex) => fileIndex !== index);

    setLocalAttachmentError(null);
    setSelectedAttachmentFiles(nextFiles);
    syncInputFiles(attachmentInputRef.current, nextFiles);
  }

  function removeSelectedPortfolioFile(index: number) {
    const nextFiles = selectedPortfolioFiles.filter((_, fileIndex) => fileIndex !== index);

    setLocalPortfolioError(null);
    setSelectedPortfolioFiles(nextFiles);
    syncInputFiles(portfolioInputRef.current, nextFiles);
  }

  function markExistingFileRemoved(fileId: string) {
    setLocalAttachmentError(null);
    setLocalPortfolioError(null);
    setRemovedFileIds((currentFileIds) => (currentFileIds.includes(fileId) ? currentFileIds : [...currentFileIds, fileId]));
  }

  if (!isAdminMode && student.isReadOnly) {
    return (
      <div className="min-h-screen bg-[#fff7f1] text-slate-950">
        <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl">
          <div className={`${appShellClass} flex items-center justify-between gap-4 py-3`}>
            <Link href="/overview" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image src={BRAND_LOGO_PATH} alt="ระบบจัดการฝึกงาน" width={27} height={30} style={{ width: "auto" }} priority />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-student)">ระบบ</p>
                <p className="text-sm font-medium text-slate-700">จัดการนักศึกษาฝึกงาน</p>
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

        <main className={`${appShellClass} flex min-h-[calc(100vh-81px)] items-center py-10`}>
          <section className="mx-auto w-full max-w-5xl rounded-4xl border border-orange-200 bg-[#fff1e7] p-8 text-center shadow-xl shadow-orange-950/8 sm:p-10 lg:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-(--color-student) shadow-sm">
              <LockIcon />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">แบบฟอร์มนี้เป็นแบบอ่านอย่างเดียว</h1>
            <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
              สถานะการฝึกงานของคุณคือ {formatInternshipStatusLabel(student.status)} จึงไม่สามารถแก้ไขได้ แต่ยังสามารถตรวจสอบข้อมูลที่ส่งไว้จากหน้าภาพรวมได้
            </p>
            <Link
              href="/overview"
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
      <header className={`sticky top-0 z-30 border-b bg-white/90 backdrop-blur-xl ${isAdminMode ? "border-slate-200/80" : theme.headerBorder}`}>
        <div className={`${appShellClass} flex items-center justify-between gap-4 py-3`}>
          <div className="flex items-center gap-4">
            <Link href={isAdminMode ? "/admin/students" : "/overview"} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image src={BRAND_LOGO_PATH} alt="ระบบจัดการฝึกงาน" width={27} height={30} style={{ width: "auto" }} priority />
              </div>
              <div className="hidden sm:block">
                {isAdminMode ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-admin)">
                      ระบบ
                    </p>
                    <p className="text-sm font-medium text-slate-700">จัดการนักศึกษาฝึกงาน</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-slate-700">ระบบจัดการนักศึกษาฝึกงานทั้งหมด</p>
                )}
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {isAdminMode ? (
                <>
                  <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                    แดชบอร์ด
                  </Link>
                  <Link href="/admin/students" className="rounded-full bg-admin/12 px-4 py-2 text-sm font-semibold text-(--color-admin)" aria-current="page">
                    รายชื่อนักศึกษา
                  </Link>
                  <Link href="/notifications" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                    การแจ้งเตือน
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/overview" className={`rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition ${theme.navHover}`}>
                    ภาพรวม
                  </Link>
                  <Link href="/form" className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.navActive}`} aria-current="page">
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
              roleLabel={isAdminMode ? "ผู้ดูแลระบบ" : "นักศึกษา"}
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

        {isAdminMode && !hasAdminDisplayName ? (
          <div className="border-t border-admin/10 bg-linear-to-r from-admin/8 via-white to-admin/5">
            <div className={`${appShellClass} flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  กรุณาตั้งชื่อที่แสดงสำหรับบัญชีของคุณ
                </p>
              </div>
              <Link
                href="/account/name"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-(--color-admin) px-4 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95"
              >
                ตั้งชื่อที่แสดง
              </Link>
            </div>
          </div>
        ) : null}
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
                  <Link href="/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    แดชบอร์ด
                  </Link>
                  <Link href="/admin/students" className="block rounded-2xl bg-admin/12 px-4 py-3 text-sm font-semibold text-(--color-admin)" aria-current="page" onClick={() => setMobileMenuOpen(false)}>
                    รายชื่อนักศึกษา
                  </Link>
                  <Link href="/notifications" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                    การแจ้งเตือน
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/overview" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700" onClick={() => setMobileMenuOpen(false)}>
                    ภาพรวม
                  </Link>
                  <Link href="/form" className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${theme.navActive}`} aria-current="page" onClick={() => setMobileMenuOpen(false)}>
                    แบบฟอร์ม
                  </Link>
                </>
              )}
              {isAdminMode ? (
                <Link
                  href="/account/name"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-admin/6 hover:text-(--color-admin)"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {currentUser.name?.trim() ? "แก้ไขชื่อที่แสดง" : "ตั้งชื่อที่แสดง"}
                </Link>
              ) : null}
              <Link
                href="/account/password"
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

      <main className={`${appShellClass} py-8 lg:pb-28 lg:pt-10`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={resolvedBackHref} className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition ${theme.backHoverText}`}>
            <BackIcon />
            {resolvedBackLabel}
          </Link>
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClasses(student.status)}`}>
            {formatInternshipStatusLabel(student.status)}
          </span>
        </div>

        <div className="mt-5 max-w-4xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{pageTitle}</h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            {pageDescription}
          </p>
        </div>

        {formNotice ? (
          <section className={`mt-6 rounded-[28px] border px-5 py-4 ${formNotice.tone}`}>
            <p className="text-sm font-semibold">{formNotice.title}</p>
            <p className="mt-2 text-sm leading-6">{formNotice.description}</p>
            {formNotice.meta ? <p className="mt-2 text-xs font-medium">{formNotice.meta}</p> : null}
          </section>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 pb-24 xl:grid-cols-12">
          <SectionCard
            icon={<CameraIcon />}
            title="รูปโปรไฟล์นักศึกษา"
            description=""
            accentTileClass={theme.accentTile}
            className="xl:col-span-5"
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
                      loading="eager"
                      sizes="112px"
                      className="object-cover"
                      unoptimized={
                        visibleProfileImage.src.startsWith("blob:") ||
                        visibleProfileImage.src.includes("/uploads/") ||
                        visibleProfileImage.src.includes("/api/")
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
                  <p className="text-xs leading-5 text-orange-500">รูปถ่ายในชุดเครื่องแบบนักศึกษาที่ถ่ายไว้ระยะเวลาไม่เกิน 3 ถึง 6 เดือน*</p>
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
            <FieldError message={localProfileImageError ?? state.fieldErrors.profileImage} />
          </SectionCard>

          {hiddenFields.map((field) => (
            <input key={`${field.name}-${field.value}`} type="hidden" name={field.name} value={field.value} />
          ))}
          {state.message ? (
            <div className={`xl:col-span-12 rounded-2xl border px-4 py-3 text-sm ${state.status === "error" ? "border-red-200 bg-red-50 text-red-700" : theme.successMessage}`}>
              {state.message}
            </div>
          ) : null}

          <SectionCard
            icon={<UserIcon />}
            title="ข้อมูลส่วนตัว"
            description=""
            accentTileClass={theme.accentTile}
            className="xl:col-span-7"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="คำนำหน้า" htmlFor="prefix" required error={state.fieldErrors.prefix}>
                <SelectInput id="prefix" name="prefix" value={formValues.prefix} onChange={(event) => updateFormValue("prefix", event.target.value)} options={PREFIX_OPTIONS} placeholder="เลือกคำนำหน้า" error={state.fieldErrors.prefix} tone={isAdminMode ? "admin" : "student"} />
              </FieldShell>
              <FieldShell label="เพศ" htmlFor="gender" required error={state.fieldErrors.gender}>
                <SelectInput id="gender" name="gender" value={formValues.gender} onChange={(event) => updateFormValue("gender", event.target.value)} options={GENDER_OPTIONS} placeholder="เลือกเพศ" error={state.fieldErrors.gender} tone={isAdminMode ? "admin" : "student"} />
              </FieldShell>
              <FieldShell label="ชื่อ" htmlFor="firstName" required error={state.fieldErrors.firstName}>
                <TextInput id="firstName" name="firstName" value={formValues.firstName} onChange={(event) => updateFormValue("firstName", event.target.value)} placeholder="ชื่อ" error={state.fieldErrors.firstName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="นามสกุล" htmlFor="lastName" required error={state.fieldErrors.lastName}>
                <TextInput id="lastName" name="lastName" value={formValues.lastName} onChange={(event) => updateFormValue("lastName", event.target.value)} placeholder="นามสกุล" error={state.fieldErrors.lastName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="วันเกิด" htmlFor="dateOfBirth" required error={state.fieldErrors.dateOfBirth}>
                <AppDatePicker id="dateOfBirth" name="dateOfBirth" value={formValues.dateOfBirth} onChange={(nextValue) => updateFormValue("dateOfBirth", nextValue)} placeholder="เลือกวันเกิด" error={state.fieldErrors.dateOfBirth} tone={isAdminMode ? "admin" : "student"} size="lg" startYear={1950} endYear={CURRENT_YEAR} required />
              </FieldShell>
              <FieldShell label="หมายเลขโทรศัพท์" htmlFor="phoneNumber" required error={state.fieldErrors.phoneNumber}>
                <TextInput id="phoneNumber" name="phoneNumber" value={formValues.phoneNumber} onChange={(event) => updateFormValue("phoneNumber", event.target.value)} placeholder="หมายเลขโทรศัพท์" error={state.fieldErrors.phoneNumber} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="ที่อยู่" htmlFor="address" required error={state.fieldErrors.address}>
                  <TextArea id="address" name="address" value={formValues.address} onChange={(event) => updateFormValue("address", event.target.value)} placeholder="ที่อยู่ปัจจุบัน" error={state.fieldErrors.address} inputFocusClass={theme.inputFocus} />
                </FieldShell>
              </div>
              <FieldShell label="เบอร์โทรผู้ปกครอง" htmlFor="parentPhone" required error={state.fieldErrors.parentPhone}>
                <TextInput id="parentPhone" name="parentPhone" value={formValues.parentPhone} onChange={(event) => updateFormValue("parentPhone", event.target.value)} placeholder="เบอร์โทรผู้ปกครอง" error={state.fieldErrors.parentPhone} inputFocusClass={theme.inputFocus} />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon={<AcademicIcon />}
            title="ข้อมูลการศึกษา"
            description=""
            accentTileClass={theme.accentTile}
            className="xl:col-span-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="ระดับการศึกษา" htmlFor="educationLevel" required error={state.fieldErrors.educationLevel}>
                <SelectInput id="educationLevel" name="educationLevel" value={formValues.educationLevel} onChange={(event) => updateFormValue("educationLevel", event.target.value)} options={EDUCATION_LEVEL_OPTIONS} placeholder="เลือกระดับการศึกษา" error={state.fieldErrors.educationLevel} tone={isAdminMode ? "admin" : "student"} />
              </FieldShell>
              <FieldShell label="สถานศึกษา" htmlFor="institution" required error={state.fieldErrors.institution}>
                <TextInput id="institution" name="institution" value={formValues.institution} onChange={(event) => updateFormValue("institution", event.target.value)} placeholder="สถานศึกษา" error={state.fieldErrors.institution} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="คณะ" htmlFor="faculty" required error={state.fieldErrors.faculty}>
                <TextInput id="faculty" name="faculty" value={formValues.faculty} onChange={(event) => updateFormValue("faculty", event.target.value)} placeholder="คณะ" error={state.fieldErrors.faculty} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="สาขา" htmlFor="major" required error={state.fieldErrors.major}>
                <TextInput id="major" name="major" value={formValues.major} onChange={(event) => updateFormValue("major", event.target.value)} placeholder="สาขา" error={state.fieldErrors.major} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="ชื่ออาจารย์ที่ปรึกษาสหกิจ" htmlFor="coOpAdvisorName" required error={state.fieldErrors.coOpAdvisorName}>
                <TextInput id="coOpAdvisorName" name="coOpAdvisorName" value={formValues.coOpAdvisorName} onChange={(event) => updateFormValue("coOpAdvisorName", event.target.value)} placeholder="ชื่ออาจารย์ที่ปรึกษา" error={state.fieldErrors.coOpAdvisorName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="เบอร์โทรอาจารย์ที่ปรึกษาสหกิจ" htmlFor="coOpAdvisorPhone" required error={state.fieldErrors.coOpAdvisorPhone}>
                <TextInput id="coOpAdvisorPhone" name="coOpAdvisorPhone" value={formValues.coOpAdvisorPhone} onChange={(event) => updateFormValue("coOpAdvisorPhone", event.target.value)} placeholder="เบอร์โทรอาจารย์ที่ปรึกษา" error={state.fieldErrors.coOpAdvisorPhone} inputFocusClass={theme.inputFocus} />
              </FieldShell>
            </div>
          </SectionCard>

          <SectionCard
            icon={<BriefcaseIcon />}
            title="รายละเอียดการฝึกงาน"
            description=""
            accentTileClass={theme.accentTile}
            className="xl:col-span-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label="ตำแหน่ง" htmlFor="position" required error={state.fieldErrors.position}>
                <TextInput id="position" name="position" value={formValues.position} onChange={(event) => updateFormValue("position", event.target.value)} placeholder="ตำแหน่งฝึกงาน" error={state.fieldErrors.position} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="แผนก / หน่วยงาน" htmlFor="departmentUnit" required error={state.fieldErrors.departmentUnit}>
                <TextInput id="departmentUnit" name="departmentUnit" value={formValues.departmentUnit} onChange={(event) => updateFormValue("departmentUnit", event.target.value)} placeholder="แผนกหรือหน่วยงาน" error={state.fieldErrors.departmentUnit} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="ชื่อผู้ดูแล" htmlFor="supervisorName" required error={state.fieldErrors.supervisorName}>
                <TextInput id="supervisorName" name="supervisorName" value={formValues.supervisorName} onChange={(event) => updateFormValue("supervisorName", event.target.value)} placeholder="ชื่อผู้ควบคุม" error={state.fieldErrors.supervisorName} inputFocusClass={theme.inputFocus} />
              </FieldShell>
              <FieldShell label="วันเริ่มฝึกงาน" htmlFor="startDate" required error={state.fieldErrors.startDate}>
                <AppDatePicker id="startDate" name="startDate" value={formValues.startDate} onChange={(nextValue) => updateFormValue("startDate", nextValue)} placeholder="เลือกวันเริ่มฝึกงาน" error={state.fieldErrors.startDate} tone={isAdminMode ? "admin" : "student"} size="lg" startYear={CURRENT_YEAR - 1} endYear={CURRENT_YEAR + 5} required />
              </FieldShell>
              <FieldShell label="วันสิ้นสุดฝึกงาน" htmlFor="endDate" required error={state.fieldErrors.endDate}>
                <AppDatePicker id="endDate" name="endDate" value={formValues.endDate} onChange={(nextValue) => updateFormValue("endDate", nextValue)} placeholder="เลือกวันสิ้นสุดฝึกงาน" error={state.fieldErrors.endDate} tone={isAdminMode ? "admin" : "student"} size="lg" startYear={CURRENT_YEAR - 1} endYear={CURRENT_YEAR + 5} required />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="รายละเอียดเพิ่มเติม" htmlFor="additionalDetails" error={state.fieldErrors.additionalDetails}>
                  <TextArea id="additionalDetails" name="additionalDetails" value={formValues.additionalDetails} onChange={(event) => updateFormValue("additionalDetails", event.target.value)} placeholder="บันทึกเพิ่มเติมหรือรายละเอียดการฝึกงาน" error={state.fieldErrors.additionalDetails} rows={5} inputFocusClass={theme.inputFocus} />
                </FieldShell>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<FileIcon />}
            title="ไฟล์แนบ"
            description=""
            accentTileClass={theme.accentTile}
            className="xl:col-span-12"
          >
            <div className="space-y-6">
              <input
                ref={attachmentInputRef}
                id="attachments"
                name="attachments"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={handleAttachmentInputChange}
              />

              <input
                ref={portfolioInputRef}
                id="portfolioAttachments"
                name="portfolioAttachments"
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handlePortfolioInputChange}
              />

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">เอกสารประกอบการฝึกงาน</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">อัปโหลดได้สูงสุด 5 ไฟล์ รองรับ PDF, PNG, JPG และแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB</p>
                </div>

                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setAttachmentDragActive(true);
                  }}
                  onDragLeave={() => setAttachmentDragActive(false)}
                  onDrop={handleAttachmentDrop}
                  className={`flex w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${attachmentDragActive ? theme.uploadActive : theme.uploadIdle}`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${theme.accentTile}`}>
                    <UploadIcon />
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-950">General Attachments (เอกสารประกอบการฝึกงาน)</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    ลากไฟล์มาวางที่นี่หรือคลิกเพื่อเลือกไฟล์ รองรับ PDF, PNG, JPG สูงสุด 5 ไฟล์
                  </p>
                </button>

                <FieldError message={localAttachmentError ?? state.fieldErrors.attachments} />

                {selectedAttachmentFiles.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAttachmentFiles.map((file, index) => (
                      <div key={`${file.name}-${file.size}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.accentTile}`}>
                            <FileIcon />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{formatUploadFileSize(file.size)}</p>
                            <p className={`mt-2 hidden text-xs font-medium sm:block ${theme.readyText}`}>Ready to upload</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedAttachmentFile(index)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                          aria-label={`Remove ${file.name}`}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {visibleExistingAttachmentFiles.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-950">ไฟล์เอกสารประกอบที่อัปโหลดแล้ว</h4>
                    </div>
                    {visibleExistingAttachmentFiles.map((file) => (
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
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Portfolio &amp; Work Samples (แฟ้มสะสมผลงาน)</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">อัปโหลดแฟ้มสะสมผลงานหรือโปรเจกต์ของคุณ (เฉพาะไฟล์ PDF, ขนาดไม่เกิน 10MB ต่อไฟล์)</p>
                </div>

                <button
                  type="button"
                  onClick={() => portfolioInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setPortfolioDragActive(true);
                  }}
                  onDragLeave={() => setPortfolioDragActive(false)}
                  onDrop={handlePortfolioDrop}
                  className={`flex w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${portfolioDragActive ? theme.uploadActive : theme.uploadIdle}`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${theme.accentTile}`}>
                    <UploadIcon />
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-950">Portfolio &amp; Work Samples (แฟ้มสะสมผลงาน)</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    ลากไฟล์ PDF มาวางที่นี่หรือคลิกเพื่อเลือกไฟล์ รองรับสูงสุด 5 ไฟล์
                  </p>
                </button>

                <FieldError message={localPortfolioError ?? state.fieldErrors.portfolioAttachments} />

                {selectedPortfolioFiles.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPortfolioFiles.map((file, index) => (
                      <div key={`${file.name}-${file.size}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.accentTile}`}>
                            <FileIcon />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{formatUploadFileSize(file.size)}</p>
                            <p className={`mt-2 hidden text-xs font-medium sm:block ${theme.readyText}`}>Ready to upload</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedPortfolioFile(index)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                          aria-label={`Remove ${file.name}`}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                {visibleExistingPortfolioFiles.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-950">ไฟล์แฟ้มสะสมผลงานที่อัปโหลดแล้ว</h4>
                    </div>
                    {visibleExistingPortfolioFiles.map((file) => (
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
              </div>

              {removedFileIds.map((fileId) => (
                <input key={fileId} type="hidden" name="removeFileIds" value={fileId} />
              ))}
            </div>
          </SectionCard>

          <div className={`sticky bottom-0 z-20 xl:col-span-12 -mx-4 border-t px-4 pb-4 pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${theme.stickyBar}`}>
            <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <CancelLink href={resolvedCancelHref} pending={isPending} />
              {!isAdminMode && student.status === "draft" ? (
                <SubmitActionButton label="ส่งแบบฟอร์ม" className={theme.primaryButton} pending={isPending} value="submit" />
              ) : !isAdminMode && student.status === "needs_fix" ? (
                <>
                  <SubmitActionButton
                    label="แก้ไขแล้วส่งใหม่"
                    className={theme.primaryButton}
                    pending={isPending}
                    value="submit"
                  />
                </>
              ) : (
                <SubmitActionButton
                  label="บันทึกการเปลี่ยนแปลง"
                  className={theme.primaryButton}
                  pending={isPending}
                  value="save_changes"
                />
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
