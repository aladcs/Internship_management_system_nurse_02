"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteAdminAction,
  logoutAction,
  resetAdminPasswordAction,
  saveAdminAction,
} from "@/app/admins/actions";
import {
  type AdminListItem,
  initialDeleteAdminActionState,
  initialResetAdminPasswordActionState,
  initialSaveAdminActionState,
} from "@/app/admins/action-state";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import { ModalFrame } from "@/components/admin/modal-frame";
import { formatThaiDateTime } from "@/lib/date-format";
import { appShellClass } from "@/lib/page-shell";

type AdminListPageProps = {
  admins: AdminListItem[];
  currentPage: number;
  currentUser: {
    email: string;
    name: string | null;
  };
  hasAnyAdmins: boolean;
  searchQuery: string;
  totalCount: number;
  totalPages: number;
};

type AdminDialogProps = {
  mode: "create" | "edit";
  admin: AdminListItem | null;
  onClose: () => void;
  onCreated: (admin: AdminListItem) => void;
  onUpdated: (admin: AdminListItem) => void;
};

type DeleteDialogProps = {
  admin: AdminListItem;
  onClose: () => void;
  onDeleted: (adminId: string) => void;
};

type ResetPasswordDialogProps = {
  admin: AdminListItem;
  onClose: () => void;
};

const SUPER_ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/admins", label: "รายชื่อผู้ดูแลระบบ" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4.25 4.25" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M10 1.75c2.05 1.54 4.4 2.38 6.75 2.63V9.5c0 4.33-2.64 7.38-6.75 8.75C5.89 16.88 3.25 13.83 3.25 9.5V4.38c2.35-.25 4.7-1.1 6.75-2.63Z" />
    </svg>
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

function EmptyIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-14 w-14">
      <rect x="10" y="14" width="44" height="36" rx="10" className="fill-admin/10 stroke-admin/25" strokeWidth="2" />
      <path d="M20 26h24" className="stroke-admin/45" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 36h14" className="stroke-admin/35" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="41" r="8" className="fill-(--color-admin) text-white" />
      <path d="M46 37.5v7" className="stroke-current" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M42.5 41h7" className="stroke-current" strokeWidth="2.2" strokeLinecap="round" />
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

