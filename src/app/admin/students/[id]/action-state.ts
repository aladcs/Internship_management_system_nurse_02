import type { InternshipStatus } from "@prisma/client";

export type UpdateStudentStatusActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  updatedStatus: InternshipStatus | null;
};

export const initialUpdateStudentStatusActionState: UpdateStudentStatusActionState = {
  status: "idle",
  message: null,
  updatedStatus: null,
};