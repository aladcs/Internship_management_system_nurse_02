import type { InternshipStatus } from "@prisma/client";

const NEXT_STATUS_BY_CURRENT: Partial<Record<InternshipStatus, InternshipStatus>> = {
  pending: "in_progress",
  in_progress: "completed",
};

export function formatInternshipStatusLabel(status: InternshipStatus) {
  if (status === "pending") {
    return "รอดำเนินการ";
  }

  if (status === "in_progress") {
    return "กำลังดำเนินการ";
  }

  return "เสร็จสิ้น";
}

export function getNextInternshipStatus(status: InternshipStatus) {
  return NEXT_STATUS_BY_CURRENT[status] ?? null;
}

export function getAdminStatusTransitionBlockReason(input: {
  status: InternshipStatus;
  submittedAt: Date | null;
}) {
  if (!input.submittedAt) {
    return "นักศึกษายังไม่ได้ส่งแบบฟอร์มครั้งแรก จึงยังไม่สามารถเปลี่ยนสถานะได้";
  }

  if (!getNextInternshipStatus(input.status)) {
    return "ข้อมูลฝึกงานนี้เสร็จสมบูรณ์แล้ว";
  }

  return null;
}