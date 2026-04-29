"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { InternshipStatus } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  initialUpdateStudentStatusActionState,
  type UpdateStudentStatusActionState,
} from "@/app/intern/admin/students/[id]/action-state";
import { updateStudentStatusAction } from "@/app/intern/admin/students/[id]/actions";
import { logoutAction } from "@/app/intern/admin/students/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import { ModalFrame } from "@/components/admin/modal-frame";
import { InternshipStatusStepper } from "@/components/ui/internship-status-stepper";
import { formatInternshipStatusLabel } from "@/lib/internship-status";
import { appShellClass } from "@/lib/page-shell";

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

type ProfileImageItem = {
  src: string;
  name: string;
  downloadHref: string;
};

type ReviewHistoryItem = {
  id: string;
  message: string;
  createdAtLabel: string;
  adminLabel: string;
};

type ActivityLogItem = {
  id: string;
  action: string;
  message: string;
  createdAtLabel: string;
  actorLabel: string;
};

type SectionShellProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export type AdminStudentDetailPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  student: {
    id: string;
    firstName: string;
    displayName: string;
    email: string;
    status: InternshipStatus;
    hasSubmitted: boolean;
    statusLabel: string;
    completionNote: string | null;
    statusControl: {
      allowedTransitions: InternshipStatus[];
      blockReason: string | null;
    };
    profileImage: ProfileImageItem | null;
    personal: SummaryItem[];
    internship: SummaryItem[];
    education: SummaryItem[];
    files: FileItem[];
    reviewHistory: ReviewHistoryItem[];
    activityLog: ActivityLogItem[];
    summary: {
      lastUpdatedLabel: string;
      lastUpdatedByLabel: string | null;
      lastUpdatedByEmail: string | null;
      submittedAtLabel: string;
    };
  };
};

const ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/intern/dashboard", label: "แดชบอร์ด" },
  { href: "/intern/admin/students", label: "รายชื่อนักศึกษา", match: "prefix" },
  { href: "/intern/notifications", label: "การแจ้งเตือน" },
  { href: "/intern/activity-logs", label: "บันทึกกิจกรรม" },
];

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="M11.75 4.75 6.5 10l5.25 5.25" />
      <path d="M7 10h7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m13.75 3.75 2.5 2.5" />
      <path d="M4.75 15.25 7.5 14.5l7.5-7.5a1.77 1.77 0 0 0-2.5-2.5L5 12l-.25 3.25Z" />
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

function CameraIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-5 w-5">
      <path d="M6.5 5.25 7.4 3.75h5.2l.9 1.5h1.75A1.75 1.75 0 0 1 17 7v7.25A1.75 1.75 0 0 1 15.25 16h-10.5A1.75 1.75 0 0 1 3 14.25V7a1.75 1.75 0 0 1 1.75-1.75H6.5Z" />
      <circle cx="10" cy="10.5" r="2.75" />
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

function ReviewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-4 w-4">
      <path d="M4.25 5.25A2.25 2.25 0 0 1 6.5 3h7A2.25 2.25 0 0 1 15.75 5.25v9.5L12 12.5l-2 2-2-2-3.75 2.25v-9.5Z" />
      <path d="M7 7h6" />
      <path d="M7 9.75h4.5" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-4 w-4">
      <circle cx="10" cy="10" r="6.75" />
      <path d="M10 6.5v3.75l2.5 1.5" />
    </svg>
  );
}

