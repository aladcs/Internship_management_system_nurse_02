import type { UserRole } from "@prisma/client";

export type AdminActivityCategory = "submission" | "edit" | "file" | "status" | "other";
export type ActivityRoleFilter = "all" | "admin" | "student";
export type ActivityCategoryFilter = "all" | AdminActivityCategory;

export type AdminActivityLogItem = {
  id: string;
  action: string;
  actionLabel: string;
  actionCategory: AdminActivityCategory;
  actionCategoryLabel: string;
  message: string;
  createdAtLabel: string;
  relativeTimeLabel: string;
  actorLabel: string;
  actorEmail: string | null;
  actorRole: UserRole | null;
  studentId: string;
  studentLabel: string;
  studentEmail: string;
  targetPath: string;
};

export type AdminActivityLogFilter = {
  query?: string | null;
  role?: ActivityRoleFilter | null;
  category?: ActivityCategoryFilter | null;
};

export function getActorRoleLabel(role: UserRole | null) {
  if (role === "admin") {
    return "ผู้ดูแลระบบ";
  }

  if (role === "student") {
    return "นักศึกษา";
  }

  if (role === "super_admin") {
    return "ผู้ดูแลสูงสุด";
  }

  return "ระบบ";
}

export function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    student_submitted_form: "ส่งแบบฟอร์ม",
    student_resubmitted_form: "ส่งแบบฟอร์มอีกครั้ง",
    student_edited_form: "แก้ไขข้อมูล",
    student_uploaded_files: "อัปโหลดไฟล์",
    student_removed_files: "ลบหรือแทนที่ไฟล์",
    admin_edited_student_data: "ผู้ดูแลแก้ไขข้อมูลนักศึกษา",
    admin_approved_form: "อนุมัติแบบฟอร์ม",
    admin_sent_back_form: "ส่งกลับให้แก้ไข",
    admin_marked_completed: "ทำเครื่องหมายเสร็จสิ้น",
  };

  return labels[action] ?? action;
}

export function getActionCategory(action: string): AdminActivityCategory {
  if (["student_submitted_form", "student_resubmitted_form"].includes(action)) {
    return "submission";
  }

  if (["student_edited_form", "admin_edited_student_data"].includes(action)) {
    return "edit";
  }

  if (["student_uploaded_files", "student_removed_files"].includes(action)) {
    return "file";
  }

  if (["admin_approved_form", "admin_sent_back_form", "admin_marked_completed"].includes(action)) {
    return "status";
  }

  return "other";
}

export function getActionCategoryLabel(category: AdminActivityCategory) {
  const labels: Record<AdminActivityCategory, string> = {
    submission: "การส่งฟอร์ม",
    edit: "การแก้ไขข้อมูล",
    file: "การจัดการไฟล์",
    status: "การเปลี่ยนสถานะ",
    other: "กิจกรรมอื่น ๆ",
  };

  return labels[category];
}

export function filterAdminActivityLogs(
  activityLogs: AdminActivityLogItem[],
  filters: AdminActivityLogFilter,
) {
  const normalizedQuery = filters.query?.trim().toLowerCase() ?? "";
  const roleFilter = filters.role ?? "all";
  const categoryFilter = filters.category ?? "all";

  return activityLogs.filter((entry) => {
    const matchesRole =
      roleFilter === "all"
        ? true
        : roleFilter === "admin"
          ? entry.actorRole === "admin" || entry.actorRole === "super_admin"
          : entry.actorRole === "student";

    if (!matchesRole) {
      return false;
    }

    if (categoryFilter !== "all" && entry.actionCategory !== categoryFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      entry.actorLabel,
      entry.actorEmail,
      entry.message,
      entry.studentLabel,
      entry.studentEmail,
      entry.actionLabel,
      entry.actionCategoryLabel,
      getActorRoleLabel(entry.actorRole),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}