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
import { ModalFrame } from "@/components/admin/modal-frame";
import { AccountMenu } from "@/components/auth/account-menu";
import type { AdminNotificationItem } from "@/lib/admin/notifications";
import { formatInternshipStatusLabel } from "@/lib/internship-status";

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
    summary: {
      lastUpdatedLabel: string;
      submittedAtLabel: string;
    };
  };
};

type StatusDefinition = {
  id: InternshipStatus;
  label: string;
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

function getStatusClasses(status: InternshipStatus) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (status === "in_progress") {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

function getStatusDefinitions(): StatusDefinition[] {
  return [
    {
      id: "pending",
      label: formatInternshipStatusLabel("pending"),
    },
    {
      id: "in_progress",
      label: formatInternshipStatusLabel("in_progress"),
    },
    {
      id: "completed",
      label: formatInternshipStatusLabel("completed"),
    },
  ];
}

function getStatusCardClasses(definitionId: InternshipStatus, currentStatus: InternshipStatus) {
  if (definitionId === currentStatus) {
    return "border-admin/20 bg-white text-slate-900 shadow-lg shadow-admin/10 ring-1 ring-admin/10";
  }

  return "border-white/70 bg-white/65 text-slate-600";
}

function getStatusAction(status: InternshipStatus) {
  if (status === "pending") {
    return {
      label: "ย้อนกลับเป็นรอดำเนินการ",
      tone: "secondary" as const,
    };
  }

  if (status === "in_progress") {
    return {
      label: "เปลี่ยนเป็นกำลังฝึกงาน",
      tone: "primary" as const,
    };
  }

  if (status === "completed") {
    return {
      label: "เปลี่ยนเป็นเสร็จสิ้น",
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
  const [confirmStatus, setConfirmStatus] = useState<InternshipStatus | null>(null);
  const [statusState, formAction] = useActionState<UpdateStudentStatusActionState, FormData>(
    updateStudentStatusAction,
    initialUpdateStudentStatusActionState,
  );
  const router = useRouter();
  const statusDefinitions = getStatusDefinitions();
  const hasStatusActions = student.statusControl.allowedTransitions.length > 0;
  const isStatusChangeBlocked = Boolean(student.statusControl.blockReason && hasStatusActions);

  useEffect(() => {
    if (statusState.status === "success") {
      setConfirmStatus(null);
      router.refresh();
    }
  }, [router, statusState.status]);

  const confirmAction = confirmStatus ? getStatusAction(confirmStatus) : null;
  const confirmStatusLabel = confirmStatus ? formatInternshipStatusLabel(confirmStatus) : null;

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/intern/admin/students" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src="/nurse_logo.svg"
                  alt="ระบบจัดการฝึกงาน"
                  width={30}
                  height={30}
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-admin)">
                  ระบบ
                </p>
                <p className="text-sm font-medium text-slate-700">จัดการฝึกงาน</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link
                href="/intern/dashboard"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                แดชบอร์ด
              </Link>
              <Link
                href="/intern/admin/students"
                className="rounded-full bg-admin/12 px-4 py-2 text-sm font-semibold text-(--color-admin)"
              >
                รายชื่อนักศึกษา
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AdminNotificationMenu unreadNotificationCount={unreadNotificationCount} notifications={notifications} />
            <AccountMenu
              email={currentUser.email}
              logoutAction={logoutAction}
              name={currentUser.name}
              roleLabel="ผู้ดูแล"
              tone="admin"
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
          <aside
            className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.name?.trim() || currentUser.email}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{currentUser.email}</p>
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
              <Link
                href="/intern/dashboard"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                แดชบอร์ด
              </Link>
              <Link
                href="/intern/admin/students"
                className="block rounded-2xl bg-admin/12 px-4 py-3 text-sm font-semibold text-(--color-admin)"
                onClick={() => setMobileMenuOpen(false)}
              >
                รายชื่อนักศึกษา
              <Link
                href="/intern/account/name"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-admin/6 hover:text-(--color-admin)"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentUser.name?.trim() ? "แก้ไขชื่อที่แสดง" : "ตั้งชื่อที่แสดง"}
              </Link>
              <Link
                href="/intern/account/password"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-admin/6 hover:text-(--color-admin)"
                onClick={() => setMobileMenuOpen(false)}
              >
                เปลี่ยนรหัสผ่าน
              </Link>
              </Link>
            </nav>

            <AdminMobileNotificationsCard unreadNotificationCount={unreadNotificationCount} notifications={notifications} />

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">การควบคุมสถานะ</p>
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
                    <span>ข้อมูลการฝึกงานนี้เสร็จสมบูรณ์แล้ว</span>
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
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">ส่งข้อมูลแล้ว</p>
                    <p className="mt-2 font-medium text-slate-900">{student.summary.submittedAtLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {statusDefinitions.map((definition, index) => (
              <div
                key={definition.id}
                className={`rounded-3xl border p-4 ${getStatusCardClasses(definition.id, student.status)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    ขั้นตอนที่ {index + 1}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-slate-700 ring-1 ring-black/5">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-current sm:text-base">{definition.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <SummaryCard
              title="ข้อมูลส่วนตัว"
              description="ข้อมูลประจำตัวและการติดต่อหลักที่เก็บไว้สำหรับนักศึกษาคนนี้"
              icon={<SummaryIcon />}
              items={student.personal}
            />

            <SummaryCard
              title="ข้อมูลการฝึกงาน"
              description="รายละเอียดสถานที่ฝึกงานและบริบทการตรวจสอบปัจจุบันของข้อมูลนี้"
              icon={<CalendarIcon />}
              items={student.internship}
            />

            <SummaryCard
              title="ข้อมูลการศึกษา"
              description="ข้อมูลทางการศึกษาที่ใช้ประกอบการส่งข้อมูลฝึกงานนี้"
              icon={<AcademicIcon />}
              items={student.education}
            />
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">รูปโปรไฟล์นักศึกษา</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    ผู้ดูแลสามารถตรวจสอบ ดาวน์โหลด หรือไปยังหน้าจัดการรูปโปรไฟล์ได้โดยตรง
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
                  <CameraIcon />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                    <p className="mt-1 text-sm text-slate-600">
                      {student.profileImage ? "ใช้สำหรับแสดงตัวตนของนักศึกษาในระบบ" : "สามารถเพิ่มหรือเปลี่ยนรูปได้จากหน้าจัดการข้อมูลนักศึกษา"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {student.profileImage ? (
                    <a
                      href={student.profileImage.downloadHref}
                      download={student.profileImage.name}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">ไฟล์</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    ตรวจสอบไฟล์ที่นักศึกษาอัปโหลดได้จากพื้นที่ผู้ดูแลโดยตรง
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
                      download={file.name}
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
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">ยังไม่มีการอัปโหลดไฟล์</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    นักศึกษาคนนี้ยังไม่ได้อัปโหลดเอกสารประกอบ
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-admin/15 bg-admin/8 p-6 shadow-xl shadow-admin/10 sm:p-7">
            <section className="rounded-[30px] border border-admin/15 bg-admin/8 p-6 shadow-xl shadow-admin/10 sm:p-7">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">บันทึกการตรวจสอบของผู้ดูแล</h2>
            </section>
            </section>
          </div>
        </section>
      </main>

      {confirmStatus && confirmAction && confirmStatusLabel ? (
        <ModalFrame
          title="ยืนยันการเปลี่ยนสถานะ"
          description={`คุณต้องการเปลี่ยนสถานะเป็น ${confirmStatusLabel} ใช่หรือไม่?`}
        >
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="nextStatus" value={confirmStatus} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmStatus(null)}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <StatusSubmitButton label="ยืนยัน" tone="primary" />
            </div>
          </form>
        </ModalFrame>
      ) : null}
    </div>
  );
}