function getStatusClasses(status: InternshipStatus) {
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

function getStatusAction(status: InternshipStatus) {
  if (status === "needs_fix") {
    return {
      label: "ส่งกลับให้แก้ไข",
      tone: "secondary" as const,
    };
  }

  if (status === "in_progress") {
    return {
      label: "อนุมัติแบบฟอร์ม",
      tone: "primary" as const,
    };
  }

  if (status === "completed") {
    return {
      label: "ทำเครื่องหมายว่าเสร็จสิ้น",
      tone: "primary" as const,
    };
  }

  return null;
}

function getStatusButtonClass(tone: "primary" | "secondary") {
  return tone === "secondary"
    ? "inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    : "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-lg shadow-admin/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70";
}

function StatusActionButton({
  label,
  onClick,
  disabled,
  tone = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={getStatusButtonClass(tone)}
    >
      {label}
    </button>
  );
}

function StatusSubmitButton({
  label,
  disabled,
  tone = "primary",
}: {
  label: string;
  disabled?: boolean;
  tone?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={getStatusButtonClass(tone)}
    >
      {pending ? "กำลังอัปเดต..." : label}
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
    <SectionShell title={title} description={description} icon={icon}>
      <dl className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3.5">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </dt>
            <dd className="mt-2 text-sm font-medium leading-6 text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}

function SectionShell({ title, description, icon, children }: SectionShellProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{title}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-admin">
          {icon}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AdminDataAccordionTrigger({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-admin">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-slate-950">{title}</p>
      </div>
    </div>
  );
}

function DesktopSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-admin/15 bg-white p-5 shadow-sm shadow-admin/10 md:p-6">
      {children}
    </div>
  );
}

function AttachmentsSection({ student }: { student: AdminStudentDetailPageProps["student"] }) {
  return (
    <SectionShell
      title="ไฟล์และเอกสารแนบ"
      description="รูปโปรไฟล์และไฟล์อัปโหลดที่เกี่ยวข้องกับข้อมูลฝึกงานของนักศึกษา"
      icon={<FileIcon />}
    >
      <div className="rounded-[26px] bg-slate-50/80 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-950">รูปโปรไฟล์นักศึกษา</h3>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-admin ring-1 ring-admin/15">
            <CameraIcon />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-admin/15 bg-admin/10 text-(--color-admin)">
              {student.profileImage ? (
                <Image src={student.profileImage.src} alt={student.profileImage.name} fill className="object-cover" unoptimized />
              ) : (
                <span className="text-2xl font-semibold text-white/95">{student.displayName.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {student.profileImage ? student.profileImage.name : "ยังไม่มีรูปโปรไฟล์"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {student.profileImage ? "ใช้สำหรับแสดงตัวตนของนักศึกษาในระบบ" : "สามารถเพิ่มหรือเปลี่ยนรูปได้จากหน้าจัดการข้อมูลนักศึกษา"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {student.profileImage ? (
              <a
                href={student.profileImage.downloadHref}
                download={student.profileImage.name}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-admin/20 hover:text-admin"
              >
                ดาวน์โหลดรูป
              </a>
            ) : null}
            <Link
              href={`/intern/admin/students/${student.id}/edit`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-4 text-sm font-semibold text-white shadow-lg shadow-admin/20 transition hover:brightness-95"
            >
              จัดการโปรไฟล์
            </Link>
          </div>
        </div>
      </div>

      {student.files.length > 0 ? (
        <div className="space-y-3">
          {student.files.map((file) => (
            <a
              key={file.id}
              href={file.href}
              download={file.name}
              className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-admin/5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-admin">
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
        <div className="rounded-[28px] border border-dashed border-admin/20 bg-[#faf6fa] px-5 py-8 text-center">
          <div className="mx-auto flex justify-center text-(--color-admin)">
            <EmptyFilesIcon />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-950">ยังไม่มีการอัปโหลดไฟล์</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            นักศึกษาคนนี้ยังไม่ได้อัปโหลดเอกสารประกอบ
          </p>
        </div>
      )}
    </SectionShell>
  );
}

function ListCard({
  title,
  description,
  emptyTitle,
  emptyDescription,
  items,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    meta: string;
  }>;
}) {
  return (
    <SectionShell title={title} description={description} icon={<FileIcon />}>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <span className="text-xs font-medium text-slate-500">{item.meta}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.subtitle}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <h3 className="text-lg font-semibold text-slate-950">{emptyTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{emptyDescription}</p>
        </div>
      )}
    </SectionShell>
  );
}

export function AdminStudentDetailPage({
  currentUser,
  student,
}: AdminStudentDetailPageProps) {
  const [confirmStatus, setConfirmStatus] = useState<InternshipStatus | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [reviewMessage, setReviewMessage] = useState("");
  const [statusState, formAction] = useActionState<UpdateStudentStatusActionState, FormData>(
    updateStudentStatusAction,
    initialUpdateStudentStatusActionState,
  );
  const router = useRouter();
  const hasStatusActions = student.statusControl.allowedTransitions.length > 0;
  const isStatusChangeBlocked = Boolean(student.statusControl.blockReason && hasStatusActions);
  const isCompletedStatus = student.status === "completed";

  useEffect(() => {
    if (statusState.status === "success") {
      router.refresh();
    }
  }, [router, statusState.status]);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setOpenSections(["personal"]);
    }
  }, []);

  const confirmAction = confirmStatus ? getStatusAction(confirmStatus) : null;
  const confirmStatusLabel = confirmStatus ? formatInternshipStatusLabel(confirmStatus) : null;

  function closeStatusModal() {
    setConfirmStatus(null);
    setReviewMessage("");
  }

  return (
    <AdminLayoutShell
      currentPath="/intern/admin/students"
      currentUser={currentUser}
      homeHref="/intern/admin/students"
      logoutAction={logoutAction}
      navItems={ADMIN_NAV_ITEMS}
      roleLabel="ผู้ดูแลระบบ"
    >
      <main className={`${appShellClass} py-8 lg:py-10`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/intern/admin/students"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeftIcon />
            กลับไปหน้ารายชื่อนักศึกษา
          </Link>
          <Link
            href={`/intern/admin/students/${student.id}/edit`}
            className="inline-flex items-center gap-2 rounded-full bg-(--color-admin) px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-admin/20 transition hover:brightness-95"
          >
            <EditIcon />
            แก้ไขข้อมูลนักศึกษา
          </Link>
        </div>

        <section className="overflow-hidden rounded-[36px] border border-admin/15 bg-linear-to-br from-[#f3eaf3] via-[#fcfafc] to-[#eee3ef] p-6 shadow-xl shadow-admin/10 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
                  รายละเอียดนักศึกษา
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  ตรวจสอบข้อมูลการฝึกงานของ <span className="text-(--color-admin)">{student.firstName}</span>
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  ตรวจสอบโปรไฟล์ ประวัติการศึกษา รายละเอียดการฝึกงาน และไฟล์ประกอบ พร้อมอัปเดตสถานะการฝึกงานให้ตรงกับความคืบหน้าจริง
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Review Actions</p>
              <div className="mt-3 space-y-3">
                {hasStatusActions ? (
                  <div className="space-y-3">
                    {student.statusControl.allowedTransitions.map((nextStatus) => (
                      <StatusActionButton
                        key={nextStatus}
                        label={getStatusAction(nextStatus)?.label ?? formatInternshipStatusLabel(nextStatus)}
                        onClick={() => setConfirmStatus(nextStatus)}
                        disabled={isStatusChangeBlocked}
                        tone={getStatusAction(nextStatus)?.tone}
                      />
                    ))}
                    {student.statusControl.blockReason ? <p className="text-sm leading-6 text-slate-600">{student.statusControl.blockReason}</p> : null}
                  </div>
                ) : (
                  <div className="inline-flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <span className="mt-0.5 text-slate-500">
                      <LockIcon />
                    </span>
                    <span>{isCompletedStatus ? "ข้อมูลการฝึกงานนี้เสร็จสมบูรณ์แล้ว" : student.statusControl.blockReason ?? "ยังไม่มีการดำเนินการเพิ่มเติมในสถานะนี้"}</span>
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">อัปเดตล่าสุด</p>
                    <p className="mt-2 font-medium text-slate-900">{student.summary.lastUpdatedLabel}</p>
                    {student.summary.lastUpdatedByLabel || student.summary.lastUpdatedByEmail ? (
                      <div className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                        <p>ผู้แก้ไขล่าสุด: {student.summary.lastUpdatedByLabel ?? "ระบบ"}</p>
                        {student.summary.lastUpdatedByEmail ? <p>{student.summary.lastUpdatedByEmail}</p> : null}
                      </div>
                    ) : null}
                  </div>
                  {/* <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">ส่งข้อมูลแล้ว</p>
                    <p className="mt-2 font-medium text-slate-900">{student.summary.submittedAtLabel}</p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          <InternshipStatusStepper currentStatus={student.status} tone="admin" className="mt-8" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <div className="lg:col-span-2">
            <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 md:hidden">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="px-5 sm:px-6 md:px-7"
              >
                <AccordionItem value="personal">
                  <AccordionTrigger accentClassName="hover:text-admin focus-visible:ring-admin/30" chevronClassName="text-admin">
                    <AdminDataAccordionTrigger title="ข้อมูลส่วนตัว" icon={<SummaryIcon />} />
                  </AccordionTrigger>
                  <AccordionContent>
                    <SummaryCard
                      title="ข้อมูลส่วนตัว"
                      description="ข้อมูลประจำตัวและการติดต่อหลักที่เก็บไว้สำหรับนักศึกษาคนนี้"
                      icon={<SummaryIcon />}
                      items={student.personal}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="education">
                  <AccordionTrigger accentClassName="hover:text-admin focus-visible:ring-admin/30" chevronClassName="text-admin">
                    <AdminDataAccordionTrigger title="ประวัติการศึกษา" icon={<AcademicIcon />} />
                  </AccordionTrigger>
                  <AccordionContent>
                    <SummaryCard
                      title="ประวัติการศึกษา"
                      description="ข้อมูลทางการศึกษาที่ใช้ประกอบการส่งข้อมูลฝึกงานนี้"
                      icon={<AcademicIcon />}
                      items={student.education}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="internship">
                  <AccordionTrigger accentClassName="hover:text-admin focus-visible:ring-admin/30" chevronClassName="text-admin">
                    <AdminDataAccordionTrigger title="รายละเอียดการฝึกงาน" icon={<CalendarIcon />} />
                  </AccordionTrigger>
                  <AccordionContent>
                    <SummaryCard
                      title="รายละเอียดการฝึกงาน"
                      description="รายละเอียดสถานที่ฝึกงานและบริบทการตรวจสอบปัจจุบันของข้อมูลนี้"
                      icon={<CalendarIcon />}
                      items={student.internship}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="attachments">
                  <AccordionTrigger accentClassName="hover:text-admin focus-visible:ring-admin/30" chevronClassName="text-admin">
                    <AdminDataAccordionTrigger title="ไฟล์และเอกสารแนบ" icon={<FileIcon />} />
                  </AccordionTrigger>
                  <AccordionContent>
                    <AttachmentsSection student={student} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="review-history">
                  <AccordionTrigger accentClassName="hover:text-admin focus-visible:ring-admin/30" chevronClassName="text-admin">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-admin">
                        <ReviewIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-950">ประวัติการรีวิว</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ListCard
                      title="ประวัติการรีวิว"
                      description="รายการเหตุผลหรือข้อคิดเห็นที่ผู้ดูแลใช้ประกอบการส่งกลับให้แก้ไข"
                      emptyTitle="ยังไม่มีประวัติการรีวิว"
                      emptyDescription="เมื่อผู้ดูแลส่งกลับให้แก้ไขพร้อมเหตุผล รายการจะปรากฏที่นี่"
                      items={student.reviewHistory.map((comment) => ({
                        id: comment.id,
                        title: comment.adminLabel,
                        subtitle: comment.message,
                        meta: comment.createdAtLabel,
                      }))}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="activity-log">
                  <AccordionTrigger accentClassName="hover:text-admin focus-visible:ring-admin/30" chevronClassName="text-admin">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-admin">
                        <ActivityIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-950">บันทึกกิจกรรม</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ListCard
                      title="บันทึกกิจกรรม"
                      description="กิจกรรมล่าสุดของนักศึกษาและผู้ดูแลที่เกี่ยวข้องกับข้อมูลฝึกงานชุดนี้"
                      emptyTitle="ยังไม่มีกิจกรรม"
                      emptyDescription="เมื่อมีการส่งฟอร์ม แก้ไขไฟล์ หรือเปลี่ยนสถานะ รายการจะปรากฏที่นี่"
                      items={student.activityLog.map((entry) => ({
                        id: entry.id,
                        title: entry.actorLabel,
                        subtitle: entry.message,
                        meta: entry.createdAtLabel,
                      }))}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <div className="hidden md:block md:space-y-6">
              <section className="grid gap-6 md:grid-cols-2">
                <DesktopSectionCard>
                  <SummaryCard
                    title="ข้อมูลส่วนตัว"
                    description="ข้อมูลประจำตัวและการติดต่อหลักที่เก็บไว้สำหรับนักศึกษาคนนี้"
                    icon={<SummaryIcon />}
                    items={student.personal}
                  />
                </DesktopSectionCard>
                <DesktopSectionCard>
                  <SummaryCard
                    title="ประวัติการศึกษา"
                    description="ข้อมูลทางการศึกษาที่ใช้ประกอบการส่งข้อมูลฝึกงานนี้"
                    icon={<AcademicIcon />}
                    items={student.education}
                  />
                </DesktopSectionCard>
                <DesktopSectionCard>
                  <SummaryCard
                    title="รายละเอียดการฝึกงาน"
                    description="รายละเอียดสถานที่ฝึกงานและบริบทการตรวจสอบปัจจุบันของข้อมูลนี้"
                    icon={<CalendarIcon />}
                    items={student.internship}
                  />
                </DesktopSectionCard>
                <DesktopSectionCard>
                  <AttachmentsSection student={student} />
                </DesktopSectionCard>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <DesktopSectionCard>
                  <ListCard
                    title="ประวัติการรีวิว"
                    description="รายการเหตุผลหรือข้อคิดเห็นที่ผู้ดูแลใช้ประกอบการส่งกลับให้แก้ไข"
                    emptyTitle="ยังไม่มีประวัติการรีวิว"
                    emptyDescription="เมื่อผู้ดูแลส่งกลับให้แก้ไขพร้อมเหตุผล รายการจะปรากฏที่นี่"
                    items={student.reviewHistory.map((comment) => ({
                      id: comment.id,
                      title: comment.adminLabel,
                      subtitle: comment.message,
                      meta: comment.createdAtLabel,
                    }))}
                  />
                </DesktopSectionCard>
                <DesktopSectionCard>
                  <ListCard
                    title="บันทึกกิจกรรม"
                    description="กิจกรรมล่าสุดของนักศึกษาและผู้ดูแลที่เกี่ยวข้องกับข้อมูลฝึกงานชุดนี้"
                    emptyTitle="ยังไม่มีกิจกรรม"
                    emptyDescription="เมื่อมีการส่งฟอร์ม แก้ไขไฟล์ หรือเปลี่ยนสถานะ รายการจะปรากฏที่นี่"
                    items={student.activityLog.map((entry) => ({
                      id: entry.id,
                      title: entry.actorLabel,
                      subtitle: entry.message,
                      meta: entry.createdAtLabel,
                    }))}
                  />
                </DesktopSectionCard>
              </section>
            </div>
          </div>
        </section>
      </main>

      {confirmStatus && confirmAction && confirmStatusLabel ? (
        <ModalFrame
          title="ยืนยันการเปลี่ยนสถานะ"
          description={`คุณต้องการเปลี่ยนสถานะเป็น ${confirmStatusLabel} ใช่หรือไม่?`}
        >
          <form
            action={formAction}
            className="space-y-4"
            onSubmit={closeStatusModal}
          >
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="nextStatus" value={confirmStatus} />
            {confirmStatus === "needs_fix" ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="reviewMessage" className="mb-2 block text-sm font-medium text-slate-800">
                    เหตุผลในการส่งกลับให้แก้ไข
                  </label>
                  <textarea
                    id="reviewMessage"
                    name="reviewMessage"
                    value={reviewMessage}
                    onChange={(event) => setReviewMessage(event.target.value)}
                    rows={4}
                    placeholder="ระบุสิ่งที่นักศึกษาต้องแก้ไขหรือข้อมูลที่ยังขาด"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-admin/40 focus:ring-4 focus:ring-admin/10"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    จำเป็นต้องระบุข้อความเมื่อส่งกลับให้แก้ไข และข้อความล่าสุดจะแสดงให้นักศึกษาเห็นในหน้าภาพรวมและแบบฟอร์ม
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  ข้อความที่จะส่งให้นักศึกษา: {reviewMessage.trim() || "กรุณาระบุเหตุผลก่อนยืนยันการส่งกลับ"}
                </div>
              </div>
            ) : null}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeStatusModal}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <StatusSubmitButton label="ยืนยัน" tone="primary" disabled={confirmStatus === "needs_fix" && !reviewMessage.trim()} />
            </div>
          </form>
        </ModalFrame>
      ) : null}
    </AdminLayoutShell>
  );
}