import type { InternshipStatus } from "@prisma/client";

export function formatInternshipStatusLabel(status: InternshipStatus) {
  if (status === "pending") {
    return "รอดำเนินการ";
  }

  if (status === "in_progress") {
    return "กำลังดำเนินการ";
  }

  return "เสร็จสิ้น";
}