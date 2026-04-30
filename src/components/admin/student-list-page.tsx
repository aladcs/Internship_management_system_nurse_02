"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ModalFrame } from "@/components/admin/modal-frame";
import type { InternshipStatus } from "@prisma/client";
import {
  initialDeleteStudentActionState,
  initialResetStudentPasswordActionState,
  initialSaveStudentActionState,
  type StudentListItem,
} from "@/app/intern/admin/students/action-state";
import {
  deleteStudentAction,
  logoutAction,
  resetStudentPasswordAction,
  saveStudentAction,
} from "@/app/intern/admin/students/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { AppSelect } from "@/components/ui/app-select";
import { formatInternshipStatusLabel } from "@/lib/internship-status";
import { appShellClass } from "@/lib/page-shell";

const CURRENT_YEAR = new Date().getUTCFullYear();

type StudentListPageProps = {
  students: StudentListItem[];
  statusCounts: Record<StudentStatusFilter, number>;
  statusFilter: StudentStatusFilter;
  searchQuery: string;
  endDateFilter: string;
  facultyFilter: string;
  facultyOptions: string[];
  startDateFilter: string;
  totalCount: number;
  hasAnyStudents: boolean;
  currentPage: number;
  totalPages: number;
  currentUser: {
    email: string;
    name: string | null;
  };
};

const ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/intern/dashboard", label: "แดชบอร์ด" },
  { href: "/intern/admin/students", label: "รายชื่อนักศึกษา", match: "prefix" },
  { href: "/intern/notifications", label: "การแจ้งเตือน" },
  { href: "/intern/activity-logs", label: "บันทึกกิจกรรม" },
];

type StudentDialogProps = {
  onClose: () => void;
  onCreated: (student: StudentListItem) => void;
};

type DeleteDialogProps = {
  student: StudentListItem;
  onClose: () => void;
  onDeleted: (studentId: string) => void;
};

type ResetPasswordDialogProps = {
  student: StudentListItem;
  onClose: () => void;
};

type StudentStatusFilter = "all" | Exclude<InternshipStatus, "draft">;

const STATUS_FILTERS: Array<{
  value: StudentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: formatInternshipStatusLabel("pending") },
  { value: "needs_fix", label: formatInternshipStatusLabel("needs_fix") },
  { value: "in_progress", label: formatInternshipStatusLabel("in_progress") },
  { value: "completed", label: formatInternshipStatusLabel("completed") },
];

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

