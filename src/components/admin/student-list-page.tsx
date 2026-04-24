"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { InternshipStatus } from "@prisma/client";
import {
  initialDeleteStudentActionState,
  initialSaveStudentActionState,
  type StudentListItem,
} from "@/app/intern/admin/students/action-state";
import {
  deleteStudentAction,
  logoutAction,
  saveStudentAction,
} from "@/app/intern/admin/students/actions";
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
  mode: "create" | "edit";
  student: StudentListItem | null;
  onClose: () => void;
  onCreated: (student: StudentListItem) => void;
  onUpdated: (student: StudentListItem) => void;
};

type DeleteDialogProps = {
  student: StudentListItem;
  onClose: () => void;
  onDeleted: (studentId: string) => void;
};

type StudentStatusFilter = "all" | InternshipStatus;

const STATUS_FILTERS: Array<{
  value: StudentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอดำเนินการ" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "completed", label: "เสร็จสิ้น" },
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
      aria-label={`ดู ${email}`}
      title={`ดู ${email}`}
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
  if (status === "pending") {
    return "รอดำเนินการ";
  }

  if (status === "in_progress") {
    return "กำลังดำเนินการ";
  }

  return "เสร็จสิ้น";
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
      {count} {count === 1 ? "นักศึกษา" : "นักศึกษา"}
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
      {pending ? "กำลังสร้าง..." : children}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "กำลังลบ..." : "ลบนักศึกษา"}
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

