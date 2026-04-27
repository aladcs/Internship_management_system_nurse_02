import type { InternshipStatus } from "@prisma/client";

export type StudentListItem = {
  id: string;
  name: string;
  email: string;
  status: InternshipStatus;
  major: string | null;
};

export type SaveStudentActionState = {
  status: "idle" | "validation-error" | "created" | "error";
  message: string | null;
  fieldErrors: {
    email?: string;
  };
  values: {
    email: string;
  };
  student: StudentListItem | null;
  generatedPassword: string | null;
};

export const initialSaveStudentActionState: SaveStudentActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {
    email: "",
  },
  student: null,
  generatedPassword: null,
};

export type DeleteStudentActionState = {
  status: "idle" | "error" | "deleted";
  message: string | null;
  deletedStudentId: string | null;
};

export const initialDeleteStudentActionState: DeleteStudentActionState = {
  status: "idle",
  message: null,
  deletedStudentId: null,
};

export type ResetStudentPasswordActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  student: StudentListItem | null;
  generatedPassword: string | null;
};

export const initialResetStudentPasswordActionState: ResetStudentPasswordActionState = {
  status: "idle",
  message: null,
  student: null,
  generatedPassword: null,
};