function DisabledViewStudentButton({ email }: { email: string }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"
      aria-label={`ดู ${email}`}
      title="นักศึกษายังไม่เคยส่งฟอร์ม"
    >
      <EyeIcon />
    </button>
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

function KeyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <circle cx="6.5" cy="10" r="3.25" />
      <path d="M9.75 10h5.5" />
      <path d="M13.5 10v2.25" />
      <path d="M16 10v1.5" />
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

function ResultCount({ count }: { count: number }) {
  return (
    <p className="text-sm text-slate-500">
      {count} {count === 1 ? "นักศึกษา" : "นักศึกษา"}
    </p>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4">
      <path d="M3.5 5h13" />
      <path d="M6.5 10h7" />
      <path d="M8.75 15h2.5" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m11.75 4.5-5.5 5.5 5.5 5.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m8.25 4.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}

function buildStudentListHref(
  params: {
    endDateFilter: string;
    facultyFilter: string;
    page?: number;
    searchQuery: string;
    startDateFilter: string;
    statusFilter: StudentStatusFilter;
  },
) {
  const searchParams = new URLSearchParams();

  if (params.searchQuery.trim()) {
    searchParams.set("q", params.searchQuery.trim());
  }

  if (params.statusFilter !== "all") {
    searchParams.set("status", params.statusFilter);
  }

  if (params.facultyFilter.trim()) {
    searchParams.set("faculty", params.facultyFilter.trim());
  }

  if (params.startDateFilter.trim()) {
    searchParams.set("startDate", params.startDateFilter.trim());
  }

  if (params.endDateFilter.trim()) {
    searchParams.set("endDate", params.endDateFilter.trim());
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/intern/admin/students?${queryString}` : "/intern/admin/students";
}

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

function ActionButton({
  children,
  pendingLabel = "กำลังสร้าง...",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : children}
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

function StudentDialog({ onClose, onCreated }: StudentDialogProps) {
  const [state, formAction] = useActionState(saveStudentAction, {
    ...initialSaveStudentActionState,
    values: {
      email: "",
    },
  });
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
        title="สร้างบัญชีนักศึกษาเรียบร้อยแล้ว"
        description="เก็บรหัสผ่านนี้ไว้ก่อนปิดหน้าต่าง เนื่องจากจะแสดงเพียงครั้งเดียว"
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
      title="สร้างนักศึกษา"
      description="เพิ่มบัญชีนักศึกษา ระบบจะสร้างรหัสผ่านให้หลังจากบันทึก"
      maxWidth="2xl"
    >
      <form action={formAction} className="space-y-5">
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

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          ระบบจะสร้างบัญชีนักศึกษาให้ก่อน และข้อมูลจะเริ่มแสดงในหน้ารายชื่อนักศึกษาเมื่อมีการส่งแบบฟอร์มครั้งแรก
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <ActionButton>สร้างนักศึกษา</ActionButton>
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

function ResetStudentPasswordDialog({ student, onClose }: ResetPasswordDialogProps) {
  const [state, formAction] = useActionState(
    resetStudentPasswordAction,
    initialResetStudentPasswordActionState,
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

  if (state.status === "success" && state.generatedPassword && state.student) {
    return (
      <ModalFrame
        title="รีเซ็ตรหัสผ่านแล้ว"
        description="กรุณาเก็บรหัสผ่านชั่วคราวนี้อย่างปลอดภัยก่อนปิดหน้าต่าง ระบบจะแสดงเพียงครั้งเดียวหลังรีเซ็ต"
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">รหัสผ่านชั่วคราวใหม่</p>
                <p className="mt-3 font-mono text-lg font-semibold tracking-[0.08em]">
                  {state.generatedPassword}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-100"
                aria-label="คัดลอกรหัสผ่านชั่วคราวใหม่"
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
              onClick={onClose}
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
      title="รีเซ็ตรหัสผ่านนักศึกษา"
      description="ระบบจะสร้างรหัสผ่านชั่วคราวใหม่ให้บัญชีนี้ทันที และรหัสผ่านเดิมจะใช้งานไม่ได้อีกต่อไป"
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
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
          <ActionButton pendingLabel="กำลังรีเซ็ต...">รีเซ็ตรหัสผ่าน</ActionButton>
        </form>
      </div>
    </ModalFrame>
  );
}

export function StudentListPage({
  currentPage,
  students,
  endDateFilter,
  facultyFilter,
  facultyOptions,
  hasAnyStudents,
  currentUser,
  searchQuery,
  startDateFilter,
  statusCounts,
  statusFilter,
  totalCount,
  totalPages,
}: StudentListPageProps) {
  const router = useRouter();
  const [studentItems, setStudentItems] = useState(students);
  const [endDateDraft, setEndDateDraft] = useState(endDateFilter);
  const [facultyDraft, setFacultyDraft] = useState(facultyFilter);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [startDateDraft, setStartDateDraft] = useState(startDateFilter);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentListItem | null>(null);
  const [resettingStudent, setResettingStudent] = useState<StudentListItem | null>(null);

  const emptyState = !hasAnyStudents;
  const filteredEmptyState = hasAnyStudents && totalCount === 0;
  const hasActiveFilters =
    searchQuery.length > 0 ||
    statusFilter !== "all" ||
    facultyFilter.length > 0 ||
    startDateFilter.length > 0 ||
    endDateFilter.length > 0;
  const paginationPages = useMemo(
    () => getPaginationPages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  function applyFilters(nextValues?: {
    endDateFilter?: string;
    facultyFilter?: string;
    searchQuery?: string;
    startDateFilter?: string;
  }) {
    const href = buildStudentListHref({
      endDateFilter: nextValues?.endDateFilter ?? endDateDraft,
      facultyFilter: nextValues?.facultyFilter ?? facultyDraft,
      searchQuery: nextValues?.searchQuery ?? searchDraft,
      startDateFilter: nextValues?.startDateFilter ?? startDateDraft,
      statusFilter,
    });

    router.replace(href);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchDraft === searchQuery) {
        return;
      }

      applyFilters({ searchQuery: searchDraft });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [applyFilters, searchDraft, searchQuery]);

  function handleStudentCreated(student: StudentListItem) {
    if (student.status === "draft") {
      return;
    }

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

  return (
    <AdminLayoutShell
      currentPath="/intern/admin/students"
      currentUser={currentUser}
      homeHref="/intern/dashboard"
      logoutAction={logoutAction}
      navItems={ADMIN_NAV_ITEMS}
      roleLabel="ผู้ดูแลระบบ"
    >
      <main className={`${appShellClass} py-8 lg:py-10`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
              พื้นที่ผู้ดูแลระบบ
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                รายชื่อนักศึกษา
              </h1>
              
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
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative block w-full max-w-md text-slate-500">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <SearchIcon />
                  </span>
                  <input
                    name="q"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:bg-white focus:ring-4 focus:ring-admin/10"
                    placeholder="ค้นหาจากชื่อ อีเมล หรือสาขา"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <AppSelect
                    name="faculty"
                    value={facultyDraft}
                    onChange={(event) => {
                      const nextFacultyFilter = event.target.value;

                      setFacultyDraft(nextFacultyFilter);
                      applyFilters({ facultyFilter: nextFacultyFilter });
                    }}
                    options={[
                      { value: "", label: "ทุกคณะ" },
                      ...facultyOptions.map((facultyOption) => ({
                        value: facultyOption,
                        label: facultyOption,
                      })),
                    ]}
                    tone="admin"
                    size="lg"
                    surface="muted"
                    wrapperClassName="min-w-40"
                    className="font-medium"
                  />

                  <AppDatePicker
                    name="startDate"
                    value={startDateDraft}
                    onChange={(nextStartDateFilter) => {
                      setStartDateDraft(nextStartDateFilter);
                      applyFilters({ startDateFilter: nextStartDateFilter });
                    }}
                    placeholder="ัวันเริ่มต้นฝึกงาน"
                    tone="admin"
                    size="md"
                    startYear={CURRENT_YEAR - 3}
                    endYear={CURRENT_YEAR + 1}
                    wrapperClassName="min-w-48"
                  />

                  <AppDatePicker
                    name="endDate"
                    value={endDateDraft}
                    onChange={(nextEndDateFilter) => {
                      setEndDateDraft(nextEndDateFilter);
                      applyFilters({ endDateFilter: nextEndDateFilter });
                    }}
                    placeholder="วันสิ้นสุดฝึกงาน"
                    tone="admin"
                    size="md"
                    startYear={CURRENT_YEAR - 3}
                    endYear={CURRENT_YEAR + 1}
                    wrapperClassName="min-w-48"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 self-end xl:self-auto">
              </div>
            </div>

            {hasActiveFilters ? (
              <div className="mt-3">
                <Link
                  href="/intern/admin/students"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  ล้าง
                </Link>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;

                return (
                  <Link
                    key={filter.value}
                    href={buildStudentListHref({
                      endDateFilter,
                      facultyFilter,
                      searchQuery,
                      startDateFilter,
                      statusFilter: filter.value,
                    })}
                    className={isActive
                      ? "inline-flex items-center gap-2 rounded-full bg-(--color-admin) px-4 py-2 text-sm font-semibold text-white"
                      : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    }
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{filter.label}</span>
                    <span className={isActive ? "text-white/80" : "text-slate-400"}>
                      {statusCounts[filter.value]}
                    </span>
                  </Link>
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
                รายชื่อนักศึกษาจะเริ่มแสดงที่นี่หลังจากนักศึกษาส่งแบบฟอร์มครั้งแรกแล้ว
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
                    {studentItems.map((student) => (
                      <tr key={student.id} className="transition hover:bg-slate-50/80">
                        <td className="border-t border-slate-100 px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-student) text-sm font-semibold text-white">
                              {getInitials(student.hasDisplayName ? student.name : "", student.email)}
                            </div>
                            <div>
                              <p className={student.hasDisplayName ? "font-medium text-slate-900" : "font-medium text-slate-400"}>
                                {student.name}
                              </p>
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
                            {formatInternshipStatusLabel(student.status)}
                          </span>
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {!student.hasSubmittedForm ? <DisabledViewStudentButton email={student.email} /> : null}
                            {student.hasSubmittedForm ? (
                              <ViewStudentLink
                                email={student.email}
                                href={`/intern/admin/students/${student.id}`}
                              />
                            ) : null}
                            <ActionIconButton
                              label={`รีเซ็ตรหัสผ่าน ${student.email}`}
                              onClick={() => setResettingStudent(student)}
                            >
                              <KeyIcon />
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
                {studentItems.map((student) => (
                  <article key={student.id} className="space-y-4 px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-student) text-sm font-semibold text-white">
                          {getInitials(student.hasDisplayName ? student.name : "", student.email)}
                        </div>
                        <div>
                          <p className={student.hasDisplayName ? "font-medium text-slate-900" : "font-medium text-slate-400"}>
                            {student.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{student.major ?? "ข้อมูลนักศึกษา"}</p>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(student.status)}`}>
                        {formatInternshipStatusLabel(student.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{student.email}</p>
                    </div>
                    <div className="flex gap-2">
                      {!student.hasSubmittedForm ? <DisabledViewStudentButton email={student.email} /> : null}
                      {student.hasSubmittedForm ? (
                        <ViewStudentLink
                          email={student.email}
                          href={`/intern/admin/students/${student.id}`}
                        />
                      ) : null}
                      <ActionIconButton
                        label={`รีเซ็ตรหัสผ่าน ${student.email}`}
                        onClick={() => setResettingStudent(student)}
                      >
                        <KeyIcon />
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

              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-slate-500">
                  หน้า {currentPage} จาก {totalPages}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={buildStudentListHref({
                      endDateFilter,
                      facultyFilter,
                      page: Math.max(1, currentPage - 1),
                      searchQuery,
                      startDateFilter,
                      statusFilter,
                    })}
                    aria-disabled={currentPage === 1}
                    className={`inline-flex h-10 items-center justify-center gap-1 rounded-2xl border px-3 text-sm font-medium transition ${currentPage === 1 ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                  >
                    <ChevronLeftIcon />
                    ก่อนหน้า
                  </Link>

                  {paginationPages.map((pageNumber, index) => {
                    const previousPage = paginationPages[index - 1];
                    const showGap = previousPage && pageNumber - previousPage > 1;

                    return (
                      <div key={pageNumber} className="flex items-center gap-2">
                        {showGap ? <span className="px-1 text-sm text-slate-400">...</span> : null}
                        <Link
                          href={buildStudentListHref({
                            endDateFilter,
                            facultyFilter,
                            page: pageNumber,
                            searchQuery,
                            startDateFilter,
                            statusFilter,
                          })}
                          aria-current={pageNumber === currentPage ? "page" : undefined}
                          className={pageNumber === currentPage
                            ? "inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-(--color-admin) px-3 text-sm font-semibold text-white"
                            : "inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          }
                        >
                          {pageNumber}
                        </Link>
                      </div>
                    );
                  })}

                  <Link
                    href={buildStudentListHref({
                      endDateFilter,
                      facultyFilter,
                      page: Math.min(totalPages, currentPage + 1),
                      searchQuery,
                      startDateFilter,
                      statusFilter,
                    })}
                    aria-disabled={currentPage === totalPages}
                    className={`inline-flex h-10 items-center justify-center gap-1 rounded-2xl border px-3 text-sm font-medium transition ${currentPage === totalPages ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                  >
                    ถัดไป
                    <ChevronRightIcon />
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {createOpen ? (
        <StudentDialog
          onClose={() => setCreateOpen(false)}
          onCreated={handleStudentCreated}
        />
      ) : null}
      {deletingStudent ? (
        <DeleteStudentDialog
          student={deletingStudent}
          onClose={() => setDeletingStudent(null)}
          onDeleted={handleStudentDeleted}
        />
      ) : null}
      {resettingStudent ? (
        <ResetStudentPasswordDialog
          student={resettingStudent}
          onClose={() => setResettingStudent(null)}
        />
      ) : null}
    </AdminLayoutShell>
  );
}