function StudentDialog({ mode, student, onClose, onCreated, onUpdated }: StudentDialogProps) {
  const [state, formAction] = useActionState(saveStudentAction, {
    ...initialSaveStudentActionState,
    values: {
      name: student?.name ?? "",
      email: student?.email ?? "",
    },
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.status === "updated" && state.student) {
      onUpdated(state.student);
      onClose();
    }
  }, [onClose, onUpdated, state.status, state.student]);

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
        title="สร้างบัญชีนักศึกษาเรียบร้อยแล้ว"
        description="กรุณาเก็บรหัสผ่านที่ระบบสร้างให้อย่างปลอดภัยก่อนปิดหน้าต่างนี้ เนื่องจากจะแสดงเพียงครั้งเดียวในขั้นตอนนี้"
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">รหัสผ่านที่สร้างขึ้น</p>
                <p className="mt-3 font-mono text-lg font-semibold tracking-[0.08em]">
                  {state.generatedPassword}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-100"
                aria-label="คัดลอกรหัสผ่านที่สร้างขึ้น"
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
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </ModalFrame>
    );
  }

  return (
    <ModalFrame
      title={mode === "create" ? "สร้างนักศึกษา" : "แก้ไขนักศึกษา"}
      description={
        mode === "create"
          ? "เพิ่มบัญชีนักศึกษา ระบบจะสร้างรหัสผ่านให้หลังจากบันทึก"
          : "อัปเดตชื่อและอีเมลของบัญชีนักศึกษาที่เลือก"
      }
    >
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="intent" value={mode} />
        <input type="hidden" name="studentId" value={student?.id ?? ""} />
        <div className="space-y-2">
          <label htmlFor="student-name" className="text-sm font-medium text-slate-700">
            ชื่อ
          </label>
          <input
            id="student-name"
            name="name"
            defaultValue={state.values.name}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
            placeholder="กรอกชื่อนักศึกษา"
          />
          {state.fieldErrors.name ? (
            <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="student-email" className="text-sm font-medium text-slate-700">
            อีเมล
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

        {mode === "create" ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            ระบบจะสร้างโปรไฟล์นักศึกษาพร้อมสถานะเริ่มต้นเป็นรอดำเนินการ
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <ActionButton>{mode === "create" ? "สร้างนักศึกษา" : "บันทึกการเปลี่ยนแปลง"}</ActionButton>
        </div>
      </form>
    </ModalFrame>
  );
}

function DeleteStudentDialog({ student, onClose, onDeleted }: DeleteDialogProps) {
  const [state, formAction] = useActionState(
    deleteStudentAction,
    initialDeleteStudentActionState,
  );

  useEffect(() => {
    if (state.status === "deleted" && state.deletedStudentId) {
      onDeleted(state.deletedStudentId);
      onClose();
    }
  }, [onClose, onDeleted, state.deletedStudentId, state.status]);

  return (
    <ModalFrame
      title="ลบนักศึกษา"
      description="การดำเนินการนี้จะลบบัญชีนักศึกษาและข้อมูลฝึกงานที่เกี่ยวข้องออกจากระบบ และไม่สามารถย้อนกลับได้"
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          <p className="font-medium">{student.name}</p>
          <p className="mt-1">{student.email}</p>
        </div>

        {state.status === "error" && state.message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <form action={formAction} className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <input type="hidden" name="studentId" value={student.id} />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <DeleteButton />
        </form>
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
  const [editingStudent, setEditingStudent] = useState<StudentListItem | null>(null);
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

  function handleStudentDeleted(studentId: string) {
    setStudentItems((currentStudents) =>
      currentStudents.filter((currentStudent) => currentStudent.id !== studentId),
    );
  }

  function handleStudentUpdated(student: StudentListItem) {
    setStudentItems((currentStudents) =>
      currentStudents.map((currentStudent) =>
        currentStudent.id === student.id ? student : currentStudent,
      ),
    );
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
                aria-current="page"
              >
                รายชื่อนักศึกษา
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AdminNotificationMenu unreadNotificationCount={unreadNotificationCount} notifications={notifications} />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {currentUser.name ?? "ผู้ดูแล"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ผู้ดูแล</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ออกจากระบบ
              </button>
            </form>
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
                <p className="text-sm font-semibold text-slate-900">{currentUser.name ?? "ผู้ดูแล"}</p>
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
                aria-current="page"
                onClick={() => setMobileMenuOpen(false)}
              >
                รายชื่อนักศึกษา
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
              พื้นที่ผู้ดูแล
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                รายชื่อนักศึกษา
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                ดูข้อมูลนักศึกษา กรองตามสถานะการฝึกงาน และเปิดการจัดการนักศึกษาได้จากที่เดียว
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-lg shadow-admin/25 transition hover:brightness-95"
          >
            สร้างนักศึกษา
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
                  placeholder="ค้นหาจากชื่อ อีเมล หรือสาขา"
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
                ยังไม่มีนักศึกษา
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                ข้อมูลนักศึกษาจะแสดงที่นี่หลังจากผู้ดูแลเพิ่มบัญชีเข้าสู่ระบบแล้ว
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95"
              >
                สร้างนักศึกษา
              </button>
            </div>
          ) : filteredEmptyState ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-100 text-slate-400">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                ไม่พบนักศึกษาที่ตรงกัน
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรองสถานะ
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-admin/7 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-6 py-4">นักศึกษา</th>
                      <th className="px-6 py-4">อีเมล</th>
                      <th className="px-6 py-4">สถานะ</th>
                      <th className="px-6 py-4 text-right">การดำเนินการ</th>
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
                                {student.major ?? "ข้อมูลนักศึกษา"}
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
                              label={`แก้ไข ${student.email}`}
                              onClick={() => setEditingStudent(student)}
                            >
                              <EditIcon />
                            </ActionIconButton>
                            <ActionIconButton
                              label={`ลบ ${student.email}`}
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
                          <p className="mt-1 text-xs text-slate-500">{student.major ?? "ข้อมูลนักศึกษา"}</p>
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
                      <ActionIconButton
                        label={`แก้ไข ${student.email}`}
                        onClick={() => setEditingStudent(student)}
                      >
                        <EditIcon />
                      </ActionIconButton>
                      <ActionIconButton
                        label={`ลบ ${student.email}`}
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
        <StudentDialog
          mode="create"
          student={null}
          onClose={() => setCreateOpen(false)}
          onCreated={handleStudentCreated}
          onUpdated={handleStudentUpdated}
        />
      ) : null}
      {editingStudent ? (
        <StudentDialog
          mode="edit"
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onCreated={handleStudentCreated}
          onUpdated={handleStudentUpdated}
        />
      ) : null}
      {deletingStudent ? (
        <DeleteStudentDialog
          student={deletingStudent}
          onClose={() => setDeletingStudent(null)}
          onDeleted={handleStudentDeleted}
        />
      ) : null}
    </div>
  );
}