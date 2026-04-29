"use client";

import Image from "next/image";
import Link from "next/link";
import type { InternshipStatus } from "@prisma/client";
import { type ReactNode, useState } from "react";
import { logoutAction } from "@/app/intern/overview/actions";
import { AccountMenu } from "@/components/auth/account-menu";
import { InternshipStatusStepper } from "@/components/ui/internship-status-stepper";
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

export type StudentOverviewPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  student: {
    firstName: string;
    displayName: string;
    email: string;
    status: InternshipStatus;
    statusLabel: string;
    canEdit: boolean;
    hasStartedForm: boolean;
    completionNote: string | null;
    latestReviewComment: {
      id: string;
      message: string;
      createdAtLabel: string;
      adminLabel: string;
    } | null;
    profileImage: ProfileImageItem | null;
    personal: SummaryItem[];
    internship: SummaryItem[];
    education: SummaryItem[];
    files: FileItem[];
    summary: {
      lastUpdatedLabel: string;
      lastUpdatedByLabel: string | null;
      lastUpdatedByEmail: string | null;
      submittedAtLabel: string;
    };
  };
};

type SummaryCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  items: SummaryItem[];
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

function SummaryCard({
  title,
  description,
  icon,
  items,
}: SummaryCardProps) {
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
  const ctaLabel =
    student.status === "needs_fix"
      ? "แก้ไขและส่งใหม่"
      : student.status === "draft"
        ? student.hasStartedForm
          ? "แก้ไขแบบฟอร์ม"
          : "กรอกแบบฟอร์ม"
        : "แก้ไขแบบฟอร์ม";
  const statusNotice =
    student.status === "needs_fix"
      ? {
          tone: "border-rose-200 bg-rose-50 text-rose-800",
          title: "ผู้ดูแลส่งกลับให้แก้ไข",
          description: student.latestReviewComment
            ? student.latestReviewComment.message
            : "กรุณาตรวจสอบรายละเอียดที่ต้องแก้ไข แล้วกลับไปอัปเดตข้อมูลและส่งใหม่อีกครั้ง",
          meta: student.latestReviewComment
            ? `${student.latestReviewComment.adminLabel} • ${student.latestReviewComment.createdAtLabel}`
            : null,
        }
      : student.status === "pending"
        ? {
            tone: "border-amber-200 bg-amber-50 text-amber-800",
            title: "กำลังรอผู้ดูแลตรวจสอบ",
            description: "แบบฟอร์มของคุณถูกส่งแล้ว และยังอยู่ระหว่างการตรวจสอบจากผู้ดูแลระบบ",
            meta: null,
          }
        : student.status === "in_progress"
          ? {
              tone: "border-sky-200 bg-sky-50 text-sky-800",
              title: "แบบฟอร์มได้รับการอนุมัติแล้ว",
              description: "คุณยังแก้ไขข้อมูลได้ แต่ทุกการเปลี่ยนแปลงและไฟล์ที่อัปเดตจะถูกแจ้งให้ผู้ดูแลทราบ",
              meta: null,
            }
          : student.status === "draft"
            ? {
                tone: "border-slate-200 bg-slate-50 text-slate-700",
                title: "คุณยังไม่ได้ส่งแบบฟอร์ม",
                description: student.hasStartedForm
                  ? "คุณสามารถกลับไปแก้ไขข้อมูลให้ครบถ้วน แล้วส่งแบบฟอร์มเมื่อพร้อม"
                  : "เริ่มกรอกข้อมูลการฝึกงานและส่งแบบฟอร์มเมื่อพร้อมเพื่อให้ผู้ดูแลเริ่มตรวจสอบ",
                meta: null,
              }
            : null;

  return (
    <div className="min-h-screen bg-[#fff7f1] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl">
        <div className={`${appShellClass} flex items-center justify-between gap-4 py-3`}>
          <div className="flex items-center gap-4">
            <Link href="/intern/overview" className="flex items-center gap-3">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-student)">ระบบ</p>
                <p className="text-sm font-medium text-slate-700">จัดการนักศึกษาฝึกงาน</p>
              </div>
            </Link>

            <nav className="hidden md:flex">
              <Link
                href="/intern/overview"
                className="rounded-full bg-student/12 px-4 py-2 text-sm font-semibold text-(--color-student)"
                aria-current="page"
              >
                ภาพรวม
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AccountMenu
              email={student.email}
              logoutAction={logoutAction}
              name={student.displayName}
              roleLabel="นักศึกษา"
              tone="student"
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
                <p className="text-sm font-semibold text-slate-900">{student.displayName}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{student.email}</p>
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
                href="/intern/overview"
                className="block rounded-2xl bg-student/12 px-4 py-3 text-sm font-semibold text-(--color-student)"
                aria-current="page"
                onClick={() => setMobileMenuOpen(false)}
              >
                ภาพรวม
              </Link>
              <Link
                href="/intern/account/name"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentUser.name?.trim() ? "แก้ไขชื่อที่แสดง" : "ตั้งชื่อที่แสดง"}
              </Link>
              <Link
                href="/intern/account/password"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
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

      <main className={`${appShellClass} py-8 lg:py-10`}>
        <section className="overflow-hidden rounded-[36px] border border-orange-100 bg-linear-to-br from-[#fff2e5] via-[#fff9f5] to-[#ffe9db] p-6 shadow-xl shadow-orange-950/8 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-student)">
                  ภาพรวมนักศึกษา
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  ยินดีต้อนรับกลับ, <span className="text-(--color-student)">{student.firstName}</span>
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  ตรวจสอบความคืบหน้าการฝึกงาน ยืนยันข้อมูลที่มีอยู่ในระบบ และดำเนินการกับแบบฟอร์มต่อได้เมื่อยังอนุญาตให้แก้ไข
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

              {statusNotice ? (
                <div className={`rounded-[28px] border px-5 py-4 ${statusNotice.tone}`}>
                  <p className="text-sm font-semibold">{statusNotice.title}</p>
                  <p className="mt-2 text-sm leading-6">{statusNotice.description}</p>
                  {statusNotice.meta ? <p className="mt-2 text-xs font-medium">{statusNotice.meta}</p> : null}
                </div>
              ) : null}

            </div>

            <div className="w-full max-w-sm shrink-0 rounded-[28px] border border-white/70 bg-white/75 p-4 shadow-lg shadow-orange-950/8 backdrop-blur sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">การดำเนินการหลัก</p>
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
                    <span>แบบฟอร์มถูกล็อกเพราะสถานะการฝึกงานของคุณเป็นเสร็จสิ้นแล้ว</span>
                  </div>
                )}
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

          <InternshipStatusStepper currentStatus={student.status} tone="student" className="mt-8" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <SummaryCard
              title="ข้อมูลส่วนตัว"
              description="รายละเอียดโปรไฟล์หลักของคุณตามที่ปรากฏอยู่ในระบบฝึกงาน"
              icon={<SummaryIcon />}
              items={student.personal}
            />

            <SummaryCard
              title="สรุปการฝึกงาน"
              description="สรุปข้อมูลสถานที่ฝึกงานและสถานะการตรวจสอบปัจจุบันของคุณ"
              icon={<CalendarIcon />}
              items={student.internship}
            />

            <SummaryCard
              title="สรุปข้อมูลการศึกษา"
              description="ข้อมูลการศึกษาที่ใช้ประกอบบันทึกการฝึกงานของคุณ"
              icon={<AcademicIcon />}
              items={student.education}
            />
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">รูปโปรไฟล์</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    ดาวน์โหลดรูปโปรไฟล์ล่าสุดของคุณหรือกลับไปแก้ไขได้จากหน้าฟอร์ม
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
                  <CameraIcon />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-orange-100 bg-student/10 text-(--color-student)">
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
                      {student.profileImage ? "ใช้รูปนี้สำหรับโปรไฟล์นักศึกษาในระบบ" : "เพิ่มรูปโปรไฟล์ได้จากหน้าแบบฟอร์ม"}
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
                  {student.canEdit ? (
                    <Link
                      href="/intern/form"
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-student) px-4 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-95"
                    >
                      จัดการรูปโปรไฟล์
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">ไฟล์ของฉัน</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    ไฟล์ที่อัปโหลดสำหรับข้อมูลการฝึกงานของคุณเท่านั้น
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
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
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/10 text-(--color-student)">
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
                <div className="mt-6 rounded-[28px] border border-dashed border-orange-200 bg-[#fff8f2] px-5 py-8 text-center">
                  <div className="mx-auto flex justify-center text-(--color-student)">
                    <EmptyFilesIcon />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">ยังไม่มีไฟล์ที่อัปโหลด</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    เพิ่มเอกสารประกอบจากแบบฟอร์มได้เมื่อข้อมูลการฝึกงานยังสามารถแก้ไขได้
                  </p>
                  {student.canEdit ? (
                    <Link
                      href="/intern/form"
                      className="mt-4 inline-flex text-sm font-semibold text-(--color-student) underline decoration-orange-200 underline-offset-4 transition hover:decoration-orange-500"
                    >
                      อัปโหลดตอนนี้
                    </Link>
                  ) : null}
                </div>
              )}
            </section>

            {/* <section className="rounded-[30px] border border-orange-200 bg-[#fff1e7] p-6 shadow-xl shadow-orange-950/6 sm:p-7">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">บัญชีที่ใช้งานอยู่</h2>
              <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-700 ring-1 ring-orange-100">
                เข้าสู่ระบบด้วยบัญชี {currentUser.email}
              </div>
            </section> */}
          </div>
        </section>
      </main>
    </div>
  );
}