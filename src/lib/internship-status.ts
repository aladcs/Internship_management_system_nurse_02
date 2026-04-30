import type { InternshipStatus } from "@prisma/client";

const NEXT_STATUS_BY_CURRENT: Partial<Record<InternshipStatus, InternshipStatus>> = {
  draft: "pending",
  pending: "in_progress",
  needs_fix: "in_progress",
  in_progress: "completed",
};

const ALLOWED_ADMIN_STATUS_TRANSITIONS: Record<InternshipStatus, InternshipStatus[]> = {
  draft: [],
  pending: ["needs_fix", "in_progress"],
  needs_fix: ["needs_fix", "in_progress"],
  in_progress: ["needs_fix", "completed"],
  completed: [],
};

const STUDENT_EDITABLE_STATUSES: InternshipStatus[] = ["draft", "pending", "needs_fix", "in_progress"];

export function formatInternshipStatusLabel(status: InternshipStatus) {
  if (status === "draft") {
    return "ยังไม่ได้ส่งแบบฟอร์ม";
  }

  if (status === "pending") {
    return "รอตรวจสอบ";
  }

  if (status === "needs_fix") {
    return "ต้องแก้ไข";
  }

  if (status === "in_progress") {
    return "อนุมัติแล้ว / กำลังฝึกงาน";
  }

  return "เสร็จสิ้น";
}

export function getNextInternshipStatus(status: InternshipStatus) {
  return NEXT_STATUS_BY_CURRENT[status] ?? null;
}

export function getAllowedAdminStatusTransitions(status: InternshipStatus) {
  return ALLOWED_ADMIN_STATUS_TRANSITIONS[status];
}

export function isStudentEditableStatus(status: InternshipStatus) {
  return STUDENT_EDITABLE_STATUSES.includes(status);
}

export function isAllowedAdminStatusTransition(currentStatus: InternshipStatus, nextStatus: InternshipStatus) {
  return getAllowedAdminStatusTransitions(currentStatus).includes(nextStatus);
}

export function getAdminStatusTransitionBlockReason(input: {
  status: InternshipStatus;
  submittedAt: Date | null;
}) {
  if (!input.submittedAt) {
    return "นักศึกษายังไม่ได้ส่งแบบฟอร์มครั้งแรก จึงยังไม่สามารถเปลี่ยนสถานะการฝึกงานได้";
  }

  if (input.status === "draft") {
    return "นักศึกษายังไม่ได้ส่งแบบฟอร์มครั้งแรก จึงยังไม่สามารถตรวจแบบฟอร์มได้";
  }

  if (getAllowedAdminStatusTransitions(input.status).length === 0) {
    return "ข้อมูลฝึกงานนี้เสร็จสมบูรณ์แล้ว";
  }

  return null;
}

export function getAdminStatusTransitionError(input: {
  currentStatus: InternshipStatus;
  nextStatus: InternshipStatus;
  submittedAt: Date | null;
}) {
  if (!input.submittedAt) {
    return "นักศึกษายังไม่ได้ส่งแบบฟอร์มครั้งแรก จึงยังไม่สามารถเปลี่ยนสถานะการฝึกงานได้";
  }

  if (input.currentStatus === "draft") {
    return "นักศึกษายังไม่ได้ส่งแบบฟอร์มครั้งแรก จึงยังไม่สามารถตรวจแบบฟอร์มได้";
  }

  if (input.currentStatus === "completed") {
    return "ข้อมูลฝึกงานนี้เสร็จสมบูรณ์แล้ว";
  }

  if (!isAllowedAdminStatusTransition(input.currentStatus, input.nextStatus)) {
    return "ไม่สามารถเปลี่ยนสถานะข้ามขั้นตอนได้";
  }

  return null;
}