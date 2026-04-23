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
    name?: string;
    email?: string;
  };
  values: {
    name: string;
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
    name: "",
    email: "",
  },
  student: null,
  generatedPassword: null,
};