function buildAdminListHref(params: { page?: number; searchQuery: string }) {
  const searchParams = new URLSearchParams();

  if (params.searchQuery.trim()) {
    searchParams.set("q", params.searchQuery.trim());
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/admins?${queryString}` : "/admins";
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

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
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

function ResultCount({ count }: { count: number }) {
  return (
    <p className="text-sm text-slate-500">
      {count} {count === 1 ? "ผู้ดูแลระบบ" : "ผู้ดูแลระบบ"}
    </p>
  );
}

function ActionButton({
  children,
  pendingLabel = "กำลังบันทึก...",
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
      {pending ? "กำลังลบ..." : "ลบผู้ดูแลระบบ"}
    </button>
  );
}

function AdminDialog({ mode, admin, onClose, onCreated, onUpdated }: AdminDialogProps) {
  const [state, formAction] = useActionState(saveAdminAction, {
    ...initialSaveAdminActionState,
    values: {
      name: admin?.name ?? "",
      email: admin?.email ?? "",
    },
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.status === "created" && state.admin) {
      onCreated(state.admin);
    }
  }, [onCreated, state.admin, state.status]);

  useEffect(() => {
    if (state.status === "updated" && state.admin) {
      onUpdated(state.admin);
      onClose();
    }
  }, [onClose, onUpdated, state.admin, state.status]);

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

  if (state.status === "created" && state.generatedPassword && state.admin) {
    return (
      <ModalFrame
        title="สร้างบัญชีผู้ดูแลระบบแล้ว"
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
            <p className="font-medium text-slate-800">{state.admin.name ?? "ผู้ดูแลระบบที่ยังไม่ระบุชื่อ"}</p>
            <p>{state.admin.email}</p>
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

  const title = mode === "create" ? "สร้างผู้ดูแลระบบ" : "แก้ไขผู้ดูแลระบบ";
  const description =
    mode === "create"
      ? "เพิ่มบัญชีผู้ดูแลระบบใหม่ด้วยอีเมล ระบบจะสร้างรหัสผ่านให้หลังจากบันทึก และผู้ดูแลสามารถตั้งชื่อเองได้ภายหลัง"
      : "อัปเดตข้อมูลบัญชีผู้ดูแลระบบที่เลือก";

  return (
    <ModalFrame title={title} description={description}>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="intent" value={mode} />
        <input type="hidden" name="adminId" value={admin?.id ?? ""} />

        {mode === "edit" ? (
          <div className="space-y-2">
            <label htmlFor="admin-name" className="text-sm font-medium text-slate-700">
              ชื่อ
            </label>
            <input
              id="admin-name"
              name="name"
              defaultValue={state.values.name}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
              placeholder="กรอกชื่อผู้ดูแลระบบ"
            />
            {state.fieldErrors.name ? (
              <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="admin-email" className="text-sm font-medium text-slate-700">
            อีเมล
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            defaultValue={state.values.email}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:ring-4 focus:ring-admin/10"
            placeholder="admin@cmu.ac.th"
          />
          {state.fieldErrors.email ? (
            <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
          ) : null}
          {mode === "create" ? (
            <p className="text-sm leading-6 text-slate-500">
            
            </p>
          ) : null}
        </div>

        {state.status === "error" && state.message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
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
          <ActionButton>{mode === "create" ? "สร้างผู้ดูแลระบบ" : "บันทึกการเปลี่ยนแปลง"}</ActionButton>
        </div>
      </form>
    </ModalFrame>
  );
}

function DeleteAdminDialog({ admin, onClose, onDeleted }: DeleteDialogProps) {
  const [state, formAction] = useActionState(
    deleteAdminAction,
    initialDeleteAdminActionState,
  );

  useEffect(() => {
    if (state.status === "deleted" && state.deletedAdminId) {
      onDeleted(state.deletedAdminId);
      onClose();
    }
  }, [onClose, onDeleted, state.deletedAdminId, state.status]);

  return (
    <ModalFrame
      title="ลบผู้ดูแลระบบ"
      description="การดำเนินการนี้จะลบบัญชีผู้ดูแลระบบออกจากระบบและไม่สามารถย้อนกลับได้"
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          <p className="font-medium">{admin.name ?? "ผู้ดูแลระบบที่ยังไม่ระบุชื่อ"}</p>
          <p className="mt-1">{admin.email}</p>
        </div>

        {state.status === "error" && state.message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <form action={formAction} className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <input type="hidden" name="adminId" value={admin.id} />
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

function ResetAdminPasswordDialog({ admin, onClose }: ResetPasswordDialogProps) {
  const [state, formAction] = useActionState(
    resetAdminPasswordAction,
    initialResetAdminPasswordActionState,
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

  if (state.status === "success" && state.generatedPassword && state.admin) {
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
            <p className="font-medium text-slate-800">{state.admin.name ?? "ผู้ดูแลระบบที่ยังไม่ระบุชื่อ"}</p>
            <p>{state.admin.email}</p>
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
      title="รีเซ็ตรหัสผ่านผู้ดูแลระบบ"
      description="ระบบจะสร้างรหัสผ่านชั่วคราวใหม่ให้บัญชีนี้ทันที และรหัสผ่านเดิมจะใช้งานไม่ได้อีกต่อไป"
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p className="font-medium">{admin.name ?? "ผู้ดูแลระบบที่ยังไม่ระบุชื่อ"}</p>
          <p className="mt-1">{admin.email}</p>
        </div>

        {state.status === "error" && state.message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <form action={formAction} className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <input type="hidden" name="adminId" value={admin.id} />
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

export function AdminListPage({
  admins: initialAdmins,
  currentPage,
  currentUser,
  hasAnyAdmins,
  searchQuery,
  totalCount,
  totalPages,
}: AdminListPageProps) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminListItem | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminListItem | null>(null);
  const [resettingAdmin, setResettingAdmin] = useState<AdminListItem | null>(null);

  const paginationPages = useMemo(
    () => getPaginationPages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  useEffect(() => {
    setAdmins(initialAdmins);
  }, [initialAdmins]);

  useEffect(() => {
    setSearchDraft(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchDraft === searchQuery) {
        return;
      }

      router.replace(
        buildAdminListHref({
          searchQuery: searchDraft,
        }),
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [router, searchDraft, searchQuery]);

  function handleCreatedAdmin(admin: AdminListItem) {
    if (!searchQuery && currentPage === 1) {
      setAdmins((currentAdmins) => {
        if (currentAdmins.some((currentAdmin) => currentAdmin.id === admin.id)) {
          return currentAdmins;
        }

        return [admin, ...currentAdmins].slice(0, 10);
      });
    }

    router.refresh();
  }

  function handleUpdatedAdmin(admin: AdminListItem) {
    setAdmins((currentAdmins) =>
      currentAdmins.map((currentAdmin) =>
        currentAdmin.id === admin.id ? admin : currentAdmin,
      ),
    );

    router.refresh();
  }

  function handleDeletedAdmin(adminId: string) {
    setAdmins((currentAdmins) =>
      currentAdmins.filter((currentAdmin) => currentAdmin.id !== adminId),
    );

    router.refresh();
  }

  const emptyState = !hasAnyAdmins;
  const filteredEmptyState = hasAnyAdmins && totalCount === 0;
  const hasActiveFilters = searchQuery.length > 0;

  return (
    <AdminLayoutShell
      backgroundClassName="bg-[#f7f2f8] text-slate-950"
      currentPath="/admins"
      currentUser={currentUser}
      homeHref="/admins"
      logoutAction={logoutAction}
      navItems={SUPER_ADMIN_NAV_ITEMS}
      roleLabel="ผู้ดูแลระบบสูงสุด"
    >
      <main className={`${appShellClass} py-8 lg:py-10`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
              พื้นที่ผู้ดูแลระบบสูงสุด
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                รายชื่อผู้ดูแลระบบ
              </h1>
              
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-lg shadow-admin/25 transition hover:brightness-95"
          >
            สร้างผู้ดูแลระบบ
          </button>
        </div>

        <section className="mt-8 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-md text-slate-500">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <SearchIcon />
                </span>
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-950 outline-none transition focus:border-(--color-admin) focus:bg-white focus:ring-4 focus:ring-admin/10"
                  placeholder="ค้นหาจากชื่อหรืออีเมล"
                />
              </label>
              <ResultCount count={totalCount} />
            </div>

            {hasActiveFilters ? (
              <Link
                href="/admins"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ล้าง
              </Link>
            ) : null}
          </div>

          {emptyState ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-admin/8 text-(--color-admin)">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                ยังไม่มีผู้ดูแลระบบ
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                สร้างบัญชีผู้ดูแลระบบบัญชีแรกสำหรับระบบฝึกงาน บัญชีใหม่จะถูกสร้างพร้อมบทบาท admin และรหัสผ่านที่ระบบสร้างให้
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-(--color-admin) px-5 text-sm font-semibold text-white shadow-sm shadow-admin/20 transition hover:brightness-95"
              >
                สร้างผู้ดูแลระบบ
              </button>
            </div>
          ) : filteredEmptyState ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-100 text-slate-400">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                ไม่พบผู้ดูแลระบบที่ตรงกัน
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                ปรับคำค้นหาเพื่อดูบัญชีผู้ดูแลระบบที่มีอยู่
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-admin/7 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-6 py-4">ผู้ดูแลระบบ</th>
                      <th className="px-6 py-4">อีเมล</th>
                      <th className="px-6 py-4">วันที่สร้าง</th>
                      <th className="px-6 py-4 text-right">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="transition hover:bg-slate-50/80">
                        <td className="border-t border-slate-100 px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-admin) text-sm font-semibold text-white">
                              {getInitials(admin.name, admin.email)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {admin.name ?? "ผู้ดูแลระบบที่ยังไม่ระบุชื่อ"}
                              </p>
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                                <ShieldIcon />
                                ผู้ดูแลระบบ
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
                          {admin.email}
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
                          {formatThaiDateTime(admin.createdAt)}
                        </td>
                        <td className="border-t border-slate-100 px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setResettingAdmin(admin)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                              aria-label={`รีเซ็ตรหัสผ่าน ${admin.email}`}
                            >
                              <KeyIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAdmin(admin)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              aria-label={`แก้ไข ${admin.email}`}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingAdmin(admin)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-red-500 transition hover:bg-red-50 hover:text-red-600"
                              aria-label={`ลบ ${admin.email}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {admins.map((admin) => (
                  <article key={admin.id} className="space-y-4 px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-admin) text-sm font-semibold text-white">
                          {getInitials(admin.name, admin.email)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {admin.name ?? "ผู้ดูแลระบบที่ยังไม่ระบุชื่อ"}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <ShieldIcon />
                            ผู้ดูแลระบบ
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setResettingAdmin(admin)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
                          aria-label={`รีเซ็ตรหัสผ่าน ${admin.email}`}
                        >
                          <KeyIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAdmin(admin)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500"
                          aria-label={`แก้ไข ${admin.email}`}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAdmin(admin)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500"
                          aria-label={`ลบ ${admin.email}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{admin.email}</p>
                      <p>สร้างเมื่อ {formatThaiDateTime(admin.createdAt)}</p>
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
                    href={buildAdminListHref({
                      page: Math.max(1, currentPage - 1),
                      searchQuery,
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
                          href={buildAdminListHref({
                            page: pageNumber,
                            searchQuery,
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
                    href={buildAdminListHref({
                      page: Math.min(totalPages, currentPage + 1),
                      searchQuery,
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
        <AdminDialog
          mode="create"
          admin={null}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreatedAdmin}
          onUpdated={handleUpdatedAdmin}
        />
      ) : null}

      {editingAdmin ? (
        <AdminDialog
          mode="edit"
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onCreated={handleCreatedAdmin}
          onUpdated={handleUpdatedAdmin}
        />
      ) : null}

      {deletingAdmin ? (
        <DeleteAdminDialog
          admin={deletingAdmin}
          onClose={() => setDeletingAdmin(null)}
          onDeleted={handleDeletedAdmin}
        />
      ) : null}
      {resettingAdmin ? (
        <ResetAdminPasswordDialog
          admin={resettingAdmin}
          onClose={() => setResettingAdmin(null)}
        />
      ) : null}
    </AdminLayoutShell>
  );
}